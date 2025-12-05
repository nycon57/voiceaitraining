import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateVapiIdSchema = z.object({
  attemptId: z.string().uuid(),
  vapiCallId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { attemptId, vapiCallId } = updateVapiIdSchema.parse(body)

    // Use admin client to bypass RLS - we're already checking auth via getCurrentUser()
    const supabase = await createAdminClient()

    // Update attempt with Vapi call ID
    const { error: updateError } = await supabase
      .from('scenario_attempts')
      .update({
        vapi_call_id: vapiCallId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', attemptId)
      .eq('org_id', user.orgId)
      .eq('clerk_user_id', user.id) // Ensure user owns this attempt

    if (updateError) {
      console.error('Failed to update Vapi call ID:', updateError)
      return NextResponse.json(
        { error: 'Failed to update attempt' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating Vapi call ID:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
