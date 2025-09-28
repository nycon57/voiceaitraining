'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap, Crown } from 'lucide-react'
import { createSubscriptionCheckout } from '@/actions/billing'
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/stripe'

interface PlanSelectorProps {
  currentPlan: SubscriptionPlan | null
  plans: typeof SUBSCRIPTION_PLANS
  orgId: string
}

export function PlanSelector({ currentPlan, plans, orgId }: PlanSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectPlan = async (planId: SubscriptionPlan) => {
    setLoading(planId)
    try {
      await createSubscriptionCheckout(planId, orgId)
    } catch (error) {
      console.error('Failed to create checkout:', error)
    } finally {
      setLoading(null)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'STARTER':
        return <Star className="h-5 w-5" />
      case 'PROFESSIONAL':
        return <Zap className="h-5 w-5" />
      case 'ENTERPRISE':
        return <Crown className="h-5 w-5" />
      default:
        return <Star className="h-5 w-5" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'STARTER':
        return 'border-blue-200 bg-blue-50'
      case 'PROFESSIONAL':
        return 'border-purple-200 bg-purple-50'
      case 'ENTERPRISE':
        return 'border-gold-200 bg-gradient-to-br from-yellow-50 to-orange-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Unlimited' : limit.toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-headline text-2xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Select the plan that best fits your organization's training needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(plans).map(([planKey, plan]) => {
          const planId = planKey as SubscriptionPlan
          const isCurrentPlan = currentPlan === planId
          const isPopular = planId === 'PROFESSIONAL'

          return (
            <Card
              key={planId}
              className={`relative transition-all duration-200 hover:shadow-lg ${
                isCurrentPlan ? 'ring-2 ring-blue-500' : ''
              } ${isPopular ? 'scale-105 border-purple-300' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className={`text-center ${getPlanColor(planId)}`}>
                <div className="flex items-center justify-center mb-2">
                  {getPlanIcon(planId)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{plan.interval}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limits */}
                <div className="pt-4 border-t space-y-2">
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Usage Limits
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Users:</span>
                      <span className="ml-1 font-medium">
                        {formatLimit(plan.limits.users)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sessions:</span>
                      <span className="ml-1 font-medium">
                        {formatLimit(plan.limits.sessions_per_month)}/mo
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Scenarios:</span>
                      <span className="ml-1 font-medium">
                        {formatLimit(plan.limits.scenarios)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Storage:</span>
                      <span className="ml-1 font-medium">
                        {plan.limits.storage_gb}GB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSelectPlan(planId)}
                      disabled={loading === planId}
                      className={`w-full ${
                        isPopular
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : ''
                      }`}
                    >
                      {loading === planId ? 'Processing...' : 'Select Plan'}
                    </Button>
                  )}
                </div>

                {currentPlan && !isCurrentPlan && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      {planId === 'STARTER'
                        ? 'Downgrade to this plan'
                        : 'Upgrade to this plan'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Plan Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-headline font-medium mb-2">💳 Billing</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• All plans billed monthly</li>
                <li>• Cancel anytime</li>
                <li>• Proration on upgrades/downgrades</li>
                <li>• 14-day free trial on new subscriptions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-medium mb-2">🔄 Changes</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Instant plan upgrades</li>
                <li>• Downgrades at next billing cycle</li>
                <li>• Usage limits apply immediately</li>
                <li>• Data retained during downgrades</li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-medium mb-2">💬 Support</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Email support (all plans)</li>
                <li>• Priority support (Pro+)</li>
                <li>• Dedicated support (Enterprise)</li>
                <li>• Knowledge base access</li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-medium mb-2">🔒 Security</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• SOC 2 Type II compliant</li>
                <li>• End-to-end encryption</li>
                <li>• Regular security audits</li>
                <li>• GDPR & CCPA compliant</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enterprise Contact */}
      <Card className="border-dashed">
        <CardContent className="text-center py-8">
          <Crown className="h-8 w-8 mx-auto mb-4 text-yellow-600" />
          <h3 className="font-headline font-semibold mb-2">Need Something Custom?</h3>
          <p className="text-muted-foreground mb-4">
            For large organizations with specific requirements, we offer custom enterprise solutions.
          </p>
          <Button variant="outline">
            Contact Sales
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}