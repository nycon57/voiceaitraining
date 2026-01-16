import { NextRequest, NextResponse } from 'next/server'
import { requireHuman } from '@/lib/botid'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { AttemptStatus } from '@/types/attempt'

const endCallSchema = z.object({
  attemptId: z.string().uuid(),
  transcript: z.array(
    z.object({
      id: z.string(),
      role: z.enum(['user', 'assistant']),
      text: z.string(),
      timestamp: z.number(),
      isFinal: z.boolean(),
    })
  ),
  duration: z.number(),
  recordingUrl: z.string().url().optional(),
  status: z.enum(['completed', 'cancelled', 'practice', 'technical_issue']).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const botResponse = await requireHuman()
    if (botResponse) return botResponse

    const user = await getCurrentUser()
    if (!user || !user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { attemptId, transcript, duration, recordingUrl, status } = endCallSchema.parse(body)

    // Use admin client to bypass RLS - we're already checking auth via getCurrentUser()
    const supabase = await createAdminClient()

    // Auto-discard logic: if call duration < 15 seconds, automatically set status to 'cancelled'
    let finalStatus: AttemptStatus = status || 'completed'
    if (duration < 15) {
      finalStatus = 'cancelled'
    }

    // Determine if we should save transcript and recording
    const shouldSaveArtifacts = finalStatus !== 'cancelled'

    // Update attempt with final data
    const updateData: any = {
      ended_at: new Date().toISOString(),
      duration_seconds: duration,
      attempt_status: finalStatus,
    }

    // Only save transcript and recording if not cancelled
    if (shouldSaveArtifacts) {
      updateData.transcript_json = transcript
      updateData.recording_url = recordingUrl
    }

    const { data: attempt, error: updateError } = await supabase
      .from('scenario_attempts')
      .update(updateData)
      .eq('id', attemptId)
      .eq('org_id', user.orgId)
      .eq('clerk_user_id', user.id)
      .select()
      .single()

    if (updateError || !attempt) {
      console.error('Error updating attempt:', updateError)
      return NextResponse.json(
        { error: 'Failed to update attempt' },
        { status: 500 }
      )
    }

    // TODO: Trigger background job to:
    // 1. Compute KPIs from transcript
    // 2. Generate score based on rubric
    // 3. Generate AI feedback
    // For now, these will be handled by the /analyze endpoint
    // Note: Analysis is skipped for non-completed attempts

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      recordingUrl: attempt.recording_url,
      status: finalStatus,
      message: finalStatus === 'cancelled' && duration < 15
        ? 'Call was too short and has been automatically cancelled'
        : undefined,
    })
  } catch (error) {
    console.error('Error ending call:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
