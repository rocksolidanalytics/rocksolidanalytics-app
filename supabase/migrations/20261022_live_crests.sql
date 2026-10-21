-- Fan Zone crests for the public link: the club crest and the crest of the team it is playing.
-- Fetched once when the page opens, so the board refresh every 10 seconds stays small.
-- The opposition crest is tag_settings.oppCrest for the opponent key, following merges (oppAlias).
create or replace function public.live_crests(p_club uuid)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare v_opp text; ts jsonb; k text; i int := 0; v_crest text;
begin
  select opponent into v_opp
    from matches
    where club_id = p_club
      and coalesce(scouting, false) = false
      and coalesce(status, '') <> 'final'
      and (our_score is null or trim(coalesce(our_score, '')) = '')
    order by date desc nulls last
    limit 1;

  select coalesce(tag_settings, '{}'::jsonb), crest into ts, v_crest from clubs where id = p_club;

  k := regexp_replace(lower(translate(coalesce(v_opp, ''), 'áéíóúÁÉÍÓÚ', 'aeiouaeiou')), '[^a-z0-9]', '', 'g');
  while ts -> 'oppAlias' ? k and i < 10 loop
    k := ts -> 'oppAlias' ->> k;
    i := i + 1;
  end loop;

  return json_build_object(
    'club', v_crest,
    'opp',  case when v_opp is null then null else ts -> 'oppCrest' ->> k end
  );
end;
$function$;

grant execute on function public.live_crests(uuid) to anon, authenticated;
