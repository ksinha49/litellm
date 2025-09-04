import sys
import types
import os
import importlib

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from litellm.proxy.common_utils import encrypt_decrypt_utils
encrypt_decrypt_utils = importlib.reload(encrypt_decrypt_utils)
import asyncio
import hashlib
import pytest


def reset_cache(monkeypatch, master_key=None):
    encrypt_decrypt_utils._cached_salt_key = None
    proxy_server = types.SimpleNamespace(master_key=master_key)
    sys.modules.pop('litellm.proxy.proxy_server', None)
    sys.modules['litellm.proxy.proxy_server'] = proxy_server
    monkeypatch.delenv('LITELLM_SALT_KEY', raising=False)
    return proxy_server


def test_get_salt_key_from_env(monkeypatch):
    reset_cache(monkeypatch)
    monkeypatch.setenv('LITELLM_SALT_KEY', 'envkey')
    assert encrypt_decrypt_utils._get_salt_key() == 'envkey'


def test_get_salt_key_from_master_key(monkeypatch):
    reset_cache(monkeypatch, master_key='mkey')
    assert encrypt_decrypt_utils._get_salt_key() == 'mkey'


class DummyMetadataTable:
    def __init__(self, value=None):
        self.value = value

    async def find_first(self, where):
        if self.value is None:
            return None
        return types.SimpleNamespace(key=where["key"], value=self.value)

    async def create(self, data):
        self.value = data["value"]


class DummyDB:
    def __init__(self, value=None):
        self.litellm_metadatatable = DummyMetadataTable(value)


class DummyPrisma:
    def __init__(self, value=None):
        self.db = DummyDB(value)


def test_verify_and_store_salt_hash_creates(monkeypatch):
    reset_cache(monkeypatch)
    encrypt_decrypt_utils._cached_salt_key = "testkey"
    client = DummyPrisma()
    asyncio.run(encrypt_decrypt_utils.verify_and_store_salt_hash(client))
    expected = hashlib.sha256(b"testkey").hexdigest()
    assert client.db.litellm_metadatatable.value == expected


def test_verify_and_store_salt_hash_mismatch(monkeypatch):
    reset_cache(monkeypatch)
    encrypt_decrypt_utils._cached_salt_key = "first"
    existing = hashlib.sha256(b"second").hexdigest()
    client = DummyPrisma(existing)
    with pytest.raises(RuntimeError):
        asyncio.run(encrypt_decrypt_utils.verify_and_store_salt_hash(client))
