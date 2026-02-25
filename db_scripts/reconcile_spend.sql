-- =============================================================================
-- reconcile_spend.sql
-- Nightly idempotent script to raise entity spend counters to match SpendLogs.
--
-- Strategy: only RAISE spend counters — never lower them.
--   • entity.spend < log_sum  → proxy failed to increment counter (race /
--     pod crash). Set to log_sum.
--   • entity.spend > log_sum  → logs are incomplete (old key re-issued, logs
--     pruned). Counter is probably correct. Leave untouched.
--
-- This is the conservative, safe direction: raising spend can cause an entity
-- to hit its budget limit sooner (correct behaviour), never the opposite.
--
-- Suggested cron schedule (run at 02:00 daily):
--   0 2 * * * PGPASSWORD=<password> psql \
--     "host=<host> dbname=<dbname> user=<user> sslmode=verify-full sslrootcert=/certs/global-bundle.pem" \
--     -f /opt/liteLLM/litellm/db_scripts/reconcile_spend.sql >> /var/log/litellm/reconcile_spend.log 2>&1
--
-- Safe to re-run at any time — all changes are idempotent within the
-- BEGIN/COMMIT transaction block.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- A: API Keys
-- ---------------------------------------------------------------------------

SELECT '== A: Reconciling undercounted API key spend ==' AS section;

-- Show keys that will be updated (preview before the UPDATE).
WITH log_totals AS (
    SELECT
        api_key,
        SUM(spend) AS log_spend_total
    FROM "LiteLLM_SpendLogs"
    WHERE api_key IS NOT NULL
      AND api_key <> ''
    GROUP BY api_key
)
SELECT
    vt.token,
    vt.key_alias,
    ROUND(COALESCE(vt.spend, 0)::numeric, 6)                          AS old_spend,
    ROUND(log_totals.log_spend_total::numeric, 6)                     AS new_spend,
    ROUND((log_totals.log_spend_total - COALESCE(vt.spend, 0))::numeric, 6) AS delta
FROM "LiteLLM_VerificationToken" vt
JOIN log_totals ON log_totals.api_key = vt.token
WHERE COALESCE(vt.spend, 0) < log_totals.log_spend_total - 0.001
ORDER BY delta DESC;

UPDATE "LiteLLM_VerificationToken" vt
SET
    spend      = log_totals.log_spend_total,
    updated_at = NOW()
FROM (
    SELECT api_key, SUM(spend) AS log_spend_total
    FROM "LiteLLM_SpendLogs"
    WHERE api_key IS NOT NULL AND api_key <> ''
    GROUP BY api_key
) log_totals
WHERE vt.token = log_totals.api_key
  AND COALESCE(vt.spend, 0) < log_totals.log_spend_total - 0.001;

SELECT '== A: Done — rows now reconciled (drift <= 0.001) ==' AS section;

SELECT COUNT(*) AS keys_now_reconciled
FROM "LiteLLM_VerificationToken" vt
JOIN (
    SELECT api_key, SUM(spend) AS log_spend_total
    FROM "LiteLLM_SpendLogs"
    WHERE api_key IS NOT NULL AND api_key <> ''
    GROUP BY api_key
) lt ON lt.api_key = vt.token
WHERE ABS(COALESCE(vt.spend, 0) - lt.log_spend_total) <= 0.001;

-- ---------------------------------------------------------------------------
-- B: Teams
-- ---------------------------------------------------------------------------

SELECT '== B: Reconciling undercounted team spend ==' AS section;

WITH log_totals AS (
    SELECT
        team_id,
        SUM(spend) AS log_spend_total
    FROM "LiteLLM_SpendLogs"
    WHERE team_id IS NOT NULL AND team_id <> ''
    GROUP BY team_id
)
SELECT
    tt.team_id,
    tt.team_alias,
    ROUND(COALESCE(tt.spend, 0)::numeric, 4)                          AS old_spend,
    ROUND(log_totals.log_spend_total::numeric, 4)                     AS new_spend,
    ROUND((log_totals.log_spend_total - COALESCE(tt.spend, 0))::numeric, 4) AS delta
FROM "LiteLLM_TeamTable" tt
JOIN log_totals ON log_totals.team_id = tt.team_id
WHERE COALESCE(tt.spend, 0) < log_totals.log_spend_total - 0.001
ORDER BY delta DESC;

UPDATE "LiteLLM_TeamTable" tt
SET
    spend      = log_totals.log_spend_total,
    updated_at = NOW()
FROM (
    SELECT team_id, SUM(spend) AS log_spend_total
    FROM "LiteLLM_SpendLogs"
    WHERE team_id IS NOT NULL AND team_id <> ''
    GROUP BY team_id
) log_totals
WHERE tt.team_id = log_totals.team_id
  AND COALESCE(tt.spend, 0) < log_totals.log_spend_total - 0.001;

SELECT '== B: Done ==' AS section;

-- ---------------------------------------------------------------------------
-- C: Users
-- ---------------------------------------------------------------------------

SELECT '== C: Reconciling undercounted user spend ==' AS section;

WITH log_totals AS (
    SELECT
        "user"     AS user_id,
        SUM(spend) AS log_spend_total
    FROM "LiteLLM_SpendLogs"
    WHERE "user" IS NOT NULL AND "user" <> ''
    GROUP BY "user"
)
SELECT
    ut.user_id,
    ROUND(COALESCE(ut.spend, 0)::numeric, 4)                          AS old_spend,
    ROUND(log_totals.log_spend_total::numeric, 4)                     AS new_spend,
    ROUND((log_totals.log_spend_total - COALESCE(ut.spend, 0))::numeric, 4) AS delta
FROM "LiteLLM_UserTable" ut
JOIN log_totals ON log_totals.user_id = ut.user_id
WHERE COALESCE(ut.spend, 0) < log_totals.log_spend_total - 0.001
ORDER BY delta DESC;

UPDATE "LiteLLM_UserTable" ut
SET
    spend      = log_totals.log_spend_total,
    updated_at = NOW()
FROM (
    SELECT "user" AS user_id, SUM(spend) AS log_spend_total
    FROM "LiteLLM_SpendLogs"
    WHERE "user" IS NOT NULL AND "user" <> ''
    GROUP BY "user"
) log_totals
WHERE ut.user_id = log_totals.user_id
  AND COALESCE(ut.spend, 0) < log_totals.log_spend_total - 0.001;

SELECT '== C: Done ==' AS section;

-- ---------------------------------------------------------------------------
-- D: Post-run verification — remaining drift rows with status labels.
--    After COMMIT, undercounted rows should be 0.  Overcounted rows are
--    expected and left untouched (logs are incomplete, counter is correct).
-- ---------------------------------------------------------------------------

SELECT '== D.1: Post-run API key drift ==' AS section;

WITH key_log_spend AS (
    SELECT api_key, SUM(spend) AS log_spend_total
    FROM "LiteLLM_SpendLogs"
    GROUP BY api_key
)
SELECT
    vt.token,
    vt.key_alias,
    ROUND(COALESCE(vt.spend, 0)::numeric, 6)            AS recorded_spend,
    ROUND(COALESCE(kls.log_spend_total, 0)::numeric, 6) AS log_spend_total,
    ROUND((COALESCE(vt.spend, 0) - COALESCE(kls.log_spend_total, 0))::numeric, 6) AS drift,
    CASE
        WHEN COALESCE(vt.spend, 0) > COALESCE(kls.log_spend_total, 0) + 0.001
            THEN 'OVERCOUNTED (logs incomplete — left untouched)'
        WHEN COALESCE(vt.spend, 0) < COALESCE(kls.log_spend_total, 0) - 0.001
            THEN 'STILL UNDERCOUNTED — fix failed'
        ELSE 'OK'
    END AS status
FROM "LiteLLM_VerificationToken" vt
LEFT JOIN key_log_spend kls ON kls.api_key = vt.token
WHERE ABS(COALESCE(vt.spend, 0) - COALESCE(kls.log_spend_total, 0)) > 0.001
ORDER BY drift DESC;

SELECT '== D.2: Post-run team drift ==' AS section;

WITH team_log_spend AS (
    SELECT team_id, SUM(spend) AS log_spend_total
    FROM "LiteLLM_SpendLogs"
    WHERE team_id IS NOT NULL
    GROUP BY team_id
)
SELECT
    tt.team_id,
    tt.team_alias,
    ROUND(COALESCE(tt.spend, 0)::numeric, 4)            AS recorded_spend,
    ROUND(COALESCE(tls.log_spend_total, 0)::numeric, 4) AS log_spend_total,
    ROUND((COALESCE(tt.spend, 0) - COALESCE(tls.log_spend_total, 0))::numeric, 4) AS drift,
    CASE
        WHEN COALESCE(tt.spend, 0) > COALESCE(tls.log_spend_total, 0) + 0.001
            THEN 'OVERCOUNTED (left untouched)'
        WHEN COALESCE(tt.spend, 0) < COALESCE(tls.log_spend_total, 0) - 0.001
            THEN 'STILL UNDERCOUNTED — fix failed'
        ELSE 'OK'
    END AS status
FROM "LiteLLM_TeamTable" tt
LEFT JOIN team_log_spend tls ON tls.team_id = tt.team_id
WHERE ABS(COALESCE(tt.spend, 0) - COALESCE(tls.log_spend_total, 0)) > 0.001
ORDER BY drift DESC;

SELECT '== D.3: Post-run user drift ==' AS section;

WITH user_log_spend AS (
    SELECT "user" AS user_id, SUM(spend) AS log_spend_total
    FROM "LiteLLM_SpendLogs"
    WHERE "user" IS NOT NULL
    GROUP BY "user"
)
SELECT
    ut.user_id,
    ROUND(COALESCE(ut.spend, 0)::numeric, 4)            AS recorded_spend,
    ROUND(COALESCE(uls.log_spend_total, 0)::numeric, 4) AS log_spend_total,
    ROUND((COALESCE(ut.spend, 0) - COALESCE(uls.log_spend_total, 0))::numeric, 4) AS drift,
    CASE
        WHEN COALESCE(ut.spend, 0) > COALESCE(uls.log_spend_total, 0) + 0.001
            THEN 'OVERCOUNTED (left untouched)'
        WHEN COALESCE(ut.spend, 0) < COALESCE(uls.log_spend_total, 0) - 0.001
            THEN 'STILL UNDERCOUNTED — fix failed'
        ELSE 'OK'
    END AS status
FROM "LiteLLM_UserTable" ut
LEFT JOIN user_log_spend uls ON uls.user_id = ut.user_id
WHERE ABS(COALESCE(ut.spend, 0) - COALESCE(uls.log_spend_total, 0)) > 0.001
ORDER BY drift DESC;

SELECT '== RECONCILE COMPLETE ==' AS section;

COMMIT;
