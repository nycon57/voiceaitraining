-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Orgs and memberships
create table orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_customer_id text,
  plan text not null default 'pro',
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

-- Scenarios and tracks
create table scenarios (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  title text not null,
  description text,
  persona jsonb,              -- {role:"client", profile:{...}}
  difficulty text,            -- e.g. "easy","med","hard"
  ai_prompt text,             -- system prompt for LLM
  branching jsonb,            -- graph nodes/edges config
  rubric jsonb,               -- weights, required items
  status text default 'draft', -- draft, active, archived
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

-- Assignments
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

-- Attempts and artifacts
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
  recording_url text,
  transcript_text text,
  transcript_json jsonb,
  score numeric,
  score_breakdown jsonb,    -- {goal:0.5, kpis:0.3, quality:0.2}
  kpis jsonb,               -- computed metrics
  status text not null default 'in_progress',
  feedback_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Webhooks
create table webhooks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade not null,
  name text not null,
  url text not null,
  secret text not null,
  enabled boolean default true,
  events text[] not null,   -- ['scenario.completed','track.completed',...]
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid references webhooks(id) on delete cascade not null,
  event text not null,
  payload jsonb not null,
  status text not null,
  response_status int,
  response_body text,
  attempted_at timestamptz default now(),
  retry_count int default 0,
  next_retry_at timestamptz
);

-- Helper function to set org claims for RLS
create or replace function set_org_claim(org_id uuid)
returns void as $$
begin
  perform set_config('jwt.claims.org_id', org_id::text, true);
end;
$$ language plpgsql security definer;

-- Enable RLS on all tables
alter table orgs enable row level security;
alter table org_members enable row level security;
alter table scenarios enable row level security;
alter table tracks enable row level security;
alter table track_scenarios enable row level security;
alter table assignments enable row level security;
alter table scenario_attempts enable row level security;
alter table webhooks enable row level security;
alter table webhook_deliveries enable row level security;

-- RLS policies
create policy "orgs_policy" on orgs
  using (id = current_setting('jwt.claims.org_id', true)::uuid);

create policy "org_members_policy" on org_members
  using (org_id = current_setting('jwt.claims.org_id', true)::uuid);

create policy "scenarios_policy" on scenarios
  using (org_id = current_setting('jwt.claims.org_id', true)::uuid);

create policy "tracks_policy" on tracks
  using (org_id = current_setting('jwt.claims.org_id', true)::uuid);

create policy "track_scenarios_policy" on track_scenarios
  using (track_id in (
    select id from tracks where org_id = current_setting('jwt.claims.org_id', true)::uuid
  ));

create policy "assignments_policy" on assignments
  using (org_id = current_setting('jwt.claims.org_id', true)::uuid);

create policy "scenario_attempts_policy" on scenario_attempts
  using (org_id = current_setting('jwt.claims.org_id', true)::uuid);

create policy "webhooks_policy" on webhooks
  using (org_id = current_setting('jwt.claims.org_id', true)::uuid);

create policy "webhook_deliveries_policy" on webhook_deliveries
  using (webhook_id in (
    select id from webhooks where org_id = current_setting('jwt.claims.org_id', true)::uuid
  ));

-- Create storage buckets
insert into storage.buckets (id, name, public) values
  ('recordings', 'recordings', false),
  ('transcripts', 'transcripts', false),
  ('org-assets', 'org-assets', false),
  ('scenario-assets', 'scenario-assets', false),
  ('exports', 'exports', false),
  ('tmp', 'tmp', false);

-- Storage policies
create policy "authenticated users can upload recordings" on storage.objects
  for insert with check (bucket_id = 'recordings' and auth.role() = 'authenticated');

create policy "users can view own org recordings" on storage.objects
  for select using (bucket_id = 'recordings' and auth.role() = 'authenticated');

create policy "authenticated users can upload transcripts" on storage.objects
  for insert with check (bucket_id = 'transcripts' and auth.role() = 'authenticated');

create policy "users can view own org transcripts" on storage.objects
  for select using (bucket_id = 'transcripts' and auth.role() = 'authenticated');

create policy "authenticated users can upload org assets" on storage.objects
  for all using (bucket_id = 'org-assets' and auth.role() = 'authenticated');

create policy "authenticated users can upload scenario assets" on storage.objects
  for all using (bucket_id = 'scenario-assets' and auth.role() = 'authenticated');

create policy "authenticated users can upload exports" on storage.objects
  for all using (bucket_id = 'exports' and auth.role() = 'authenticated');

create policy "authenticated users can upload tmp files" on storage.objects
  for all using (bucket_id = 'tmp' and auth.role() = 'authenticated');