import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'
import { generateCoachingBrief } from '@/lib/agents/manager/coaching-brief'

const querySchema = z.object({
  traineeId: z.string().min(1),
})

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Require manager or admin role
    if (!user.role || !['manager', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = req.nextUrl
    const parsed = querySchema.safeParse({
      traineeId: searchParams.get('traineeId'),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 },
      )
    }

    const brief = await generateCoachingBrief(
      user.orgId,
      user.id,
      parsed.data.traineeId,
    )

    return NextResponse.json(brief)
  } catch (error) {
    console.error('Error in GET /api/coach/briefing/manager:', error)

    if (error instanceof Error && error.message.startsWith('Failed to fetch trainee')) {
      return NextResponse.json({ error: 'Trainee not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
