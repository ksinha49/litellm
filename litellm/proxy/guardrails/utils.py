"""Utility helpers for guardrail features."""

from __future__ import annotations

import re
from typing import Optional

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
