import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { getAssistantId, buildAssistantOverrides } from '@/lib/vapi-agents'
import type { Scenario } from '@/types/scenario'
import { z } from 'zod'

const startCallSchema = z.object({
  scenarioId: z.string().uuid(),
  assignmentId: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  try {
    console.log('[POST /api/calls/start] Starting call initialization')

    const user = await getCurrentUser()
    if (!user || !user.orgId) {
      console.log('[POST /api/calls/start] Unauthorized - no user or orgId')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('[POST /api/calls/start] User authenticated:', user.id, 'org:', user.orgId)

    const body = await req.json()
    const { scenarioId, assignmentId } = startCallSchema.parse(body)
    console.log('[POST /api/calls/start] Request validated - scenarioId:', scenarioId)

    // Use admin client to bypass RLS - we're already checking auth via getCurrentUser()
    const supabase = await createAdminClient()

    // Get scenario details with Vapi agent configuration
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .eq('org_id', user.orgId)
      .single()

    if (scenarioError || !scenario) {
      console.log('[POST /api/calls/start] Scenario not found:', scenarioError)
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
    }
    console.log('[POST /api/calls/start] Scenario found:', scenario.title)

    // Create attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('scenario_attempts')
      .insert({
        org_id: user.orgId,
        clerk_user_id: user.id,
        scenario_id: scenarioId,
        assignment_id: assignmentId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (attemptError) {
      console.log('[POST /api/calls/start] Failed to create attempt:', attemptError)
      return NextResponse.json({ error: 'Failed to create attempt' }, { status: 500 })
    }
    console.log('[POST /api/calls/start] Attempt created:', attempt.id)

    // Get base permanent assistant ID
    const baseAgent = scenario.vapi_base_agent || 'professional'
    console.log('[POST /api/calls/start] Base agent:', baseAgent)

    const assistantId = getAssistantId(baseAgent)
    console.log('[POST /api/calls/start] Assistant ID:', assistantId)

    // Build transient overrides with scenario-specific context
    console.log('[POST /api/calls/start] Building assistant overrides...')
    const assistantOverrides = buildAssistantOverrides(scenario as Scenario)
    console.log('[POST /api/calls/start] Assistant overrides built successfully')

    const response = {
      attemptId: attempt.id,
      assistantId, // Base permanent assistant ID
      assistantOverrides, // Transient scenario-specific overrides
      scenario: {
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        persona: scenario.persona,
        baseAgent,
      },
    }

    console.log('[POST /api/calls/start] Success - returning response')
    return NextResponse.json(response)
  } catch (error) {
    console.error('[POST /api/calls/start] Error:', error)
    if (error instanceof Error) {
      console.error('[POST /api/calls/start] Error message:', error.message)
      console.error('[POST /api/calls/start] Error stack:', error.stack)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}