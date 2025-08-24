import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from litellm.constants import LITELLM_SETTINGS_SAFE_DB_OVERRIDES


def test_store_audit_logs_override_present():
    assert "store_audit_logs" in LITELLM_SETTINGS_SAFE_DB_OVERRIDES
