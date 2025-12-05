import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { downloadAndStoreRecording } from '@/lib/supabase/recordings'
import { z } from 'zod'

// Vapi webhook payload schema
const vapiWebhookSchema = z.object({
  message: z.object({
    type: z.enum([
      'end-of-call-report',
      'status-update',
      'speech-update',
      'transcript',
      'function-call',
      'hang',
      'metadata',
    ]),
    call: z.object({
      id: z.string(),
      orgId: z.string().optional(),
      createdAt: z.string(),
      updatedAt: z.string(),
      type: z.enum(['inboundPhoneCall', 'outboundPhoneCall', 'webCall']),
      status: z.string(),
      endedReason: z.string().optional(),
    }),
    artifact: z
      .object({
        recording: z
          .object({
            mono: z
              .object({
                combinedUrl: z.string().url().optional(),
                assistantUrl: z.string().url().optional(),
                customerUrl: z.string().url().optional(),
              })
              .optional(),
            stereoUrl: z.string().url().optional(),
            videoUrl: z.string().url().optional(),
          })
          .optional(),
        transcript: z.string().optional(),
        messages: z
          .array(
            z.object({
              role: z.enum(['assistant', 'user', 'system', 'tool', 'function']),
              message: z.string(),
              time: z.number().optional(),
              endTime: z.number().optional(),
              secondsFromStart: z.number().optional(),
            })
          )
          .optional(),
      })
      .optional(),
  }),
})

type VapiWebhook = z.infer<typeof vapiWebhookSchema>

// Convert Vapi messages to our transcript format
function transformTranscript(messages?: Array<{
  role: 'assistant' | 'user' | 'system' | 'tool' | 'function';
  message: string;
  time?: number;
  endTime?: number;
  secondsFromStart?: number;
}>) {
  if (!messages) return []

  return messages
    .filter((msg) => msg.role === 'assistant' || msg.role === 'user')
    .map((msg, index) => ({
      id: `${msg.secondsFromStart || index}-${msg.role}`,
      role: msg.role as 'user' | 'assistant',
      text: msg.message,
      timestamp: (msg.secondsFromStart || 0) * 1000, // Convert to ms
      isFinal: true,
    }))
}

export async function POST(req: NextRequest) {
  try {
    // Parse payload
    const body = await req.json()
    const payload = vapiWebhookSchema.parse(body)
    const { message } = payload

    // Only process end-of-call-report
    if (message.type !== 'end-of-call-report') {
      console.log(`Ignoring Vapi webhook type: ${message.type}`)
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Use admin client for webhook - no user session available
    // We'll validate the webhook signature in production (TODO)
    const supabase = await createAdminClient()

    const { data: attempt, error: findError } = await supabase
      .from('scenario_attempts')
      .select('id, org_id, clerk_user_id, scenario_id, started_at')
      .eq('vapi_call_id', message.call.id)
      .single()

    if (findError || !attempt) {
      console.error('Attempt not found for Vapi call:', message.call.id)
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      )
    }

    // Download and upload recording if available
    let recordingPath: string | null = null
    const recordingUrl =
      message.artifact?.recording?.stereoUrl ||
      message.artifact?.recording?.mono?.combinedUrl

    if (recordingUrl) {
      try {
        console.log('Downloading recording from Vapi:', recordingUrl)
        const result = await downloadAndStoreRecording({
          vapiUrl: recordingUrl,
          attemptId: attempt.id,
          orgId: attempt.org_id,
        })
        recordingPath = result.storagePath
        console.log('Recording uploaded successfully:', recordingPath)
      } catch (error) {
        console.error('Failed to process recording:', error)
        // Continue processing even if recording fails
      }
    }

    // Transform transcript
    const transcript = transformTranscript(message.artifact?.messages)
    const transcriptText = message.artifact?.transcript || ''

    // Calculate duration
    const endedAt = new Date()
    const startedAt = new Date(attempt.started_at)
    const durationSeconds = Math.floor(
      (endedAt.getTime() - startedAt.getTime()) / 1000
    )

    // Update attempt with final data
    const { error: updateError } = await supabase
      .from('scenario_attempts')
      .update({
        ended_at: endedAt.toISOString(),
        duration_seconds: durationSeconds,
        recording_url: recordingPath, // Store the permanent storage path
        transcript_text: transcriptText,
        transcript_json: transcript,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', attempt.id)
      .eq('org_id', attempt.org_id)

    if (updateError) {
      console.error('Failed to update attempt:', updateError)
      return NextResponse.json(
        { error: 'Failed to update attempt' },
        { status: 500 }
      )
    }

    // Trigger scoring in background (async, don't await)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/attempts/${attempt.id}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch((err) => {
      console.error('Failed to trigger scoring:', err)
      // Don't fail the webhook if scoring fails
    })

    console.log('Vapi webhook processed successfully:', attempt.id)
    return NextResponse.json(
      { received: true, attemptId: attempt.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing Vapi webhook:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid webhook payload', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
