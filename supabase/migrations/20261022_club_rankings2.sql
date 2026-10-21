-- Comparison with teams at the same level ("vs Others").
-- The field for a club is:
--   * other clubs using the app with the same sport and grade (the demo club excluded), and
--   * every team those clubs have played or scouted in League and Championship matches,
--     measured from the events tagged against them.
-- A match without a final score counts when it has tagged events; its total is the sum of the
-- tagged scores. Opponent names follow each club's merges and renames (tag_settings oppAlias,
-- oppName); an opponent whose name matches a club in the field is left out, because that club's
-- own numbers are already there. Results stay anonymous: only rank, size and field average.

create or replace function public.rsa_team_key(t text)
returns text language sql immutable as $$
  select regexp_replace(lower(translate(coalesce(t, ''), 'áéíóúÁÉÍÓÚ', 'aeiouaeiou')), '[^a-z0-9]', '', 'g');
$$;

create or replace function public.rsa_team_name(ts jsonb, nm text)
returns text language plpgsql immutable as $$
declare k text := public.rsa_team_key(nm); i int := 0;
begin
  while ts -> 'oppAlias' ? k and i < 10 loop k := ts -> 'oppAlias' ->> k; i := i + 1; end loop;
  return coalesce(ts -> 'oppName' ->> k, nm);
end $$;

create or replace function public.club_rankings2(p_club uuid)
returns table(metric text, value numeric, rank integer, total integer, field_avg numeric, field_games integer, field_clubs integer, field_teams integer)
language plpgsql security definer set search_path to 'public'
as $function$
declare v_sport text; v_grade text;
begin
  select sport, grade into v_sport, v_grade from clubs where id = p_club;
  if v_sport is null then return; end if;

  return query
  with fc as (
    select c.id, c.tag_settings, public.rsa_team_key(c.name) as ckey from clubs c
    where c.sport = v_sport and c.grade is not distinct from v_grade
      and c.id <> 'dddddddd-0000-4000-a000-000000000001'::uuid
  ),
  mt as (
    select m.id, m.club_id, m.scouting, m.opponent, m.our_total, m.opp_total, fc.tag_settings,
      (select coalesce(sum(e.score) filter (where e.team = 'us'), 0) from events e where e.match_id = m.id) as ev_us,
      (select coalesce(sum(e.score) filter (where e.team = 'opp'), 0) from events e where e.match_id = m.id) as ev_opp,
      (select count(*) from events e where e.match_id = m.id) as n_ev
    from matches m join fc on fc.id = m.club_id
    where m.competition in ('League', 'Championship')
  ),
  mt2 as (select * from mt where our_total is not null or n_ev >= 30),
  -- One row per team per match: the club itself, its opponent, or either side of a scouted match.
  sides as (
    select mt2.id as match_id, 'c:' || mt2.club_id::text as team, 'us' as side, coalesce(mt2.our_total, mt2.ev_us) as pts, true as is_club, mt2.club_id
      from mt2 where not coalesce(mt2.scouting, false)
    union all
    select mt2.id, 'o:' || public.rsa_team_key(public.rsa_team_name(mt2.tag_settings, mt2.opponent)), 'opp', coalesce(mt2.opp_total, mt2.ev_opp), false, null
      from mt2 where not coalesce(mt2.scouting, false)
    union all
    select mt2.id, 'o:' || public.rsa_team_key(public.rsa_team_name(mt2.tag_settings, split_part(mt2.opponent, ' v ', 1))), 'us', coalesce(mt2.our_total, mt2.ev_us), false, null
      from mt2 where coalesce(mt2.scouting, false) and position(' v ' in mt2.opponent) > 0
    union all
    select mt2.id, 'o:' || public.rsa_team_key(public.rsa_team_name(mt2.tag_settings, split_part(mt2.opponent, ' v ', 2))), 'opp', coalesce(mt2.opp_total, mt2.ev_opp), false, null
      from mt2 where coalesce(mt2.scouting, false) and position(' v ' in mt2.opponent) > 0
  ),
  sides2 as (
    select s.* from sides s
    where s.is_club or (length(s.team) > 2 and not exists (select 1 from fc where 'o:' || fc.ckey = s.team))
  ),
  tm as (
    select s.team, bool_or(s.is_club) as is_club, count(distinct s.match_id) as g, avg(s.pts)::numeric as avg_score,
      (select count(*) filter (where e.score > 0)::numeric / nullif(count(*), 0) from events e join sides2 s2 on s2.match_id = e.match_id and e.team = s2.side
         where s2.team = s.team and e.event_type in ('Shot from play', 'Scoreable free')) as shot_eff,
      (select count(*) filter (where e.outcome in ('Won clean', 'Break won'))::numeric / nullif(count(*), 0) from events e join sides2 s2 on s2.match_id = e.match_id and e.team = s2.side
         where s2.team = s.team and e.event_type = 'Kickout') as ko_eff
    from sides2 s group by s.team
  ),
  -- Keeper and line numbers need positions, so they come from the clubs only.
  line_stats as (
    select s.team,
      case when ap.position_slot is null then 'Bench' when ap.position_slot = 1 then 'Goalkeeper' when ap.position_slot <= 7 then 'Backs' when ap.position_slot <= 9 then 'Midfield' else 'Forwards' end as line,
      sum(case when e.event_type in ('Shot from play', 'Scoreable free') then 1 else 0 end)::numeric as shots,
      sum(case when e.event_type in ('Shot from play', 'Scoreable free') and coalesce(e.score, 0) > 0 then 1 else 0 end)::numeric as scored,
      sum(coalesce(e.score, 0))::numeric as pts,
      sum(case when e.event_type = 'Possession lost' and position('shot' in lower(coalesce(e.outcome, ''))) = 0 then 1 else 0 end)::numeric as tov,
      sum(case when e.event_type = 'Tackle' then 1 else 0 end)::numeric as tackles
    from sides2 s join events e on e.match_id = s.match_id and e.team = 'us'
    left join appearances ap on ap.match_id = e.match_id and lower(trim(ap.player_name)) = lower(trim(e.player))
    where s.is_club group by s.team, 2
  ),
  gk as (
    select s.team,
      sum(case when e.outcome = 'Saved' then 1 else 0 end)::numeric as saves,
      sum(case when coalesce(e.score, 0) = 3 then 1 else 0 end)::numeric as goals
    from sides2 s join events e on e.match_id = s.match_id and e.team = 'opp' and e.event_type in ('Shot from play', 'Scoreable free')
    where s.is_club group by s.team
  ),
  metrics as (
    select tm.team, tm.is_club, tm.g, tm.avg_score, tm.shot_eff, tm.ko_eff,
      case when coalesce(gk.saves, 0) + coalesce(gk.goals, 0) > 0 then gk.saves / (gk.saves + gk.goals) end as gk_save,
      case when tm.is_club then tm.ko_eff end as gk_ko,
      (select coalesce(sum(pts), 0) from line_stats l where l.team = tm.team and l.line = 'Backs') / nullif(tm.g, 0) * case when tm.is_club then 1 end as backs_pts,
      (select sum(scored) / nullif(sum(shots), 0) from line_stats l where l.team = tm.team and l.line = 'Backs') as backs_shoteff,
      (select coalesce(sum(tov), 0) from line_stats l where l.team = tm.team and l.line = 'Backs') / nullif(tm.g, 0) * case when tm.is_club then 1 end as backs_tov,
      (select coalesce(sum(tackles), 0) from line_stats l where l.team = tm.team and l.line = 'Backs') / nullif(tm.g, 0) * case when tm.is_club then 1 end as backs_tack,
      (select coalesce(sum(pts), 0) from line_stats l where l.team = tm.team and l.line = 'Midfield') / nullif(tm.g, 0) * case when tm.is_club then 1 end as mid_pts,
      (select sum(scored) / nullif(sum(shots), 0) from line_stats l where l.team = tm.team and l.line = 'Midfield') as mid_shoteff,
      (select coalesce(sum(tov), 0) from line_stats l where l.team = tm.team and l.line = 'Midfield') / nullif(tm.g, 0) * case when tm.is_club then 1 end as mid_tov,
      (select coalesce(sum(tackles), 0) from line_stats l where l.team = tm.team and l.line = 'Midfield') / nullif(tm.g, 0) * case when tm.is_club then 1 end as mid_tack,
      (select coalesce(sum(pts), 0) from line_stats l where l.team = tm.team and l.line = 'Forwards') / nullif(tm.g, 0) * case when tm.is_club then 1 end as fwd_pts,
      (select sum(scored) / nullif(sum(shots), 0) from line_stats l where l.team = tm.team and l.line = 'Forwards') as fwd_shoteff,
      (select coalesce(sum(tov), 0) from line_stats l where l.team = tm.team and l.line = 'Forwards') / nullif(tm.g, 0) * case when tm.is_club then 1 end as fwd_tov,
      (select coalesce(sum(tackles), 0) from line_stats l where l.team = tm.team and l.line = 'Forwards') / nullif(tm.g, 0) * case when tm.is_club then 1 end as fwd_tack,
      (select coalesce(sum(pts), 0) from line_stats l where l.team = tm.team and l.line = 'Bench') / nullif(tm.g, 0) * case when tm.is_club then 1 end as bench_pts,
      (select sum(scored) / nullif(sum(shots), 0) from line_stats l where l.team = tm.team and l.line = 'Bench') as bench_shoteff,
      (select coalesce(sum(tov), 0) from line_stats l where l.team = tm.team and l.line = 'Bench') / nullif(tm.g, 0) * case when tm.is_club then 1 end as bench_tov,
      (select coalesce(sum(tackles), 0) from line_stats l where l.team = tm.team and l.line = 'Bench') / nullif(tm.g, 0) * case when tm.is_club then 1 end as bench_tack
    from tm left join gk on gk.team = tm.team
  ),
  long as (
    select 'avg_score' metric, team, avg_score value, 1 dir from metrics
    union all select 'shot_eff', team, shot_eff, 1 from metrics
    union all select 'ko_eff', team, ko_eff, 1 from metrics
    union all select 'gk_save', team, gk_save, 1 from metrics
    union all select 'gk_ko', team, gk_ko, 1 from metrics
    union all select 'backs_pts', team, backs_pts, 1 from metrics
    union all select 'backs_shoteff', team, backs_shoteff, 1 from metrics
    union all select 'backs_tov', team, backs_tov, -1 from metrics
    union all select 'backs_tack', team, backs_tack, 1 from metrics
    union all select 'mid_pts', team, mid_pts, 1 from metrics
    union all select 'mid_shoteff', team, mid_shoteff, 1 from metrics
    union all select 'mid_tov', team, mid_tov, -1 from metrics
    union all select 'mid_tack', team, mid_tack, 1 from metrics
    union all select 'fwd_pts', team, fwd_pts, 1 from metrics
    union all select 'fwd_shoteff', team, fwd_shoteff, 1 from metrics
    union all select 'fwd_tov', team, fwd_tov, -1 from metrics
    union all select 'fwd_tack', team, fwd_tack, 1 from metrics
    union all select 'bench_pts', team, bench_pts, 1 from metrics
    union all select 'bench_shoteff', team, bench_shoteff, 1 from metrics
    union all select 'bench_tov', team, bench_tov, -1 from metrics
    union all select 'bench_tack', team, bench_tack, 1 from metrics
  ),
  ranked as (
    select l.metric, l.team, l.value,
      rank() over (partition by l.metric order by l.value * l.dir desc nulls last) as rnk,
      count(l.value) over (partition by l.metric) as tot,
      avg(l.value) over (partition by l.metric) as favg
    from long l
  )
  select r.metric, r.value, r.rnk::int, r.tot::int, round(r.favg, 3),
    (select count(distinct match_id)::int from sides2),
    (select count(*)::int from tm where tm.is_club),
    (select count(*)::int from tm where not tm.is_club)
  from ranked r
  where r.team = 'c:' || p_club::text and r.value is not null;
end; $function$;

revoke all on function public.club_rankings2(uuid) from public, anon;
grant execute on function public.club_rankings2(uuid) to authenticated;
