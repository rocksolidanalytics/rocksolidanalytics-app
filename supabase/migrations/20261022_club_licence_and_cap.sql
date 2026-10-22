-- Clubs above teams, with a licence and a free match cap.
-- A club (club_orgs) holds one or more teams (clubs rows: one sport and grade each). The
-- licence is on the club: 'lifetime' has no limit; 'free' allows match_limit matches (10)
-- across all its teams together, counting every match (tagged live or from video, scouted,
-- imported). At the limit nothing is taken away; only new matches are refused. The demo club
-- belongs to no club and has no limit.
-- A new team joins the club with the same name and county (teams can only be created with an
-- access code from Rock Solid Analytics), otherwise it starts a new club on the free licence.
-- The club a team belongs to, and the licence, can only be changed from the database side.

create table if not exists public.club_orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  county text,
  licence text not null default 'free' check (licence in ('free', 'lifetime')),
  match_limit integer not null default 10,
  created_at timestamptz not null default now()
);
alter table public.club_orgs enable row level security;
-- No policies: clients read it only through club_usage.

alter table public.clubs add column if not exists org_id uuid references public.club_orgs(id) on delete set null;

-- New team: join the matching club, or start a new one.
create or replace function public.clubs_set_org()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare o uuid;
begin
  if new.org_id is not null or new.id = 'dddddddd-0000-4000-a000-000000000001'::uuid then return new; end if;
  select id into o from club_orgs
    where public.rsa_team_key(name) = public.rsa_team_key(new.name) and lower(coalesce(county, '')) = lower(coalesce(new.county, ''))
    order by created_at limit 1;
  if o is null then
    insert into club_orgs (name, county) values (new.name, new.county) returning id into o;
  end if;
  new.org_id := o;
  return new;
end;
$function$;
drop trigger if exists clubs_set_org on public.clubs;
create trigger clubs_set_org before insert on public.clubs for each row execute function public.clubs_set_org();

-- Signed-in users cannot move a team to another club (that would change its licence).
create or replace function public.clubs_guard_org()
returns trigger
language plpgsql
as $function$
begin
  if new.org_id is distinct from old.org_id and auth.uid() is not null then
    raise exception 'The club a team belongs to can only be changed by Rock Solid Analytics';
  end if;
  return new;
end;
$function$;
drop trigger if exists clubs_guard_org on public.clubs;
create trigger clubs_guard_org before update on public.clubs for each row execute function public.clubs_guard_org();

-- The cap: refuse a new match once a free club has used its matches.
create or replace function public.enforce_match_cap()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare o club_orgs; n integer;
begin
  select g.* into o from club_orgs g join clubs c on c.org_id = g.id where c.id = new.club_id;
  if o.id is null or o.licence = 'lifetime' then return new; end if;
  select count(*) into n from matches m join clubs c on c.id = m.club_id where c.org_id = o.id;
  if n >= o.match_limit then
    raise exception 'Your club has used its % free matches. Everything already tagged stays. To add more matches, get in touch to unlock lifetime access: staff.rocksolidanalytics@gmail.com', o.match_limit;
  end if;
  return new;
end;
$function$;
drop trigger if exists matches_cap on public.matches;
create trigger matches_cap before insert on public.matches for each row execute function public.enforce_match_cap();

-- What the app shows: licence, matches used and the limit, for a team the user belongs to.
create or replace function public.club_usage(p_club uuid)
returns json
language sql
stable
security definer
set search_path to 'public'
as $function$
  select case when p_club not in (select public.my_club_ids()) then null else (
    select json_build_object(
      'club', g.name, 'licence', g.licence, 'limit', g.match_limit,
      'used', (select count(*) from matches m join clubs c2 on c2.id = m.club_id where c2.org_id = g.id),
      'teams', (select count(*) from clubs c3 where c3.org_id = g.id))
    from clubs c join club_orgs g on g.id = c.org_id where c.id = p_club) end;
$function$;
grant execute on function public.club_usage(uuid) to authenticated;

-- Existing teams: group into clubs by name and county (the demo club stays outside).
do $$
declare r record; o uuid;
begin
  for r in select id, name, county from clubs where org_id is null and id <> 'dddddddd-0000-4000-a000-000000000001'::uuid and name <> 'Kill GAA test' order by created_at loop
    select id into o from club_orgs where public.rsa_team_key(name) = public.rsa_team_key(r.name) and lower(coalesce(county, '')) = lower(coalesce(r.county, '')) limit 1;
    if o is null then insert into club_orgs (name, county) values (r.name, r.county) returning id into o; end if;
    update clubs set org_id = o where id = r.id;
  end loop;
end $$;

-- Early supporters: Bray Emmets (Wicklow) and St Jude's (Dublin) have lifetime access.
update club_orgs set licence = 'lifetime' where (name = 'Bray Emmets' and county = 'Wicklow') or (name = 'St Jude''s' and county = 'Dublin');

-- The Kill GAA test team (no matches, no squad) is removed; its test account is left without a team.
delete from clubs where name = 'Kill GAA test' and id = 'b2296142-383a-4eb9-bd37-30dc6e5038d5'::uuid;
