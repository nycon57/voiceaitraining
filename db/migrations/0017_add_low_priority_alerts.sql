-- Allow managers to opt out of low-priority notification alerts (e.g. milestones).
ALTER TABLE notification_preferences
  ADD COLUMN low_priority_alerts boolean NOT NULL DEFAULT true;
