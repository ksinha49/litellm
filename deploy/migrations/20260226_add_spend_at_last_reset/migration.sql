-- Migration: Add spend_at_last_reset column to key, user, and team tables
--
-- Purpose: Fix spend mismatch caused by race condition between budget reset job and
-- batch-flush spend queue. Instead of zeroing spend on reset, we snapshot the current
-- spend as spend_at_last_reset. Period spend = spend - spend_at_last_reset.
--
-- This makes budget enforcement correct regardless of batch timing.

ALTER TABLE "LiteLLM_VerificationToken" ADD COLUMN IF NOT EXISTS "spend_at_last_reset" FLOAT NOT NULL DEFAULT 0;
ALTER TABLE "LiteLLM_UserTable" ADD COLUMN IF NOT EXISTS "spend_at_last_reset" FLOAT NOT NULL DEFAULT 0;
ALTER TABLE "LiteLLM_TeamTable" ADD COLUMN IF NOT EXISTS "spend_at_last_reset" FLOAT NOT NULL DEFAULT 0;
