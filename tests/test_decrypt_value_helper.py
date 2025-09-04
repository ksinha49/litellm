import base64
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from litellm.proxy.common_utils import encrypt_decrypt_utils


def test_is_base64_helper():
    valid = base64.b64encode(b"hello").decode()
    assert encrypt_decrypt_utils._is_base64(valid)
    assert not encrypt_decrypt_utils._is_base64("plain-text")


def test_decrypt_plain_text_returns_original_value(monkeypatch, caplog):
    encrypt_decrypt_utils._cached_salt_key = "testkey"
    with caplog.at_level("ERROR"):
        result = encrypt_decrypt_utils.decrypt_value_helper(
            value="plain-text", key="dummy"
        )
    assert result == "plain-text"
    assert caplog.text == ""


