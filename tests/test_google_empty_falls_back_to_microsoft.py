import os
import sys
import types
import asyncio

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

from litellm.proxy.management_endpoints.ui_sso import SSOAuthenticationHandler


def test_empty_google_credentials_use_microsoft(monkeypatch):
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "")
    monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "")
    monkeypatch.setenv("MICROSOFT_CLIENT_ID", "client")
    monkeypatch.setenv("MICROSOFT_CLIENT_SECRET", "secret")
    monkeypatch.setenv("MICROSOFT_TENANT", "tenant")

    microsoft_called = {"value": False}

    class DummyMicrosoftSSO:
        def __init__(self, client_id, client_secret, tenant, redirect_uri, allow_insecure_http=True):
            pass

        async def get_login_redirect(self, state=None):
            microsoft_called["value"] = True
            class DummyResponse:
                status_code = 307
            return DummyResponse()

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

    class DummyGoogleSSO:
        def __init__(self, *args, **kwargs):
            raise AssertionError("GoogleSSO should not be used")

        def __enter__(self):
            return self

        def __exit__(self, *args):
            pass

    monkeypatch.setattr("fastapi_sso.sso.microsoft.MicrosoftSSO", DummyMicrosoftSSO)
    monkeypatch.setattr("fastapi_sso.sso.google.GoogleSSO", DummyGoogleSSO)

    response = asyncio.run(
        SSOAuthenticationHandler.get_sso_login_redirect(
            redirect_url="http://localhost/sso/callback",
            microsoft_client_id=os.getenv("MICROSOFT_CLIENT_ID"),
            google_client_id=os.getenv("GOOGLE_CLIENT_ID"),
        )
    )

    assert microsoft_called["value"] is True
    assert response.status_code == 307
