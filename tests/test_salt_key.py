import sys
import types

from litellm.proxy.common_utils import encrypt_decrypt_utils


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
