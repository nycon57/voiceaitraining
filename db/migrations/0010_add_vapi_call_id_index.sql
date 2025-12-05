-- Migration: Add Index on vapi_call_id for Webhook Performance
-- Description: Creates index on vapi_call_id column for fast lookups when Vapi webhooks arrive
-- Author: Claude
-- Date: 2025-10-03

-- ============================================================================
-- STEP 1: Add Index on vapi_call_id
-- ============================================================================

-- Create index for fast webhook lookups by vapi_call_id
-- This is critical for performance when Vapi sends end-of-call webhooks
-- and we need to find the corresponding scenario_attempt record
CREATE INDEX IF NOT EXISTS idx_scenario_attempts_vapi_call_id
ON scenario_attempts(vapi_call_id)
WHERE vapi_call_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON INDEX idx_scenario_attempts_vapi_call_id IS
'Index for fast lookups by Vapi call ID during webhook processing';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify the index was created
-- SELECT
--     schemaname,
--     tablename,
--     indexname,
--     indexdef
-- FROM pg_indexes
-- WHERE tablename = 'scenario_attempts'
--   AND indexname = 'idx_scenario_attempts_vapi_call_id';

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================

-- To rollback this migration:
-- DROP INDEX IF EXISTS idx_scenario_attempts_vapi_call_id;
