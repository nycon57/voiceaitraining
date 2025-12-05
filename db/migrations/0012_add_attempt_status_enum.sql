-- Migration: Add attempt_status Enum to scenario_attempts
-- Description: Adds attempt_status column to track different states of call attempts
-- Author: Claude
-- Date: 2025-10-05

-- ============================================================================
-- STEP 1: Create attempt_status Enum Type
-- ============================================================================

-- Create the enum type for attempt statuses
DO $$ BEGIN
    CREATE TYPE attempt_status AS ENUM (
        'completed',
        'cancelled',
        'practice',
        'technical_issue'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add comment for documentation
COMMENT ON TYPE attempt_status IS
'Status values for scenario attempts:
- completed: Successfully completed attempt that counts toward performance
- cancelled: User cancelled the call before completion
- practice: Practice attempt that does not count toward scoring
- technical_issue: Attempt failed due to technical problems';

-- ============================================================================
-- STEP 2: Add attempt_status Column to scenario_attempts
-- ============================================================================

-- Add the column with default value 'completed'
ALTER TABLE scenario_attempts
ADD COLUMN IF NOT EXISTS attempt_status attempt_status DEFAULT 'completed' NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN scenario_attempts.attempt_status IS
'Current status of the attempt - defaults to completed for backward compatibility';

-- ============================================================================
-- STEP 3: Create Index for Status-based Queries
-- ============================================================================

-- Create index for queries filtering by status
-- Useful for leaderboards (completed only), practice mode filtering, etc.
CREATE INDEX IF NOT EXISTS idx_scenario_attempts_status
ON scenario_attempts(attempt_status, org_id, started_at DESC)
WHERE attempt_status = 'completed';

-- Add comment for documentation
COMMENT ON INDEX idx_scenario_attempts_status IS
'Partial index for completed attempts - optimizes leaderboard and reporting queries';

-- ============================================================================
-- STEP 4: Create Index for Practice Mode Queries
-- ============================================================================

-- Create index for practice mode queries (user viewing their practice attempts)
CREATE INDEX IF NOT EXISTS idx_scenario_attempts_practice
ON scenario_attempts(user_id, attempt_status, started_at DESC)
WHERE attempt_status = 'practice';

-- Add comment for documentation
COMMENT ON INDEX idx_scenario_attempts_practice IS
'Partial index for practice attempts - optimizes user practice history queries';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify the enum type was created
-- SELECT enumlabel
-- FROM pg_enum
-- WHERE enumtypid = 'attempt_status'::regtype
-- ORDER BY enumsortorder;

-- Verify the column was added
-- SELECT
--     column_name,
--     data_type,
--     column_default,
--     is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'scenario_attempts'
--   AND column_name = 'attempt_status';

-- Verify the indexes were created
-- SELECT
--     schemaname,
--     tablename,
--     indexname,
--     indexdef
-- FROM pg_indexes
-- WHERE tablename = 'scenario_attempts'
--   AND indexname IN ('idx_scenario_attempts_status', 'idx_scenario_attempts_practice');

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================

-- To rollback this migration, run in order:
--
-- DROP INDEX IF EXISTS idx_scenario_attempts_practice;
-- DROP INDEX IF EXISTS idx_scenario_attempts_status;
-- ALTER TABLE scenario_attempts DROP COLUMN IF EXISTS attempt_status;
-- DROP TYPE IF EXISTS attempt_status;
