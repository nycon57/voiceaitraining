import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAlertColors } from "@/lib/utils/dashboard-utils"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info, AlertTriangle, type LucideIcon } from "lucide-react"

export interface AlertItem {
  id: string | number
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  icon?: LucideIcon
}

export interface AlertCardProps {
  title: string
  description?: string
  alerts: AlertItem[]
  className?: string
  maxAlerts?: number
  emptyMessage?: string
  icon?: LucideIcon
}

const defaultIcons: Record<AlertItem['type'], LucideIcon> = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle
}

export function AlertCard({
  title,
  description,
  alerts,
  className,
  maxAlerts = 5,
  emptyMessage = "No alerts at this time",
  icon: TitleIcon
}: AlertCardProps) {
  const displayedAlerts = alerts.slice(0, maxAlerts)

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-headline">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm mt-1">
              {description}
            </CardDescription>
          )}
        </div>
        {TitleIcon && <TitleIcon className="h-5 w-5 text-warning" />}
      </CardHeader>
      <CardContent>
        {displayedAlerts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-4">
            {displayedAlerts.map((alert) => {
              const Icon = alert.icon || defaultIcons[alert.type]

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 border rounded-lg",
                    getAlertColors(alert.type)
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{alert.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {alert.description}
                  </p>
                  {alert.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={alert.action.onClick}
                      asChild={!!alert.action.href}
                    >
                      {alert.action.href ? (
                        <a href={alert.action.href}>{alert.action.label}</a>
                      ) : (
                        <span>{alert.action.label}</span>
                      )}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Single alert banner without card wrapper
 */
export function AlertBanner({
  alert,
  className
}: {
  alert: AlertItem
  className?: string
}) {
  const Icon = alert.icon || defaultIcons[alert.type]

  return (
    <div
      className={cn(
        "p-4 border rounded-lg",
        getAlertColors(alert.type),
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium mb-1">{alert.title}</h4>
          <p className="text-xs text-muted-foreground">{alert.description}</p>
          {alert.action && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={alert.action.onClick}
              asChild={!!alert.action.href}
            >
              {alert.action.href ? (
                <a href={alert.action.href}>{alert.action.label}</a>
              ) : (
                <span>{alert.action.label}</span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}