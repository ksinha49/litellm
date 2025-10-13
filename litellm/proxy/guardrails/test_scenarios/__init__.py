"""Test scenarios for guardrail testing."""

from .bedrock_scenarios import (
    get_bedrock_test_scenarios,
    BEDROCK_PII_SCENARIOS,
    BEDROCK_TOXIC_CONTENT_SCENARIOS,
    BEDROCK_PROMPT_INJECTION_SCENARIOS,
    BEDROCK_SENSITIVE_TOPICS_SCENARIOS,
)
from .presidio_scenarios import (
    get_presidio_test_scenarios,
    PRESIDIO_PII_SCENARIOS,
    PRESIDIO_COUNTRY_SPECIFIC_SCENARIOS,
    PRESIDIO_EDGE_CASE_SCENARIOS,
)
from .lakera_scenarios import (
    get_lakera_test_scenarios,
    LAKERA_PROMPT_INJECTION_SCENARIOS,
    LAKERA_JAILBREAK_SCENARIOS,
    LAKERA_INDIRECT_INJECTION_SCENARIOS,
)

__all__ = [
    # Bedrock
    "get_bedrock_test_scenarios",
    "BEDROCK_PII_SCENARIOS",
    "BEDROCK_TOXIC_CONTENT_SCENARIOS",
    "BEDROCK_PROMPT_INJECTION_SCENARIOS",
    "BEDROCK_SENSITIVE_TOPICS_SCENARIOS",
    # Presidio
    "get_presidio_test_scenarios",
    "PRESIDIO_PII_SCENARIOS",
    "PRESIDIO_COUNTRY_SPECIFIC_SCENARIOS",
    "PRESIDIO_EDGE_CASE_SCENARIOS",
    # Lakera
    "get_lakera_test_scenarios",
    "LAKERA_PROMPT_INJECTION_SCENARIOS",
    "LAKERA_JAILBREAK_SCENARIOS",
    "LAKERA_INDIRECT_INJECTION_SCENARIOS",
]
