/**
 * Example: Vapi End-of-Call Webhook Handler
 *
 * This demonstrates how to handle the Vapi webhook that fires when a call ends,
 * downloading the recording from Vapi's temporary storage and persisting it to
 * Supabase Storage with proper org-scoped security.
 *
 * Place this in: src/app/api/webhooks/vapi/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { downloadAndStoreRecording } from '@/lib/supabase/recordings'

/**
 * Vapi Webhook Payload (simplified)
 * See: https://docs.vapi.ai/webhooks
 */
interface VapiEndOfCallPayload {
  type: 'end-of-call-report'
  call: {
    id: string
    recordingUrl?: string
    transcript?: {
      messages: Array<{
        role: 'user' | 'assistant'
        message: string
        time: number
      }>
    }
    duration?: number
    cost?: number
  }
  // Custom metadata you passed when starting the call
  metadata?: {
    attemptId: string
    orgId: string
    scenarioId: string
    userId: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Vapi webhook signature (production requirement)
    // const signature = request.headers.get('x-vapi-signature')
    // if (!verifyVapiSignature(signature, await request.text())) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    // 2. Parse webhook payload
    const payload: VapiEndOfCallPayload = await request.json()

    console.log('[Vapi Webhook] End of call:', {
      callId: payload.call.id,
      duration: payload.call.duration,
      hasRecording: !!payload.call.recordingUrl,
      attemptId: payload.metadata?.attemptId
    })

    // 3. Validate metadata
    if (!payload.metadata?.attemptId || !payload.metadata?.orgId) {
      console.error('[Vapi Webhook] Missing required metadata')
      return NextResponse.json(
        { error: 'Missing attemptId or orgId in metadata' },
        { status: 400 }
      )
    }

    const { attemptId, orgId, scenarioId } = payload.metadata

    // 4. Use admin client (webhook is not authenticated user request)
    const supabase = await createAdminClient()

    // 5. Download and store recording from Vapi
    let recordingPath: string | null = null

    if (payload.call.recordingUrl) {
      try {
        console.log('[Vapi Webhook] Downloading recording from Vapi...')

        const result = await downloadAndStoreRecording({
          vapiUrl: payload.call.recordingUrl,
          attemptId,
          orgId
        })

        recordingPath = result.storagePath

        console.log('[Vapi Webhook] Recording stored:', recordingPath)
      } catch (error) {
        console.error('[Vapi Webhook] Failed to download recording:', error)
        // Continue processing even if recording fails
      }
    }

    // 6. Process transcript
    const transcriptText = payload.call.transcript?.messages
      .map(m => `${m.role}: ${m.message}`)
      .join('\n')

    const transcriptJson = payload.call.transcript

    // 7. Update scenario_attempts record
    const { error: updateError } = await supabase
      .from('scenario_attempts')
      .update({
        vapi_call_id: payload.call.id,
        ended_at: new Date().toISOString(),
        duration_seconds: payload.call.duration,
        recording_path: recordingPath,
        recording_url: null, // Clear Vapi URL (expires in 7 days)
        transcript_text: transcriptText,
        transcript_json: transcriptJson,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', attemptId)

    if (updateError) {
      console.error('[Vapi Webhook] Failed to update attempt:', updateError)
      return NextResponse.json(
        { error: 'Failed to update attempt' },
        { status: 500 }
      )
    }

    // 8. Trigger scoring and feedback generation (async)
    // Note: In production, use a queue system like Inngest or BullMQ
    // For now, we can call the scoring function directly
    try {
      await supabase.rpc('score_attempt', { attempt_id: attemptId })
      console.log('[Vapi Webhook] Scoring triggered for attempt:', attemptId)
    } catch (error) {
      console.error('[Vapi Webhook] Scoring failed:', error)
      // Don't fail the webhook if scoring fails
    }

    // 9. Optionally trigger webhook deliveries for org integrations
    try {
      await supabase.rpc('enqueue_webhook', {
        event: 'scenario.completed',
        payload: {
          attemptId,
          scenarioId,
          orgId,
          userId: payload.metadata.userId,
          duration: payload.call.duration,
          recordingPath
        }
      })
    } catch (error) {
      console.error('[Vapi Webhook] Failed to enqueue webhook:', error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Vapi Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Example: Verifying Vapi webhook signatures (production requirement)
 */
function verifyVapiSignature(signature: string | null, body: string): boolean {
  if (!signature) return false

  const secret = process.env.VAPI_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[Vapi Webhook] VAPI_WEBHOOK_SECRET not configured')
    return false
  }

  // Implement HMAC SHA-256 verification
  // const crypto = require('crypto')
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(body)
  //   .digest('hex')
  //
  // return signature === expectedSignature

  return true // Placeholder
}

/**
 * Example: Starting a call and passing metadata
 *
 * Place this in: src/app/api/calls/start/route.ts
 */
export async function startCallExample(
  attemptId: string,
  orgId: string,
  scenarioId: string,
  userId: string
) {
  const response = await fetch('https://api.vapi.ai/call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistant: {
        // ... Vapi assistant configuration
      },
      // Pass metadata that will be returned in webhooks
      metadata: {
        attemptId,
        orgId,
        scenarioId,
        userId
      }
    })
  })

  const call = await response.json()
  return call
}
