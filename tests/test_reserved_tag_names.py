import sys
import types
import asyncio
import os
import pytest
from fastapi import HTTPException

# Ensure local package is used
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Stub proxy_server before importing new_tag
proxy_server = types.ModuleType("litellm.proxy.proxy_server")
proxy_server.llm_router = object()
proxy_server.prisma_client = object()
sys.modules["litellm.proxy.proxy_server"] = proxy_server

from litellm.proxy.management_endpoints.tag_management_endpoints import new_tag
from litellm.types.tag_management import TagNewRequest
from litellm.proxy._types import UserAPIKeyAuth
import litellm


def test_rejects_internal_health_tag():
    with pytest.raises(HTTPException) as exc:
        asyncio.run(
            new_tag(
                TagNewRequest(name="litellm-internal-health-check"),
                UserAPIKeyAuth(user_id="u1"),
            )
        )
    assert exc.value.status_code == 400


def test_rejects_user_agent_prefix():
    with pytest.raises(HTTPException) as exc:
        asyncio.run(
            new_tag(
                TagNewRequest(name="User-Agent: bad"),
                UserAPIKeyAuth(user_id="u1"),
            )
        )
    assert exc.value.status_code == 400


def test_rejects_extra_header_prefix(monkeypatch):
    monkeypatch.setattr(litellm, "extra_spend_tag_headers", ["X-Test"])
    with pytest.raises(HTTPException) as exc:
        asyncio.run(
            new_tag(
                TagNewRequest(name="X-Test: value"),
                UserAPIKeyAuth(user_id="u1"),
            )
        )
    assert exc.value.status_code == 400
