-- =============================================================================
-- fix_discrepancies.sql
-- Fixes identified by spend_diagnostic.sql run on 2026-02-25.
--
-- Run with:
--   PGPASSWORD='...' psql \
--     "host=... dbname=litellmdb user=ameritasadmin sslmode=verify-full sslrootcert=/certs/global-bundle.pem" \
--     -f db_scripts/fix_discrepancies.sql
--
-- All DML changes are wrapped in a single transaction.
-- If any statement fails the entire block rolls back automatically.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- SECTION A: View Fixes
-- ---------------------------------------------------------------------------
-- A.1  DailyTagSpend — add 30-day rolling filter.
--      Without this the view aggregates all historical data (Aug 2025 onward),
--      making it inconsistent with every other spend view and causing it to
--      return $28K in total tag spend when only ~$9.4K is within the window
--      consumers expect.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW litellm."DailyTagSpend" AS
SELECT
    jsonb_array_elements_text(request_tags) AS individual_request_tag,
    DATE(s."startTime")                      AS spend_date,
    COUNT(*)                                 AS log_count,
    SUM(spend)                               AS total_spend
FROM litellm."LiteLLM_SpendLogs" s
WHERE DATE(s."startTime") >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY individual_request_tag, DATE(s."startTime");

-- A.2  CalendarMonthGlobalSpend — new view anchored to the 1st of the current
--      calendar month.  MonthlyGlobalSpend is misnamed (it uses a rolling 30d
--      window); this view gives the true calendar-month figure that budget
--      enforcement actually uses.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW litellm."CalendarMonthGlobalSpend" AS
SELECT
    DATE("startTime") AS date,
    SUM("spend")      AS spend
FROM litellm."LiteLLM_SpendLogs"
WHERE "startTime" >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE("startTime");

SELECT '== A: Views recreated ==' AS fix_section;

-- ---------------------------------------------------------------------------
-- SECTION B: Create litellm-dashboard pseudo-team
-- ---------------------------------------------------------------------------
-- 342 keys carry team_id = 'litellm-dashboard' which does not exist in
-- LiteLLM_TeamTable.  The JOIN in LiteLLM_VerificationTokenView silently
-- drops team columns for all those keys.  Inserting a placeholder row fixes
-- the JOIN without touching the keys themselves.
-- ---------------------------------------------------------------------------

-- Columns reflect the deployed schema (pre-v1.81.13).
-- router_settings, access_group_ids, policies, soft_budget are not yet present.
INSERT INTO litellm."LiteLLM_TeamTable" (
    team_id,
    team_alias,
    admins,
    members,
    members_with_roles,
    metadata,
    spend,
    models,
    blocked,
    created_at,
    updated_at,
    model_spend,
    model_max_budget,
    team_member_permissions
) VALUES (
    'litellm-dashboard',
    'LiteLLM Dashboard (Internal)',
    ARRAY[]::text[],
    ARRAY[]::text[],
    '{}'::jsonb,
    '{"note": "auto-created by fix_discrepancies.sql to resolve orphaned key references"}'::jsonb,
    0.0,
    ARRAY[]::text[],
    false,
    NOW(),
    NOW(),
    '{}'::jsonb,
    '{}'::jsonb,
    ARRAY[]::text[]
)
ON CONFLICT (team_id) DO NOTHING;

SELECT '== B: litellm-dashboard team created (or already existed) ==' AS fix_section;

-- ---------------------------------------------------------------------------
-- SECTION C: Reconcile undercounted spend
-- ---------------------------------------------------------------------------
-- Strategy: only RAISE spend counters to match SpendLogs — never lower them.
--
--   • token.spend < log_sum  → proxy failed to increment counter (race /
--     pod crash). Set to log_sum.
--   • token.spend > log_sum  → logs are incomplete (old key re-issued, logs
--     pruned). Counter is probably correct. Leave untouched.
--
-- This is the conservative, safe direction: raising spend can cause an entity
-- to hit its budget limit sooner (correct behaviour), never the opposite.
-- ---------------------------------------------------------------------------

-- C.1  API Keys
SELECT '== C.1: Reconciling undercounted API key spend ==' AS fix_section;

WITH log_totals AS (
    SELECT
        api_key,
        SUM(spend) AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    WHERE api_key IS NOT NULL
      AND api_key <> ''
    GROUP BY api_key
),
before AS (
    SELECT
        vt.token,
        vt.key_alias,
        COALESCE(vt.spend, 0)          AS old_spend,
        log_totals.log_spend_total     AS new_spend
    FROM litellm."LiteLLM_VerificationToken" vt
    JOIN log_totals ON log_totals.api_key = vt.token
    WHERE COALESCE(vt.spend, 0) < log_totals.log_spend_total - 0.001
)
SELECT
    token,
    key_alias,
    ROUND(old_spend::numeric, 6)   AS old_spend,
    ROUND(new_spend::numeric, 6)   AS new_spend,
    ROUND((new_spend - old_spend)::numeric, 6) AS delta
FROM before
ORDER BY delta DESC;

UPDATE litellm."LiteLLM_VerificationToken" vt
SET
    spend      = log_totals.log_spend_total,
    updated_at = NOW()
FROM (
    SELECT api_key, SUM(spend) AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    WHERE api_key IS NOT NULL AND api_key <> ''
    GROUP BY api_key
) log_totals
WHERE vt.token = log_totals.api_key
  AND COALESCE(vt.spend, 0) < log_totals.log_spend_total - 0.001;

-- Rows-updated count for keys (within-transaction check)
SELECT COUNT(*) AS keys_now_reconciled
FROM litellm."LiteLLM_VerificationToken" vt
JOIN (
    SELECT api_key, SUM(spend) AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    WHERE api_key IS NOT NULL AND api_key <> ''
    GROUP BY api_key
) lt ON lt.api_key = vt.token
WHERE ABS(COALESCE(vt.spend, 0) - lt.log_spend_total) <= 0.001;

-- C.2  Teams
SELECT '== C.2: Reconciling undercounted team spend ==' AS fix_section;

WITH log_totals AS (
    SELECT
        team_id,
        SUM(spend) AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    WHERE team_id IS NOT NULL AND team_id <> ''
    GROUP BY team_id
),
before AS (
    SELECT
        tt.team_id,
        tt.team_alias,
        COALESCE(tt.spend, 0)          AS old_spend,
        log_totals.log_spend_total     AS new_spend
    FROM litellm."LiteLLM_TeamTable" tt
    JOIN log_totals ON log_totals.team_id = tt.team_id
    WHERE COALESCE(tt.spend, 0) < log_totals.log_spend_total - 0.001
)
SELECT
    team_id,
    team_alias,
    ROUND(old_spend::numeric, 4)   AS old_spend,
    ROUND(new_spend::numeric, 4)   AS new_spend,
    ROUND((new_spend - old_spend)::numeric, 4) AS delta
FROM before
ORDER BY delta DESC;

UPDATE litellm."LiteLLM_TeamTable" tt
SET
    spend      = log_totals.log_spend_total,
    updated_at = NOW()
FROM (
    SELECT team_id, SUM(spend) AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    WHERE team_id IS NOT NULL AND team_id <> ''
    GROUP BY team_id
) log_totals
WHERE tt.team_id = log_totals.team_id
  AND COALESCE(tt.spend, 0) < log_totals.log_spend_total - 0.001;

-- C.3  Users
SELECT '== C.3: Reconciling undercounted user spend ==' AS fix_section;

WITH log_totals AS (
    SELECT
        "user"      AS user_id,
        SUM(spend)  AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    WHERE "user" IS NOT NULL AND "user" <> ''
    GROUP BY "user"
),
before AS (
    SELECT
        ut.user_id,
        COALESCE(ut.spend, 0)          AS old_spend,
        log_totals.log_spend_total     AS new_spend
    FROM litellm."LiteLLM_UserTable" ut
    JOIN log_totals ON log_totals.user_id = ut.user_id
    WHERE COALESCE(ut.spend, 0) < log_totals.log_spend_total - 0.001
)
SELECT
    user_id,
    ROUND(old_spend::numeric, 4)   AS old_spend,
    ROUND(new_spend::numeric, 4)   AS new_spend,
    ROUND((new_spend - old_spend)::numeric, 4) AS delta
FROM before
ORDER BY delta DESC;

UPDATE litellm."LiteLLM_UserTable" ut
SET
    spend      = log_totals.log_spend_total,
    updated_at = NOW()
FROM (
    SELECT "user" AS user_id, SUM(spend) AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    WHERE "user" IS NOT NULL AND "user" <> ''
    GROUP BY "user"
) log_totals
WHERE ut.user_id = log_totals.user_id
  AND COALESCE(ut.spend, 0) < log_totals.log_spend_total - 0.001;

-- ---------------------------------------------------------------------------
-- SECTION D: Post-fix verification
-- ---------------------------------------------------------------------------
-- Re-run the same drift queries as Section 1 of the diagnostic.
-- After this script commits, the only remaining drift should be entities
-- where token.spend > log_sum (overcounted — left intentionally untouched).
-- ---------------------------------------------------------------------------

SELECT '== D.1: Post-fix API key drift (undercounted should be 0 rows) ==' AS fix_section;

WITH key_log_spend AS (
    SELECT api_key, SUM(spend) AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    GROUP BY api_key
)
SELECT
    vt.token,
    vt.key_alias,
    COALESCE(vt.spend, 0)            AS recorded_spend,
    COALESCE(kls.log_spend_total, 0) AS log_spend_total,
    COALESCE(vt.spend, 0) - COALESCE(kls.log_spend_total, 0) AS drift,
    CASE
        WHEN COALESCE(vt.spend, 0) > COALESCE(kls.log_spend_total, 0) + 0.001
            THEN 'OVERCOUNTED (logs incomplete — left untouched)'
        WHEN COALESCE(vt.spend, 0) < COALESCE(kls.log_spend_total, 0) - 0.001
            THEN 'STILL UNDERCOUNTED — fix failed'
        ELSE 'OK'
    END AS status
FROM litellm."LiteLLM_VerificationToken" vt
LEFT JOIN key_log_spend kls ON kls.api_key = vt.token
WHERE ABS(COALESCE(vt.spend, 0) - COALESCE(kls.log_spend_total, 0)) > 0.001
ORDER BY drift DESC;

SELECT '== D.2: Post-fix team drift ==' AS fix_section;

WITH team_log_spend AS (
    SELECT team_id, SUM(spend) AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    WHERE team_id IS NOT NULL
    GROUP BY team_id
)
SELECT
    tt.team_id,
    tt.team_alias,
    COALESCE(tt.spend, 0)            AS recorded_spend,
    COALESCE(tls.log_spend_total, 0) AS log_spend_total,
    COALESCE(tt.spend, 0) - COALESCE(tls.log_spend_total, 0) AS drift,
    CASE
        WHEN COALESCE(tt.spend, 0) > COALESCE(tls.log_spend_total, 0) + 0.001
            THEN 'OVERCOUNTED (left untouched)'
        WHEN COALESCE(tt.spend, 0) < COALESCE(tls.log_spend_total, 0) - 0.001
            THEN 'STILL UNDERCOUNTED — fix failed'
        ELSE 'OK'
    END AS status
FROM litellm."LiteLLM_TeamTable" tt
LEFT JOIN team_log_spend tls ON tls.team_id = tt.team_id
WHERE ABS(COALESCE(tt.spend, 0) - COALESCE(tls.log_spend_total, 0)) > 0.001
ORDER BY drift DESC;

SELECT '== D.3: Post-fix user drift ==' AS fix_section;

WITH user_log_spend AS (
    SELECT "user" AS user_id, SUM(spend) AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    WHERE "user" IS NOT NULL
    GROUP BY "user"
)
SELECT
    ut.user_id,
    COALESCE(ut.spend, 0)            AS recorded_spend,
    COALESCE(uls.log_spend_total, 0) AS log_spend_total,
    COALESCE(ut.spend, 0) - COALESCE(uls.log_spend_total, 0) AS drift,
    CASE
        WHEN COALESCE(ut.spend, 0) > COALESCE(uls.log_spend_total, 0) + 0.001
            THEN 'OVERCOUNTED (left untouched)'
        WHEN COALESCE(ut.spend, 0) < COALESCE(uls.log_spend_total, 0) - 0.001
            THEN 'STILL UNDERCOUNTED — fix failed'
        ELSE 'OK'
    END AS status
FROM litellm."LiteLLM_UserTable" ut
LEFT JOIN user_log_spend uls ON uls.user_id = ut.user_id
WHERE ABS(COALESCE(ut.spend, 0) - COALESCE(uls.log_spend_total, 0)) > 0.001
ORDER BY drift DESC;

SELECT '== D.4: litellm-dashboard team now exists ==' AS fix_section;

SELECT team_id, team_alias, spend, blocked, created_at
FROM litellm."LiteLLM_TeamTable"
WHERE team_id = 'litellm-dashboard';

SELECT '== D.5: DailyTagSpend — confirm only last-30-day rows remain ==' AS fix_section;

SELECT
    COUNT(*)                                                    AS total_rows,
    COUNT(*) FILTER (WHERE spend_date < CURRENT_DATE - INTERVAL '30 days') AS rows_older_than_30d,
    MIN(spend_date)                                             AS earliest_date,
    MAX(spend_date)                                             AS latest_date,
    SUM(total_spend)                                            AS total_spend
FROM litellm."DailyTagSpend";

SELECT '== D.6: CalendarMonthGlobalSpend sanity check ==' AS fix_section;

SELECT
    SUM(spend) AS calendar_month_spend,
    MIN(date)  AS from_date,
    MAX(date)  AS to_date
FROM litellm."CalendarMonthGlobalSpend";

SELECT '== ALL FIXES COMPLETE ==' AS fix_section;

COMMIT;
