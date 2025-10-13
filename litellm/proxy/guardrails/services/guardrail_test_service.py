"""
GuardrailTestService - Backend service for testing guardrails.

Provides functionality to test guardrail configurations before deployment.
"""

import time
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from litellm._logging import verbose_proxy_logger
from litellm.proxy._types import UserAPIKeyAuth
from litellm.proxy.guardrails.guardrail_hooks.bedrock_guardrails import BedrockGuardrail
from litellm.proxy.guardrails.guardrail_registry import GuardrailRegistry
from litellm.proxy.guardrails.models import (
    GuardrailTestRequest,
    GuardrailTestResponse,
    TestScenario,
    TestSuiteRequest,
    TestSuiteResponse,
    ValidationResult,
)
from litellm.proxy.utils import PrismaClient
from litellm.types.guardrails import Guardrail, LitellmParams, SupportedGuardrailIntegrations
from litellm.proxy.guardrails.services.guardrail_test_history_service import GuardrailTestHistoryService


class GuardrailTestService:
    """
    Service for testing guardrail configurations.

    Provides methods to run individual tests or test suites against guardrails.
    """

    def __init__(
        self,
        guardrail_registry: GuardrailRegistry,
        prisma_client: Optional[PrismaClient] = None,
        save_history: bool = True,
    ):
        """
        Initialize the test service.

        Args:
            guardrail_registry: Registry for managing guardrails
            prisma_client: Optional Prisma client for database operations
            save_history: Whether to save test results to history (default: True)
        """
        self.guardrail_registry = guardrail_registry
        self.prisma_client = prisma_client
        self.save_history = save_history
        self.history_service = GuardrailTestHistoryService(prisma_client) if save_history else None

    async def run_guardrail_test(
        self,
        request: GuardrailTestRequest,
    ) -> GuardrailTestResponse:
        """
        Run a single guardrail test.

        Args:
            request: Test request containing test content and guardrail info

        Returns:
            GuardrailTestResponse with test results
        """
        test_id = str(uuid.uuid4())
        start_time = time.time()

        # Validate request
        validation_result = await self._validate_test_request(request)
        if not validation_result.is_valid:
            return self._create_failed_test_response(
                test_id=test_id,
                guardrail_name="Unknown",
                request=request,
                validation_errors=validation_result.errors,
                duration_ms=(time.time() - start_time) * 1000,
            )

        # Load guardrail
        try:
            guardrail, guardrail_callback = await self._load_guardrail(request)
        except Exception as e:
            verbose_proxy_logger.error(
                f"Failed to load guardrail for testing: {str(e)}"
            )
            return self._create_failed_test_response(
                test_id=test_id,
                guardrail_name="Unknown",
                request=request,
                validation_errors=[f"Failed to load guardrail: {str(e)}"],
                duration_ms=(time.time() - start_time) * 1000,
            )

        guardrail_name = guardrail.get("guardrail_name", "Test Guardrail")

        # Execute guardrail test
        try:
            test_result = await self._execute_guardrail_test(
                guardrail_callback=guardrail_callback,
                test_content=request.test_content,
                content_source=request.content_source,
            )

            duration_ms = (time.time() - start_time) * 1000

            test_response = GuardrailTestResponse(
                test_id=test_id,
                guardrail_name=guardrail_name,
                test_scenario_name=request.test_scenario_name,
                content_source=request.content_source,
                detected=test_result.get("detected", False),
                action=test_result.get("action", "NONE"),
                assessment_details=test_result.get("assessment_details"),
                guardrail_coverage=test_result.get("guardrail_coverage"),
                guardrail_outputs=test_result.get("guardrail_outputs"),
                guardrail_usage=test_result.get("guardrail_usage"),
                action_reason=test_result.get("action_reason"),
                duration_ms=duration_ms,
                timestamp=datetime.utcnow(),
                passed_validation=True,
                validation_errors=[],
                test_content_preview=request.test_content[:200],
            )

            # Save to history if enabled
            if self.history_service:
                try:
                    guardrail_type = guardrail.get("litellm_params", {}).get("guardrail", "unknown")
                    await self.history_service.save_test_result(
                        test_result=test_response,
                        guardrail_id=request.guardrail_id,
                        guardrail_type=guardrail_type,
                        test_content=request.test_content,
                        created_by=None,  # TODO: Get from auth context
                    )
                except Exception as e:
                    verbose_proxy_logger.error(f"Failed to save test history: {str(e)}")

            return test_response

        except Exception as e:
            verbose_proxy_logger.error(f"Guardrail test execution failed: {str(e)}")
            duration_ms = (time.time() - start_time) * 1000
            return self._create_failed_test_response(
                test_id=test_id,
                guardrail_name=guardrail_name,
                request=request,
                validation_errors=[f"Test execution failed: {str(e)}"],
                duration_ms=duration_ms,
            )

    async def run_test_suite(
        self,
        request: TestSuiteRequest,
    ) -> TestSuiteResponse:
        """
        Run a suite of test scenarios.

        Args:
            request: Test suite request with scenarios to run

        Returns:
            TestSuiteResponse with aggregated results
        """
        suite_id = str(uuid.uuid4())
        start_time = time.time()

        # Run all test scenarios
        test_results: List[GuardrailTestResponse] = []

        for scenario in request.test_scenarios:
            # Convert TestScenario to GuardrailTestRequest
            test_request = GuardrailTestRequest(
                guardrail_id=request.guardrail_id,
                test_content=scenario.test_content,
                content_source=scenario.content_source,
                test_scenario_name=scenario.name,
            )

            # Run the test
            result = await self.run_guardrail_test(test_request)
            test_results.append(result)

        # Calculate pass/fail counts
        passed_tests = sum(1 for r in test_results if r.passed_validation)
        failed_tests = len(test_results) - passed_tests
        pass_rate = (passed_tests / len(test_results) * 100) if test_results else 0.0

        # Get guardrail name from first result
        guardrail_name = test_results[0].guardrail_name if test_results else "Unknown"

        total_duration_ms = (time.time() - start_time) * 1000

        return TestSuiteResponse(
            suite_id=suite_id,
            guardrail_name=guardrail_name,
            total_tests=len(test_results),
            passed_tests=passed_tests,
            failed_tests=failed_tests,
            pass_rate=pass_rate,
            test_results=test_results,
            total_duration_ms=total_duration_ms,
            timestamp=datetime.utcnow(),
        )

    async def _validate_test_request(
        self,
        request: GuardrailTestRequest,
    ) -> ValidationResult:
        """
        Validate a test request.

        Args:
            request: The test request to validate

        Returns:
            ValidationResult indicating if the request is valid
        """
        errors: List[str] = []
        warnings: List[str] = []

        # Check that either guardrail_id or guardrail_config is provided
        if not request.guardrail_id and not request.guardrail_config:
            errors.append("Either guardrail_id or guardrail_config must be provided")

        # Check that both are not provided
        if request.guardrail_id and request.guardrail_config:
            errors.append("Cannot provide both guardrail_id and guardrail_config")

        # Validate test content
        if not request.test_content or len(request.test_content.strip()) == 0:
            errors.append("test_content cannot be empty")

        # Check content size
        if len(request.test_content) > 50000:
            errors.append("test_content exceeds maximum size of 50KB")

        # If guardrail_id is provided, check if it exists
        guardrail_exists = None
        if request.guardrail_id and self.prisma_client:
            try:
                guardrail = await self.guardrail_registry.get_guardrail_by_id_from_db(
                    guardrail_id=request.guardrail_id,
                    prisma_client=self.prisma_client,
                )
                guardrail_exists = guardrail is not None
                if not guardrail_exists:
                    errors.append(
                        f"Guardrail with ID '{request.guardrail_id}' not found"
                    )
            except Exception as e:
                warnings.append(f"Could not verify guardrail existence: {str(e)}")

        is_valid = len(errors) == 0

        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            guardrail_exists=guardrail_exists,
        )

    async def _load_guardrail(
        self,
        request: GuardrailTestRequest,
    ) -> tuple[Guardrail, Any]:
        """
        Load a guardrail from ID or config.

        Args:
            request: Test request containing guardrail info

        Returns:
            Tuple of (Guardrail object, CustomGuardrail callback instance)
        """
        if request.guardrail_id:
            # Load from database
            if not self.prisma_client:
                raise ValueError("Prisma client required to load guardrail by ID")

            guardrail = await self.guardrail_registry.get_guardrail_by_id_from_db(
                guardrail_id=request.guardrail_id,
                prisma_client=self.prisma_client,
            )

            if not guardrail:
                raise ValueError(f"Guardrail '{request.guardrail_id}' not found")

            # Initialize the guardrail
            initialized_guardrail = self.guardrail_registry.initialize_guardrail(
                guardrail=guardrail
            )

            if not initialized_guardrail:
                raise ValueError("Failed to initialize guardrail")

            guardrail_id = initialized_guardrail.get("guardrail_id")
            guardrail_callback = self.guardrail_registry.guardrail_id_to_custom_guardrail.get(
                guardrail_id
            )

            return initialized_guardrail, guardrail_callback

        else:
            # Create from config
            if not request.guardrail_config:
                raise ValueError("guardrail_config is required when guardrail_id is not provided")

            # Create temporary guardrail
            temp_guardrail: Guardrail = {
                "guardrail_name": "Test Guardrail",
                "litellm_params": LitellmParams(**request.guardrail_config),
            }

            # Initialize the guardrail
            initialized_guardrail = self.guardrail_registry.initialize_guardrail(
                guardrail=temp_guardrail
            )

            if not initialized_guardrail:
                raise ValueError("Failed to initialize guardrail from config")

            guardrail_id = initialized_guardrail.get("guardrail_id")
            guardrail_callback = self.guardrail_registry.guardrail_id_to_custom_guardrail.get(
                guardrail_id
            )

            return initialized_guardrail, guardrail_callback

    async def _execute_guardrail_test(
        self,
        guardrail_callback: Any,
        test_content: str,
        content_source: str,
    ) -> Dict[str, Any]:
        """
        Execute a guardrail test.

        Args:
            guardrail_callback: The guardrail callback instance
            test_content: Content to test
            content_source: "INPUT" or "OUTPUT"

        Returns:
            Dictionary with test results
        """
        # Create mock request data
        if content_source == "INPUT":
            # Test pre-call (user input)
            data = {
                "messages": [
                    {"role": "user", "content": test_content}
                ],
                "model": "gpt-3.5-turbo",
            }
        else:
            # Test post-call (LLM output)
            data = {
                "messages": [
                    {"role": "assistant", "content": test_content}
                ],
                "model": "gpt-3.5-turbo",
            }

        # Create mock user API key dict
        user_api_key_dict = UserAPIKeyAuth()

        # Execute the guardrail
        try:
            if content_source == "INPUT":
                # Call pre-call hook
                if hasattr(guardrail_callback, "async_pre_call_hook"):
                    from litellm.caching.dual_cache import DualCache
                    cache = DualCache()

                    await guardrail_callback.async_pre_call_hook(
                        user_api_key_dict=user_api_key_dict,
                        cache=cache,
                        data=data,
                        call_type="completion",
                    )
            else:
                # Call moderation hook (post-call)
                if hasattr(guardrail_callback, "async_moderation_hook"):
                    await guardrail_callback.async_moderation_hook(
                        data=data,
                        user_api_key_dict=user_api_key_dict,
                        call_type="completion",
                    )

            # If no exception was raised, content passed
            return {
                "detected": False,
                "action": "NONE",
                "action_reason": "No policy violations detected",
            }

        except Exception as e:
            # Guardrail blocked or detected something
            error_message = str(e)

            # Parse Bedrock response if available
            detected = True
            action = "BLOCKED"
            assessment_details = None
            guardrail_coverage = None
            guardrail_outputs = None
            guardrail_usage = None

            # For Bedrock guardrails, extract detailed information
            if isinstance(guardrail_callback, BedrockGuardrail):
                # Try to extract guardrail response from exception
                if hasattr(e, "message") and "Guardrail intervened" in str(e):
                    action = "GUARDRAIL_INTERVENED"

                # Check if exception has guardrail metadata
                if hasattr(e, "__dict__"):
                    metadata = getattr(e, "__dict__", {})
                    assessment_details = metadata.get("assessment")
                    guardrail_coverage = metadata.get("guardrail_coverage")
                    guardrail_outputs = metadata.get("outputs")
                    guardrail_usage = metadata.get("usage")

            return {
                "detected": detected,
                "action": action,
                "action_reason": error_message,
                "assessment_details": assessment_details,
                "guardrail_coverage": guardrail_coverage,
                "guardrail_outputs": guardrail_outputs,
                "guardrail_usage": guardrail_usage,
            }

    def _create_failed_test_response(
        self,
        test_id: str,
        guardrail_name: str,
        request: GuardrailTestRequest,
        validation_errors: List[str],
        duration_ms: float,
    ) -> GuardrailTestResponse:
        """
        Create a failed test response.

        Args:
            test_id: Unique test ID
            guardrail_name: Name of the guardrail
            request: Original test request
            validation_errors: List of validation errors
            duration_ms: Test duration in milliseconds

        Returns:
            GuardrailTestResponse indicating test failure
        """
        return GuardrailTestResponse(
            test_id=test_id,
            guardrail_name=guardrail_name,
            test_scenario_name=request.test_scenario_name,
            content_source=request.content_source,
            detected=False,
            action="NONE",
            duration_ms=duration_ms,
            timestamp=datetime.utcnow(),
            passed_validation=False,
            validation_errors=validation_errors,
            test_content_preview=request.test_content[:200] if request.test_content else "",
        )
