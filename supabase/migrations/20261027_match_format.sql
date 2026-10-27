-- Match format: half length, three-period games, extra time, penalty shootout.
-- All columns are nullable with no backfill: null keeps the old meaning
-- (two 30-minute halves, no extra time, no shootout), so matches already
-- tagged with a 30:00 second-half start are unchanged.

alter table public.matches
  add column if not exists half_mins    smallint,              -- minutes per period; null = 30
  add column if not exists periods      smallint,              -- normal-time periods; null = 2 (3 for 3x20 games)
  add column if not exists extra_time   boolean default false, -- match went to extra time
  add column if not exists et_mins      smallint,              -- minutes per extra-time period; null = 10
  add column if not exists period_marks jsonb,                 -- per period beyond 2: {"3":{"added_secs":..,"video_start":..}}
  add column if not exists penalties    jsonb;                 -- shootout: {"winner":"us"|"opp","kicks":[{"side","player_id","name","scored"}]}

alter table public.matches
  add constraint matches_half_mins_chk check (half_mins is null or half_mins between 10 and 45),
  add constraint matches_periods_chk   check (periods is null or periods in (2, 3)),
  add constraint matches_et_mins_chk   check (et_mins is null or et_mins between 5 and 20);
