-- ============================================================================
-- User Attempt Tracking Queries
-- ============================================================================
-- Optimized queries for tracking and comparing multiple attempts by users
-- across scenarios. All queries are RLS-aware and org-scoped.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 1: All Attempts for a Specific Scenario by a User (ordered by date)
-- ----------------------------------------------------------------------------
-- Use case: Show practice history for a scenario
-- Performance: Uses idx_scenario_attempts_org_id_user_id + scenario_id filter

CREATE OR REPLACE FUNCTION get_user_scenario_attempts(
    p_org_id uuid,
    p_clerk_user_id text,
    p_scenario_id uuid,
    p_limit int DEFAULT 50
)
RETURNS TABLE(
    attempt_id uuid,
    started_at timestamptz,
    ended_at timestamptz,
    duration_seconds int,
    score numeric,
    status attempt_status,
    kpis jsonb,
    score_breakdown jsonb,
    attempt_number int
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sa.id,
        sa.started_at,
        sa.ended_at,
        sa.duration_seconds,
        sa.score,
        sa.status,
        sa.kpis,
        sa.score_breakdown,
        ROW_NUMBER() OVER (ORDER BY sa.started_at ASC)::int as attempt_number
    FROM scenario_attempts sa
    WHERE sa.org_id = p_org_id
        AND sa.clerk_user_id = p_clerk_user_id
        AND sa.scenario_id = p_scenario_id
        AND sa.status = 'completed'
    ORDER BY sa.started_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
-- GRANT EXECUTE ON FUNCTION get_user_scenario_attempts TO authenticated;

-- ----------------------------------------------------------------------------
-- Query 2: Best Attempt for Each Scenario by a User
-- ----------------------------------------------------------------------------
-- Use case: Leaderboards, progress tracking, best scores dashboard
-- Performance: Uses window functions with partitioning by scenario_id

CREATE OR REPLACE FUNCTION get_user_best_attempts(
    p_org_id uuid,
    p_clerk_user_id text
)
RETURNS TABLE(
    scenario_id uuid,
    scenario_title text,
    best_attempt_id uuid,
    best_score numeric,
    best_attempt_date timestamptz,
    total_attempts bigint,
    latest_attempt_date timestamptz,
    first_attempt_date timestamptz,
    average_score numeric
) AS $$
BEGIN
    RETURN QUERY
    WITH scenario_stats AS (
        SELECT
            sa.scenario_id,
            sa.id as attempt_id,
            sa.score,
            sa.started_at,
            COUNT(*) OVER (PARTITION BY sa.scenario_id) as total_attempts,
            AVG(sa.score) OVER (PARTITION BY sa.scenario_id) as avg_score,
            MAX(sa.started_at) OVER (PARTITION BY sa.scenario_id) as latest_date,
            MIN(sa.started_at) OVER (PARTITION BY sa.scenario_id) as first_date,
            ROW_NUMBER() OVER (
                PARTITION BY sa.scenario_id
                ORDER BY sa.score DESC NULLS LAST, sa.started_at DESC
            ) as score_rank
        FROM scenario_attempts sa
        WHERE sa.org_id = p_org_id
            AND sa.clerk_user_id = p_clerk_user_id
            AND sa.status = 'completed'
            AND sa.score IS NOT NULL
    )
    SELECT
        ss.scenario_id,
        s.title,
        ss.attempt_id,
        ss.score,
        ss.started_at,
        ss.total_attempts,
        ss.latest_date,
        ss.first_date,
        ROUND(ss.avg_score, 2)
    FROM scenario_stats ss
    JOIN scenarios s ON s.id = ss.scenario_id
    WHERE ss.score_rank = 1
    ORDER BY ss.score DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
-- GRANT EXECUTE ON FUNCTION get_user_best_attempts TO authenticated;

-- ----------------------------------------------------------------------------
-- Query 3: Score Improvement Over Time
-- ----------------------------------------------------------------------------
-- Use case: Progress charts, trend analysis, coaching insights
-- Performance: Window functions for moving averages and deltas

CREATE OR REPLACE FUNCTION get_user_score_improvement(
    p_org_id uuid,
    p_clerk_user_id text,
    p_scenario_id uuid DEFAULT NULL,
    p_days_back int DEFAULT 90
)
RETURNS TABLE(
    attempt_id uuid,
    scenario_id uuid,
    scenario_title text,
    attempt_date timestamptz,
    score numeric,
    attempt_number int,
    score_delta numeric,
    moving_avg_3 numeric,
    percentile_rank numeric,
    improvement_trend text
) AS $$
BEGIN
    RETURN QUERY
    WITH ordered_attempts AS (
        SELECT
            sa.id,
            sa.scenario_id,
            s.title as scenario_title,
            sa.started_at,
            sa.score,
            ROW_NUMBER() OVER (
                PARTITION BY sa.scenario_id
                ORDER BY sa.started_at ASC
            )::int as attempt_num,
            LAG(sa.score) OVER (
                PARTITION BY sa.scenario_id
                ORDER BY sa.started_at ASC
            ) as prev_score,
            AVG(sa.score) OVER (
                PARTITION BY sa.scenario_id
                ORDER BY sa.started_at ASC
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
            ) as ma_3,
            PERCENT_RANK() OVER (
                PARTITION BY sa.scenario_id
                ORDER BY sa.score ASC
            ) as pct_rank
        FROM scenario_attempts sa
        JOIN scenarios s ON s.id = sa.scenario_id
        WHERE sa.org_id = p_org_id
            AND sa.clerk_user_id = p_clerk_user_id
            AND sa.status = 'completed'
            AND sa.score IS NOT NULL
            AND sa.started_at >= (NOW() - (p_days_back || ' days')::interval)
            AND (p_scenario_id IS NULL OR sa.scenario_id = p_scenario_id)
    )
    SELECT
        oa.id,
        oa.scenario_id,
        oa.scenario_title,
        oa.started_at,
        oa.score,
        oa.attempt_num,
        ROUND(COALESCE(oa.score - oa.prev_score, 0), 2) as score_delta,
        ROUND(oa.ma_3, 2) as moving_avg_3,
        ROUND(oa.pct_rank * 100, 2) as percentile_rank,
        CASE
            WHEN oa.attempt_num < 3 THEN 'insufficient_data'
            WHEN oa.score > oa.prev_score THEN 'improving'
            WHEN oa.score = oa.prev_score THEN 'stable'
            ELSE 'declining'
        END as improvement_trend
    FROM ordered_attempts oa
    ORDER BY oa.started_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
-- GRANT EXECUTE ON FUNCTION get_user_score_improvement TO authenticated;

-- ----------------------------------------------------------------------------
-- Query 4: Most Recent N Attempts for Comparison
-- ----------------------------------------------------------------------------
-- Use case: Recent activity, quick comparison widget
-- Performance: Simple ORDER BY with LIMIT, uses started_at index

CREATE OR REPLACE FUNCTION get_recent_attempts_comparison(
    p_org_id uuid,
    p_clerk_user_id text,
    p_scenario_id uuid DEFAULT NULL,
    p_limit int DEFAULT 5
)
RETURNS TABLE(
    attempt_id uuid,
    scenario_id uuid,
    scenario_title text,
    started_at timestamptz,
    ended_at timestamptz,
    duration_seconds int,
    score numeric,
    kpis jsonb,
    is_best_score boolean,
    is_latest boolean,
    rank_by_score int
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_attempts AS (
        SELECT
            sa.id,
            sa.scenario_id,
            s.title,
            sa.started_at,
            sa.ended_at,
            sa.duration_seconds,
            sa.score,
            sa.kpis,
            ROW_NUMBER() OVER (
                PARTITION BY sa.scenario_id
                ORDER BY sa.started_at DESC
            ) as recency_rank,
            RANK() OVER (
                PARTITION BY sa.scenario_id
                ORDER BY sa.score DESC NULLS LAST
            )::int as score_rank,
            MAX(sa.score) OVER (PARTITION BY sa.scenario_id) as max_score
        FROM scenario_attempts sa
        JOIN scenarios s ON s.id = sa.scenario_id
        WHERE sa.org_id = p_org_id
            AND sa.clerk_user_id = p_clerk_user_id
            AND sa.status = 'completed'
            AND (p_scenario_id IS NULL OR sa.scenario_id = p_scenario_id)
    )
    SELECT
        ra.id,
        ra.scenario_id,
        ra.title,
        ra.started_at,
        ra.ended_at,
        ra.duration_seconds,
        ra.score,
        ra.kpis,
        (ra.score = ra.max_score) as is_best_score,
        (ra.recency_rank = 1) as is_latest,
        ra.score_rank
    FROM recent_attempts ra
    WHERE ra.recency_rank <= p_limit
    ORDER BY ra.started_at DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
-- GRANT EXECUTE ON FUNCTION get_recent_attempts_comparison TO authenticated;

-- ----------------------------------------------------------------------------
-- Query 5: Attempt Comparison Metadata (for UI)
-- ----------------------------------------------------------------------------
-- Use case: Single view comparing first, best, latest, and average attempts
-- Performance: CTEs with aggregations

CREATE OR REPLACE FUNCTION get_attempt_comparison_summary(
    p_org_id uuid,
    p_clerk_user_id text,
    p_scenario_id uuid
)
RETURNS TABLE(
    scenario_id uuid,
    scenario_title text,
    total_attempts bigint,
    completed_attempts bigint,
    first_attempt_id uuid,
    first_score numeric,
    first_date timestamptz,
    best_attempt_id uuid,
    best_score numeric,
    best_date timestamptz,
    latest_attempt_id uuid,
    latest_score numeric,
    latest_date timestamptz,
    average_score numeric,
    median_score numeric,
    score_std_dev numeric,
    total_practice_seconds bigint,
    improvement_percentage numeric
) AS $$
BEGIN
    RETURN QUERY
    WITH all_attempts AS (
        SELECT
            sa.id,
            sa.score,
            sa.started_at,
            sa.duration_seconds,
            ROW_NUMBER() OVER (ORDER BY sa.started_at ASC) as attempt_order,
            ROW_NUMBER() OVER (ORDER BY sa.started_at DESC) as reverse_order,
            ROW_NUMBER() OVER (ORDER BY sa.score DESC NULLS LAST) as score_order
        FROM scenario_attempts sa
        WHERE sa.org_id = p_org_id
            AND sa.clerk_user_id = p_clerk_user_id
            AND sa.scenario_id = p_scenario_id
            AND sa.status = 'completed'
    ),
    stats AS (
        SELECT
            COUNT(*) as total_completed,
            AVG(score) as avg_score,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score) as med_score,
            STDDEV(score) as std_dev,
            SUM(COALESCE(duration_seconds, 0)) as total_seconds
        FROM all_attempts
        WHERE score IS NOT NULL
    ),
    first_attempt AS (
        SELECT id, score, started_at
        FROM all_attempts
        WHERE attempt_order = 1
        LIMIT 1
    ),
    best_attempt AS (
        SELECT id, score, started_at
        FROM all_attempts
        WHERE score_order = 1
        LIMIT 1
    ),
    latest_attempt AS (
        SELECT id, score, started_at
        FROM all_attempts
        WHERE reverse_order = 1
        LIMIT 1
    )
    SELECT
        p_scenario_id,
        s.title,
        (SELECT COUNT(*) FROM scenario_attempts WHERE org_id = p_org_id AND clerk_user_id = p_clerk_user_id AND scenario_id = p_scenario_id),
        st.total_completed,
        fa.id,
        fa.score,
        fa.started_at,
        ba.id,
        ba.score,
        ba.started_at,
        la.id,
        la.score,
        la.started_at,
        ROUND(st.avg_score, 2),
        ROUND(st.med_score, 2),
        ROUND(st.std_dev, 2),
        st.total_seconds,
        CASE
            WHEN fa.score IS NOT NULL AND fa.score > 0 THEN
                ROUND(((COALESCE(la.score, 0) - fa.score) / fa.score * 100), 2)
            ELSE NULL
        END as improvement_pct
    FROM scenarios s
    CROSS JOIN stats st
    LEFT JOIN first_attempt fa ON true
    LEFT JOIN best_attempt ba ON true
    LEFT JOIN latest_attempt la ON true
    WHERE s.id = p_scenario_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
-- GRANT EXECUTE ON FUNCTION get_attempt_comparison_summary TO authenticated;

-- ----------------------------------------------------------------------------
-- Simple SQL Queries (for direct use in Server Actions)
-- ----------------------------------------------------------------------------

-- All attempts for a user on a scenario (most recent first)
/*
SELECT
    id,
    started_at,
    ended_at,
    duration_seconds,
    score,
    status,
    kpis,
    score_breakdown
FROM scenario_attempts
WHERE org_id = $1
    AND clerk_user_id = $2
    AND scenario_id = $3
    AND status = 'completed'
ORDER BY started_at DESC
LIMIT $4;
*/

-- Best attempt per scenario for a user
/*
SELECT DISTINCT ON (scenario_id)
    scenario_id,
    id as best_attempt_id,
    score as best_score,
    started_at as best_attempt_date
FROM scenario_attempts
WHERE org_id = $1
    AND clerk_user_id = $2
    AND status = 'completed'
    AND score IS NOT NULL
ORDER BY scenario_id, score DESC, started_at DESC;
*/

-- Latest 5 attempts across all scenarios for a user
/*
SELECT
    id,
    scenario_id,
    started_at,
    score,
    status
FROM scenario_attempts
WHERE org_id = $1
    AND clerk_user_id = $2
    AND status = 'completed'
ORDER BY started_at DESC
LIMIT 5;
*/
