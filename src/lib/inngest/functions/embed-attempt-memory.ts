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

/**
 * After an attempt is scored, embed significant transcript moments
 * into the vector store for semantic memory retrieval by agents.
 */
export const embedAttemptMemory = inngest.createFunction(
  { id: 'embed-attempt-memory', name: 'Embed Attempt Memory' },
  { event: EVENT_NAMES.ATTEMPT_SCORED },
  async ({ event, step }) => {
    const { attemptId, userId, orgId } = event.data

    // Step 1: Fetch attempt with transcript and feedback
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

    // Skip gracefully if no transcript
    if (!attempt.transcript_json || attempt.transcript_json.length === 0) {
      console.log(`[embed-attempt-memory] Skipping attempt ${attemptId}: no transcript_json`)
      return { embedded: 0, skipped: true }
    }

    // Step 2: Extract significant segments
    const segments = await step.run('extract-segments', () => {
      return extractSignificantSegments(attempt.transcript_json!)
    })

    // Build the embedding queue: transcript segments + optional coaching insight
    const queue: { contentType: ContentType; content: string; metadata: Record<string, unknown> }[] =
      segments.map((seg) => ({
        contentType: 'transcript_segment' as ContentType,
        content: seg.content,
        metadata: { ...seg.metadata, segmentType: seg.type },
      }))

    // If feedback text exists, add a coaching insight embedding
    if (attempt.feedback_text) {
      queue.push({
        contentType: 'coaching_insight',
        content: attempt.feedback_text,
        metadata: { source: 'post_scoring_feedback' },
      })
    }

    // Enforce cost-control limit
    const toEmbed = queue.slice(0, MAX_EMBEDDINGS)

    // Step 3: Embed each item with retryability
    let embeddedCount = 0
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
      embeddedCount++
    }

    return { embedded: embeddedCount, segments: segments.length }
  },
)

/** Count words in a string. */
function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/** Count filler word occurrences. */
function fillerCount(text: string): number {
  return (text.match(FILLER_PATTERN) || []).length
}

/**
 * Extract significant transcript segments using heuristics:
 * - Fumbles: short trainee responses heavy with filler words
 * - Unanswered questions: agent questions followed by inadequate trainee responses
 * - Strong responses: substantive, confident trainee answers
 */
function extractSignificantSegments(segments: TranscriptSegment[]): SignificantSegment[] {
  const found: SignificantSegment[] = []

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const nextSeg = i + 1 < segments.length ? segments[i + 1] : undefined

    // Detect unanswered questions: agent asks a question, trainee response is weak
    if (seg.speaker === 'agent' && seg.text.includes('?')) {
      if (!nextSeg || nextSeg.speaker !== 'trainee') {
        found.push({
          type: 'unanswered_question',
          content: `Agent asked: "${seg.text}" — No trainee response followed.`,
          metadata: { startTimeMs: seg.start_time_ms },
        })
      } else if (wordCount(nextSeg.text) < SHORT_RESPONSE_WORDS) {
        found.push({
          type: 'unanswered_question',
          content: `Agent asked: "${seg.text}" — Trainee responded inadequately: "${nextSeg.text}"`,
          metadata: { startTimeMs: seg.start_time_ms },
        })
      }
      continue
    }

    // Trainee-specific analysis
    if (seg.speaker !== 'trainee') continue

    const words = wordCount(seg.text)
    const fillers = fillerCount(seg.text)

    // Fumble: short response with high filler ratio
    if (words < SHORT_RESPONSE_WORDS && fillers >= 2) {
      found.push({
        type: 'fumble',
        content: `Trainee fumbled: "${seg.text}"`,
        metadata: { startTimeMs: seg.start_time_ms, fillerCount: fillers },
      })
      continue
    }

    // Strong response: substantive and low filler ratio
    if (words >= STRONG_RESPONSE_WORDS && fillers / words < 0.1) {
      found.push({
        type: 'strong_response',
        content: `Strong trainee response: "${seg.text}"`,
        metadata: { startTimeMs: seg.start_time_ms, wordCount: words },
      })
    }
  }

  return found
}
