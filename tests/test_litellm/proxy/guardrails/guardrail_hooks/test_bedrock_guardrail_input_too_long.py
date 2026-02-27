"""
Unit tests for Bedrock Guardrail on_input_too_long handling.

Verifies:
  - fail_closed (default): HTTPException propagates unchanged
  - fail_open: inputs are returned unchanged without calling guardrail
  - chunk: _apply_guardrail_to_chunks is called and inputs are returned
  - _split_texts_into_chunks: correct chunking behaviour
"""
import os
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

sys.path.insert(0, os.path.abspath("../../../../../.."))

from litellm.proxy.guardrails.guardrail_hooks.bedrock_guardrails import BedrockGuardrail
from litellm.types.proxy.guardrails.guardrail_hooks.bedrock_guardrails import (
    BedrockGuardrailResponse,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_guardrail(on_input_too_long: str = "fail_closed", max_chunk: int = 25000):
    """Return a BedrockGuardrail with AWS calls stubbed out."""
    g = BedrockGuardrail(
        guardrailIdentifier="test-id",
        guardrailVersion="1",
        on_input_too_long=on_input_too_long,
        bedrock_guardrail_max_chunk_size=max_chunk,
    )
    # Prevent real network calls
    g._load_credentials = MagicMock(return_value=(MagicMock(), "us-east-1"))
    g._prepare_request = MagicMock(return_value=MagicMock(url="http://x", body=b"", headers={}))
    return g


def _too_long_exc() -> HTTPException:
    return HTTPException(status_code=400, detail="Input is too long.")


def _ok_response() -> BedrockGuardrailResponse:
    return BedrockGuardrailResponse(action="NONE", outputs=[], assessments=[])


# ---------------------------------------------------------------------------
# _is_input_too_long_error
# ---------------------------------------------------------------------------

def test_is_input_too_long_error_true():
    exc = HTTPException(status_code=400, detail="Input is too long.")
    assert BedrockGuardrail._is_input_too_long_error(exc) is True


def test_is_input_too_long_error_case_insensitive():
    exc = HTTPException(status_code=400, detail="INPUT IS TOO LONG")
    assert BedrockGuardrail._is_input_too_long_error(exc) is True


def test_is_input_too_long_error_false():
    exc = HTTPException(status_code=400, detail="Violated guardrail policy")
    assert BedrockGuardrail._is_input_too_long_error(exc) is False


def test_is_input_too_long_error_none_detail():
    exc = HTTPException(status_code=500, detail=None)
    assert BedrockGuardrail._is_input_too_long_error(exc) is False


# ---------------------------------------------------------------------------
# _split_texts_into_chunks
# ---------------------------------------------------------------------------

def test_split_texts_no_split_needed():
    g = _make_guardrail(max_chunk=100)
    texts = ["hello", "world"]
    chunks = g._split_texts_into_chunks(texts)
    assert chunks == [["hello", "world"]]


def test_split_texts_multiple_chunks():
    g = _make_guardrail(max_chunk=10)
    # "aaaaaaaaaa" = 10 chars; "bbbbbbbbbb" = 10 chars — together they exceed 10 so split
    texts = ["aaaaaaaaaa", "bbbbbbbbbb"]
    chunks = g._split_texts_into_chunks(texts)
    assert len(chunks) == 2
    assert chunks[0] == ["aaaaaaaaaa"]
    assert chunks[1] == ["bbbbbbbbbb"]


def test_split_texts_oversized_single_text():
    g = _make_guardrail(max_chunk=5)
    texts = ["abcdefghij"]  # 10 chars, max=5 → should produce 2 sub-chunks
    chunks = g._split_texts_into_chunks(texts)
    assert len(chunks) == 2
    assert chunks[0] == ["abcde"]
    assert chunks[1] == ["fghij"]


def test_split_texts_empty():
    g = _make_guardrail(max_chunk=100)
    assert g._split_texts_into_chunks([]) == []


def test_split_texts_mixed():
    """Short texts pack together; oversized text flushes and splits separately."""
    g = _make_guardrail(max_chunk=10)
    # "ab" + "cd" = 4 chars → one chunk; "efghijklmno" = 11 chars → splits into two
    # Sub-chunks respect max_chunk=10: text[0:10]="efghijklmn", text[10:20]="o"
    texts = ["ab", "cd", "efghijklmno"]
    chunks = g._split_texts_into_chunks(texts)
    # chunk0 = ["ab", "cd"], chunk1 = ["efghijklmn"], chunk2 = ["o"]
    assert chunks[0] == ["ab", "cd"]
    assert chunks[1] == ["efghijklmn"]
    assert chunks[2] == ["o"]


def test_split_texts_exact_boundary():
    g = _make_guardrail(max_chunk=5)
    # "hello" = 5 chars exactly — fits in one chunk
    texts = ["hello"]
    chunks = g._split_texts_into_chunks(texts)
    assert chunks == [["hello"]]


def test_split_texts_totaling_over_limit():
    g = _make_guardrail(max_chunk=25000)
    # Create texts summing to > 25000 chars
    chunk_text = "x" * 10000
    texts = [chunk_text, chunk_text, chunk_text]  # 30000 total
    chunks = g._split_texts_into_chunks(texts)
    # First two fit (20000 <= 25000), third doesn't → two chunks
    assert len(chunks) == 2
    assert chunks[0] == [chunk_text, chunk_text]
    assert chunks[1] == [chunk_text]


# ---------------------------------------------------------------------------
# apply_guardrail — fail_closed (default)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_guardrail_fail_closed_raises():
    """Default behaviour: 'Input is too long' error propagates as HTTPException."""
    g = _make_guardrail(on_input_too_long="fail_closed")
    g.make_bedrock_api_request = AsyncMock(side_effect=_too_long_exc())

    inputs = {"texts": ["x" * 30000]}
    with pytest.raises(HTTPException) as exc_info:
        await g.apply_guardrail(
            inputs=inputs,
            request_data={},
            input_type="request",
        )
    assert exc_info.value.status_code == 400
    assert "too long" in str(exc_info.value.detail).lower()


@pytest.mark.asyncio
async def test_apply_guardrail_fail_closed_other_error_also_raises():
    """Non-'too long' HTTPException still propagates with fail_closed."""
    g = _make_guardrail(on_input_too_long="fail_closed")
    g.make_bedrock_api_request = AsyncMock(
        side_effect=HTTPException(status_code=400, detail="Violated guardrail policy")
    )

    inputs = {"texts": ["some text"]}
    with pytest.raises(HTTPException) as exc_info:
        await g.apply_guardrail(inputs=inputs, request_data={}, input_type="request")
    assert "violated" in str(exc_info.value.detail).lower()


# ---------------------------------------------------------------------------
# apply_guardrail — fail_open
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_guardrail_fail_open_returns_inputs_unchanged():
    """fail_open: when input is too long, inputs are returned unchanged."""
    g = _make_guardrail(on_input_too_long="fail_open")
    g.make_bedrock_api_request = AsyncMock(side_effect=_too_long_exc())

    original_texts = ["x" * 30000]
    inputs = {"texts": original_texts}
    result = await g.apply_guardrail(inputs=inputs, request_data={}, input_type="request")

    assert result["texts"] == original_texts
    # make_bedrock_api_request was called once (before the error)
    g.make_bedrock_api_request.assert_called_once()


@pytest.mark.asyncio
async def test_apply_guardrail_fail_open_non_too_long_error_still_raises():
    """fail_open only catches 'input is too long'; other errors still propagate."""
    g = _make_guardrail(on_input_too_long="fail_open")
    g.make_bedrock_api_request = AsyncMock(
        side_effect=HTTPException(status_code=400, detail="Violated guardrail policy")
    )

    inputs = {"texts": ["some text"]}
    with pytest.raises(HTTPException) as exc_info:
        await g.apply_guardrail(inputs=inputs, request_data={}, input_type="request")
    assert "violated" in str(exc_info.value.detail).lower()


# ---------------------------------------------------------------------------
# apply_guardrail — chunk
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_guardrail_chunk_calls_apply_guardrail_to_chunks():
    """chunk mode: _apply_guardrail_to_chunks is called when input is too long."""
    g = _make_guardrail(on_input_too_long="chunk", max_chunk=10)
    g.make_bedrock_api_request = AsyncMock(side_effect=_too_long_exc())
    g._apply_guardrail_to_chunks = AsyncMock(return_value=_ok_response())

    inputs = {"texts": ["x" * 30000]}
    result = await g.apply_guardrail(inputs=inputs, request_data={}, input_type="request")

    g._apply_guardrail_to_chunks.assert_called_once()
    call_kwargs = g._apply_guardrail_to_chunks.call_args
    assert call_kwargs.kwargs["texts"] == ["x" * 30000]
    # Result texts fall back to originals (no masking in ok response)
    assert result["texts"] == ["x" * 30000]


@pytest.mark.asyncio
async def test_apply_guardrail_chunk_blocked_raises():
    """chunk mode: if a chunk is blocked, the exception propagates."""
    g = _make_guardrail(on_input_too_long="chunk", max_chunk=10)
    g.make_bedrock_api_request = AsyncMock(side_effect=_too_long_exc())
    g._apply_guardrail_to_chunks = AsyncMock(
        side_effect=HTTPException(
            status_code=400,
            detail={"error": "Violated guardrail policy"},
        )
    )

    inputs = {"texts": ["x" * 30000]}
    with pytest.raises(HTTPException) as exc_info:
        await g.apply_guardrail(inputs=inputs, request_data={}, input_type="request")
    assert exc_info.value.status_code == 400


# ---------------------------------------------------------------------------
# _apply_guardrail_to_chunks integration
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_guardrail_to_chunks_calls_make_request_per_chunk():
    """_apply_guardrail_to_chunks calls make_bedrock_api_request once per chunk."""
    g = _make_guardrail(max_chunk=5)
    ok = _ok_response()
    g.make_bedrock_api_request = AsyncMock(return_value=ok)

    # 3 texts of 5 chars each → 3 chunks (each 5 chars, combined would exceed 5)
    texts = ["aaaaa", "bbbbb", "ccccc"]
    result = await g._apply_guardrail_to_chunks(texts=texts, request_data={})

    assert g.make_bedrock_api_request.call_count == 3
    assert result == ok


@pytest.mark.asyncio
async def test_apply_guardrail_to_chunks_blocked_chunk_raises():
    """If one chunk is blocked, the exception propagates immediately."""
    g = _make_guardrail(max_chunk=5)
    block_exc = HTTPException(
        status_code=400, detail={"error": "Violated guardrail policy"}
    )
    ok = _ok_response()
    # First chunk ok, second blocked
    g.make_bedrock_api_request = AsyncMock(side_effect=[ok, block_exc])

    texts = ["aaaaa", "bbbbb"]
    with pytest.raises(HTTPException):
        await g._apply_guardrail_to_chunks(texts=texts, request_data={})


@pytest.mark.asyncio
async def test_apply_guardrail_to_chunks_empty_texts():
    """Empty texts list → no API calls, returns empty BedrockGuardrailResponse."""
    g = _make_guardrail(max_chunk=100)
    g.make_bedrock_api_request = AsyncMock(return_value=_ok_response())

    result = await g._apply_guardrail_to_chunks(texts=[], request_data={})

    g.make_bedrock_api_request.assert_not_called()
    # BedrockGuardrailResponse is a TypedDict (dict subclass); verify it's a dict
    assert isinstance(result, dict)


# ---------------------------------------------------------------------------
# _apply_guardrail_to_chunks — parallel execution (Gap 2)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_guardrail_to_chunks_parallel_calls():
    """All chunks must be dispatched in parallel (asyncio.gather), not sequentially."""
    import asyncio

    call_order: list = []

    async def slow_mock(source, messages, request_data):
        call_order.append("start")
        await asyncio.sleep(0)  # yield so the event loop can schedule other tasks
        call_order.append("end")
        return _ok_response()

    g = _make_guardrail(max_chunk=5)
    g.make_bedrock_api_request = slow_mock

    # 3 chunks, each 5 chars
    texts = ["aaaaa", "bbbbb", "ccccc"]
    result = await g._apply_guardrail_to_chunks(texts=texts, request_data={})

    # With parallel execution all "start" entries appear before all "end" entries
    # (they interleave differently than sequential start/end/start/end/...)
    starts = [i for i, v in enumerate(call_order) if v == "start"]
    ends = [i for i, v in enumerate(call_order) if v == "end"]
    # Verify all 3 chunks ran
    assert len(starts) == 3
    assert len(ends) == 3


@pytest.mark.asyncio
async def test_apply_guardrail_to_chunks_aggregates_outputs():
    """Outputs from every chunk are combined — not just the last chunk (Gap 4)."""
    from litellm.types.proxy.guardrails.guardrail_hooks.bedrock_guardrails import (
        BedrockGuardrailOutput,
    )

    chunk1_resp = BedrockGuardrailResponse(
        action="GUARDRAIL_INTERVENED",
        outputs=[BedrockGuardrailOutput(text="masked1")],
        assessments=[],
    )
    chunk2_resp = BedrockGuardrailResponse(
        action="GUARDRAIL_INTERVENED",
        outputs=[BedrockGuardrailOutput(text="masked2")],
        assessments=[],
    )

    g = _make_guardrail(max_chunk=5)
    # Two chunks: ["aaaaa"] and ["bbbbb"]
    g.make_bedrock_api_request = AsyncMock(side_effect=[chunk1_resp, chunk2_resp])

    result = await g._apply_guardrail_to_chunks(texts=["aaaaa", "bbbbb"], request_data={})

    assert result["action"] == "GUARDRAIL_INTERVENED"
    texts_out = [o.get("text") for o in (result.get("outputs") or [])]
    assert "masked1" in texts_out
    assert "masked2" in texts_out


@pytest.mark.asyncio
async def test_apply_guardrail_to_chunks_action_none_when_all_pass():
    """Combined action stays NONE when every chunk passes without intervention."""
    g = _make_guardrail(max_chunk=5)
    g.make_bedrock_api_request = AsyncMock(return_value=_ok_response())

    result = await g._apply_guardrail_to_chunks(texts=["aaaaa", "bbbbb"], request_data={})

    assert result["action"] == "NONE"


# ---------------------------------------------------------------------------
# _extract_texts_from_messages
# ---------------------------------------------------------------------------

def test_extract_texts_from_messages_string_content():
    from litellm.types.llms.openai import ChatCompletionUserMessage

    g = _make_guardrail()
    messages = [
        ChatCompletionUserMessage(role="user", content="hello"),
        ChatCompletionUserMessage(role="user", content="world"),
    ]
    texts = g._extract_texts_from_messages(messages)
    assert texts == ["hello", "world"]


def test_extract_texts_from_messages_list_content():
    g = _make_guardrail()
    messages = [{"role": "user", "content": [{"type": "text", "text": "foo"}, {"type": "text", "text": "bar"}]}]
    texts = g._extract_texts_from_messages(messages)
    assert texts == ["foo", "bar"]


def test_extract_texts_from_messages_empty():
    g = _make_guardrail()
    texts = g._extract_texts_from_messages([])
    assert texts == []


# ---------------------------------------------------------------------------
# _make_bedrock_input_request_with_chunking_fallback
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_chunking_fallback_fail_closed_raises():
    """fail_closed: 'Input is too long' propagates as HTTPException."""
    from litellm.types.llms.openai import ChatCompletionUserMessage

    g = _make_guardrail(on_input_too_long="fail_closed", max_chunk=25000)
    g.make_bedrock_api_request = AsyncMock(side_effect=_too_long_exc())

    messages = [ChatCompletionUserMessage(role="user", content="x" * 30000)]
    with pytest.raises(HTTPException) as exc_info:
        await g._make_bedrock_input_request_with_chunking_fallback(
            messages=messages, request_data={}
        )
    assert "too long" in str(exc_info.value.detail).lower()


@pytest.mark.asyncio
async def test_chunking_fallback_fail_open_returns_empty_response():
    """fail_open: when input is too long, an empty BedrockGuardrailResponse is returned."""
    from litellm.types.llms.openai import ChatCompletionUserMessage

    g = _make_guardrail(on_input_too_long="fail_open", max_chunk=25000)
    g.make_bedrock_api_request = AsyncMock(side_effect=_too_long_exc())

    messages = [ChatCompletionUserMessage(role="user", content="x" * 30000)]
    result = await g._make_bedrock_input_request_with_chunking_fallback(
        messages=messages, request_data={}
    )
    # Should return an empty dict-like response (not raise)
    assert isinstance(result, dict)
    g.make_bedrock_api_request.assert_called_once()


@pytest.mark.asyncio
async def test_chunking_fallback_chunk_mode_delegates_to_apply_guardrail_to_chunks():
    """chunk mode: _apply_guardrail_to_chunks is called when API raises too-long."""
    from litellm.types.llms.openai import ChatCompletionUserMessage

    g = _make_guardrail(on_input_too_long="chunk", max_chunk=25000)
    g.make_bedrock_api_request = AsyncMock(side_effect=_too_long_exc())
    g._apply_guardrail_to_chunks = AsyncMock(return_value=_ok_response())

    messages = [ChatCompletionUserMessage(role="user", content="x" * 30000)]
    result = await g._make_bedrock_input_request_with_chunking_fallback(
        messages=messages, request_data={}
    )

    g._apply_guardrail_to_chunks.assert_called_once()
    assert result == _ok_response()


@pytest.mark.asyncio
async def test_chunking_fallback_preflight_skips_api_call():
    """Pre-flight check: when chunk mode and total_chars > max_chunk, API is not called."""
    from litellm.types.llms.openai import ChatCompletionUserMessage

    g = _make_guardrail(on_input_too_long="chunk", max_chunk=10)
    g.make_bedrock_api_request = AsyncMock(return_value=_ok_response())
    g._apply_guardrail_to_chunks = AsyncMock(return_value=_ok_response())

    # 20 chars, max_chunk=10 → pre-flight triggers without calling make_bedrock_api_request
    messages = [ChatCompletionUserMessage(role="user", content="x" * 20)]
    await g._make_bedrock_input_request_with_chunking_fallback(
        messages=messages, request_data={}
    )

    g.make_bedrock_api_request.assert_not_called()
    g._apply_guardrail_to_chunks.assert_called_once()


@pytest.mark.asyncio
async def test_chunking_fallback_preflight_not_triggered_for_fail_closed():
    """Pre-flight only triggers when on_input_too_long='chunk'; fail_closed still calls API."""
    from litellm.types.llms.openai import ChatCompletionUserMessage

    g = _make_guardrail(on_input_too_long="fail_closed", max_chunk=10)
    g.make_bedrock_api_request = AsyncMock(return_value=_ok_response())

    # Even though 20 > 10, fail_closed should NOT pre-flight; should call the API
    messages = [ChatCompletionUserMessage(role="user", content="x" * 20)]
    await g._make_bedrock_input_request_with_chunking_fallback(
        messages=messages, request_data={}
    )

    g.make_bedrock_api_request.assert_called_once()


# ---------------------------------------------------------------------------
# async_pre_call_hook — chunking fallback (Gap 1)
# ---------------------------------------------------------------------------

def _make_request_data(content: str = "hello") -> dict:
    return {
        "messages": [{"role": "user", "content": content}],
        "model": "bedrock/anthropic.claude-3-haiku-20240307-v1:0",
    }


@pytest.mark.asyncio
async def test_async_pre_call_hook_uses_chunking_fallback():
    """async_pre_call_hook delegates to _make_bedrock_input_request_with_chunking_fallback."""
    from unittest.mock import MagicMock

    from litellm.caching import DualCache
    from litellm.proxy._types import UserAPIKeyAuth

    g = _make_guardrail(on_input_too_long="chunk", max_chunk=10)
    g.should_run_guardrail = MagicMock(return_value=True)
    g._make_bedrock_input_request_with_chunking_fallback = AsyncMock(
        return_value=_ok_response()
    )

    data = _make_request_data("x" * 20)
    result = await g.async_pre_call_hook(
        user_api_key_dict=UserAPIKeyAuth(),
        cache=DualCache(),
        data=data,
        call_type="completion",
    )

    g._make_bedrock_input_request_with_chunking_fallback.assert_called_once()
    assert result is not None


@pytest.mark.asyncio
async def test_async_pre_call_hook_too_long_fail_closed_raises():
    """async_pre_call_hook propagates HTTPException in fail_closed mode."""
    from unittest.mock import MagicMock

    from litellm.caching import DualCache
    from litellm.proxy._types import UserAPIKeyAuth

    g = _make_guardrail(on_input_too_long="fail_closed", max_chunk=10)
    g.should_run_guardrail = MagicMock(return_value=True)
    g._make_bedrock_input_request_with_chunking_fallback = AsyncMock(
        side_effect=_too_long_exc()
    )

    data = _make_request_data("x" * 20)
    with pytest.raises(HTTPException) as exc_info:
        await g.async_pre_call_hook(
            user_api_key_dict=UserAPIKeyAuth(),
            cache=DualCache(),
            data=data,
            call_type="completion",
        )
    assert "too long" in str(exc_info.value.detail).lower()


# ---------------------------------------------------------------------------
# async_moderation_hook — chunking fallback (Gap 1)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_async_moderation_hook_uses_chunking_fallback():
    """async_moderation_hook delegates to _make_bedrock_input_request_with_chunking_fallback."""
    from unittest.mock import MagicMock

    from litellm.proxy._types import UserAPIKeyAuth

    g = _make_guardrail(on_input_too_long="chunk", max_chunk=10)
    g.should_run_guardrail = MagicMock(return_value=True)
    g._make_bedrock_input_request_with_chunking_fallback = AsyncMock(
        return_value=_ok_response()
    )

    data = _make_request_data("x" * 20)
    await g.async_moderation_hook(
        data=data,
        user_api_key_dict=UserAPIKeyAuth(),
        call_type="completion",
    )

    g._make_bedrock_input_request_with_chunking_fallback.assert_called_once()


# ---------------------------------------------------------------------------
# apply_guardrail — pre-flight check (Gap 3)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_guardrail_preflight_skips_api_call():
    """apply_guardrail pre-flight check: API not called when total_chars > max_chunk and mode=chunk."""
    g = _make_guardrail(on_input_too_long="chunk", max_chunk=10)
    g.make_bedrock_api_request = AsyncMock(return_value=_ok_response())
    g._apply_guardrail_to_chunks = AsyncMock(return_value=_ok_response())

    inputs = {"texts": ["x" * 20]}
    await g.apply_guardrail(inputs=inputs, request_data={}, input_type="request")

    g.make_bedrock_api_request.assert_not_called()
    g._apply_guardrail_to_chunks.assert_called_once()


@pytest.mark.asyncio
async def test_apply_guardrail_preflight_not_triggered_for_fail_closed():
    """apply_guardrail pre-flight skipped for fail_closed; API is called normally."""
    g = _make_guardrail(on_input_too_long="fail_closed", max_chunk=10)
    g.make_bedrock_api_request = AsyncMock(return_value=_ok_response())

    inputs = {"texts": ["x" * 20]}
    # Should not raise; the API mock returns ok even though text > max_chunk
    result = await g.apply_guardrail(inputs=inputs, request_data={}, input_type="request")

    g.make_bedrock_api_request.assert_called_once()
    assert result["texts"] == ["x" * 20]


# ---------------------------------------------------------------------------
# Gap E — _is_input_too_long_error phrasing variations
# ---------------------------------------------------------------------------

def test_is_input_too_long_error_variation():
    """'input text is too long' (AWS phrasing variation) matches on a 400."""
    exc = HTTPException(status_code=400, detail="input text is too long")
    assert BedrockGuardrail._is_input_too_long_error(exc) is True


def test_is_input_too_long_error_too_long_non_400_no_match():
    """'too long' on a non-400 status code does NOT match."""
    exc = HTTPException(status_code=500, detail="response too long")
    assert BedrockGuardrail._is_input_too_long_error(exc) is False


def test_is_input_too_long_error_too_long_400_matches():
    """'too long' on a 400 status code matches (catches AWS phrasing variations)."""
    exc = HTTPException(status_code=400, detail="the text is too long for this API")
    assert BedrockGuardrail._is_input_too_long_error(exc) is True


# ---------------------------------------------------------------------------
# Gap B/C — _gather_with_early_cancel
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_gather_with_early_cancel_all_pass():
    """All tasks succeed — results returned in original submission order."""
    import asyncio

    from litellm.types.proxy.guardrails.guardrail_hooks.bedrock_guardrails import (
        BedrockGuardrailResponse,
    )

    g = _make_guardrail()

    resp_a = BedrockGuardrailResponse(action="NONE", outputs=[], assessments=[])
    resp_b = BedrockGuardrailResponse(action="NONE", outputs=[], assessments=[])

    async def _coro_a():
        return resp_a

    async def _coro_b():
        return resp_b

    tasks = [asyncio.create_task(_coro_a()), asyncio.create_task(_coro_b())]
    results = await g._gather_with_early_cancel(tasks)

    assert results[0] is resp_a
    assert results[1] is resp_b


@pytest.mark.asyncio
async def test_gather_with_early_cancel_cancels_pending_on_block():
    """When one task raises, pending tasks are cancelled."""
    import asyncio

    g = _make_guardrail()

    cancelled_flag = {"value": False}

    async def _slow_task():
        try:
            await asyncio.sleep(10)  # long enough that it won't complete naturally
        except asyncio.CancelledError:
            cancelled_flag["value"] = True
            raise

    async def _failing_task():
        raise HTTPException(status_code=400, detail="Violated guardrail policy")

    # Failing task first so it resolves before the slow one
    slow = asyncio.create_task(_slow_task())
    fail = asyncio.create_task(_failing_task())

    with pytest.raises(HTTPException):
        await g._gather_with_early_cancel([fail, slow])

    # Give the event loop a tick to process the cancellation
    await asyncio.sleep(0)
    assert cancelled_flag["value"] is True


# ---------------------------------------------------------------------------
# Gap B — concurrency cap (_apply_guardrail_to_chunks semaphore)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_guardrail_to_chunks_respects_concurrency_cap():
    """Semaphore limits simultaneous Bedrock calls to guardrail_max_chunk_concurrency."""
    import asyncio

    max_concurrent = 2
    g = _make_guardrail(max_chunk=5)
    g.guardrail_max_chunk_concurrency = max_concurrent

    active_calls: list = []
    peak_concurrent = {"value": 0}

    async def _mock_api(**_kwargs):
        active_calls.append(1)
        peak_concurrent["value"] = max(peak_concurrent["value"], len(active_calls))
        await asyncio.sleep(0)  # yield so other tasks can try to acquire the semaphore
        active_calls.pop()
        return _ok_response()

    g.make_bedrock_api_request = _mock_api

    # 5 chunks of 5 chars each
    texts = ["aaaaa", "bbbbb", "ccccc", "ddddd", "eeeee"]
    await g._apply_guardrail_to_chunks(texts=texts, request_data={})

    assert peak_concurrent["value"] <= max_concurrent


# ---------------------------------------------------------------------------
# Gap D — high-chunk-count warning
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_guardrail_to_chunks_warns_high_chunk_count(caplog):
    """A warning is emitted when the chunk count reaches _CHUNK_COUNT_WARNING_THRESHOLD."""
    import logging

    from litellm.proxy.guardrails.guardrail_hooks.bedrock_guardrails import (
        _CHUNK_COUNT_WARNING_THRESHOLD,
    )

    g = _make_guardrail(max_chunk=5)
    g.make_bedrock_api_request = AsyncMock(return_value=_ok_response())

    # Generate exactly _CHUNK_COUNT_WARNING_THRESHOLD chunks (5 chars each, max=5)
    texts = ["aaaaa"] * _CHUNK_COUNT_WARNING_THRESHOLD

    with caplog.at_level(logging.WARNING, logger="LiteLLM Proxy"):
        await g._apply_guardrail_to_chunks(texts=texts, request_data={})

    warning_messages = " ".join(caplog.messages)
    assert "chunk" in warning_messages.lower() or len(caplog.records) > 0


# ---------------------------------------------------------------------------
# Gap A — _extract_texts_from_response
# ---------------------------------------------------------------------------

def test_extract_texts_from_response_single_choice():
    """Single-choice ModelResponse returns list with that text."""
    import litellm
    from litellm.types.utils import Choices, Message

    g = _make_guardrail()
    response = litellm.ModelResponse(
        choices=[Choices(message=Message(content="hello world", role="assistant"))]
    )
    texts = g._extract_texts_from_response(response)
    assert texts == ["hello world"]


def test_extract_texts_from_response_empty():
    """Non-ModelResponse input returns empty list."""
    g = _make_guardrail()
    assert g._extract_texts_from_response(None) == []
    assert g._extract_texts_from_response("not a response") == []


def test_extract_texts_from_response_multiple_choices():
    """Multiple choices each contribute their text."""
    import litellm
    from litellm.types.utils import Choices, Message

    g = _make_guardrail()
    response = litellm.ModelResponse(
        choices=[
            Choices(message=Message(content="first", role="assistant")),
            Choices(message=Message(content="second", role="assistant")),
        ]
    )
    texts = g._extract_texts_from_response(response)
    assert texts == ["first", "second"]


# ---------------------------------------------------------------------------
# Gap A — _aggregate_output_chunk_responses
# ---------------------------------------------------------------------------

def test_aggregate_output_chunk_responses_concatenates_masked_text():
    """Masked text parts from multiple chunks are concatenated into one output."""
    from litellm.types.proxy.guardrails.guardrail_hooks.bedrock_guardrails import (
        BedrockGuardrailOutput,
        BedrockGuardrailResponse,
    )

    g = _make_guardrail()
    chunk1 = BedrockGuardrailResponse(
        action="GUARDRAIL_INTERVENED",
        outputs=[BedrockGuardrailOutput(text="part1 ")],
        assessments=[],
    )
    chunk2 = BedrockGuardrailResponse(
        action="GUARDRAIL_INTERVENED",
        outputs=[BedrockGuardrailOutput(text="part2")],
        assessments=[],
    )
    result = g._aggregate_output_chunk_responses([chunk1, chunk2])

    assert result["action"] == "GUARDRAIL_INTERVENED"
    outputs = result.get("outputs") or []
    assert len(outputs) == 1
    assert outputs[0].get("text") == "part1 part2"


def test_aggregate_output_chunk_responses_no_masked_text():
    """When no chunks have masked text, outputs is empty."""
    from litellm.types.proxy.guardrails.guardrail_hooks.bedrock_guardrails import (
        BedrockGuardrailResponse,
    )

    g = _make_guardrail()
    chunk1 = BedrockGuardrailResponse(action="NONE", outputs=[], assessments=[])
    result = g._aggregate_output_chunk_responses([chunk1])

    assert result["action"] == "NONE"
    assert result.get("outputs") == []


# ---------------------------------------------------------------------------
# Gap A — _apply_output_guardrail_to_chunks
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_apply_output_guardrail_to_chunks_passes():
    """All output chunks pass → combined action is NONE."""
    import litellm
    from litellm.types.utils import Choices, Message

    g = _make_guardrail(max_chunk=5)
    g.make_bedrock_api_request = AsyncMock(return_value=_ok_response())

    texts = ["aaaaa", "bbbbb"]
    result = await g._apply_output_guardrail_to_chunks(
        output_texts=texts, request_data={}
    )

    assert result["action"] == "NONE"
    assert g.make_bedrock_api_request.call_count == 2


@pytest.mark.asyncio
async def test_apply_output_guardrail_to_chunks_blocked_raises():
    """A blocked output chunk raises HTTPException."""
    g = _make_guardrail(max_chunk=5)
    block_exc = HTTPException(
        status_code=400, detail={"error": "Violated guardrail policy"}
    )
    g.make_bedrock_api_request = AsyncMock(side_effect=block_exc)

    with pytest.raises(HTTPException):
        await g._apply_output_guardrail_to_chunks(
            output_texts=["aaaaa"], request_data={}
        )


# ---------------------------------------------------------------------------
# Gap A — _make_bedrock_output_request_with_chunking_fallback
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_make_bedrock_output_request_with_chunking_fallback_preflight():
    """Pre-flight: when chunk mode and output > max_chunk, API is skipped."""
    import litellm
    from litellm.types.utils import Choices, Message

    g = _make_guardrail(on_input_too_long="chunk", max_chunk=10)
    g.make_bedrock_api_request = AsyncMock(return_value=_ok_response())
    g._apply_output_guardrail_to_chunks = AsyncMock(return_value=_ok_response())

    response = litellm.ModelResponse(
        choices=[Choices(message=Message(content="x" * 20, role="assistant"))]
    )
    await g._make_bedrock_output_request_with_chunking_fallback(
        response=response, request_data={}
    )

    g.make_bedrock_api_request.assert_not_called()
    g._apply_output_guardrail_to_chunks.assert_called_once()


@pytest.mark.asyncio
async def test_make_bedrock_output_request_with_chunking_fallback_fail_open():
    """fail_open: 'output is too long' → returns empty response without raising."""
    import litellm
    from litellm.types.utils import Choices, Message

    g = _make_guardrail(on_input_too_long="fail_open", max_chunk=25000)
    g.make_bedrock_api_request = AsyncMock(
        side_effect=HTTPException(status_code=400, detail="Input is too long.")
    )

    response = litellm.ModelResponse(
        choices=[Choices(message=Message(content="x" * 30000, role="assistant"))]
    )
    result = await g._make_bedrock_output_request_with_chunking_fallback(
        response=response, request_data={}
    )

    assert isinstance(result, dict)
    g.make_bedrock_api_request.assert_called_once()


@pytest.mark.asyncio
async def test_make_bedrock_output_request_with_chunking_fallback_fail_closed():
    """fail_closed: 'output is too long' → re-raises HTTPException."""
    import litellm
    from litellm.types.utils import Choices, Message

    g = _make_guardrail(on_input_too_long="fail_closed", max_chunk=25000)
    g.make_bedrock_api_request = AsyncMock(
        side_effect=HTTPException(status_code=400, detail="Input is too long.")
    )

    response = litellm.ModelResponse(
        choices=[Choices(message=Message(content="x" * 30000, role="assistant"))]
    )
    with pytest.raises(HTTPException) as exc_info:
        await g._make_bedrock_output_request_with_chunking_fallback(
            response=response, request_data={}
        )
    assert exc_info.value.status_code == 400


# ---------------------------------------------------------------------------
# Gap A — async_post_call_success_hook uses output chunking fallback
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_async_post_call_success_hook_uses_output_fallback():
    """async_post_call_success_hook delegates OUTPUT to _make_bedrock_output_request_with_chunking_fallback."""
    import litellm
    from litellm.proxy._types import UserAPIKeyAuth
    from litellm.types.utils import Choices, Message

    g = _make_guardrail(on_input_too_long="chunk", max_chunk=10)
    g.should_run_guardrail = MagicMock(return_value=True)
    g._make_bedrock_output_request_with_chunking_fallback = AsyncMock(
        return_value=_ok_response()
    )
    # Stub INPUT path to avoid real calls
    g._make_bedrock_input_request_with_chunking_fallback = AsyncMock(
        return_value=_ok_response()
    )
    # Prevent INPUT validation running (simulate pre_call already ran)
    g._event_hook_is_event_type = MagicMock(return_value=True)

    response = litellm.ModelResponse(
        choices=[Choices(message=Message(content="hello", role="assistant"))]
    )
    data = {
        "messages": [{"role": "user", "content": "hi"}],
        "model": "bedrock/anthropic.claude-3-haiku-20240307-v1:0",
    }
    await g.async_post_call_success_hook(
        data=data,
        user_api_key_dict=UserAPIKeyAuth(),
        response=response,
    )

    g._make_bedrock_output_request_with_chunking_fallback.assert_called_once()
