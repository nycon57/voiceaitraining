Awesome. Here is a fully built development roadmap that you can hand to engineering today. It covers frontend, auth, scenarios, voice, scoring, integrations, reporting, and the path to production. I kept it opinionated and specific so tickets drop right out of it.

⸻

0) Ground Rules and Architecture

Core stack
	•	Next.js 15 App Router on Vercel
	•	TypeScript, Tailwind, ShadCN UI
	•	Clerk for auth and org invites
	•	Supabase Postgres, RLS, Storage, Realtime
	•	Vercel AI SDK for LLM calls
	•	Vapi for voice agent, telephony, call control, recordings
	•	Resend for email
	•	Stripe for billing and entitlements
	•	Sentry for error tracking, OpenTelemetry for traces, PostHog for product analytics

Tenancy and auth
	•	Clerk manages users and sessions
	•	orgs table in Supabase for multi tenant partitioning
	•	User to org membership table with role
	•	All queries scoped by org_id through a server action layer

Data modeling
	•	Star-like model for reporting
	•	Facts: fact_scenario_attempts, fact_kpi_events
	•	Dimensions: dim_users, dim_scenarios, dim_tracks, dim_time, dim_orgs
	•	OLTP tables for app flows plus materialized views for dashboards

Environments
	•	Dev, Preview, Prod on Vercel
	•	Supabase projects: dev and prod
	•	Stripe test and live modes
	•	Resend sandbox and prod domains
	•	Vapi sandbox and prod projects

⸻

1) Database Schema v1

Create with migrations. Below is a condensed view.

-- Orgs and memberships
create table orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_customer_id text,
  plan text not null default 'pro',
  created_at timestamptz default now()
);

create type user_role as enum ('trainee','manager','admin','hr');

create table org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade,
  user_id text not null, -- Clerk user id
  role user_role not null,
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

-- Scenarios and tracks
create table scenarios (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade,
  title text not null,
  description text,
  persona jsonb,              -- {role:"client", profile:{...}}
  difficulty text,            -- e.g. "easy","med","hard"
  ai_prompt text,             -- system prompt for LLM
  branching jsonb,            -- graph nodes/edges config
  rubric jsonb,               -- weights, required items
  status text default 'draft',-- draft, active, archived
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table tracks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade,
  title text not null,
  description text,
  status text default 'active',
  created_at timestamptz default now()
);

create table track_scenarios (
  track_id uuid references tracks(id) on delete cascade,
  scenario_id uuid references scenarios(id) on delete cascade,
  position int not null,
  primary key(track_id, scenario_id)
);

-- Assignments
create table assignments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade,
  assignee_user_id text not null,
  type text not null, -- 'scenario' or 'track'
  scenario_id uuid,
  track_id uuid,
  due_at timestamptz,
  required boolean default true,
  created_by text,
  created_at timestamptz default now()
);

-- Attempts and artifacts
create table scenario_attempts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade,
  user_id text not null,
  scenario_id uuid references scenarios(id),
  assignment_id uuid references assignments(id),
  vapi_call_id text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_seconds int,
  recording_url text,
  transcript_text text,
  transcript_json jsonb,
  score numeric,
  score_breakdown jsonb,    -- {goal:0.5, kpis:0.3, quality:0.2}
  kpis jsonb,               -- computed metrics
  status text not null default 'completed'
);

-- Webhooks
create table webhooks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade,
  name text not null,
  url text not null,
  secret text not null,
  enabled boolean default true,
  events text[] not null,   -- ['scenario.completed','track.completed',...]
  created_at timestamptz default now()
);

create table webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid references webhooks(id) on delete cascade,
  event text not null,
  payload jsonb not null,
  status text not null,
  response_status int,
  response_body text,
  attempted_at timestamptz default now(),
  retry_count int default 0
);

-- Reporting facts and dims (partial)
create table fact_scenario_attempts (
  attempt_id uuid primary key,
  org_id uuid,
  user_id text,
  scenario_id uuid,
  score numeric,
  duration_seconds int,
  talk_ms int,
  listen_ms int,
  started_at timestamptz,
  ended_at timestamptz
);

create materialized view mv_leaderboard_month as
select org_id, user_id, date_trunc('month', started_at) as month,
       avg(score) as avg_score, count(*) as attempts
from fact_scenario_attempts
group by 1,2,3;

RLS policies
	•	All tables have RLS on with org_id = current_setting('jwt.claims.org_id')::uuid
	•	org_members drives claims injection on session creation

⸻

2) Frontend IA and Screens

Public
	•	Marketing site
	•	Sign in, Sign up, Accept invite

App shell
	•	Org switcher
	•	Role-aware nav

Trainee
	•	Home: assigned scenarios and tracks, due dates
	•	Scenario player: connect mic, call control, timer, persona info
	•	Results: transcript, highlights, score, suggestions
	•	History: past attempts, filters, playback

Manager
	•	Team overview: compliance status, average score, risk flags
	•	Assign training: individuals, teams, due dates
	•	Reviews: manager comments on attempts

Admin
	•	Scenario library: list, create, edit, version
	•	Track builder: add scenarios, set order
	•	Users and roles: invite, bulk import, team grouping
	•	Integrations: webhooks manager
	•	Billing: plan, seats, usage
	•	Settings: branding, email templates, notification rules

HR
	•	Compliance dashboard: required trainings, completion exports

Shared
	•	Leaderboards
	•	Analytics dashboards
	•	Notifications center

Component inventory (ShadCN)
	•	Data tables with filters
	•	Form builder with Zod validation
	•	Flow editor for branching (Phase 2)
	•	Transcript viewer with line-level annotations
	•	Metric tiles, line charts, bar charts
	•	Wizard for scenario creation
	•	Code editor textarea for prompts and rubric JSON
	•	Webhook tester panel

⸻

3) Auth, Org, Billing

Clerk
	•	Use organizations to model tenants
	•	On signup create orgs row and org_members with role admin
	•	Invitation flow: admin invites by email, select role and team

Stripe
	•	Plans: Starter, Growth, Enterprise
	•	Pricing model: per active trainee seat, monthly
	•	Entitlements: max_users, max_minutes, ai_generation available flags stored in orgs metadata
	•	Flows
	•	New org: Stripe Checkout to start subscription or start trial
	•	Customer Portal link in Billing page
	•	Webhooks: customer.subscription.updated, invoice.payment_failed, update entitlements

Access control
	•	Server actions read Clerk session, resolve org_id, set Postgres jwt.claims.org_id
	•	Guards per route segment: role based, feature flags

⸻

4) Voice, Calls, Transcription

Vapi integration
	•	Configure agent per scenario with
	•	STT provider: Deepgram
	•	LLM provider: OpenAI via Vercel AI SDK or Vapi native
	•	TTS provider: ElevenLabs
	•	System prompt seeded from scenarios.ai_prompt plus injected context
	•	Start call API
	•	POST /api/calls/start: body {scenario_id, assignment_id?}
	•	Creates scenario_attempts row with status in_progress
	•	Generates short-lived Vapi token or starts server-side session
	•	End call webhook
	•	Vapi callback with call_id, recording URL, transcript segments
	•	Persist recording to Supabase Storage, transcript to transcript_json and transcript_text
	•	Compute derived metrics
	•	Mark attempt completed

Talk vs listen
	•	From transcript segments with speaker labels or from audio channel metadata
	•	Accumulate durations talk_ms for trainee and listen_ms for agent

Branching
	•	Phase 1: prompt only with soft branching through LLM instructions
	•	Phase 2: authorable graph in scenarios.branching, driven by tool outputs and function calls to LLM

⸻

5) Scoring and Feedback Engine

KPI framework
	•	Global KPIs
	•	talk_listen_ratio
	•	filler_words_count
	•	pace_wpm
	•	interruptions
	•	sentiment score
	•	Scenario KPIs from rubric JSON
	•	required_phrases
	•	goals, weights
	•	open questions count
	•	objection tags addressed

Pipeline
	1.	Normalize transcript to utterances with timestamps and speaker
	2.	Compute global metrics deterministically
	3.	Use embeddings search to detect concept mentions beyond exact keywords
	4.	Score required items and weighted rubric
	5.	Call LLM to draft feedback with cited transcript lines
	6.	Persist score, score_breakdown, kpis, transcript_json

Acceptance criteria
	•	Scores are reproducible for the same transcript
	•	Feedback length within bounds and references at least 2 specific moments
	•	KPIs stored as typed JSON with units

⸻

6) Assignments, Tracks, Notifications

Assignments
	•	Manager or admin assigns scenario or track
	•	Due date optional
	•	Auto enrollment for new hires through team rules

Tracks
	•	Ordered list of scenarios
	•	Optional prerequisites and passing thresholds
	•	Completion status handled through child attempts

Notifications with Resend
	•	Trainee
	•	Assigned, Reminder 48 hours before due, Completion summary
	•	Manager
	•	Daily digest, Low score alert threshold, Overdue alert
	•	HR
	•	Weekly compliance export
	•	Templates stored as React Email in repo with per org branding

⸻

7) Integrations and Webhooks

Admin UI
	•	Add webhook endpoint: name, URL, secret, events, enabled
	•	Test button sends sample payload
	•	Delivery log with retries and manual replay

Events
	•	scenario.assigned
	•	scenario.completed
	•	track.completed
	•	attempt.scored.low (under threshold)
	•	user.added, user.removed

Payload baseline

{
  "event": "scenario.completed",
  "idempotency_key": "uuid",
  "org": {"id":"...", "name":"..."},
  "user": {"id":"...", "email":"...", "name":"...", "role":"trainee"},
  "scenario": {"id":"...", "title":"..."},
  "attempt": {
    "id":"...", "score":87, "duration_seconds":312,
    "kpis":{"talk_listen":"45:55","filler_words":3},
    "recording_url":"signed-url", "transcript_url":"signed-url"
  },
  "timestamp":"2025-09-20T21:12:33Z",
  "signature":"hmac-sha256=..."
}

Trigger controls
	•	Automatic by event type with optional filters
	•	Only send when score below threshold
	•	Only send for required trainings
	•	Manual send from attempt detail view

⸻

8) Reporting and Analytics

Dashboards v1
	•	Org overview
	•	Total attempts, active users, average score, completion rate
	•	Trend lines by week and month
	•	Team view
	•	Leaderboard by avg score, attempts, improvement
	•	Heatmap of KPI outliers
	•	Scenario analytics
	•	Avg score by scenario
	•	Top missed rubric items
	•	Distribution of talk to listen
	•	User profile
	•	Score trajectory, strengths, weaknesses
	•	Time spent, attempts per week
	•	Compliance view for HR
	•	Required assignment completion table
	•	Export CSV

Charts
	•	Line chart: avg score over time
	•	Bar chart: count of attempts by scenario
	•	Box plot: score distribution by team
	•	Stacked bar: KPI compliance rates
	•	Funnel: track progression drop offs

Queries
	•	All dashboards read from fact_* and materialized views
	•	Nightly refresh of MVs with on demand refresh after heavy activity
	•	Filters: date range, team, scenario, track

Exports and scheduling
	•	CSV export for any table view
	•	Scheduled email reports for managers and HR
	•	Signed links to recordings expire after configurable TTL

Product analytics
	•	PostHog events
	•	scenario_started, scenario_completed, feedback_viewed, assignment_created, webhook_failed
	•	Feature usage funnels for PM insights

⸻

9) QA, Security, Observability

Testing
	•	Unit tests for scoring functions and KPI detectors
	•	Contract tests for webhooks payload and signature
	•	E2E with Playwright for auth, assignment, attempt flow using mocked Vapi
	•	Load test transcript scoring to size cold starts and concurrency

Security
	•	RLS enforced on all tables
	•	Signed storage URLs with short expiry
	•	HMAC for outbound webhooks
	•	Stripe webhooks signature validation
	•	SSO readiness in Phase 2 through Clerk

Observability
	•	Sentry for exceptions
	•	OpenTelemetry traces on call start to score complete
	•	Structured logs for delivery attempts
	•	Alerting in PagerDuty or email for error rates and failed webhooks

⸻

10) Roadmap by Phase and Sprint

Phase 0: Foundation and billing scaffolding (2 sprints)

Sprint 1
	•	Repo, CI, Sentry, Env configs
	•	Clerk auth, org creation, invites
	•	Supabase schema and RLS
	•	Basic app shell and role nav

Sprint 2
	•	Stripe Checkout and Customer Portal
	•	Entitlements middleware
	•	Billing page and plan guardrails
	•	Seed org and member data

Phase 1: Scenario CRUD and assignments (2 sprints)

Sprint 3
	•	Scenario library list and create
	•	Rich form for persona, prompt, rubric JSON
	•	Versioning draft to active
	•	Upload assets to Storage

Sprint 4
	•	Tracks and track_scenarios
	•	Assignments UI with due date
	•	Trainee home with assigned list
	•	Email on assignment via Resend

Phase 2: Voice MVP and attempt lifecycle (3 sprints)

Sprint 5
	•	Vapi sandbox agent config
	•	Start call API and attempt row
	•	Web call UI: mic permissions, connect, timer
	•	Minimal post call screen

Sprint 6
	•	Vapi webhook for end of call
	•	Save recording, transcript
	•	Deterministic KPIs: duration, talk listen, filler words
	•	Basic scoring and feedback draft

Sprint 7
	•	Attempt details view with transcript highlights
	•	History page and playback
	•	Manager team view basic
	•	Daily digest email for managers

Phase 3: Reporting and leaderboards (2 sprints)

Sprint 8
	•	Facts pipeline and MVs
	•	Org overview dashboard
	•	Scenario analytics dashboard
	•	CSV export

Sprint 9
	•	Leaderboards by month and team
	•	Compliance dashboard for HR
	•	Scheduled email reports
	•	PostHog instrumentation

Phase 4: AI authoring and branching v1 (3 sprints)

Sprint 10
	•	AI generate scenario draft from prompt
	•	Editable rubric suggestions
	•	Guardrails and token budgeting

Sprint 11
	•	Branching editor MVP
	•	Runtime dispatcher for branch hints in prompt
	•	A/B prompt experiments per scenario

Sprint 12
	•	Sentiment and interruption detection
	•	Concept matching via embeddings
	•	Feedback improved with cited moments

Phase 5: Integrations and webhook manager (2 sprints)

Sprint 13
	•	Webhook endpoints CRUD, test send
	•	Event bus and delivery with retries
	•	Signing and delivery log UI

Sprint 14
	•	Trigger controls and filters
	•	Slack incoming webhook formatter option
	•	Manual send from attempt details

Phase 6: Admin polish and scale readiness (2 sprints)

Sprint 15
	•	Teams and manager scoping
	•	Bulk invite and CSV user import
	•	Email template branding per org

Sprint 16
	•	Load testing, performance tuning
	•	SLOs, alerts, runbooks
	•	Security review, pen test fixes

Go Live
	•	Pilot customer migration
	•	Uptime monitoring and on call runbook

⸻

11) Ticket Seeds by Area

Auth and org
	•	Implement Clerk org switcher with role claims
	•	Server action withOrg helper sets Postgres claim
	•	Invitations page with role selection, bulk invite CSV

Scenario authoring
	•	Scenario create form with schema validation
	•	Rubric JSON editor with live validation
	•	Versioning: copy-on-write to new row and maintain active_version_id

Assignments
	•	Assign modal with user, team, track selection
	•	Due date picker and notification preview
	•	Overdue badge logic

Voice player
	•	Mic setup state machine
	•	Call controls: connect, end, retry
	•	Live waveform and timer
	•	Error states with guidance

Scoring
	•	Utterance segmentation from transcript, with talk time math
	•	Filler words detector with language list
	•	Concept matcher using vector store in Supabase
	•	Score weights applied with audit log of components

Feedback
	•	Prompt template with strict length controls
	•	Feedback card with quick wins list
	•	Manager comments and approve flow

Reporting
	•	View composer with saved filters
	•	Chart components for score trends
	•	CSV generator with 100k row safety streaming

Webhooks
	•	HMAC signature generator
	•	Delivery retry exponential backoff
	•	Replay button with copy of original payload

⸻

12) Acceptance Criteria Summary
	•	A trainee can complete an assigned scenario in browser, receive a score and actionable feedback, and replay audio and transcript.
	•	A manager can assign a track to a team, monitor progress, and receive a daily digest.
	•	An admin can create a scenario, publish it, add it to a track, and configure a webhook that fires on completion with a signed payload.
	•	The reporting dashboard renders within 2 seconds for the last 30 days at 10k attempts scale, with accurate aggregates.
	•	All data is tenant isolated by org_id at the database layer with RLS tests passing.
	•	Billing blocks use beyond plan limits and surfaces upgrade path cleanly.

⸻

13) Post v1 Roadmap Highlights
	•	React Native app with Expo for trainees
	•	Real call coaching ingest from VOIP recordings
	•	Multi language scenarios through STT and TTS selection
	•	Scenario marketplace and sharing
	•	SSO SAML for Enterprise
	•	Custom report builder for admins

