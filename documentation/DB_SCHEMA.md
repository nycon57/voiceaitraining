# Database Schema Documentation

## Overview

The Voice AI Training platform uses PostgreSQL (via Supabase) with Row Level Security (RLS) to enforce multi-tenant data isolation. All tables are org-scoped, ensuring users can only access data from their organization.

**Current Migration Version**: 0004_clerk_jwt_integration
**Last Updated**: September 29, 2025

---

## Core Tables

### orgs

Organizations are the top-level tenant boundary. Each org has a subscription plan and Stripe customer ID.

```sql
create table orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_customer_id text,
  plan text not null default 'pro',
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Fields**:
- `id`: Unique org identifier, stored in Clerk JWT claims
- `name`: Organization display name
- `stripe_customer_id`: Links to Stripe for billing
- `plan`: Subscription tier (starter, pro, enterprise)
- `metadata`: Extensible JSON for custom org settings

**Indexes**:
- Primary key on `id`
- Unique index on `stripe_customer_id`

**RLS Policy**: Users can only see their own org (`org_id` from JWT claims)

---

### org_members

Maps users to organizations with roles. A user can belong to multiple orgs.

```sql
create type user_role as enum ('trainee','manager','admin','hr');

create table org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  user_id text not null, -- Clerk user id
  role user_role not null,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(org_id, user_id)
);
```

**Fields**:
- `org_id`: Foreign key to orgs
- `user_id`: Clerk user ID (not a foreign key, external system)
- `role`: User's role within this org
  - **trainee**: Can take assignments and view own attempts
  - **manager**: Can assign scenarios and view team performance
  - **admin**: Full access to org settings, scenarios, users
  - **hr**: View compliance and completion reports
- `metadata`: Custom fields per user (avatar, phone, etc.)

**Indexes**:
- Primary key on `id`
- Unique composite index on `(org_id, user_id)`

**RLS Policy**: Scoped by org_id from JWT claims

---

### scenarios

Training scenarios define the conversation persona, difficulty, AI prompts, and scoring rubrics.

```sql
create table scenarios (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  title text not null,
  description text,
  persona jsonb,              -- {role:"client", profile:{name, background}}
  difficulty text,            -- "easy", "medium", "hard"
  ai_prompt text,             -- System prompt for LLM
  branching jsonb,            -- Graph nodes/edges for conditional logic
  rubric jsonb,               -- {criteria:[{name,weight,threshold}]}
  status text default 'draft', -- draft, active, archived
  created_by text,            -- Clerk user ID
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Fields**:
- `persona`: JSON defining the AI character's role, background, and personality
- `ai_prompt`: Full system prompt sent to LLM at call start
- `branching`: Optional decision tree for dynamic conversation paths
- `rubric`: Scoring criteria with weights (sum to 1.0)
- `status`: Lifecycle state (only `active` scenarios are assignable)

**Example Persona JSON**:
```json
{
  "role": "Home Buyer",
  "name": "Sarah Thompson",
  "background": "First-time buyer, nervous about rates",
  "objections": ["Rate too high", "Down payment concerns"],
  "personality": "Cautious but eager"
}
```

**Example Rubric JSON**:
```json
{
  "criteria": [
    {"name": "Rapport Building", "weight": 0.25, "description": "Did they establish trust?"},
    {"name": "Objection Handling", "weight": 0.3, "description": "Addressed concerns effectively"},
    {"name": "Call to Action", "weight": 0.25, "description": "Clear next steps provided"},
    {"name": "Professionalism", "weight": 0.2, "description": "Tone and language"}
  ]
}
```

**Indexes**:
- Primary key on `id`
- Index on `(org_id, status)` for listing active scenarios

**RLS Policy**: Scoped by org_id

---

### tracks

Learning tracks group multiple scenarios into ordered curricula.

```sql
create table tracks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table track_scenarios (
  track_id uuid references tracks(id) on delete cascade not null,
  scenario_id uuid references scenarios(id) on delete cascade not null,
  position int not null,
  primary key(track_id, scenario_id)
);
```

**Fields**:
- `track.status`: active, archived
- `track_scenarios.position`: Order of scenarios in the track (1, 2, 3...)

**Indexes**:
- Primary key on `track.id`
- Composite primary key on `track_scenarios(track_id, scenario_id)`

**RLS Policy**: Tracks scoped by org_id, track_scenarios inherit via join

---

### assignments

Assignments link scenarios or tracks to users with due dates.

```sql
create table assignments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  assignee_user_id text not null,
  type text not null, -- 'scenario' or 'track'
  scenario_id uuid references scenarios(id),
  track_id uuid references tracks(id),
  due_at timestamptz,
  required boolean default true,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Fields**:
- `type`: Either "scenario" or "track"
- `scenario_id` or `track_id`: One must be set based on type
- `due_at`: Optional deadline for completion
- `required`: If true, manager sees warnings if not completed

**Indexes**:
- Primary key on `id`
- Index on `(org_id, assignee_user_id)` for user's assignment list

**RLS Policy**: Scoped by org_id

---

### scenario_attempts

Records of voice training sessions. Each call creates one attempt.

```sql
create table scenario_attempts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  user_id text not null,
  scenario_id uuid references scenarios(id),
  assignment_id uuid references assignments(id),
  vapi_call_id text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_seconds int,
  recording_url text,             -- Signed URL from Supabase Storage
  transcript_text text,           -- Plain text transcript
  transcript_json jsonb,          -- Structured with speaker, timestamp
  score numeric,                  -- Final score 0-100
  score_breakdown jsonb,          -- Per-criterion scores
  kpis jsonb,                     -- Computed metrics (talk/listen, fillers, etc.)
  status text not null default 'in_progress',
  feedback_text text,             -- AI-generated feedback
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Fields**:
- `vapi_call_id`: External ID from Vapi for debugging
- `recording_url`: Signed URL to audio file (short TTL, regenerate on demand)
- `transcript_json`: Array of utterances with speaker labels and timestamps
- `score`: Weighted average of rubric criteria (0-100 scale)
- `score_breakdown`: Object mapping criterion name to score
- `kpis`: Computed during/after call (see KPI section below)
- `status`: in_progress, completed, failed, abandoned

**Example Transcript JSON**:
```json
[
  {
    "speaker": "user",
    "text": "Hi Sarah, thanks for reaching out about rates.",
    "start_ms": 0,
    "end_ms": 2400
  },
  {
    "speaker": "assistant",
    "text": "I'm really worried about the rate going up.",
    "start_ms": 2500,
    "end_ms": 4800
  }
]
```

**Example KPIs JSON**:
```json
{
  "talk_ms": 45000,
  "listen_ms": 55000,
  "talk_listen_ratio": "45:55",
  "filler_words": 3,
  "interruptions": 1,
  "questions_asked": 7,
  "words_per_minute": 145,
  "sentiment_score": 0.8
}
```

**Indexes**:
- Primary key on `id`
- Index on `(org_id, user_id, started_at desc)` for user history
- Index on `(org_id, scenario_id, ended_at)` for scenario analytics

**RLS Policy**: Scoped by org_id

---

### articles

Knowledge base articles for marketing and help content.

```sql
create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  content text not null,         -- MDX content
  category text not null,
  tags text[],
  author text,
  published_at timestamptz,
  featured boolean default false,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Fields**:
- `slug`: URL-friendly identifier (e.g., "how-to-train-loan-officers")
- `content`: MDX format for rich content
- `category`: "blog", "guide", "case-study", "announcement"
- `tags`: Array for filtering (["sales", "loan officers", "training"])
- `featured`: Show on homepage or resources page

**Indexes**:
- Primary key on `id`
- Unique index on `slug`
- Index on `category` for filtering

**RLS Policy**: Public read (no policy, or policy allowing all)

---

### webhooks

Webhook endpoints configured per org for event notifications.

```sql
create table webhooks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  name text not null,
  url text not null,
  secret text not null,          -- HMAC secret for signing
  enabled boolean default true,
  events text[] not null,         -- ['scenario.completed', 'track.completed']
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid references webhooks(id) on delete cascade not null,
  event text not null,
  payload jsonb not null,
  status text not null,           -- pending, success, failed
  response_status int,
  response_body text,
  attempted_at timestamptz default now(),
  retry_count int default 0,
  next_retry_at timestamptz
);
```

**Webhook Events**:
- `scenario.assigned`
- `scenario.completed`
- `attempt.scored.low` (configurable threshold)
- `track.completed`
- `user.added`
- `user.promoted`
- `assignment.overdue`

**Delivery Logic**:
- Retry on 5xx or timeout (up to 5 retries)
- Exponential backoff: 1min, 5min, 30min, 2hr, 12hr
- HMAC-SHA256 signature in `X-Webhook-Signature` header
- Idempotency key in payload to prevent double processing

**Indexes**:
- Primary key on `webhook.id`
- Index on `webhook_deliveries.status` for retry queue
- Index on `webhook_deliveries.next_retry_at` for scheduler

**RLS Policy**: Scoped by org_id

---

## Reporting Tables

### fact_scenario_attempts

Denormalized fact table for fast analytics queries. Populated via trigger when attempts are completed.

```sql
create table fact_scenario_attempts (
  attempt_id uuid primary key,
  org_id uuid not null,
  user_id text not null,
  scenario_id uuid,
  score numeric,
  duration_seconds int,
  talk_ms int,
  listen_ms int,
  started_at timestamptz,
  ended_at timestamptz,
  date_key date generated always as (started_at::date) stored,
  created_at timestamptz default now()
);
```

**Purpose**: Optimized for BI queries and dashboards. Avoids joins and complex JSON extraction.

**Indexes**:
- Primary key on `attempt_id`
- Index on `(org_id, date_key)` for time-series queries
- Index on `(org_id, user_id, date_key)` for user trends
- Index on `(org_id, scenario_id)` for scenario analytics

**Populated By**: Trigger on `scenario_attempts` when `status` changes to 'completed'

---

### fact_kpi_events

Granular KPI events for detailed analysis (optional, high volume).

```sql
create table fact_kpi_events (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references scenario_attempts(id) on delete cascade,
  org_id uuid not null,
  user_id text not null,
  scenario_id uuid,
  event_type text not null, -- 'filler_word', 'interruption', 'question_asked'
  event_value jsonb,
  timestamp_ms int,         -- Milliseconds from start of call
  created_at timestamptz default now()
);
```

**Event Types**:
- `filler_word`: {word: "um"}
- `interruption`: {speaker: "user"}
- `question_asked`: {type: "open"}
- `objection_raised`: {objection: "price"}
- `keyword_mentioned`: {keyword: "rate lock"}

**Use Cases**:
- Drill-down analysis on specific behaviors
- Heatmaps of when events occur in calls
- Cohort analysis by event patterns

**Indexes**:
- Primary key on `id`
- Index on `(attempt_id)` for per-call event retrieval
- Index on `(org_id, event_type)` for event-specific queries

---

### Dimension Tables

```sql
create table dim_users (
  user_id text primary key,
  org_id uuid not null,
  name text,
  email text,
  role user_role,
  created_at timestamptz,
  updated_at timestamptz default now()
);

create table dim_scenarios (
  scenario_id uuid primary key,
  org_id uuid not null,
  title text,
  difficulty text,
  category text,
  created_at timestamptz,
  updated_at timestamptz default now()
);

create table dim_tracks (
  track_id uuid primary key,
  org_id uuid not null,
  title text,
  scenario_count int,
  created_at timestamptz,
  updated_at timestamptz default now()
);

create table dim_time (
  date_key date primary key,
  year int,
  quarter int,
  month int,
  week int,
  day_of_week int,
  day_of_month int,
  day_of_year int,
  is_weekend boolean
);

create table dim_orgs (
  org_id uuid primary key,
  name text,
  plan text,
  created_at timestamptz,
  updated_at timestamptz default now()
);
```

**Purpose**: Provide context for fact table queries, enable rich reporting with human-readable labels.

**Population**: Synced from core tables or populated manually for external dimensions (dim_time).

---

### Materialized Views

#### mv_leaderboard_month

```sql
create materialized view mv_leaderboard_month as
select
  org_id,
  user_id,
  date_trunc('month', started_at) as month,
  avg(score) as avg_score,
  count(*) as attempts,
  sum(duration_seconds) as total_duration,
  avg(talk_ms::float / (talk_ms + listen_ms) * 100) as avg_talk_percentage
from fact_scenario_attempts
where score is not null
group by org_id, user_id, date_trunc('month', started_at);
```

**Usage**: Power monthly leaderboards, refresh nightly.

---

#### mv_org_overview

```sql
create materialized view mv_org_overview as
select
  org_id,
  count(distinct user_id) as active_users,
  count(*) as total_attempts,
  avg(score) as avg_score,
  max(ended_at) as last_activity,
  count(*) filter (where ended_at >= now() - interval '7 days') as attempts_this_week,
  count(*) filter (where ended_at >= now() - interval '30 days') as attempts_this_month
from fact_scenario_attempts
where ended_at is not null
group by org_id;
```

**Usage**: Admin dashboard org-wide metrics.

---

#### mv_scenario_insights

```sql
create materialized view mv_scenario_insights as
select
  org_id,
  scenario_id,
  count(*) as attempt_count,
  avg(score) as avg_score,
  stddev(score) as score_stddev,
  avg(duration_seconds) as avg_duration,
  percentile_cont(0.5) within group (order by score) as median_score,
  max(ended_at) as last_attempted
from fact_scenario_attempts
where score is not null
group by org_id, scenario_id;
```

**Usage**: Scenario performance analysis, identify hard scenarios.

---

## Database Functions

### set_org_claim(org_id uuid)

Helper to set JWT claims for RLS context in server actions.

```sql
create or replace function set_org_claim(org_id uuid)
returns void as $$
begin
  perform set_config('jwt.claims.org_id', org_id::text, true);
end;
$$ language plpgsql security definer;
```

**Usage**:
```typescript
await supabase.rpc('set_org_claim', { org_id: user.orgId })
```

---

### populate_fact_from_attempt(attempt_id uuid)

Copies completed attempt into fact table for analytics.

```sql
create or replace function populate_fact_from_attempt(attempt_id uuid)
returns void as $$
declare
  attempt_row scenario_attempts%rowtype;
begin
  select * into attempt_row from scenario_attempts where id = attempt_id;

  if attempt_row.id is not null and attempt_row.ended_at is not null then
    insert into fact_scenario_attempts (
      attempt_id, org_id, user_id, scenario_id, score, duration_seconds,
      talk_ms, listen_ms, started_at, ended_at
    ) values (
      attempt_row.id, attempt_row.org_id, attempt_row.user_id, attempt_row.scenario_id,
      attempt_row.score, attempt_row.duration_seconds,
      coalesce((attempt_row.kpis->>'talk_ms')::int, 0),
      coalesce((attempt_row.kpis->>'listen_ms')::int, 0),
      attempt_row.started_at, attempt_row.ended_at
    )
    on conflict (attempt_id) do update set
      score = excluded.score,
      duration_seconds = excluded.duration_seconds,
      talk_ms = excluded.talk_ms,
      listen_ms = excluded.listen_ms,
      ended_at = excluded.ended_at;
  end if;
end;
$$ language plpgsql security definer;
```

**Triggered By**: Update on `scenario_attempts` when status changes to 'completed'.

---

### refresh_reporting_views()

Refreshes all materialized views for up-to-date dashboards.

```sql
create or replace function refresh_reporting_views()
returns void as $$
begin
  refresh materialized view mv_leaderboard_month;
  refresh materialized view mv_org_overview;
  refresh materialized view mv_scenario_insights;
end;
$$ language plpgsql security definer;
```

**Schedule**: Nightly cron job + on-demand via admin UI.

---

## Row Level Security (RLS)

All tables have RLS enabled. Policies enforce org-scoped access via JWT claims.

**Policy Pattern**:
```sql
create policy "table_name_policy" on table_name
  using (org_id = current_setting('jwt.claims.org_id', true)::uuid);
```

**How It Works**:
1. User authenticates via Clerk
2. Clerk JWT includes custom claim: `org_id`
3. Supabase middleware extracts and sets `jwt.claims.org_id` in Postgres session
4. All queries automatically filtered by RLS policies
5. Server actions explicitly call `set_org_claim()` for service role queries

**Testing RLS**:
```sql
-- Simulate org context
select set_org_claim('12345678-1234-1234-1234-123456789012');

-- This will only return scenarios for the set org
select * from scenarios;
```

---

## Storage Buckets

| Bucket | Purpose | Public | RLS |
|--------|---------|--------|-----|
| recordings | Audio files from attempts | No | Authenticated users, org-scoped |
| transcripts | JSON/TXT transcripts | No | Authenticated users, org-scoped |
| org-assets | Logos, brand images | No | Org admins only |
| scenario-assets | Persona images, attachments | No | Authenticated users |
| exports | CSV exports, reports | No | Requestor only |
| tmp | Short-lived files (1 day TTL) | No | Authenticated users |

**Access Pattern**: Generate signed URLs with short TTL (1 hour) when serving to client.

```typescript
const { data, error } = await supabase.storage
  .from('recordings')
  .createSignedUrl('path/to/file.mp3', 3600) // 1 hour
```

---

## Indexes

### Core Tables
- `orgs(id)` - Primary key
- `org_members(org_id, user_id)` - Unique composite
- `scenarios(org_id, status)` - Listing active scenarios
- `scenario_attempts(org_id, user_id, started_at desc)` - User history
- `assignments(org_id, assignee_user_id)` - User's assignments

### Fact Tables
- `fact_scenario_attempts(org_id, date_key)` - Time-series
- `fact_scenario_attempts(org_id, user_id, date_key)` - User trends
- `fact_scenario_attempts(org_id, scenario_id)` - Scenario analytics
- `fact_kpi_events(attempt_id)` - Event drill-down
- `fact_kpi_events(org_id, event_type)` - Event aggregations

### Webhooks
- `webhook_deliveries(status)` - Retry queue
- `webhook_deliveries(next_retry_at)` - Scheduler

---

## Migrations

| File | Description | Date |
|------|-------------|------|
| 0001_init.sql | Base schema: orgs, members, scenarios, attempts, webhooks | Aug 2025 |
| 0002_reporting.sql | Fact tables, dimensions, materialized views | Sep 2025 |
| 0003_articles.sql | Knowledge base articles | Sep 2025 |
| 0004_clerk_jwt_integration.sql | JWT claims mapping for RLS | Sep 2025 |

**Running Migrations**:
```bash
# Via Supabase CLI
supabase db push

# Or via psql
psql $DATABASE_URL < src/db/migrations/0004_clerk_jwt_integration.sql
```

---

## Backup and Restore

Supabase provides automatic daily backups. For manual backups:

```bash
# Backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

**Disaster Recovery**: Supabase Pro plan includes point-in-time recovery up to 7 days.

---

## Performance Considerations

### Query Optimization
- Use materialized views for heavy aggregations
- Index on (org_id, date_key) for time-series queries
- Paginate large result sets (limit 50 per page)
- Cache scenario lists and org config in Redis (future)

### Scaling
- Current setup handles 100k attempts/day
- For 1M+ attempts/day, consider:
  - Partitioning fact tables by date
  - Separate read replicas for analytics
  - Time-series database (TimescaleDB) for KPI events

---

## Schema Diagram

```
orgs
  └─ org_members (user_id, role)
  └─ scenarios
      └─ scenario_attempts
          └─ fact_scenario_attempts
          └─ fact_kpi_events
  └─ tracks
      └─ track_scenarios ─> scenarios
  └─ assignments ─> scenarios | tracks
  └─ webhooks
      └─ webhook_deliveries

articles (public, no org_id)

dim_users, dim_scenarios, dim_tracks, dim_time, dim_orgs
```

---

## Version History

- **v0.4** (Sep 29, 2025) - Added articles table, Clerk JWT integration
- **v0.3** (Sep 15, 2025) - Added reporting tables and materialized views
- **v0.2** (Sep 1, 2025) - Added webhooks and deliveries
- **v0.1** (Aug 20, 2025) - Initial schema with core tables