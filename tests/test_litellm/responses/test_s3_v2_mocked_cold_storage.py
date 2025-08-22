import asyncio
import json
from datetime import datetime, timezone
from unittest.mock import MagicMock

from litellm.integrations.s3_v2 import S3Logger
from tests.logging_callback_tests.create_mock_standard_logging_payload import (
    create_standard_logging_payload,
)


class MockS3Client:
    def __init__(self):
        self.storage = {}

    async def put(self, url, data=None, headers=None):  # type: ignore[override]
        key = url.split("/")[-1]
        self.storage[key] = data
        class Resp:
            status_code = 200
            def raise_for_status(self):
                return None
        return Resp()

    async def get(self, url, headers=None):  # type: ignore[override]
        key = url.split("/")[-1]
        data = self.storage.get(key)
        class Resp:
            def __init__(self, data):
                self.status_code = 200 if data else 404
                self._data = data or ""
            def json(self):
                return json.loads(self._data)
            @property
            def text(self):
                return self._data
        return Resp(data)
def test_s3_logger_upload_and_retrieve_from_mocked_s3():
    """Verify S3Logger uploads to and retrieves from a mocked S3 service."""

    async def run_test():
        s3_logger = S3Logger(
            s3_bucket_name="test-bucket",
            s3_region_name="us-east-1",
            s3_aws_access_key_id="test",
            s3_aws_secret_access_key="test",
            s3_flush_interval=1,
        )
        s3_logger.async_httpx_client = MockS3Client()

        from botocore.credentials import Credentials

        s3_logger.get_credentials = MagicMock(  # type: ignore
            return_value=Credentials("AKID", "SECRET", "TOKEN")
        )

        payload = create_standard_logging_payload()
        start_time = datetime.now(timezone.utc)
        element = s3_logger.create_s3_batch_logging_element(start_time, payload)
        assert element is not None

        await s3_logger.async_upload_data_to_s3(element)

        result = await s3_logger.get_proxy_server_request_from_cold_storage_with_object_key(
            element.s3_object_key
        )

        assert result["id"] == payload["id"]

    asyncio.run(run_test())
