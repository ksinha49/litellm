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
