import { triggerWebhookEvent } from '@/actions/webhooks'
import type { WebhookEvent } from '@/lib/webhooks-types'

// Helper functions to build webhook payloads

export interface WebhookPayload {
  event: WebhookEvent
  idempotency_key: string
  org: {
    id: string
    name: string
  }
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
  scenario?: {
    id: string
    title: string
    difficulty?: string
  }
  attempt?: {
    id: string
    score?: number
    duration_seconds?: number
    kpis?: any
    recording_url?: string
    transcript_url?: string
  }
  assignment?: {
    id: string
    due_at?: string
  }
  track?: {
    id: string
    title: string
  }
  timestamp: string
  signature?: string
}

export function buildWebhookPayload(
  event: WebhookEvent,
  data: {
    orgId: string
    orgName: string
    user?: any
    scenario?: any
    attempt?: any
    assignment?: any
    track?: any
  }
): WebhookPayload {
  const idempotencyKey = `${data.orgId}-${event}-${Date.now()}-${Math.random().toString(36).substring(7)}`

  const payload: WebhookPayload = {
    event,
    idempotency_key: idempotencyKey,
    org: {
      id: data.orgId,
      name: data.orgName
    },
    timestamp: new Date().toISOString()
  }

  if (data.user) {
    payload.user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name || data.user.firstName + ' ' + data.user.lastName || 'Unknown',
      role: data.user.role || 'trainee'
    }
  }

  if (data.scenario) {
    payload.scenario = {
      id: data.scenario.id,
      title: data.scenario.title,
      difficulty: data.scenario.difficulty
    }
  }

  if (data.attempt) {
    payload.attempt = {
      id: data.attempt.id,
      score: data.attempt.score,
      duration_seconds: data.attempt.duration_seconds,
      kpis: data.attempt.kpis,
      recording_url: data.attempt.recording_url ? `${process.env.NEXT_PUBLIC_APP_URL}/api/storage/sign-url?path=${encodeURIComponent(data.attempt.recording_url)}` : undefined,
      transcript_url: data.attempt.transcript_path ? `${process.env.NEXT_PUBLIC_APP_URL}/api/storage/sign-url?path=${encodeURIComponent(data.attempt.transcript_path)}` : undefined
    }
  }

  if (data.assignment) {
    payload.assignment = {
      id: data.assignment.id,
      due_at: data.assignment.due_at
    }
  }

  if (data.track) {
    payload.track = {
      id: data.track.id,
      title: data.track.title
    }
  }

  return payload
}

// Convenience functions for triggering specific webhook events

export async function triggerScenarioAssigned(
  orgId: string,
  orgName: string,
  user: any,
  scenario: any,
  assignment: any
) {
  const payload = buildWebhookPayload('scenario.assigned', {
    orgId,
    orgName,
    user,
    scenario,
    assignment
  })

  await triggerWebhookEvent(orgId, 'scenario.assigned', payload)
}

export async function triggerScenarioCompleted(
  orgId: string,
  orgName: string,
  user: any,
  scenario: any,
  attempt: any
) {
  const payload = buildWebhookPayload('scenario.completed', {
    orgId,
    orgName,
    user,
    scenario,
    attempt
  })

  await triggerWebhookEvent(orgId, 'scenario.completed', payload)
}

export async function triggerAttemptScoredLow(
  orgId: string,
  orgName: string,
  user: any,
  scenario: any,
  attempt: any
) {
  const payload = buildWebhookPayload('attempt.scored.low', {
    orgId,
    orgName,
    user,
    scenario,
    attempt
  })

  await triggerWebhookEvent(orgId, 'attempt.scored.low', payload)
}

export async function triggerAttemptScoredHigh(
  orgId: string,
  orgName: string,
  user: any,
  scenario: any,
  attempt: any
) {
  const payload = buildWebhookPayload('attempt.scored.high', {
    orgId,
    orgName,
    user,
    scenario,
    attempt
  })

  await triggerWebhookEvent(orgId, 'attempt.scored.high', payload)
}

export async function triggerTrackCompleted(
  orgId: string,
  orgName: string,
  user: any,
  track: any
) {
  const payload = buildWebhookPayload('track.completed', {
    orgId,
    orgName,
    user,
    track
  })

  await triggerWebhookEvent(orgId, 'track.completed', payload)
}

export async function triggerUserAdded(
  orgId: string,
  orgName: string,
  user: any
) {
  const payload = buildWebhookPayload('user.added', {
    orgId,
    orgName,
    user
  })

  await triggerWebhookEvent(orgId, 'user.added', payload)
}

export async function triggerUserRemoved(
  orgId: string,
  orgName: string,
  user: any
) {
  const payload = buildWebhookPayload('user.removed', {
    orgId,
    orgName,
    user
  })

  await triggerWebhookEvent(orgId, 'user.removed', payload)
}

export async function triggerAssignmentOverdue(
  orgId: string,
  orgName: string,
  user: any,
  assignment: any,
  scenario?: any
) {
  const payload = buildWebhookPayload('assignment.overdue', {
    orgId,
    orgName,
    user,
    assignment,
    scenario
  })

  await triggerWebhookEvent(orgId, 'assignment.overdue', payload)
}

export async function triggerPerformanceMilestone(
  orgId: string,
  orgName: string,
  user: any,
  milestone: any
) {
  const payload = buildWebhookPayload('performance.milestone', {
    orgId,
    orgName,
    user,
    ...milestone
  })

  await triggerWebhookEvent(orgId, 'performance.milestone', payload)
}

// Webhook signature verification utility
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string
): boolean {
  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(timestamp + '.' + payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    console.error('Webhook signature verification error:', error)
    return false
  }
}