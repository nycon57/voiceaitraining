-- ============================================================================
-- Migration: Add Optimized Index for User Scenario Attempt Tracking
-- ============================================================================
-- Description: Adds composite index to optimize queries that track multiple
--              attempts by the same user on the same scenario
-- Performance: Improves queries filtering by (org_id, clerk_user_id, scenario_id)
--              and ordering by started_at
-- Use Cases:
--   - Practice history for a specific scenario
--   - Score progression over time
--   - Comparing attempts chronologically
-- ============================================================================

-- Add composite index for user-scenario attempt tracking
-- This index supports queries like:
-- WHERE org_id = ? AND clerk_user_id = ? AND scenario_id = ? ORDER BY started_at DESC
CREATE INDEX IF NOT EXISTS idx_scenario_attempts_user_scenario_time
ON scenario_attempts (org_id, clerk_user_id, scenario_id, started_at DESC)
WHERE status = 'completed';

-- Add partial index for completed attempts with scores (for best attempt queries)
-- This index supports queries finding the best score for a user-scenario combination
CREATE INDEX IF NOT EXISTS idx_scenario_attempts_user_scenario_score
ON scenario_attempts (org_id, clerk_user_id, scenario_id, score DESC NULLS LAST)
WHERE status = 'completed' AND score IS NOT NULL;

-- Add index for recent activity queries across all scenarios
-- This index supports queries like:
-- WHERE org_id = ? AND clerk_user_id = ? ORDER BY started_at DESC LIMIT N
-- Note: This is already partially covered by idx_scenario_attempts_org_id_user_id
-- but this version includes started_at for better sort performance
CREATE INDEX IF NOT EXISTS idx_scenario_attempts_user_recent
ON scenario_attempts (org_id, clerk_user_id, started_at DESC)
WHERE status = 'completed';

-- Comments for documentation
COMMENT ON INDEX idx_scenario_attempts_user_scenario_time IS
'Optimized index for retrieving chronological attempt history for a user on a specific scenario';

COMMENT ON INDEX idx_scenario_attempts_user_scenario_score IS
'Optimized index for finding best attempts by score for a user-scenario combination';

COMMENT ON INDEX idx_scenario_attempts_user_recent IS
'Optimized index for retrieving recent attempts across all scenarios for a user';

-- ============================================================================
-- Rollback Instructions
-- ============================================================================
-- To rollback this migration, run:
-- DROP INDEX IF EXISTS idx_scenario_attempts_user_scenario_time;
-- DROP INDEX IF EXISTS idx_scenario_attempts_user_scenario_score;
-- DROP INDEX IF EXISTS idx_scenario_attempts_user_recent;
