import sys
import os
import types
import json
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
from litellm.proxy.management_endpoints import model_management_endpoints
from litellm.types.router import LiteLLM_Params, Deployment, ModelInfo


class DummyRouter:
    def __init__(self):
        self.deployments = []

    def upsert_deployment(self, deployment):
        self.deployments.append(deployment)
        return deployment

    def get_model_ids(self):
        return []


def test_parse_litellm_params_accepts_dict(monkeypatch):
    monkeypatch.setattr(proxy_server, "decrypt_value_helper", lambda value, key: value)
    proxy_config = proxy_server.ProxyConfig()
    params = proxy_config.parse_litellm_params({"model": "gpt-3.5"})
    assert isinstance(params, LiteLLM_Params)
    assert params.model == "gpt-3.5"


def test_parse_litellm_params_accepts_json_string(monkeypatch):
    monkeypatch.setattr(proxy_server, "decrypt_value_helper", lambda value, key: value)
    proxy_config = proxy_server.ProxyConfig()
    params = proxy_config.parse_litellm_params(json.dumps({"model": "gpt-3.5"}))
    assert isinstance(params, LiteLLM_Params)
    assert params.model == "gpt-3.5"


def test_parse_litellm_params_accepts_pydantic_obj(monkeypatch):
    monkeypatch.setattr(proxy_server, "decrypt_value_helper", lambda value, key: value)
    proxy_config = proxy_server.ProxyConfig()
    pydantic_params = LiteLLM_Params(model="gpt-3.5")
    params = proxy_config.parse_litellm_params(pydantic_params)
    assert isinstance(params, LiteLLM_Params)
    assert params.model == "gpt-3.5"


def test_add_deployment_accepts_dict_and_litellm_params(monkeypatch):
    monkeypatch.setattr(proxy_server, "decrypt_value_helper", lambda value, key: value)
    proxy_server.master_key = "test-key"
    proxy_server.llm_router = DummyRouter()

    proxy_config = proxy_server.ProxyConfig()

    dict_model = SimpleNamespace(
        model_name="gpt-3.5",
        litellm_params={"model": "gpt-3.5"},
        model_info={},
        model_id="1",
    )

    pydantic_params = LiteLLM_Params(model="gpt-4")
    pydantic_model = SimpleNamespace(
        model_name="gpt-4",
        litellm_params=pydantic_params,
        model_info={},
        model_id="2",
    )

    added = proxy_config._add_deployment([dict_model, pydantic_model])
    assert added == 2
    assert len(proxy_server.llm_router.deployments) == 2
    assert proxy_server.llm_router.deployments[0].litellm_params.model == "gpt-3.5"
    assert proxy_server.llm_router.deployments[1].litellm_params.model == "gpt-4"


def test_decrypt_model_list_from_db_accepts_dict_and_litellm_params(monkeypatch):
    monkeypatch.setattr(proxy_server, "decrypt_value_helper", lambda value, key: value)
    proxy_config = proxy_server.ProxyConfig()

    dict_model = SimpleNamespace(
        model_name="gpt-3.5",
        litellm_params={"model": "gpt-3.5"},
        model_info={},
        model_id="1",
    )

    pydantic_params = LiteLLM_Params(model="gpt-4")
    pydantic_model = SimpleNamespace(
        model_name="gpt-4",
        litellm_params=pydantic_params,
        model_info={},
        model_id="2",
    )

    models = proxy_config.decrypt_model_list_from_db([dict_model, pydantic_model])
    assert len(models) == 2
    assert models[0]["litellm_params"]["model"] == "gpt-3.5"
    assert models[1]["litellm_params"]["model"] == "gpt-4"


def test_decrypt_model_list_from_db_accepts_str(monkeypatch):
    monkeypatch.setattr(proxy_server, "decrypt_value_helper", lambda value, key: value)
    proxy_config = proxy_server.ProxyConfig()

    str_model = SimpleNamespace(
        model_name="gpt-3.5",
        litellm_params=json.dumps({"model": "gpt-3.5"}),
        model_info={},
        model_id="1",
    )

    models = proxy_config.decrypt_model_list_from_db([str_model])
    assert len(models) == 1
    assert models[0]["litellm_params"]["model"] == "gpt-3.5"


def test_pydantic_style_string_is_parsed(monkeypatch):
    monkeypatch.setattr(proxy_server, "decrypt_value_helper", lambda value, key: value)
    proxy_server.master_key = "test-key"
    proxy_server.llm_router = DummyRouter()

    proxy_config = proxy_server.ProxyConfig()

    params = LiteLLM_Params(model="gpt-4")
    str_model = SimpleNamespace(
        model_name="gpt-4",
        litellm_params=repr(params),
        model_info={},
        model_id="1",
    )

    added = proxy_config._add_deployment([str_model])
    assert added == 1
    assert proxy_server.llm_router.deployments[0].litellm_params.model == "gpt-4"

    models = proxy_config.decrypt_model_list_from_db([str_model])
    assert len(models) == 1
    assert models[0]["litellm_params"]["model"] == "gpt-4"


def test_models_added_via_management_endpoint_reload_without_invalid_log(
    monkeypatch, caplog
):
    async def _run():
        monkeypatch.setattr(
            proxy_server, "encrypt_value_helper", lambda value, new_encryption_key=None: value
        )
        monkeypatch.setattr(proxy_server, "decrypt_value_helper", lambda value, key: value)
        proxy_server.master_key = "test-key"
        proxy_server.llm_router = DummyRouter()

        class DummyTable:
            async def create(self, data):
                return SimpleNamespace(**data)

        class DummyDB:
            litellm_proxymodeltable = DummyTable()

        prisma_client = SimpleNamespace(db=DummyDB())
        user_api_key = SimpleNamespace(user_id="user")

        deployment = Deployment(
            model_name="gpt-3.5",
            litellm_params=LiteLLM_Params(model="gpt-3.5"),
            model_info=ModelInfo(id="model-id"),
        )

        model_response = await model_management_endpoints._add_model_to_db(
            model_params=deployment,
            user_api_key_dict=user_api_key,
            prisma_client=prisma_client,
        )

        proxy_config = proxy_server.ProxyConfig()

        with caplog.at_level("ERROR"):
            added = proxy_config._add_deployment([model_response])

        assert added == 1
        assert "Invalid model added to proxy db" not in caplog.text

    asyncio.run(_run())
