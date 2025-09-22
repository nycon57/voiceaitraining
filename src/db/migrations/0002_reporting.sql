-- Reporting facts and dimensions
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

create table fact_kpi_events (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references scenario_attempts(id) on delete cascade,
  org_id uuid not null,
  user_id text not null,
  scenario_id uuid,
  event_type text not null, -- 'filler_word', 'interruption', 'question_asked', etc
  event_value jsonb,
  timestamp_ms int, -- milliseconds from start of call
  created_at timestamptz default now()
);

-- Dimension tables
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

-- Materialized views for dashboards
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

-- Indexes for performance
create index idx_fact_attempts_org_date on fact_scenario_attempts(org_id, date_key);
create index idx_fact_attempts_user_date on fact_scenario_attempts(org_id, user_id, date_key);
create index idx_fact_attempts_scenario on fact_scenario_attempts(org_id, scenario_id);
create index idx_fact_kpi_events_attempt on fact_kpi_events(attempt_id);
create index idx_fact_kpi_events_org_type on fact_kpi_events(org_id, event_type);

-- Enable RLS on fact tables
alter table fact_scenario_attempts enable row level security;
alter table fact_kpi_events enable row level security;

-- RLS policies for fact tables
create policy "fact_attempts_policy" on fact_scenario_attempts
  using (org_id = current_setting('jwt.claims.org_id', true)::uuid);

create policy "fact_kpi_events_policy" on fact_kpi_events
  using (org_id = current_setting('jwt.claims.org_id', true)::uuid);

-- Function to refresh materialized views
create or replace function refresh_reporting_views()
returns void as $$
begin
  refresh materialized view mv_leaderboard_month;
  refresh materialized view mv_org_overview;
  refresh materialized view mv_scenario_insights;
end;
$$ language plpgsql security definer;

-- Function to populate fact table from attempts
create or replace function populate_fact_from_attempt(attempt_id uuid)
returns void as $$
declare
  attempt_row scenario_attempts%rowtype;
begin
  select * into attempt_row from scenario_attempts where id = attempt_id;

  if attempt_row.id is not null and attempt_row.ended_at is not null then
    insert into fact_scenario_attempts (
      attempt_id,
      org_id,
      user_id,
      scenario_id,
      score,
      duration_seconds,
      talk_ms,
      listen_ms,
      started_at,
      ended_at
    ) values (
      attempt_row.id,
      attempt_row.org_id,
      attempt_row.user_id,
      attempt_row.scenario_id,
      attempt_row.score,
      attempt_row.duration_seconds,
      coalesce((attempt_row.kpis->>'talk_ms')::int, 0),
      coalesce((attempt_row.kpis->>'listen_ms')::int, 0),
      attempt_row.started_at,
      attempt_row.ended_at
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

-- Trigger to auto-populate fact table when attempts are completed
create or replace function trigger_populate_fact()
returns trigger as $$
begin
  if NEW.status = 'completed' and OLD.status != 'completed' then
    perform populate_fact_from_attempt(NEW.id);
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger populate_fact_on_completion
  after update on scenario_attempts
  for each row
  execute function trigger_populate_fact();

-- Populate time dimension with dates for next 5 years
insert into dim_time (date_key, year, quarter, month, week, day_of_week, day_of_month, day_of_year, is_weekend)
select
  d::date as date_key,
  extract(year from d) as year,
  extract(quarter from d) as quarter,
  extract(month from d) as month,
  extract(week from d) as week,
  extract(dow from d) as day_of_week,
  extract(day from d) as day_of_month,
  extract(doy from d) as day_of_year,
  extract(dow from d) in (0, 6) as is_weekend
from generate_series(
  current_date - interval '1 year',
  current_date + interval '5 years',
  interval '1 day'
) as d
on conflict (date_key) do nothing;