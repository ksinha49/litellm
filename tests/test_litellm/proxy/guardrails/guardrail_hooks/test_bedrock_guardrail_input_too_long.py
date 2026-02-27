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
