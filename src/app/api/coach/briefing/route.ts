import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'
import { generatePreCallBriefing } from '@/lib/agents/coach/pre-call-briefing'

const querySchema = z.object({
  scenarioId: z.string().uuid(),
})

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const parsed = querySchema.safeParse({
      scenarioId: searchParams.get('scenarioId'),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 },
      )
    }

    const briefing = await generatePreCallBriefing(
      user.orgId,
      user.id,
      parsed.data.scenarioId,
    )

    return NextResponse.json(briefing)
  } catch (error) {
    console.error('Error in GET /api/coach/briefing:', error)

    if (error instanceof Error && error.message.startsWith('Scenario not found')) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
