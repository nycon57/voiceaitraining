-- Notification preferences and notifications for agent-driven alerts.

-- Per-user notification preferences (channel toggles, quiet hours, digest settings).
CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id),
  user_id text NOT NULL,
  channel_email boolean NOT NULL DEFAULT true,
  channel_push boolean NOT NULL DEFAULT true,
  channel_in_app boolean NOT NULL DEFAULT true,
  quiet_hours_start time,
  quiet_hours_end time,
  quiet_hours_timezone text NOT NULL DEFAULT 'UTC',
  digest_frequency text NOT NULL DEFAULT 'daily',
  coach_nudges boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT notification_preferences_unique_user UNIQUE (org_id, user_id),
  CONSTRAINT notification_preferences_digest_values CHECK (
    digest_frequency IN ('realtime', 'daily', 'weekly', 'none')
  )
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_read_notification_preferences"
  ON notification_preferences
  FOR SELECT
  USING (org_id = current_setting('jwt.claims.org_id', true)::uuid);

-- Auto-update updated_at on modification.
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Individual notifications delivered to users.
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES orgs(id),
  user_id text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  action_url text,
  agent_id text,
  read boolean NOT NULL DEFAULT false,
  channel_sent text[] NOT NULL DEFAULT '{}',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_read_notifications"
  ON notifications
  FOR SELECT
  USING (org_id = current_setting('jwt.claims.org_id', true)::uuid);

-- Primary query path: unread notifications for a user, newest first.
CREATE INDEX idx_notifications_org_user_read_created
  ON notifications (org_id, user_id, read, created_at DESC);
