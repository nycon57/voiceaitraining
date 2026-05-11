'use server'

import { requireAuth, withOrgGuard } from '@/lib/auth'
import { getRecordingPlaybackUrl } from '@/lib/supabase/recordings'

export async function getAttemptRecordingPlayback(attemptId: string, ttlSeconds = 3600) {
  await requireAuth()

  return withOrgGuard(async (_user, orgId, supabase) => {
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

    const extension = attempt.recording_path.split('.').pop() || 'mp3'
    const url = await getRecordingPlaybackUrl({
      attemptId,
      orgId,
      extension,
      ttlSeconds,
    })

    return { url, expiresIn: ttlSeconds }
  })
}
