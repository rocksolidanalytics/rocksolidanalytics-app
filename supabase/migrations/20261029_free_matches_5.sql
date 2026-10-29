-- New clubs on the free licence get 5 free matches instead of 10. Only the default changes:
-- clubs created before 2026-10-29 keep the match_limit they joined with (10).
alter table public.club_orgs alter column match_limit set default 5;
comment on column public.club_orgs.match_limit is 'Free matches for a free-licence club; 5 for clubs created from 2026-10-29, 10 for clubs created before.';
