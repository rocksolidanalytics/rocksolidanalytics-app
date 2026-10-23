-- Showcase containers for inter-county games (All-Ireland 2026), one per sport.
-- A showcase is not a team: no squad, no kit of its own. Every game in it is a scouting match
-- between two counties ("Kerry v Mayo"). It is kept out of the shared expected scores pool
-- (as the demo club is), and its "Inter-county" grade puts it in a rankings field of its own.
-- It has no match limit (lifetime licence) and no join code; the owner account is linked
-- from the database side.

alter table public.clubs add column if not exists showcase boolean not null default false;

-- Expected scores pool: leave out showcases as well as the demo club.
create or replace function public.xp_baseline(p_sport text)
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
  with s as (
    select c.id as club_id, m.id as match_id, e.x, e.y,
           case when e.team = 'us' and not coalesce(m.scouting, false) then 'c:' || c.id::text
                when not coalesce(m.scouting, false) then 'o:' || public.rsa_team_key(public.rsa_team_name(c.tag_settings, m.opponent))
                else 'o:' || public.rsa_team_key(public.rsa_team_name(c.tag_settings, split_part(m.opponent, ' v ', case when e.team = 'us' then 1 else 2 end))) end as team_key,
           (coalesce(e.score, 0) > 0 or e.outcome in ('Point', 'Goal', '2 Pointer', '2-Pointer')) as sc
    from events e
    join matches m on m.id = e.match_id
    join clubs c on c.id = m.club_id
    where lower(c.sport) = lower(p_sport)
      and c.id <> 'dddddddd-0000-4000-a000-000000000001'::uuid
      and not c.showcase
      and e.event_type = 'Shot from play'
      and e.x is not null and e.y is not null
  ),
  n as (
    select club_id, match_id, team_key, sc,
           case when x < 0.5 then 1 - y else y end as y2,
           (1 - case when x < 0.5 then 1 - x else x end) * 144 as dd
    from s
  ),
  z as (
    select club_id, match_id, team_key, sc,
           (case when lower(p_sport) in ('hurling', 'camogie')
                 then case when dd <= 20 then 0 when dd <= 45 then 1 when dd <= 65 then 2 else 3 end
                 else case when dd <= 21 then 0 when dd <= 45 then 1 else 2 end end)::text
           || '_' || (case when y2 < 0.38 then 0 when y2 < 0.62 then 1 else 2 end)::text as k
    from n
  )
  select jsonb_build_object(
    'zones', coalesce((select jsonb_object_agg(k, jsonb_build_object('n', cnt, 's', scored))
                       from (select k, count(*) as cnt, count(*) filter (where sc) as scored from z group by k) q), '{}'::jsonb),
    'shots', (select count(*) from z),
    'games', (select count(distinct match_id) from z),
    'clubs', (select count(distinct club_id) from z),
    'teams', (select count(distinct team_key) from z
              where team_key not in (select 'o:' || public.rsa_team_key(c.name) from clubs c where c.id in (select club_id from z)))
  );
$function$;

-- The two containers. Kerry and Mayo are set up under Opposition with their kits.
insert into public.clubs (name, sport, grade, verified, showcase, tag_settings)
select 'All-Ireland 2026 - Football', 'football', 'Inter-county', true, true,
  '{"oppTeams": {"kerry": {"name": "Kerry"}, "mayo": {"name": "Mayo"}},
    "oppKit": {"kerry": {"p": "band", "a": "#00843d", "b": "#ffd100", "n": "#f2f4f8"},
               "mayo": {"p": "band", "a": "#00843d", "b": "#e4002b", "n": "#f2f4f8"}}}'::jsonb
where not exists (select 1 from public.clubs where name = 'All-Ireland 2026 - Football');

insert into public.clubs (name, sport, grade, verified, showcase, tag_settings)
select 'All-Ireland 2026 - Hurling', 'hurling', 'Inter-county', true, true, '{}'::jsonb
where not exists (select 1 from public.clubs where name = 'All-Ireland 2026 - Hurling');

-- No match limit.
update public.club_orgs set licence = 'lifetime'
where id in (select org_id from public.clubs where showcase);
