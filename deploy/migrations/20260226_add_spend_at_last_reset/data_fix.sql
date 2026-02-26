-- Data fix: Set spend_at_last_reset baseline for Nathan's key
--
-- Nathan.DeGroff@ameritas.com's key has all-time spend = $213.27.
-- Of that, $39.52 is January spend that leaked due to the race condition.
-- February (current period) spend is $173.75.
--
-- Setting spend_at_last_reset = 39.515442945 aligns the baseline so that:
--   period_spend = 213.27 - 39.515442945 ≈ $173.75  (matches usage page)
--
-- Run this AFTER applying migration.sql.

UPDATE "LiteLLM_VerificationToken"
SET spend_at_last_reset = 39.515442945
WHERE token LIKE '17a0d8e17bcc3666641f%';

-- Verify:
-- SELECT token, spend, spend_at_last_reset,
--        spend - spend_at_last_reset AS period_spend
-- FROM "LiteLLM_VerificationToken"
-- WHERE token LIKE '17a0d8e17bcc3666641f%';
