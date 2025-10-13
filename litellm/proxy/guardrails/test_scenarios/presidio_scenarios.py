"""
Predefined test scenarios for Presidio Guardrails (PII Detection).

Based on Presidio documentation and best practices for PII masking:
https://microsoft.github.io/presidio/
"""

from typing import Dict, List
from litellm.proxy.guardrails.models import TestScenario


# ============================================================================
# PII DETECTION SCENARIOS (Presidio-specific)
# ============================================================================

PRESIDIO_PII_SCENARIOS: List[TestScenario] = [
    TestScenario(
        scenario_id="presidio_email_basic",
        name="Basic Email Detection",
        description="Test detection of standard email addresses",
        test_content="Please send the report to john.doe@company.com and jane.smith@example.org",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["EMAIL_ADDRESS"],
        category="pii",
    ),
    TestScenario(
        scenario_id="presidio_phone_us",
        name="US Phone Number Detection",
        description="Test detection of various US phone number formats",
        test_content="Call me at (555) 123-4567 or 555-987-6543 or +1-555-246-8135",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["PHONE_NUMBER"],
        category="pii",
    ),
    TestScenario(
        scenario_id="presidio_credit_card",
        name="Credit Card Number Detection",
        description="Test detection of credit card numbers",
        test_content="My card number is 4532-1234-5678-9010 with expiry 12/25",
        content_source="INPUT",
        expected_detected=True,
        expected_action="BLOCKED",
        expected_entities=["CREDIT_CARD"],
        category="pii",
    ),
    TestScenario(
        scenario_id="presidio_ip_address",
        name="IP Address Detection",
        description="Test detection of IPv4 and IPv6 addresses",
        test_content="The server IP is 192.168.1.100 and IPv6 is 2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["IP_ADDRESS"],
        category="pii",
    ),
    TestScenario(
        scenario_id="presidio_person_name",
        name="Person Name Detection",
        description="Test detection of person names",
        test_content="John Smith and Mary Johnson attended the meeting with Dr. Robert Williams",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["PERSON"],
        category="pii",
    ),
    TestScenario(
        scenario_id="presidio_location",
        name="Location Detection",
        description="Test detection of locations and addresses",
        test_content="I live in New York City at 123 Main Street, and work in San Francisco",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["LOCATION"],
        category="pii",
    ),
    TestScenario(
        scenario_id="presidio_url",
        name="URL Detection",
        description="Test detection of URLs",
        test_content="Check out https://example.com/private/user/12345 for more details",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["URL"],
        category="pii",
    ),
    TestScenario(
        scenario_id="presidio_mixed_pii",
        name="Mixed PII Detection",
        description="Test detection of multiple PII types in one message",
        test_content=(
            "Hi, I'm John Doe and my email is john.doe@email.com. "
            "You can reach me at (555) 123-4567. "
            "My credit card is 4532-1234-5678-9010 and I live at 123 Oak St, Boston, MA."
        ),
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD", "LOCATION"],
        category="pii",
    ),
    TestScenario(
        scenario_id="presidio_medical_license",
        name="Medical License Detection",
        description="Test detection of medical license numbers",
        test_content="Dr. Smith's medical license number is ML123456789",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["MEDICAL_LICENSE"],
        category="pii",
    ),
    TestScenario(
        scenario_id="presidio_crypto_address",
        name="Cryptocurrency Address Detection",
        description="Test detection of cryptocurrency wallet addresses",
        test_content="Send Bitcoin to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["CRYPTO"],
        category="pii",
    ),
    TestScenario(
        scenario_id="presidio_iban",
        name="IBAN Detection",
        description="Test detection of International Bank Account Numbers",
        test_content="Transfer to IBAN: GB82 WEST 1234 5698 7654 32",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["IBAN_CODE"],
        category="pii",
    ),
    TestScenario(
        scenario_id="presidio_no_pii",
        name="No PII Present",
        description="Test that clean content without PII is not flagged",
        test_content="The weather today is sunny with a high of 75 degrees. Great day for a picnic!",
        content_source="INPUT",
        expected_detected=False,
        expected_action="NONE",
        expected_entities=[],
        category="pii",
    ),
]


# ============================================================================
# COUNTRY-SPECIFIC PII SCENARIOS
# ============================================================================

PRESIDIO_COUNTRY_SPECIFIC_SCENARIOS: List[TestScenario] = [
    TestScenario(
        scenario_id="presidio_us_ssn",
        name="US Social Security Number",
        description="Test detection of US SSN",
        test_content="My social security number is 123-45-6789",
        content_source="INPUT",
        expected_detected=True,
        expected_action="BLOCKED",
        expected_entities=["US_SSN"],
        category="pii_country_specific",
    ),
    TestScenario(
        scenario_id="presidio_us_passport",
        name="US Passport Number",
        description="Test detection of US passport numbers",
        test_content="My passport number is 123456789",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["US_PASSPORT"],
        category="pii_country_specific",
    ),
    TestScenario(
        scenario_id="presidio_us_drivers_license",
        name="US Driver's License",
        description="Test detection of US driver's license numbers",
        test_content="My driver's license is D1234567",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["US_DRIVER_LICENSE"],
        category="pii_country_specific",
    ),
    TestScenario(
        scenario_id="presidio_uk_nhs",
        name="UK NHS Number",
        description="Test detection of UK National Health Service numbers",
        test_content="My NHS number is 123 456 7890",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["UK_NHS"],
        category="pii_country_specific",
    ),
    TestScenario(
        scenario_id="presidio_uk_nino",
        name="UK National Insurance Number",
        description="Test detection of UK NINO",
        test_content="My National Insurance number is AB123456C",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["UK_NINO"],
        category="pii_country_specific",
    ),
]


# ============================================================================
# EDGE CASES AND SPECIAL SCENARIOS
# ============================================================================

PRESIDIO_EDGE_CASE_SCENARIOS: List[TestScenario] = [
    TestScenario(
        scenario_id="presidio_masked_pii",
        name="Already Masked PII",
        description="Test that already masked content is handled correctly",
        test_content="My email is j***@example.com and phone is (***) ***-1234",
        content_source="INPUT",
        expected_detected=False,
        expected_action="NONE",
        expected_entities=[],
        category="edge_cases",
    ),
    TestScenario(
        scenario_id="presidio_false_positive_numbers",
        name="Non-PII Numbers",
        description="Test that non-PII numbers are not incorrectly flagged",
        test_content="The meeting is in room 123 at 3:45 PM. Please bring document #456.",
        content_source="INPUT",
        expected_detected=False,
        expected_action="NONE",
        expected_entities=[],
        category="edge_cases",
    ),
    TestScenario(
        scenario_id="presidio_code_snippet",
        name="Code with Email-like Strings",
        description="Test that code snippets with email-like patterns are handled correctly",
        test_content="const email = user@domain.com; // This is just a variable name",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["EMAIL_ADDRESS"],
        category="edge_cases",
    ),
    TestScenario(
        scenario_id="presidio_date_time",
        name="Date and Time Information",
        description="Test detection of date/time information",
        test_content="The event is on 2024-12-25 at 14:30:00",
        content_source="INPUT",
        expected_detected=True,
        expected_action="ANONYMIZED",
        expected_entities=["DATE_TIME"],
        category="edge_cases",
    ),
]


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_presidio_test_scenarios(
    categories: List[str] | None = None,
) -> Dict[str, List[TestScenario]]:
    """
    Get Presidio test scenarios organized by category.

    Args:
        categories: List of category names to include. If None, returns all categories.
                   Valid categories: "pii", "pii_country_specific", "edge_cases"

    Returns:
        Dictionary mapping category names to lists of TestScenario objects
    """
    all_scenarios = {
        "pii": PRESIDIO_PII_SCENARIOS,
        "pii_country_specific": PRESIDIO_COUNTRY_SPECIFIC_SCENARIOS,
        "edge_cases": PRESIDIO_EDGE_CASE_SCENARIOS,
    }

    if categories is None:
        return all_scenarios

    return {
        category: scenarios
        for category, scenarios in all_scenarios.items()
        if category in categories
    }


def get_all_presidio_scenarios() -> List[TestScenario]:
    """Get all Presidio test scenarios as a flat list."""
    all_scenarios = get_presidio_test_scenarios()
    return [
        scenario
        for scenarios_list in all_scenarios.values()
        for scenario in scenarios_list
    ]


def get_presidio_scenarios_by_category(category: str) -> List[TestScenario]:
    """Get Presidio test scenarios for a specific category."""
    all_scenarios = get_presidio_test_scenarios()

    if category not in all_scenarios:
        valid_categories = ", ".join(all_scenarios.keys())
        raise ValueError(
            f"Invalid category '{category}'. Valid categories: {valid_categories}"
        )

    return all_scenarios[category]


def get_presidio_scenario_by_id(scenario_id: str) -> TestScenario | None:
    """Get a specific Presidio test scenario by its ID."""
    all_scenarios = get_all_presidio_scenarios()

    for scenario in all_scenarios:
        if scenario.scenario_id == scenario_id:
            return scenario

    return None
