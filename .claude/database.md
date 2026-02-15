# Database & Supabase

## Supabase MCP — CRITICAL

**NEVER use manual Supabase CLI commands. ALWAYS use Supabase MCP tools for ALL database operations:**

| Operation | MCP Tool |
|-----------|----------|
| Migrations | `mcp__supabase__apply_migration` |
| SQL queries / schema changes / RLS | `mcp__supabase__execute_sql` |
| TypeScript types (after schema changes) | `mcp__supabase__generate_typescript_types` |
| List tables | `mcp__supabase__list_tables` |
| Logs | `mcp__supabase__get_logs` |
| Advisors | `mcp__supabase__get_advisors` |
| Storage / Edge Functions | Corresponding MCP tools |

## Core Tables

### Tenancy and Roles
- `orgs` — organization, plan, entitlements, Stripe customer id
- `org_members` — user membership and role: trainee, manager, admin, hr

### Training Content
- `scenarios` — title, persona, difficulty, ai_prompt, branching JSON, rubric JSON, status
- `tracks` — grouped curricula
- `track_scenarios` — ordered mapping of scenarios in a track

### Assignments and Attempts
- `assignments` — scenario or track assignment to a user or team with due date
- `scenario_attempts` — one attempt per call: timings, recording, transcript, KPIs, score, breakdown

### Integrations
- `webhooks` — endpoints per org with events, secret, enabled
- `webhook_deliveries` — event payload, status, retries, response details

### Reporting Star Schema
- `fact_scenario_attempts` — attempt facts for analytics
- `fact_kpi_events` — optional granular KPI events
- `dim_users`, `dim_scenarios`, `dim_tracks`, `dim_time`, `dim_orgs`
- Materialized views: `mv_leaderboard_month`, `mv_org_overview`, `mv_scenario_insights`

## Storage Buckets

1. `recordings` — audio files of attempts
2. `transcripts` — JSON and TXT transcripts
3. `org-assets` — logos, brand assets for emails and UI
4. `scenario-assets` — attachments, images for authoring
5. `exports` — generated CSVs and scheduled report zips
6. `tmp` — short-lived artifacts

## Key Database Functions

- `set_org_claim(org_id uuid)` — set `jwt.claims.org_id` for RLS in server actions
- `compute_kpis(transcript jsonb)` — returns deterministic KPI JSON
- `score_attempt(attempt_id uuid)` — applies rubric weights, writes score and score_breakdown
- `refresh_reporting()` — refreshes MVs post batch updates
- `grant_signed_url(path text, ttl int)` — returns short-lived signed URL for playback/download
- `enqueue_webhook(event text, payload jsonb)` — persists and schedules delivery with backoff

## Security and RLS

- RLS enabled on all tenant tables. Policies restrict by `org_id = current_setting('jwt.claims.org_id')::uuid`
- Storage read via signed URLs with short TTL
- Outbound webhooks signed with HMAC SHA-256 using per-endpoint secret
- Stripe and Clerk inbound webhooks validated against signatures
