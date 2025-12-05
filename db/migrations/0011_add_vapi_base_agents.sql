-- Migration: Add Vapi Base Agent Support
-- Description: Enables scenarios to use base permanent Vapi agents with transient overrides
-- Author: Claude
-- Date: 2025-10-03

-- ============================================================================
-- STEP 1: Add vapi_base_agent Column
-- ============================================================================

-- Add vapi_base_agent enum column to scenarios
-- Options: 'professional', 'difficult', 'friendly', 'neutral'
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS vapi_base_agent TEXT DEFAULT 'professional';

-- Add check constraint for valid agent types
ALTER TABLE scenarios
ADD CONSTRAINT valid_vapi_base_agent
CHECK (vapi_base_agent IN ('professional', 'difficult', 'friendly', 'neutral'));

-- Add comment for documentation
COMMENT ON COLUMN scenarios.vapi_base_agent IS 'Base permanent Vapi assistant type to use for this scenario. Options: professional, difficult, friendly, neutral';

-- ============================================================================
-- STEP 2: Add vapi_overrides Column
-- ============================================================================

-- Add vapi_overrides JSONB column for transient configuration overrides
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS vapi_overrides JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN scenarios.vapi_overrides IS 'Optional transient overrides for Vapi assistant behavior (temperature, voice_emotion, background_sound, etc.)';

-- Example vapi_overrides structure:
-- {
--   "temperature": 0.9,
--   "voice_emotion": "stern",
--   "background_sound": "office",
--   "max_duration_seconds": 900,
--   "end_call_on_silence_seconds": 20
-- }

-- ============================================================================
-- STEP 3: Create Index for Performance
-- ============================================================================

-- Index for filtering scenarios by agent type
CREATE INDEX IF NOT EXISTS idx_scenarios_vapi_base_agent
ON scenarios(vapi_base_agent);

-- GIN index for querying vapi_overrides JSONB
CREATE INDEX IF NOT EXISTS idx_scenarios_vapi_overrides
ON scenarios USING GIN (vapi_overrides);

-- ============================================================================
-- STEP 4: Update Existing Scenarios (Default Values)
-- ============================================================================

-- Set default 'professional' for all existing scenarios
-- This ensures backward compatibility
UPDATE scenarios
SET vapi_base_agent = 'professional'
WHERE vapi_base_agent IS NULL;

-- ============================================================================
-- STEP 5: Helper Function - Get Agent Configuration
-- ============================================================================

-- Function to build complete Vapi config for a scenario
CREATE OR REPLACE FUNCTION get_vapi_config_for_scenario(
  p_scenario_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_scenario RECORD;
  v_config JSONB;
BEGIN
  -- Get scenario data
  SELECT
    vapi_base_agent,
    vapi_overrides,
    persona,
    ai_prompt,
    difficulty,
    title,
    description
  INTO v_scenario
  FROM scenarios
  WHERE id = p_scenario_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Scenario not found: %', p_scenario_id;
  END IF;

  -- Build base config
  v_config := jsonb_build_object(
    'base_agent', v_scenario.vapi_base_agent,
    'persona', v_scenario.persona,
    'ai_prompt', v_scenario.ai_prompt,
    'difficulty', v_scenario.difficulty,
    'title', v_scenario.title,
    'description', v_scenario.description
  );

  -- Merge in overrides if they exist
  IF v_scenario.vapi_overrides IS NOT NULL THEN
    v_config := v_config || jsonb_build_object('overrides', v_scenario.vapi_overrides);
  END IF;

  RETURN v_config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_vapi_config_for_scenario IS 'Returns complete Vapi configuration for a scenario including base agent and overrides';

-- ============================================================================
-- STEP 6: Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_vapi_config_for_scenario TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- Test: Check all scenarios have valid agent types
-- SELECT id, title, vapi_base_agent FROM scenarios;

-- Test: Find scenarios with custom overrides
-- SELECT id, title, vapi_base_agent, vapi_overrides
-- FROM scenarios
-- WHERE vapi_overrides IS NOT NULL;

-- Test: Get config for a specific scenario
-- SELECT get_vapi_config_for_scenario('your-scenario-uuid-here');

-- Test: Count scenarios by agent type
-- SELECT vapi_base_agent, COUNT(*) as scenario_count
-- FROM scenarios
-- GROUP BY vapi_base_agent
-- ORDER BY scenario_count DESC;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================

-- To rollback this migration:
-- DROP FUNCTION IF EXISTS get_vapi_config_for_scenario;
-- DROP INDEX IF EXISTS idx_scenarios_vapi_base_agent;
-- DROP INDEX IF EXISTS idx_scenarios_vapi_overrides;
-- ALTER TABLE scenarios DROP CONSTRAINT IF EXISTS valid_vapi_base_agent;
-- ALTER TABLE scenarios DROP COLUMN IF EXISTS vapi_base_agent;
-- ALTER TABLE scenarios DROP COLUMN IF EXISTS vapi_overrides;
