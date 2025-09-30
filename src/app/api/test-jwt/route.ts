import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId, orgId } = await auth()
  const { getToken } = await auth()

  const clerkToken = await getToken({ template: "supabase" })

  if (!clerkToken) {
    return NextResponse.json({ error: "No JWT token found" }, { status: 401 })
  }

  // Decode JWT (for debugging only - don't do this in production)
  const [, payload] = clerkToken.split('.')
  const decoded = JSON.parse(Buffer.from(payload, 'base64').toString())

  return NextResponse.json({
    clerk_session: {
      userId,
      orgId
    },
    jwt_claims: decoded,
    jwt_has_org_id: !!decoded.org_id,
    match: decoded.org_id === orgId
  })
}