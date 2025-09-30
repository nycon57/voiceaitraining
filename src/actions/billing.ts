'use server'

import { withOrgGuard, withRoleGuard } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  stripe,
  createStripeCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  getActiveSubscriptionForOrg,
  getCustomerByOrgId,
  SUBSCRIPTION_PLANS,
  SubscriptionPlan
} from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createSubscriptionCheckout(
  planId: SubscriptionPlan,
  orgId: string
) {
  return withRoleGuard(['admin'], async (user, verifiedOrgId) => {
    if (orgId !== verifiedOrgId) {
      throw new Error('Organization ID mismatch')
    }

    const supabase = await createClient()

    // Get organization details
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .select('name, stripe_customer_id')
      .eq('id', orgId)
      .single()

    if (orgError || !org) {
      throw new Error('Organization not found')
    }

    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan) {
      throw new Error('Invalid plan selected')
    }

    let customerId = org.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      const name = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || 'Unknown'

      const customer = await createStripeCustomer(
        email,
        name,
        orgId,
        user.id
      )

      customerId = customer.id

      // Update org with customer ID
      await supabase
        .from('orgs')
        .update({ stripe_customer_id: customerId })
        .eq('id', orgId)
    }

    // Create checkout session
    const session = await createCheckoutSession(
      customerId,
      plan.priceId,
      orgId,
      `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`
    )

    if (!session.url) {
      throw new Error('Failed to create checkout session')
    }

    redirect(session.url)
  })
}

export async function createBillingPortal(orgId: string) {
  return withRoleGuard(['admin'], async (user, verifiedOrgId) => {
    if (orgId !== verifiedOrgId) {
      throw new Error('Organization ID mismatch')
    }

    const customer = await getCustomerByOrgId(orgId)
    if (!customer) {
      throw new Error('No billing customer found. Please subscribe to a plan first.')
    }

    const session = await createBillingPortalSession(
      customer.id,
      `${process.env.NEXT_PUBLIC_APP_URL}/billing`
    )

    redirect(session.url)
  })
}

export async function getBillingInfo(orgId?: string) {
  return withOrgGuard(async (user, verifiedOrgId) => {
    const targetOrgId = orgId || verifiedOrgId

    // Only admins can view billing for their org
    if (user.role !== 'admin' && targetOrgId !== verifiedOrgId) {
      throw new Error('Access denied: insufficient permissions')
    }

    const supabase = await createClient()

    // Get organization
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .select('*')
      .eq('id', targetOrgId)
      .single()

    if (orgError || !org) {
      throw new Error('Organization not found')
    }

    // Get active subscription
    const subscription = await getActiveSubscriptionForOrg(targetOrgId)

    // Get usage data
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const { data: usageData } = await supabase
      .from('scenario_attempts')
      .select('id, started_at')
      .eq('org_id', targetOrgId)
      .gte('started_at', currentMonth.toISOString())

    const { data: userData } = await supabase
      .from('org_members')
      .select('user_id')
      .eq('org_id', targetOrgId)

    const usage = {
      sessions_this_month: usageData?.length || 0,
      total_users: userData?.length || 0,
    }

    // Determine current plan
    let currentPlan: SubscriptionPlan | null = null
    if (subscription && subscription.items.data[0]) {
      const priceId = subscription.items.data[0].price.id
      for (const [planKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
        if (plan.priceId === priceId) {
          currentPlan = planKey as SubscriptionPlan
          break
        }
      }
    }

    return {
      org,
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        // @ts-expect-error - Stripe types may vary by version
        current_period_start: new Date((subscription.current_period_start ?? subscription.currentPeriodStart) * 1000),
        // @ts-expect-error - Stripe types may vary by version
        current_period_end: new Date((subscription.current_period_end ?? subscription.currentPeriodEnd) * 1000),
        cancel_at_period_end: subscription.cancel_at_period_end,
        plan: currentPlan
      } : null,
      usage,
      plans: SUBSCRIPTION_PLANS
    }
  })
}

export async function updateOrgPlan(orgId: string, planId: SubscriptionPlan) {
  return withRoleGuard(['admin'], async (user, verifiedOrgId) => {
    if (orgId !== verifiedOrgId) {
      throw new Error('Organization ID mismatch')
    }

    const supabase = await createClient()

    // Update org plan in database
    const { error } = await supabase
      .from('orgs')
      .update({
        plan: planId,
        updated_at: new Date().toISOString()
      })
      .eq('id', orgId)

    if (error) {
      throw new Error(`Failed to update organization plan: ${error.message}`)
    }

    revalidatePath('/billing', 'page')
    return { success: true }
  })
}

export async function checkUsageLimit(
  orgId: string,
  type: 'sessions' | 'users' | 'scenarios'
): Promise<{
  current: number
  limit: number
  percentage: number
  exceeded: boolean
}> {
  return withOrgGuard(async (user, verifiedOrgId) => {
    const targetOrgId = orgId || verifiedOrgId
    const supabase = await createClient()

    // Get org plan
    const { data: org } = await supabase
      .from('orgs')
      .select('plan')
      .eq('id', targetOrgId)
      .single()

    const planId = (org?.plan as SubscriptionPlan) || 'STARTER'
    const plan = SUBSCRIPTION_PLANS[planId]

    let current = 0
    let limit = 0

    switch (type) {
      case 'sessions':
        // Count sessions this month
        const currentMonth = new Date()
        currentMonth.setDate(1)
        currentMonth.setHours(0, 0, 0, 0)

        const { data: sessions } = await supabase
          .from('scenario_attempts')
          .select('id')
          .eq('org_id', targetOrgId)
          .gte('started_at', currentMonth.toISOString())

        current = sessions?.length || 0
        limit = plan.limits.sessions_per_month
        break

      case 'users':
        const { data: users } = await supabase
          .from('org_members')
          .select('user_id')
          .eq('org_id', targetOrgId)

        current = users?.length || 0
        limit = plan.limits.users
        break

      case 'scenarios':
        const { data: scenarios } = await supabase
          .from('scenarios')
          .select('id')
          .eq('org_id', targetOrgId)

        current = scenarios?.length || 0
        limit = plan.limits.scenarios
        break
    }

    // Handle unlimited plans (limit = -1)
    if (limit === -1) {
      return {
        current,
        limit: -1,
        percentage: 0,
        exceeded: false
      }
    }

    const percentage = limit > 0 ? Math.round((current / limit) * 100) : 0
    const exceeded = current >= limit

    return {
      current,
      limit,
      percentage,
      exceeded
    }
  })
}

export async function getInvoices(orgId: string, limit = 10) {
  return withRoleGuard(['admin'], async (user, verifiedOrgId) => {
    if (orgId !== verifiedOrgId) {
      throw new Error('Organization ID mismatch')
    }

    const customer = await getCustomerByOrgId(orgId)
    if (!customer) {
      return []
    }

    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit,
    })

    return invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      created: new Date(invoice.created * 1000),
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      pdf_url: invoice.invoice_pdf,
      hosted_url: invoice.hosted_invoice_url,
    }))
  })
}