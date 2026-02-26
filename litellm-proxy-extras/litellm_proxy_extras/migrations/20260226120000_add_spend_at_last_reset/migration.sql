-- Add spend_at_last_reset to track cumulative spend at the time of the last budget reset.
-- Period spend = spend - spend_at_last_reset (avoids zeroing spend, eliminating race condition
-- where queued spend flush arrives after reset and re-inflates the counter).

-- AlterTable
ALTER TABLE "LiteLLM_VerificationToken"
  ADD COLUMN IF NOT EXISTS "spend_at_last_reset" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "LiteLLM_UserTable"
  ADD COLUMN IF NOT EXISTS "spend_at_last_reset" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "LiteLLM_TeamTable"
  ADD COLUMN IF NOT EXISTS "spend_at_last_reset" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "LiteLLM_ApplicationTable"
  ADD COLUMN IF NOT EXISTS "health_check_url" TEXT;
