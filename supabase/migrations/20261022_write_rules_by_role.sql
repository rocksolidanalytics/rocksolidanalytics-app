-- Who can change club data.
-- Reading stays as before: anyone in the club (my_club_ids) can see its matches, events,
-- line-ups, squad and playlists. Changing them (insert, update, delete) is now limited to
-- the owner and analysts of that club; players can read but not change. Before this, any
-- club member could change or delete anything; the app only hid the buttons.
-- Demo club: visitors join as analysts so they can try tagging. They can add new matches
-- and tags and change or delete what they added, but the demo data itself (created before
-- 22 October 2026) cannot be changed or deleted, and the demo club settings (kits, set
-- plays) cannot be changed by visitors.
-- live_match: an old table the app no longer uses; anyone could write to it. Writes removed.

create or replace function public.can_edit_club(p_club uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $function$
  select exists (select 1 from profiles where id = auth.uid() and club_id = p_club and role in ('owner', 'analyst'))
      or exists (select 1 from clubs where id = p_club and created_by = auth.uid());
$function$;

grant execute on function public.can_edit_club(uuid) to authenticated;

-- Same rules on each club data table.
do $$
declare t text;
begin
  foreach t in array array['matches', 'events', 'appearances', 'players', 'playlists'] loop
    execute format('drop policy if exists %I on public.%I', t || ' mine', t);
    execute format('drop policy if exists %I on public.%I', t || ' read', t);
    execute format('drop policy if exists %I on public.%I', t || ' insert', t);
    execute format('drop policy if exists %I on public.%I', t || ' update', t);
    execute format('drop policy if exists %I on public.%I', t || ' delete', t);
    execute format('create policy %I on public.%I for select using (club_id in (select public.my_club_ids()))', t || ' read', t);
    execute format('create policy %I on public.%I for insert with check (club_id in (select public.my_club_ids()) and public.can_edit_club(club_id))', t || ' insert', t);
    execute format('create policy %I on public.%I for update using (club_id in (select public.my_club_ids()) and public.can_edit_club(club_id) and (club_id <> %L::uuid or created_at >= %L::timestamptz)) with check (club_id in (select public.my_club_ids()) and public.can_edit_club(club_id))', t || ' update', t, 'dddddddd-0000-4000-a000-000000000001', '2026-10-22 00:00:00+00');
    execute format('create policy %I on public.%I for delete using (club_id in (select public.my_club_ids()) and public.can_edit_club(club_id) and (club_id <> %L::uuid or created_at >= %L::timestamptz))', t || ' delete', t, 'dddddddd-0000-4000-a000-000000000001', '2026-10-22 00:00:00+00');
  end loop;
end $$;

-- Club settings (name, colours, kits, crest, set plays, opposition): owners and analysts only,
-- and never the demo club.
drop policy if exists "club update" on public.clubs;
create policy "club update" on public.clubs for update
  using (public.can_edit_club(id) and id <> 'dddddddd-0000-4000-a000-000000000001'::uuid)
  with check (public.can_edit_club(id) and id <> 'dddddddd-0000-4000-a000-000000000001'::uuid);

drop policy if exists "Allow anon insert" on public.live_match;
drop policy if exists "Allow anon update" on public.live_match;
