'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Users, Play, Target, AlertTriangle, TrendingUp } from 'lucide-react'
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/stripe'

interface UsageMetricsProps {
  usage: {
    sessions_this_month: number
    total_users: number
  }
  plan: SubscriptionPlan
  plans: typeof SUBSCRIPTION_PLANS
}

export function UsageMetrics({ usage, plan, plans }: UsageMetricsProps) {
  const currentPlan = plans[plan]

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const calculateUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const usageMetrics = [
    {
      title: 'Training Sessions',
      description: 'Sessions completed this month',
      current: usage.sessions_this_month,
      limit: currentPlan.limits.sessions_per_month,
      icon: Play,
      formatValue: (value: number) => value.toLocaleString()
    },
    {
      title: 'Active Users',
      description: 'Total users in organization',
      current: usage.total_users,
      limit: currentPlan.limits.users,
      icon: Users,
      formatValue: (value: number) => value.toLocaleString()
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Usage Overview</h2>
        <p className="text-muted-foreground">
          Monitor your current usage against your {currentPlan.name} plan limits
        </p>
      </div>

      {/* Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {usageMetrics.map((metric) => {
          const percentage = calculateUsagePercentage(metric.current, metric.limit)
          const isUnlimited = metric.limit === -1
          const isNearLimit = percentage >= 75
          const isOverLimit = percentage >= 100

          const Icon = metric.icon

          return (
            <Card key={metric.title} className={isOverLimit ? 'border-red-200' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-lg">{metric.title}</CardTitle>
                  </div>
                  {isNearLimit && !isUnlimited && (
                    <Badge variant={isOverLimit ? 'destructive' : 'outline'}>
                      {isOverLimit ? 'Over Limit' : 'Near Limit'}
                    </Badge>
                  )}
                </div>
                <CardDescription>{metric.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metric.formatValue(metric.current)}
                  </span>
                  <span className="text-muted-foreground">
                    {isUnlimited ? 'Unlimited' : `of ${metric.formatValue(metric.limit)}`}
                  </span>
                </div>

                {!isUnlimited && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Usage</span>
                      <span className={getUsageColor(percentage)}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-2"
                      style={{
                        background: percentage >= 90 ? '#fee2e2' : percentage >= 75 ? '#fef3c7' : '#f0fdf4'
                      }}
                    />
                  </div>
                )}

                {isOverLimit && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-red-800">Usage Limit Exceeded</div>
                      <div className="text-red-700">
                        Consider upgrading your plan to avoid service limitations.
                      </div>
                    </div>
                  </div>
                )}

                {isNearLimit && !isOverLimit && !isUnlimited && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-yellow-800">Approaching Limit</div>
                      <div className="text-yellow-700">
                        You're using {Math.round(percentage)}% of your monthly allocation.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Plan Comparison
          </CardTitle>
          <CardDescription>
            See how your usage compares across different plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  <th className="text-center py-2">Current ({currentPlan.name})</th>
                  {Object.entries(plans)
                    .filter(([key]) => key !== plan)
                    .map(([key, planData]) => (
                      <th key={key} className="text-center py-2">
                        {planData.name}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">Users</td>
                  <td className="text-center py-3">
                    <div className="space-y-1">
                      <div>{currentPlan.limits.users === -1 ? 'Unlimited' : currentPlan.limits.users}</div>
                      <div className="text-xs text-muted-foreground">
                        ({usage.total_users} used)
                      </div>
                    </div>
                  </td>
                  {Object.entries(plans)
                    .filter(([key]) => key !== plan)
                    .map(([key, planData]) => (
                      <td key={key} className="text-center py-3">
                        {planData.limits.users === -1 ? 'Unlimited' : planData.limits.users}
                      </td>
                    ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3">Sessions/Month</td>
                  <td className="text-center py-3">
                    <div className="space-y-1">
                      <div>{currentPlan.limits.sessions_per_month === -1 ? 'Unlimited' : currentPlan.limits.sessions_per_month}</div>
                      <div className="text-xs text-muted-foreground">
                        ({usage.sessions_this_month} used)
                      </div>
                    </div>
                  </td>
                  {Object.entries(plans)
                    .filter(([key]) => key !== plan)
                    .map(([key, planData]) => (
                      <td key={key} className="text-center py-3">
                        {planData.limits.sessions_per_month === -1 ? 'Unlimited' : planData.limits.sessions_per_month}
                      </td>
                    ))}
                </tr>
                <tr>
                  <td className="py-3">Price/Month</td>
                  <td className="text-center py-3 font-medium">
                    ${currentPlan.price}
                  </td>
                  {Object.entries(plans)
                    .filter(([key]) => key !== plan)
                    .map(([key, planData]) => (
                      <td key={key} className="text-center py-3">
                        ${planData.price}
                      </td>
                    ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}