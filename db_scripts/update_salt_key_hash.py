import asyncio
import hashlib
import os

from prisma import Prisma


async def update_salt_key_hash() -> None:
    """Update the stored salt key hash to match the current LITELLM_SALT_KEY."""

    salt_key = os.getenv("LITELLM_SALT_KEY")
    if not salt_key:
        raise RuntimeError("LITELLM_SALT_KEY environment variable is required")

    salt_hash = hashlib.sha256(salt_key.encode()).hexdigest()

    prisma = Prisma()
    await prisma.connect()

    try:
        await prisma.litellm_metadatable.upsert(
            where={"key": "salt_key_hash"},
            data={
                "create": {"key": "salt_key_hash", "value": salt_hash},
                "update": {"value": salt_hash},
            },
        )
        print("Salt key hash updated")  # noqa: T201
    finally:
        await prisma.disconnect()


if __name__ == "__main__":
    asyncio.run(update_salt_key_hash())

