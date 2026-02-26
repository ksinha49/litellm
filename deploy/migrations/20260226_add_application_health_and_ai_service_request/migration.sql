-- Migration: Add health columns to LiteLLM_ApplicationTable + LiteLLM_AIServiceRequest table
--
-- health_check_url / health_status / last_health_check_at are defined in
-- litellm/proxy/schema.prisma (package schema) but were missing from the
-- local schema.prisma, causing a Prisma DataError on startup.
--
-- LiteLLM_AIServiceRequest is a new table used for async AI service tracking.

SET search_path TO litellm;

ALTER TABLE "LiteLLM_ApplicationTable"
  ADD COLUMN IF NOT EXISTS health_check_url     TEXT,
  ADD COLUMN IF NOT EXISTS health_status        TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS last_health_check_at TIMESTAMP WITHOUT TIME ZONE;

CREATE TABLE IF NOT EXISTS "LiteLLM_AIServiceRequest" (
  request_id    TEXT        NOT NULL,
  service_type  TEXT,
  path          TEXT,
  status        TEXT        NOT NULL DEFAULT 'accepted',
  request_body  JSONB       DEFAULT '{}',
  response_body JSONB,
  error         TEXT,
  api_key       TEXT        NOT NULL DEFAULT '',
  user_id       TEXT,
  team_id       TEXT,
  org_id        TEXT,
  cost          DOUBLE PRECISION DEFAULT 0.0,
  created_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LiteLLM_AIServiceRequest_pkey" PRIMARY KEY (request_id)
);

CREATE INDEX IF NOT EXISTS "LiteLLM_AIServiceRequest_status_idx"     ON "LiteLLM_AIServiceRequest" (status);
CREATE INDEX IF NOT EXISTS "LiteLLM_AIServiceRequest_user_id_idx"    ON "LiteLLM_AIServiceRequest" (user_id);
CREATE INDEX IF NOT EXISTS "LiteLLM_AIServiceRequest_team_id_idx"    ON "LiteLLM_AIServiceRequest" (team_id);
CREATE INDEX IF NOT EXISTS "LiteLLM_AIServiceRequest_created_at_idx" ON "LiteLLM_AIServiceRequest" (created_at);
