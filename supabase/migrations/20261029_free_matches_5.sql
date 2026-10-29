-- Clubs on the free licence get 5 free matches instead of 10: the default for new clubs, and
-- (decided later the same day) the three existing free clubs too, all still under 5 when changed.
alter table public.club_orgs alter column match_limit set default 5;
update public.club_orgs set match_limit = 5 where licence = 'free' and match_limit <> 5;
comment on column public.club_orgs.match_limit is 'Free matches for a free-licence club (5); lifetime clubs have no limit.';
