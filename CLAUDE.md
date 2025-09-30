Audio Agent Sales Training – CLAUDE.MD

Project Overview

Audio Agent Sales Training is a SaaS platform that uses AI voice agents to simulate sales calls. It trains reps through realistic two-way audio scenarios, scores performance against global and scenario-specific KPIs, and gives managers enterprise-grade tracking, assignments, leaderboards, and reporting. Initial vertical: loan officers. Architecture supports industry-agnostic expansion.

⸻

Core Architecture

Technology Stack
	•	Frontend: Next.js 15.5 (App Router), TypeScript, Tailwind CSS 4.1, ShadCN/UI
	•	Backend: Supabase (PostgreSQL, RLS, Storage, Realtime)
	•	AI Integration: Vercel AI SDK for LLM orchestration and feedback generation
	•	Voice Layer: Vapi Web SDK (@vapi-ai/web) for telephony, real-time audio, STT, TTS, call control, recordings
	•	Authentication: Clerk with role-based access control (JWT claims integration)
	•	Email: Resend (email service ready, templates pending implementation)
	•	Payments: Stripe Checkout, Billing, Customer Portal
	•	Search: Orama for in-app search functionality
	•	Documentation: Fumadocs for MDX-based documentation
	•	UI Effects: Framer Motion, OGL for 3D graphics, custom pixel effects
	•	Observability: (Sentry and PostHog ready for production deployment)

Multi-Tenant Model
	•	Tenancy is org-scoped at the database level
	•	UI path: Direct authenticated routes under /(authenticated)/ without org prefix
	•	Clerk provides identity, JWT contains org_id and role claims
	•	Supabase RLS enforces org_id on all reads and writes
	•	Server Actions validate Clerk session and set Postgres jwt.claims.org_id at request time

⸻

Database Structure Summary

Core Tables
	•	Tenancy and Roles
	•	orgs — organization, plan, entitlements, Stripe customer id
	•	users — user profiles with clerk_user_id, email, first_name, last_name, phone, title, avatar_url, role (trainee, manager, admin, hr), team membership, status flags
	•	teams — team structure with manager_clerk_user_id assignments
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

Latest Migrations (Applied via Supabase MCP)
	•	0001_init.sql — base schema with orgs, members, scenarios, attempts
	•	0002_reporting.sql — analytics fact and dimension tables
	•	0003_articles.sql — knowledge base and blog content system (later removed)
	•	0004_clerk_jwt_integration.sql — JWT claims mapping for RLS
	•	0005_restructure_schema.sql — dropped articles system, dropped user_invitations, renamed org_members → users
	•	0006_update_functions_for_users_table.sql — updated database functions to reference users table
	•	0007_users_profile_columns.sql — restructured users table with dedicated profile columns, created avatars storage bucket
	•	0008_refactor_user_id_to_clerk_user_id.sql — renamed user_id → clerk_user_id across all tables; dropped invited_at, joined_at, phone_extension, department columns

Storage Buckets
	1.	recordings — audio files of attempts
	2.	transcripts — JSON and TXT transcripts
	3.	avatars — user profile photos with RLS policies (path: avatars/{org_id}/{clerk_user_id}.{ext})
	4.	org-assets — logos, brand assets for emails and UI
	5.	scenario-assets — attachments, images for authoring
	6.	exports — generated CSVs and scheduled report zips
	7.	tmp — short-lived artifacts

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

Database Workflow with Supabase MCP

IMPORTANT: When making database schema changes, use the Supabase MCP server to apply changes directly to the database. Local migration files serve as documentation but should NOT be the primary method of applying changes.

Workflow for Database Changes:
	1.	Discuss the desired schema changes with the user
	2.	Use the Supabase specialist agent (via Task tool) to:
		•	Analyze current schema and dependencies
		•	Propose the migration SQL
		•	Execute the migration directly using execute_sql
		•	Verify the changes with queries
	3.	Optionally save migration files locally for documentation purposes
	4.	Update CLAUDE.md to reflect the new schema

Key Supabase MCP Tools:
	•	list_projects — get project IDs and details
	•	get_project — check project status and configuration
	•	list_tables — view current schema
	•	list_extensions — check installed Postgres extensions
	•	execute_sql — run SQL queries and DDL statements directly
	•	apply_migration — apply named migrations (creates files in migrations table)
	•	list_migrations — view migration history
	•	get_advisors — get security and performance recommendations

Best Practices:
	•	Break large migrations into logical chunks (storage, tables, functions, indexes, etc.)
	•	Always verify changes after execution with SELECT queries
	•	Use IF EXISTS / IF NOT EXISTS for idempotent operations
	•	Check for foreign key dependencies before dropping tables
	•	Test data migration queries before applying constraints
	•	Use the supabase-specialist agent for complex schema changes

Users Table Structure (Current):
The users table has dedicated columns for all profile attributes:
	•	Core Identity: clerk_user_id (Clerk ID, text), id (UUID, PK), org_id (FK), role (enum)
	•	Profile: email, first_name, last_name, phone
	•	Organization: title, team_id (FK)
	•	Personalization: avatar_url (storage path), bio, timezone, locale
	•	Status: is_active, last_login_at
	•	Timestamps: created_at, updated_at (auto-maintained via trigger)

Related Tables Using clerk_user_id:
	•	scenario_attempts.clerk_user_id — FK to users.clerk_user_id
	•	assignments.assignee_clerk_user_id — FK to users.clerk_user_id
	•	teams.manager_clerk_user_id — FK to users.clerk_user_id (team manager)

Avatar Storage:
	•	Bucket: avatars (private, 5MB limit, images only)
	•	Path format: avatars/{org_id}/{clerk_user_id}.{ext}
	•	RLS policies enforce org-level isolation
	•	Access via signed URLs with short TTL

⸻

Development Guidelines

Code Standards
	•	TypeScript strict. No any unless justified
	•	Keep business rules in src/actions/** and src/lib/** not in React components
	•	Zod validation for all inputs to server actions and API handlers
	•	UI components in ShadCN style with accessibility defaults

Key Patterns
	•	Server Actions for mutations, enforce org and role guard in one place
	•	Route Groups: (marketing), (auth), (authenticated) - direct paths without org prefix
	•	Sidebar Navigation: AppSidebar component with role-based menu items and user context
	•	Command Menu: Global search and navigation (Cmd+K) via CommandMenu component
	•	Deterministic Scoring: all non-LLM metrics computed via pure functions for reproducibility
	•	LLM for Feedback: prompt templates generate concise feedback referencing transcript spans
	•	Event Bus: internal event emitter writes to webhook_deliveries, retry worker handles dispatch
	•	Loading States: LoadingSkeleton component for consistent loading UX across all views
	•	Empty States: EmptyState component for zero-state UX with contextual CTAs

File Structure Conventions

src/
  app/
    (marketing)/           # public pages: home, features, industries, resources, contact, about
      features/            # feature landing pages (ai-scoring, voice-simulation, analytics)
      industries/          # industry verticals (healthcare, tech-sales, mortgage, insurance)
      resources/[slug]/    # blog and knowledge base articles
    (auth)/                # sign-in, sign-up pages
    (authenticated)/       # protected app routes (direct, no org prefix)
      dashboard/           # main dashboard with role-based views
      scenarios/           # scenario management and authoring
        [scenarioId]/      # scenario detail and edit
        new/               # create new scenario
      play/[scenarioId]/   # voice training session player
      attempts/[attemptId]/ # attempt review and feedback
      training/            # training hub with sessions
        session/[sessionId]/review/
      tracks/              # learning track management
      assignments/         # assignment creation and tracking
      team/                # team management and roster
      leaderboard/         # performance leaderboards
      analytics/           # analytics and insights
      billing/             # subscription and billing
      settings/            # user settings
        profile/
        preferences/
        webhooks/
      admin/               # admin-only features
        users/
        design-system/
    api/
      webhooks/            # stripe, vapi, clerk webhooks
        clerk/
      calls/               # call session management
      chat/                # AI chat endpoints
      test-jwt/            # JWT debugging endpoints
  actions/                 # server actions for mutations
    admin.ts               # user management, org settings
    attempts.ts            # attempt CRUD, scoring triggers
    billing.ts             # stripe integration, subscription management
    org.ts                 # org metadata operations
    scenarios.ts           # scenario CRUD
    webhooks.ts            # webhook config and delivery
  components/
    admin/                 # admin UI components
      design-system/       # living design system documentation
    analytics/             # charts and analytics widgets
    attempts/              # attempt cards, lists, player
    billing/               # plan selector, usage metrics, billing overview
    charts/                # reusable chart components (recharts wrappers)
    dashboard/             # dashboard shells and layouts
      cards/               # metric cards, stat widgets
      charts/              # dashboard-specific charts
      layouts/             # layout components
      app-sidebar.tsx      # main navigation sidebar
      *-overview.tsx       # role-based dashboard views
    layout/                # global layout (header, footer, logo, nav)
    player/                # voice call player UI
    pricing/               # pricing tables and CTAs
    resources/             # blog/article components
    scenarios/             # scenario forms, lists, cards
    sections/              # marketing page sections
    tables/                # data tables
    training/              # training session components
    transcript/            # transcript viewer and highlighter
    ui/                    # shadcn/ui primitives
      __tests__/           # component unit tests
      loading-skeleton.tsx # loading state component
      empty-state.tsx      # zero-state component
      pixel-*.tsx          # custom pixel effect backgrounds
    voice/                 # vapi integration components
    webhooks/              # webhook manager UI
    command-menu.tsx       # global command palette
  lib/
    ai/                    # llm wrapper, prompts, scoring utils
      prompts/             # prompt templates
    supabase/              # server and client helpers, storage
      server.ts
      client.ts
    utils/                 # utility functions
      dashboard-utils.ts   # dashboard-specific helpers
    analytics.ts           # analytics client wrapper
    articles.ts            # article fetching and parsing
    auth.ts                # Clerk guards and role helpers
    clerk-theme.ts         # Clerk UI theming
    stripe.ts              # Stripe client and webhooks
    vapi.ts                # Vapi SDK wrapper
    webhooks.ts            # webhook signing and validation
    utils.ts               # shared utilities (cn, formatters, etc.)
  db/
    migrations/            # SQL migrations (numbered 0001-0004+)
    seed/                  # seed data scripts
  emails/                  # Resend React Email templates (pending implementation)
  styles/
    globals.css
  types/
    supabase.ts            # generated types from Supabase schema
  validation/              # Zod schemas for forms and API


⸻

UI Component Library

Core UI Components (ShadCN/UI Based)
	•	Forms: Input, Textarea, Select, Checkbox, Radio, Switch, Slider, DatePicker
	•	Layout: Card, Separator, Accordion, Tabs, Collapsible, Resizable Panels
	•	Overlays: Dialog, Sheet, Drawer, Popover, Hover Card, Alert Dialog, Command Menu
	•	Navigation: Breadcrumb, Menubar, Navigation Menu, Sidebar, Dropdown Menu
	•	Feedback: Alert, Toast (Sonner), Progress, Loading Skeleton, Badge
	•	Data Display: Table, Avatar, Calendar, Chart (Recharts), Empty State
	•	Buttons: Button, Copy Button, Toggle, Toggle Group
	•	Advanced: OTP Input, Carousel (Embla), Context Menu

Custom Components
	•	LoadingSkeleton — flexible skeleton loader with variants for cards, tables, forms
	•	EmptyState — zero-state component with icon, title, description, and CTA
	•	PixelBackground — animated pixel effect background for marketing pages
	•	PixelBlast — burst animation effect for interactions
	•	CommandMenu — global Cmd+K search and navigation palette
	•	AppSidebar — collapsible sidebar with role-based navigation and user menu
	•	Terminal — code block with syntax highlighting for documentation

Dashboard Components
	•	MetricCard — stat display with trend indicator and sparkline
	•	PerformanceChart — line/bar charts for attempt scores and KPIs
	•	LeaderboardTable — ranked table with avatars and scores
	•	ActivityFeed — timeline of recent attempts and assignments
	•	RecentAttempts — grid of attempt cards with quick actions
	•	UpcomingAssignments — list of due assignments with progress

Role-Based Dashboard Views
	•	TraineeOverview (src/components/dashboard/trainee-overview.tsx) — personal stats, assignments, recent attempts
	•	ManagerOverview (src/components/dashboard/manager-overview.tsx) — team performance, assignment tracking, leaderboard
	•	AdminOverview (src/components/dashboard/admin-overview.tsx) — org metrics, user management, system health
	•	HROverview (src/components/dashboard/hr-overview.tsx) — compliance, completion rates, certification tracking

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

Marketing Site Features
	•	Multi-page marketing site with industry verticals
	•	Feature pages: AI Scoring, Voice Simulation, Analytics
	•	Industry pages: Healthcare, Tech Sales, Mortgage/Loan Officers, Insurance
	•	Knowledge base with article system (MDX-based)
		•	Article categories and tags
		•	Featured articles and recommendations
		•	Table of contents auto-generation
		•	Share buttons and SEO meta tags
	•	Pricing page with plan comparison
	•	Contact form with validation
	•	About page with mission, problem, solution, value stack
	•	Animated sections with scroll effects and transitions

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
	•	Server Actions: primary mutation surface with org guard and Zod validation (see src/actions/*)
	•	Route Handlers:
		•	/api/webhooks/stripe — Stripe event handling
		•	/api/webhooks/vapi — Vapi call event handling
		•	/api/webhooks/clerk — Clerk user sync
		•	/api/calls/* — call session lifecycle
		•	/api/chat — AI chat completions
		•	/api/test-jwt — JWT claims debugging
	•	Signed URLs: Generated via Supabase Storage SDK for playback of recordings and transcript files

⸻

Development Phases
	1.	✅ Foundation (COMPLETE)
	•	Auth with Clerk, JWT claims integration
	•	Base schema with RLS policies
	•	App shell with sidebar navigation and command menu
	•	Billing scaffolding with Stripe
	•	Loading skeleton and empty state components
	2.	✅ Dashboard and UX (COMPLETE)
	•	Role-based dashboard views (admin, manager, trainee, HR)
	•	Sidebar navigation with user context
	•	Command menu (Cmd+K) global search
	•	Settings pages (profile, preferences, webhooks)
	•	Design system documentation
	3.	🚧 Content and Assignment (IN PROGRESS)
	•	Scenario CRUD, tracks, assignments
	•	Articles and knowledge base system
	•	Trainee training hub
	4.	⏳ Voice MVP (PENDING)
	•	Vapi agent config, call start and end
	•	Transcripts and recordings with storage
	•	Basic KPIs and scoring
	•	Attempt review and feedback
	5.	⏳ Reporting v1 (PENDING)
	•	Facts, MVs, dashboards, exports
	•	Leaderboards, analytics views
	•	HR compliance reporting
	6.	⏳ AI Authoring and Branching (PENDING)
	•	Scenario generator, rubric suggestions
	•	Branching editor and dispatcher
	7.	⏳ Integrations (PENDING)
	•	Webhook manager, delivery retries
	•	Slack and email notifications
	8.	⏳ Scale and Security (PENDING)
	•	Load tests, SLOs, alerts
	•	Security audit, pen test fixes

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
	•	CLAUDE.md — this file, primary project reference for AI assistants
	•	DASHBOARD_REDESIGN_PROGRESS.md — dashboard implementation tracking
	•	WORLD_CLASS_DASHBOARD_COMPLETE.md — dashboard completion notes
	•	SETTINGS_PAGES_COMPLETE.md — settings implementation tracking
	•	LOADING_SKELETON_IMPLEMENTATION.md — loading state component guide
	•	src/components/ui/LOADING_SKELETON_README.md — loading skeleton usage guide
	•	test-rls.md — RLS testing notes and queries

Future Documentation (as needed)
	•	PRD.md — product requirements and user flows
	•	ROADMAP.md — phased plan and sprint slices
	•	DB_SCHEMA.md — detailed tables, RLS, functions reference
	•	AI_PROMPTS.md — LLM prompt libraries and constraints
	•	INTEGRATIONS.md — webhooks, Stripe, Vapi, Resend integration details
	•	REPORTING.md — facts, MVs, dashboards schema
	•	SECURITY.md — auth, RLS, secrets, storage model deep dive
	•	RUNBOOKS.md — on-call, incident playbooks

⸻

Development Commands

# Dev server
pnpm dev

# Quality gates
pnpm lint
pnpm typecheck
pnpm verify       # runs lint, typecheck, build

# Build and start
pnpm build
pnpm start

# Supabase types (if needed)
npx supabase gen types typescript \
  --project-id $SUPABASE_PROJECT_ID > src/types/supabase.ts

# Add ShadCN components
npx shadcn@latest add [component-name]

# Clear build cache
rm -rf .next node_modules/.cache

# Check running dev servers
lsof -i :3000

# Kill process on port 3000
lsof -ti :3000 | xargs kill


⸻

Environment Setup

Required Variables
	•	App
	•	NEXT_PUBLIC_APP_URL — base URL for absolute links and redirects
	•	Supabase
	•	NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
	•	NEXT_PUBLIC_SUPABASE_ANON_KEY — public anon key for client
	•	SUPABASE_SERVICE_ROLE_KEY — service role key for server operations
	•	Clerk
	•	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY — public key for Clerk client
	•	CLERK_SECRET_KEY — secret key for server-side Clerk operations
	•	CLERK_WEBHOOK_SECRET — for validating Clerk webhook signatures
	•	Stripe
	•	STRIPE_SECRET_KEY — Stripe API secret key
	•	STRIPE_WEBHOOK_SECRET — for validating Stripe webhook signatures
	•	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — public key for Stripe Elements
	•	NEXT_PUBLIC_STRIPE_PRICE_STARTER — price ID for starter plan
	•	NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL — price ID for pro plan
	•	NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE — price ID for enterprise plan
	•	Email
	•	RESEND_API_KEY — Resend API key (ready, templates pending)
	•	EMAIL_FROM — default sender email address
	•	AI
	•	OPENAI_API_KEY — for AI chat and scenario generation
	•	DEEPGRAM_API_KEY — for STT (future voice integration)
	•	ELEVENLABS_API_KEY — for TTS (future voice integration)
	•	Vapi
	•	VAPI_API_KEY — Vapi API key (pending voice integration)
	•	VAPI_WEBHOOK_SECRET — for validating Vapi webhook signatures
	•	NEXT_PUBLIC_VAPI_PUBLIC_KEY — public key for Vapi Web SDK
	•	Security
	•	WEBHOOK_DEFAULT_SECRET — default HMAC secret for custom webhooks
	•	ENCRYPTION_KEY — optional, for encrypting stored PII

⸻

Common Issues and Solutions
	1.	Mic permission blocked
	•	Ensure HTTPS origin and correct browser prompt handling. Local dev: use localhost (secure context enabled)
	2.	RLS query failures
	•	Verify JWT claims are set in Clerk token and propagated to Supabase
	•	Check org_id in jwt.claims via test-jwt endpoint
	•	Ensure user has users record with correct org_id
	3.	Stripe webhook 400
	•	Confirm correct endpoint secret and raw body parsing in route handler
	•	Verify Stripe CLI forwarding or production webhook URL
	4.	Clerk session not found in middleware
	•	Ensure middleware matcher includes the route
	•	Check public route matcher config
	5.	Vapi transcript missing (future)
	•	Fallback to post-call STT with Whisper or Deepgram batch API, then recompute KPIs
	6.	Signed URL expired
	•	Regenerate via Supabase Storage SDK with short TTL; do not store public URLs
	7.	ShadCN component import errors
	•	All UI imports from @/components/ui/*; re-run npx shadcn@latest add [component] if needed
	8.	TypeScript errors after dependency updates
	•	Run pnpm typecheck to verify
	•	Clear .next and node_modules/.cache if stale
	9.	Background bash shells hanging
	•	Multiple dev servers may be running; check with lsof -i :3000 and kill if needed

⸻

Performance Optimization Notes
	•	Prefer Server Components and Server Actions, keep client components minimal
	•	Use unstable_cache for scenario library and org config
	•	Batch inserts for attempts and KPI events, then refresh MVs
	•	Debounce leaderboard queries and paginate attempts
	•	Pre-sign storage links in parallel with feedback generation

⸻

Project Status

Foundation complete with authentication, database schema, and world-class dashboard UI. Marketing site with industry verticals and knowledge base system implemented. Voice simulation and scoring engine in progress. Stack is production-ready and supports multi-tenant enterprise use.

Current Sprint Focus
	•	Complete scenario authoring flow
	•	Implement Vapi voice session integration
	•	Build attempt review and feedback system
	•	Add assignment and track management

⸻

Architecture Decisions

Routing Architecture
	•	Changed from /org/[orgId]/* to direct /(authenticated)/* routes for cleaner URLs
	•	Org context derived from Clerk JWT claims instead of URL parameter
	•	Middleware handles authentication and redirects based on Clerk session
	•	Public routes explicitly allowed via isPublicRoute matcher

Authentication Flow
	1.	User signs in via Clerk (email/password, OAuth, magic link)
	2.	Clerk issues JWT with custom claims: org_id, role
	3.	Middleware validates session and allows/blocks routes
	4.	Server actions extract claims from Clerk session
	5.	Supabase RLS enforces org_id via jwt.claims.org_id setting
	6.	Database queries automatically scoped to user's org

State Management
	•	Server Components by default for data fetching
	•	Client Components only when needed for interactivity
	•	React Context for sidebar state (SidebarProvider)
	•	URL state for filters and pagination
	•	Server Actions for mutations with automatic revalidation
	•	Optimistic updates where appropriate

Styling Approach
	•	Tailwind CSS 4.1 with design tokens
	•	ShadCN/UI for consistent component API
	•	CSS variables for theming (light/dark mode ready)
	•	Framer Motion for animations
	•	Responsive-first design (mobile, tablet, desktop)

Performance Strategy
	•	Server Components reduce client JS bundle
	•	Code splitting via Next.js App Router
	•	Image optimization with next/image
	•	Font optimization with next/font
	•	Incremental Static Regeneration for marketing pages
	•	Streaming for slow data fetches
	•	React Suspense boundaries for granular loading states

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
