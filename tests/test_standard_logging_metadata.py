import pathlib
import sys

REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from litellm.litellm_core_utils.litellm_logging import (  # noqa: E402
    StandardLoggingPayloadSetup,
    get_standard_logging_metadata,
)
from litellm.types.utils import (  # noqa: E402
    StandardLoggingGuardrailInformation,
    StandardLoggingMetadata,
)


def test_get_standard_logging_metadata_preserves_guardrail_information():
    guardrail_metadata: StandardLoggingGuardrailInformation = {
        "guardrail_name": "test-guardrail",
        "guardrail_status": "success",
        "detected": True,
    }
    metadata = {
        "standard_logging_guardrail_information": guardrail_metadata,
    }

    assert (
        "standard_logging_guardrail_information"
        in StandardLoggingMetadata.__annotations__
    )

    result = StandardLoggingPayloadSetup.get_standard_logging_metadata(metadata)

    assert (
        result.get("standard_logging_guardrail_information") == guardrail_metadata
    )


def test_module_level_get_standard_logging_metadata_includes_guardrail_information():
    guardrail_metadata: StandardLoggingGuardrailInformation = {
        "guardrail_name": "module-guardrail",
        "guardrail_status": "failure",
    }

    metadata = {
        "standard_logging_guardrail_information": guardrail_metadata,
    }

    assert (
        "standard_logging_guardrail_information"
        in StandardLoggingMetadata.__annotations__
    )

    result = get_standard_logging_metadata(metadata)

    assert (
        result.get("standard_logging_guardrail_information") == guardrail_metadata
    )
