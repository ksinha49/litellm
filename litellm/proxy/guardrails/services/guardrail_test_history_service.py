"""
GuardrailTestHistoryService - Service for managing guardrail test history.

Provides functionality to save, retrieve, and analyze guardrail test history.
"""

import hashlib
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from litellm._logging import verbose_proxy_logger
from litellm.proxy.guardrails.models import GuardrailTestResponse
from litellm.proxy.utils import PrismaClient


class GuardrailTestHistoryService:
    """
    Service for managing guardrail test history.

    Handles saving test results to the database and retrieving historical data.
    """

    def __init__(self, prisma_client: Optional[PrismaClient] = None):
        """
        Initialize the test history service.

        Args:
            prisma_client: Prisma client for database operations
        """
        self.prisma_client = prisma_client

    def _hash_content(self, content: str) -> str:
        """
        Create SHA-256 hash of content for privacy.

        Args:
            content: Content to hash

        Returns:
            SHA-256 hash as hex string
        """
        return hashlib.sha256(content.encode('utf-8')).hexdigest()

    async def save_test_result(
        self,
        test_result: GuardrailTestResponse,
        guardrail_id: Optional[str] = None,
        guardrail_type: str = "unknown",
        test_content: str = "",
        created_by: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Save a test result to the history database.

        Args:
            test_result: The test result to save
            guardrail_id: ID of the guardrail tested (None for ad-hoc tests)
            guardrail_type: Type of guardrail (bedrock, presidio, etc.)
            test_content: The original test content
            created_by: User ID who ran the test

        Returns:
            Saved history record or None if database not available
        """
        if not self.prisma_client:
            verbose_proxy_logger.debug("Prisma client not available, skipping test history save")
            return None

        try:
            # Hash the test content for privacy
            content_hash = self._hash_content(test_content)

            # Create the history record
            history_record = await self.prisma_client.db.litellm_guardrailTestHistoryTable.create(
                data={
                    "test_id": test_result.test_id,
                    "guardrail_id": guardrail_id,
                    "guardrail_name": test_result.guardrail_name,
                    "guardrail_type": guardrail_type,
                    "test_scenario_name": test_result.test_scenario_name,
                    "content_source": test_result.content_source,
                    "test_content_hash": content_hash,
                    "test_content_preview": test_result.test_content_preview,
                    "detected": test_result.detected,
                    "action": test_result.action,
                    "action_reason": test_result.action_reason,
                    "assessment_details": test_result.assessment_details,
                    "guardrail_coverage": test_result.guardrail_coverage,
                    "guardrail_outputs": test_result.guardrail_outputs,
                    "guardrail_usage": test_result.guardrail_usage,
                    "duration_ms": test_result.duration_ms,
                    "passed_validation": test_result.passed_validation,
                    "validation_errors": test_result.validation_errors,
                    "created_by": created_by,
                }
            )

            verbose_proxy_logger.info(
                f"Saved test history record: {history_record.test_history_id}"
            )
            return dict(history_record)

        except Exception as e:
            verbose_proxy_logger.error(f"Failed to save test history: {str(e)}")
            return None

    async def get_test_history(
        self,
        guardrail_id: Optional[str] = None,
        guardrail_type: Optional[str] = None,
        created_by: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve test history with optional filters.

        Args:
            guardrail_id: Filter by guardrail ID
            guardrail_type: Filter by guardrail type
            created_by: Filter by user who created the test
            start_date: Filter tests after this date
            end_date: Filter tests before this date
            limit: Maximum number of records to return
            offset: Number of records to skip

        Returns:
            List of test history records
        """
        if not self.prisma_client:
            verbose_proxy_logger.debug("Prisma client not available")
            return []

        try:
            # Build the where clause
            where: Dict[str, Any] = {}

            if guardrail_id:
                where["guardrail_id"] = guardrail_id

            if guardrail_type:
                where["guardrail_type"] = guardrail_type

            if created_by:
                where["created_by"] = created_by

            # Date range filter
            if start_date or end_date:
                where["created_at"] = {}
                if start_date:
                    where["created_at"]["gte"] = start_date
                if end_date:
                    where["created_at"]["lte"] = end_date

            # Query the database
            history_records = await self.prisma_client.db.litellm_guardrailTestHistoryTable.find_many(
                where=where,
                order_by={"created_at": "desc"},
                take=limit,
                skip=offset,
            )

            return [dict(record) for record in history_records]

        except Exception as e:
            verbose_proxy_logger.error(f"Failed to retrieve test history: {str(e)}")
            return []

    async def get_test_history_by_id(
        self,
        test_history_id: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific test history record by ID.

        Args:
            test_history_id: The history record ID

        Returns:
            Test history record or None if not found
        """
        if not self.prisma_client:
            return None

        try:
            record = await self.prisma_client.db.litellm_guardrailTestHistoryTable.find_unique(
                where={"test_history_id": test_history_id}
            )

            return dict(record) if record else None

        except Exception as e:
            verbose_proxy_logger.error(f"Failed to get test history by ID: {str(e)}")
            return None

    async def get_test_statistics(
        self,
        guardrail_id: Optional[str] = None,
        guardrail_type: Optional[str] = None,
        days: int = 30,
    ) -> Dict[str, Any]:
        """
        Get statistics about test history.

        Args:
            guardrail_id: Filter by guardrail ID
            guardrail_type: Filter by guardrail type
            days: Number of days to look back

        Returns:
            Dictionary with statistics
        """
        if not self.prisma_client:
            return {}

        try:
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)

            # Build where clause
            where: Dict[str, Any] = {
                "created_at": {
                    "gte": start_date,
                    "lte": end_date,
                }
            }

            if guardrail_id:
                where["guardrail_id"] = guardrail_id

            if guardrail_type:
                where["guardrail_type"] = guardrail_type

            # Get all records in date range
            records = await self.prisma_client.db.litellm_guardrailTestHistoryTable.find_many(
                where=where
            )

            # Calculate statistics
            total_tests = len(records)
            if total_tests == 0:
                return {
                    "total_tests": 0,
                    "passed_tests": 0,
                    "failed_tests": 0,
                    "detection_rate": 0.0,
                    "average_duration_ms": 0.0,
                    "actions": {},
                }

            passed_tests = sum(1 for r in records if r.passed_validation)
            failed_tests = total_tests - passed_tests
            detected_count = sum(1 for r in records if r.detected)
            detection_rate = (detected_count / total_tests) * 100 if total_tests > 0 else 0.0

            # Average duration
            total_duration = sum(r.duration_ms for r in records)
            average_duration_ms = total_duration / total_tests if total_tests > 0 else 0.0

            # Action breakdown
            actions: Dict[str, int] = {}
            for record in records:
                action = record.action
                actions[action] = actions.get(action, 0) + 1

            return {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "detection_rate": round(detection_rate, 2),
                "average_duration_ms": round(average_duration_ms, 2),
                "actions": actions,
                "date_range": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat(),
                },
            }

        except Exception as e:
            verbose_proxy_logger.error(f"Failed to get test statistics: {str(e)}")
            return {}

    async def delete_old_history(
        self,
        days: int = 90,
    ) -> int:
        """
        Delete test history older than specified days.

        Args:
            days: Delete records older than this many days

        Returns:
            Number of records deleted
        """
        if not self.prisma_client:
            return 0

        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)

            result = await self.prisma_client.db.litellm_guardrailTestHistoryTable.delete_many(
                where={
                    "created_at": {
                        "lt": cutoff_date
                    }
                }
            )

            deleted_count = result if isinstance(result, int) else 0
            verbose_proxy_logger.info(
                f"Deleted {deleted_count} test history records older than {days} days"
            )
            return deleted_count

        except Exception as e:
            verbose_proxy_logger.error(f"Failed to delete old test history: {str(e)}")
            return 0
