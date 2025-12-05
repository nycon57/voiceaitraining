import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { AttemptStatus } from '@/types/attempt'

const updateStatusSchema = z.object({
  status: z.enum(['completed', 'cancelled', 'practice', 'technical_issue']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { attemptId } = await params
    const body = await req.json()
    const { status } = updateStatusSchema.parse(body)

    const supabase = await createAdminClient()

    // First, get the attempt to validate ownership and check timing
    const { data: attempt, error: fetchError } = await supabase
      .from('scenario_attempts')
      .select('id, org_id, clerk_user_id, created_at, attempt_status, score')
      .eq('id', attemptId)
      .eq('org_id', user.orgId)
      .eq('clerk_user_id', user.id)
      .single()

    if (fetchError || !attempt) {
      return NextResponse.json(
        { error: 'Attempt not found or access denied' },
        { status: 404 }
      )
    }

    // Validate that attempt was created within last 5 minutes
    const createdAt = new Date(attempt.created_at)
    const now = new Date()
    const minutesElapsed = (now.getTime() - createdAt.getTime()) / 1000 / 60

    if (minutesElapsed > 5) {
      return NextResponse.json(
        {
          error: 'Cannot update status after 5 minutes',
          minutesElapsed: Math.round(minutesElapsed)
        },
        { status: 403 }
      )
    }

    // Cannot change status of already-analyzed attempts (those with scores)
    if (attempt.score !== null && attempt.score !== undefined) {
      return NextResponse.json(
        { error: 'Cannot change status of analyzed attempts' },
        { status: 403 }
      )
    }

    // Update the status
    const { data: updatedAttempt, error: updateError } = await supabase
      .from('scenario_attempts')
      .update({
        attempt_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', attemptId)
      .eq('org_id', user.orgId)
      .eq('clerk_user_id', user.id)
      .select()
      .single()

    if (updateError || !updatedAttempt) {
      console.error('Error updating attempt status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update attempt status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      attempt: updatedAttempt,
    })
  } catch (error) {
    console.error('Error in PATCH /api/attempts/[attemptId]/status:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
