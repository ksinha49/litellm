#!/usr/bin/env python
"""Test encryption/decryption flow for credentials and guardrails"""
import os
import sys

# Set environment variables before importing
os.environ["LITELLM_SALT_KEY"] = "K$57Rdf2Ry15L5XQlyvc"

# Test the encryption/decryption utilities
def test_encrypt_decrypt():
    from litellm.proxy.common_utils.encrypt_decrypt_utils import encrypt_value_helper, decrypt_value_helper

    print("Testing encryption/decryption flow...")

    # Test 1: String value (like API key)
    original_string = "my-secret-api-key"
    encrypted = encrypt_value_helper(value=original_string)
    print(f"✓ Encrypted string: {encrypted[:20]}...")

    decrypted = decrypt_value_helper(value=encrypted, key="test_key")
    assert decrypted == original_string, f"Decryption failed: {decrypted} != {original_string}"
    print(f"✓ Decrypted matches original: {decrypted}")

    # Test 2: Non-string value (should pass through)
    original_int = 42
    encrypted_int = encrypt_value_helper(value=original_int)
    assert encrypted_int == original_int, "Int should pass through unchanged"
    print(f"✓ Non-string value passed through: {encrypted_int}")

    # Test 3: Dictionary with mixed types (guardrail params scenario)
    import json
    from litellm.litellm_core_utils.safe_json_dumps import safe_dumps

    params = {
        "api_key": "secret123",
        "timeout": 30,
        "retry": True
    }

    # Simulate encryption
    encrypted_params = {}
    for k, v in params.items():
        if not isinstance(v, (str, int, float, bool, type(None))):
            v = json.loads(json.dumps(v, default=str))
        encrypted_params[k] = encrypt_value_helper(value=v)

    print(f"✓ Encrypted params: {encrypted_params}")

    # Simulate storage as JSON string
    stored_json = safe_dumps(encrypted_params)
    print(f"✓ JSON for storage: {stored_json[:50]}...")

    # Simulate retrieval and decryption
    retrieved_dict = json.loads(stored_json)
    decrypted_params = {}
    for k, v in retrieved_dict.items():
        if isinstance(v, str):
            decrypted_value = decrypt_value_helper(value=v, key=k)
            decrypted_params[k] = decrypted_value if decrypted_value is not None else v
        else:
            decrypted_params[k] = v

    print(f"✓ Decrypted params: {decrypted_params}")
    assert decrypted_params["api_key"] == "secret123", "API key should be decrypted"
    assert decrypted_params["timeout"] == 30, "Timeout should be unchanged"
    assert decrypted_params["retry"] == True, "Retry should be unchanged"

    print("\n✅ All encryption/decryption tests passed!")
    return True

if __name__ == "__main__":
    try:
        test_encrypt_decrypt()
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
