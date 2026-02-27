# +-------------------------------------------------------------+
#
#           Use Bedrock Guardrails for your LLM calls
#
# +-------------------------------------------------------------+
#  Thank you users! We ❤️ you! - Krrish & Ishaan

import asyncio
import copy
import os
import sys
from datetime import datetime

sys.path.insert(
    0, os.path.abspath("../..")
)  # Adds the parent directory to the system path
import json
import sys
from typing import (
    TYPE_CHECKING,
    Any,
    AsyncGenerator,
    List,
    Literal,
    NamedTuple,
    Optional,
    Tuple,
    Union,
    cast,
)

import httpx
from fastapi import HTTPException

import litellm
from litellm._logging import verbose_proxy_logger
from litellm.caching import DualCache
from litellm.exceptions import GuardrailInterventionNormalStringError
from litellm.integrations.custom_guardrail import CustomGuardrail
from litellm.llms.bedrock.base_aws_llm import BaseAWSLLM
from litellm.llms.custom_httpx.http_handler import (
    get_async_httpx_client,
    httpxSpecialProvider,
)
from litellm.proxy._types import UserAPIKeyAuth
from litellm.secret_managers.main import get_secret_str
from litellm.types.guardrails import GuardrailEventHooks
from litellm.types.llms.openai import AllMessageValues, ChatCompletionUserMessage
from litellm.types.proxy.guardrails.guardrail_hooks.bedrock_guardrails import (
    BedrockContentItem,
    BedrockGuardrailAssessment,
    BedrockGuardrailOutput,
    BedrockGuardrailResponse,
    BedrockRequest,
    BedrockTextContent,
)
from litellm.types.utils import GenericGuardrailAPIInputs

if TYPE_CHECKING:
    from litellm.litellm_core_utils.litellm_logging import Logging as LiteLLMLoggingObj

from litellm.types.utils import (
    CallTypes,
    CallTypesLiteral,
    Choices,
    GuardrailStatus,
    Message,
    ModelResponse,
    ModelResponseStream,
    StreamingChoices,
    TextChoices,
)

GUARDRAIL_NAME = "bedrock"
_CHUNK_COUNT_WARNING_THRESHOLD = 4


class GuardrailMessageFilterResult(NamedTuple):
    payload_messages: Optional[List[AllMessageValues]]
    original_messages: Optional[List[AllMessageValues]]
    target_indices: Optional[List[int]]


def _redact_pii_matches(response_json: dict) -> dict:
    try:
        # Create a deep copy to avoid modifying the original response
        redacted_response = copy.deepcopy(response_json)

        # Get assessments from the response
        assessments = redacted_response.get("assessments", [])
        if not assessments:
            return redacted_response

        for assessment in assessments:
            # Redact PII entities in sensitive information policy
            sensitive_info_policy = assessment.get("sensitiveInformationPolicy")
            if sensitive_info_policy:
                pii_entities = sensitive_info_policy.get("piiEntities", [])
                for pii_entity in pii_entities:
                    if "match" in pii_entity:
                        pii_entity["match"] = "[REDACTED]"

                # Redact regex matches
                regexes = sensitive_info_policy.get("regexes", [])
                for regex_match in regexes:
                    if "match" in regex_match:
                        regex_match["match"] = "[REDACTED]"

            # Redact custom word matches in word policy
            word_policy = assessment.get("wordPolicy")
            if word_policy:
                custom_words = word_policy.get("customWords", [])
                for custom_word in custom_words:
                    if "match" in custom_word:
                        custom_word["match"] = "[REDACTED]"

                managed_words = word_policy.get("managedWordLists", [])
                for managed_word in managed_words:
                    if "match" in managed_word:
                        managed_word["match"] = "[REDACTED]"

        return redacted_response
    except Exception as e:
        # We do not want to fail in any case so this is just a warning
        verbose_proxy_logger.warning("Guardrail log redaction failed: %s", str(e))
        return response_json


class BedrockGuardrail(CustomGuardrail, BaseAWSLLM):
    def __init__(
        self,
        guardrailIdentifier: Optional[str] = None,
        guardrailVersion: Optional[str] = None,
        disable_exception_on_block: Optional[bool] = False,
        on_flagged: Optional[str] = "block",
        on_input_too_long: str = "fail_closed",
        bedrock_guardrail_max_chunk_size: int = 25000,
        guardrail_max_chunk_concurrency: int = 10,
        **kwargs,
    ):
        self.async_handler = get_async_httpx_client(
            llm_provider=httpxSpecialProvider.GuardrailCallback
        )
        self.guardrailIdentifier = guardrailIdentifier
        self.guardrailVersion = guardrailVersion
        self.guardrail_provider = "bedrock"
        self.experimental_use_latest_role_message_only = bool(
            kwargs.get("experimental_use_latest_role_message_only")
        )

        # store kwargs as optional_params
        self.optional_params = kwargs

        self.disable_exception_on_block: bool = disable_exception_on_block or False
        """
        If True, will not raise an exception when the guardrail is blocked.
        """

        self.on_flagged: str = on_flagged or "block"
        """
        Action to take when content is flagged: "block" or "monitor".
        In "monitor" mode, violations are detected and logged but requests are allowed through.
        """

        self.on_input_too_long: str = on_input_too_long
        """
        Behavior when Bedrock returns 'Input is too long':
        'fail_closed' - raise error (default)
        'fail_open'   - log critical warning and allow request through
        'chunk'       - split input into chunks and apply guardrail to each
        """

        self.bedrock_guardrail_max_chunk_size: int = bedrock_guardrail_max_chunk_size
        """
        Maximum characters per Bedrock guardrail API call when on_input_too_long='chunk'.
        """

        self.guardrail_max_chunk_concurrency: int = guardrail_max_chunk_concurrency
        """
        Maximum concurrent Bedrock API calls when chunks are processed in parallel.
        Prevents connection storms against the ApplyGuardrail endpoint at high throughput.
        """

        # Set supported event hooks to include MCP hooks
        if "supported_event_hooks" not in kwargs:
            kwargs["supported_event_hooks"] = [
                GuardrailEventHooks.pre_call,
                GuardrailEventHooks.post_call,
                GuardrailEventHooks.during_call,
                GuardrailEventHooks.pre_mcp_call,
                GuardrailEventHooks.during_mcp_call,
            ]

        super().__init__(**kwargs)
        BaseAWSLLM.__init__(self)

        verbose_proxy_logger.debug(
            "Bedrock Guardrail initialized with guardrailIdentifier: %s, guardrailVersion: %s",
            self.guardrailIdentifier,
            self.guardrailVersion,
        )

    def _create_bedrock_input_content_request(
        self, messages: Optional[List[AllMessageValues]]
    ) -> BedrockRequest:
        """
        Create a bedrock request for the input content - the LLM request.
        """
        bedrock_request: BedrockRequest = BedrockRequest(source="INPUT")
        bedrock_request_content: List[BedrockContentItem] = []
        if messages is None:
            return bedrock_request
        for message in messages:
            message_text_content: Optional[List[str]] = self.get_content_for_message(
                message=message
            )
            if message_text_content is None:
                continue
            for text_content in message_text_content:
                bedrock_content_item = BedrockContentItem(
                    text=BedrockTextContent(text=text_content)
                )
                bedrock_request_content.append(bedrock_content_item)

        bedrock_request["content"] = bedrock_request_content
        return bedrock_request

    def _create_bedrock_output_content_request(
        self, response: Union[Any, ModelResponse]
    ) -> BedrockRequest:
        """
        Create a bedrock request for the output content - the LLM response.
        """
        bedrock_request: BedrockRequest = BedrockRequest(source="OUTPUT")
        bedrock_request_content: List[BedrockContentItem] = []
        if isinstance(response, litellm.ModelResponse):
            for choice in response.choices:
                if isinstance(choice, litellm.Choices):
                    if choice.message.content and isinstance(
                        choice.message.content, str
                    ):
                        bedrock_content_item = BedrockContentItem(
                            text=BedrockTextContent(text=choice.message.content)
                        )
                        bedrock_request_content.append(bedrock_content_item)
            bedrock_request["content"] = bedrock_request_content
        return bedrock_request

    def convert_to_bedrock_format(
        self,
        source: Literal["INPUT", "OUTPUT"],
        messages: Optional[List[AllMessageValues]] = None,
        response: Optional[Union[Any, ModelResponse]] = None,
    ) -> BedrockRequest:
        """
        Convert the litellm messages/response to the bedrock request format.

        If source is "INPUT", then messages is required.
        If source is "OUTPUT", then response is required.

        Returns:
            BedrockRequest: The bedrock request object.
        """
        bedrock_request: BedrockRequest = BedrockRequest(source=source)
        if source == "INPUT":
            bedrock_request = self._create_bedrock_input_content_request(
                messages=messages
            )
        elif source == "OUTPUT":
            bedrock_request = self._create_bedrock_output_content_request(
                response=response
            )
        return bedrock_request

    def _prepare_guardrail_messages_for_role(
        self,
        messages: Optional[List[AllMessageValues]],
    ) -> GuardrailMessageFilterResult:
        """Return payload + merge metadata for the latest user message."""
        # NOTE: This logic probably belongs in CustomGuardrail once other guardrails adopt the feature.

        if messages is None:
            return GuardrailMessageFilterResult(None, None, None)

        if self.experimental_use_latest_role_message_only is not True:
            return GuardrailMessageFilterResult(messages, None, None)

        latest_index = self._find_latest_message_index(messages, target_role="user")
        if latest_index is None:
            return GuardrailMessageFilterResult(None, None, None)

        original_messages = list(messages)
        payload_messages = [messages[latest_index]]
        return GuardrailMessageFilterResult(
            payload_messages=payload_messages,
            original_messages=original_messages,
            target_indices=[latest_index],
        )

    def _find_latest_message_index(
        self, messages: List[AllMessageValues], target_role: str
    ) -> Optional[int]:
        for index in range(len(messages) - 1, -1, -1):
            if messages[index].get("role", None) == target_role:
                return index
        return None

    def _merge_filtered_messages(
        self,
        original_messages: Optional[List[AllMessageValues]],
        updated_target_messages: List[AllMessageValues],
        target_indices: Optional[List[int]],
    ) -> List[AllMessageValues]:
        if not target_indices:
            return updated_target_messages

        if not original_messages:
            original_messages = []

        merged_messages = list(original_messages)
        if not merged_messages:
            merged_messages = list(updated_target_messages)
        for replacement_index, updated_message in zip(
            target_indices, updated_target_messages
        ):
            if replacement_index < len(merged_messages):
                merged_messages[replacement_index] = updated_message

        return merged_messages

    # NOTE: Consider moving these helpers to CustomGuardrail when the filtering
    # logic becomes shared across providers.

    #### CALL HOOKS - proxy only ####
    def _load_credentials(
        self,
    ):
        try:
            from botocore.credentials import Credentials
        except ImportError:
            raise ImportError("Missing boto3 to call bedrock. Run 'pip install boto3'.")
        ## CREDENTIALS ##
        aws_secret_access_key = self.optional_params.get("aws_secret_access_key", None)
        aws_access_key_id = self.optional_params.get("aws_access_key_id", None)
        aws_session_token = self.optional_params.get("aws_session_token", None)
        aws_region_name = self.optional_params.get("aws_region_name", None)
        aws_role_name = self.optional_params.get("aws_role_name", None)
        aws_session_name = self.optional_params.get("aws_session_name", None)
        aws_profile_name = self.optional_params.get("aws_profile_name", None)
        aws_web_identity_token = self.optional_params.get(
            "aws_web_identity_token", None
        )
        aws_sts_endpoint = self.optional_params.get("aws_sts_endpoint", None)

        ### SET REGION NAME ###
        aws_region_name = self.get_aws_region_name_for_non_llm_api_calls(
            aws_region_name=aws_region_name,
        )

        credentials: Credentials = self.get_credentials(
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            aws_session_token=aws_session_token,
            aws_region_name=aws_region_name,
            aws_session_name=aws_session_name,
            aws_profile_name=aws_profile_name,
            aws_role_name=aws_role_name,
            aws_web_identity_token=aws_web_identity_token,
            aws_sts_endpoint=aws_sts_endpoint,
        )
        return credentials, aws_region_name

    def _prepare_request(
        self,
        credentials,
        data: dict,
        optional_params: dict,
        aws_region_name: str,
        api_key: Optional[str] = None,
        extra_headers: Optional[dict] = None,
    ):
        headers = {"Content-Type": "application/json"}
        if extra_headers is not None:
            headers = {"Content-Type": "application/json", **extra_headers}

        aws_bedrock_runtime_endpoint = self.optional_params.get(
            "aws_bedrock_runtime_endpoint", None
        )
        _, proxy_endpoint_url = self.get_runtime_endpoint(
            api_base=None,
            aws_bedrock_runtime_endpoint=aws_bedrock_runtime_endpoint,
            aws_region_name=aws_region_name,
        )
        proxy_endpoint_url = f"{proxy_endpoint_url}/guardrail/{self.guardrailIdentifier}/version/{self.guardrailVersion}/apply"
        # api_base = f"https://bedrock-runtime.{aws_region_name}.amazonaws.com/guardrail/{self.guardrailIdentifier}/version/{self.guardrailVersion}/apply"
        encoded_data = json.dumps(data).encode("utf-8")

        # first check api-key, if none, fall back to sigV4
        if api_key is not None:
            aws_bearer_token: Optional[str] = api_key
        else:
            aws_bearer_token = get_secret_str("AWS_BEARER_TOKEN_BEDROCK")

        if aws_bearer_token:
            try:
                from botocore.awsrequest import AWSRequest
            except ImportError:
                raise ImportError(
                    "Missing boto3 to call bedrock. Run 'pip install boto3'."
                )
            headers["Authorization"] = f"Bearer {aws_bearer_token}"
            request = AWSRequest(
                method="POST",
                url=proxy_endpoint_url,
                data=encoded_data,
                headers=headers,
            )
        else:
            try:
                from botocore.auth import SigV4Auth
                from botocore.awsrequest import AWSRequest
            except ImportError:
                raise ImportError(
                    "Missing boto3 to call bedrock. Run 'pip install boto3'."
                )

            sigv4 = SigV4Auth(credentials, "bedrock", aws_region_name)
            request = AWSRequest(
                method="POST",
                url=proxy_endpoint_url,
                data=encoded_data,
                headers=headers,
            )
            sigv4.add_auth(request)
            if (
                extra_headers is not None and "Authorization" in extra_headers
            ):  # prevent sigv4 from overwriting the auth header
                request.headers["Authorization"] = extra_headers["Authorization"]
        prepped_request = request.prepare()

        return prepped_request

    async def make_bedrock_api_request(
        self,
        source: Literal["INPUT", "OUTPUT"],
        messages: Optional[List[AllMessageValues]] = None,
        response: Optional[Union[Any, litellm.ModelResponse]] = None,
        request_data: Optional[dict] = None,
    ) -> BedrockGuardrailResponse:
        start_time = datetime.now()
        credentials, aws_region_name = self._load_credentials()
        bedrock_request_data: dict = dict(
            self.convert_to_bedrock_format(
                source=source, messages=messages, response=response
            )
        )
        bedrock_guardrail_response: BedrockGuardrailResponse = (
            BedrockGuardrailResponse()
        )
        api_key: Optional[str] = None
        if request_data:
            bedrock_request_data.update(
                self.get_guardrail_dynamic_request_body_params(
                    request_data=request_data
                )
            )
            if request_data.get("api_key") is not None:
                api_key = request_data["api_key"]

        prepared_request = self._prepare_request(
            credentials=credentials,
            data=bedrock_request_data,
            optional_params=self.optional_params,
            aws_region_name=aws_region_name,
            api_key=api_key,
        )
        verbose_proxy_logger.debug(
            "Bedrock AI request body: %s, url %s, headers: %s",
            bedrock_request_data,
            prepared_request.url,
            prepared_request.headers,
        )

        event_type = (
            GuardrailEventHooks.pre_call
            if source == "INPUT"
            else GuardrailEventHooks.post_call
        )

        try:
            httpx_response = await self.async_handler.post(
                url=prepared_request.url,
                data=prepared_request.body,  # type: ignore
                headers=prepared_request.headers,  # type: ignore
            )
        except HTTPException:
            # Propagate HTTPException (e.g. from non-200 path) as-is
            raise
        except Exception as e:
            # If this is an HTTP error with a response body (e.g. httpx.HTTPStatusError),
            # extract the AWS error message and propagate it
            response = getattr(e, "response", None)
            if isinstance(response, httpx.Response):
                try:
                    status_code, detail_message = (
                        self._parse_bedrock_guardrail_error_response(response)
                    )
                    self.add_standard_logging_guardrail_information_to_request_data(
                        guardrail_provider=self.guardrail_provider,
                        guardrail_json_response={"error": detail_message},
                        request_data=request_data or {},
                        guardrail_status="guardrail_failed_to_respond",
                        start_time=start_time.timestamp(),
                        end_time=datetime.now().timestamp(),
                        duration=(datetime.now() - start_time).total_seconds(),
                        event_type=event_type,
                    )
                    raise HTTPException(
                        status_code=status_code, detail=detail_message
                    ) from e
                except HTTPException:
                    raise
            # Endpoint down, timeout, or other HTTP/network errors
            verbose_proxy_logger.error(
                "Bedrock AI: failed to make guardrail request: %s", str(e)
            )
            self.add_standard_logging_guardrail_information_to_request_data(
                guardrail_provider=self.guardrail_provider,
                guardrail_json_response={"error": str(e)},
                request_data=request_data or {},
                guardrail_status="guardrail_failed_to_respond",
                start_time=start_time.timestamp(),
                end_time=datetime.now().timestamp(),
                duration=(datetime.now() - start_time).total_seconds(),
                event_type=event_type,
            )
            raise

        #########################################################
        # Add guardrail information to request trace
        #########################################################
        self.add_standard_logging_guardrail_information_to_request_data(
            guardrail_provider=self.guardrail_provider,
            guardrail_json_response=httpx_response.json(),
            request_data=request_data or {},
            guardrail_status=self._get_bedrock_guardrail_response_status(
                response=httpx_response
            ),
            start_time=start_time.timestamp(),
            end_time=datetime.now().timestamp(),
            duration=(datetime.now() - start_time).total_seconds(),
            event_type=event_type,
        )
        #########################################################
        if httpx_response.status_code == 200:
            # check if the response was flagged
            _json_response = httpx_response.json()
            redacted_response = _redact_pii_matches(_json_response)
            verbose_proxy_logger.debug("Bedrock AI response : %s", redacted_response)
            bedrock_guardrail_response = BedrockGuardrailResponse(**_json_response)
            if self._should_raise_guardrail_blocked_exception(
                bedrock_guardrail_response
            ):
                if self.on_flagged == "monitor":
                    verbose_proxy_logger.warning(
                        "Bedrock Guardrail: MONITOR mode - violation detected but allowing request"
                    )
                else:
                    raise self._get_http_exception_for_blocked_guardrail(
                        bedrock_guardrail_response
                    )
        else:
            status_code, detail_message = self._parse_bedrock_guardrail_error_response(
                httpx_response
            )
            verbose_proxy_logger.error(
                "Bedrock AI: error in response. Status code: %s, response: %s",
                httpx_response.status_code,
                httpx_response.text,
            )
            raise HTTPException(status_code=status_code, detail=detail_message)

        return bedrock_guardrail_response

    def _check_bedrock_response_for_exception(self, response) -> bool:
        """
        Return True if the Bedrock ApplyGuardrail response indicates an exception.

        Works with real httpx.Response objects and MagicMock responses used in tests.
        """
        payload = None

        try:
            json_method = getattr(response, "json", None)
            if callable(json_method):
                payload = json_method()
        except Exception:
            payload = None

        if payload is None:
            try:
                raw = getattr(response, "content", None)
                if isinstance(raw, (bytes, bytearray)):
                    payload = json.loads(raw.decode("utf-8"))
                else:
                    text = getattr(response, "text", None)
                    if isinstance(text, str):
                        payload = json.loads(text)
            except Exception:
                # Can't parse -> assume no explicit Exception marker
                return False

        if not isinstance(payload, dict):
            return False

        return "Exception" in payload.get("Output", {}).get("__type", "")

    def _get_bedrock_guardrail_response_status(
        self, response: httpx.Response
    ) -> GuardrailStatus:
        """
        Get the status of the bedrock guardrail response.

        Returns:
            "success": Content allowed through with no violations
            "guardrail_intervened": Content blocked due to policy violations
            "guardrail_failed_to_respond": Technical error or API failure
        """
        if response.status_code == 200:
            if self._check_bedrock_response_for_exception(response):
                return "guardrail_failed_to_respond"

            # Check if the guardrail would block content
            try:
                _json_response = response.json()
                bedrock_guardrail_response = BedrockGuardrailResponse(**_json_response)
                if self._should_raise_guardrail_blocked_exception(
                    bedrock_guardrail_response
                ):
                    if self.on_flagged == "monitor":
                        return "guardrail_monitored"
                    return "guardrail_intervened"
            except Exception:
                pass

            return "success"
        return "guardrail_failed_to_respond"

    def _parse_bedrock_guardrail_error_response(
        self, response: httpx.Response
    ) -> Tuple[int, str]:
        """
        Parse AWS Bedrock guardrail error response body to extract status code and message.

        AWS may return shapes like {"message": "..."} or {"error": {"message": "..."}}.
        Returns (status_code, message) for use in HTTPException.
        """
        status_code = response.status_code
        message = "Bedrock guardrail request failed"
        try:
            body = response.json()
        except Exception:
            text = getattr(response, "text", None) or ""
            if isinstance(text, str) and text.strip():
                return (status_code, text.strip())
            return (status_code, message)
        if isinstance(body, dict):
            if isinstance(body.get("message"), str):
                return (status_code, body["message"])
            err = body.get("error")
            if isinstance(err, dict) and isinstance(err.get("message"), str):
                return (status_code, err["message"])
            if isinstance(err, str):
                return (status_code, err)
        return (status_code, message)

    def _get_http_exception_for_blocked_guardrail(
        self, response: BedrockGuardrailResponse
    ) -> Union[HTTPException, GuardrailInterventionNormalStringError]:
        """
        Get the HTTP exception for a blocked guardrail.
        """
        bedrock_guardrail_output_text: str = ""
        outputs: Optional[List[BedrockGuardrailOutput]] = (
            response.get("outputs", []) or []
        )
        if outputs:
            for output in outputs:
                if output.get("text"):
                    bedrock_guardrail_output_text += output.get("text") or ""

        if self.disable_exception_on_block is True:
            return GuardrailInterventionNormalStringError(
                message=bedrock_guardrail_output_text
            )
        else:
            return HTTPException(
                status_code=400,
                detail={
                    "error": "Violated guardrail policy",
                    "bedrock_guardrail_response": bedrock_guardrail_output_text,
                },
            )

    def _should_raise_guardrail_blocked_exception(
        self, response: BedrockGuardrailResponse
    ) -> bool:
        """
        Only raise exception for "BLOCKED" actions, not for "ANONYMIZED" actions.

        If `self.mask_request_content` or `self.mask_response_content` is set to `True`,
        then use the output from the guardrail to mask the request or response content.

        However, even with masking enabled, content with action="BLOCKED" should still
        raise an exception, only content with action="ANONYMIZED" should be masked.
        """

        # if no intervention, return False
        if response.get("action") != "GUARDRAIL_INTERVENED":
            return False

        # Check assessments to determine if any actions were BLOCKED (vs ANONYMIZED)
        assessments = response.get("assessments", [])
        if not assessments:
            return False

        for assessment in assessments:
            # Check topic policy
            topic_policy = assessment.get("topicPolicy")
            if topic_policy:
                topics = topic_policy.get("topics", [])
                for topic in topics:
                    if topic.get("action") == "BLOCKED":
                        return True

            # Check content policy
            content_policy = assessment.get("contentPolicy")
            if content_policy:
                filters = content_policy.get("filters", [])
                for filter_item in filters:
                    if filter_item.get("action") == "BLOCKED":
                        return True

            # Check word policy
            word_policy = assessment.get("wordPolicy")
            if word_policy:
                custom_words = word_policy.get("customWords", [])
                for custom_word in custom_words:
                    if custom_word.get("action") == "BLOCKED":
                        return True
                managed_words = word_policy.get("managedWordLists", [])
                for managed_word in managed_words:
                    if managed_word.get("action") == "BLOCKED":
                        return True

            # Check sensitive information policy
            sensitive_info_policy = assessment.get("sensitiveInformationPolicy")
            if sensitive_info_policy:
                pii_entities = sensitive_info_policy.get("piiEntities", [])
                if pii_entities:
                    for pii_entity in pii_entities:
                        if pii_entity.get("action") == "BLOCKED":
                            return True
                regexes = sensitive_info_policy.get("regexes", [])
                if regexes:
                    for regex in regexes:
                        if regex.get("action") == "BLOCKED":
                            return True

            # Check contextual grounding policy
            contextual_grounding_policy = assessment.get("contextualGroundingPolicy")
            if contextual_grounding_policy:
                grounding_filters = contextual_grounding_policy.get("filters", [])
                for grounding_filter in grounding_filters:
                    if grounding_filter.get("action") == "BLOCKED":
                        return True

        # If we got here, intervention occurred but no BLOCKED actions found
        # This means all actions were ANONYMIZED or NONE, so don't raise exception
        return False

    def create_guardrail_blocked_response(self, response: str) -> ModelResponse:
        return ModelResponse(
            choices=[
                Choices(
                    message=Message(content=response),
                )
            ],
            model="bedrock-guardrail",
        )

    async def async_pre_call_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        cache: DualCache,
        data: dict,
        call_type: CallTypesLiteral,
    ) -> Union[Exception, str, dict, None]:
        verbose_proxy_logger.debug(
            "Inside Bedrock Pre-Call Hook for call_type: %s", call_type
        )

        from litellm.proxy.common_utils.callback_utils import (
            add_guardrail_to_applied_guardrails_header,
        )

        event_type: GuardrailEventHooks = GuardrailEventHooks.pre_call
        if self.should_run_guardrail(data=data, event_type=event_type) is not True:
            return data

        new_messages = self.get_guardrails_messages_for_call_type(
            call_type=cast(CallTypes, call_type),
            data=data,
        )

        # Handle None case
        if new_messages is None:
            verbose_proxy_logger.debug(
                "No messages found for call_type, skipping guardrail"
            )
            return data

        filter_result = self._prepare_guardrail_messages_for_role(messages=new_messages)

        filtered_messages = filter_result.payload_messages
        if not filtered_messages:
            verbose_proxy_logger.debug(
                "No user-role messages available for guardrail payload"
            )
            return data

        #########################################################
        ########## 1. Make the Bedrock API request ##########
        #########################################################
        bedrock_guardrail_response: Optional[Union[BedrockGuardrailResponse, str]] = (
            None
        )
        try:
            bedrock_guardrail_response = (
                await self._make_bedrock_input_request_with_chunking_fallback(
                    messages=filtered_messages, request_data=data
                )
            )
        except GuardrailInterventionNormalStringError as e:
            bedrock_guardrail_response = e.message
        #########################################################

        #########################################################
        ########## 2. Update the messages with the guardrail response ##########
        #########################################################
        updated_subset = self._update_messages_with_updated_bedrock_guardrail_response(
            messages=filtered_messages,
            bedrock_guardrail_response=bedrock_guardrail_response,
        )
        data["messages"] = self._merge_filtered_messages(
            original_messages=filter_result.original_messages or new_messages,
            updated_target_messages=updated_subset,
            target_indices=filter_result.target_indices,
        )
        if isinstance(bedrock_guardrail_response, str):
            data["mock_response"] = self.create_guardrail_blocked_response(
                response=bedrock_guardrail_response
            )

        #########################################################
        ########## 3. Add the guardrail to the applied guardrails header ##########
        #########################################################
        add_guardrail_to_applied_guardrails_header(
            request_data=data, guardrail_name=self.guardrail_name
        )
        return data

    async def async_moderation_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        call_type: CallTypesLiteral,
    ):
        from litellm.proxy.common_utils.callback_utils import (
            add_guardrail_to_applied_guardrails_header,
        )

        event_type: GuardrailEventHooks = GuardrailEventHooks.during_call
        if self.should_run_guardrail(data=data, event_type=event_type) is not True:
            return

        new_messages = self.get_guardrails_messages_for_call_type(
            call_type=cast(CallTypes, call_type),
            data=data,
        )

        if new_messages is None:
            verbose_proxy_logger.warning(
                "Bedrock AI: not running guardrail. No messages in data"
            )
            return

        filter_result = self._prepare_guardrail_messages_for_role(messages=new_messages)
        filtered_messages = filter_result.payload_messages
        if not filtered_messages:
            verbose_proxy_logger.debug(
                "Bedrock AI: not running guardrail. No user-role messages"
            )
            return

        #########################################################
        ########## 1. Make the Bedrock API request ##########
        #########################################################
        bedrock_guardrail_response: Optional[Union[BedrockGuardrailResponse, str]] = (
            None
        )
        try:
            bedrock_guardrail_response = (
                await self._make_bedrock_input_request_with_chunking_fallback(
                    messages=filtered_messages, request_data=data
                )
            )
        except GuardrailInterventionNormalStringError as e:
            bedrock_guardrail_response = e.message
        #########################################################

        #########################################################
        ########## 2. Update the messages with the guardrail response ##########
        #########################################################
        updated_subset = self._update_messages_with_updated_bedrock_guardrail_response(
            messages=filtered_messages,
            bedrock_guardrail_response=bedrock_guardrail_response,
        )
        data["messages"] = self._merge_filtered_messages(
            original_messages=filter_result.original_messages or new_messages,
            updated_target_messages=updated_subset,
            target_indices=filter_result.target_indices,
        )
        if isinstance(bedrock_guardrail_response, str):
            data["mock_response"] = self.create_guardrail_blocked_response(
                response=bedrock_guardrail_response
            )

        #########################################################
        ########## 3. Add the guardrail to the applied guardrails header ##########
        #########################################################
        add_guardrail_to_applied_guardrails_header(
            request_data=data, guardrail_name=self.guardrail_name
        )

        return data

    async def async_post_call_success_hook(
        self,
        data: dict,
        user_api_key_dict: UserAPIKeyAuth,
        response,
    ):
        from litellm.proxy.common_utils.callback_utils import (
            add_guardrail_to_applied_guardrails_header,
        )
        from litellm.types.guardrails import GuardrailEventHooks

        if (
            self.should_run_guardrail(
                data=data, event_type=GuardrailEventHooks.post_call
            )
            is not True
        ):
            return

        new_messages: Optional[List[AllMessageValues]] = data.get("messages")
        if new_messages is None:
            verbose_proxy_logger.warning(
                "Bedrock AI: not running guardrail. No messages in data"
            )
            return

        # Check if the ModelResponse has text content in its choices
        # to avoid sending empty content to Bedrock (e.g., during tool calls)
        if isinstance(response, litellm.ModelResponse):
            has_text_content = False
            for choice in response.choices:
                if isinstance(choice, litellm.Choices):
                    if choice.message.content and isinstance(
                        choice.message.content, str
                    ):
                        has_text_content = True
                        break

            if not has_text_content:
                verbose_proxy_logger.warning(
                    "Bedrock AI: not running guardrail. No output text in response"
                )
                return

        #########################################################
        ########## 1. Make Bedrock API requests ##########
        #########################################################
        # Determine if INPUT validation is needed in post_call
        # Skip INPUT validation if pre_call or during_call is already enabled
        # (to avoid redundant validation - those hooks would have already validated INPUT)
        should_validate_input = not (
            self._event_hook_is_event_type(GuardrailEventHooks.pre_call)
            or self._event_hook_is_event_type(GuardrailEventHooks.during_call)
        )

        output_content_bedrock: Optional[Union[BedrockGuardrailResponse, str]] = None

        if should_validate_input:
            # Prepare input messages (with optional filtering for latest role message)
            input_filter = self._prepare_guardrail_messages_for_role(
                messages=new_messages
            )
            input_messages = input_filter.payload_messages or new_messages

            # Create tasks for parallel execution of both INPUT and OUTPUT validation.
            # Both use the chunking-fallback wrappers so on_input_too_long is honoured
            # for INPUT and OUTPUT alike (Gap A).
            input_task = self._make_bedrock_input_request_with_chunking_fallback(
                messages=input_messages,
                request_data=data,
            )
            output_task = self._make_bedrock_output_request_with_chunking_fallback(
                response=response, request_data=data
            )

            # Execute both requests in parallel with early-cancel so a blocked
            # task cancels its sibling immediately (Gap 3).
            try:
                tasks = [
                    asyncio.create_task(input_task),
                    asyncio.create_task(output_task),
                ]
                _, output_content_bedrock = await self._gather_with_early_cancel(tasks)
            except GuardrailInterventionNormalStringError as e:
                output_content_bedrock = e.message
        else:
            # Only run OUTPUT validation (INPUT was already validated in pre_call or during_call)
            try:
                output_content_bedrock = (
                    await self._make_bedrock_output_request_with_chunking_fallback(
                        response=response, request_data=data
                    )
                )
            except GuardrailInterventionNormalStringError as e:
                output_content_bedrock = e.message

        #########################################################
        ########## 2. Apply masking to response with output guardrail response ##########
        #########################################################
        if isinstance(output_content_bedrock, str):
            response = self.create_guardrail_blocked_response(
                response=output_content_bedrock
            )
        elif output_content_bedrock is not None:
            self._apply_masking_to_response(
                response=response,
                bedrock_guardrail_response=output_content_bedrock,
            )

        #########################################################
        ########## 3. Add the guardrail to the applied guardrails header ##########
        #########################################################
        add_guardrail_to_applied_guardrails_header(
            request_data=data, guardrail_name=self.guardrail_name
        )

    ###########  HELPER FUNCTIONS for bedrock guardrails ############################
    ##############################################################################
    ##############################################################################
    def _update_messages_with_updated_bedrock_guardrail_response(
        self,
        messages: List[AllMessageValues],
        bedrock_guardrail_response: Union[BedrockGuardrailResponse, str],
    ) -> List[AllMessageValues]:
        """
        Use the output from the bedrock guardrail to mask sensitive content in messages.

        Args:
            messages: Original list of messages
            bedrock_guardrail_response: Response from Bedrock guardrail containing masked content

        Returns:
            List of messages with content masked according to guardrail response
        """
        if isinstance(bedrock_guardrail_response, str):
            return messages
        # Get masked texts from guardrail response
        masked_texts = self._extract_masked_texts_from_response(
            bedrock_guardrail_response
        )

        # If guardrail provided masked output, use it regardless of masking flags
        # because the guardrail has already determined this content needs anonymization
        if masked_texts:
            verbose_proxy_logger.debug(
                "Bedrock guardrail provided masked output, applying to messages"
            )
            return self._apply_masking_to_messages(
                messages=messages, masked_texts=masked_texts
            )

        # If masking is enabled but no masked texts available, still try to apply
        # (this maintains backward compatibility for edge cases)
        if self.mask_request_content or self.mask_response_content:
            verbose_proxy_logger.debug(
                "Masking enabled but no masked output from guardrail, returning original messages"
            )

        return messages

    async def async_post_call_streaming_iterator_hook(
        self,
        user_api_key_dict: UserAPIKeyAuth,
        response: Any,
        request_data: dict,
    ) -> AsyncGenerator[ModelResponseStream, None]:
        """
        Process streaming response chunks through the Bedrock guardrail.

        **Streaming buffer note (Gap F):** This hook must buffer the *entire*
        stream before calling Bedrock's ``ApplyGuardrail`` API because that API
        is synchronous and requires the complete text.  As a result, the caller
        will not receive any tokens until the full response has been assembled
        and checked.  This is an architectural limitation of the
        ``ApplyGuardrail`` endpoint — it cannot be resolved by changing this
        hook.

        Operators who need streaming latency-sensitive guardrail checks should
        use ``mode: pre_call`` so the guardrail runs on the request (INPUT)
        before the LLM call rather than on the assembled response.
        """
        from litellm.llms.base_llm.base_model_iterator import MockResponseIterator
        from litellm.main import stream_chunk_builder
        from litellm.types.utils import TextCompletionResponse

        # Collect all chunks to process them together
        all_chunks: List[ModelResponseStream] = []
        async for chunk in response:
            all_chunks.append(chunk)

        assembled_model_response: Optional[
            Union[ModelResponse, TextCompletionResponse]
        ] = stream_chunk_builder(
            chunks=all_chunks,
        )
        if isinstance(assembled_model_response, ModelResponse):
            ####################################################################
            ########## 1. Make Bedrock Apply Guardrail API requests ##########

            # Bedrock will raise an exception if this violates the guardrail policy
            ###################################################################
            # Determine if INPUT validation is needed in post_call
            # Skip INPUT validation if pre_call or during_call is already enabled
            # (to avoid redundant validation - those hooks would have already validated INPUT)
            should_validate_input = not (
                self._event_hook_is_event_type(GuardrailEventHooks.pre_call)
                or self._event_hook_is_event_type(GuardrailEventHooks.during_call)
            )

            output_guardrail_response: Optional[
                Union[BedrockGuardrailResponse, str]
            ] = None

            if should_validate_input:
                # Create tasks for parallel execution.
                # Both use chunking-fallback wrappers so on_input_too_long is
                # honoured for INPUT and OUTPUT alike (Gap A).
                input_filter = self._prepare_guardrail_messages_for_role(
                    messages=request_data.get("messages")
                )
                input_messages = input_filter.payload_messages or request_data.get(
                    "messages"
                )
                input_task = self._make_bedrock_input_request_with_chunking_fallback(
                    messages=input_messages,
                    request_data=request_data,
                )
                output_task = self._make_bedrock_output_request_with_chunking_fallback(
                    response=assembled_model_response,
                    request_data=request_data,
                )

                # Execute both requests in parallel with early-cancel so a blocked
                # task cancels its sibling immediately (Gap 3).
                try:
                    tasks = [
                        asyncio.create_task(input_task),
                        asyncio.create_task(output_task),
                    ]
                    _, output_guardrail_response = await self._gather_with_early_cancel(
                        tasks
                    )
                except GuardrailInterventionNormalStringError as e:
                    output_guardrail_response = e.message
            else:
                # Only run OUTPUT validation (INPUT was already validated in pre_call or during_call)
                try:
                    output_guardrail_response = (
                        await self._make_bedrock_output_request_with_chunking_fallback(
                            response=assembled_model_response,
                            request_data=request_data,
                        )
                    )
                except GuardrailInterventionNormalStringError as e:
                    output_guardrail_response = e.message

            #########################################################################
            ########## 2. Apply masking to response with output guardrail response ##########
            #########################################################################
            if isinstance(output_guardrail_response, str):
                assembled_model_response = self.create_guardrail_blocked_response(
                    response=output_guardrail_response
                )
            elif output_guardrail_response is not None:
                self._apply_masking_to_response(
                    response=assembled_model_response,
                    bedrock_guardrail_response=output_guardrail_response,
                )

            #########################################################################
            ########## 3. Return the (potentially masked) chunks ##########
            #########################################################################
            mock_response = MockResponseIterator(
                model_response=assembled_model_response
            )

            # Return the reconstructed stream
            async for chunk in mock_response:
                yield chunk
        else:
            for chunk in all_chunks:
                yield chunk

    def _extract_masked_texts_from_response(
        self, bedrock_guardrail_response: BedrockGuardrailResponse
    ) -> List[str]:
        """
        Extract all masked text outputs from the guardrail response.

        Args:
            bedrock_guardrail_response: Response from Bedrock guardrail

        Returns:
            List of masked text strings
        """
        masked_output_text: List[str] = []
        masked_outputs: Optional[List[BedrockGuardrailOutput]] = (
            bedrock_guardrail_response.get("outputs", []) or []
        )
        if not masked_outputs:
            verbose_proxy_logger.debug("No masked outputs found in guardrail response")
            return []

        for output in masked_outputs:
            text_content: Optional[str] = output.get("text")
            if text_content is not None:
                masked_output_text.append(text_content)

        return masked_output_text

    def _apply_masking_to_messages(
        self, messages: List[AllMessageValues], masked_texts: List[str]
    ) -> List[AllMessageValues]:
        """
        Apply masked texts to message content using index tracking.

        Args:
            messages: Original messages
            masked_texts: List of masked text strings from guardrail

        Returns:
            Updated messages with masked content
        """
        updated_messages = []
        masking_index = 0

        for message in messages:
            new_message = message.copy()
            content = new_message.get("content")

            # Skip messages with no content
            if content is None:
                updated_messages.append(new_message)
                continue

            # Handle string content
            if isinstance(content, str):
                if masking_index < len(masked_texts):
                    new_message["content"] = masked_texts[masking_index]
                    masking_index += 1
            # Handle list content
            elif isinstance(content, list):
                new_message["content"], masking_index = self._mask_content_list(
                    content_list=content,
                    masked_texts=masked_texts,
                    masking_index=masking_index,
                )

            updated_messages.append(new_message)

        return updated_messages

    def _mask_content_list(
        self, content_list: List[Any], masked_texts: List[str], masking_index: int
    ) -> Tuple[List[Any], int]:
        """
        Apply masking to a list of content items.

        Args:
            content_list: List of content items
            masked_texts: List of masked text strings
            starting_index: Starting index in the masked_texts list

        Returns:
            Updated content list with masked items
        """
        new_content: List[Union[dict, str]] = []
        for item in content_list:
            if isinstance(item, dict) and "text" in item:
                new_item = item.copy()
                if masking_index < len(masked_texts):
                    new_item["text"] = masked_texts[masking_index]
                    masking_index += 1
                new_content.append(new_item)
            elif isinstance(item, str):
                if masking_index < len(masked_texts):
                    item = masked_texts[masking_index]
                    masking_index += 1
                if item is not None:
                    new_content.append(item)

        return new_content, masking_index

    def get_content_for_message(self, message: AllMessageValues) -> Optional[List[str]]:
        """
        Get the content for a message.

        For bedrock guardrails we create a list of all the text content in the message.

        If a message has a list of content items, we flatten the list and return a list of text content.
        """
        message_text_content = []
        content = message.get("content")
        if content is None:
            return None
        if isinstance(content, str):
            message_text_content.append(content)
        elif isinstance(content, list):
            for item in content:
                if isinstance(item, dict) and "text" in item:
                    message_text_content.append(item["text"])
                elif isinstance(item, str):
                    message_text_content.append(item)
        return message_text_content

    def _apply_masking_to_response(
        self,
        response: Union[ModelResponse, Any],
        bedrock_guardrail_response: BedrockGuardrailResponse,
    ) -> None:
        """
        Apply masked content from bedrock guardrail to the response object.

        Args:
            response: The response object to modify
            bedrock_guardrail_response: Response from Bedrock guardrail containing masked content
        """
        # Get masked texts from guardrail response
        masked_texts = self._extract_masked_texts_from_response(
            bedrock_guardrail_response
        )

        if not masked_texts:
            verbose_proxy_logger.debug(
                "No masked outputs found, skipping response masking"
            )
            return

        verbose_proxy_logger.debug(
            "Applying masking to response with %d masked texts", len(masked_texts)
        )

        # Apply masking to ModelResponse
        if isinstance(response, litellm.ModelResponse):
            self._apply_masking_to_model_response(response, masked_texts)
        else:
            verbose_proxy_logger.warning(
                "Unsupported response type for masking: %s", type(response)
            )

    def _apply_masking_to_model_response(
        self, response: litellm.ModelResponse, masked_texts: List[str]
    ) -> None:
        """
        Apply masked texts to a ModelResponse object.

        Args:
            response: The ModelResponse object to modify in-place
            masked_texts: List of masked text strings from guardrail
        """
        masking_index = 0

        for choice in response.choices:
            if isinstance(choice, Choices):
                # For chat completions
                if choice.message.content and isinstance(choice.message.content, str):
                    if masking_index < len(masked_texts):
                        choice.message.content = masked_texts[masking_index]
                        masking_index += 1
                        verbose_proxy_logger.debug(
                            "Applied masking to choice message content"
                        )
            elif isinstance(choice, StreamingChoices):
                # For streaming responses, modify delta content
                if choice.delta.content and isinstance(choice.delta.content, str):
                    if masking_index < len(masked_texts):
                        choice.delta.content = masked_texts[masking_index]
                        masking_index += 1
                        verbose_proxy_logger.debug(
                            "Applied masking to choice delta content"
                        )
            elif isinstance(choice, TextChoices):
                # For text completions
                if choice.text and isinstance(choice.text, str):
                    if masking_index < len(masked_texts):
                        choice.text = masked_texts[masking_index]
                        masking_index += 1
                        verbose_proxy_logger.debug(
                            "Applied masking to choice text content"
                        )

    @staticmethod
    def _is_input_too_long_error(e: HTTPException) -> bool:
        """Return True if the HTTPException is a Bedrock 'Input is too long' error.

        Performs two checks to handle AWS phrasing variations:
        1. Primary: exact substring "input is too long" (case-insensitive)
        2. Secondary: "too long" on a 400 response (catches variants like
           "input text is too long")
        """
        detail = getattr(e, "detail", "") or ""
        detail_str = str(detail).lower()
        if "input is too long" in detail_str:
            return True
        # Catch AWS phrasing variations (e.g. "input text is too long")
        if e.status_code == 400 and "too long" in detail_str:
            return True
        return False

    def _extract_texts_from_messages(
        self, messages: List[AllMessageValues]
    ) -> List[str]:
        """Extract all text content items from a list of messages into a flat list."""
        texts: List[str] = []
        for message in messages:
            content = self.get_content_for_message(message)
            if content:
                texts.extend(content)
        return texts

    async def _make_bedrock_input_request_with_chunking_fallback(
        self,
        messages: List[AllMessageValues],
        request_data: dict,
    ) -> BedrockGuardrailResponse:
        """
        Make a Bedrock INPUT guardrail request with on_input_too_long handling.

        Applies a pre-flight size check to skip the Bedrock round-trip when the
        payload is already known to exceed the per-request limit and chunk mode
        is enabled (Gap 3).

        Behaviour on 'Input is too long' error:
        - fail_closed (default): re-raises the HTTPException
        - fail_open: logs a critical warning and returns an empty response (allow through)
        - chunk: splits texts into chunks and runs each in parallel (Gap 1)
        """
        texts = self._extract_texts_from_messages(messages)
        total_chars = sum(len(t) for t in texts)

        # Pre-flight: skip the Bedrock round-trip when we already know the payload
        # will exceed the limit and chunking is requested.
        if (
            total_chars > self.bedrock_guardrail_max_chunk_size
            and self.on_input_too_long == "chunk"
        ):
            return await self._apply_guardrail_to_chunks(
                texts=texts, request_data=request_data
            )

        try:
            return await self.make_bedrock_api_request(
                source="INPUT", messages=messages, request_data=request_data
            )
        except HTTPException as exc:
            if self._is_input_too_long_error(exc):
                if self.on_input_too_long == "fail_open":
                    verbose_proxy_logger.critical(
                        "Bedrock Guardrail: input too long, fail-open. "
                        "Proceeding without guardrail check. guardrail_name=%s",
                        self.guardrail_name,
                    )
                    return BedrockGuardrailResponse()
                elif self.on_input_too_long == "chunk":
                    return await self._apply_guardrail_to_chunks(
                        texts=texts, request_data=request_data
                    )
                # else: fail_closed — fall through to re-raise
            raise

    def _extract_texts_from_response(self, response: Any) -> List[str]:
        """Extract all text content strings from a ModelResponse's choices."""
        texts: List[str] = []
        if isinstance(response, litellm.ModelResponse):
            for choice in response.choices:
                if isinstance(choice, Choices):
                    if choice.message.content and isinstance(
                        choice.message.content, str
                    ):
                        texts.append(choice.message.content)
        return texts

    async def _make_bedrock_output_request_with_chunking_fallback(
        self,
        response: Any,
        request_data: dict,
    ) -> BedrockGuardrailResponse:
        """
        Make a Bedrock OUTPUT guardrail request with on_input_too_long handling.

        Mirrors ``_make_bedrock_input_request_with_chunking_fallback`` for the
        OUTPUT source so that long model responses are handled gracefully.

        Behaviour on 'Input is too long' (or similar 400) error:
        - fail_closed (default): re-raises the HTTPException
        - fail_open: logs a critical warning and returns an empty response
        - chunk: splits output text into chunks and runs each in parallel (Gap A)
        """
        output_texts = self._extract_texts_from_response(response)
        total_chars = sum(len(t) for t in output_texts)

        # Pre-flight: skip the Bedrock round-trip when we already know the
        # payload will exceed the limit and chunking is requested.
        if (
            total_chars > self.bedrock_guardrail_max_chunk_size
            and self.on_input_too_long == "chunk"
        ):
            return await self._apply_output_guardrail_to_chunks(
                output_texts=output_texts, request_data=request_data
            )

        try:
            return await self.make_bedrock_api_request(
                source="OUTPUT", response=response, request_data=request_data
            )
        except HTTPException as exc:
            if self._is_input_too_long_error(exc):
                if self.on_input_too_long == "fail_open":
                    verbose_proxy_logger.critical(
                        "Bedrock Guardrail: OUTPUT too long, fail-open. "
                        "Proceeding without guardrail check. guardrail_name=%s",
                        self.guardrail_name,
                    )
                    return BedrockGuardrailResponse()
                elif self.on_input_too_long == "chunk":
                    return await self._apply_output_guardrail_to_chunks(
                        output_texts=output_texts, request_data=request_data
                    )
                # else: fail_closed — fall through to re-raise
            raise

    def _split_texts_into_chunks(self, texts: List[str]) -> List[List[str]]:
        """
        Split a list of texts into chunks where total chars per chunk <= max_chunk_size.
        A single text longer than max_chunk_size is split by character boundary.
        """
        chunks: List[List[str]] = []
        current_chunk: List[str] = []
        current_size = 0
        max_size = self.bedrock_guardrail_max_chunk_size

        for text in texts:
            if len(text) > max_size:
                # Flush current chunk first
                if current_chunk:
                    chunks.append(current_chunk)
                    current_chunk, current_size = [], 0
                # Break oversized text into sub-chunks
                for i in range(0, len(text), max_size):
                    chunks.append([text[i : i + max_size]])
            elif current_size + len(text) > max_size:
                chunks.append(current_chunk)
                current_chunk, current_size = [text], len(text)
            else:
                current_chunk.append(text)
                current_size += len(text)

        if current_chunk:
            chunks.append(current_chunk)
        return chunks

    async def _apply_guardrail_to_chunks(
        self,
        texts: List[str],
        request_data: dict,
    ) -> BedrockGuardrailResponse:
        """
        Split texts into chunks and apply the Bedrock guardrail to each chunk in
        parallel, bounded by ``guardrail_max_chunk_concurrency`` (Gap 2/B —
        reduces latency from O(n) to O(1), prevents connection storms).

        In-flight tasks are cancelled as soon as one task raises an exception
        (Gap C — early cancellation avoids wasted Bedrock quota).

        Returns a combined BedrockGuardrailResponse that aggregates outputs and
        assessments from all chunks so masked texts from every chunk are preserved
        for PII/masking workflows (Gap 4).
        """
        chunks: List[List[str]] = self._split_texts_into_chunks(texts)
        verbose_proxy_logger.info(
            "Bedrock Guardrail: chunking input into %d chunk(s) (max_chunk_size=%d), "
            "guardrail_name=%s",
            len(chunks),
            self.bedrock_guardrail_max_chunk_size,
            self.guardrail_name,
        )
        if not chunks:
            return BedrockGuardrailResponse()

        # Warn operator when chunk count is suspiciously high
        if len(chunks) >= _CHUNK_COUNT_WARNING_THRESHOLD:
            verbose_proxy_logger.warning(
                "Bedrock Guardrail: input split into %d chunk(s) "
                "(bedrock_guardrail_max_chunk_size=%d). "
                "If you have a raised AWS Bedrock guardrail quota, increase "
                "bedrock_guardrail_max_chunk_size to match it. guardrail_name=%s",
                len(chunks),
                self.bedrock_guardrail_max_chunk_size,
                self.guardrail_name,
            )

        sem = asyncio.Semaphore(self.guardrail_max_chunk_concurrency)

        async def _call_chunk(chunk_texts: List[str]) -> BedrockGuardrailResponse:
            async with sem:
                chunk_messages: List[AllMessageValues] = [
                    ChatCompletionUserMessage(role="user", content=text)
                    for text in chunk_texts
                ]
                return await self.make_bedrock_api_request(
                    source="INPUT",
                    messages=chunk_messages,
                    request_data=request_data,
                )

        tasks = [asyncio.create_task(_call_chunk(c)) for c in chunks]
        chunk_responses = await self._gather_with_early_cancel(tasks)
        return self._aggregate_input_chunk_responses(chunk_responses)

    async def _apply_output_guardrail_to_chunks(
        self,
        output_texts: List[str],
        request_data: dict,
    ) -> BedrockGuardrailResponse:
        """
        Split output texts into chunks and apply the Bedrock guardrail to each
        chunk in parallel, bounded by ``guardrail_max_chunk_concurrency``.

        Each chunk is wrapped in a synthetic ModelResponse so that
        ``_create_bedrock_output_content_request`` can serialise it correctly.

        In-flight tasks are cancelled as soon as one raises an exception (early
        cancellation, Gap C).  Returns a combined BedrockGuardrailResponse whose
        outputs entries contain the concatenated masked text so that
        ``_apply_masking_to_model_response`` receives a single coherent string.
        """
        chunks: List[List[str]] = self._split_texts_into_chunks(output_texts)
        verbose_proxy_logger.info(
            "Bedrock Guardrail: chunking OUTPUT into %d chunk(s) "
            "(max_chunk_size=%d), guardrail_name=%s",
            len(chunks),
            self.bedrock_guardrail_max_chunk_size,
            self.guardrail_name,
        )
        if not chunks:
            return BedrockGuardrailResponse()

        # Warn when unusually many chunks are needed
        if len(chunks) >= _CHUNK_COUNT_WARNING_THRESHOLD:
            verbose_proxy_logger.warning(
                "Bedrock Guardrail: OUTPUT split into %d chunk(s) "
                "(bedrock_guardrail_max_chunk_size=%d). "
                "If you have a raised AWS Bedrock guardrail quota, increase "
                "bedrock_guardrail_max_chunk_size to match it. guardrail_name=%s",
                len(chunks),
                self.bedrock_guardrail_max_chunk_size,
                self.guardrail_name,
            )

        sem = asyncio.Semaphore(self.guardrail_max_chunk_concurrency)

        async def _call_chunk(chunk_texts: List[str]) -> BedrockGuardrailResponse:
            async with sem:
                # Build a synthetic ModelResponse containing one choice per text
                synthetic_response = litellm.ModelResponse(
                    choices=[
                        Choices(message=Message(content=text, role="assistant"))
                        for text in chunk_texts
                    ]
                )
                return await self.make_bedrock_api_request(
                    source="OUTPUT",
                    response=synthetic_response,
                    request_data=request_data,
                )

        tasks = [asyncio.create_task(_call_chunk(c)) for c in chunks]
        chunk_responses = await self._gather_with_early_cancel(tasks)
        return self._aggregate_output_chunk_responses(chunk_responses)

    async def _gather_with_early_cancel(
        self,
        tasks: List["asyncio.Task[BedrockGuardrailResponse]"],
    ) -> List[BedrockGuardrailResponse]:
        """
        Await all tasks and return their results in the original task order.

        If any task raises an exception, all still-pending tasks are immediately
        cancelled (early-cancel, Gap C) to avoid wasting Bedrock quota, and the
        first exception is re-raised.
        """
        try:
            done, pending = await asyncio.wait(
                tasks, return_when=asyncio.FIRST_EXCEPTION
            )
        except BaseException:
            for t in tasks:
                t.cancel()
            raise

        # Cancel any tasks that are still running (they were pending when a
        # sibling raised an exception)
        for t in pending:
            t.cancel()

        # Surface the first exception from the completed set
        for t in done:
            if not t.cancelled():
                exc = t.exception()
                if exc is not None:
                    raise exc

        # All tasks completed successfully — return results in submission order
        return [t.result() for t in tasks]

    def _aggregate_input_chunk_responses(
        self, responses: List[BedrockGuardrailResponse]
    ) -> BedrockGuardrailResponse:
        """
        Combine per-chunk INPUT responses into a single BedrockGuardrailResponse.

        Extends ``outputs`` and ``assessments`` from all chunks so masking data
        is not discarded (Gap 4).
        """
        combined_outputs: List[BedrockGuardrailOutput] = []
        combined_assessments: List[BedrockGuardrailAssessment] = []
        combined_action: Optional[str] = "NONE"
        for resp in responses:
            combined_outputs.extend(resp.get("outputs") or [])
            combined_assessments.extend(resp.get("assessments") or [])
            if resp.get("action") == "GUARDRAIL_INTERVENED":
                combined_action = "GUARDRAIL_INTERVENED"

        combined: BedrockGuardrailResponse = BedrockGuardrailResponse()
        combined["action"] = combined_action
        combined["outputs"] = combined_outputs
        combined["assessments"] = combined_assessments
        return combined

    def _aggregate_output_chunk_responses(
        self, responses: List[BedrockGuardrailResponse]
    ) -> BedrockGuardrailResponse:
        """
        Combine per-chunk OUTPUT responses into a single BedrockGuardrailResponse.

        For OUTPUT, the masked text parts from all chunks are **concatenated**
        into a single ``BedrockGuardrailOutput`` entry so that
        ``_apply_masking_to_model_response`` receives one reconstructed string
        that maps to the single choice in the original ModelResponse.

        Without this, only the first chunk's masked text would be applied.
        """
        combined_assessments: List[BedrockGuardrailAssessment] = []
        combined_action: Optional[str] = "NONE"
        all_masked_parts: List[str] = []

        for resp in responses:
            combined_assessments.extend(resp.get("assessments") or [])
            if resp.get("action") == "GUARDRAIL_INTERVENED":
                combined_action = "GUARDRAIL_INTERVENED"
            for output in resp.get("outputs") or []:
                text = output.get("text")
                if text is not None:
                    all_masked_parts.append(text)

        combined: BedrockGuardrailResponse = BedrockGuardrailResponse()
        combined["action"] = combined_action
        combined["assessments"] = combined_assessments
        if all_masked_parts:
            concatenated_text = "".join(all_masked_parts)
            combined["outputs"] = [BedrockGuardrailOutput(text=concatenated_text)]
        else:
            combined["outputs"] = []
        return combined

    async def apply_guardrail(
        self,
        inputs: "GenericGuardrailAPIInputs",
        request_data: dict,
        input_type: Literal["request", "response"],
        logging_obj: Optional["LiteLLMLoggingObj"] = None,
    ) -> "GenericGuardrailAPIInputs":
        """
        Apply Bedrock guardrail to a batch of texts for testing purposes.

        This method allows users to test Bedrock guardrails without making actual LLM calls.
        It creates mock messages to test the guardrail functionality.

        Args:
            inputs: Dictionary containing texts and optional images
            request_data: Request data dictionary for logging metadata
            input_type: Whether this is a "request" or "response"
            logging_obj: Optional logging object

        Returns:
            GenericGuardrailAPIInputs - processed_texts may be masked, images unchanged

        Raises:
            Exception: If content is blocked by Bedrock guardrail
        """
        texts = inputs.get("texts", [])
        try:
            verbose_proxy_logger.debug(
                f"Bedrock Guardrail: Applying guardrail to {len(texts)} text(s)"
            )

            masked_texts = []

            if input_type == "response":
                # OUTPUT path: wrap texts in a synthetic ModelResponse and evaluate
                # against the OUTPUT guardrail policy tier (Gap 1).
                if texts:
                    synthetic_response = litellm.ModelResponse(
                        choices=[
                            Choices(message=Message(content=text, role="assistant"))
                            for text in texts
                        ]
                    )
                    bedrock_response = (
                        await self._make_bedrock_output_request_with_chunking_fallback(
                            response=synthetic_response, request_data=request_data
                        )
                    )
                    # Extract any masked text returned by the output guardrail
                    outputs_list = bedrock_response.get("outputs")
                    if outputs_list:
                        for output_item in outputs_list:
                            text_content = output_item.get("text")
                            if text_content:
                                masked_texts.append(str(text_content))
            else:
                # INPUT path (input_type == "request"): existing logic
                mock_messages: List[AllMessageValues] = [
                    ChatCompletionUserMessage(role="user", content=text) for text in texts
                ]

                request_messages = mock_messages
                filter_result = self._prepare_guardrail_messages_for_role(
                    messages=request_messages
                )
                filtered_messages = filter_result.payload_messages or mock_messages

                # Bedrock will throw an error if there is no text to process
                if filtered_messages:
                    # Pre-flight size check: if the payload is already known to
                    # exceed the per-request limit, skip the wasted Bedrock round-trip
                    # and go straight to chunking.
                    total_chars = sum(len(t) for t in texts)
                    if (
                        total_chars > self.bedrock_guardrail_max_chunk_size
                        and self.on_input_too_long == "chunk"
                    ):
                        bedrock_response = await self._apply_guardrail_to_chunks(
                            texts=texts,
                            request_data=request_data,
                        )
                    else:
                        try:
                            bedrock_response = await self.make_bedrock_api_request(
                                source="INPUT",
                                messages=filtered_messages,
                                request_data=request_data,
                            )
                        except HTTPException as exc:
                            if self._is_input_too_long_error(exc):
                                if self.on_input_too_long == "fail_open":
                                    verbose_proxy_logger.critical(
                                        "Bedrock Guardrail: input too long, fail-open. "
                                        "Proceeding without guardrail check. guardrail_name=%s",
                                        self.guardrail_name,
                                    )
                                    return inputs  # pass through unchanged
                                elif self.on_input_too_long == "chunk":
                                    bedrock_response = await self._apply_guardrail_to_chunks(
                                        texts=texts,
                                        request_data=request_data,
                                    )
                                else:
                                    raise  # fail_closed: default, re-raise
                            else:
                                raise

                    # Apply any masking that was applied by the guardrail
                    outputs_list = bedrock_response.get("outputs")
                    if outputs_list:
                        for output_item in outputs_list:
                            text_content = output_item.get("text")
                            if text_content:
                                masked_texts.append(str(text_content))

            # If no outputs were provided, use the original texts
            # This happens when the guardrail allows content without modification
            if not masked_texts:
                masked_texts = texts

            verbose_proxy_logger.debug(
                "Bedrock Guardrail: Successfully applied guardrail"
            )

            inputs["texts"] = masked_texts
            return inputs

        except (HTTPException, GuardrailInterventionNormalStringError):
            # Let guardrail blocking exceptions propagate as-is so the proxy
            # can return the correct HTTP status (400) or handle the
            # GuardrailInterventionNormalStringError for disable_exception_on_block mode.
            # Without this, the generic except below wraps them into a plain
            # Exception, losing the HTTP semantics and preventing the proxy
            # from properly blocking the call.
            raise
        except Exception as e:
            verbose_proxy_logger.error(
                "Bedrock Guardrail: Failed to apply guardrail: %s", str(e)
            )
            raise Exception(f"Bedrock guardrail failed: {str(e)}")
