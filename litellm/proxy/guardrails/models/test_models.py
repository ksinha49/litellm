"""
Pydantic models for guardrail testing functionality.

Provides request/response models for testing guardrail configurations
before deployment.
"""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class GuardrailTestRequest(BaseModel):
    """Request model for testing a guardrail configuration."""

    guardrail_id: Optional[str] = Field(
        default=None,
        description="ID of existing guardrail to test. Mutually exclusive with guardrail_config."
    )
    guardrail_config: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Guardrail configuration to test (for testing before creation). Mutually exclusive with guardrail_id."
    )
    test_content: str = Field(
        ...,
        min_length=1,
        max_length=50000,  # 50KB max for testing
        description="Content to test against the guardrail"
    )
    content_source: Literal["INPUT", "OUTPUT"] = Field(
        default="INPUT",
        description="Whether this is input content (user prompt) or output content (LLM response)"
    )
    test_scenario_name: Optional[str] = Field(
        default=None,
        description="Optional name for this test scenario (e.g., 'PII Detection Test')"
    )


class GuardrailTestResponse(BaseModel):
    """Response model for guardrail test results."""

    test_id: str = Field(
        ...,
        description="Unique identifier for this test run"
    )
    guardrail_name: str = Field(
        ...,
        description="Name of the guardrail that was tested"
    )
    test_scenario_name: Optional[str] = Field(
        default=None,
        description="Name of the test scenario, if provided"
    )
    content_source: str = Field(
        ...,
        description="Whether content was INPUT or OUTPUT"
    )
    detected: bool = Field(
        ...,
        description="Whether the guardrail detected policy violations"
    )
    action: str = Field(
        ...,
        description="Action taken by guardrail: BLOCKED, ANONYMIZED, GUARDRAIL_INTERVENED, or NONE"
    )
    assessment_details: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Detailed policy assessment results"
    )
    guardrail_coverage: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Coverage statistics (characters/images guarded)"
    )
    guardrail_outputs: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Filtered/masked outputs from guardrail"
    )
    guardrail_usage: Optional[Dict[str, int]] = Field(
        default=None,
        description="API usage statistics (units consumed)"
    )
    action_reason: Optional[str] = Field(
        default=None,
        description="Reason for the guardrail action"
    )
    duration_ms: float = Field(
        ...,
        description="Test execution time in milliseconds"
    )
    timestamp: datetime = Field(
        ...,
        description="When the test was executed"
    )
    passed_validation: bool = Field(
        ...,
        description="Whether the test passed pre-execution validation"
    )
    validation_errors: List[str] = Field(
        default_factory=list,
        description="Validation errors encountered"
    )
    test_content_preview: str = Field(
        ...,
        description="Preview of the tested content (first 200 chars)"
    )


class TestScenario(BaseModel):
    """Represents a single test scenario."""

    scenario_id: str = Field(
        ...,
        description="Unique identifier for the scenario"
    )
    name: str = Field(
        ...,
        description="Display name for the scenario"
    )
    description: str = Field(
        ...,
        description="Description of what this scenario tests"
    )
    test_content: str = Field(
        ...,
        description="Content to test"
    )
    content_source: Literal["INPUT", "OUTPUT"] = Field(
        default="INPUT",
        description="Whether this is INPUT or OUTPUT content"
    )
    expected_detected: bool = Field(
        ...,
        description="Whether detection is expected"
    )
    expected_action: Optional[str] = Field(
        default=None,
        description="Expected action (BLOCKED, ANONYMIZED, etc.)"
    )
    expected_entities: Optional[List[str]] = Field(
        default=None,
        description="Expected entities to be detected (e.g., ['SSN', 'EMAIL'])"
    )
    category: str = Field(
        default="general",
        description="Category of test (e.g., 'pii', 'toxic_content', 'prompt_injection')"
    )


class TestSuiteRequest(BaseModel):
    """Request to run a suite of test scenarios."""

    guardrail_id: str = Field(
        ...,
        description="ID of guardrail to test"
    )
    test_scenarios: List[TestScenario] = Field(
        ...,
        min_length=1,
        description="List of test scenarios to run"
    )
    run_parallel: bool = Field(
        default=False,
        description="Whether to run tests in parallel (faster but uses more API calls)"
    )


class TestSuiteResponse(BaseModel):
    """Response from running a test suite."""

    suite_id: str = Field(
        ...,
        description="Unique identifier for this test suite run"
    )
    guardrail_name: str = Field(
        ...,
        description="Name of the guardrail tested"
    )
    total_tests: int = Field(
        ...,
        description="Total number of tests run"
    )
    passed_tests: int = Field(
        ...,
        description="Number of tests that passed"
    )
    failed_tests: int = Field(
        ...,
        description="Number of tests that failed"
    )
    pass_rate: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Percentage of tests passed"
    )
    test_results: List[GuardrailTestResponse] = Field(
        ...,
        description="Individual test results"
    )
    total_duration_ms: float = Field(
        ...,
        description="Total execution time in milliseconds"
    )
    timestamp: datetime = Field(
        ...,
        description="When the suite was executed"
    )


class ValidationResult(BaseModel):
    """Result of guardrail configuration validation."""

    is_valid: bool = Field(
        ...,
        description="Whether the configuration is valid"
    )
    errors: List[str] = Field(
        default_factory=list,
        description="Validation errors"
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="Validation warnings"
    )
    guardrail_exists: Optional[bool] = Field(
        default=None,
        description="Whether the guardrail exists in the provider (e.g., AWS)"
    )
    credentials_valid: Optional[bool] = Field(
        default=None,
        description="Whether credentials are valid"
    )
    permissions_valid: Optional[bool] = Field(
        default=None,
        description="Whether IAM permissions are sufficient"
    )


class PredefinedTestScenariosResponse(BaseModel):
    """Response containing predefined test scenarios for a guardrail type."""

    guardrail_type: str = Field(
        ...,
        description="Type of guardrail (e.g., 'bedrock', 'presidio')"
    )
    scenario_categories: Dict[str, List[TestScenario]] = Field(
        ...,
        description="Test scenarios grouped by category"
    )
    total_scenarios: int = Field(
        ...,
        description="Total number of scenarios available"
    )


class GuardrailTestHistoryRecord(BaseModel):
    """Individual test history record."""

    test_history_id: str = Field(
        ...,
        description="Unique identifier for this history record"
    )
    test_id: str = Field(
        ...,
        description="Test execution ID"
    )
    guardrail_id: Optional[str] = Field(
        default=None,
        description="Guardrail ID (null for ad-hoc tests)"
    )
    guardrail_name: str = Field(
        ...,
        description="Name of the guardrail"
    )
    guardrail_type: str = Field(
        ...,
        description="Type of guardrail (bedrock, presidio, lakera, etc.)"
    )
    test_scenario_name: Optional[str] = Field(
        default=None,
        description="Test scenario name"
    )
    content_source: str = Field(
        ...,
        description="INPUT or OUTPUT"
    )
    test_content_hash: str = Field(
        ...,
        description="SHA-256 hash of test content"
    )
    test_content_preview: str = Field(
        ...,
        description="First 200 characters of test content"
    )
    detected: bool = Field(
        ...,
        description="Whether guardrail detected violations"
    )
    action: str = Field(
        ...,
        description="Action taken by guardrail"
    )
    action_reason: Optional[str] = Field(
        default=None,
        description="Reason for the action"
    )
    assessment_details: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Detailed assessment"
    )
    guardrail_coverage: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Coverage statistics"
    )
    guardrail_outputs: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Guardrail outputs"
    )
    guardrail_usage: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Usage statistics"
    )
    duration_ms: float = Field(
        ...,
        description="Test duration in milliseconds"
    )
    passed_validation: bool = Field(
        ...,
        description="Whether test passed validation"
    )
    validation_errors: Optional[List[str]] = Field(
        default=None,
        description="Validation errors"
    )
    created_at: datetime = Field(
        ...,
        description="When the test was run"
    )
    created_by: Optional[str] = Field(
        default=None,
        description="User who ran the test"
    )


class TestHistoryListResponse(BaseModel):
    """Response containing list of test history records."""

    total_count: int = Field(
        ...,
        description="Total number of records matching filters"
    )
    records: List[GuardrailTestHistoryRecord] = Field(
        ...,
        description="Test history records"
    )
    limit: int = Field(
        ...,
        description="Maximum records returned"
    )
    offset: int = Field(
        ...,
        description="Number of records skipped"
    )


class TestStatisticsResponse(BaseModel):
    """Response containing test statistics."""

    total_tests: int = Field(
        ...,
        description="Total number of tests"
    )
    passed_tests: int = Field(
        ...,
        description="Number of tests that passed validation"
    )
    failed_tests: int = Field(
        ...,
        description="Number of tests that failed validation"
    )
    detection_rate: float = Field(
        ...,
        description="Percentage of tests where guardrail detected violations"
    )
    average_duration_ms: float = Field(
        ...,
        description="Average test duration in milliseconds"
    )
    actions: Dict[str, int] = Field(
        ...,
        description="Breakdown of actions taken (BLOCKED: 5, NONE: 10, etc.)"
    )
    date_range: Dict[str, str] = Field(
        ...,
        description="Date range for the statistics"
    )
