import type { GetEvents, SendEventPayload } from 'inngest'

import { inngest } from '@/lib/inngest/client'
import {
  EVENT_NAMES,
  eventSchemas,
  type AttemptCompletedPayload,
  type AttemptFeedbackGeneratedPayload,
  type AttemptScoredPayload,
  type AssignmentCreatedPayload,
  type AssignmentOverduePayload,
  type CoachRecommendationReadyPayload,
  type CoachWeaknessUpdatedPayload,
  type EventPayloadMap,
  type RecordingUploadedPayload,
  type UserInactivePayload,
  type UserJoinedOrgPayload,
} from './types'

type InngestSendPayload = SendEventPayload<GetEvents<typeof inngest>>

/** Validates payload against its Zod schema, then sends the event via Inngest. */
export async function emitEvent<K extends keyof EventPayloadMap>(
  eventName: K,
  payload: EventPayloadMap[K]
): Promise<void> {
  const schema = eventSchemas[eventName]
  const parsed = schema.parse(payload)

  // TS can't narrow a generic union through send(); Zod validates above.
  await inngest.send({ name: eventName, data: parsed } as InngestSendPayload)
}

// Typed emit helpers

export function emitAttemptCompleted(data: AttemptCompletedPayload) {
  return emitEvent(EVENT_NAMES.ATTEMPT_COMPLETED, data)
}

export function emitAttemptScored(data: AttemptScoredPayload) {
  return emitEvent(EVENT_NAMES.ATTEMPT_SCORED, data)
}

export function emitAttemptFeedbackGenerated(data: AttemptFeedbackGeneratedPayload) {
  return emitEvent(EVENT_NAMES.ATTEMPT_FEEDBACK_GENERATED, data)
}

export function emitAssignmentCreated(data: AssignmentCreatedPayload) {
  return emitEvent(EVENT_NAMES.ASSIGNMENT_CREATED, data)
}

export function emitAssignmentOverdue(data: AssignmentOverduePayload) {
  return emitEvent(EVENT_NAMES.ASSIGNMENT_OVERDUE, data)
}

export function emitUserJoinedOrg(data: UserJoinedOrgPayload) {
  return emitEvent(EVENT_NAMES.USER_JOINED_ORG, data)
}

export function emitUserInactive(data: UserInactivePayload) {
  return emitEvent(EVENT_NAMES.USER_INACTIVE, data)
}

export function emitCoachRecommendationReady(data: CoachRecommendationReadyPayload) {
  return emitEvent(EVENT_NAMES.COACH_RECOMMENDATION_READY, data)
}

export function emitCoachWeaknessUpdated(data: CoachWeaknessUpdatedPayload) {
  return emitEvent(EVENT_NAMES.COACH_WEAKNESS_UPDATED, data)
}

export function emitRecordingUploaded(data: RecordingUploadedPayload) {
  return emitEvent(EVENT_NAMES.RECORDING_UPLOADED, data)
}
