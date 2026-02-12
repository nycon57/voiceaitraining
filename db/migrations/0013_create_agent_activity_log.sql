-- Create agent_activity_log table for auditing autonomous agent actions
CREATE TABLE agent_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id),
  user_id text,
  agent_id text NOT NULL,
  event_type text NOT NULL,
  action text NOT NULL,
  details jsonb,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE agent_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policy: org members can read their org's activity
CREATE POLICY "org_members_read_activity"
  ON agent_activity_log
  FOR SELECT
  USING (org_id = current_setting('jwt.claims.org_id', true)::uuid);

-- Index for org-wide queries ordered by time
CREATE INDEX idx_agent_activity_log_org_created
  ON agent_activity_log (org_id, created_at DESC);

-- Index for per-user queries within an org
CREATE INDEX idx_agent_activity_log_org_user_created
  ON agent_activity_log (org_id, user_id, created_at DESC);
