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

from litellm.proxy._types import LitellmUserRoles, LiteLLM_UserTable, SSOUserDefinedValues
from litellm.proxy.management_endpoints import ui_sso


def test_existing_internal_user_role_retained(monkeypatch):
    existing_user = LiteLLM_UserTable(
        user_id="123",
        user_email="user@example.com",
        user_role=LitellmUserRoles.INTERNAL_USER.value,
    )
    captured = {}

    async def mock_get_existing_user_info_from_db(
        user_id, user_email, prisma_client, user_api_key_cache, proxy_logging_obj
    ):
        captured["email"] = user_email
        return existing_user

    async def dummy_add_user_to_teams_from_sso_response(result, user_info):
        return None

    monkeypatch.setattr(
        ui_sso, "get_existing_user_info_from_db", mock_get_existing_user_info_from_db
    )
    monkeypatch.setattr(
        ui_sso.SSOAuthenticationHandler,
        "add_user_to_teams_from_sso_response",
        dummy_add_user_to_teams_from_sso_response,
    )

    result = types.SimpleNamespace(id="123", email=None)

    user_info = asyncio.run(
        ui_sso.get_user_info_from_db(
            result=result,
            prisma_client=object(),
            user_api_key_cache=object(),
            proxy_logging_obj=object(),
            user_email="user@example.com",
            user_defined_values=None,
        )
    )

    assert captured["email"] == "user@example.com"
    assert user_info.user_role == LitellmUserRoles.INTERNAL_USER.value

    user_defined_values = SSOUserDefinedValues(
        models=[],
        user_id="",
        user_email=None,
        user_role=LitellmUserRoles.CUSTOMER.value,
        max_budget=None,
        budget_duration=None,
    )

    updated = ui_sso.apply_user_info_values_to_sso_user_defined_values(
        user_info, user_defined_values
    )
    assert updated["user_role"] == LitellmUserRoles.INTERNAL_USER.value
