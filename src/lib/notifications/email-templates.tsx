import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '580px',
}

const heading: React.CSSProperties = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#1a1a2e',
  padding: '17px 0 0',
}

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#3c4149',
  margin: '16px 0',
}

const ctaButton: React.CSSProperties = {
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const hr: React.CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer: React.CSSProperties = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
}

export const NOTIFICATION_TYPES = [
  'coach_recommendation',
  'daily_digest',
  'practice_reminder',
  'weakness_update',
  'assignment_created',
  'assignment_overdue',
  'critical_score',
  'declining_trend',
  'achievement',
  'weekly_insight',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

interface BaseEmailProps {
  title: string
  body: string
  actionUrl?: string
  recipientName?: string
}

interface TemplateConfig {
  headingText: (name?: string) => string
  ctaLabel: string
}

function NotificationEmailLayout({
  title,
  body,
  actionUrl,
  recipientName,
  headingText,
  ctaLabel,
}: BaseEmailProps & TemplateConfig) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ padding: '0 32px' }}>
            <Heading style={heading}>
              {headingText(recipientName)}
            </Heading>
            <Text style={paragraph}>{body}</Text>
            {actionUrl && (
              <Section style={{ textAlign: 'center', margin: '24px 0' }}>
                <Link href={actionUrl} style={ctaButton}>
                  {ctaLabel}
                </Link>
              </Section>
            )}
            <Hr style={hr} />
            <Text style={footer}>
              VoiceAI Training — Your AI sales coach.
              <br />
              You can manage notification preferences in your account settings.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const TEMPLATE_CONFIG: Record<NotificationType, TemplateConfig> = {
  coach_recommendation: {
    headingText: (name) => (name ? `Hey ${name},` : 'Hey there,'),
    ctaLabel: 'Start practicing',
  },
  daily_digest: {
    headingText: (name) => (name ? `${name}'s daily summary` : 'Your daily summary'),
    ctaLabel: 'View dashboard',
  },
  practice_reminder: {
    headingText: (name) => (name ? `${name}, time to practice` : 'Time to practice'),
    ctaLabel: 'Practice now',
  },
  weakness_update: {
    headingText: (name) => (name ? `${name}, skill update` : 'Skill update'),
    ctaLabel: 'View profile',
  },
  assignment_created: {
    headingText: (name) => (name ? `${name}, new assignment` : 'New assignment'),
    ctaLabel: 'View assignment',
  },
  assignment_overdue: {
    headingText: (name) => (name ? `${name}, assignment overdue` : 'Assignment overdue'),
    ctaLabel: 'Complete assignment',
  },
  critical_score: {
    headingText: (name) => (name ? `${name}, attention needed` : 'Attention needed'),
    ctaLabel: 'View details',
  },
  declining_trend: {
    headingText: (name) => (name ? `${name}, trend alert` : 'Trend alert'),
    ctaLabel: 'View details',
  },
  achievement: {
    headingText: (name) => (name ? `${name}, great news!` : 'Great news!'),
    ctaLabel: 'View details',
  },
  weekly_insight: {
    headingText: (name) => (name ? `${name}, your weekly team report` : 'Your weekly team report'),
    ctaLabel: 'View dashboard',
  },
}

/** Map of notification type to its React Email template component. */
export const emailTemplates: Record<
  NotificationType,
  React.FC<BaseEmailProps>
> = Object.fromEntries(
  Object.entries(TEMPLATE_CONFIG).map(([type, config]) => [
    type,
    (props: BaseEmailProps) => (
      <NotificationEmailLayout {...props} {...config} />
    ),
  ]),
) as Record<NotificationType, React.FC<BaseEmailProps>>
