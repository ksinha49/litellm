import pytest
from pydantic import BaseModel
from httpx import AsyncClient

import litellm
from pydantic import BaseModel
from litellm.exceptions import RejectedRequestError
from litellm.proxy.chat_completion_helpers import (
    ChatCompletionDependencies,
    format_chat_completion_response,
    handle_rejected_request,
    log_chat_completion_error,
    route_chat_request,
    validate_chat_request,
)
from litellm.proxy._types import UserAPIKeyAuth


def test_validate_chat_request_returns_input():
    data = {"model": "test"}
    assert validate_chat_request(data) == data


import asyncio


def test_route_chat_request_uses_processor():
    class DummyProcessor:
        def __init__(self, data):
            self.data = data

        async def base_process_llm_request(self, **kwargs):
            return {"ok": True}

    deps = ChatCompletionDependencies(
        proxy_logging_obj=None,
        llm_router=None,
        general_settings={},
        proxy_config=None,
        select_data_generator=lambda **kwargs: kwargs["response"],
        user_model=None,
        user_temperature=None,
        user_request_timeout=None,
        user_max_tokens=None,
        user_api_base=None,
        version="test",
    )
    processor = DummyProcessor({})
    result = asyncio.run(
        route_chat_request(
            processor=processor,
            request=None,
            fastapi_response=None,
            user_api_key_dict=UserAPIKeyAuth(),
            model=None,
            deps=deps,
        )
    )
    assert result == {"ok": True}


def test_log_chat_completion_error_called():
    class DummyLogger:
        def __init__(self):
            self.called = False

        async def post_call_failure_hook(self, **kwargs):
            self.called = True

    logger = DummyLogger()
    asyncio.run(
        log_chat_completion_error(
            proxy_logging_obj=logger,
            user_api_key_dict=UserAPIKeyAuth(),
            error=Exception("boom"),
            data={},
        )
    )
    assert logger.called is True


def test_format_chat_completion_response_handles_basemodel():
    class DummyModel(BaseModel):
        ok: bool = True

    assert format_chat_completion_response(DummyModel(ok=True)) == {"ok": True}
    assert format_chat_completion_response({"ok": True}) == {"ok": True}


def test_handle_rejected_request_non_streaming():
    error = RejectedRequestError(
        message="bad",
        model="m",
        llm_provider="p",
        request_data={"model": "m", "stream": False},
    )
    result = asyncio.run(
        handle_rejected_request(
            error=error,
            data=error.request_data,
            user_api_key_dict=UserAPIKeyAuth(),
            select_data_generator=lambda **kwargs: kwargs["response"],
        )
    )
    assert isinstance(result, litellm.ModelResponse)
    assert result.choices[0].message.content == error.message
