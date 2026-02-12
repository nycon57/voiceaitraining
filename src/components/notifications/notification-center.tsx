'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  BrainCircuit,
  CalendarClock,
  CheckCheck,
  ClipboardList,
  Lightbulb,
  Loader2,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '@/actions/notifications'

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  coach_recommendation: Lightbulb,
  daily_digest: CalendarClock,
  practice_reminder: BrainCircuit,
  weakness_update: TrendingDown,
  assignment_created: ClipboardList,
  assignment_overdue: CalendarClock,
}

function getNotificationIcon(type: string) {
  return NOTIFICATION_ICONS[type] ?? Bell
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMs / 3_600_000)
  const diffDay = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString()
}

interface NotificationCenterProps {
  onClose: () => void
  onCountChange: (count: number) => void
}

export function NotificationCenter({ onClose, onCountChange }: NotificationCenterProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, startMarkingAll] = useTransition()

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications(30, 0)
      setNotifications(data)
    } catch {
      // Fail silently — empty list shown
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
        )
        onCountChange(
          notifications.filter((n) => !n.read && n.id !== notification.id).length,
        )
      } catch {
        // Continue with navigation even if mark-as-read fails
      }
    }

    if (notification.action_url) {
      onClose()
      router.push(notification.action_url)
    }
  }

  const handleMarkAllAsRead = () => {
    startMarkingAll(async () => {
      try {
        await markAllAsRead()
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        onCountChange(0)
      } catch {
        // Silently fail
      }
    })
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs text-muted-foreground"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 className="mr-1 size-3 animate-spin" />
            ) : (
              <CheckCheck className="mr-1 size-3" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="max-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <Bell className="size-8 opacity-40" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type)
              return (
                <button
                  key={notification.id}
                  onClick={() => handleClick(notification)}
                  className={cn(
                    'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                    !notification.read && 'bg-accent/20',
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          'text-sm leading-tight',
                          !notification.read ? 'font-medium' : 'text-muted-foreground',
                        )}
                      >
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {notification.body}
                    </span>
                    <span className="text-[11px] text-muted-foreground/60">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
