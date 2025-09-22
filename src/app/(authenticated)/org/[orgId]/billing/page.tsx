import { getCurrentUser } from '@/lib/auth'
import { getBillingInfo, getInvoices } from '@/actions/billing'
import { BillingOverview } from '@/components/billing/billing-overview'
import { PlanSelector } from '@/components/billing/plan-selector'
import { UsageMetrics } from '@/components/billing/usage-metrics'
import { InvoiceHistory } from '@/components/billing/invoice-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, Receipt, BarChart3, Settings, AlertTriangle } from 'lucide-react'
import { redirect } from 'next/navigation'

interface BillingPageProps {
  params: Promise<{ orgId: string }>
  searchParams: Promise<{ success?: string; canceled?: string }>
}

export default async function BillingPage({ params, searchParams }: BillingPageProps) {
  const { orgId } = await params
  const { success, canceled } = await searchParams

  const user = await getCurrentUser()
  if (!user) {
    redirect('/sign-in')
  }

  // Check if user has access to billing
  const hasBillingAccess = user.role === 'admin'
  if (!hasBillingAccess) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground text-center">
              Billing management is limited to organization administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch billing information
  let billingInfo
  let invoices
  try {
    [billingInfo, invoices] = await Promise.all([
      getBillingInfo(orgId),
      getInvoices(orgId)
    ])
  } catch (error) {
    console.error('Failed to load billing data:', error)
    billingInfo = {
      org: { name: 'Unknown', plan: 'STARTER' },
      subscription: null,
      usage: { sessions_this_month: 0, total_users: 0 },
      plans: {}
    }
    invoices = []
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription, usage, and billing information
          </p>
        </div>
        <div className="flex items-center gap-2">
          {billingInfo.subscription && (
            <Badge className={
              billingInfo.subscription.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }>
              {billingInfo.subscription.status === 'active' ? 'Active' : billingInfo.subscription.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Success/Cancel Messages */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="font-medium">Subscription activated successfully!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Your subscription is now active and you have access to all plan features.
            </p>
          </CardContent>
        </Card>
      )}

      {canceled && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Subscription setup was canceled</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              You can try again anytime or contact support if you need assistance.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Usage
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <BillingOverview
            subscription={billingInfo.subscription}
            org={billingInfo.org}
            orgId={orgId}
          />
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <UsageMetrics
            usage={billingInfo.usage}
            plan={billingInfo.subscription?.plan || 'STARTER'}
            plans={billingInfo.plans}
          />
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <PlanSelector
            currentPlan={billingInfo.subscription?.plan || null}
            plans={billingInfo.plans}
            orgId={orgId}
          />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <InvoiceHistory invoices={invoices} />
        </TabsContent>
      </Tabs>
    </div>
  )
}