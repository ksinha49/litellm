import asyncio
import logging
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import httpx
import litellm
import pytest
import respx

from litellm.integrations.s3_v2 import S3Logger
from litellm.types.integrations.s3_v2 import s3BatchLoggingElement


@pytest.fixture(autouse=True)
def patch_asyncio_create_task(monkeypatch):
    class DummyTask:
        def cancel(self):
            pass

    def dummy_create_task(coro, *args, **kwargs):
        try:
            coro.close()
        except Exception:
            pass
        return DummyTask()

    monkeypatch.setattr(asyncio, "create_task", dummy_create_task)


@pytest.fixture(autouse=True)
def reset_s3_callback_params():
    original = getattr(litellm, "s3_callback_params", None)
    litellm.s3_callback_params = None
    yield
    litellm.s3_callback_params = original


@pytest.mark.parametrize("use_path_style", [False, True])
def test_upload_success(use_path_style, caplog):
    logger = S3Logger(
        s3_bucket_name="test-bucket",
        s3_region_name="us-east-1",
        s3_aws_access_key_id="id",
        s3_aws_secret_access_key="secret",
        s3_use_path_style=use_path_style,
    )

    element = s3BatchLoggingElement(
        payload={"hello": "world"},
        s3_object_key="test.json",
        s3_object_download_filename="test.json",
    )

    if use_path_style:
        url = "https://s3.us-east-1.amazonaws.com/test-bucket/test.json"
    else:
        url = "https://test-bucket.s3.us-east-1.amazonaws.com/test.json"

    with respx.mock(assert_all_called=True) as respx_mock:
        respx_mock.put(url).mock(return_value=httpx.Response(200))
        with caplog.at_level(logging.ERROR):
            logger.upload_data_to_s3(element)
    assert not caplog.records


@pytest.mark.parametrize("use_path_style", [False, True])
def test_upload_forbidden_logs_error(use_path_style, caplog):
    logger = S3Logger(
        s3_bucket_name="test-bucket",
        s3_region_name="us-east-1",
        s3_aws_access_key_id="id",
        s3_aws_secret_access_key="secret",
        s3_use_path_style=use_path_style,
    )

    element = s3BatchLoggingElement(
        payload={"hello": "world"},
        s3_object_key="test.json",
        s3_object_download_filename="test.json",
    )

    if use_path_style:
        url = "https://s3.us-east-1.amazonaws.com/test-bucket/test.json"
    else:
        url = "https://test-bucket.s3.us-east-1.amazonaws.com/test.json"

    with respx.mock(assert_all_called=True) as respx_mock:
        respx_mock.put(url).mock(return_value=httpx.Response(403, text="Forbidden"))
        with caplog.at_level(logging.ERROR):
            logger.upload_data_to_s3(element)

    assert any("'status_code': 403" in record.message for record in caplog.records)
    assert any("403 Forbidden" in record.message for record in caplog.records)


def test_upload_includes_optional_headers():
    logger = S3Logger(
        s3_bucket_name="test-bucket",
        s3_region_name="us-east-1",
        s3_aws_access_key_id="id",
        s3_aws_secret_access_key="secret",
        s3_server_side_encryption="aws:kms",
        s3_sse_kms_key_id="arn:aws:kms:us-east-1:123456789012:key/alias/test",
        s3_additional_headers={"x-amz-meta-team": "platform"},
    )

    element = s3BatchLoggingElement(
        payload={"hello": "world"},
        s3_object_key="test.json",
        s3_object_download_filename="test.json",
    )

    url = "https://test-bucket.s3.us-east-1.amazonaws.com/test.json"

    with respx.mock(assert_all_called=True) as respx_mock:
        route = respx_mock.put(url).mock(return_value=httpx.Response(200))
        logger.upload_data_to_s3(element)

    sent_headers = route.calls.last.request.headers
    assert sent_headers["x-amz-server-side-encryption"] == "aws:kms"
    assert (
        sent_headers["x-amz-server-side-encryption-aws-kms-key-id"]
        == "arn:aws:kms:us-east-1:123456789012:key/alias/test"
    )
    assert sent_headers["x-amz-meta-team"] == "platform"
