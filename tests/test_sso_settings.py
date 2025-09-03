import os
import sys
import asyncio
from fastapi import FastAPI
from starlette.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# create dummy mcp modules to avoid optional dependency import errors
import types
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


def _setup_proxy_server_stub():
    proxy_server = types.ModuleType("litellm.proxy.proxy_server")
    config_store = {
        "environment_variables": {
            "GOOGLE_CLIENT_ID": "client",
            "GOOGLE_CLIENT_SECRET": "secret",
        },
        "general_settings": {},
    }

    class DummyProxyConfig:
        async def get_config(self):
            return config_store

        async def save_config(self, new_config):
            config_store.update(new_config)

        def _encrypt_env_variables(self, environment_variables):
            return environment_variables

    proxy_server.proxy_config = DummyProxyConfig()
    proxy_server.master_key = "sk"
    proxy_server.prisma_client = object()
    proxy_server.user_custom_ui_sso_sign_in_handler = None
    proxy_server.premium_user = True
    sys.modules["litellm.proxy.proxy_server"] = proxy_server
    return config_store


def test_sso_key_generate_falls_back_after_clearing_settings():
    config_store = _setup_proxy_server_stub()
    from litellm.types.proxy.management_endpoints.ui_sso import SSOConfig
    from litellm.proxy.ui_crud_endpoints.proxy_setting_endpoints import update_sso_settings
    from litellm.proxy.management_endpoints import ui_sso

    # set up initial SSO env variables
    os.environ["GOOGLE_CLIENT_ID"] = "client"
    os.environ["GOOGLE_CLIENT_SECRET"] = "secret"

    # clear settings using API
    asyncio.run(update_sso_settings(SSOConfig(google_client_id="", google_client_secret="")))

    assert "GOOGLE_CLIENT_ID" not in os.environ
    assert config_store["environment_variables"] == {}

    app = FastAPI()
    app.include_router(ui_sso.router)
    client = TestClient(app)

    response = client.get("/sso/key/generate")
    assert response.status_code == 200
    assert "Login" in response.text


def test_no_provider_selected_when_ids_removed():
    from litellm.proxy.management_endpoints.ui_sso import SSOAuthenticationHandler

    assert SSOAuthenticationHandler.should_use_sso_handler(
        google_client_id="",
        microsoft_client_id="",
        generic_client_id="",
    ) is False
