-- Add composite indexes on LiteLLM_SpendLogs for analytics date-range queries.
-- Note: CONCURRENTLY is incompatible with Prisma's transaction-wrapped migrations;
-- plain CREATE INDEX is used here instead.
CREATE INDEX IF NOT EXISTS "LiteLLM_SpendLogs_model_startTime_idx"
    ON "LiteLLM_SpendLogs" ("model", "startTime");

CREATE INDEX IF NOT EXISTS "LiteLLM_SpendLogs_team_id_startTime_idx"
    ON "LiteLLM_SpendLogs" ("team_id", "startTime");
