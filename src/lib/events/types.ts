import { z } from 'zod'

// Domain event schemas

export const attemptCompletedSchema = z.object({
  attemptId: z.string(),
  userId: z.string(),
  orgId: z.string(),
  scenarioId: z.string(),
  durationSeconds: z.number(),
  vapiCallId: z.string(),
})

export const attemptScoredSchema = z.object({
  attemptId: z.string(),
  userId: z.string(),
  orgId: z.string(),
  scenarioId: z.string(),
  score: z.number(),
  scoreBreakdown: z.record(z.string(), z.unknown()),
  kpis: z.record(z.string(), z.unknown()),
  criticalFailures: z.array(z.string()),
})

export const attemptFeedbackGeneratedSchema = z.object({
  attemptId: z.string(),
  userId: z.string(),
  orgId: z.string(),
  feedbackSections: z.array(z.record(z.string(), z.unknown())),
  nextSteps: z.array(z.string()),
})

export const assignmentCreatedSchema = z.object({
  assignmentId: z.string(),
  userId: z.string(),
  orgId: z.string(),
  scenarioId: z.string().optional(),
  trackId: z.string().optional(),
  dueAt: z.string().optional(),
  assignedBy: z.string(),
})

export const assignmentOverdueSchema = z.object({
  assignmentId: z.string(),
  userId: z.string(),
  orgId: z.string(),
  scenarioId: z.string().optional(),
  trackId: z.string().optional(),
  dueAt: z.string(),
})

export const userJoinedOrgSchema = z.object({
  userId: z.string(),
  orgId: z.string(),
  role: z.string(),
  email: z.string(),
  name: z.string(),
})

export const userInactiveSchema = z.object({
  userId: z.string(),
  orgId: z.string(),
  lastAttemptAt: z.string(),
  daysSinceLastAttempt: z.number(),
})

export const coachRecommendationReadySchema = z.object({
  userId: z.string(),
  orgId: z.string(),
  recommendationType: z.string(),
  scenarioId: z.string().optional(),
  message: z.string(),
})

export const coachWeaknessUpdatedSchema = z.object({
  userId: z.string(),
  orgId: z.string(),
  weaknesses: z.array(z.record(z.string(), z.unknown())),
  strengths: z.array(z.record(z.string(), z.unknown())),
  trajectory: z.string(),
})

export const recordingUploadedSchema = z.object({
  orgId: z.string(),
  fileUrl: z.string(),
  uploadedBy: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// Event name constants

export const EVENT_NAMES = {
  ATTEMPT_COMPLETED: 'voiceai/attempt.completed',
  ATTEMPT_SCORED: 'voiceai/attempt.scored',
  ATTEMPT_FEEDBACK_GENERATED: 'voiceai/attempt.feedback.generated',
  ASSIGNMENT_CREATED: 'voiceai/assignment.created',
  ASSIGNMENT_OVERDUE: 'voiceai/assignment.overdue',
  USER_JOINED_ORG: 'voiceai/user.joined.org',
  USER_INACTIVE: 'voiceai/user.inactive',
  COACH_RECOMMENDATION_READY: 'voiceai/coach.recommendation.ready',
  COACH_WEAKNESS_UPDATED: 'voiceai/coach.weakness.updated',
  RECORDING_UPLOADED: 'voiceai/recording.uploaded',
} as const

/** Event name to Zod schema map, used by Inngest and runtime validation. */
export const eventSchemas = {
  [EVENT_NAMES.ATTEMPT_COMPLETED]: attemptCompletedSchema,
  [EVENT_NAMES.ATTEMPT_SCORED]: attemptScoredSchema,
  [EVENT_NAMES.ATTEMPT_FEEDBACK_GENERATED]: attemptFeedbackGeneratedSchema,
  [EVENT_NAMES.ASSIGNMENT_CREATED]: assignmentCreatedSchema,
  [EVENT_NAMES.ASSIGNMENT_OVERDUE]: assignmentOverdueSchema,
  [EVENT_NAMES.USER_JOINED_ORG]: userJoinedOrgSchema,
  [EVENT_NAMES.USER_INACTIVE]: userInactiveSchema,
  [EVENT_NAMES.COACH_RECOMMENDATION_READY]: coachRecommendationReadySchema,
  [EVENT_NAMES.COACH_WEAKNESS_UPDATED]: coachWeaknessUpdatedSchema,
  [EVENT_NAMES.RECORDING_UPLOADED]: recordingUploadedSchema,
} as const

// Inferred payload types

export type AttemptCompletedPayload = z.infer<typeof attemptCompletedSchema>
export type AttemptScoredPayload = z.infer<typeof attemptScoredSchema>
export type AttemptFeedbackGeneratedPayload = z.infer<typeof attemptFeedbackGeneratedSchema>
export type AssignmentCreatedPayload = z.infer<typeof assignmentCreatedSchema>
export type AssignmentOverduePayload = z.infer<typeof assignmentOverdueSchema>
export type UserJoinedOrgPayload = z.infer<typeof userJoinedOrgSchema>
export type UserInactivePayload = z.infer<typeof userInactiveSchema>
export type CoachRecommendationReadyPayload = z.infer<typeof coachRecommendationReadySchema>
export type CoachWeaknessUpdatedPayload = z.infer<typeof coachWeaknessUpdatedSchema>
export type RecordingUploadedPayload = z.infer<typeof recordingUploadedSchema>

// Discriminated union of all domain events

export type DomainEvent =
  | { name: typeof EVENT_NAMES.ATTEMPT_COMPLETED; data: AttemptCompletedPayload }
  | { name: typeof EVENT_NAMES.ATTEMPT_SCORED; data: AttemptScoredPayload }
  | { name: typeof EVENT_NAMES.ATTEMPT_FEEDBACK_GENERATED; data: AttemptFeedbackGeneratedPayload }
  | { name: typeof EVENT_NAMES.ASSIGNMENT_CREATED; data: AssignmentCreatedPayload }
  | { name: typeof EVENT_NAMES.ASSIGNMENT_OVERDUE; data: AssignmentOverduePayload }
  | { name: typeof EVENT_NAMES.USER_JOINED_ORG; data: UserJoinedOrgPayload }
  | { name: typeof EVENT_NAMES.USER_INACTIVE; data: UserInactivePayload }
  | { name: typeof EVENT_NAMES.COACH_RECOMMENDATION_READY; data: CoachRecommendationReadyPayload }
  | { name: typeof EVENT_NAMES.COACH_WEAKNESS_UPDATED; data: CoachWeaknessUpdatedPayload }
  | { name: typeof EVENT_NAMES.RECORDING_UPLOADED; data: RecordingUploadedPayload }

/** Event name → payload type lookup. */
export type EventPayloadMap = {
  [EVENT_NAMES.ATTEMPT_COMPLETED]: AttemptCompletedPayload
  [EVENT_NAMES.ATTEMPT_SCORED]: AttemptScoredPayload
  [EVENT_NAMES.ATTEMPT_FEEDBACK_GENERATED]: AttemptFeedbackGeneratedPayload
  [EVENT_NAMES.ASSIGNMENT_CREATED]: AssignmentCreatedPayload
  [EVENT_NAMES.ASSIGNMENT_OVERDUE]: AssignmentOverduePayload
  [EVENT_NAMES.USER_JOINED_ORG]: UserJoinedOrgPayload
  [EVENT_NAMES.USER_INACTIVE]: UserInactivePayload
  [EVENT_NAMES.COACH_RECOMMENDATION_READY]: CoachRecommendationReadyPayload
  [EVENT_NAMES.COACH_WEAKNESS_UPDATED]: CoachWeaknessUpdatedPayload
  [EVENT_NAMES.RECORDING_UPLOADED]: RecordingUploadedPayload
}
