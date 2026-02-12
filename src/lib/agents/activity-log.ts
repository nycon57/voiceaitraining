import { createClient } from '@supabase/supabase-js'

interface LogAgentActivityParams {
  orgId: string
  userId?: string
  agentId: string
  eventType: string
  action: string
  details?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

/** Insert an agent activity log row using a service-role client (no cookie context needed). */
export async function logAgentActivity(params: LogAgentActivityParams) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { error } = await supabase.from('agent_activity_log').insert({
    org_id: params.orgId,
    user_id: params.userId ?? null,
    agent_id: params.agentId,
    event_type: params.eventType,
    action: params.action,
    details: params.details ?? null,
    metadata: params.metadata ?? null,
  })

  if (error) {
    console.error('[agent-activity-log] Failed to insert:', error.message)
    throw error
  }
}
