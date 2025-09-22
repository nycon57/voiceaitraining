.
├─ public/
│  ├─ favicon.ico
│  ├─ og-image.png
│  └─ logos/
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx                     # Landing
│  │  │  ├─ pricing/page.tsx
│  │  │  ├─ features/page.tsx
│  │  │  ├─ terms/page.tsx
│  │  │  └─ privacy/page.tsx
│  │  ├─ (auth)/
│  │  │  ├─ layout.tsx                   # Minimal, no app chrome
│  │  │  ├─ sign-in/[[...sign-in]]/page.tsx
│  │  │  └─ sign-up/[[...sign-up]]/page.tsx
│  │  ├─ (authenticated)/
│  │  │  ├─ layout.tsx                   # Protected shell (Clerk)
│  │  │  └─ org/
│  │  │     └─ [orgId]/
│  │  │        ├─ layout.tsx             # Org context/switcher, breadcrumbs
│  │  │        ├─ dashboard/page.tsx
│  │  │        ├─ leaderboard/page.tsx
│  │  │        ├─ reports/page.tsx
│  │  │        ├─ team/page.tsx          # Manager overview
│  │  │        ├─ hr/
│  │  │        │  └─ compliance/page.tsx
│  │  │        ├─ users/page.tsx         # Admin: members/roles
│  │  │        ├─ scenarios/
│  │  │        │  ├─ page.tsx            # List
│  │  │        │  ├─ new/page.tsx        # Create
│  │  │        │  └─ [scenarioId]/
│  │  │        │     ├─ page.tsx         # Edit
│  │  │        │     └─ versions/page.tsx
│  │  │        ├─ tracks/
│  │  │        │  ├─ page.tsx
│  │  │        │  ├─ new/page.tsx
│  │  │        │  └─ [trackId]/page.tsx
│  │  │        ├─ assignments/
│  │  │        │  ├─ page.tsx
│  │  │        │  └─ new/page.tsx
│  │  │        ├─ attempts/
│  │  │        │  ├─ page.tsx            # History/search
│  │  │        │  └─ [attemptId]/page.tsx# Detail: transcript, feedback, playback
│  │  │        ├─ play/
│  │  │        │  └─ [scenarioId]/page.tsx   # Voice player (trainee)
│  │  │        └─ settings/
│  │  │           ├─ page.tsx             # Org settings overview
│  │  │           ├─ branding/page.tsx
│  │  │           ├─ notifications/page.tsx
│  │  │           ├─ billing/page.tsx
│  │  │           ├─ webhooks/page.tsx
│  │  │           └─ teams/page.tsx
│  │  └─ api/
│  │     ├─ calls/
│  │     │  └─ start/route.ts            # Start a Vapi call / create attempt
│  │     ├─ reports/
│  │     │  └─ export/route.ts           # CSV export (signed, RLS-checked)
│  │     ├─ storage/
│  │     │  └─ sign-url/route.ts         # Short-lived playback URLs
│  │     └─ webhooks/
│  │        ├─ stripe/route.ts           # Billing events
│  │        ├─ vapi/route.ts             # Call end, transcripts, recordings
│  │        └─ clerk/route.ts            # (Optional) user/org sync hooks
│  ├─ actions/                            # Server Actions (mutations)
│  │  ├─ org.ts
│  │  ├─ scenarios.ts
│  │  ├─ tracks.ts
│  │  ├─ assignments.ts
│  │  ├─ attempts.ts
│  │  ├─ scoring.ts
│  │  ├─ webhooks.ts
│  │  └─ billing.ts
│  ├─ components/
│  │  ├─ ui/                              # ShadCN generated components
│  │  ├─ nav/
│  │  ├─ shells/
│  │  ├─ charts/
│  │  ├─ tables/
│  │  ├─ forms/
│  │  ├─ player/                          # Call controls, mic states, timer
│  │  └─ transcript/                      # Viewer with highlights/annotations
│  ├─ emails/                             # Resend React emails
│  │  ├─ layout.tsx
│  │  ├─ assignment.tsx
│  │  ├─ completion.tsx
│  │  ├─ low-score-alert.tsx
│  │  └─ digest.tsx
│  ├─ lib/
│  │  ├─ auth.ts                          # Clerk helpers, role guards
│  │  ├─ supabase/
│  │  │  ├─ server.ts                     # Server client (RLS claims)
│  │  │  ├─ client.ts                     # Browser client (limited)
│  │  │  └─ storage.ts
│  │  ├─ ai/
│  │  │  ├─ llm.ts                        # Vercel AI SDK wrapper
│  │  │  ├─ prompts/
│  │  │  │  ├─ feedback.ts
│  │  │  │  └─ scenario-draft.ts
│  │  │  ├─ scoring.ts                    # Deterministic KPI calc
│  │  │  └─ kpi.ts
│  │  ├─ stripe.ts
│  │  ├─ vapi.ts
│  │  ├─ resend.ts
│  │  ├─ featureFlags.ts
│  │  ├─ logger.ts
│  │  └─ validation/
│  │     └─ schema.ts                     # Zod schemas
│  ├─ styles/
│  │  └─ globals.css
│  ├─ types/
│  │  ├─ env.d.ts
│  │  ├─ scenario.ts
│  │  ├─ attempt.ts
│  │  └─ webhook.ts
│  ├─ db/
│  │  ├─ migrations/
│  │  │  ├─ 0001_init.sql
│  │  │  └─ 0002_reporting.sql
│  │  └─ seed/seed.ts
│  └─ config/
│     └─ shadcn.json                      # components.json if you prefer
├─ middleware.ts                          # Clerk auth, tenant hints (cookies)
├─ next.config.mjs
├─ package.json
├─ postcss.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json
├─ .env.example
├─ .eslintrc.cjs
└─ .prettierrc

Notes / conventions
	•	Route groups keep concerns separated:
	•	(marketing) for public pages, (auth) for Clerk flows, (authenticated) for the app shell.
	•	Multi-tenancy is path-scoped: everything under /org/[orgId]/…. Gate access by role in src/lib/auth.ts and set RLS claims in src/lib/supabase/server.ts.
	•	API Route Handlers live in app/api/**/route.ts. Stripe/Vapi webhooks sit under /api/webhooks/*.
	•	Server Actions handle mutations and enforce org/role checks (src/actions/*), imported by RSC pages/forms.
	•	ShadCN/UI lives in components/ui. Keep feature components in their own folders (player, transcript, tables).
	•	Emails (Resend) are colocated in src/emails with a shared layout and org-branding tokens.
	•	Migrations are SQL-first for Supabase; seed scripts live in db/seed.
