import base64
import hashlib
import os
from typing import Literal, Optional

from litellm._logging import verbose_proxy_logger

_cached_salt_key: Optional[str] = None


class SaltKeyMismatchError(Exception):
    """Raised when an encrypted value was generated with a different salt key."""


_HASH_PREFIX_LENGTH = 8


def _salt_hash_prefix(key: str) -> str:
    """Return a short hash prefix for the active salt key."""
    return hashlib.sha256(key.encode()).hexdigest()[:_HASH_PREFIX_LENGTH]


def _is_base64(value: str) -> bool:
    try:
        base64.b64decode(value, validate=True)
        return True
    except Exception:
        return False


def _get_salt_key() -> str:
    global _cached_salt_key

    if _cached_salt_key is not None:
        return _cached_salt_key

    from litellm.proxy.proxy_server import master_key

    salt_key = os.getenv("LITELLM_SALT_KEY") or master_key

    if salt_key is None:
        raise RuntimeError(
            "Missing encryption salt key. Set LITELLM_SALT_KEY or provide master_key before startup."
        )

    _cached_salt_key = salt_key
    return salt_key


async def verify_and_store_salt_hash(prisma_client) -> None:
    """Ensure the stored salt key hash matches the current salt key.

    If no hash is stored, save the current hash. If hashes differ, raise an error
    instructing the user to re-encrypt existing data or update the stored hash.
    """

    if prisma_client is None:
        return

    try:
        current_hash = hashlib.sha256(_get_salt_key().encode()).hexdigest()
        table = getattr(prisma_client.db, "litellm_metadatatable", None)
        if table is None:
            verbose_proxy_logger.warning(
                "LiteLLM_MetadataTable not found on Prisma client. Skipping salt hash verification."
            )
            return

        existing = await table.find_first(where={"key": "salt_key_hash"})
        if existing is None:
            await table.create(data={"key": "salt_key_hash", "value": current_hash})
            return
        if existing.value != current_hash:
            raise RuntimeError(
                "Salt key mismatch detected. Re-encrypt existing secrets or "
                "update stored hash via update_salt_key_hash script."
            )
    except Exception as e:
        raise e


def encrypt_value_helper(value: str, new_encryption_key: Optional[str] = None):
    signing_key = new_encryption_key or _get_salt_key()
    prefix = _salt_hash_prefix(signing_key)

    try:
        if isinstance(value, str):
            encrypted_value = encrypt_value(value=value, signing_key=signing_key)  # type: ignore
            encrypted_value = base64.b64encode(encrypted_value).decode("utf-8")

            return f"{prefix}:{encrypted_value}"

        verbose_proxy_logger.debug(
            f"Invalid value type passed to encrypt_value: {type(value)} for Value: {value}\n Value must be a string"
        )
        # if it's not a string - do not encrypt it and return the value
        return value
    except Exception as e:
        raise e


def decrypt_value_helper(
    value: str,
    key: str,  # this is just for debug purposes, showing the k,v pair that's invalid. not a signing key.
    exception_type: Literal["debug", "error"] = "error",
    return_original_value: bool = False,
):
    signing_key = _get_salt_key()
    expected_prefix = _salt_hash_prefix(signing_key)

    try:
        if isinstance(value, str):
            b64_value = value
            if ":" in value:
                prefix, b64_value = value.split(":", 1)
                if prefix != expected_prefix:
                    raise SaltKeyMismatchError("Salt key hash prefix mismatch")

            if not _is_base64(b64_value):
                return value if return_original_value else value
            decoded_b64 = base64.b64decode(b64_value)
            value = decrypt_value(value=decoded_b64, signing_key=signing_key)  # type: ignore
            return value

        # if it's not str - do not decrypt it, return the value
        return value
    except SaltKeyMismatchError:
        raise
    except Exception as e:
        error_message = (
            f"Error decrypting value for key: {key}, Did your master_key/salt key change recently? \nError: {str(e)}"
            "\nSet permanent salt key - https://docs.litellm.ai/docs/proxy/prod#5-set-litellm-salt-key"
        )
        if exception_type == "debug":
            verbose_proxy_logger.debug(error_message)
            return value if return_original_value else None

        verbose_proxy_logger.debug(
            f"Unable to decrypt value={value} for key: {key}, returning None"
        )
        if return_original_value:
            return value
        else:
            verbose_proxy_logger.exception(error_message)
            # [Non-Blocking Exception. - this should not block decrypting other values]
            return None


def encrypt_value(value: str, signing_key: str):
    import nacl.secret
    import nacl.utils

    # get 32 byte master key #
    hash_object = hashlib.sha256(signing_key.encode())
    hash_bytes = hash_object.digest()

    # initialize secret box #
    box = nacl.secret.SecretBox(hash_bytes)

    # encode message #
    value_bytes = value.encode("utf-8")

    encrypted = box.encrypt(value_bytes)

    return encrypted


def decrypt_value(value: bytes, signing_key: str) -> str:
    import nacl.secret
    import nacl.utils

    # get 32 byte master key #
    hash_object = hashlib.sha256(signing_key.encode())
    hash_bytes = hash_object.digest()

    # initialize secret box #
    box = nacl.secret.SecretBox(hash_bytes)

    # Convert the bytes object to a string
    try:
        if len(value) == 0:
            return ""

        plaintext = box.decrypt(value)
        plaintext = plaintext.decode("utf-8")  # type: ignore
        return plaintext  # type: ignore
    except Exception as e:
        raise e
