import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ scenarioId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.orgId) {
      console.error('[GET /api/scenarios/[scenarioId]] Unauthorized - no user or orgId')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scenarioId } = await params

    // Use admin client to bypass RLS - we're already checking auth via getCurrentUser()
    const supabase = await createAdminClient()

    // Get scenario details - verify it belongs to user's org
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .eq('org_id', user.orgId)
      .single()

    if (scenarioError) {
      console.error(`[GET /api/scenarios/${scenarioId}] Query error details:`, {
        code: scenarioError.code,
        message: scenarioError.message,
        details: scenarioError.details,
        hint: scenarioError.hint
      })
      return NextResponse.json({ error: 'Scenario not found', details: scenarioError.message }, { status: 404 })
    }

    if (!scenario) {
      console.error(`[GET /api/scenarios/${scenarioId}] Scenario not found for org ${user.orgId}`)
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
    }

    console.log(`[GET /api/scenarios/${scenarioId}] Success - returning scenario`)
    return NextResponse.json(scenario)
  } catch (error) {
    console.error('[GET /api/scenarios/[scenarioId]] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
