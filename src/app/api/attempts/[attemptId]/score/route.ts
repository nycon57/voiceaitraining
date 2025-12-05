import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { calculateGlobalKPIs, calculateScenarioKPIs, calculateOverallScore } from '@/lib/ai/scoring'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params

    // Use admin client - this is an internal API called from webhooks
    const supabase = await createAdminClient()

    // Get attempt with scenario and rubric
    const { data: attempt, error: attemptError } = await supabase
      .from('scenario_attempts')
      .select(`
        *,
        scenario:scenarios(
          id,
          title,
          rubric,
          persona
        )
      `)
      .eq('id', attemptId)
      .single()

    if (attemptError || !attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    // Ensure we have transcript data
    if (!attempt.transcript_json || !Array.isArray(attempt.transcript_json)) {
      return NextResponse.json(
        { error: 'No transcript available for scoring' },
        { status: 400 }
      )
    }

    // Calculate KPIs
    const globalKPIs = calculateGlobalKPIs(
      attempt.transcript_json,
      attempt.duration_seconds || 0
    )

    const scenarioKPIs = calculateScenarioKPIs(
      attempt.transcript_json,
      attempt.scenario?.persona || {}
    )

    // Combine KPIs
    const kpis = {
      global: globalKPIs,
      scenario: scenarioKPIs,
    }

    // Calculate score based on rubric
    const rubric = attempt.scenario?.rubric || {}
    const { total_score, breakdown } = calculateOverallScore(globalKPIs, scenarioKPIs, rubric)

    // Update attempt with score and KPIs
    const { error: updateError } = await supabase
      .from('scenario_attempts')
      .update({
        score: total_score,
        score_breakdown: breakdown,
        kpis,
        updated_at: new Date().toISOString(),
      })
      .eq('id', attemptId)
      .eq('org_id', attempt.org_id)

    if (updateError) {
      console.error('Failed to update attempt with score:', updateError)
      return NextResponse.json(
        { error: 'Failed to save score' },
        { status: 500 }
      )
    }

    console.log(`Scored attempt ${attemptId}: ${total_score}/100`)
    return NextResponse.json({
      success: true,
      attemptId,
      score: total_score,
      breakdown,
    })
  } catch (error) {
    console.error('Error scoring attempt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
