-- First-party usage log for the daily and weekly app reports. The app writes a row when it opens,
-- when a report is made, when the Fan Zone is viewed, when a tagger opens, and when a script error
-- happens on someone's device. Anyone can write (the Fan Zone has no login); nobody can read
-- through the API, only the service side that builds the report.
create table if not exists public.usage_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('open', 'report', 'fanzone', 'live_tagger', 'video_tagger', 'error')),
  club_id uuid,
  user_id uuid default auth.uid(),
  detail jsonb check (detail is null or pg_column_size(detail) <= 2000)
);
create index if not exists usage_log_created_idx on public.usage_log (created_at);
alter table public.usage_log enable row level security;
grant insert on public.usage_log to anon, authenticated;
drop policy if exists usage_log_insert on public.usage_log;
create policy usage_log_insert on public.usage_log for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
