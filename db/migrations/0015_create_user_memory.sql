-- Structured memory for trainee weakness profiles, skill levels, and learning trajectories.
-- Used by the Coach Agent to persist per-user coaching intelligence.

CREATE TABLE user_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id),
  user_id text NOT NULL,
  memory_type text NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL,
  score numeric,
  trend text,
  last_evidence_at timestamptz,
  evidence_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT user_memory_unique_entry UNIQUE (org_id, user_id, memory_type, key),
  CONSTRAINT user_memory_score_range CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  CONSTRAINT user_memory_trend_values CHECK (trend IS NULL OR trend IN ('improving', 'declining', 'stable', 'new')),
  CONSTRAINT user_memory_type_values CHECK (memory_type IN ('weakness_profile', 'skill_level', 'learning_trajectory', 'coaching_note', 'practice_pattern'))
);

ALTER TABLE user_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_read_user_memory"
  ON user_memory
  FOR SELECT
  USING (org_id = current_setting('jwt.claims.org_id', true)::uuid);

-- Composite index for querying a user's memories by type
CREATE INDEX idx_user_memory_org_user_type
  ON user_memory (org_id, user_id, memory_type);

-- Composite index for sorting/filtering by score within a user
CREATE INDEX idx_user_memory_org_user_score
  ON user_memory (org_id, user_id, score);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_user_memory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_memory_updated_at
  BEFORE UPDATE ON user_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_user_memory_updated_at();
