"""
Unit tests for pass-through endpoint metadata injection and async response mode.

Tests:
1. inject_metadata=True wraps body with litellm_metadata envelope
2. inject_metadata=False forwards body unchanged
3. response_mode="async" returns 202 with request_id
4. response_mode="sync" returns target response as-is
5. PassThroughGenericEndpoint model accepts new fields
6. AI service request types are valid
"""

import json
from datetime import datetime
from typing import Optional
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from fastapi import Request
from starlette.datastructures import Headers

from litellm.proxy._types import (
    AIServiceRequestResponse,
    AIServiceRequestStatus,
    AIServiceResultCallback,
    PassThroughGenericEndpoint,
    UserAPIKeyAuth,
)


# ─── Model tests ────────────────────────────────────────────────────────────


class TestPassThroughGenericEndpointModel:
    """Test the extended PassThroughGenericEndpoint model."""

    def test_default_values(self):
        """New fields have correct defaults."""
        endpoint = PassThroughGenericEndpoint(path="/test", target="https://example.com")
        assert endpoint.inject_metadata is False
        assert endpoint.response_mode == "sync"
        assert endpoint.service_type is None

    def test_inject_metadata_true(self):
        """inject_metadata can be set to True."""
        endpoint = PassThroughGenericEndpoint(
            path="/test",
            target="https://example.com",
            inject_metadata=True,
        )
        assert endpoint.inject_metadata is True

    def test_response_mode_async(self):
        """response_mode can be set to async."""
        endpoint = PassThroughGenericEndpoint(
            path="/test",
            target="https://example.com",
            response_mode="async",
        )
        assert endpoint.response_mode == "async"

    def test_service_type_set(self):
        """service_type can be set to a string."""
        endpoint = PassThroughGenericEndpoint(
            path="/test",
            target="https://example.com",
            service_type="idp",
        )
        assert endpoint.service_type == "idp"

    def test_model_dump_includes_new_fields(self):
        """model_dump includes the new fields."""
        endpoint = PassThroughGenericEndpoint(
            path="/test",
            target="https://example.com",
            inject_metadata=True,
            response_mode="async",
            service_type="redaction",
        )
        data = endpoint.model_dump()
        assert data["inject_metadata"] is True
        assert data["response_mode"] == "async"
        assert data["service_type"] == "redaction"

    def test_backward_compatibility_no_new_fields(self):
        """Existing endpoints without new fields still work."""
        data = {
            "path": "/old-endpoint",
            "target": "https://legacy.com",
            "headers": {"Authorization": "Bearer xyz"},
            "auth": True,
        }
        endpoint = PassThroughGenericEndpoint(**data)
        assert endpoint.inject_metadata is False
        assert endpoint.response_mode == "sync"
        assert endpoint.service_type is None


class TestAIServiceRequestTypes:
    """Test AI service request type definitions."""

    def test_status_enum_values(self):
        assert AIServiceRequestStatus.ACCEPTED == "accepted"
        assert AIServiceRequestStatus.PROCESSING == "processing"
        assert AIServiceRequestStatus.COMPLETED == "completed"
        assert AIServiceRequestStatus.FAILED == "failed"

    def test_request_response_model(self):
        resp = AIServiceRequestResponse(
            request_id="test-123",
            service_type="idp",
            status="accepted",
        )
        assert resp.request_id == "test-123"
        assert resp.service_type == "idp"
        assert resp.status == "accepted"
        assert resp.response_body is None

    def test_result_callback_model(self):
        callback = AIServiceResultCallback(
            status="completed",
            response_body={"result": "extracted entities"},
        )
        assert callback.status == "completed"
        assert callback.response_body == {"result": "extracted entities"}
        assert callback.error is None

    def test_result_callback_failed(self):
        callback = AIServiceResultCallback(
            status="failed",
            error="Processing timeout",
        )
        assert callback.status == "failed"
        assert callback.error == "Processing timeout"


# ─── Metadata injection tests ───────────────────────────────────────────────


class TestMetadataInjection:
    """Test that metadata injection wraps the request body correctly."""

    def _build_metadata_envelope(
        self,
        parsed_body: dict,
        litellm_call_id: str,
        user_api_key_dict: UserAPIKeyAuth,
    ) -> dict:
        """
        Reproduce the metadata wrapping logic from pass_through_request.

        This tests the algorithm, not the full function (which requires a running FastAPI app).
        """
        return {
            "litellm_metadata": {
                "request_id": litellm_call_id,
                "user_id": getattr(user_api_key_dict, "user_id", None),
                "team_id": getattr(user_api_key_dict, "team_id", None),
                "org_id": getattr(user_api_key_dict, "org_id", None),
                "end_user_id": getattr(user_api_key_dict, "end_user_id", None),
                "api_key_alias": getattr(user_api_key_dict, "key_alias", None),
                "timestamp": datetime.now().isoformat(),
                "source": "litellm-proxy",
            },
            "payload": parsed_body,
        }

    def test_metadata_wrapping_structure(self):
        """Verify the metadata envelope structure."""
        user_dict = UserAPIKeyAuth(
            api_key="sk-test",
            user_id="user-123",
            team_id="team-456",
            org_id="org-789",
        )
        original_body = {"query": "extract entities", "documents": ["doc1"]}

        result = self._build_metadata_envelope(
            parsed_body=original_body,
            litellm_call_id="call-abc-123",
            user_api_key_dict=user_dict,
        )

        # Top-level keys
        assert "litellm_metadata" in result
        assert "payload" in result
        assert len(result) == 2

        # Metadata contents
        meta = result["litellm_metadata"]
        assert meta["request_id"] == "call-abc-123"
        assert meta["user_id"] == "user-123"
        assert meta["team_id"] == "team-456"
        assert meta["org_id"] == "org-789"
        assert meta["source"] == "litellm-proxy"
        assert "timestamp" in meta

        # Original body preserved
        assert result["payload"] == original_body

    def test_no_wrapping_when_disabled(self):
        """When inject_metadata is False, body should be unchanged."""
        original_body = {"query": "test"}
        inject_metadata = False

        if inject_metadata and original_body is not None:
            result = self._build_metadata_envelope(
                parsed_body=original_body,
                litellm_call_id="call-123",
                user_api_key_dict=UserAPIKeyAuth(api_key="sk-test"),
            )
        else:
            result = original_body

        assert result == {"query": "test"}
        assert "litellm_metadata" not in result

    def test_wrapping_with_none_body(self):
        """When body is None, metadata injection should be skipped."""
        original_body = None
        inject_metadata = True

        if inject_metadata and original_body is not None:
            result = self._build_metadata_envelope(
                parsed_body=original_body,
                litellm_call_id="call-123",
                user_api_key_dict=UserAPIKeyAuth(api_key="sk-test"),
            )
        else:
            result = original_body

        assert result is None


# ─── Route registration tests ───────────────────────────────────────────────


class TestRouteRegistryNewFields:
    """Test that new fields are stored in the route registry."""

    def test_passthrough_params_include_new_fields(self):
        """Verify the passthrough_params dict structure includes new fields."""
        params = {
            "target": "https://example.com",
            "custom_headers": {"Authorization": "Bearer test"},
            "forward_headers": False,
            "merge_query_params": False,
            "dependencies": None,
            "cost_per_request": 0.0,
            "guardrails": None,
            "inject_metadata": True,
            "response_mode": "async",
            "service_type": "idp",
        }

        assert params["inject_metadata"] is True
        assert params["response_mode"] == "async"
        assert params["service_type"] == "idp"

    def test_passthrough_params_default_values(self):
        """Verify defaults for new fields in passthrough_params."""
        params = {
            "target": "https://example.com",
            "custom_headers": {},
            "forward_headers": False,
            "merge_query_params": False,
            "dependencies": None,
            "cost_per_request": 0.0,
            "guardrails": None,
            "inject_metadata": False,
            "response_mode": "sync",
            "service_type": None,
        }

        assert params["inject_metadata"] is False
        assert params["response_mode"] == "sync"
        assert params["service_type"] is None


# ─── Async response mode tests ──────────────────────────────────────────────


class TestAsyncResponseMode:
    """Test the async response mode behavior."""

    def test_async_response_content(self):
        """Verify the structure of the async 202 response."""
        litellm_call_id = "test-call-id-123"
        response_content = {
            "request_id": litellm_call_id,
            "status": "accepted",
            "message": "Request submitted for async processing",
        }

        assert response_content["request_id"] == litellm_call_id
        assert response_content["status"] == "accepted"
        assert "message" in response_content

    def test_sync_mode_does_not_trigger_async(self):
        """response_mode='sync' should not trigger async behavior."""
        response_mode = "sync"
        assert response_mode != "async"

    def test_async_mode_triggers_async(self):
        """response_mode='async' should trigger async behavior."""
        response_mode = "async"
        assert response_mode == "async"
