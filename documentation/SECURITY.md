# Security Documentation

## Overview

Voice AI Training platform implements defense-in-depth security with multiple layers: authentication, authorization, data encryption, secure storage, and audit logging. This document outlines security policies, threat models, and operational procedures.

**Security Level**: SOC 2 Type II Ready
**Last Security Audit**: Pending (Q1 2026)
**Last Updated**: September 29, 2025

---

## Authentication

### Clerk Integration

**Primary Auth Provider**: [Clerk](https://clerk.com)

**Supported Methods**:
- Email/Password with strong password requirements
- OAuth (Google, Microsoft, GitHub)
- Magic Links (passwordless email)
- Multi-Factor Authentication (TOTP, SMS)

**Session Management**:
- JWT tokens with 1-hour expiration
- Refresh tokens stored in httpOnly cookies
- Automatic session rotation on activity
- Force logout on suspicious activity

**Password Policy**:
- Minimum 12 characters
- Must include uppercase, lowercase, number, special character
- No common passwords (zxcvbn validation)
- Password history (last 5 passwords blocked)
- Max 5 failed login attempts before account lockout (15-minute cooldown)

---

## Authorization

### Role-Based Access Control (RBAC)

**Roles**:
1. **Trainee**
   - View own attempts and assignments
   - Start voice sessions
   - Update own profile
   - No access to other users' data

2. **Manager**
   - All trainee permissions
   - View team performance (users they manage)
   - Assign scenarios to team
   - Access team leaderboards
   - Cannot access other teams or org settings

3. **Admin**
   - All manager permissions
   - Full org access (all users, scenarios, settings)
   - Create/edit/delete scenarios and tracks
   - Configure webhooks and integrations
   - Manage users and roles
   - Access billing and subscription

4. **HR**
   - View all attempts for compliance
   - Access completion reports
   - Export user data
   - Cannot modify scenarios or assignments

**Permission Matrix**:

| Action | Trainee | Manager | Admin | HR |
|--------|---------|---------|-------|-----|
| View own attempts | ✅ | ✅ | ✅ | ✅ |
| View team attempts | ❌ | ✅ | ✅ | ✅ |
| View all attempts | ❌ | ❌ | ✅ | ✅ |
| Create scenarios | ❌ | ❌ | ✅ | ❌ |
| Assign scenarios | ❌ | ✅ | ✅ | ❌ |
| Manage users | ❌ | ❌ | ✅ | ❌ |
| Configure webhooks | ❌ | ❌ | ✅ | ❌ |
| Export data | ❌ | ❌ | ✅ | ✅ |

---

## Row Level Security (RLS)

### Implementation

All database tables use Postgres RLS policies to enforce org-level isolation. Even if SQL injection occurs, attackers cannot access other orgs' data.

**Policy Pattern**:
```sql
create policy "org_scoped_policy" on table_name
  using (org_id = current_setting('jwt.claims.org_id', true)::uuid);
```

**How It Works**:
1. User authenticates via Clerk → JWT issued
2. JWT includes custom claim: `org_id`
3. Supabase validates JWT and extracts claims
4. Every query automatically filtered by RLS
5. Database returns empty result if org_id doesn't match

**Testing**:
```sql
-- Test as org A
select set_org_claim('org-a-uuid');
select * from scenarios; -- Returns only org A scenarios

-- Test as org B
select set_org_claim('org-b-uuid');
select * from scenarios; -- Returns only org B scenarios

-- Test without claim
select current_setting('jwt.claims.org_id', true); -- NULL
select * from scenarios; -- Empty result set
```

**Bypass Prevention**:
- Service role key secured in environment variables
- Never exposed to client
- Server actions always set org_id from authenticated session
- Admin tools require double verification (role + org_id match)

---

## Data Encryption

### At Rest

**Database Encryption**:
- AES-256 encryption for all Supabase data
- Transparent Data Encryption (TDE) enabled
- Automatic key rotation every 90 days
- Keys managed by AWS KMS

**Storage Encryption**:
- S3-compatible storage with encryption at rest
- Each bucket uses separate encryption keys
- Audio recordings encrypted before upload

**PII Encryption** (Optional):
- Environment variable: `ENCRYPTION_KEY`
- Encrypt sensitive fields (email, phone) in `metadata` JSON
- Use `crypto` module for AES-256-GCM encryption

Example:
```typescript
import { encrypt, decrypt } from '@/lib/crypto'

// Storing PII
const encrypted = encrypt(user.email, process.env.ENCRYPTION_KEY!)
await db.update({ metadata: { email_encrypted: encrypted } })

// Retrieving PII
const decrypted = decrypt(metadata.email_encrypted, process.env.ENCRYPTION_KEY!)
```

### In Transit

**TLS/HTTPS**:
- All traffic encrypted with TLS 1.3
- HSTS enabled (max-age=31536000)
- Certificate pinning on mobile apps (future)

**API Communication**:
- Supabase: TLS 1.3 with certificate validation
- Vapi: TLS 1.2+ with OAuth bearer tokens
- Stripe: TLS 1.2+ with webhook signature verification

---

## Storage Security

### Supabase Storage Buckets

**Access Control**:
- All buckets are **private** (no public URLs)
- Access via signed URLs only (short TTL)
- Storage policies enforce org_id matching

**Signed URL Generation**:
```typescript
const { data, error } = await supabase.storage
  .from('recordings')
  .createSignedUrl(`${orgId}/${attemptId}.mp3`, 3600) // 1 hour TTL
```

**Security Rules**:
- Recordings: Org members only
- Transcripts: Org members only
- Org assets: Admins only
- Exports: Requestor only (user_id check)

**File Upload Validation**:
- Max file size: 100MB (recordings), 10MB (assets)
- Allowed MIME types: audio/*, application/json, text/plain, image/*
- Virus scanning (ClamAV) on all uploads
- Content-Type header validation

---

## Secrets Management

### Environment Variables

**Sensitive Keys**:
- `CLERK_SECRET_KEY` – Auth server key
- `SUPABASE_SERVICE_ROLE_KEY` – Database admin key
- `STRIPE_SECRET_KEY` – Payment processing
- `OPENAI_API_KEY` – AI generation
- `VAPI_API_KEY` – Voice integration
- `ENCRYPTION_KEY` – PII encryption
- `WEBHOOK_DEFAULT_SECRET` – HMAC signing

**Storage**:
- Development: `.env.local` (gitignored)
- Production: Vercel/platform secrets
- Never commit secrets to git
- Rotate secrets every 90 days

**Secret Rotation Process**:
1. Generate new secret via provider dashboard
2. Update environment variable in platform
3. Deploy new version (no downtime, gradual rollout)
4. Monitor for errors
5. Revoke old secret after 24 hours

---

## Webhook Security

### HMAC Signature Verification

All incoming webhooks (Stripe, Vapi, Clerk) must include a valid signature.

**Verification Flow**:
```typescript
import { validateWebhookSignature } from '@/lib/webhooks'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!validateWebhookSignature(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)) {
    return new Response('Invalid signature', { status: 401 })
  }

  // Process webhook
}
```

**Signature Algorithm**:
- HMAC-SHA256
- Timestamp validation (reject if >5 minutes old)
- Replay attack prevention via idempotency key

**Outbound Webhooks**:
We sign our webhooks to customer endpoints:
```typescript
const signature = createHmac('sha256', webhook.secret)
  .update(JSON.stringify(payload))
  .digest('hex')

await fetch(webhook.url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Signature': `sha256=${signature}`,
    'X-Webhook-Id': delivery.id,
    'X-Webhook-Timestamp': new Date().toISOString(),
  },
  body: JSON.stringify(payload),
})
```

**Rate Limiting**:
- Max 100 webhook events per minute per org
- Exponential backoff on failures
- Circuit breaker after 5 consecutive failures

---

## API Security

### Rate Limiting

**Limits**:
| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/calls/start | 10 req/min | Per user |
| GET /api/scenarios | 60 req/min | Per org |
| POST /api/webhooks/* | 1000 req/min | Global |
| GET /api/attempts/:id | 30 req/min | Per user |

**Implementation**:
- Upstash Redis for distributed rate limiting
- `X-RateLimit-*` headers in responses
- 429 Too Many Requests status on exceed

**DDoS Protection**:
- Vercel edge network with built-in DDoS mitigation
- Cloudflare Pro plan for DNS and WAF
- IP-based blocking for abusive clients

### CORS Policy

```typescript
const allowedOrigins = [
  'https://app.voiceaitraining.com',
  'https://*.vercel.app', // Preview deployments
]

// Only allow same-origin or whitelisted origins
if (origin && !allowedOrigins.some(allowed => origin.match(allowed))) {
  return new Response('CORS not allowed', { status: 403 })
}
```

---

## Input Validation

### Server Actions

All mutations use Zod for schema validation:

```typescript
import { z } from 'zod'

const createScenarioSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  persona: z.object({
    role: z.string(),
    name: z.string(),
  }),
})

export async function createScenario(input: unknown) {
  const data = createScenarioSchema.parse(input) // Throws if invalid
  // Proceed with validated data
}
```

**Validation Rules**:
- String length limits on all text fields
- Email format validation
- URL validation for webhook endpoints
- JSON schema validation for complex objects (persona, rubric)
- SQL injection protection via parameterized queries

---

## Audit Logging

### Events Logged

**User Actions**:
- Sign up, sign in, sign out
- Password changes, MFA enabled/disabled
- Role changes (promotion, demotion)
- User invited, removed from org

**Data Actions**:
- Scenario created, edited, published, archived
- Assignment created, modified, deleted
- Webhook configured, enabled, disabled
- Export generated, downloaded

**Security Events**:
- Failed login attempts
- Unauthorized access attempts
- Suspicious activity (rapid role changes, bulk exports)
- Webhook signature failures

**Log Format**:
```json
{
  "timestamp": "2025-09-29T12:34:56Z",
  "event": "scenario.published",
  "actor": {
    "user_id": "user_abc123",
    "org_id": "org_xyz789",
    "role": "admin"
  },
  "target": {
    "scenario_id": "scenario_123",
    "title": "Loan Officer Cold Call"
  },
  "metadata": {
    "ip": "192.0.2.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

**Storage**:
- Logs sent to Supabase `audit_log` table
- Retained for 1 year (compliance requirement)
- Searchable via admin dashboard

---

## Compliance

### GDPR

**Data Subject Rights**:
- **Right to Access**: Export all user data via settings page
- **Right to Rectification**: Users can edit profile and settings
- **Right to Erasure**: Account deletion removes all PII, pseudonymizes attempts
- **Right to Portability**: JSON export of all user data

**Implementation**:
- Cookie consent banner on marketing site
- Privacy policy linked in footer
- Data processing agreement for enterprise customers
- Subprocessors documented (Clerk, Supabase, Stripe, Vapi)

### CCPA

**Do Not Sell**:
- We do not sell user data
- No third-party tracking on authenticated pages
- Clear opt-out link in footer

### SOC 2 Type II (Target: Q2 2026)

**Requirements**:
- [ ] Security audit by certified firm
- [ ] Penetration testing
- [ ] Incident response plan
- [ ] Employee security training
- [ ] Vendor risk assessment
- [ ] Encryption at rest and in transit
- [ ] Access controls and MFA
- [ ] Audit logging

---

## Incident Response

### Severity Levels

**P0 - Critical** (Response: Immediate)
- Data breach or leak
- Service completely down
- Payment processing broken

**P1 - High** (Response: <1 hour)
- Partial service outage
- Authentication failures
- Webhook deliveries failing

**P2 - Medium** (Response: <4 hours)
- Performance degradation
- Non-critical feature broken
- Elevated error rates

**P3 - Low** (Response: <24 hours)
- Minor UI bugs
- Documentation errors

### Incident Response Plan

**1. Detection**
- Automated alerts via Sentry, Uptime monitoring
- Customer reports via support channel
- Security audit findings

**2. Triage**
- Assess severity and impact
- Create incident in PagerDuty
- Notify on-call engineer

**3. Mitigation**
- Isolate affected systems
- Roll back recent deployments if needed
- Apply hotfix or temporary workaround

**4. Communication**
- Update status page (status.voiceaitraining.com)
- Email affected customers (P0/P1 only)
- Post-mortem within 48 hours

**5. Resolution**
- Root cause analysis
- Permanent fix deployed
- Regression tests added

**6. Post-Incident**
- Document lessons learned
- Update runbooks
- Improve monitoring/alerts

---

## Security Best Practices

### For Developers

**Code Review Checklist**:
- [ ] No secrets in code or git history
- [ ] All inputs validated with Zod
- [ ] RLS policies tested for new tables
- [ ] SQL queries use parameterized statements
- [ ] Storage URLs are signed, not public
- [ ] Webhook signatures verified
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting applied to new endpoints

**Dependencies**:
- Run `pnpm audit` weekly
- Update dependencies monthly
- Pin major versions, allow patch updates
- Dependabot PR auto-merge if tests pass

### For Operators

**Access Control**:
- Rotate service role keys every 90 days
- Use MFA for all production access
- Principle of least privilege (no dev has prod DB access)
- Audit access logs monthly

**Monitoring**:
- Alert on failed RLS policy checks
- Monitor for unusual data export activity
- Track login anomalies (new device, new location)
- Webhook signature failure alerts

---

## Threat Model

### Threats and Mitigations

| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|------------|
| SQL Injection | Low | High | Parameterized queries, RLS policies |
| XSS | Medium | Medium | React auto-escaping, CSP headers |
| CSRF | Low | Medium | SameSite cookies, CSRF tokens |
| Unauthorized data access | Medium | High | RLS, role checks, audit logs |
| DDoS | High | High | Cloudflare, rate limiting, auto-scaling |
| Account takeover | Medium | High | MFA, password policy, anomaly detection |
| Phishing | High | Medium | Email verification, SPF/DKIM, user education |
| Insider threat | Low | High | Audit logs, least privilege, background checks |

---

## Security Contact

**Report a Vulnerability**: security@voiceaitraining.com

**Response SLA**:
- Critical: 24 hours
- High: 48 hours
- Medium/Low: 5 business days

**Bug Bounty** (Coming Q2 2026):
- $50-$5,000 rewards based on severity
- Coordinated disclosure required

---

## Version History

- **v0.1** (Sep 29, 2025) - Initial security documentation
- **v0.2** (Planned Q1 2026) - Post-audit updates