import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { generateCoachingBrief } from '@/lib/agents/manager/coaching-brief'
import { getCurrentUser } from '@/lib/auth'

const ALLOWED_ROLES = new Set(['manager', 'admin'])

const querySchema = z.object({
  traineeId: z.string().min(1),
})

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user?.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user.role || !ALLOWED_ROLES.has(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const parsed = querySchema.safeParse({
      traineeId: req.nextUrl.searchParams.get('traineeId'),
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
