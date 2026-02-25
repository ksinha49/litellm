-- Add missing health-check columns to LiteLLM_ApplicationTable.
--
-- These columns are defined in schema.prisma (lines 283–285) but were
-- omitted from the 20260225131713_baseline_diff migration that created
-- the table.  Without them, ApplicationHealthJob raises:
--   prisma.errors.DataError: column 'LiteLLM_ApplicationTable.health_check_url' does not exist
--
ALTER TABLE "LiteLLM_ApplicationTable"
  ADD COLUMN IF NOT EXISTS "health_check_url"      TEXT,
  ADD COLUMN IF NOT EXISTS "health_status"         TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS "last_health_check_at"  TIMESTAMP(3);
