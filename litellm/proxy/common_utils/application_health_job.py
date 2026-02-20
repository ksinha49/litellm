"""
Background job: poll health_check_url for every registered application and
update health_status / last_health_check_at in the database.

Poll interval: APPLICATION_HEALTH_CHECK_INTERVAL env var (default 300 s).
Health rule  : HTTP 200 → "healthy", any non-200 or network error → "unhealthy".
"""

import asyncio
import os
from datetime import datetime, timezone

import httpx

from litellm._logging import verbose_proxy_logger


class ApplicationHealthJob:
    TIMEOUT = 10  # seconds per request

    async def run(self) -> None:
        """Poll all apps that have a health_check_url and persist the result."""
        from litellm.proxy.proxy_server import prisma_client

        if prisma_client is None:
            return

        apps = await prisma_client.db.litellm_applicationtable.find_many(
            where={"health_check_url": {"not": None}}
        )

        if not apps:
            return

        tasks = [self._check_one(prisma_client, app) for app in apps]
        await asyncio.gather(*tasks, return_exceptions=True)

    async def _check_one(self, prisma_client, app) -> None:
        status = "unhealthy"
        try:
            async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                resp = await client.get(app.health_check_url)
            status = "healthy" if resp.status_code == 200 else "unhealthy"
        except Exception as e:
            verbose_proxy_logger.debug(
                "App health check failed for %s: %s", app.application_name, e
            )

        await prisma_client.db.litellm_applicationtable.update(
            where={"application_id": app.application_id},
            data={
                "health_status": status,
                "last_health_check_at": datetime.now(timezone.utc),
            },
        )
