import asyncio
import types
import sys
import pytest
from fastapi import FastAPI, APIRouter
from httpx import AsyncClient, ASGITransport
from pydantic import BaseModel

sys.modules.setdefault("mcp", types.ModuleType("mcp"))
sys.modules.setdefault("mcp.client", types.ModuleType("mcp.client"))
sys.modules.setdefault("mcp.client.streamable_http", types.ModuleType("mcp.client.streamable_http"))
mcp_types_mod = types.ModuleType("mcp.types")
setattr(mcp_types_mod, "CallToolRequestParams", object)
setattr(mcp_types_mod, "CallToolResult", object)
sys.modules.setdefault("mcp.types", mcp_types_mod)
fake_rest = types.ModuleType("litellm.proxy._experimental.mcp_server.rest_endpoints")
fake_rest.router = APIRouter()
sys.modules["litellm.proxy._experimental.mcp_server.rest_endpoints"] = fake_rest
fake_manager = types.ModuleType(
    "litellm.proxy._experimental.mcp_server.mcp_server_manager"
)
fake_manager.global_mcp_server_manager = None
sys.modules["litellm.proxy._experimental.mcp_server.mcp_server_manager"] = fake_manager

from litellm.proxy.proxy_server import (
    chat_completion,
    get_chat_completion_dependencies,
    ProxyBaseLLMRequestProcessing,
    user_api_key_auth,
)
from litellm.proxy.chat_completion_helpers import ChatCompletionDependencies
from litellm.proxy._types import UserAPIKeyAuth


class DummyProcessor:
    def __init__(self, data):
        self.data = data

    async def base_process_llm_request(self, **kwargs):
        class DummyResponse(BaseModel):
            ok: bool

        return DummyResponse(ok=True)

    async def _handle_llm_api_exception(self, **kwargs):
        raise kwargs["e"]

def test_chat_completion_endpoint(monkeypatch):
    app = FastAPI()
    app.post("/chat/completions")(chat_completion)

    app.dependency_overrides[get_chat_completion_dependencies] = lambda: ChatCompletionDependencies(
        proxy_logging_obj=None,
        llm_router=None,
        general_settings={},
        proxy_config=None,
        select_data_generator=lambda **kwargs: kwargs["response"],
        user_model=None,
        user_temperature=None,
        user_request_timeout=None,
        user_max_tokens=None,
        user_api_base=None,
        version="test",
    )
    app.dependency_overrides[user_api_key_auth] = lambda: UserAPIKeyAuth()

    monkeypatch.setattr(
        "litellm.proxy.proxy_server.ProxyBaseLLMRequestProcessing", DummyProcessor
    )

    async def _make_request():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            return await client.post(
                "/chat/completions",
                json={"model": "m", "messages": [{"role": "user", "content": "hi"}]},
            )

    resp = asyncio.run(_make_request())
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}
