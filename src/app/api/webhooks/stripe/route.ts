import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-08-27.basil',
  })

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get the organization by Stripe customer ID
        const { data: org } = await supabase
          .from('orgs')
          .select('id, metadata')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          // Update organization with subscription info
          const plan = subscription.items.data[0]?.price.lookup_key || 'starter'

          await supabase
            .from('orgs')
            .update({
              plan: plan,
              metadata: {
                ...((org.metadata as Record<string, any>) || {}),
                stripe_subscription_id: subscription.id,
                subscription_status: subscription.status,
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', org.id)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get the organization by Stripe customer ID
        const { data: org } = await supabase
          .from('orgs')
          .select('id, metadata')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          // Downgrade to free plan
          await supabase
            .from('orgs')
            .update({
              plan: 'starter',
              metadata: {
                ...((org.metadata as Record<string, any>) || {}),
                stripe_subscription_id: null,
                subscription_status: 'canceled',
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', org.id)
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Get the organization by Stripe customer ID
        const { data: org } = await supabase
          .from('orgs')
          .select('id, metadata')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          // Mark payment as failed
          await supabase
            .from('orgs')
            .update({
              metadata: {
                ...((org.metadata as Record<string, any>) || {}),
                payment_failed: true,
                payment_failed_at: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', org.id)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Get the organization by Stripe customer ID
        const { data: org } = await supabase
          .from('orgs')
          .select('id, metadata')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          // Clear payment failed status
          await supabase
            .from('orgs')
            .update({
              metadata: {
                ...((org.metadata as Record<string, any>) || {}),
                payment_failed: false,
                payment_failed_at: null,
                last_payment_at: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', org.id)
        }

        break
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error('Error processing Stripe webhook:', error)
    return new Response('Error processing webhook', { status: 500 })
  }
}