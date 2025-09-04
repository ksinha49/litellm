import sys
import os
import types
import asyncio
from types import SimpleNamespace
from fastapi import APIRouter, FastAPI

# Patch FastAPI to avoid including routers during import
FastAPI.include_router = lambda self, *args, **kwargs: None
FastAPI.mount = lambda self, *args, **kwargs: None

# Ensure local package is used
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Stub experimental MCP modules to avoid optional dependency imports
stub_rest_endpoints = types.ModuleType("stub_rest_endpoints")
stub_rest_endpoints.router = APIRouter()
sys.modules["litellm.proxy._experimental.mcp_server.rest_endpoints"] = stub_rest_endpoints

stub_server = types.ModuleType("stub_server")
stub_server.app = object()
sys.modules["litellm.proxy._experimental.mcp_server.server"] = stub_server

stub_tool_registry = types.ModuleType("stub_tool_registry")
stub_tool_registry.global_mcp_tool_registry = object()
sys.modules["litellm.proxy._experimental.mcp_server.tool_registry"] = stub_tool_registry

stub_manager = types.ModuleType("stub_mcp_manager")
stub_manager.global_mcp_server_manager = object()
sys.modules["litellm.proxy._experimental.mcp_server.mcp_server_manager"] = stub_manager

from litellm.proxy import proxy_server


def test_get_config_includes_s3_v2_params(monkeypatch):
    async def fake_get_config():
        return {
            "litellm_settings": {
                "success_callback": ["s3_v2"],
                "s3_callback_params": {
                    "s3_bucket_name": "my-bucket",
                    "s3_region_name": "us-west-1",
                    "s3_aws_access_key_id": "os.environ/MY_ACCESS_KEY",
                    "s3_aws_secret_access_key": "os.environ/MY_SECRET_KEY",
                    "s3_path": "logs/",
                    "s3_endpoint_url": "os.environ/MY_ENDPOINT",
                },
            },
            "general_settings": {},
            "environment_variables": {
                "MY_ACCESS_KEY": "ACCESS",
                "MY_SECRET_KEY": "SECRET",
                "MY_ENDPOINT": "https://example.com",
            },
        }

    class DummyProxyConfig:
        async def get_config(self):
            return await fake_get_config()

    proxy_server.proxy_config = DummyProxyConfig()
    proxy_server.llm_router = None
    proxy_server.proxy_logging_obj = SimpleNamespace(
        slack_alerting_instance=SimpleNamespace(
            alert_types=[],
            _all_possible_alert_types=lambda: [],
            alert_to_webhook_url={},
        )
    )
    monkeypatch.setattr(proxy_server, "decrypt_value_helper", lambda value, key: value)
    monkeypatch.setattr(proxy_server, "AllCallbacks", lambda: [])

    result = asyncio.run(proxy_server.get_config())

    assert any(cb["name"] == "s3_v2" for cb in result["callbacks"])
    s3_vars = next(cb["variables"] for cb in result["callbacks"] if cb["name"] == "s3_v2")
    assert s3_vars["s3_bucket_name"] == "my-bucket"
    assert s3_vars["s3_region_name"] == "us-west-1"
    assert s3_vars["s3_aws_access_key_id"] == "ACCESS"
    assert s3_vars["s3_aws_secret_access_key"] == "SECRET"
    assert s3_vars["s3_path"] == "logs/"
    assert s3_vars["s3_endpoint_url"] == "https://example.com"
