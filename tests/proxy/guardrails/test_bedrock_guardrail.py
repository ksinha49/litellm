import asyncio
import json
import sys
from pathlib import Path
from types import SimpleNamespace
from typing import Optional
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from litellm.proxy.guardrails.guardrail_hooks.bedrock_guardrails import BedrockGuardrail


class MockResponse:
    def __init__(
        self,
        status_code: int,
        payload,
        *,
        text: Optional[str] = None,
        json_exc: Optional[Exception] = None,
    ):
        self.status_code = status_code
        self._payload = payload
        self._json_exc = json_exc
        self.text = text if text is not None else json.dumps(payload)

    def json(self):
        if self._json_exc is not None:
            raise self._json_exc
        return self._payload


@pytest.fixture
def patched_guardrail(monkeypatch):
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "test-access-key")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "test-secret-key")

    monkeypatch.setattr(
        BedrockGuardrail,
        "_load_credentials",
        lambda self: (None, "us-east-1"),
    )

    def _fake_prepare(
        self,
        credentials,
        data,
        optional_params,
        aws_region_name,
        api_key=None,
        extra_headers=None,
    ):
        return SimpleNamespace(url="https://example.com", headers={}, body=b"{}")

    monkeypatch.setattr(BedrockGuardrail, "_prepare_request", _fake_prepare)

    guardrail = BedrockGuardrail(
        guardrailIdentifier="guardrail-id",
        guardrailVersion="1",
        aws_region_name="us-west-2",
    )
    return guardrail


def test_bedrock_guardrail_missing_required_fields(monkeypatch):
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "test-access-key")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "test-secret-key")

    with pytest.raises(ValueError) as exc_info:
        BedrockGuardrail(guardrailVersion="1", aws_region_name="us-west-2")

    assert "guardrailIdentifier" in str(exc_info.value)


def test_bedrock_guardrail_region_from_environment(monkeypatch):
    monkeypatch.delenv("AWS_REGION_NAME", raising=False)
    monkeypatch.setenv("AWS_REGION", "us-east-2")

    guardrail = BedrockGuardrail(
        guardrailIdentifier="guardrail-id", guardrailVersion="1"
    )

    assert guardrail.optional_params["aws_region_name"] == "us-east-2"


def test_bedrock_guardrail_allows_default_metadata_credentials(monkeypatch):
    monkeypatch.delenv("AWS_ACCESS_KEY_ID", raising=False)
    monkeypatch.delenv("AWS_SECRET_ACCESS_KEY", raising=False)
    monkeypatch.delenv("AWS_SESSION_TOKEN", raising=False)
    monkeypatch.delenv("AWS_PROFILE", raising=False)
    monkeypatch.delenv("AWS_DEFAULT_PROFILE", raising=False)
    monkeypatch.delenv("AWS_ROLE_ARN", raising=False)
    monkeypatch.delenv("AWS_WEB_IDENTITY_TOKEN_FILE", raising=False)
    monkeypatch.delenv("AWS_EC2_METADATA_DISABLED", raising=False)

    guardrail = BedrockGuardrail(
        guardrailIdentifier="guardrail-id",
        guardrailVersion="1",
        aws_region_name="us-west-2",
    )

    assert guardrail.guardrailIdentifier == "guardrail-id"


def test_bedrock_guardrail_metadata_disabled_does_not_raise(monkeypatch):
    monkeypatch.delenv("AWS_ACCESS_KEY_ID", raising=False)
    monkeypatch.delenv("AWS_SECRET_ACCESS_KEY", raising=False)
    monkeypatch.delenv("AWS_SESSION_TOKEN", raising=False)
    monkeypatch.delenv("AWS_PROFILE", raising=False)
    monkeypatch.delenv("AWS_DEFAULT_PROFILE", raising=False)
    monkeypatch.delenv("AWS_ROLE_ARN", raising=False)
    monkeypatch.delenv("AWS_WEB_IDENTITY_TOKEN_FILE", raising=False)
    monkeypatch.setenv("AWS_EC2_METADATA_DISABLED", "true")

    guardrail = BedrockGuardrail(
        guardrailIdentifier="guardrail-id",
        guardrailVersion="1",
        aws_region_name="us-west-2",
    )

    assert guardrail.guardrailIdentifier == "guardrail-id"


def test_make_bedrock_api_request_raises_forbidden(patched_guardrail):
    guardrail = patched_guardrail
    logging_mock = MagicMock()
    guardrail.add_standard_logging_guardrail_information_to_request_data = logging_mock

    response_payload = {"message": "Access denied"}
    guardrail.async_handler.post = AsyncMock(return_value=MockResponse(403, response_payload))

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(
            guardrail.make_bedrock_api_request(
                source="INPUT",
                messages=[],
                request_data={},
            )
        )

    assert exc_info.value.status_code == 403
    assert "bedrock:ApplyGuardrail" in exc_info.value.detail["error"]
    logging_mock.assert_called_once()
    assert logging_mock.call_args.kwargs["guardrail_status"] == "failure"


def test_make_bedrock_api_request_raises_server_error(patched_guardrail):
    guardrail = patched_guardrail
    logging_mock = MagicMock()
    guardrail.add_standard_logging_guardrail_information_to_request_data = logging_mock

    response_payload = {"message": "Internal error"}
    guardrail.async_handler.post = AsyncMock(return_value=MockResponse(500, response_payload))

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(
            guardrail.make_bedrock_api_request(
                source="INPUT",
                messages=[],
                request_data={},
            )
        )

    assert exc_info.value.status_code == 500
    assert "status 500" in exc_info.value.detail["error"]
    assert exc_info.value.detail["aws_response"] == response_payload
    logging_mock.assert_called_once()
    assert logging_mock.call_args.kwargs["guardrail_status"] == "failure"


def test_make_bedrock_api_request_raises_on_json_decode_failure(patched_guardrail):
    guardrail = patched_guardrail
    logging_mock = MagicMock()
    guardrail.add_standard_logging_guardrail_information_to_request_data = logging_mock

    json_error = json.JSONDecodeError("Expecting value", "", 0)
    mock_response = MockResponse(
        200,
        payload={},
        text="<html>Service unavailable</html>",
        json_exc=json_error,
    )
    guardrail.async_handler.post = AsyncMock(return_value=mock_response)

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(
            guardrail.make_bedrock_api_request(
                source="INPUT",
                messages=[],
                request_data={},
            )
        )

    assert exc_info.value.status_code == 500
    assert "Failed to decode" in exc_info.value.detail["error"]
    assert exc_info.value.detail["aws_response"] == mock_response.text
    logging_mock.assert_called_once()
    assert logging_mock.call_args.kwargs["guardrail_status"] == "failure"


def test_make_bedrock_api_request_logs_detection(patched_guardrail):
    guardrail = patched_guardrail
    logging_mock = MagicMock()
    guardrail.add_standard_logging_guardrail_information_to_request_data = logging_mock

    response_payload = {
        "action": "NONE",
        "assessments": [
            {
                "sensitiveInformationPolicy": {
                    "piiEntities": [
                        {"match": "john.doe@example.com", "action": "ANONYMIZED"}
                    ]
                }
            }
        ],
    }

    guardrail.async_handler.post = AsyncMock(
        return_value=MockResponse(200, response_payload)
    )

    result = asyncio.run(
        guardrail.make_bedrock_api_request(
            source="INPUT",
            messages=[{"role": "user", "content": "hello"}],
            request_data={"metadata": {}},
        )
    )

    logging_mock.assert_called_once()
    assert logging_mock.call_args.kwargs["guardrail_detected"] is True
    logged_response = logging_mock.call_args.kwargs["guardrail_json_response"]
    assert isinstance(logged_response, dict)
    assert logged_response.get("detected") is True
    assert result.get("detected") is True


def test_make_bedrock_api_request_logs_assessment_details(patched_guardrail):
    """Test that assessment details are properly included in the logging information."""
    guardrail = patched_guardrail
    logging_mock = MagicMock()
    guardrail.add_standard_logging_guardrail_information_to_request_data = logging_mock

    response_payload = {
        "action": "GUARDRAIL_INTERVENED",
        "actionReason": "Content policy violation detected",
        "assessments": [
            {
                "topicPolicy": {
                    "topics": [
                        {
                            "name": "Investment Advice",
                            "type": "DENY",
                            "action": "BLOCKED",
                            "detected": True
                        }
                    ]
                },
                "sensitiveInformationPolicy": {
                    "piiEntities": [
                        {
                            "match": "test@example.com",
                            "type": "EMAIL",
                            "action": "ANONYMIZED"
                        }
                    ]
                },
                "contentPolicy": {
                    "filters": [
                        {
                            "type": "HATE",
                            "action": "BLOCKED",
                            "confidence": "HIGH",
                            "detected": True,
                            "filterStrength": "MEDIUM"
                        }
                    ]
                }
            }
        ],
        "guardrailCoverage": {
            "textCharacters": {
                "guarded": 50,
                "total": 50
            },
            "images": {
                "guarded": 0,
                "total": 0
            }
        },
        "outputs": [
            {"text": "I can't provide investment advice."}
        ],
        "usage": {
            "topicPolicyUnits": 1,
            "contentPolicyUnits": 1,
            "sensitiveInformationPolicyUnits": 1,
            "sensitiveInformationPolicyFreeUnits": 0,
            "contextualGroundingPolicyUnits": 0
        }
    }

    guardrail.async_handler.post = AsyncMock(
        return_value=MockResponse(200, response_payload)
    )

    result = asyncio.run(
        guardrail.make_bedrock_api_request(
            source="INPUT",
            messages=[{"role": "user", "content": "Give me investment advice on crypto"}],
            request_data={"metadata": {}},
        )
    )

    # Verify logging was called with all new fields
    logging_mock.assert_called_once()
    call_kwargs = logging_mock.call_args.kwargs

    # Check that assessment_details is included and properly structured
    assert "assessment_details" in call_kwargs
    assessment_details = call_kwargs["assessment_details"]
    assert isinstance(assessment_details, list)
    assert len(assessment_details) == 1

    # Verify the assessment structure is preserved
    assessment = assessment_details[0]
    assert "topicPolicy" in assessment
    assert "sensitiveInformationPolicy" in assessment
    assert "contentPolicy" in assessment

    # Verify topic policy details
    topic_policy = assessment["topicPolicy"]
    assert len(topic_policy["topics"]) == 1
    assert topic_policy["topics"][0]["name"] == "Investment Advice"
    assert topic_policy["topics"][0]["action"] == "BLOCKED"

    # Verify content policy details
    content_policy = assessment["contentPolicy"]
    assert len(content_policy["filters"]) == 1
    assert content_policy["filters"][0]["type"] == "HATE"
    assert content_policy["filters"][0]["action"] == "BLOCKED"
    assert content_policy["filters"][0]["confidence"] == "HIGH"

    # Verify PII redaction is applied in assessment details
    pii_entities = assessment["sensitiveInformationPolicy"]["piiEntities"]
    assert pii_entities[0]["match"] == "[REDACTED]"

    # Verify guardrail_coverage is included
    assert "guardrail_coverage" in call_kwargs
    coverage = call_kwargs["guardrail_coverage"]
    assert isinstance(coverage, dict)
    assert coverage["textCharacters"]["guarded"] == 50
    assert coverage["textCharacters"]["total"] == 50
    assert coverage["images"]["guarded"] == 0

    # Verify guardrail_outputs is included
    assert "guardrail_outputs" in call_kwargs
    outputs = call_kwargs["guardrail_outputs"]
    assert isinstance(outputs, list)
    assert len(outputs) == 1
    assert outputs[0]["text"] == "I can't provide investment advice."

    # Verify guardrail_usage is included
    assert "guardrail_usage" in call_kwargs
    usage = call_kwargs["guardrail_usage"]
    assert isinstance(usage, dict)
    assert usage["topicPolicyUnits"] == 1
    assert usage["contentPolicyUnits"] == 1
    assert usage["sensitiveInformationPolicyUnits"] == 1

    # Verify action_reason is included
    assert "action_reason" in call_kwargs
    assert call_kwargs["action_reason"] == "Content policy violation detected"

    # Verify other standard fields are still present
    assert call_kwargs["guardrail_detected"] is True
    assert call_kwargs["guardrail_status"] == "success"


def test_make_bedrock_api_request_logs_no_assessment_details_when_none(patched_guardrail):
    """Test that assessment_details is None when no assessments are present."""
    guardrail = patched_guardrail
    logging_mock = MagicMock()
    guardrail.add_standard_logging_guardrail_information_to_request_data = logging_mock

    response_payload = {
        "action": "NONE",
        "outputs": [
            {"text": "This is a safe response."}
        ]
    }

    guardrail.async_handler.post = AsyncMock(
        return_value=MockResponse(200, response_payload)
    )

    result = asyncio.run(
        guardrail.make_bedrock_api_request(
            source="INPUT",
            messages=[{"role": "user", "content": "Hello"}],
            request_data={"metadata": {}},
        )
    )

    # Verify logging was called with assessment_details as None
    logging_mock.assert_called_once()
    call_kwargs = logging_mock.call_args.kwargs

    # Check that all detailed fields are None when no assessments or other details
    assert "assessment_details" in call_kwargs
    assert call_kwargs["assessment_details"] is None

    assert "guardrail_coverage" in call_kwargs
    assert call_kwargs["guardrail_coverage"] is None

    assert "guardrail_outputs" in call_kwargs
    assert call_kwargs["guardrail_outputs"][0]["text"] == "This is a safe response."  # outputs should still be present

    assert "guardrail_usage" in call_kwargs
    assert call_kwargs["guardrail_usage"] is None

    assert "action_reason" in call_kwargs
    assert call_kwargs["action_reason"] is None

    # Verify other standard fields are still present
    assert call_kwargs["guardrail_detected"] is False
    assert call_kwargs["guardrail_status"] == "success"


def test_make_bedrock_api_request_handles_minimal_response(patched_guardrail):
    """Test that the code handles minimal Bedrock responses gracefully."""
    guardrail = patched_guardrail
    logging_mock = MagicMock()
    guardrail.add_standard_logging_guardrail_information_to_request_data = logging_mock

    # Minimal response from Bedrock (just action field)
    response_payload = {
        "action": "NONE"
    }

    guardrail.async_handler.post = AsyncMock(
        return_value=MockResponse(200, response_payload)
    )

    result = asyncio.run(
        guardrail.make_bedrock_api_request(
            source="INPUT",
            messages=[{"role": "user", "content": "Hello"}],
            request_data={"metadata": {}},
        )
    )

    # Verify logging was called and all detailed fields are None when not present
    logging_mock.assert_called_once()
    call_kwargs = logging_mock.call_args.kwargs

    # All detailed fields should be None when not in response
    assert call_kwargs["assessment_details"] is None
    assert call_kwargs["guardrail_coverage"] is None
    assert call_kwargs["guardrail_outputs"] is None
    assert call_kwargs["guardrail_usage"] is None
    assert call_kwargs["action_reason"] is None

    # Standard fields should still work
    assert call_kwargs["guardrail_detected"] is False
    assert call_kwargs["guardrail_status"] == "success"

    # The response should still be processed correctly
    assert result.get("action") == "NONE"


def test_make_bedrock_api_request_logs_partial_data(patched_guardrail):
    """Test that the code handles partial Bedrock responses with only some fields present."""
    guardrail = patched_guardrail
    logging_mock = MagicMock()
    guardrail.add_standard_logging_guardrail_information_to_request_data = logging_mock

    # Partial response - only has usage and action, no assessments
    response_payload = {
        "action": "NONE",
        "usage": {
            "topicPolicyUnits": 2,
            "contentPolicyUnits": 0
        }
    }

    guardrail.async_handler.post = AsyncMock(
        return_value=MockResponse(200, response_payload)
    )

    result = asyncio.run(
        guardrail.make_bedrock_api_request(
            source="INPUT",
            messages=[{"role": "user", "content": "Hello world"}],
            request_data={"metadata": {}},
        )
    )

    # Verify logging was called
    logging_mock.assert_called_once()
    call_kwargs = logging_mock.call_args.kwargs

    # Some fields should be None, others should have data
    assert call_kwargs["assessment_details"] is None
    assert call_kwargs["guardrail_coverage"] is None
    assert call_kwargs["guardrail_outputs"] is None
    assert call_kwargs["action_reason"] is None

    # Usage should be present
    assert call_kwargs["guardrail_usage"] is not None
    assert call_kwargs["guardrail_usage"]["topicPolicyUnits"] == 2
    assert call_kwargs["guardrail_usage"]["contentPolicyUnits"] == 0

    # Standard fields should work
    assert call_kwargs["guardrail_detected"] is False
    assert call_kwargs["guardrail_status"] == "success"
