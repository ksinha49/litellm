"""Utility modules for guardrail implementations."""

import re
from typing import Optional

from .retry_handler import (
    GuardrailRetryConfig,
    DEFAULT_BEDROCK_RETRY_CONFIG,
    async_retry_with_backoff,
)
from .chunking import (
    TextChunker,
    DEFAULT_BEDROCK_CHUNKER,
)

# Guardrail type normalization helpers (from utils.py)
# Copied here to avoid circular import issues between utils.py and utils/ package

GUARDRAIL_TYPE_ALIASES = {
    "bedrock": "bedrock",
    "aws_bedrock": "bedrock",
    "aws_bedrock_guardrails": "bedrock",
    "amazon_bedrock": "bedrock",
    "amazon_bedrock_guardrails": "bedrock",
    "bedrock_guardrails": "bedrock",
    "bedrock_guardrail": "bedrock",
    "presidio": "presidio",
    "presidio_guardrails": "presidio",
    "azure_presidio": "presidio",
    "microsoft_presidio": "presidio",
    "lakera": "lakera",
    "lakera_guardrails": "lakera",
    "lakera_guardrail": "lakera",
    "lakera_v2": "lakera",
    "lakera-v2": "lakera",
}

SUPPORTED_GUARDRAIL_TYPES = {"bedrock", "presidio", "lakera"}

_GUARDRAIL_SUFFIX_REGEX = re.compile(r"[-_\s]?guardrails?$")


def normalize_guardrail_type(value: Optional[str]) -> Optional[str]:
    """Return a canonical guardrail type when possible."""

    if value is None:
        return None

    normalized = value.strip().lower()
    if not normalized:
        return None

    alias = GUARDRAIL_TYPE_ALIASES.get(normalized)
    if alias:
        return alias

    without_suffix = _GUARDRAIL_SUFFIX_REGEX.sub("", normalized)
    if without_suffix:
        alias = GUARDRAIL_TYPE_ALIASES.get(without_suffix)
        if alias:
            return alias

    target = without_suffix or normalized

    if "bedrock" in target:
        return "bedrock"
    if "presidio" in target:
        return "presidio"
    if "lakera" in target:
        return "lakera"

    return target or None


__all__ = [
    "GuardrailRetryConfig",
    "DEFAULT_BEDROCK_RETRY_CONFIG",
    "async_retry_with_backoff",
    "TextChunker",
    "DEFAULT_BEDROCK_CHUNKER",
    "SUPPORTED_GUARDRAIL_TYPES",
    "normalize_guardrail_type",
    "GUARDRAIL_TYPE_ALIASES",
]
