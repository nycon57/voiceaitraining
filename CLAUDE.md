Audio Agent Sales Training – CLAUDE.MD

Project Overview

Audio Agent Sales Training is a SaaS platform that uses AI voice agents to simulate sales calls. It trains reps through realistic two-way audio scenarios, scores performance against global and scenario-specific KPIs, and gives managers enterprise-grade tracking, assignments, leaderboards, and reporting. Initial vertical: loan officers. Architecture supports industry-agnostic expansion.

⸻

Core Architecture

Technology Stack
	•	Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS, ShadCN/UI
	•	Backend: Supabase (PostgreSQL, RLS, Storage, Realtime)
	•	AI Integration: Vercel AI SDK for LLM orchestration and feedback generation
	•	Voice Layer: Vapi for telephony, real-time audio, STT, TTS, call control, recordings
	•	Authentication: Clerk organizations and role claims
	•	Email: Resend with React Email templates
	•	Payments: Stripe Checkout, Billing, Customer Portal
	•	Observability: Sentry, OpenTelemetry traces, PostHog product analytics

Multi-Tenant Model
	•	Tenancy is org-scoped. UI path: /org/[orgId]/…
	•	Clerk provides identity and org membership. Supabase RLS enforces org_id on all reads and writes
	•	Server Actions set Postgres jwt.claims.org_id at request time

⸻

Database Structure Summary

Core Tables
	•	Tenancy and Roles
	•	orgs — organization, plan, entitlements, Stripe customer id
	•	org_members — user membership and role: trainee, manager, admin, hr
	•	Training Content
	•	scenarios — title, persona, difficulty, ai_prompt, branching JSON, rubric JSON, status
	•	tracks — grouped curricula
	•	track_scenarios — ordered mapping of scenarios in a track
	•	Assignments and Attempts
	•	assignments — scenario or track assignment to a user or team with due date
	•	scenario_attempts — one attempt per call: timings, recording, transcript, KPIs, score, breakdown
	•	Integrations
	•	webhooks — endpoints per org with events, secret, enabled
	•	webhook_deliveries — event payload, status, retries, response details
	•	Reporting Star
	•	fact_scenario_attempts — attempt facts for analytics
	•	fact_kpi_events — optional granular KPI events
	•	dim_users, dim_scenarios, dim_tracks, dim_time, dim_orgs
	•	Materialized views: mv_leaderboard_month, mv_org_overview, mv_scenario_insights

Storage Buckets
	1.	recordings — audio files of attempts
	2.	transcripts — JSON and TXT transcripts
	3.	org-assets — logos, brand assets for emails and UI
	4.	scenario-assets — attachments, images for authoring
	5.	exports — generated CSVs and scheduled report zips
	6.	tmp — short-lived artifacts

Key Database Functions
	•	set_org_claim(org_id uuid) — helper to set jwt.claims.org_id for RLS in server actions
	•	compute_kpis(transcript jsonb) — returns deterministic KPI JSON
	•	score_attempt(attempt_id uuid) — applies rubric weights, writes score and score_breakdown
	•	refresh_reporting() — refreshes MVs post batch updates
	•	grant_signed_url(path text, ttl int) — returns short-lived signed URL for playback/download
	•	enqueue_webhook(event text, payload jsonb) — persists and schedules delivery with backoff

Security and RLS
	•	RLS enabled on all tenant tables. Policies restrict by org_id = current_setting('jwt.claims.org_id')::uuid
	•	Storage read via signed URLs with short TTL
	•	Outbound webhooks signed with HMAC SHA-256 using per-endpoint secret
	•	Stripe and Clerk inbound webhooks validated against signatures

⸻

Development Guidelines

Code Standards
	•	TypeScript strict. No any unless justified
	•	Keep business rules in src/actions/** and src/lib/** not in React components
	•	Zod validation for all inputs to server actions and API handlers
	•	UI components in ShadCN style with accessibility defaults

Key Patterns
	•	Server Actions for mutations, enforce org and role guard in one place
	•	Route Groups: (marketing), (auth), (authenticated) and org scoping under /org/[orgId]
	•	Deterministic Scoring: all non-LLM metrics computed via pure functions for reproducibility
	•	LLM for Feedback: prompt templates generate concise feedback referencing transcript spans
	•	Event Bus: internal event emitter writes to webhook_deliveries, retry worker handles dispatch



⸻

Feature Areas

Voice Simulation
	•	Vapi agent per scenario: STT Deepgram, LLM GPT-4 class via Vercel AI SDK, TTS ElevenLabs
	•	Browser player: mic permissions, connect, timer, live call status, safe end
	•	Server: start call endpoint creates attempt, end-of-call webhook persists artifacts

Scenario Authoring
	•	Manual: persona, prompt, rubric editor with JSON validation
	•	AI Draft: generate scenario from brief, admin edits and publishes
	•	Branching v1: authorable hints in branching JSON, runtime dispatcher augments prompts

Scoring and Feedback
	•	Global KPIs: talk-listen ratio, filler count, interruptions, pace wpm, sentiment proxy
	•	Scenario KPIs: required phrases, objection tags addressed, open question count, goal hit
	•	Scoring: weighted rubric to numeric score with breakdown
	•	Feedback: LLM summary with 2 to 4 cited transcript spans and next steps

Assignments and Tracks
	•	Assign a scenario or track to users or teams with due dates and thresholds
	•	Auto reminders, overdue flags, manager daily digest
	•	Track progression with prerequisites

Reporting and Leaderboards
	•	Org overview, Scenario insights, Team leaderboard, HR compliance
	•	CSV export, scheduled email reports, signed links for recordings

Integrations
	•	Webhooks: scenario.assigned, scenario.completed, attempt.scored.low, track.completed, user.added
	•	Manual replay and retry logs, HMAC signatures
	•	Stripe billing and plan entitlements

⸻

Integration Points

Webhook Payload Template

{
  "event": "scenario.completed",
  "idempotency_key": "uuid",
  "org": {"id":"...", "name":"..."},
  "user": {"id":"...", "email":"...", "name":"...", "role":"trainee"},
  "scenario": {"id":"...", "title":"..."},
  "attempt": {
    "id":"...", "score": 87, "duration_seconds": 312,
    "kpis": {"talk_listen":"45:55","filler_words":3},
    "recording_url": "signed-url", "transcript_url": "signed-url"
  },
  "timestamp": "2025-09-20T21:12:33Z",
  "signature": "hmac-sha256=..."
}

API Patterns
	•	Server Actions: primary mutation surface with org guard and Zod validation
	•	Route Handlers: /api/webhooks/stripe, /api/webhooks/vapi, /api/calls/start, /api/reports/export
	•	Signed URLs: /api/storage/sign-url for playback of recordings and transcript files

⸻

Development Phases
	1.	Foundation
	•	Auth, orgs, roles, billing scaffolding, app shell
	•	Base schema and RLS, seed data, email domain setup
	2.	Content and Assignment
	•	Scenario CRUD, tracks, assignments, trainee home, notifications
	3.	Voice MVP
	•	Vapi agent config, call start and end, transcripts and recordings, basic KPIs and scoring
	4.	Reporting v1
	•	Facts, MVs, dashboards, exports, leaderboards, HR compliance
	5.	AI Authoring and Branching
	•	Scenario generator, rubric suggestions, branching editor and dispatcher
	6.	Integrations
	•	Webhook manager, delivery retries, filters, Slack formatter
	7.	Scale and Security
	•	Load tests, SLOs, alerts, pen test fixes, teams and manager scoping

⸻

Performance Considerations
	•	Pre-segment transcripts to utterances with timestamps and speaker labels
	•	Index fact_* by (org_id, started_at) and (org_id, scenario_id)
	•	Materialized views refreshed on demand post batch insert, plus nightly cron
	•	Stream LLM responses for feedback to reduce TTFB
	•	Cache scenario prompts and compiled rubric in memory for call sessions

⸻

Testing Strategy
	•	Unit: KPI calculators, scoring, payload signing, RLS policy tests
	•	Integration: start call to attempt complete with mocked Vapi
	•	E2E: auth, assignment, attempt, feedback read, exports via Playwright
	•	Load: batch attempts insert and MV refresh at 10k attempts scale

⸻

Monitoring and Observability
	•	Sentry on client and server
	•	OpenTelemetry traces from /api/calls/start to scoring completion
	•	Structured logs for webhook deliveries and retries
	•	PostHog events: scenario_started, scenario_completed, feedback_viewed, assignment_created, webhook_failed

⸻

Key Documentation References
	•	PRD.md — product requirements and user flows
	•	ROADMAP.md — phased plan and sprint slices
	•	DB_SCHEMA.md — tables, RLS, functions
	•	AI_PROMPTS.md — LLM prompt libraries and constraints
	•	INTEGRATIONS.md — webhooks, Stripe, Vapi, Resend
	•	REPORTING.md — facts, MVs, dashboards
	•	SECURITY.md — auth, RLS, secrets, storage model
	•	RUNBOOKS.md — on-call, incident playbooks

⸻

Development Commands

# Dev server
pnpm dev

# Quality gates
pnpm lint
pnpm typecheck

# Build and start
pnpm build
pnpm start

# Supabase types
npx supabase gen types typescript \
  --project-id $SUPABASE_PROJECT_ID > src/types/supabase.ts

# DB migrations
pnpm db:migrate   # wrap psql or drizzle-kit
pnpm db:seed

# Verify before pushing
pnpm verify       # runs lint, typecheck, build, basic tests

# Clean
pnpm clean


⸻

Environment Setup

Required Variables
	•	App
	•	NEXT_PUBLIC_APP_URL
	•	NEXT_RUNTIME=edge or nodejs where needed
	•	Supabase
	•	NEXT_PUBLIC_SUPABASE_URL
	•	NEXT_PUBLIC_SUPABASE_ANON_KEY
	•	SUPABASE_SERVICE_ROLE_KEY
	•	Clerk
	•	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
	•	CLERK_SECRET_KEY
	•	Stripe
	•	STRIPE_SECRET_KEY
	•	STRIPE_WEBHOOK_SECRET
	•	NEXT_PUBLIC_STRIPE_PRICE_* for plan ids
	•	Email
	•	RESEND_API_KEY
	•	EMAIL_FROM — default sender
	•	AI
	•	OPENAI_API_KEY
	•	DEEPGRAM_API_KEY
	•	ELEVENLABS_API_KEY
	•	Vapi
	•	VAPI_API_KEY
	•	VAPI_PROJECT_ID
	•	Security
	•	WEBHOOK_DEFAULT_SECRET
	•	ENCRYPTION_KEY if encrypting stored PII

⸻

Common Issues and Solutions
	1.	Mic permission blocked
	•	Ensure HTTPS origin and correct browser prompt handling. Local dev: use vercel dev or localhost with secure context
	2.	RLS query failures
	•	Verify set_org_claim runs in server actions, check org_id propagation from Clerk session
	3.	Stripe webhook 400
	•	Confirm correct endpoint secret and raw body parsing in route handler
	4.	Vapi transcript missing
	•	Fallback to post-call STT with Whisper or Deepgram batch API, then recompute KPIs
	5.	Signed URL expired
	•	Regenerate via /api/storage/sign-url with TTL in seconds; do not store public URLs
	6.	Large transcript feedback latency
	•	Summarize into outline and pass spans to LLM; apply token budget and trim system prompt
	7.	ShadCN component import errors
	•	All UI imports from @/components/ui/*; re-run shadcn add if tokens drift

⸻

Performance Optimization Notes
	•	Prefer Server Components and Server Actions, keep client components minimal
	•	Use unstable_cache for scenario library and org config
	•	Batch inserts for attempts and KPI events, then refresh MVs
	•	Debounce leaderboard queries and paginate attempts
	•	Pre-sign storage links in parallel with feedback generation

⸻

Project Status

Core PRD and roadmap complete. Phase 0 and 1 ready for implementation. Voice MVP and reporting planned with clear acceptance criteria. Stack is production-ready and supports multi-tenant enterprise use.

⸻

Code Review

Continuous AI review loop with Claude
	1.	Start background reviewer:

claude review --watch


	2.	Address comments as they appear in terminal or PR
	3.	Re-run pnpm verify before merge
	4.	Keep prompts and guardrails in src/lib/ai/prompts/* under version control for diffs

PR checklist
	•	RLS policy tests passing
	•	No server action without org guard
	•	No public storage URLs for recordings
	•	Webhook signatures verified and unit tested
	•	Dashboards render under 2 seconds on seeded dataset

⸻
