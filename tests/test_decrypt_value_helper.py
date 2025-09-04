import base64
import os
import sys

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from litellm.proxy.common_utils import encrypt_decrypt_utils


def test_is_base64_helper():
    valid = base64.b64encode(b"hello").decode()
    assert encrypt_decrypt_utils._is_base64(valid)
    assert not encrypt_decrypt_utils._is_base64("plain-text")


def test_encrypt_decrypt_roundtrip(monkeypatch):
    encrypt_decrypt_utils._cached_salt_key = "testkey"
    encrypted = encrypt_decrypt_utils.encrypt_value_helper("secret")
    decrypted = encrypt_decrypt_utils.decrypt_value_helper(value=encrypted, key="dummy")
    assert decrypted == "secret"


def test_decrypt_plain_text_returns_original_value(monkeypatch, caplog):
    encrypt_decrypt_utils._cached_salt_key = "testkey"
    with caplog.at_level("ERROR"):
        result = encrypt_decrypt_utils.decrypt_value_helper(
            value="plain-text", key="dummy"
        )
    assert result == "plain-text"
    assert caplog.text == ""


def test_key_mismatch_raises(monkeypatch):
    encrypt_decrypt_utils._cached_salt_key = "first"
    encrypted = encrypt_decrypt_utils.encrypt_value_helper("value")
    encrypt_decrypt_utils._cached_salt_key = "second"
    with pytest.raises(encrypt_decrypt_utils.SaltKeyMismatchError):
        encrypt_decrypt_utils.decrypt_value_helper(value=encrypted, key="dummy")


