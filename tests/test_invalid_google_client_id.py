import os
import sys
import types
import asyncio
import pytest
from fastapi import HTTPException, status
from starlette.requests import Request

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# create dummy mcp modules to avoid optional dependency import errors
mcp_module = types.ModuleType("mcp")
mcp_module.__path__ = []  # mark as package
mcp_module.ClientSession = object
mcp_module.StdioServerParameters = object
sys.modules.setdefault("mcp", mcp_module)
sys.modules.setdefault("mcp.client", types.ModuleType("mcp.client"))
sys.modules.setdefault("mcp.client.streamable_http", types.ModuleType("mcp.client.streamable_http"))
mcp_types_module = types.ModuleType("mcp.types")
mcp_types_module.CallToolRequestParams = object  # dummy attribute
mcp_types_module.CallToolResult = object
mcp_types_module.Tool = object
sys.modules.setdefault("mcp.types", mcp_types_module)

from oauthlib.oauth2.rfc6749.errors import InvalidClientIdError
from fastapi_sso.sso.google import GoogleSSO

async def _mock_verify_and_process(self, request, convert_response=True):
    raise InvalidClientIdError()

# patch before importing GoogleSSOHandler
_original_verify_and_process = GoogleSSO.verify_and_process
GoogleSSO.verify_and_process = _mock_verify_and_process

from litellm.proxy.management_endpoints.ui_sso import (
    GoogleSSOHandler,
    ProxyException,
    auth_callback,
)


def test_invalid_google_client_id_returns_clear_error():
    os.environ["GOOGLE_CLIENT_SECRET"] = "secret"

    request = Request(scope={"type": "http", "headers": []})

    async def _call():
        await GoogleSSOHandler.get_google_callback_response(
            request=request,
            google_client_id="bad_id",
            redirect_url="http://localhost/callback",
        )

    with pytest.raises(ProxyException) as exc:
        asyncio.run(_call())

    assert "GOOGLE_CLIENT_ID" in exc.value.message
    assert exc.value.code == str(status.HTTP_400_BAD_REQUEST)

    # restore original
    GoogleSSO.verify_and_process = _original_verify_and_process


def test_auth_callback_requires_google_env_vars():
    GoogleSSO.verify_and_process = _original_verify_and_process

    proxy_server = types.ModuleType("litellm.proxy.proxy_server")
    proxy_server.general_settings = {}
    proxy_server.jwt_handler = object()
    proxy_server.master_key = "sk"
    proxy_server.prisma_client = object()
    proxy_server.user_api_key_cache = object()
    sys.modules["litellm.proxy.proxy_server"] = proxy_server

    os.environ["GOOGLE_CLIENT_ID"] = ""
    os.environ["GOOGLE_CLIENT_SECRET"] = ""

    request = Request(scope={"type": "http", "headers": []})

    async def _call():
        await auth_callback(request)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(_call())

    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "GOOGLE_CLIENT_ID" not in exc.value.detail
