export type WebhookEvent =
  | 'scenario.assigned'
  | 'scenario.completed'
  | 'track.completed'
  | 'attempt.scored.low'
  | 'user.added'
  | 'user.removed'

export interface WebhookConfig {
  id: string
  org_id: string
  name: string
  url: string
  secret: string
  enabled: boolean
  events: WebhookEvent[]
  created_at: string
  updated_at: string
}

export interface WebhookDelivery {
  id: string
  webhook_id: string
  event: WebhookEvent
  payload: Record<string, any>
  status: 'pending' | 'success' | 'failed' | 'retrying'
  response_status?: number
  response_body?: string
  attempted_at: string
  retry_count: number
  next_retry_at?: string
}

export interface WebhookPayload {
  event: WebhookEvent
  idempotency_key: string
  org: {
    id: string
    name: string
  }
  user: {
    id: string
    email?: string
    name?: string
    role: string
  }
  scenario?: {
    id: string
    title: string
  }
  track?: {
    id: string
    title: string
  }
  attempt?: {
    id: string
    score?: number
    duration_seconds?: number
    kpis?: Record<string, any>
    recording_url?: string
    transcript_url?: string
  }
  timestamp: string
  signature: string
}