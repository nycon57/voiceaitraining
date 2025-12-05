/**
 * API Route: Get Recording Playback URL
 *
 * GET /api/recordings/[attemptId]/playback
 *
 * Returns a short-lived signed URL for playing back a recording.
 * Enforces org-level access control via RLS.
 *
 * Usage:
 * ```typescript
 * const response = await fetch(`/api/recordings/${attemptId}/playback`)
 * const { url } = await response.json()
 * // Use url in <audio> element
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRecordingPlaybackUrl } from '@/lib/supabase/recordings'
import { withOrgGuard } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params

    // Get TTL from query params (default 1 hour)
    const searchParams = request.nextUrl.searchParams
    const ttlSeconds = parseInt(searchParams.get('ttl') || '3600', 10)

    const result = await withOrgGuard(async (user, orgId, supabase) => {
      // Verify the attempt belongs to this org
      const { data: attempt, error } = await supabase
        .from('scenario_attempts')
        .select('id, org_id, recording_path')
        .eq('id', attemptId)
        .single()

      if (error || !attempt) {
        throw new Error('Recording not found')
      }

      if (attempt.org_id !== orgId) {
        throw new Error('Access denied')
      }

      if (!attempt.recording_path) {
        throw new Error('Recording not available')
      }

      // Extract extension from recording_path
      const extension = attempt.recording_path.split('.').pop() || 'mp3'

      // Generate signed URL
      const url = await getRecordingPlaybackUrl({
        attemptId,
        orgId,
        extension,
        ttlSeconds
      })

      return { url, expiresIn: ttlSeconds }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[GET /api/recordings/playback] Error:', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Recording not found' },
          { status: 404 }
        )
      }
      if (error.message.includes('Access denied')) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate playback URL' },
      { status: 500 }
    )
  }
}
