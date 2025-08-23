import os
import sys
import subprocess
import pytest

# Add litellm-proxy-extras package to path
sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../litellm-proxy-extras")),
)

from litellm_proxy_extras.utils import ProxyExtrasDBManager

def test_custom_prisma_dir(monkeypatch):
    import tempfile
    # create a temp directory
    temp_dir = tempfile.mkdtemp()
    monkeypatch.setenv("LITELLM_MIGRATION_DIR", temp_dir)

    ## Check if the prisma dir is the temp directory
    assert ProxyExtrasDBManager._get_prisma_dir() == temp_dir

    ## Check if the schema.prisma file is in the temp directory
    schema_path = os.path.join(temp_dir, "schema.prisma")
    assert os.path.exists(schema_path)

    ## Check if the migrations dir is in the temp directory
    migrations_dir = os.path.join(temp_dir, "migrations")
    assert os.path.exists(migrations_dir)


def test_setup_database_auto_baseline(monkeypatch):
    calls = {"run": 0, "create": 0, "resolve": 0}

    def mock_run(*args, **kwargs):
        if calls["run"] == 0:
            calls["run"] += 1
            raise subprocess.CalledProcessError(
                returncode=1,
                cmd=args[0],
                stderr='relation "_prisma_migrations" already exists',
            )
        raise AssertionError("subprocess.run called more than once")

    monkeypatch.setattr(subprocess, "run", mock_run)

    def mock_create_baseline(schema_path):
        calls["create"] += 1
        return True

    def mock_resolve_all(migrations_dir, schema_path):
        calls["resolve"] += 1
        return True

    monkeypatch.setattr(
        ProxyExtrasDBManager,
        "_create_baseline_migration",
        staticmethod(mock_create_baseline),
    )
    monkeypatch.setattr(
        ProxyExtrasDBManager,
        "_resolve_all_migrations",
        staticmethod(mock_resolve_all),
    )

    assert ProxyExtrasDBManager.setup_database(use_migrate=True) is True
    assert calls["create"] == 1
    assert calls["resolve"] == 1

