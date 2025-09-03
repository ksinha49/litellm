import os
import sys
import types
import asyncio
import pytest
from fastapi import status
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
from fastapi_sso.sso.microsoft import MicrosoftSSO


async def _mock_verify_and_process(self, request, convert_response=True):
    raise InvalidClientIdError()


_original_verify_and_process = MicrosoftSSO.verify_and_process
MicrosoftSSO.verify_and_process = _mock_verify_and_process

from litellm.proxy.management_endpoints.ui_sso import MicrosoftSSOHandler, ProxyException


def test_invalid_microsoft_client_id_returns_clear_error():
    os.environ["MICROSOFT_CLIENT_SECRET"] = "secret"
    os.environ["MICROSOFT_TENANT"] = "tenant"

    request = Request(scope={"type": "http", "headers": []})

    async def _call():
        await MicrosoftSSOHandler.get_microsoft_callback_response(
            request=request,
            microsoft_client_id="bad_id",
            redirect_url="http://localhost/callback",
        )

    with pytest.raises(ProxyException) as exc:
        asyncio.run(_call())

    assert "MICROSOFT_CLIENT_ID" in exc.value.message
    assert exc.value.code == str(status.HTTP_400_BAD_REQUEST)

    MicrosoftSSO.verify_and_process = _original_verify_and_process

