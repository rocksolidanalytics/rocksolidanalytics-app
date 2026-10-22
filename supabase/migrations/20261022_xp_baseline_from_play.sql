-- Expected scores baseline, pooled across every club of a sport using the app.
-- Shots from play only (frees have their own stats). Zone keys match the app ("band_lane"):
--   football: band 0 inside 21m, 1 21-45m, 2 beyond 45m
--   hurling and camogie: band 0 inside 20m, 1 20-45m, 2 45-65m, 3 beyond 65m
--   lane 0 left, 1 centre, 2 right (same split as the app: 0.38 and 0.62 across).
-- A shot counts as scored when its score is above 0 or its outcome is a point or goal, so
-- games stored without score values still count. The demo club is left out.
-- Both sides of every game count, so the pool covers the clubs using the app and every team
-- they played or scouted. Returns counts only (shots and scored per zone, total shots, games,
-- clubs, teams); the app blends thin zones toward a typical rate. No club figures are exposed.
create or replace function public.xp_baseline(p_sport text)
returns jsonb
language sql
stable
security definer
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
    -- An opponent with the same name as a club in the pool is that club, so it is not counted twice.
    'teams', (select count(distinct team_key) from z
              where team_key not in (select 'o:' || public.rsa_team_key(c.name) from clubs c where c.id in (select club_id from z)))
  );
$function$;

grant execute on function public.xp_baseline(text) to authenticated;
