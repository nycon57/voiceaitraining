import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const startCallSchema = z.object({
  scenario_id: z.string().uuid(),
  assignment_id: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { scenario_id, assignment_id } = startCallSchema.parse(body)

    const supabase = await createClient()
    await supabase.rpc('set_org_claim', { org_id: user.orgId })

    // Get scenario details
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenario_id)
      .eq('org_id', user.orgId)
      .single()

    if (scenarioError || !scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
    }

    // Create attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('scenario_attempts')
      .insert({
        org_id: user.orgId,
        user_id: user.id,
        scenario_id: scenario_id,
        assignment_id: assignment_id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (attemptError) {
      return NextResponse.json({ error: 'Failed to create attempt' }, { status: 500 })
    }

    // TODO: Initialize Vapi call with scenario configuration
    // This would include:
    // - Setting up the AI prompt from scenario.ai_prompt
    // - Configuring the persona from scenario.persona
    // - Setting up STT/TTS preferences
    // - Returning call configuration for frontend

    return NextResponse.json({
      attempt_id: attempt.id,
      scenario: {
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        persona: scenario.persona,
      },
      // call_config: vapiCallConfig, // TODO: Add Vapi configuration
    })
  } catch (error) {
    console.error('Error starting call:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}