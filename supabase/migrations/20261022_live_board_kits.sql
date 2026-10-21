-- Fan Zone kits: live_board also returns the club kit and the opposition kit.
-- The opposition kit is the one-match kit if set (tag_settings.matchKit), otherwise the
-- usual kit for that team (tag_settings.oppKit), following merged spellings (oppAlias).
-- Team keys match the app: accents dropped, lower case, letters and digits only.
create or replace function public.live_board(p_club uuid)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare m record; evs json; ts jsonb; k text; i int := 0; ck jsonb; ok jsonb;
begin
  select id, opponent, competition, venue, date
    into m
    from matches
    where club_id = p_club
      and coalesce(scouting, false) = false
      and coalesce(status, '') <> 'final'
      and (our_score is null or trim(coalesce(our_score, '')) = '')
    order by date desc nulls last
    limit 1;

  if m.id is null then
    return json_build_object('club', (select name from clubs where id = p_club), 'match', null, 'events', '[]'::json);
  end if;

  select coalesce(json_agg(
           json_build_object('team', team, 'event_type', event_type, 'outcome', outcome,
                             'player', player, 'score', score, 'time_text', time_text, 'period', period)
           order by seq), '[]'::json)
    into evs
    from events where match_id = m.id;

  select coalesce(tag_settings, '{}'::jsonb),
         coalesce(tag_settings -> 'ourKit',
                  case when colour_primary is not null then jsonb_build_object('a', colour_primary, 'b', coalesce(colour_secondary, colour_primary)) end)
    into ts, ck
    from clubs where id = p_club;

  k := regexp_replace(lower(translate(coalesce(m.opponent, ''), 'áéíóúÁÉÍÓÚ', 'aeiouaeiou')), '[^a-z0-9]', '', 'g');
  while ts -> 'oppAlias' ? k and i < 10 loop
    k := ts -> 'oppAlias' ->> k;
    i := i + 1;
  end loop;
  ok := coalesce(ts -> 'matchKit' -> (m.id::text), ts -> 'oppKit' -> k);

  return json_build_object(
    'club',        (select name from clubs where id = p_club),
    'club_colour', (select colour_primary from clubs where id = p_club),
    'club_kit',    ck,
    'opp_kit',     ok,
    'match',       json_build_object('opponent', m.opponent, 'competition', m.competition, 'venue', m.venue),
    'events',      evs
  );
end;
$function$;
