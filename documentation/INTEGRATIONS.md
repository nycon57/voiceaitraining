# Integrations Documentation

## Overview

Voice AI Training integrates with multiple external services to provide authentication, payments, voice capabilities, and event notifications. This document details all integration points, API contracts, and troubleshooting guides.

**Last Updated**: September 29, 2025

---

## Authentication: Clerk

### Integration Overview

**Provider**: [Clerk](https://clerk.com)
**Purpose**: User authentication, organization management, session handling
**Plan**: Pro

### Configuration

**Environment Variables**:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

**Clerk Dashboard Settings**:
- **Application Name**: Voice AI Training
- **Sign-in Methods**: Email/Password, Google OAuth, Magic Link
- **MFA**: TOTP enabled (optional for users)
- **Session Duration**: 1 hour with auto-refresh
- **Organizations**: Enabled (multi-tenant mode)

### Custom JWT Claims

Clerk JWT includes custom claims for org_id and role:

```json
{
  "sub": "user_2abc123xyz",
  "email": "john@example.com",
  "org_id": "org_789xyz",
  "role": "admin",
  "iat": 1695984000,
  "exp": 1695987600
}
```

**Configuring Custom Claims**:
1. Go to Clerk Dashboard > JWT Templates
2. Create new template "Supabase"
3. Add custom claims:
```json
{
  "org_id": "{{user.public_metadata.org_id}}",
  "role": "{{user.public_metadata.role}}"
}
```

### Webhook Events

**Endpoint**: `POST /api/webhooks/clerk`

**Events Handled**:
- `user.created` → Create org_member record
- `user.updated` → Sync user metadata
- `user.deleted` → Soft delete or anonymize data
- `organization.created` → Create org record in Supabase
- `organizationMembership.created` → Link user to org
- `organizationMembership.deleted` → Remove user from org

**Signature Verification**:
```typescript
import { Webhook } from 'svix'

const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
const payload = wh.verify(body, headers) as WebhookEvent
```

### Troubleshooting

**Issue**: User org_id not in JWT claims
**Solution**: Ensure public_metadata is set when user signs up

**Issue**: Session expired but UI not redirecting
**Solution**: Check middleware matcher includes the route

---

## Payments: Stripe

### Integration Overview

**Provider**: [Stripe](https://stripe.com)
**Purpose**: Subscription billing, payment processing
**Plan**: Standard (2.9% + $0.30 per transaction)

### Configuration

**Environment Variables**:
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_1abc...
NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL=price_1def...
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_1ghi...
```

**Products**:
| Product | Price ID | Amount | Billing |
|---------|----------|--------|---------|
| Starter | price_1abc... | $49/mo | Monthly |
| Professional | price_1def... | $199/mo | Monthly |
| Enterprise | price_1ghi... | Custom | Annually |

### Checkout Flow

**1. User Selects Plan**:
```typescript
// src/actions/billing.ts
export async function createCheckoutSession(priceId: string) {
  const session = await stripe.checkout.sessions.create({
    customer: org.stripe_customer_id,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
  })

  return session.url
}
```

**2. Redirect to Stripe Checkout**:
```typescript
const checkoutUrl = await createCheckoutSession(priceId)
window.location.href = checkoutUrl
```

**3. Webhook Confirms Subscription**:
```typescript
// POST /api/webhooks/stripe
case 'checkout.session.completed':
  await updateOrgPlan(session.customer, session.subscription)
  break
```

### Webhook Events

**Endpoint**: `POST /api/webhooks/stripe`

**Events Handled**:
- `checkout.session.completed` → Update org plan, activate subscription
- `customer.subscription.updated` → Sync plan changes
- `customer.subscription.deleted` → Downgrade to free tier
- `invoice.payment_succeeded` → Log payment, send receipt
- `invoice.payment_failed` → Notify admin, retry payment

**Signature Verification**:
```typescript
const sig = request.headers.get('stripe-signature')!
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
```

### Customer Portal

Users can manage subscriptions via Stripe Customer Portal:

```typescript
export async function createPortalSession(orgId: string) {
  const org = await getOrg(orgId)

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id!,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  })

  return session.url
}
```

### Troubleshooting

**Issue**: Webhook 400 error
**Solution**: Ensure raw body is passed to `stripe.webhooks.constructEvent`

**Issue**: Test mode subscription not activating
**Solution**: Use test price IDs, not live price IDs

---

## Voice: Vapi

### Integration Overview

**Provider**: [Vapi](https://vapi.ai)
**Purpose**: Real-time voice AI conversations
**Plan**: Pay-as-you-go ($0.10/min)

### Configuration

**Environment Variables**:
```bash
VAPI_API_KEY=vapi_sk_...
VAPI_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_VAPI_PUBLIC_KEY=vapi_pk_...
```

### Creating Voice Agent

**1. Generate Agent Config**:
```typescript
// src/lib/vapi.ts
export function createAgentConfig(scenario: Scenario) {
  return {
    model: {
      provider: 'openai',
      model: 'gpt-4',
      systemPrompt: scenario.ai_prompt,
      temperature: 0.7,
    },
    voice: {
      provider: 'elevenlabs',
      voiceId: 'sarah_professional', // From persona
    },
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'en-US',
    },
    recordingEnabled: true,
    endCallFunctionEnabled: true,
  }
}
```

**2. Start Call from Browser**:
```typescript
import { useVapi } from '@vapi-ai/web'

const vapi = useVapi()

async function startCall(scenarioId: string) {
  const agentConfig = await fetch(`/api/calls/config?scenarioId=${scenarioId}`)

  vapi.start({
    ...agentConfig,
    metadata: {
      scenario_id: scenarioId,
      attempt_id: attemptId,
    },
  })
}
```

### Webhook Events

**Endpoint**: `POST /api/webhooks/vapi`

**Events Handled**:
- `call.started` → Create scenario_attempt record
- `call.ended` → Save recording, transcript, compute KPIs
- `transcript.update` → Real-time transcript streaming (optional)
- `call.failed` → Log error, notify user

**Event Payload Example**:
```json
{
  "type": "call.ended",
  "call": {
    "id": "vapi_call_abc123",
    "status": "completed",
    "startedAt": "2025-09-29T12:00:00Z",
    "endedAt": "2025-09-29T12:05:30Z",
    "duration": 330,
    "recordingUrl": "https://vapi.ai/recordings/abc123.mp3",
    "transcript": [
      {"role": "user", "text": "Hi there", "timestamp": 0},
      {"role": "assistant", "text": "Hello! How can I help?", "timestamp": 1200}
    ],
    "metadata": {
      "scenario_id": "...",
      "attempt_id": "..."
    }
  }
}
```

**Processing Call End**:
```typescript
case 'call.ended':
  const attemptId = call.metadata.attempt_id

  // 1. Download recording from Vapi
  const recording = await fetch(call.recordingUrl)
  const audioBuffer = await recording.arrayBuffer()

  // 2. Upload to Supabase Storage
  const { data } = await supabase.storage
    .from('recordings')
    .upload(`${orgId}/${attemptId}.mp3`, audioBuffer)

  // 3. Save transcript
  await supabase
    .from('scenario_attempts')
    .update({
      ended_at: call.endedAt,
      duration_seconds: call.duration,
      transcript_json: call.transcript,
      recording_url: data.path,
      status: 'completed',
    })
    .eq('id', attemptId)

  // 4. Compute KPIs and score
  await computeKPIs(attemptId)
  await scoreAttempt(attemptId)

  break
```

### Troubleshooting

**Issue**: Microphone permission denied
**Solution**: Ensure HTTPS or localhost, prompt user before call

**Issue**: Call drops after 30 seconds
**Solution**: Check Vapi balance, ensure webhook endpoint is reachable

---

## Email: Resend

### Integration Overview

**Provider**: [Resend](https://resend.com)
**Purpose**: Transactional emails
**Plan**: Free tier (100 emails/day)

### Configuration

**Environment Variables**:
```bash
RESEND_API_KEY=re_...
EMAIL_FROM=notifications@voiceaitraining.com
```

**Domain Setup**:
1. Add domain in Resend dashboard
2. Configure SPF, DKIM, DMARC records in DNS
3. Verify domain

### Email Templates

**Template Location**: `src/emails/`

**Templates**:
- `WelcomeEmail.tsx` → New user onboarding
- `AssignmentEmail.tsx` → New assignment notification
- `FeedbackReadyEmail.tsx` → Attempt scored, feedback available
- `DigestEmail.tsx` → Daily/weekly manager digest
- `InvoiceEmail.tsx` → Payment receipt

**Example Template**:
```typescript
// src/emails/AssignmentEmail.tsx
import { Html, Head, Body, Container, Text, Button } from '@react-email/components'

export function AssignmentEmail({ userName, scenarioTitle, dueDate, assignmentUrl }) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>Hi {userName},</Text>
          <Text>
            You have been assigned: <strong>{scenarioTitle}</strong>
          </Text>
          <Text>Due: {dueDate}</Text>
          <Button href={assignmentUrl}>Start Training</Button>
        </Container>
      </Body>
    </Html>
  )
}
```

**Sending Email**:
```typescript
import { Resend } from 'resend'
import { AssignmentEmail } from '@/emails/AssignmentEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'Voice AI Training <notifications@voiceaitraining.com>',
  to: user.email,
  subject: 'New Assignment: Cold Call Simulation',
  react: AssignmentEmail({ userName, scenarioTitle, dueDate, assignmentUrl }),
})
```

### Troubleshooting

**Issue**: Emails going to spam
**Solution**: Ensure SPF/DKIM configured, warm up domain gradually

**Issue**: 403 error from Resend
**Solution**: Check API key, verify domain is confirmed

---

## Webhooks (Outbound)

### Overview

Organizations can configure webhook endpoints to receive real-time event notifications.

### Configuration UI

**Location**: Settings > Webhooks

**Fields**:
- Name (display label)
- URL (HTTPS required)
- Secret (auto-generated, used for HMAC signing)
- Events (checkboxes: scenario.completed, assignment.created, etc.)
- Enabled (on/off toggle)

### Event Payload Format

```json
{
  "event": "scenario.completed",
  "idempotency_key": "uuid-here",
  "timestamp": "2025-09-29T12:34:56Z",
  "org": {
    "id": "org_abc123",
    "name": "Acme Corp"
  },
  "user": {
    "id": "user_xyz789",
    "email": "john@acme.com",
    "name": "John Doe",
    "role": "trainee"
  },
  "scenario": {
    "id": "scenario_123",
    "title": "Loan Officer Cold Call"
  },
  "attempt": {
    "id": "attempt_456",
    "score": 87,
    "duration_seconds": 312,
    "kpis": {
      "talk_listen": "45:55",
      "filler_words": 3
    },
    "recording_url": "https://...",
    "transcript_url": "https://..."
  },
  "signature": "sha256=abc123..."
}
```

### Signature Verification (Customer Side)

```typescript
import { createHmac } from 'crypto'

function verifyWebhook(body: string, signature: string, secret: string): boolean {
  const expectedSig = createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  return `sha256=${expectedSig}` === signature
}

// In webhook handler
export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-webhook-signature')!

  if (!verifyWebhook(body, signature, YOUR_SECRET)) {
    return new Response('Invalid signature', { status: 401 })
  }

  const payload = JSON.parse(body)
  // Process event
}
```

### Delivery and Retries

**Delivery Logic**:
1. POST to webhook URL with JSON body
2. Include headers: `X-Webhook-Signature`, `X-Webhook-Id`, `X-Webhook-Timestamp`
3. Expect 2xx response within 10 seconds
4. On failure (5xx or timeout), retry with backoff

**Retry Schedule**:
- Attempt 1: Immediate
- Attempt 2: 1 minute later
- Attempt 3: 5 minutes later
- Attempt 4: 30 minutes later
- Attempt 5: 2 hours later
- Attempt 6: 12 hours later (final)

**Backoff Implementation**:
```typescript
const delays = [0, 60, 300, 1800, 7200, 43200] // seconds

function getNextRetryTime(retryCount: number): Date {
  const delay = delays[Math.min(retryCount, delays.length - 1)]
  return new Date(Date.now() + delay * 1000)
}
```

### Webhook Management

**Test Webhook**:
```typescript
// POST /api/webhooks/:id/test
export async function testWebhook(webhookId: string) {
  const testPayload = {
    event: 'webhook.test',
    idempotency_key: 'test_' + Date.now(),
    timestamp: new Date().toISOString(),
  }

  const delivery = await deliverWebhook(webhookId, testPayload)
  return delivery.status // 'success' or 'failed'
}
```

**Replay Failed Delivery**:
```typescript
// POST /api/webhooks/deliveries/:id/replay
export async function replayDelivery(deliveryId: string) {
  const delivery = await getDelivery(deliveryId)

  return await deliverWebhook(delivery.webhook_id, delivery.payload)
}
```

### Event Types

| Event | Trigger | Payload Includes |
|-------|---------|------------------|
| `scenario.assigned` | Manager assigns scenario | user, scenario, assignment |
| `scenario.completed` | User finishes attempt | user, scenario, attempt, score |
| `attempt.scored.low` | Score below threshold | user, scenario, attempt, threshold |
| `track.completed` | User finishes all scenarios in track | user, track, scenarios, completion_date |
| `user.added` | New user joins org | user, inviter |
| `user.promoted` | User role changes | user, old_role, new_role |
| `assignment.overdue` | Due date passed without completion | user, assignment, days_overdue |

---

## Future Integrations

### Planned

- **Salesforce**: Sync completed training to contact records
- **HubSpot**: Trigger workflows based on scores
- **Slack**: Post leaderboard updates to team channels
- **Zapier**: Public API for no-code automation
- **Microsoft Teams**: Send assignments via Teams bot
- **Twilio**: SMS reminders for overdue assignments

---

## Troubleshooting Guide

### General Webhook Issues

**Symptom**: Webhook not receiving events
**Checks**:
1. Verify webhook is enabled in settings
2. Check event types are selected
3. Ensure URL is HTTPS and publicly accessible
4. Test with webhook.site to confirm delivery

**Symptom**: 401 Unauthorized from our webhooks
**Checks**:
1. Verify signature in headers
2. Use raw request body (not parsed JSON) for verification
3. Check secret matches what's shown in settings

### Clerk Issues

**Symptom**: "User not found" after sign-up
**Solution**: Check Clerk webhook is configured and user.created event is handled

**Symptom**: Org ID not populating
**Solution**: Ensure public_metadata is set during Clerk organization creation

### Stripe Issues

**Symptom**: Payment succeeded but plan not updated
**Solution**: Check Stripe webhook endpoint is configured in Stripe Dashboard > Developers > Webhooks

**Symptom**: Customer portal link broken
**Solution**: Ensure org has `stripe_customer_id` set

### Vapi Issues

**Symptom**: Recording URL 404
**Solution**: Vapi recordings expire after 7 days, implement download on call.ended

**Symptom**: Transcript incomplete
**Solution**: Check call duration, ensure call.ended webhook was received

---

## Version History

- **v0.1** (Sep 29, 2025) - Initial integrations documentation