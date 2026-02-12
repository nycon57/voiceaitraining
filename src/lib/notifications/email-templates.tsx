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

// Shared styles

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

// Notification types

export const NOTIFICATION_TYPES = [
  'coach_recommendation',
  'daily_digest',
  'practice_reminder',
  'weakness_update',
  'assignment_created',
  'assignment_overdue',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

// Template props

interface BaseEmailProps {
  title: string
  body: string
  actionUrl?: string
  recipientName?: string
}

// Coach recommendation template

function CoachRecommendationEmail({
  title,
  body,
  actionUrl,
  recipientName,
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ padding: '0 32px' }}>
            <Heading style={heading}>
              {recipientName ? `Hey ${recipientName},` : 'Hey there,'}
            </Heading>
            <Text style={paragraph}>{body}</Text>
            {actionUrl && (
              <Section style={{ textAlign: 'center', margin: '24px 0' }}>
                <Link href={actionUrl} style={ctaButton}>
                  Start practicing
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

// Daily digest template

function DailyDigestEmail({
  title,
  body,
  actionUrl,
  recipientName,
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ padding: '0 32px' }}>
            <Heading style={heading}>
              {recipientName
                ? `${recipientName}'s daily summary`
                : 'Your daily summary'}
            </Heading>
            <Text style={paragraph}>{body}</Text>
            {actionUrl && (
              <Section style={{ textAlign: 'center', margin: '24px 0' }}>
                <Link href={actionUrl} style={ctaButton}>
                  View dashboard
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

// Practice reminder template

function PracticeReminderEmail({
  title,
  body,
  actionUrl,
  recipientName,
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ padding: '0 32px' }}>
            <Heading style={heading}>
              {recipientName
                ? `${recipientName}, time to practice`
                : 'Time to practice'}
            </Heading>
            <Text style={paragraph}>{body}</Text>
            {actionUrl && (
              <Section style={{ textAlign: 'center', margin: '24px 0' }}>
                <Link href={actionUrl} style={ctaButton}>
                  Practice now
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

// Weakness update template

function WeaknessUpdateEmail({
  title,
  body,
  actionUrl,
  recipientName,
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ padding: '0 32px' }}>
            <Heading style={heading}>
              {recipientName
                ? `${recipientName}, skill update`
                : 'Skill profile update'}
            </Heading>
            <Text style={paragraph}>{body}</Text>
            {actionUrl && (
              <Section style={{ textAlign: 'center', margin: '24px 0' }}>
                <Link href={actionUrl} style={ctaButton}>
                  View profile
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

// Assignment created template

function AssignmentCreatedEmail({
  title,
  body,
  actionUrl,
  recipientName,
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ padding: '0 32px' }}>
            <Heading style={heading}>
              {recipientName
                ? `${recipientName}, new assignment`
                : 'New assignment'}
            </Heading>
            <Text style={paragraph}>{body}</Text>
            {actionUrl && (
              <Section style={{ textAlign: 'center', margin: '24px 0' }}>
                <Link href={actionUrl} style={ctaButton}>
                  View assignment
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

// Assignment overdue template

function AssignmentOverdueEmail({
  title,
  body,
  actionUrl,
  recipientName,
}: BaseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={{ padding: '0 32px' }}>
            <Heading style={heading}>
              {recipientName
                ? `${recipientName}, overdue assignment`
                : 'Assignment overdue'}
            </Heading>
            <Text style={paragraph}>{body}</Text>
            {actionUrl && (
              <Section style={{ textAlign: 'center', margin: '24px 0' }}>
                <Link href={actionUrl} style={ctaButton}>
                  Complete now
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

/** Map of notification type to its React Email template component. */
export const emailTemplates: Record<
  NotificationType,
  React.FC<BaseEmailProps>
> = {
  coach_recommendation: CoachRecommendationEmail,
  daily_digest: DailyDigestEmail,
  practice_reminder: PracticeReminderEmail,
  weakness_update: WeaknessUpdateEmail,
  assignment_created: AssignmentCreatedEmail,
  assignment_overdue: AssignmentOverdueEmail,
}
