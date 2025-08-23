from fastapi import HTTPException
from litellm.proxy._types import CommonProxyErrors


def _premium_user_check():
    """Raises an HTTPException if the user is not a premium user"""
    from litellm.proxy.proxy_server import premium_user

    if not premium_user:
        raise HTTPException(
            status_code=403,
            detail={
                "error": "This feature is only available for LiteLLM Enterprise users. "
                f"{CommonProxyErrors.not_premium_user.value}"
            },
        )
