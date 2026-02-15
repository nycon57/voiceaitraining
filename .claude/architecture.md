# Architecture & Patterns

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, ShadCN/UI |
| Backend | Supabase (PostgreSQL, RLS, Storage, Realtime) |
| AI | Vercel AI SDK for LLM orchestration and feedback generation |
| Voice | Vapi for telephony, real-time audio, STT, TTS, call control, recordings |
| Auth | Clerk organizations and role claims |
| Email | Resend with React Email templates |
| Payments | Stripe Checkout, Billing, Customer Portal |
| Observability | Sentry, OpenTelemetry traces, PostHog product analytics |

## Multi-Tenant Model

- Tenancy is org-scoped. UI path: `/org/[orgId]/...`
- Clerk provides identity and org membership. Supabase RLS enforces `org_id` on all reads and writes
- Server Actions set Postgres `jwt.claims.org_id` at request time

## Key Patterns

- **Server Actions** for mutations — enforce org and role guard in one place
- **Route Groups**: `(marketing)`, `(auth)`, `(authenticated)` and org scoping under `/org/[orgId]`
- **Deterministic Scoring**: all non-LLM metrics computed via pure functions for reproducibility
- **LLM for Feedback**: prompt templates generate concise feedback referencing transcript spans
- **Event Bus**: internal event emitter writes to `webhook_deliveries`, retry worker handles dispatch

## API Patterns

- **Server Actions**: primary mutation surface with org guard and Zod validation
- **Route Handlers**: `/api/webhooks/stripe`, `/api/webhooks/vapi`, `/api/calls/start`, `/api/reports/export`
- **Signed URLs**: `/api/storage/sign-url` for playback of recordings and transcript files

## Development Phases

1. **Foundation** — Auth, orgs, roles, billing scaffolding, app shell, base schema/RLS, seed data
2. **Content and Assignment** — Scenario CRUD, tracks, assignments, trainee home, notifications
3. **Voice MVP** — Vapi agent config, call start/end, transcripts/recordings, basic KPIs/scoring
4. **Reporting v1** — Facts, MVs, dashboards, exports, leaderboards, HR compliance
5. **AI Authoring and Branching** — Scenario generator, rubric suggestions, branching editor
6. **Integrations** — Webhook manager, delivery retries, filters, Slack formatter
7. **Scale and Security** — Load tests, SLOs, alerts, pen test fixes, teams/manager scoping

## Key Documentation References

- `PRD.md` — product requirements and user flows
- `ROADMAP.md` — phased plan and sprint slices
- `DB_SCHEMA.md` — tables, RLS, functions
- `AI_PROMPTS.md` — LLM prompt libraries and constraints
- `INTEGRATIONS.md` — webhooks, Stripe, Vapi, Resend
- `REPORTING.md` — facts, MVs, dashboards
- `SECURITY.md` — auth, RLS, secrets, storage model
- `RUNBOOKS.md` — on-call, incident playbooks
