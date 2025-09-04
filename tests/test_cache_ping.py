import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import litellm
from litellm.proxy.caching_routes import cache_ping


def test_cache_ping_disabled(monkeypatch):
    monkeypatch.setattr(litellm, "cache", None)
    response = asyncio.run(cache_ping())
    assert response.status == "disabled"
    assert response.cache_type == "none"
    assert "enable" in (response.set_cache_response or "").lower()
