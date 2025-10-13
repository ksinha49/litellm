"""
Unit tests for GuardrailTestService.

Tests the guardrail testing service functionality including validation,
test execution, and test suite management.
"""

import asyncio
import pytest
import sys
from pathlib import Path
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Any, Dict, Optional

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from litellm.proxy.guardrails.services.guardrail_test_service import GuardrailTestService
from litellm.proxy.guardrails.models import (
    GuardrailTestRequest,
    GuardrailTestResponse,
    TestScenario,
    TestSuiteRequest,
    TestSuiteResponse,
    ValidationResult,
)
from litellm.proxy.guardrails.guardrail_registry import GuardrailRegistry
from litellm.types.guardrails import Guardrail, LitellmParams


# =============================================================================
# FIXTURES
# =============================================================================

@pytest.fixture
def mock_guardrail_registry():
    """Mock GuardrailRegistry for testing."""
    registry = MagicMock(spec=GuardrailRegistry)
    return registry


@pytest.fixture
def mock_prisma_client():
    """Mock Prisma client for database operations."""
    client = MagicMock()
    return client


@pytest.fixture
def test_service(mock_guardrail_registry, mock_prisma_client):
    """Create GuardrailTestService instance for testing."""
    return GuardrailTestService(
        guardrail_registry=mock_guardrail_registry,
        prisma_client=mock_prisma_client,
    )


@pytest.fixture
def sample_guardrail():
    """Sample guardrail configuration."""
    return {
        "guardrail_id": "test-guardrail-123",
        "guardrail_name": "Test Bedrock Guardrail",
        "litellm_params": LitellmParams(
            guardrail="bedrock",
            mode="pre_call",
            guardrailIdentifier="test-id",
            guardrailVersion="DRAFT",
            aws_region_name="us-east-1",
        ),
        "guardrail_info": {"description": "Test guardrail"},
    }


@pytest.fixture
def sample_test_request():
    """Sample test request."""
    return GuardrailTestRequest(
        guardrail_id="test-guardrail-123",
        test_content="My SSN is 123-45-6789",
        content_source="INPUT",
        test_scenario_name="SSN Detection Test",
    )


@pytest.fixture
def sample_test_scenarios():
    """Sample test scenarios for suite testing."""
    return [
        TestScenario(
            scenario_id="pii_ssn",
            name="SSN Detection",
            description="Test SSN detection",
            test_content="My SSN is 123-45-6789",
            content_source="INPUT",
            expected_detected=True,
            expected_action="BLOCKED",
            category="pii",
        ),
        TestScenario(
            scenario_id="clean_content",
            name="Clean Content",
            description="Test clean content",
            test_content="Hello, how are you?",
            content_source="INPUT",
            expected_detected=False,
            category="general",
        ),
    ]


# =============================================================================
# VALIDATION TESTS
# =============================================================================

@pytest.mark.asyncio
async def test_validate_test_request_success(test_service, sample_test_request, mock_guardrail_registry, sample_guardrail):
    """Test successful request validation."""
    # Mock guardrail existence check
    mock_guardrail_registry.get_guardrail_by_id_from_db = AsyncMock(return_value=sample_guardrail)

    result = await test_service._validate_test_request(sample_test_request)

    assert result.is_valid is True
    assert len(result.errors) == 0
    assert result.guardrail_exists is True


@pytest.mark.asyncio
async def test_validate_test_request_no_guardrail_id_or_config(test_service):
    """Test validation fails when neither guardrail_id nor guardrail_config is provided."""
    request = GuardrailTestRequest(
        test_content="Test content",
        content_source="INPUT",
    )

    result = await test_service._validate_test_request(request)

    assert result.is_valid is False
    assert "Either guardrail_id or guardrail_config must be provided" in result.errors


@pytest.mark.asyncio
async def test_validate_test_request_both_id_and_config(test_service):
    """Test validation fails when both guardrail_id and guardrail_config are provided."""
    request = GuardrailTestRequest(
        guardrail_id="test-id",
        guardrail_config={"guardrail": "bedrock", "mode": "pre_call"},
        test_content="Test content",
        content_source="INPUT",
    )

    result = await test_service._validate_test_request(request)

    assert result.is_valid is False
    assert "Cannot provide both guardrail_id and guardrail_config" in result.errors


@pytest.mark.asyncio
async def test_validate_test_request_empty_content(test_service):
    """Test validation fails with empty test content."""
    request = GuardrailTestRequest(
        guardrail_id="test-id",
        test_content="",
        content_source="INPUT",
    )

    result = await test_service._validate_test_request(request)

    assert result.is_valid is False
    assert "test_content cannot be empty" in result.errors


@pytest.mark.asyncio
async def test_validate_test_request_content_too_large(test_service):
    """Test validation fails when content exceeds size limit."""
    request = GuardrailTestRequest(
        guardrail_id="test-id",
        test_content="x" * 60000,  # Exceeds 50KB limit
        content_source="INPUT",
    )

    result = await test_service._validate_test_request(request)

    assert result.is_valid is False
    assert "exceeds maximum size" in result.errors[0]


@pytest.mark.asyncio
async def test_validate_test_request_guardrail_not_found(test_service, mock_guardrail_registry):
    """Test validation fails when guardrail doesn't exist."""
    # Mock guardrail not found
    mock_guardrail_registry.get_guardrail_by_id_from_db = AsyncMock(return_value=None)

    request = GuardrailTestRequest(
        guardrail_id="nonexistent-id",
        test_content="Test content",
        content_source="INPUT",
    )

    result = await test_service._validate_test_request(request)

    assert result.is_valid is False
    assert "not found" in result.errors[0]


# =============================================================================
# LOAD GUARDRAIL TESTS
# =============================================================================

@pytest.mark.asyncio
async def test_load_guardrail_by_id(test_service, mock_guardrail_registry, sample_guardrail):
    """Test loading guardrail by ID."""
    # Mock guardrail retrieval
    mock_guardrail_registry.get_guardrail_by_id_from_db = AsyncMock(return_value=sample_guardrail)
    mock_guardrail_registry.initialize_guardrail = MagicMock(return_value=sample_guardrail)

    mock_callback = MagicMock()
    mock_guardrail_registry.guardrail_id_to_custom_guardrail = {"test-guardrail-123": mock_callback}

    request = GuardrailTestRequest(
        guardrail_id="test-guardrail-123",
        test_content="Test",
        content_source="INPUT",
    )

    guardrail, callback = await test_service._load_guardrail(request)

    assert guardrail is not None
    assert callback == mock_callback
    mock_guardrail_registry.get_guardrail_by_id_from_db.assert_called_once()
    mock_guardrail_registry.initialize_guardrail.assert_called_once()


@pytest.mark.asyncio
async def test_load_guardrail_by_config(test_service, mock_guardrail_registry):
    """Test loading guardrail from config."""
    temp_guardrail = {
        "guardrail_id": "temp-id",
        "guardrail_name": "Test Guardrail",
        "litellm_params": LitellmParams(
            guardrail="bedrock",
            mode="pre_call",
            guardrailIdentifier="test-id",
            guardrailVersion="DRAFT",
            aws_region_name="us-east-1",
        ),
    }

    mock_guardrail_registry.initialize_guardrail = MagicMock(return_value=temp_guardrail)
    mock_callback = MagicMock()
    mock_guardrail_registry.guardrail_id_to_custom_guardrail = {"temp-id": mock_callback}

    request = GuardrailTestRequest(
        guardrail_config={
            "guardrail": "bedrock",
            "mode": "pre_call",
            "guardrailIdentifier": "test-id",
            "guardrailVersion": "DRAFT",
            "aws_region_name": "us-east-1",
        },
        test_content="Test",
        content_source="INPUT",
    )

    guardrail, callback = await test_service._load_guardrail(request)

    assert guardrail is not None
    assert callback == mock_callback
    mock_guardrail_registry.initialize_guardrail.assert_called_once()


@pytest.mark.asyncio
async def test_load_guardrail_not_found(test_service, mock_guardrail_registry):
    """Test error when guardrail cannot be loaded."""
    mock_guardrail_registry.get_guardrail_by_id_from_db = AsyncMock(return_value=None)

    request = GuardrailTestRequest(
        guardrail_id="nonexistent-id",
        test_content="Test",
        content_source="INPUT",
    )

    with pytest.raises(ValueError, match="not found"):
        await test_service._load_guardrail(request)


# =============================================================================
# TEST EXECUTION TESTS
# =============================================================================

@pytest.mark.asyncio
async def test_execute_guardrail_test_content_passed(test_service):
    """Test guardrail execution when content passes."""
    mock_callback = AsyncMock()
    mock_callback.async_pre_call_hook = AsyncMock(return_value=None)  # No exception = passed

    result = await test_service._execute_guardrail_test(
        guardrail_callback=mock_callback,
        test_content="Hello, world!",
        content_source="INPUT",
    )

    assert result["detected"] is False
    assert result["action"] == "NONE"
    assert "No policy violations detected" in result["action_reason"]


@pytest.mark.asyncio
async def test_execute_guardrail_test_content_blocked(test_service):
    """Test guardrail execution when content is blocked."""
    mock_callback = AsyncMock()

    # Simulate guardrail blocking content
    async def mock_hook(*args, **kwargs):
        raise Exception("Content blocked due to policy violation")

    mock_callback.async_pre_call_hook = mock_hook

    result = await test_service._execute_guardrail_test(
        guardrail_callback=mock_callback,
        test_content="Malicious content",
        content_source="INPUT",
    )

    assert result["detected"] is True
    assert result["action"] == "BLOCKED"
    assert "blocked" in result["action_reason"].lower()


# =============================================================================
# TEST SUITE TESTS
# =============================================================================

@pytest.mark.asyncio
async def test_run_test_suite(test_service, sample_test_scenarios, mock_guardrail_registry, sample_guardrail):
    """Test running a test suite with multiple scenarios."""
    # Mock guardrail loading
    mock_guardrail_registry.get_guardrail_by_id_from_db = AsyncMock(return_value=sample_guardrail)
    mock_guardrail_registry.initialize_guardrail = MagicMock(return_value=sample_guardrail)

    mock_callback = AsyncMock()
    mock_callback.async_pre_call_hook = AsyncMock(return_value=None)  # All tests pass
    mock_guardrail_registry.guardrail_id_to_custom_guardrail = {
        sample_guardrail["guardrail_id"]: mock_callback
    }

    request = TestSuiteRequest(
        guardrail_id=sample_guardrail["guardrail_id"],
        test_scenarios=sample_test_scenarios,
        run_parallel=False,
    )

    result = await test_service.run_test_suite(request)

    assert isinstance(result, TestSuiteResponse)
    assert result.total_tests == 2
    assert result.guardrail_name == sample_guardrail["guardrail_name"]
    assert len(result.test_results) == 2
    assert result.pass_rate >= 0.0
    assert result.pass_rate <= 100.0


# =============================================================================
# FAILED TEST RESPONSE TESTS
# =============================================================================

def test_create_failed_test_response(test_service, sample_test_request):
    """Test creating a failed test response."""
    response = test_service._create_failed_test_response(
        test_id="test-123",
        guardrail_name="Test Guardrail",
        request=sample_test_request,
        validation_errors=["Error 1", "Error 2"],
        duration_ms=100.0,
    )

    assert isinstance(response, GuardrailTestResponse)
    assert response.test_id == "test-123"
    assert response.guardrail_name == "Test Guardrail"
    assert response.passed_validation is False
    assert len(response.validation_errors) == 2
    assert response.detected is False
    assert response.action == "NONE"


# =============================================================================
# INTEGRATION TESTS
# =============================================================================

@pytest.mark.asyncio
async def test_run_guardrail_test_end_to_end(test_service, sample_test_request, mock_guardrail_registry, sample_guardrail):
    """Test complete guardrail test execution flow."""
    # Mock all dependencies
    mock_guardrail_registry.get_guardrail_by_id_from_db = AsyncMock(return_value=sample_guardrail)
    mock_guardrail_registry.initialize_guardrail = MagicMock(return_value=sample_guardrail)

    mock_callback = AsyncMock()
    mock_callback.async_pre_call_hook = AsyncMock(return_value=None)
    mock_guardrail_registry.guardrail_id_to_custom_guardrail = {
        sample_guardrail["guardrail_id"]: mock_callback
    }

    result = await test_service.run_guardrail_test(sample_test_request)

    assert isinstance(result, GuardrailTestResponse)
    assert result.guardrail_name == sample_guardrail["guardrail_name"]
    assert result.test_scenario_name == sample_test_request.test_scenario_name
    assert result.content_source == sample_test_request.content_source
    assert result.passed_validation is True
    assert result.duration_ms > 0


@pytest.mark.asyncio
async def test_run_guardrail_test_validation_failure(test_service):
    """Test guardrail test with validation failure."""
    # Invalid request (no guardrail_id or config)
    request = GuardrailTestRequest(
        test_content="Test content",
        content_source="INPUT",
    )

    result = await test_service.run_guardrail_test(request)

    assert isinstance(result, GuardrailTestResponse)
    assert result.passed_validation is False
    assert len(result.validation_errors) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
