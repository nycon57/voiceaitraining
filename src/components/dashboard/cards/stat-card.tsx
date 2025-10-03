import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getTrend } from "@/lib/utils/dashboard-utils"
import { cn } from "@/lib/utils"
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"

export interface StatCardProps {
  /**
   * Label/title for the stat
   */
  label: string

  /**
   * Primary value to display
   */
  value: string | number

  /**
   * Optional description or supporting text
   */
  description?: string

  /**
   * Optional icon component
   */
  icon?: LucideIcon

  /**
   * Optional trend data
   */
  trend?: {
    direction: 'up' | 'down'
    value: string
    isPositive?: boolean
  }

  /**
   * Previous value for automatic trend calculation
   */
  previousValue?: number

  /**
   * Optional custom className
   */
  className?: string

  /**
   * Show trend indicator icon
   */
  showTrendIcon?: boolean

  /**
   * Use headline font for title
   */
  headlineTitle?: boolean
}

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  previousValue,
  className,
  showTrendIcon = true,
  headlineTitle = false
}: StatCardProps) {
  // Calculate trend if previousValue is provided and current value is numeric
  const calculatedTrend = previousValue !== undefined && typeof value === 'number'
    ? getTrend(value, previousValue)
    : trend

  return (
    <Card animated={false} className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "text-sm font-medium text-muted-foreground",
            headlineTitle && "font-headline"
          )}>
            {label}
          </CardTitle>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="text-3xl font-headline font-bold">{value}</div>
      </CardHeader>

      {(description || calculatedTrend) && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            {calculatedTrend && showTrendIcon && (
              <div className={cn(
                "flex items-center gap-1",
                calculatedTrend.isPositive !== false
                  ? "text-success"
                  : "text-destructive"
              )}>
                {calculatedTrend.direction === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="text-xs font-medium">
                  {calculatedTrend.value}
                </span>
              </div>
            )}

            {!calculatedTrend && trend && (
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive !== false ? "text-success" : "text-destructive"
              )}>
                {trend.value}
              </span>
            )}

            {description && (
              <>
                {calculatedTrend && <span className="text-xs text-muted-foreground">•</span>}
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

/**
 * StatCard with gradient accent
 */
export function StatCardGradient(props: StatCardProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent rounded-xl pointer-events-none" />
      <StatCard {...props} className={cn("border-0 shadow-lg", props.className)} />
    </div>
  )
}

/**
 * Compact stat card for dense layouts
 */
export function StatCardCompact({
  label,
  value,
  trend,
  icon: Icon,
  className
}: Pick<StatCardProps, 'label' | 'value' | 'trend' | 'icon' | 'className'>) {
  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg border bg-card p-4",
      className
    )}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          trend.isPositive !== false ? "text-success" : "text-destructive"
        )}>
          {trend.direction === 'up' ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  )
}