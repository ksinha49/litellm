"""
Background job: pre-compute per-application metrics and store them in
LiteLLM_ApplicationMetricsCache for fast serving by the /application/health
and /application/{id}/metrics endpoints.

Runs every APPLICATION_METRICS_CACHE_INTERVAL seconds (default 300 = 5 min).
One SQL query aggregates all apps; results are upserted into the cache table.
"""

from datetime import datetime, timezone

from litellm._logging import verbose_proxy_logger


class ApplicationMetricsCacheJob:
    WINDOW_DAYS = 30

    async def run(self) -> None:
        """Aggregate metrics for all applications in one SQL pass and upsert cache."""
        from litellm.proxy.proxy_server import prisma_client

        if prisma_client is None:
            return

        try:
            rows = await prisma_client.db.query_raw(
                """
                SELECT
                    a.application_id,
                    COUNT(DISTINCT vt.token)::int                                AS key_count,
                    COALESCE(SUM(sl.total_tokens), 0)::bigint                    AS total_tokens,
                    COALESCE(SUM(sl.spend), 0.0)                                 AS total_cost,
                    COALESCE(AVG(
                        CASE WHEN sl."completionStartTime" IS NOT NULL
                             THEN EXTRACT(EPOCH FROM
                                  (sl."completionStartTime" - sl."startTime")) * 1000
                        END), 0.0)                                               AS avg_latency_ms,
                    COALESCE(
                        SUM(CASE WHEN sl.status = 'failure' THEN 1 ELSE 0 END
                            )::float / NULLIF(COUNT(sl.request_id), 0),
                        0.0)                                                     AS error_rate,
                    COALESCE(
                        MAX(sl."startTime") >= NOW() - INTERVAL '24 hours',
                        false)                                                   AS is_active
                FROM "LiteLLM_ApplicationTable" a
                LEFT JOIN "LiteLLM_VerificationToken" vt
                       ON vt.application_id = a.application_id
                LEFT JOIN "LiteLLM_SpendLogs" sl
                       ON sl.api_key = vt.token
                      AND sl."startTime" >= NOW() - INTERVAL '30 days'
                GROUP BY a.application_id
                """
            )

            now = datetime.now(timezone.utc)
            for row in rows:
                await prisma_client.db.litellm_applicationmetricscache.upsert(
                    where={"application_id": row["application_id"]},
                    data={
                        "create": {
                            "application_id": row["application_id"],
                            "key_count": row["key_count"],
                            "total_tokens": row["total_tokens"],
                            "total_cost": row["total_cost"],
                            "avg_latency_ms": row["avg_latency_ms"],
                            "error_rate": row["error_rate"],
                            "is_active": row["is_active"],
                            "window_days": self.WINDOW_DAYS,
                            "computed_at": now,
                        },
                        "update": {
                            "key_count": row["key_count"],
                            "total_tokens": row["total_tokens"],
                            "total_cost": row["total_cost"],
                            "avg_latency_ms": row["avg_latency_ms"],
                            "error_rate": row["error_rate"],
                            "is_active": row["is_active"],
                            "window_days": self.WINDOW_DAYS,
                            "computed_at": now,
                        },
                    },
                )

            verbose_proxy_logger.debug(
                f"ApplicationMetricsCacheJob: upserted {len(rows)} app(s)"
            )
        except Exception as e:
            verbose_proxy_logger.warning(
                f"ApplicationMetricsCacheJob failed: {e}"
            )
