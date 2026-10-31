-- Playlists across games: a playlist may hold clips from more than one match of the club.
-- Such a playlist has no match of its own (match_id null) and each clip in clips names its
-- match_id. One-game playlists are unchanged.
alter table public.playlists alter column match_id drop not null;

-- The shared link page: a one-game playlist returns its match video as before; a playlist
-- across games returns videos, one entry per match of the same club that its clips use.
create or replace function public.clip_playlist(p_token text)
returns json
language sql
stable security definer
set search_path to 'public'
as $function$
  with hit as (
    select p.name, p.clips, p.match_id, p.club_id, 1 as pref
    from public.playlists p
    where p.token = p_token
    union all
    select coalesce(pl->>'name','Clips'), coalesce(pl->'events','[]'::jsonb), m.id, m.club_id, 2
    from public.matches m,
         lateral jsonb_array_elements(coalesce(m.playlists,'[]'::jsonb)) pl
    where pl->>'token' = p_token
  ), one as (
    select * from hit where length(p_token) >= 12 order by pref limit 1
  )
  select case when o.match_id is not null then (
    select json_build_object(
      'name',       coalesce(o.name,'Clips'),
      'opponent',   m.opponent,
      'match_date', m.date,
      'video_url',  m.video_url,
      'throwin',    m.video_throwin,
      'halfstart',  m.video_halfstart,
      'clips',      coalesce(o.clips,'[]'::jsonb))
    from public.matches m where m.id = o.match_id)
  else json_build_object(
    'name',   coalesce(o.name,'Clips'),
    'clips',  coalesce(o.clips,'[]'::jsonb),
    'videos', coalesce((
      select json_object_agg(m.id, json_build_object('video_url', m.video_url, 'opponent', m.opponent, 'date', m.date))
      from public.matches m
      where m.club_id = o.club_id
        and m.id::text in (select c->>'match_id' from jsonb_array_elements(coalesce(o.clips,'[]'::jsonb)) c)), '{}'::json))
  end
  from one o;
$function$;
