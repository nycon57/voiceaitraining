import { logAgentActivity } from '@/lib/agents/activity-log'
import { EVENT_NAMES, type CoachRecommendationReadyPayload } from '@/lib/events/types'
import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/memory/supabase'
import { sendNotification, type NotificationType } from '@/lib/notifications'

const AGENT_ID = 'coach-agent'

function appUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/+$/, '')
  return `${base}${path}`
}

interface NotificationContent {
  title: string
  body: string
  actionUrl: string
  type: NotificationType
}

/**
 * Map a coach recommendation type to notification content.
 * Returns null if the recommendation type is unknown.
 */
async function mapRecommendationToNotification(
  data: CoachRecommendationReadyPayload,
): Promise<NotificationContent | null> {
  switch (data.recommendationType) {
    case 'next_scenario': {
      const path = await resolveScenarioPath(data.scenarioId)
      return {
        title: 'Your coach recommends...',
        body: data.message,
        actionUrl: appUrl(path),
        type: 'coach_recommendation',
      }
    }

    case 'practice_reminder':
      return {
        title: 'Time to practice!',
        body: data.message,
        actionUrl: appUrl('/training'),
        type: 'practice_reminder',
      }

    case 'review_drill': {
      const path = await resolveScenarioPath(data.scenarioId)
      return {
        title: 'Skill review due',
        body: data.message,
        actionUrl: appUrl(path),
        type: 'coach_recommendation',
      }
    }

    case 'daily_digest':
      return {
        title: 'Your daily progress',
        body: data.message,
        actionUrl: appUrl('/dashboard'),
        type: 'daily_digest',
      }

    default:
      return null
  }
}

/**
 * Resolve a scenario ID to a valid path.
 * Falls back to /training if the scenario does not exist or no ID is provided.
 */
async function resolveScenarioPath(scenarioId: string | undefined): Promise<string> {
  if (!scenarioId) return '/training'

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('scenarios')
    .select('id')
    .eq('id', scenarioId)
    .maybeSingle()

  if (error) {
    console.error(
      `[dispatch-coach-notification] Failed to verify scenario ${scenarioId}:`,
      error.message,
    )
    return '/training'
  }

  if (!data) return '/training'

  return `/training/scenarios/${scenarioId}`
}

/**
 * Dispatches a notification when a coach recommendation is ready.
 *
 * Subscribes to the coach.recommendation.ready event, maps the recommendation
 * type to notification content, and calls the notification dispatcher.
 */
export const dispatchCoachNotification = inngest.createFunction(
  { id: 'dispatch-coach-notification', name: 'Dispatch Coach Notification' },
  { event: EVENT_NAMES.COACH_RECOMMENDATION_READY },
  async ({ event, step }) => {
    const data = event.data

    const content = await step.run('map-recommendation', async () => {
      return mapRecommendationToNotification(data)
    })

    if (!content) {
      console.warn(
        `[dispatch-coach-notification] Unknown recommendation type: ${data.recommendationType}`,
      )
      return { dispatched: false, reason: 'unknown_recommendation_type' }
    }

    const result = await step.run('send-notification', async () => {
      return sendNotification({
        userId: data.userId,
        orgId: data.orgId,
        agentId: AGENT_ID,
        ...content,
      })
    })

    await step.run('log-activity', async () => {
      await logAgentActivity({
        orgId: data.orgId,
        userId: data.userId,
        agentId: AGENT_ID,
        eventType: EVENT_NAMES.COACH_RECOMMENDATION_READY,
        action: 'dispatch_notification',
        details: {
          recommendationType: data.recommendationType,
          notificationId: result.notificationId,
          emailSent: result.emailSent,
          actionUrl: content.actionUrl,
        },
      })
    })

    return {
      dispatched: true,
      notificationId: result.notificationId,
      emailSent: result.emailSent,
    }
  },
)
