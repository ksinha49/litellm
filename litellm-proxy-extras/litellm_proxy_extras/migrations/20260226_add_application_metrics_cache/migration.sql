-- Pre-computed application metrics cache table (5-min rolling refresh)
CREATE TABLE "LiteLLM_ApplicationMetricsCache" (
    "application_id" TEXT NOT NULL,
    "total_tokens"   BIGINT           NOT NULL DEFAULT 0,
    "total_cost"     DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "avg_latency_ms" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "error_rate"     DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "is_active"      BOOLEAN          NOT NULL DEFAULT false,
    "key_count"      INTEGER          NOT NULL DEFAULT 0,
    "window_days"    INTEGER          NOT NULL DEFAULT 30,
    "computed_at"    TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LiteLLM_ApplicationMetricsCache_pkey" PRIMARY KEY ("application_id")
);

CREATE INDEX "LiteLLM_ApplicationMetricsCache_computed_at_idx"
    ON "LiteLLM_ApplicationMetricsCache" ("computed_at");

-- Composite index on SpendLogs — eliminates full table scans on api_key filter
CREATE INDEX IF NOT EXISTS "LiteLLM_SpendLogs_api_key_startTime_idx"
    ON "LiteLLM_SpendLogs" ("api_key", "startTime");
