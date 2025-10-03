export const WEBHOOK_EVENTS = [
  'scenario.assigned',
  'scenario.completed',
  'attempt.scored.low', // score < 60
  'attempt.scored.high', // score >= 80
  'track.completed',
  'user.added',
  'user.removed',
  'assignment.overdue',
  'performance.milestone', // custom milestones
] as const

export type WebhookEvent = typeof WEBHOOK_EVENTS[number]
