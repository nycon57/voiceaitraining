import { EVENT_NAMES } from '@/lib/events/types'
import { inngest } from '@/lib/inngest/client'
import { storeEmbedding, type ContentType } from '@/lib/memory/embeddings'
import { createServiceClient } from '@/lib/memory/supabase'
import type { TranscriptSegment } from '@/types/attempt'

const MAX_EMBEDDINGS = 10
const SHORT_RESPONSE_WORDS = 8
const STRONG_RESPONSE_WORDS = 25
const FILLER_PATTERN = /\b(um+|uh+|hmm+|well|like|you know|i mean|basically|so+)\b/gi

interface SignificantSegment {
  type: 'fumble' | 'unanswered_question' | 'strong_response'
  content: string
  metadata: Record<string, unknown>
}

interface EmbedItem {
  contentType: ContentType
  content: string
  metadata: Record<string, unknown>
}

/**
 * After an attempt is scored, embed significant transcript moments
 * into the vector store for semantic memory retrieval by agents.
 */
export const embedAttemptMemory = inngest.createFunction(
  { id: 'embed-attempt-memory', name: 'Embed Attempt Memory' },
  { event: EVENT_NAMES.ATTEMPT_SCORED },
  async ({ event, step }) => {
    const { attemptId, userId, orgId } = event.data

    const alreadyEmbedded = await step.run('check-existing', async () => {
      const { data } = await createServiceClient()
        .from('memory_embeddings')
        .select('id')
        .eq('source_id', attemptId)
        .eq('org_id', orgId)
        .limit(1)

      return data !== null && data.length > 0
    })

    if (alreadyEmbedded) {
      return { embedded: 0, skipped: true, reason: 'already_embedded' }
    }

    const attempt = await step.run('fetch-attempt', async () => {
      const { data, error } = await createServiceClient()
        .from('scenario_attempts')
        .select('transcript_json, feedback_text')
        .eq('id', attemptId)
        .single()

      if (error) {
        throw new Error(`Failed to fetch attempt ${attemptId}: ${error.message}`)
      }

      return data as {
        transcript_json: TranscriptSegment[] | null
        feedback_text: string | null
      }
    })

    if (!attempt.transcript_json || attempt.transcript_json.length === 0) {
      return { embedded: 0, skipped: true, reason: 'no_transcript' }
    }

    const segments = await step.run('extract-segments', () => {
      return extractSignificantSegments(attempt.transcript_json!)
    })

    const items: EmbedItem[] = segments.map((seg) => ({
      contentType: 'transcript_segment',
      content: seg.content,
      metadata: { ...seg.metadata, segmentType: seg.type },
    }))

    if (attempt.feedback_text) {
      items.push({
        contentType: 'coaching_insight',
        content: attempt.feedback_text,
        metadata: { source: 'post_scoring_feedback' },
      })
    }

    const toEmbed = items.slice(0, MAX_EMBEDDINGS)

    for (let i = 0; i < toEmbed.length; i++) {
      const item = toEmbed[i]
      await step.run(`embed-${i}`, async () => {
        await storeEmbedding({
          orgId,
          userId,
          contentType: item.contentType,
          content: item.content,
          sourceId: attemptId,
          metadata: item.metadata,
        })
      })
    }

    return { embedded: toEmbed.length, segments: segments.length }
  },
)

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function fillerCount(text: string): number {
  return (text.match(FILLER_PATTERN) ?? []).length
}

function extractSignificantSegments(segments: TranscriptSegment[]): SignificantSegment[] {
  const results: SignificantSegment[] = []
  const consumed = new Set<number>()

  for (let i = 0; i < segments.length; i++) {
    if (consumed.has(i)) continue

    const seg = segments[i]
    const next = segments[i + 1] as TranscriptSegment | undefined

    if (seg.speaker === 'agent' && seg.text.includes('?')) {
      if (!next || next.speaker !== 'trainee') {
        results.push({
          type: 'unanswered_question',
          content: `Agent asked: "${seg.text}" — No trainee response followed.`,
          metadata: { startTimeMs: seg.start_time_ms },
        })
      } else if (wordCount(next.text) < SHORT_RESPONSE_WORDS) {
        results.push({
          type: 'unanswered_question',
          content: `Agent asked: "${seg.text}" — Trainee responded inadequately: "${next.text}"`,
          metadata: { startTimeMs: seg.start_time_ms },
        })
        consumed.add(i + 1)
      }
      continue
    }

    if (seg.speaker !== 'trainee') continue

    const words = wordCount(seg.text)
    const fillers = fillerCount(seg.text)

    if (words < SHORT_RESPONSE_WORDS && fillers >= 2) {
      results.push({
        type: 'fumble',
        content: `Trainee fumbled: "${seg.text}"`,
        metadata: { startTimeMs: seg.start_time_ms, fillerCount: fillers },
      })
      continue
    }

    if (words >= STRONG_RESPONSE_WORDS && fillers / words < 0.1) {
      results.push({
        type: 'strong_response',
        content: `Strong trainee response: "${seg.text}"`,
        metadata: { startTimeMs: seg.start_time_ms, wordCount: words },
      })
    }
  }

  return results
}
