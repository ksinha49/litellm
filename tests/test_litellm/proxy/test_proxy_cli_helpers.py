import sys
import types

import pytest

# Stub out optional MCP dependency to avoid import errors during tests
_stub_module = types.ModuleType("streamable_http")
_stub_module.streamablehttp_client = lambda *args, **kwargs: None
sys.modules.setdefault("mcp.client.streamable_http", _stub_module)

# Stub out proxy_server module used inside load_proxy_config
_stub_proxy_server = types.ModuleType("litellm.proxy.proxy_server")


class _ProxyConfig:
    def initialize_secret_manager(self, *args, **kwargs):  # pragma: no cover - stub
        pass

    async def get_config(self, config_file_path):  # pragma: no cover - stub
        raise FileNotFoundError


class _KeyManagementSettings:  # pragma: no cover - stub
    def __init__(self, **kwargs):
        pass


_stub_proxy_server.ProxyConfig = _ProxyConfig
_stub_proxy_server.KeyManagementSettings = _KeyManagementSettings
sys.modules.setdefault("litellm.proxy.proxy_server", _stub_proxy_server)

from litellm.proxy.proxy_cli import (
    ProxyConfigOptions,
    initialize_proxy_server,
    load_proxy_config,
    start_proxy_server,
)


def _make_options(**overrides):
    base = dict(
        host="0.0.0.0",
        port=4000,
        config=None,
        num_workers=1,
        run_gunicorn=False,
        run_hypercorn=False,
        ssl_keyfile_path=None,
        ssl_certfile_path=None,
        ciphers=None,
        log_config=None,
        skip_server_startup=False,
        keepalive_timeout=None,
        detailed_debug=False,
    )
    base.update(overrides)
    return ProxyConfigOptions(**base)


def test_load_proxy_config_success(tmp_path):
    options = _make_options()
    load_proxy_config(options, iam_token_db_auth=False, use_prisma_db_push=False)


def test_load_proxy_config_file_not_found():
    options = _make_options(config="nonexistent.yaml")
    with pytest.raises(FileNotFoundError):
        load_proxy_config(options, iam_token_db_auth=False, use_prisma_db_push=False)


def test_initialize_proxy_server_success(monkeypatch):
    options = _make_options(port=4000)
    monkeypatch.setattr(
        "litellm.proxy.proxy_cli.ProxyInitializationHelpers._is_port_in_use",
        lambda port: False,
    )
    args = initialize_proxy_server(options)
    assert args["host"] == options.host
    assert args["port"] == options.port


def test_initialize_proxy_server_failure(monkeypatch):
    options = _make_options()

    def raiser(*args, **kwargs):
        raise RuntimeError("boom")

    monkeypatch.setattr(
        "litellm.proxy.proxy_cli.ProxyInitializationHelpers._get_default_unvicorn_init_args",
        raiser,
    )
    with pytest.raises(RuntimeError):
        initialize_proxy_server(options)


def test_start_proxy_server_uvicorn(monkeypatch):
    options = _make_options()
    called = {}

    def fake_run(**kwargs):
        called["ran"] = True

    monkeypatch.setattr("uvicorn.run", fake_run)
    start_proxy_server(app=None, options=options, uvicorn_args={"app": "x", "host": "0.0.0.0", "port": 4000})
    assert called.get("ran") is True


def test_start_proxy_server_conflict():
    options = _make_options(run_gunicorn=True, run_hypercorn=True)
    with pytest.raises(ValueError):
        start_proxy_server(app=None, options=options, uvicorn_args={})

