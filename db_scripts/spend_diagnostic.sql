-- =============================================================================
-- LiteLLM Spend Data Diagnostic Script
-- Generated for PostgreSQL. Run with: psql -f spend_diagnostic.sql
-- All table references use the 'litellm' schema prefix.
-- No psql meta-commands (\echo, \x, etc.) are used — pure SQL only.
-- =============================================================================

-- =============================================================================
-- SECTION 1: Spend Drift Detection
-- Compares the cumulative spend column on each entity table against
-- the sum of raw SpendLogs entries for the same entity.
-- Drift > 0.001 is flagged as significant.
-- =============================================================================

-- 1.1 API Key spend drift
-- LiteLLM_VerificationToken.spend vs SUM(SpendLogs.spend) per api_key
SELECT
    '== SECTION 1.1: API Key Spend Drift (|drift| > 0.001) ==' AS diagnostic_section;

WITH key_log_spend AS (
    SELECT
        api_key,
        SUM(spend) AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    GROUP BY api_key
),
key_drift AS (
    SELECT
        vt.token                                  AS token,
        vt.key_alias,
        vt.team_id,
        COALESCE(vt.spend, 0)                     AS recorded_spend,
        COALESCE(kls.log_spend_total, 0)          AS log_spend_total,
        COALESCE(vt.spend, 0)
            - COALESCE(kls.log_spend_total, 0)    AS drift
    FROM litellm."LiteLLM_VerificationToken" vt
    LEFT JOIN key_log_spend kls
        ON kls.api_key = vt.token
)
SELECT
    token,
    key_alias,
    team_id,
    recorded_spend,
    log_spend_total,
    drift,
    CASE
        WHEN drift > 0 THEN 'token.spend HIGHER than logs'
        WHEN drift < 0 THEN 'token.spend LOWER than logs'
        ELSE 'exact match'
    END AS drift_direction
FROM key_drift
WHERE ABS(drift) > 0.001
ORDER BY ABS(drift) DESC;


-- 1.2 Team spend drift
-- LiteLLM_TeamTable.spend vs SUM(SpendLogs.spend) per team_id
SELECT
    '== SECTION 1.2: Team Spend Drift (|drift| > 0.001) ==' AS diagnostic_section;

WITH team_log_spend AS (
    SELECT
        team_id,
        SUM(spend) AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    WHERE team_id IS NOT NULL
    GROUP BY team_id
),
team_drift AS (
    SELECT
        tt.team_id,
        tt.team_alias,
        COALESCE(tt.spend, 0)                     AS recorded_spend,
        COALESCE(tls.log_spend_total, 0)          AS log_spend_total,
        COALESCE(tt.spend, 0)
            - COALESCE(tls.log_spend_total, 0)    AS drift
    FROM litellm."LiteLLM_TeamTable" tt
    LEFT JOIN team_log_spend tls
        ON tls.team_id = tt.team_id
)
SELECT
    team_id,
    team_alias,
    recorded_spend,
    log_spend_total,
    drift,
    CASE
        WHEN drift > 0 THEN 'team.spend HIGHER than logs'
        WHEN drift < 0 THEN 'team.spend LOWER than logs'
        ELSE 'exact match'
    END AS drift_direction
FROM team_drift
WHERE ABS(drift) > 0.001
ORDER BY ABS(drift) DESC;


-- 1.3 User spend drift
-- LiteLLM_UserTable.spend vs SUM(SpendLogs.spend) WHERE "user" = user_id
SELECT
    '== SECTION 1.3: User Spend Drift (|drift| > 0.001) ==' AS diagnostic_section;

WITH user_log_spend AS (
    SELECT
        "user"          AS user_id,
        SUM(spend)      AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs"
    WHERE "user" IS NOT NULL
    GROUP BY "user"
),
user_drift AS (
    SELECT
        ut.user_id,
        COALESCE(ut.spend, 0)                     AS recorded_spend,
        COALESCE(uls.log_spend_total, 0)          AS log_spend_total,
        COALESCE(ut.spend, 0)
            - COALESCE(uls.log_spend_total, 0)    AS drift
    FROM litellm."LiteLLM_UserTable" ut
    LEFT JOIN user_log_spend uls
        ON uls.user_id = ut.user_id
)
SELECT
    user_id,
    recorded_spend,
    log_spend_total,
    drift,
    CASE
        WHEN drift > 0 THEN 'user.spend HIGHER than logs'
        WHEN drift < 0 THEN 'user.spend LOWER than logs'
        ELSE 'exact match'
    END AS drift_direction
FROM user_drift
WHERE ABS(drift) > 0.001
ORDER BY ABS(drift) DESC;


-- 1.4 Organization spend drift
-- NOTE: LiteLLM_SpendLogs does NOT have an organization_id column in the
-- currently deployed schema (the column exists in schema.prisma but the
-- migration has not been applied to this RDS instance as of 2026-02-25).
-- This section compares LiteLLM_OrganizationTable.spend against the sum
-- of spend logs attributed to each org's keys as a proxy.
SELECT
    '== SECTION 1.4: Organization Spend Drift (via key attribution) ==' AS diagnostic_section;

WITH org_key_log_spend AS (
    -- Attribute log spend to orgs via the key→org FK
    SELECT
        vt.organization_id,
        SUM(sl.spend) AS log_spend_total
    FROM litellm."LiteLLM_SpendLogs" sl
    JOIN litellm."LiteLLM_VerificationToken" vt
        ON vt.token = sl.api_key
    WHERE vt.organization_id IS NOT NULL
    GROUP BY vt.organization_id
),
org_drift AS (
    SELECT
        ot.organization_id,
        COALESCE(ot.spend, 0)                      AS recorded_spend,
        COALESCE(okls.log_spend_total, 0)          AS log_spend_via_keys,
        COALESCE(ot.spend, 0)
            - COALESCE(okls.log_spend_total, 0)    AS drift
    FROM litellm."LiteLLM_OrganizationTable" ot
    LEFT JOIN org_key_log_spend okls
        ON okls.organization_id = ot.organization_id
)
SELECT
    organization_id,
    recorded_spend,
    log_spend_via_keys,
    drift,
    CASE
        WHEN drift > 0 THEN 'org.spend HIGHER than key-attributed logs'
        WHEN drift < 0 THEN 'org.spend LOWER than key-attributed logs'
        ELSE 'exact match'
    END AS drift_direction
FROM org_drift
WHERE ABS(drift) > 0.001
ORDER BY ABS(drift) DESC;


-- =============================================================================
-- SECTION 2: Budget Window Mismatch
-- Identifies entities using calendar-month budgets and checks whether the
-- spend column reflects the current budget period or has drifted due to
-- missed/late resets. Also flags overdue and NULL reset timestamps.
-- =============================================================================

-- 2.1 Keys with budget_duration = 'monthly'
SELECT
    '== SECTION 2.1: Keys with budget_duration = ''monthly'' ==' AS diagnostic_section;

WITH monthly_key_spend AS (
    SELECT
        sl.api_key,
        SUM(sl.spend) AS spend_since_reset
    FROM litellm."LiteLLM_SpendLogs" sl
    INNER JOIN litellm."LiteLLM_VerificationToken" vt
        ON vt.token = sl.api_key
        AND vt.budget_duration = 'monthly'
    WHERE sl."startTime" >= COALESCE(
        vt.budget_reset_at - INTERVAL '1 month',
        DATE_TRUNC('month', CURRENT_DATE)
    )
    GROUP BY sl.api_key
)
SELECT
    vt.token,
    vt.key_alias,
    vt.team_id,
    vt.spend                                          AS recorded_spend,
    vt.max_budget,
    vt.budget_reset_at,
    CASE WHEN vt.budget_reset_at < NOW() THEN TRUE ELSE FALSE END
                                                      AS reset_is_overdue,
    COALESCE(mks.spend_since_reset, 0)                AS log_spend_since_reset,
    COALESCE(vt.spend, 0)
        - COALESCE(mks.spend_since_reset, 0)          AS window_vs_recorded_drift
FROM litellm."LiteLLM_VerificationToken" vt
LEFT JOIN monthly_key_spend mks
    ON mks.api_key = vt.token
WHERE vt.budget_duration = 'monthly'
ORDER BY reset_is_overdue DESC, ABS(COALESCE(vt.spend, 0) - COALESCE(mks.spend_since_reset, 0)) DESC;


-- 2.2 Teams with budget_duration = 'monthly'
SELECT
    '== SECTION 2.2: Teams with budget_duration = ''monthly'' ==' AS diagnostic_section;

WITH monthly_team_spend AS (
    SELECT
        sl.team_id,
        SUM(sl.spend) AS spend_since_reset
    FROM litellm."LiteLLM_SpendLogs" sl
    INNER JOIN litellm."LiteLLM_TeamTable" tt
        ON tt.team_id = sl.team_id
        AND tt.budget_duration = 'monthly'
    WHERE sl."startTime" >= COALESCE(
        tt.budget_reset_at - INTERVAL '1 month',
        DATE_TRUNC('month', CURRENT_DATE)
    )
    GROUP BY sl.team_id
)
SELECT
    tt.team_id,
    tt.team_alias,
    tt.spend                                          AS recorded_spend,
    tt.max_budget,
    tt.budget_reset_at,
    CASE WHEN tt.budget_reset_at < NOW() THEN TRUE ELSE FALSE END
                                                      AS reset_is_overdue,
    COALESCE(mts.spend_since_reset, 0)                AS log_spend_since_reset,
    COALESCE(tt.spend, 0)
        - COALESCE(mts.spend_since_reset, 0)          AS window_vs_recorded_drift
FROM litellm."LiteLLM_TeamTable" tt
LEFT JOIN monthly_team_spend mts
    ON mts.team_id = tt.team_id
WHERE tt.budget_duration = 'monthly'
ORDER BY reset_is_overdue DESC, ABS(COALESCE(tt.spend, 0) - COALESCE(mts.spend_since_reset, 0)) DESC;


-- 2.3 Users with budget_duration = 'monthly'
SELECT
    '== SECTION 2.3: Users with budget_duration = ''monthly'' ==' AS diagnostic_section;

WITH monthly_user_spend AS (
    SELECT
        sl."user"       AS user_id,
        SUM(sl.spend)   AS spend_since_reset
    FROM litellm."LiteLLM_SpendLogs" sl
    INNER JOIN litellm."LiteLLM_UserTable" ut
        ON ut.user_id = sl."user"
        AND ut.budget_duration = 'monthly'
    WHERE sl."startTime" >= COALESCE(
        ut.budget_reset_at - INTERVAL '1 month',
        DATE_TRUNC('month', CURRENT_DATE)
    )
    GROUP BY sl."user"
)
SELECT
    ut.user_id,
    ut.spend                                          AS recorded_spend,
    ut.max_budget,
    ut.budget_reset_at,
    CASE WHEN ut.budget_reset_at < NOW() THEN TRUE ELSE FALSE END
                                                      AS reset_is_overdue,
    COALESCE(mus.spend_since_reset, 0)                AS log_spend_since_reset,
    COALESCE(ut.spend, 0)
        - COALESCE(mus.spend_since_reset, 0)          AS window_vs_recorded_drift
FROM litellm."LiteLLM_UserTable" ut
LEFT JOIN monthly_user_spend mus
    ON mus.user_id = ut.user_id
WHERE ut.budget_duration = 'monthly'
ORDER BY reset_is_overdue DESC, ABS(COALESCE(ut.spend, 0) - COALESCE(mus.spend_since_reset, 0)) DESC;


-- 2.4 Keys with budget_duration = '1mo' (alternative encoding)
SELECT
    '== SECTION 2.4: Keys with budget_duration = ''1mo'' ==' AS diagnostic_section;

WITH onemo_key_spend AS (
    SELECT
        sl.api_key,
        SUM(sl.spend) AS spend_since_reset
    FROM litellm."LiteLLM_SpendLogs" sl
    INNER JOIN litellm."LiteLLM_VerificationToken" vt
        ON vt.token = sl.api_key
        AND vt.budget_duration = '1mo'
    WHERE sl."startTime" >= COALESCE(
        vt.budget_reset_at - INTERVAL '1 month',
        DATE_TRUNC('month', CURRENT_DATE)
    )
    GROUP BY sl.api_key
)
SELECT
    vt.token,
    vt.key_alias,
    vt.team_id,
    vt.spend                                          AS recorded_spend,
    vt.max_budget,
    vt.budget_reset_at,
    CASE WHEN vt.budget_reset_at < NOW() THEN TRUE ELSE FALSE END
                                                      AS reset_is_overdue,
    COALESCE(oks.spend_since_reset, 0)                AS log_spend_since_reset,
    COALESCE(vt.spend, 0)
        - COALESCE(oks.spend_since_reset, 0)          AS window_vs_recorded_drift
FROM litellm."LiteLLM_VerificationToken" vt
LEFT JOIN onemo_key_spend oks
    ON oks.api_key = vt.token
WHERE vt.budget_duration = '1mo'
ORDER BY reset_is_overdue DESC, ABS(COALESCE(vt.spend, 0) - COALESCE(oks.spend_since_reset, 0)) DESC;


-- 2.5 Teams with budget_duration = '1mo'
SELECT
    '== SECTION 2.5: Teams with budget_duration = ''1mo'' ==' AS diagnostic_section;

WITH onemo_team_spend AS (
    SELECT
        sl.team_id,
        SUM(sl.spend) AS spend_since_reset
    FROM litellm."LiteLLM_SpendLogs" sl
    INNER JOIN litellm."LiteLLM_TeamTable" tt
        ON tt.team_id = sl.team_id
        AND tt.budget_duration = '1mo'
    WHERE sl."startTime" >= COALESCE(
        tt.budget_reset_at - INTERVAL '1 month',
        DATE_TRUNC('month', CURRENT_DATE)
    )
    GROUP BY sl.team_id
)
SELECT
    tt.team_id,
    tt.team_alias,
    tt.spend                                          AS recorded_spend,
    tt.max_budget,
    tt.budget_reset_at,
    CASE WHEN tt.budget_reset_at < NOW() THEN TRUE ELSE FALSE END
                                                      AS reset_is_overdue,
    COALESCE(ots.spend_since_reset, 0)                AS log_spend_since_reset,
    COALESCE(tt.spend, 0)
        - COALESCE(ots.spend_since_reset, 0)          AS window_vs_recorded_drift
FROM litellm."LiteLLM_TeamTable" tt
LEFT JOIN onemo_team_spend ots
    ON ots.team_id = tt.team_id
WHERE tt.budget_duration = '1mo'
ORDER BY reset_is_overdue DESC, ABS(COALESCE(tt.spend, 0) - COALESCE(ots.spend_since_reset, 0)) DESC;


-- 2.6 Users with budget_duration = '1mo'
SELECT
    '== SECTION 2.6: Users with budget_duration = ''1mo'' ==' AS diagnostic_section;

WITH onemo_user_spend AS (
    SELECT
        sl."user"       AS user_id,
        SUM(sl.spend)   AS spend_since_reset
    FROM litellm."LiteLLM_SpendLogs" sl
    INNER JOIN litellm."LiteLLM_UserTable" ut
        ON ut.user_id = sl."user"
        AND ut.budget_duration = '1mo'
    WHERE sl."startTime" >= COALESCE(
        ut.budget_reset_at - INTERVAL '1 month',
        DATE_TRUNC('month', CURRENT_DATE)
    )
    GROUP BY sl."user"
)
SELECT
    ut.user_id,
    ut.spend                                          AS recorded_spend,
    ut.max_budget,
    ut.budget_reset_at,
    CASE WHEN ut.budget_reset_at < NOW() THEN TRUE ELSE FALSE END
                                                      AS reset_is_overdue,
    COALESCE(ous.spend_since_reset, 0)                AS log_spend_since_reset,
    COALESCE(ut.spend, 0)
        - COALESCE(ous.spend_since_reset, 0)          AS window_vs_recorded_drift
FROM litellm."LiteLLM_UserTable" ut
LEFT JOIN onemo_user_spend ous
    ON ous.user_id = ut.user_id
WHERE ut.budget_duration = '1mo'
ORDER BY reset_is_overdue DESC, ABS(COALESCE(ut.spend, 0) - COALESCE(ous.spend_since_reset, 0)) DESC;


-- 2.7 Entities with budget_duration set but budget_reset_at IS NULL
SELECT
    '== SECTION 2.7: Entities with budget_duration set but budget_reset_at IS NULL ==' AS diagnostic_section;

SELECT 'key'      AS entity_type,
       token      AS entity_id,
       key_alias  AS entity_name,
       budget_duration,
       spend,
       max_budget
FROM litellm."LiteLLM_VerificationToken"
WHERE budget_duration IS NOT NULL
  AND budget_reset_at IS NULL

UNION ALL

SELECT 'team'     AS entity_type,
       team_id    AS entity_id,
       team_alias AS entity_name,
       budget_duration,
       spend,
       max_budget
FROM litellm."LiteLLM_TeamTable"
WHERE budget_duration IS NOT NULL
  AND budget_reset_at IS NULL

UNION ALL

SELECT 'user'     AS entity_type,
       user_id    AS entity_id,
       user_id    AS entity_name,
       budget_duration,
       spend,
       max_budget
FROM litellm."LiteLLM_UserTable"
WHERE budget_duration IS NOT NULL
  AND budget_reset_at IS NULL

ORDER BY entity_type, entity_id;


-- =============================================================================
-- SECTION 3: View Accuracy Problems
-- Examines each materialized or runtime view for data correctness, window
-- consistency, and pass-through fidelity against the underlying tables.
-- =============================================================================

-- 3.1 MonthlyGlobalSpend window comparison:
--   (a) view sum (rolling 30 days)
--   (b) sum for current calendar month
--   (c) all-time sum
SELECT
    '== SECTION 3.1: MonthlyGlobalSpend — 30-day rolling vs calendar month vs all-time ==' AS diagnostic_section;

WITH rolling_30 AS (
    SELECT SUM(spend) AS total_spend
    FROM litellm."LiteLLM_SpendLogs"
    WHERE "startTime" >= CURRENT_DATE - INTERVAL '30 days'
),
calendar_month AS (
    SELECT SUM(spend) AS total_spend
    FROM litellm."LiteLLM_SpendLogs"
    WHERE "startTime" >= DATE_TRUNC('month', CURRENT_DATE)
),
all_time AS (
    SELECT SUM(spend) AS total_spend
    FROM litellm."LiteLLM_SpendLogs"
),
view_total AS (
    SELECT SUM(spend) AS total_spend
    FROM litellm."MonthlyGlobalSpend"
)
SELECT
    COALESCE(r.total_spend, 0)   AS view_rolling_30d_spend,
    COALESCE(v.total_spend, 0)   AS view_reported_spend,
    COALESCE(c.total_spend, 0)   AS calendar_month_spend,
    COALESCE(a.total_spend, 0)   AS all_time_spend,
    COALESCE(r.total_spend, 0)
        - COALESCE(c.total_spend, 0) AS rolling_vs_calendar_diff,
    COALESCE(a.total_spend, 0)
        - COALESCE(r.total_spend, 0) AS alltime_vs_rolling_diff
FROM rolling_30 r, calendar_month c, all_time a, view_total v;


-- 3.2 Per-key: last-30-day view spend vs spend since budget_reset_at
--     Shows the two windows that users often confuse for monthly-budget keys.
SELECT
    '== SECTION 3.2: Per-key: view 30-day spend vs spend since budget_reset_at ==' AS diagnostic_section;

WITH last30_key AS (
    SELECT
        api_key,
        SUM(spend) AS spend_last_30d
    FROM litellm."LiteLLM_SpendLogs"
    WHERE "startTime" >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY api_key
),
since_reset_key AS (
    SELECT
        sl.api_key,
        SUM(sl.spend) AS spend_since_reset
    FROM litellm."LiteLLM_SpendLogs" sl
    INNER JOIN litellm."LiteLLM_VerificationToken" vt
        ON vt.token = sl.api_key
    WHERE vt.budget_duration IN ('monthly', '1mo')
      AND sl."startTime" >= COALESCE(
          vt.budget_reset_at - INTERVAL '1 month',
          DATE_TRUNC('month', CURRENT_DATE)
      )
    GROUP BY sl.api_key
)
SELECT
    vt.token,
    vt.key_alias,
    vt.budget_duration,
    vt.budget_reset_at,
    COALESCE(l30.spend_last_30d, 0)     AS spend_last_30d_rolling,
    COALESCE(srk.spend_since_reset, 0)  AS spend_since_budget_reset,
    COALESCE(l30.spend_last_30d, 0)
        - COALESCE(srk.spend_since_reset, 0) AS window_difference
FROM litellm."LiteLLM_VerificationToken" vt
LEFT JOIN last30_key l30
    ON l30.api_key = vt.token
LEFT JOIN since_reset_key srk
    ON srk.api_key = vt.token
WHERE vt.budget_duration IN ('monthly', '1mo')
ORDER BY ABS(COALESCE(l30.spend_last_30d, 0) - COALESCE(srk.spend_since_reset, 0)) DESC;


-- 3.3 LiteLLM_VerificationTokenView.spend vs LiteLLM_VerificationToken.spend
--     The view passes through spend directly; any difference indicates a bug.
SELECT
    '== SECTION 3.3: VerificationTokenView.spend vs VerificationToken.spend (should always match) ==' AS diagnostic_section;

SELECT
    vt.token,
    vt.key_alias,
    vt.spend                  AS table_spend,
    vtv.spend                 AS view_spend,
    vt.spend - vtv.spend      AS drift
FROM litellm."LiteLLM_VerificationToken" vt
INNER JOIN litellm."LiteLLM_VerificationTokenView" vtv
    ON vtv.token = vt.token
WHERE vt.spend IS DISTINCT FROM vtv.spend
ORDER BY ABS(vt.spend - vtv.spend) DESC;


-- 3.4 DailyTagSpend — rows outside rolling 30-day window
--     Reveals how much "hidden all-time data" exists that other views exclude.
SELECT
    '== SECTION 3.4: DailyTagSpend — rows outside rolling 30-day window ==' AS diagnostic_section;

SELECT
    COUNT(*)                          AS rows_outside_30d,
    COUNT(*) FILTER (
        WHERE spend_date < CURRENT_DATE - INTERVAL '30 days'
    )                                 AS rows_older_than_30d,
    COUNT(*) FILTER (
        WHERE spend_date >= CURRENT_DATE - INTERVAL '30 days'
    )                                 AS rows_within_30d,
    SUM(total_spend)                  AS all_time_tag_spend,
    SUM(total_spend) FILTER (
        WHERE spend_date >= CURRENT_DATE - INTERVAL '30 days'
    )                                 AS last_30d_tag_spend,
    SUM(total_spend) FILTER (
        WHERE spend_date < CURRENT_DATE - INTERVAL '30 days'
    )                                 AS older_than_30d_tag_spend,
    MIN(spend_date)                   AS earliest_tag_date,
    MAX(spend_date)                   AS latest_tag_date
FROM litellm."DailyTagSpend";

-- Also show date distribution by month for DailyTagSpend
SELECT
    DATE_TRUNC('month', spend_date)::date   AS month,
    COUNT(*)                                AS row_count,
    SUM(total_spend)                        AS month_spend,
    CASE
        WHEN spend_date >= CURRENT_DATE - INTERVAL '30 days'
        THEN 'within_30d_window'
        ELSE 'outside_30d_window'
    END                                     AS window_status
FROM litellm."DailyTagSpend"
GROUP BY DATE_TRUNC('month', spend_date), window_status
ORDER BY month DESC;


-- =============================================================================
-- SECTION 4: Structural / Referential Integrity
-- Checks for orphaned foreign keys, deleted-key logs, and missing membership
-- parent records that indicate data integrity problems.
-- =============================================================================

-- 4.1 Keys with team_id that doesn't exist in LiteLLM_TeamTable
SELECT
    '== SECTION 4.1: Keys referencing non-existent team_id ==' AS diagnostic_section;

SELECT
    vt.token,
    vt.key_alias,
    vt.team_id      AS dangling_team_id,
    vt.spend
FROM litellm."LiteLLM_VerificationToken" vt
WHERE vt.team_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM litellm."LiteLLM_TeamTable" tt
      WHERE tt.team_id = vt.team_id
  )
ORDER BY vt.team_id;


-- 4.2 SpendLogs with team_id that doesn't exist in LiteLLM_TeamTable
SELECT
    '== SECTION 4.2: SpendLogs referencing non-existent team_id (orphaned logs) ==' AS diagnostic_section;

SELECT
    sl.team_id                   AS dangling_team_id,
    COUNT(*)                     AS log_count,
    SUM(sl.spend)                AS total_spend,
    MIN(sl."startTime")          AS earliest_log,
    MAX(sl."startTime")          AS latest_log
FROM litellm."LiteLLM_SpendLogs" sl
WHERE sl.team_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM litellm."LiteLLM_TeamTable" tt
      WHERE tt.team_id = sl.team_id
  )
GROUP BY sl.team_id
ORDER BY total_spend DESC;


-- 4.3 SpendLogs with api_key not in LiteLLM_VerificationToken (deleted-key logs)
SELECT
    '== SECTION 4.3: SpendLogs for deleted/unknown api_keys ==' AS diagnostic_section;

SELECT
    sl.api_key,
    COUNT(*)              AS log_count,
    SUM(sl.spend)         AS total_spend,
    MIN(sl."startTime")   AS earliest_log,
    MAX(sl."startTime")   AS latest_log
FROM litellm."LiteLLM_SpendLogs" sl
WHERE sl.api_key IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM litellm."LiteLLM_VerificationToken" vt
      WHERE vt.token = sl.api_key
  )
GROUP BY sl.api_key
ORDER BY total_spend DESC;

-- Summary totals for deleted-key logs
SELECT
    COUNT(DISTINCT sl.api_key)    AS distinct_deleted_keys,
    COUNT(*)                      AS total_orphaned_log_rows,
    SUM(sl.spend)                 AS total_orphaned_spend
FROM litellm."LiteLLM_SpendLogs" sl
WHERE sl.api_key IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM litellm."LiteLLM_VerificationToken" vt
      WHERE vt.token = sl.api_key
  );


-- 4.4 TeamMembership rows with missing parent team_id or user_id
SELECT
    '== SECTION 4.4: TeamMembership rows with missing parent team or user ==' AS diagnostic_section;

SELECT
    tm.user_id,
    tm.team_id,
    tm.spend,
    CASE
        WHEN NOT EXISTS (
            SELECT 1 FROM litellm."LiteLLM_UserTable" ut WHERE ut.user_id = tm.user_id
        ) THEN TRUE ELSE FALSE
    END AS user_missing,
    CASE
        WHEN NOT EXISTS (
            SELECT 1 FROM litellm."LiteLLM_TeamTable" tt WHERE tt.team_id = tm.team_id
        ) THEN TRUE ELSE FALSE
    END AS team_missing
FROM litellm."LiteLLM_TeamMembership" tm
WHERE NOT EXISTS (
        SELECT 1 FROM litellm."LiteLLM_UserTable" ut WHERE ut.user_id = tm.user_id
    )
   OR NOT EXISTS (
        SELECT 1 FROM litellm."LiteLLM_TeamTable" tt WHERE tt.team_id = tm.team_id
    )
ORDER BY team_missing DESC, user_missing DESC;


-- 4.5 OrganizationMembership rows with missing parent org_id or user_id
SELECT
    '== SECTION 4.5: OrganizationMembership rows with missing parent org or user ==' AS diagnostic_section;

SELECT
    om.user_id,
    om.organization_id,
    om.spend,
    CASE
        WHEN NOT EXISTS (
            SELECT 1 FROM litellm."LiteLLM_UserTable" ut WHERE ut.user_id = om.user_id
        ) THEN TRUE ELSE FALSE
    END AS user_missing,
    CASE
        WHEN NOT EXISTS (
            SELECT 1 FROM litellm."LiteLLM_OrganizationTable" ot WHERE ot.organization_id = om.organization_id
        ) THEN TRUE ELSE FALSE
    END AS org_missing
FROM litellm."LiteLLM_OrganizationMembership" om
WHERE NOT EXISTS (
        SELECT 1 FROM litellm."LiteLLM_UserTable" ut WHERE ut.user_id = om.user_id
    )
   OR NOT EXISTS (
        SELECT 1 FROM litellm."LiteLLM_OrganizationTable" ot WHERE ot.organization_id = om.organization_id
    )
ORDER BY org_missing DESC, user_missing DESC;


-- =============================================================================
-- SECTION 5: Summary Counts
-- High-level health metrics: log coverage, over-budget entities,
-- overdue resets, and overall spend totals.
-- =============================================================================

-- 5.1 SpendLogs overall statistics
SELECT
    '== SECTION 5.1: SpendLogs Overall Statistics ==' AS diagnostic_section;

-- NOTE: organization_id column not present in deployed SpendLogs schema
-- (migration pending as of 2026-02-25); omitted from this query.
SELECT
    COUNT(*)                    AS total_log_rows,
    COUNT(DISTINCT request_id)  AS distinct_request_ids,
    COUNT(DISTINCT api_key)     AS distinct_api_keys,
    COUNT(DISTINCT team_id)     AS distinct_teams,
    COUNT(DISTINCT "user")      AS distinct_users,
    SUM(spend)                  AS total_spend_all_time,
    MIN("startTime")            AS earliest_log_time,
    MAX("startTime")            AS latest_log_time,
    (MAX("startTime") - MIN("startTime")) AS log_time_span
FROM litellm."LiteLLM_SpendLogs";


-- 5.2 Count of keys with spend > max_budget (over-budget, not yet reset)
SELECT
    '== SECTION 5.2: Over-budget Keys (spend > max_budget) ==' AS diagnostic_section;

SELECT
    COUNT(*)                            AS over_budget_key_count,
    SUM(spend - max_budget)             AS total_overage_amount,
    COUNT(*) FILTER (
        WHERE budget_reset_at < NOW()
    )                                   AS also_overdue_reset
FROM litellm."LiteLLM_VerificationToken"
WHERE max_budget IS NOT NULL
  AND spend > max_budget;

-- Detail rows
SELECT
    token,
    key_alias,
    team_id,
    spend,
    max_budget,
    spend - max_budget  AS overage,
    budget_duration,
    budget_reset_at,
    CASE WHEN budget_reset_at < NOW() THEN TRUE ELSE FALSE END AS reset_overdue
FROM litellm."LiteLLM_VerificationToken"
WHERE max_budget IS NOT NULL
  AND spend > max_budget
ORDER BY overage DESC;


-- 5.3 Count of teams with spend > max_budget
SELECT
    '== SECTION 5.3: Over-budget Teams (spend > max_budget) ==' AS diagnostic_section;

SELECT
    COUNT(*)                            AS over_budget_team_count,
    SUM(spend - max_budget)             AS total_overage_amount,
    COUNT(*) FILTER (
        WHERE budget_reset_at < NOW()
    )                                   AS also_overdue_reset
FROM litellm."LiteLLM_TeamTable"
WHERE max_budget IS NOT NULL
  AND spend > max_budget;

-- Detail rows
SELECT
    team_id,
    team_alias,
    spend,
    max_budget,
    spend - max_budget  AS overage,
    budget_duration,
    budget_reset_at,
    CASE WHEN budget_reset_at < NOW() THEN TRUE ELSE FALSE END AS reset_overdue
FROM litellm."LiteLLM_TeamTable"
WHERE max_budget IS NOT NULL
  AND spend > max_budget
ORDER BY overage DESC;


-- 5.4 Count of users with spend > max_budget
SELECT
    '== SECTION 5.4: Over-budget Users (spend > max_budget) ==' AS diagnostic_section;

SELECT
    COUNT(*)                            AS over_budget_user_count,
    SUM(spend - max_budget)             AS total_overage_amount,
    COUNT(*) FILTER (
        WHERE budget_reset_at < NOW()
    )                                   AS also_overdue_reset
FROM litellm."LiteLLM_UserTable"
WHERE max_budget IS NOT NULL
  AND spend > max_budget;

-- Detail rows
SELECT
    user_id,
    spend,
    max_budget,
    spend - max_budget  AS overage,
    budget_duration,
    budget_reset_at,
    CASE WHEN budget_reset_at < NOW() THEN TRUE ELSE FALSE END AS reset_overdue
FROM litellm."LiteLLM_UserTable"
WHERE max_budget IS NOT NULL
  AND spend > max_budget
ORDER BY overage DESC;


-- 5.5 All entities with overdue budget_reset_at (past due, not yet reset)
SELECT
    '== SECTION 5.5: All Entities with Overdue budget_reset_at ==' AS diagnostic_section;

SELECT
    'key'           AS entity_type,
    token           AS entity_id,
    key_alias       AS entity_name,
    budget_duration,
    spend,
    max_budget,
    budget_reset_at,
    NOW() - budget_reset_at AS overdue_by
FROM litellm."LiteLLM_VerificationToken"
WHERE budget_reset_at IS NOT NULL
  AND budget_reset_at < NOW()

UNION ALL

SELECT
    'team'          AS entity_type,
    team_id         AS entity_id,
    team_alias      AS entity_name,
    budget_duration,
    spend,
    max_budget,
    budget_reset_at,
    NOW() - budget_reset_at AS overdue_by
FROM litellm."LiteLLM_TeamTable"
WHERE budget_reset_at IS NOT NULL
  AND budget_reset_at < NOW()

UNION ALL

SELECT
    'user'          AS entity_type,
    user_id         AS entity_id,
    user_id         AS entity_name,
    budget_duration,
    spend,
    max_budget,
    budget_reset_at,
    NOW() - budget_reset_at AS overdue_by
FROM litellm."LiteLLM_UserTable"
WHERE budget_reset_at IS NOT NULL
  AND budget_reset_at < NOW()

ORDER BY overdue_by DESC;

-- 5.6 Summary rollup of overdue reset counts by entity type
SELECT
    '== SECTION 5.6: Summary — Overdue Reset Count by Entity Type ==' AS diagnostic_section;

SELECT entity_type, COUNT(*) AS overdue_count
FROM (
    SELECT 'key'  AS entity_type FROM litellm."LiteLLM_VerificationToken"
    WHERE budget_reset_at IS NOT NULL AND budget_reset_at < NOW()
    UNION ALL
    SELECT 'team' AS entity_type FROM litellm."LiteLLM_TeamTable"
    WHERE budget_reset_at IS NOT NULL AND budget_reset_at < NOW()
    UNION ALL
    SELECT 'user' AS entity_type FROM litellm."LiteLLM_UserTable"
    WHERE budget_reset_at IS NOT NULL AND budget_reset_at < NOW()
) overdue
GROUP BY entity_type
ORDER BY entity_type;


-- 5.7 Prisma migration history (informational — helps correlate schema changes
--     with the period when spend data may have started drifting)
SELECT
    '== SECTION 5.7: Prisma Migration History (public._prisma_migrations) ==' AS diagnostic_section;

SELECT
    migration_name,
    started_at,
    finished_at,
    applied_steps_count,
    logs,
    rolled_back_at,
    CASE WHEN rolled_back_at IS NOT NULL THEN TRUE ELSE FALSE END AS was_rolled_back
FROM litellm._prisma_migrations
ORDER BY started_at DESC;

-- =============================================================================
-- END OF DIAGNOSTIC SCRIPT
-- =============================================================================
