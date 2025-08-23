from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, Optional

import litellm
from fastapi import status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from litellm.exceptions import RejectedRequestError
from ._types import UserAPIKeyAuth


@dataclass
class ChatCompletionDependencies:
    """Container for dependencies used by the chat completion endpoint."""

    proxy_logging_obj: Any
    llm_router: Any
    general_settings: Dict[str, Any]
    proxy_config: Any
    select_data_generator: Callable[..., Any]
    user_model: Optional[str]
    user_temperature: Optional[float]
    user_request_timeout: Optional[int]
    user_max_tokens: Optional[int]
    user_api_base: Optional[str]
    version: str


def validate_chat_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate incoming request data for chat completions."""
    if not isinstance(data, dict):
        raise ValueError("Invalid request body")
    return data


async def route_chat_request(
    processor: Any,
    request: Any,
    fastapi_response: Any,
    user_api_key_dict: UserAPIKeyAuth,
    model: Optional[str],
    deps: ChatCompletionDependencies,
) -> Any:
    """Route the chat completion request through the processor."""

    return await processor.base_process_llm_request(
        request=request,
        fastapi_response=fastapi_response,
        user_api_key_dict=user_api_key_dict,
        route_type="acompletion",
        proxy_logging_obj=deps.proxy_logging_obj,
        llm_router=deps.llm_router,
        general_settings=deps.general_settings,
        proxy_config=deps.proxy_config,
        select_data_generator=deps.select_data_generator,
        model=model,
        user_model=deps.user_model,
        user_temperature=deps.user_temperature,
        user_request_timeout=deps.user_request_timeout,
        user_max_tokens=deps.user_max_tokens,
        user_api_base=deps.user_api_base,
        version=deps.version,
    )


async def log_chat_completion_error(
    proxy_logging_obj: Any,
    user_api_key_dict: UserAPIKeyAuth,
    error: Exception,
    data: Dict[str, Any],
) -> None:
    """Log a chat completion error."""

    await proxy_logging_obj.post_call_failure_hook(
        user_api_key_dict=user_api_key_dict,
        original_exception=error,
        request_data=data,
    )


def format_chat_completion_response(result: Any) -> Any:
    """Format the response returned by the processor."""
    if isinstance(result, BaseModel):
        return result.model_dump(exclude_none=True, exclude_unset=True)
    return result


async def handle_rejected_request(
    error: RejectedRequestError,
    data: Dict[str, Any],
    user_api_key_dict: UserAPIKeyAuth,
    select_data_generator: Callable[..., Any],
) -> Any:
    """Handle a rejected request by returning an error response."""

    _chat_response = litellm.ModelResponse()
    _chat_response.choices[0].message.content = error.message  # type: ignore

    if data.get("stream", False) is True:
        _iterator = litellm.utils.ModelResponseIterator(
            model_response=_chat_response, convert_to_delta=True
        )
        _streaming_response = litellm.CustomStreamWrapper(
            completion_stream=_iterator,
            model=data.get("model", ""),
            custom_llm_provider="cached_response",
            logging_obj=data.get("litellm_logging_obj", None),
        )
        selected_data_generator = select_data_generator(
            response=_streaming_response,
            user_api_key_dict=user_api_key_dict,
            request_data=data,
        )
        return StreamingResponse(
            selected_data_generator,
            media_type="text/event-stream",
            status_code=(
                error.status_code
                if hasattr(error, "status_code")
                else status.HTTP_400_BAD_REQUEST
            ),
        )

    _usage = litellm.Usage(prompt_tokens=0, completion_tokens=0, total_tokens=0)
    _chat_response.usage = _usage  # type: ignore
    return _chat_response
