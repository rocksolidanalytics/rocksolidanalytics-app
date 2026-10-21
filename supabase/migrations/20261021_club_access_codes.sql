-- Club access codes and profile guard.
-- Paste the whole file into Supabase > SQL Editor > New query, then Run.
-- Safe to run more than once.

-- 1. Single-use access codes for creating a new club.
create table if not exists public.club_codes (
  code text primary key,
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  used_at timestamptz,
  used_by uuid,
  club_id uuid references public.clubs(id) on delete set null
);
alter table public.club_codes enable row level security;
-- No policies: the app cannot read or list codes, only check one.

create or replace function public.check_club_code(p_code text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.club_codes c
    where upper(c.code) = upper(trim(p_code)) and c.active and c.used_at is null
  );
$$;

create or replace function public.create_club(
  p_code text, p_name text, p_county text, p_sport text,
  p_colour_primary text, p_colour_secondary text, p_verified boolean, p_grade text
) returns public.clubs
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  cc public.club_codes;
  nc public.clubs;
begin
  if uid is null then raise exception 'Sign in first'; end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'Sign up with an email address to create a club';
  end if;
  if exists (select 1 from public.profiles where id = uid and club_id is not null) then
    raise exception 'This account already belongs to a club';
  end if;
  select * into cc from public.club_codes where upper(code) = upper(trim(p_code)) for update;
  if not found or not cc.active or cc.used_at is not null then
    raise exception 'That club code is not valid or has already been used';
  end if;
  insert into public.clubs (name, county, sport, colour_primary, colour_secondary, verified, created_by, grade)
  values (p_name, p_county, p_sport, p_colour_primary, p_colour_secondary, coalesce(p_verified, false), uid, coalesce(p_grade, 'Senior'))
  returning * into nc;
  update public.profiles set club_id = nc.id where id = uid;
  update public.club_codes set used_at = now(), used_by = uid, club_id = nc.id where code = cc.code;
  return nc;
end;
$$;

revoke all on function public.check_club_code(text) from public, anon;
revoke all on function public.create_club(text, text, text, text, text, text, boolean, text) from public, anon;
grant execute on function public.check_club_code(text) to authenticated;
grant execute on function public.create_club(text, text, text, text, text, text, boolean, text) to authenticated;

-- 2. Clubs are now only created through create_club.
drop policy if exists "club insert" on public.clubs;

-- 3. An account's club and role change only through join_club / create_club,
--    never by someone editing their own profile row directly.
create or replace function public.profiles_guard()
returns trigger language plpgsql
as $$
begin
  if current_user in ('authenticated', 'anon')
     and (new.club_id is distinct from old.club_id or new.role is distinct from old.role) then
    raise exception 'Club and role can only be changed through the app';
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.profiles_guard();

-- 4. Codes are added separately (never commit real codes; this repo is public):
--    insert into public.club_codes (code, note) values ('RSA-XXXXX', 'Who it is for');
