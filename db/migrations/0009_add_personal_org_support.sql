-- Migration: Add Personal Organization Support
-- Description: Enables individual users to use the platform by auto-creating personal orgs
-- Author: Claude
-- Date: 2025-09-30

-- ============================================================================
-- STEP 1: Add Personal Org Columns to orgs Table
-- ============================================================================

-- Add is_personal flag to distinguish personal orgs from team orgs
ALTER TABLE orgs
ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT false NOT NULL;

-- Add personal_user_clerk_id to link personal org to its owner
ALTER TABLE orgs
ADD COLUMN IF NOT EXISTS personal_user_clerk_id TEXT;

-- Create unique index on personal_user_clerk_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_orgs_personal_user_clerk_id
ON orgs(personal_user_clerk_id)
WHERE personal_user_clerk_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN orgs.is_personal IS 'True if this is a personal org (single user), false for team orgs';
COMMENT ON COLUMN orgs.personal_user_clerk_id IS 'Clerk user ID of the owner for personal orgs, NULL for team orgs';

-- ============================================================================
-- STEP 2: Add Plan Constraints
-- ============================================================================

-- Add constraint to ensure personal orgs only use individual plans
ALTER TABLE orgs
ADD CONSTRAINT valid_personal_plans
CHECK (
  (is_personal = false)
  OR
  (is_personal = true AND plan IN ('individual_free', 'individual_pro', 'individual_ultra'))
);

-- Add constraint to ensure team orgs don't use individual plans
ALTER TABLE orgs
ADD CONSTRAINT valid_team_plans
CHECK (
  (is_personal = true)
  OR
  (is_personal = false AND plan IN ('starter', 'professional', 'enterprise', 'trial'))
);

-- Add constraint to ensure personal orgs have exactly one user
ALTER TABLE orgs
ADD CONSTRAINT personal_org_user_id_required
CHECK (
  (is_personal = false AND personal_user_clerk_id IS NULL)
  OR
  (is_personal = true AND personal_user_clerk_id IS NOT NULL)
);

-- ============================================================================
-- STEP 3: Create Personal Org Management Functions
-- ============================================================================

-- Function: create_personal_org
-- Creates a new personal organization for an individual user
CREATE OR REPLACE FUNCTION create_personal_org(
  p_clerk_user_id TEXT,
  p_first_name TEXT,
  p_email TEXT,
  p_plan TEXT DEFAULT 'individual_free'
) RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
  v_org_name TEXT;
  v_org_slug TEXT;
  v_plan_limits JSONB;
  v_settings JSONB;
BEGIN
  -- Check if personal org already exists for this user
  SELECT id INTO v_org_id
  FROM orgs
  WHERE personal_user_clerk_id = p_clerk_user_id;

  IF v_org_id IS NOT NULL THEN
    RAISE EXCEPTION 'Personal org already exists for user %', p_clerk_user_id;
  END IF;

  -- Validate plan
  IF p_plan NOT IN ('individual_free', 'individual_pro', 'individual_ultra') THEN
    RAISE EXCEPTION 'Invalid personal org plan: %', p_plan;
  END IF;

  -- Generate org name and slug
  v_org_name := p_first_name || '''s Workspace';
  v_org_slug := 'personal-' || lower(regexp_replace(p_clerk_user_id, '[^a-zA-Z0-9]', '', 'g'));

  -- Set plan limits based on plan type
  v_plan_limits := CASE p_plan
    WHEN 'individual_free' THEN
      jsonb_build_object(
        'max_users', 1,
        'max_sessions_per_month', 10,
        'max_scenarios', 3,
        'ai_generation', false,
        'custom_branding', false,
        'priority_support', false,
        'analytics_retention_days', 30
      )
    WHEN 'individual_pro' THEN
      jsonb_build_object(
        'max_users', 1,
        'max_sessions_per_month', 100,
        'max_scenarios', 50,
        'ai_generation', true,
        'custom_branding', false,
        'priority_support', false,
        'analytics_retention_days', 90
      )
    WHEN 'individual_ultra' THEN
      jsonb_build_object(
        'max_users', 1,
        'max_sessions_per_month', 500,
        'max_scenarios', 200,
        'ai_generation', true,
        'custom_branding', true,
        'priority_support', true,
        'analytics_retention_days', 365
      )
  END;

  -- Set settings with team features disabled
  v_settings := jsonb_build_object(
    'show_team_features', false,
    'show_leaderboard', false,
    'show_assignments', false,
    'show_team_management', false,
    'show_hr_features', false,
    'dashboard_layout', 'personal'
  );

  -- Create the personal org
  INSERT INTO orgs (
    name,
    slug,
    plan,
    is_personal,
    personal_user_clerk_id,
    plan_limits,
    settings,
    created_at,
    updated_at
  ) VALUES (
    v_org_name,
    v_org_slug,
    p_plan,
    true,
    p_clerk_user_id,
    v_plan_limits,
    v_settings,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_org_id;

  -- Create user record for the personal org owner
  INSERT INTO users (
    clerk_user_id,
    org_id,
    email,
    first_name,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    p_clerk_user_id,
    v_org_id,
    p_email,
    p_first_name,
    'trainee', -- Personal users are always trainees
    true,
    NOW(),
    NOW()
  );

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_personal_org IS 'Creates a new personal organization for an individual user';

-- Function: convert_personal_to_team_org
-- Converts a personal org to a team org (upgrade path)
CREATE OR REPLACE FUNCTION convert_personal_to_team_org(
  p_org_id UUID,
  p_new_org_name TEXT,
  p_new_plan TEXT DEFAULT 'starter'
) RETURNS BOOLEAN AS $$
DECLARE
  v_is_personal BOOLEAN;
  v_user_count INTEGER;
BEGIN
  -- Check if org is personal
  SELECT is_personal INTO v_is_personal
  FROM orgs
  WHERE id = p_org_id;

  IF v_is_personal IS NULL THEN
    RAISE EXCEPTION 'Organization not found: %', p_org_id;
  END IF;

  IF v_is_personal = false THEN
    RAISE EXCEPTION 'Organization % is already a team org', p_org_id;
  END IF;

  -- Validate new plan is a team plan
  IF p_new_plan NOT IN ('starter', 'professional', 'enterprise') THEN
    RAISE EXCEPTION 'Invalid team org plan: %', p_new_plan;
  END IF;

  -- Count users (should be 1 for personal org)
  SELECT COUNT(*) INTO v_user_count
  FROM users
  WHERE org_id = p_org_id;

  -- Update org to team org
  UPDATE orgs
  SET
    is_personal = false,
    personal_user_clerk_id = NULL,
    name = p_new_org_name,
    plan = p_new_plan,
    plan_limits = CASE p_new_plan
      WHEN 'starter' THEN jsonb_build_object(
        'max_users', 10,
        'max_sessions_per_month', 500,
        'max_scenarios', 25,
        'ai_generation', true,
        'custom_branding', false,
        'priority_support', false
      )
      WHEN 'professional' THEN jsonb_build_object(
        'max_users', 50,
        'max_sessions_per_month', 2500,
        'max_scenarios', 100,
        'ai_generation', true,
        'custom_branding', true,
        'priority_support', true
      )
      WHEN 'enterprise' THEN jsonb_build_object(
        'max_users', -1,
        'max_sessions_per_month', -1,
        'max_scenarios', -1,
        'ai_generation', true,
        'custom_branding', true,
        'priority_support', true
      )
    END,
    settings = jsonb_build_object(
      'show_team_features', true,
      'show_leaderboard', true,
      'show_assignments', true,
      'show_team_management', true,
      'show_hr_features', true,
      'dashboard_layout', 'team'
    ),
    updated_at = NOW()
  WHERE id = p_org_id;

  -- Upgrade the owner to admin role
  UPDATE users
  SET
    role = 'admin',
    updated_at = NOW()
  WHERE org_id = p_org_id
    AND is_active = true;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION convert_personal_to_team_org IS 'Converts a personal org to a team org with upgraded plan';

-- Function: is_personal_org_user
-- Checks if a user belongs to a personal org
CREATE OR REPLACE FUNCTION is_personal_org_user(
  p_clerk_user_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_is_personal BOOLEAN;
BEGIN
  SELECT o.is_personal INTO v_is_personal
  FROM users u
  JOIN orgs o ON u.org_id = o.id
  WHERE u.clerk_user_id = p_clerk_user_id
    AND u.is_active = true;

  RETURN COALESCE(v_is_personal, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_personal_org_user IS 'Returns true if user belongs to a personal org';

-- Function: get_personal_org_id
-- Gets the personal org ID for a user
CREATE OR REPLACE FUNCTION get_personal_org_id(
  p_clerk_user_id TEXT
) RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT id INTO v_org_id
  FROM orgs
  WHERE personal_user_clerk_id = p_clerk_user_id
    AND is_personal = true;

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_personal_org_id IS 'Returns the personal org ID for a given user';

-- ============================================================================
-- STEP 4: Update Existing Data (if needed)
-- ============================================================================

-- Mark all existing orgs as team orgs (non-personal)
UPDATE orgs
SET is_personal = false
WHERE is_personal IS NULL;

-- ============================================================================
-- STEP 5: Create Indexes for Performance
-- ============================================================================

-- Index for personal org lookups
CREATE INDEX IF NOT EXISTS idx_orgs_is_personal
ON orgs(is_personal)
WHERE is_personal = true;

-- Index for plan filtering
CREATE INDEX IF NOT EXISTS idx_orgs_plan
ON orgs(plan);

-- ============================================================================
-- STEP 6: Update RLS Policies (No Changes Needed)
-- ============================================================================

-- Note: Existing RLS policies already enforce org_id filtering via get_current_org_id()
-- Personal orgs will work seamlessly with existing RLS policies since they have org_id
-- No changes needed to RLS policies

-- ============================================================================
-- STEP 7: Grant Permissions
-- ============================================================================

-- Grant execute permissions on new functions to authenticated users
GRANT EXECUTE ON FUNCTION create_personal_org TO authenticated;
GRANT EXECUTE ON FUNCTION convert_personal_to_team_org TO authenticated;
GRANT EXECUTE ON FUNCTION is_personal_org_user TO authenticated;
GRANT EXECUTE ON FUNCTION get_personal_org_id TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- Test: Create a personal org
-- SELECT create_personal_org('test_clerk_123', 'John', 'john@example.com', 'individual_pro');

-- Test: Check if user is in personal org
-- SELECT is_personal_org_user('test_clerk_123');

-- Test: Get personal org ID
-- SELECT get_personal_org_id('test_clerk_123');

-- Test: List all personal orgs
-- SELECT id, name, plan, personal_user_clerk_id FROM orgs WHERE is_personal = true;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================

-- To rollback this migration:
-- DROP FUNCTION IF EXISTS create_personal_org;
-- DROP FUNCTION IF EXISTS convert_personal_to_team_org;
-- DROP FUNCTION IF EXISTS is_personal_org_user;
-- DROP FUNCTION IF EXISTS get_personal_org_id;
-- ALTER TABLE orgs DROP CONSTRAINT IF EXISTS valid_personal_plans;
-- ALTER TABLE orgs DROP CONSTRAINT IF EXISTS valid_team_plans;
-- ALTER TABLE orgs DROP CONSTRAINT IF EXISTS personal_org_user_id_required;
-- DROP INDEX IF EXISTS idx_orgs_personal_user_clerk_id;
-- DROP INDEX IF EXISTS idx_orgs_is_personal;
-- DROP INDEX IF EXISTS idx_orgs_plan;
-- ALTER TABLE orgs DROP COLUMN IF EXISTS is_personal;
-- ALTER TABLE orgs DROP COLUMN IF EXISTS personal_user_clerk_id;