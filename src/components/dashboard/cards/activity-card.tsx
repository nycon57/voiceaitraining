import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStatusVariant } from "@/lib/utils/dashboard-utils"
import { cn } from "@/lib/utils"

export interface ActivityItem {
  id: string | number
  title: string
  description?: string
  user?: string
  timestamp: string
  status: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface ActivityCardProps {
  title: string
  description?: string
  activities: ActivityItem[]
  className?: string
  maxItems?: number
  emptyMessage?: string
}

export function ActivityCard({
  title,
  description,
  activities,
  className,
  maxItems = 5,
  emptyMessage = "No recent activity"
}: ActivityCardProps) {
  const displayedActivities = activities.slice(0, maxItems)

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex gap-3 flex-1">
                  {activity.icon && (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted flex-shrink-0 mt-0.5">
                      <activity.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm leading-tight mb-1">
                      {activity.title}
                    </h4>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {activity.user && (
                        <>
                          <span>by {activity.user}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusVariant(activity.status)} className="flex-shrink-0 ml-2">
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Compact activity list without card wrapper
 */
export function ActivityList({
  activities,
  maxItems = 5,
  emptyMessage = "No recent activity"
}: Pick<ActivityCardProps, 'activities' | 'maxItems' | 'emptyMessage'>) {
  const displayedActivities = activities.slice(0, maxItems)

  if (displayedActivities.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {displayedActivities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1">
            <h4 className="font-medium text-sm">{activity.title}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              {activity.user && (
                <>
                  <span>by {activity.user}</span>
                  <span>•</span>
                </>
              )}
              <span>{activity.timestamp}</span>
            </div>
          </div>
          <Badge variant={getStatusVariant(activity.status)}>
            {activity.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}