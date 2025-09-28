'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CreditCard, Calendar, ArrowRight, ExternalLink, AlertTriangle } from 'lucide-react'
import { createBillingPortal } from '@/actions/billing'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'
import { useState } from 'react'

interface BillingOverviewProps {
  subscription: any
  org: any
  orgId: string
}

export function BillingOverview({ subscription, org, orgId }: BillingOverviewProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleManageBilling = async () => {
    setIsLoading(true)
    try {
      await createBillingPortal(orgId)
    } catch (error) {
      console.error('Failed to open billing portal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntilRenewal = (endDate: Date) => {
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (!subscription) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-headline font-semibold mb-2">No Active Subscription</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose a plan to get started with advanced features
              </p>
              <Button asChild>
                <a href={`/org/${orgId}/billing?tab=plans`}>
                  <div className="flex items-center gap-2">
                    Choose Plan
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Free Tier</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Limited to basic features. Upgrade to unlock the full potential of voice training.
              </div>
              <div className="pt-2">
                <div className="text-xs text-muted-foreground mb-2">Features included:</div>
                <ul className="text-sm space-y-1">
                  <li>• Up to 3 scenarios</li>
                  <li>• 10 training sessions/month</li>
                  <li>• Basic analytics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPlan = subscription.plan ? SUBSCRIPTION_PLANS[subscription.plan] : null
  const daysUntilRenewal = getDaysUntilRenewal(subscription.current_period_end)
  const renewalProgress = ((30 - daysUntilRenewal) / 30) * 100

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Current Plan</span>
            <Badge className={
              subscription.status === 'active'
                ? 'bg-green-100 text-green-800'
                : subscription.status === 'trialing'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-red-100 text-red-800'
            }>
              {currentPlan?.name || 'Unknown Plan'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="text-sm font-medium capitalize">
              {subscription.status.replace('_', ' ')}
            </span>
          </div>

          {subscription.cancel_at_period_end && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800">Subscription Ending</div>
                <div className="text-yellow-700">
                  Your subscription will end on {formatDate(subscription.current_period_end)}
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={handleManageBilling}
              disabled={isLoading}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {isLoading ? 'Opening...' : 'Manage Billing'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Billing Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current period</span>
              <span>{daysUntilRenewal} days remaining</span>
            </div>
            <Progress value={renewalProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Period start</div>
              <div className="font-medium">
                {formatDate(subscription.current_period_start)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Next billing</div>
              <div className="font-medium">
                {formatDate(subscription.current_period_end)}
              </div>
            </div>
          </div>

          {currentPlan && (
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Monthly cost</span>
                <span className="font-semibold">
                  ${currentPlan.price}/month
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Features */}
      {currentPlan && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
            <CardDescription>
              What's included in your {currentPlan.name} plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}