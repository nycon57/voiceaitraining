import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams getting started',
    price: 49,
    interval: 'month' as const,
    features: [
      'Up to 10 users',
      '100 training sessions/month',
      'Basic analytics',
      'Email support',
      '5 custom scenarios'
    ],
    limits: {
      users: 10,
      sessions_per_month: 100,
      scenarios: 5,
      webhooks: 1,
      storage_gb: 5
    },
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || 'price_starter_test'
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing organizations',
    price: 149,
    interval: 'month' as const,
    features: [
      'Up to 50 users',
      '500 training sessions/month',
      'Advanced analytics',
      'Priority support',
      'Unlimited scenarios',
      'Custom branding',
      'Webhook integrations'
    ],
    limits: {
      users: 50,
      sessions_per_month: 500,
      scenarios: -1, // Unlimited
      webhooks: 10,
      storage_gb: 50
    },
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL || 'price_professional_test'
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with advanced needs',
    price: 499,
    interval: 'month' as const,
    features: [
      'Unlimited users',
      'Unlimited training sessions',
      'Full analytics suite',
      'Dedicated support',
      'Unlimited scenarios',
      'Custom branding',
      'Advanced integrations',
      'API access',
      'SSO support'
    ],
    limits: {
      users: -1, // Unlimited
      sessions_per_month: -1, // Unlimited
      scenarios: -1, // Unlimited
      webhooks: -1, // Unlimited
      storage_gb: 500
    },
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || 'price_enterprise_test'
  }
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

export interface StripeCustomer {
  id: string
  email: string
  name: string
  metadata: {
    orgId: string
    userId: string
  }
}

export interface StripeSubscription {
  id: string
  status: Stripe.Subscription.Status
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  items: {
    price: {
      id: string
      recurring: {
        interval: string
      }
      unit_amount: number
    }
  }[]
}

export async function createStripeCustomer(
  email: string,
  name: string,
  orgId: string,
  userId: string
): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      orgId,
      userId
    }
  })
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  orgId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orgId,
    },
    subscription_data: {
      metadata: {
        orgId,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    tax_id_collection: {
      enabled: true,
    },
  })
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price']
    })
  } catch (error) {
    console.error('Failed to retrieve subscription:', error)
    return null
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd = true
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: cancelAtPeriodEnd,
  })
}

export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  })
}

export async function getCustomerByOrgId(orgId: string): Promise<Stripe.Customer | null> {
  try {
    const customers = await stripe.customers.list({
      limit: 1,
      metadata: {
        orgId,
      },
    })

    return customers.data[0] || null
  } catch (error) {
    console.error('Failed to get customer by org ID:', error)
    return null
  }
}

export async function getActiveSubscriptionForOrg(orgId: string): Promise<Stripe.Subscription | null> {
  try {
    const customer = await getCustomerByOrgId(orgId)
    if (!customer) return null

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
      expand: ['data.items.data.price']
    })

    return subscriptions.data[0] || null
  } catch (error) {
    console.error('Failed to get active subscription:', error)
    return null
  }
}

export function getPlanFromPriceId(priceId: string): SubscriptionPlan | null {
  for (const [planKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.priceId === priceId) {
      return planKey as SubscriptionPlan
    }
  }
  return null
}

export function formatPrice(amount: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}

export function isSubscriptionActive(subscription: Stripe.Subscription): boolean {
  return subscription.status === 'active' || subscription.status === 'trialing'
}

export function isSubscriptionCanceled(subscription: Stripe.Subscription): boolean {
  return subscription.status === 'canceled' || subscription.cancel_at_period_end
}

export function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date {
  return new Date(subscription.current_period_end * 1000)
}

export function getSubscriptionPeriodStart(subscription: Stripe.Subscription): Date {
  return new Date(subscription.current_period_start * 1000)
}

// Usage tracking helpers
export async function recordUsage(
  subscriptionItemId: string,
  quantity: number,
  timestamp?: number
): Promise<Stripe.UsageRecord> {
  return await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity,
    timestamp: timestamp || Math.floor(Date.now() / 1000),
    action: 'increment',
  })
}

export async function getUsageRecords(
  subscriptionItemId: string,
  startingAfter?: string
): Promise<Stripe.UsageRecord[]> {
  const records = await stripe.subscriptionItems.listUsageRecordSummaries(
    subscriptionItemId,
    {
      limit: 100,
      starting_after: startingAfter,
    }
  )
  return records.data
}

// Webhook helpers
export function constructEventFromPayload(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

export function isTestMode(): boolean {
  return process.env.STRIPE_SECRET_KEY?.includes('_test_') ?? true
}