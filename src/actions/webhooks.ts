'use server'

import { withOrgGuard, withRoleGuard } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import crypto from 'crypto'

const createWebhookSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  events: z.array(z.string()).min(1, 'At least one event must be selected'),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  retry_attempts: z.number().min(0).max(10).default(3),
  timeout_seconds: z.number().min(1).max(60).default(30),
})

const updateWebhookSchema = createWebhookSchema.partial()

export const WEBHOOK_EVENTS = [
  'scenario.assigned',
  'scenario.completed',
  'attempt.scored.low', // score < 60
  'attempt.scored.high', // score >= 80
  'track.completed',
  'user.added',
  'user.removed',
  'assignment.overdue',
  'performance.milestone', // custom milestones
] as const

export type WebhookEvent = typeof WEBHOOK_EVENTS[number]

export async function createWebhook(data: z.infer<typeof createWebhookSchema>) {
  const validatedData = createWebhookSchema.parse(data)

  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString('hex')

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        ...validatedData,
        org_id: orgId,
        secret,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create webhook: ${error.message}`)
    }

    revalidatePath('/settings/webhooks', 'page')
    return webhook
  })
}

export async function updateWebhook(
  webhookId: string,
  data: z.infer<typeof updateWebhookSchema>
) {
  const validatedData = updateWebhookSchema.parse(data)

  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', webhookId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update webhook: ${error.message}`)
    }

    revalidatePath('/settings/webhooks', 'page')
    return webhook
  })
}

export async function deleteWebhook(webhookId: string) {
  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId)
      .eq('org_id', orgId)

    if (error) {
      throw new Error(`Failed to delete webhook: ${error.message}`)
    }

    revalidatePath('/settings/webhooks', 'page')
    return { success: true }
  })
}

export async function getWebhooks() {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    // Check if user has access to webhooks
    if (!['admin', 'manager'].includes(user.role || '')) {
      throw new Error('Access denied: insufficient permissions')
    }

    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select(`
        *,
        created_by_user:users!webhooks_created_by_fkey(name, email)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get webhooks: ${error.message}`)
    }

    return webhooks
  })
}

export async function getWebhook(webhookId: string) {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    // Check if user has access to webhooks
    if (!['admin', 'manager'].includes(user.role || '')) {
      throw new Error('Access denied: insufficient permissions')
    }

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .select(`
        *,
        created_by_user:users!webhooks_created_by_fkey(name, email)
      `)
      .eq('id', webhookId)
      .eq('org_id', orgId)
      .single()

    if (error) {
      throw new Error(`Failed to get webhook: ${error.message}`)
    }

    return webhook
  })
}

export async function getWebhookDeliveries(webhookId: string, limit = 50) {
  return withOrgGuard(async (user, orgId) => {
    const supabase = await createClient()

    // Check if user has access to webhooks
    if (!['admin', 'manager'].includes(user.role || '')) {
      throw new Error('Access denied: insufficient permissions')
    }

    // Verify webhook belongs to org
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('id')
      .eq('id', webhookId)
      .eq('org_id', orgId)
      .single()

    if (webhookError || !webhook) {
      throw new Error('Webhook not found or access denied')
    }

    const { data: deliveries, error } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get webhook deliveries: ${error.message}`)
    }

    return deliveries
  })
}

export async function retryWebhookDelivery(deliveryId: string) {
  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

    // Get delivery with webhook info
    const { data: delivery, error: deliveryError } = await supabase
      .from('webhook_deliveries')
      .select(`
        *,
        webhooks!inner(org_id, url, secret, enabled)
      `)
      .eq('id', deliveryId)
      .single()

    if (deliveryError || !delivery) {
      throw new Error('Delivery not found or access denied')
    }

    // Verify webhook belongs to org
    if (delivery.webhooks.org_id !== orgId) {
      throw new Error('Access denied')
    }

    if (!delivery.webhooks.enabled) {
      throw new Error('Cannot retry delivery for disabled webhook')
    }

    // Trigger retry by calling webhook dispatch function
    await dispatchWebhook(
      delivery.webhooks.url,
      delivery.webhooks.secret,
      delivery.event_type,
      delivery.payload,
      delivery.webhooks_id
    )

    return { success: true }
  })
}

export async function regenerateWebhookSecret(webhookId: string) {
  return withRoleGuard(['admin', 'manager'], async (user, orgId) => {
    const supabase = await createClient()

    // Generate new secret
    const newSecret = crypto.randomBytes(32).toString('hex')

    const { data: webhook, error } = await supabase
      .from('webhooks')
      .update({
        secret: newSecret,
        updated_at: new Date().toISOString(),
      })
      .eq('id', webhookId)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to regenerate webhook secret: ${error.message}`)
    }

    revalidatePath('/settings/webhooks', 'page')
    return webhook
  })
}

// Internal function to dispatch webhooks
export async function dispatchWebhook(
  url: string,
  secret: string,
  eventType: string,
  payload: any,
  webhookId: string
) {
  const supabase = await createClient()

  try {
    // Create delivery record
    const deliveryId = crypto.randomUUID()
    const timestamp = Date.now().toString()
    const body = JSON.stringify(payload)

    // Create HMAC signature
    const signature = crypto
      .createHmac('sha256', secret)
      .update(timestamp + '.' + body)
      .digest('hex')

    const { error: insertError } = await supabase
      .from('webhook_deliveries')
      .insert({
        id: deliveryId,
        webhook_id: webhookId,
        event_type: eventType,
        payload,
        status: 'pending',
        attempt_count: 1,
      })

    if (insertError) {
      console.error('Failed to create delivery record:', insertError)
      return
    }

    // Send webhook
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Timestamp': timestamp,
        'X-Webhook-ID': deliveryId,
        'User-Agent': 'VoiceAI-Training-Webhooks/1.0',
      },
      body,
    })

    const responseBody = await response.text()

    // Update delivery record
    await supabase
      .from('webhook_deliveries')
      .update({
        status: response.ok ? 'success' : 'failed',
        response_status: response.status,
        response_body: responseBody.substring(0, 5000), // Limit response body size
        delivered_at: response.ok ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliveryId)

    return { success: response.ok, status: response.status }
  } catch (error: any) {
    console.error('Webhook dispatch error:', error)

    // Update delivery record with error
    await supabase
      .from('webhook_deliveries')
      .update({
        status: 'failed',
        error_message: error.message,
        updated_at: new Date().toISOString(),
      })
      .eq('webhook_id', webhookId)
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(1)

    return { success: false, error: error.message }
  }
}

// Function to trigger webhooks for specific events
export async function triggerWebhookEvent(
  orgId: string,
  eventType: WebhookEvent,
  payload: any
) {
  const supabase = await createClient()

  try {
    // Get active webhooks for this org and event type
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('id, url, secret, events')
      .eq('org_id', orgId)
      .eq('enabled', true)

    if (error) {
      console.error('Failed to get webhooks:', error)
      return
    }

    // Filter webhooks that are subscribed to this event
    const subscribedWebhooks = webhooks?.filter(webhook =>
      webhook.events.includes(eventType)
    ) || []

    // Dispatch to each subscribed webhook
    const dispatchPromises = subscribedWebhooks.map(webhook =>
      dispatchWebhook(webhook.url, webhook.secret, eventType, payload, webhook.id)
    )

    await Promise.allSettled(dispatchPromises)
  } catch (error) {
    console.error('Failed to trigger webhook event:', error)
  }
}