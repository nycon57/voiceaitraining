# Reporting and Analytics Documentation

## Overview

The Voice AI Training platform provides comprehensive analytics through a star schema data warehouse with fact tables, dimension tables, and materialized views. This enables fast, flexible reporting for dashboards, exports, and business intelligence.

**Last Updated**: September 29, 2025

---

## Architecture

### Star Schema Design

```
          ┌─────────────────┐
          │  dim_time       │
          │  (date_key)     │
          └────────┬────────┘
                   │
    ┌──────────────┴───────────────┐
    │                              │
┌───▼────────┐          ┌──────────▼─────┐
│ dim_users  │          │  dim_scenarios │
│ (user_id)  │          │  (scenario_id) │
└───┬────────┘          └──────────┬─────┘
    │                              │
    │     ┌────────────────────┐   │
    └────►│ fact_scenario_     ├───┘
          │    attempts        │
          │ (attempt_id PK)    │
          └────────┬───────────┘
                   │
          ┌────────▼────────┐
          │ dim_orgs        │
          │ (org_id)        │
          └─────────────────┘
```

**Benefits**:
- Fast aggregations via pre-joined dimensions
- Simplified queries for reporting tools
- Optimized indexes for time-series analysis
- Easy to add new dimensions without schema changes

---

## Fact Tables

### fact_scenario_attempts

Denormalized record of each completed training attempt.

**Schema**:
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

**Indexes**:
```sql
create index idx_fact_attempts_org_date on fact_scenario_attempts(org_id, date_key);
create index idx_fact_attempts_user_date on fact_scenario_attempts(org_id, user_id, date_key);
create index idx_fact_attempts_scenario on fact_scenario_attempts(org_id, scenario_id);
```

**Population**:
Automatically populated via trigger when `scenario_attempts.status` changes to 'completed':

```sql
create trigger populate_fact_on_completion
  after update on scenario_attempts
  for each row
  execute function trigger_populate_fact();
```

**Query Examples**:

Average score by month:
```sql
select
  date_trunc('month', started_at) as month,
  avg(score) as avg_score,
  count(*) as attempts
from fact_scenario_attempts
where org_id = 'org_abc123'
group by date_trunc('month', started_at)
order by month desc;
```

Top performers this week:
```sql
select
  user_id,
  avg(score) as avg_score,
  count(*) as attempts
from fact_scenario_attempts
where org_id = 'org_abc123'
  and started_at >= date_trunc('week', now())
group by user_id
order by avg_score desc
limit 10;
```

---

### fact_kpi_events

Granular event-level data for detailed analysis (optional, high volume).

**Schema**:
```sql
create table fact_kpi_events (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references scenario_attempts(id) on delete cascade,
  org_id uuid not null,
  user_id text not null,
  scenario_id uuid,
  event_type text not null,
  event_value jsonb,
  timestamp_ms int,
  created_at timestamptz default now()
);
```

**Event Types**:
- `filler_word` – "um", "uh", "like"
- `interruption` – User interrupted AI
- `question_asked` – Open or closed question
- `objection_raised` – Customer concern
- `keyword_mentioned` – Key phrase from rubric
- `long_pause` – >5 second silence

**Use Cases**:
- Heatmap: When do filler words occur in calls?
- Cohort analysis: Users who ask <3 questions vs >7 questions
- A/B testing: Impact of script changes on interruption rate

**Query Example**:

Filler word frequency over time:
```sql
select
  date_trunc('week', a.started_at) as week,
  count(*) as filler_count,
  count(distinct e.attempt_id) as attempts_with_fillers
from fact_kpi_events e
join fact_scenario_attempts a on e.attempt_id = a.attempt_id
where e.org_id = 'org_abc123'
  and e.event_type = 'filler_word'
group by date_trunc('week', a.started_at)
order by week;
```

---

## Dimension Tables

### dim_users

User context for reporting.

**Schema**:
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
```

**Sync Logic**:
Updated via Clerk webhook (`user.updated` event) or nightly batch sync.

---

### dim_scenarios

Scenario metadata for drill-down.

**Schema**:
```sql
create table dim_scenarios (
  scenario_id uuid primary key,
  org_id uuid not null,
  title text,
  difficulty text,
  category text,
  created_at timestamptz,
  updated_at timestamptz default now()
);
```

**Sync Logic**:
Updated on scenario create/update via server action.

---

### dim_time

Calendar dimension for time-based analysis.

**Schema**:
```sql
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
```

**Population**:
Pre-populated with 5 years of dates via migration.

**Usage**:
Join on `fact_scenario_attempts.date_key` for calendar-aware queries:

```sql
select
  t.year,
  t.month,
  count(*) as attempts
from fact_scenario_attempts f
join dim_time t on f.date_key = t.date_key
where f.org_id = 'org_abc123'
  and not t.is_weekend
group by t.year, t.month;
```

---

## Materialized Views

Materialized views provide pre-aggregated data for instant dashboard loads.

### mv_leaderboard_month

Monthly leaderboard rankings.

**Definition**:
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

**Query**:
```sql
select
  user_id,
  avg_score,
  attempts,
  rank() over (partition by org_id, month order by avg_score desc) as rank
from mv_leaderboard_month
where org_id = 'org_abc123'
  and month = date_trunc('month', now())
order by rank;
```

---

### mv_org_overview

Org-wide KPIs for admin dashboard.

**Definition**:
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

**Query**:
```sql
select * from mv_org_overview where org_id = 'org_abc123';
```

---

### mv_scenario_insights

Scenario performance metrics.

**Definition**:
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

**Use Case**:
Identify scenarios with high variance (stddev) → inconsistent difficulty or unclear rubrics.

---

## Refresh Strategy

### On-Demand Refresh

Admins can manually refresh via UI button or API call:

```sql
select refresh_reporting_views();
```

This refreshes all MVs concurrently (takes ~5 seconds for 10k attempts).

### Scheduled Refresh

**Cron Job** (Supabase pg_cron extension):
```sql
select cron.schedule(
  'refresh_reporting_views',
  '0 2 * * *', -- 2 AM UTC daily
  $$select refresh_reporting_views();$$
);
```

**Alternative** (Vercel Cron):
```typescript
// app/api/cron/refresh-views/route.ts
export async function GET(req: Request) {
  // Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  await supabase.rpc('refresh_reporting_views')

  return Response.json({ success: true })
}
```

Configure in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-views",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## Dashboards

### Admin Dashboard

**URL**: `/dashboard` (admin role)

**Widgets**:
1. **Org Overview Card**
   - Active users this month
   - Total attempts
   - Average score
   - Attempts trend chart (last 30 days)

2. **Top Scenarios Card**
   - Most attempted scenarios
   - Average score per scenario
   - Link to scenario detail

3. **Recent Attempts Table**
   - User, scenario, score, date
   - Filter by date range, scenario
   - Export to CSV

4. **User Activity Heatmap**
   - Calendar heatmap of daily attempts
   - Color intensity = attempt count

**Data Source**:
```typescript
// src/actions/admin.ts
export async function getOrgOverview(orgId: string) {
  const { data } = await supabase
    .from('mv_org_overview')
    .select('*')
    .eq('org_id', orgId)
    .single()

  return data
}
```

---

### Manager Dashboard

**URL**: `/dashboard` (manager role)

**Widgets**:
1. **Team Performance Card**
   - Team average score
   - Completion rate
   - Rank vs other teams

2. **Leaderboard**
   - Top 10 team members this month
   - Score, attempts, trend

3. **Assignment Tracking**
   - Assigned scenarios
   - Completion % per assignment
   - Overdue warnings

**Data Source**:
```typescript
export async function getTeamLeaderboard(orgId: string, managerId: string) {
  // Get users managed by this manager
  const teamUserIds = await getTeamUserIds(managerId)

  const { data } = await supabase
    .from('mv_leaderboard_month')
    .select('*')
    .eq('org_id', orgId)
    .in('user_id', teamUserIds)
    .eq('month', startOfMonth(new Date()))
    .order('avg_score', { ascending: false })

  return data
}
```

---

### Trainee Dashboard

**URL**: `/dashboard` (trainee role)

**Widgets**:
1. **Personal Stats Card**
   - Attempts this week
   - Average score
   - Score trend chart

2. **Recent Attempts**
   - Last 5 attempts with scores
   - View feedback button

3. **Upcoming Assignments**
   - Due dates
   - Required vs optional
   - Start button

**Data Source**:
```typescript
export async function getPersonalStats(orgId: string, userId: string) {
  const { data } = await supabase
    .from('fact_scenario_attempts')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .gte('started_at', subWeeks(new Date(), 1))

  const avgScore = data.reduce((sum, a) => sum + a.score, 0) / data.length
  const attempts = data.length

  return { avgScore, attempts, data }
}
```

---

## Exports

### CSV Export

**Trigger**: Dashboard "Export" button

**Process**:
1. User clicks export
2. Server action queries fact table with filters
3. Format as CSV
4. Upload to `exports` storage bucket
5. Generate signed URL (24-hour TTL)
6. Return URL for download

**Implementation**:
```typescript
// src/actions/admin.ts
export async function exportAttempts(orgId: string, filters: Filters) {
  const { data } = await supabase
    .from('fact_scenario_attempts')
    .select('*')
    .eq('org_id', orgId)
    .gte('started_at', filters.startDate)
    .lte('started_at', filters.endDate)

  const csv = generateCSV(data)
  const fileName = `attempts_${orgId}_${Date.now()}.csv`

  await supabase.storage
    .from('exports')
    .upload(fileName, csv, { contentType: 'text/csv' })

  const { data: urlData } = await supabase.storage
    .from('exports')
    .createSignedUrl(fileName, 86400) // 24 hours

  return urlData.signedUrl
}
```

### Scheduled Reports

**Email Digest** (Manager, weekly):
- Top 5 performers
- Bottom 5 performers
- Team average score
- Completion rate

**Implementation**:
```typescript
// app/api/cron/weekly-digest/route.ts
export async function GET(req: Request) {
  const managers = await getManagers()

  for (const manager of managers) {
    const stats = await getTeamStats(manager.userId)

    await resend.emails.send({
      to: manager.email,
      from: 'Voice AI Training <digest@voiceaitraining.com>',
      subject: 'Weekly Team Digest',
      react: DigestEmail({ stats }),
    })
  }

  return Response.json({ sent: managers.length })
}
```

---

## Performance Optimization

### Query Optimization

**Use Materialized Views**:
❌ Don't query fact table directly for dashboards
✅ Do use materialized views for aggregated metrics

**Pagination**:
```typescript
const { data, count } = await supabase
  .from('fact_scenario_attempts')
  .select('*', { count: 'exact' })
  .eq('org_id', orgId)
  .range(offset, offset + limit - 1)
```

**Covering Indexes**:
For common queries, create indexes that include all columns:
```sql
create index idx_covering on fact_scenario_attempts(org_id, user_id, started_at)
  include (score, duration_seconds);
```

### Caching

**Cache Strategy**:
- Dashboard overview: Cache 5 minutes (high traffic)
- Leaderboard: Cache 15 minutes (updated hourly)
- Scenario insights: Cache 1 hour (low churn)

**Implementation** (Next.js unstable_cache):
```typescript
import { unstable_cache } from 'next/cache'

export const getOrgOverview = unstable_cache(
  async (orgId: string) => {
    // Query database
  },
  ['org-overview'],
  { revalidate: 300 } // 5 minutes
)
```

---

## BI Tool Integration

### Supported Tools

1. **Metabase** (recommended)
   - Self-hosted or cloud
   - Direct Postgres connection
   - Pre-built dashboards via JSON export

2. **Retool**
   - Internal admin tools
   - Connect to Supabase REST API

3. **Mode Analytics**
   - SQL-based reporting
   - Share dashboards with customers

### Connection String

For read-only BI tools, create a separate Postgres user:

```sql
create user reporting_user with password 'secure_password';
grant connect on database postgres to reporting_user;
grant usage on schema public to reporting_user;
grant select on all tables in schema public to reporting_user;

-- Read-only on fact/dim tables
grant select on fact_scenario_attempts to reporting_user;
grant select on dim_users to reporting_user;
grant select on dim_scenarios to reporting_user;
grant select on dim_time to reporting_user;
```

**Connection String**:
```
postgres://reporting_user:secure_password@db.supabase.co:5432/postgres
```

---

## Troubleshooting

**Issue**: Dashboard shows stale data
**Solution**: Run `select refresh_reporting_views()` or check cron job status

**Issue**: Query timeout on large exports
**Solution**: Paginate query or offload to background job

**Issue**: MV refresh takes >30 seconds
**Solution**: Partition fact table by date, refresh incrementally

---

## Version History

- **v0.1** (Sep 29, 2025) - Initial reporting documentation