# Backlog

Agreed ideas waiting to be built, newest first.

## Team kits and crests

Agreed 2026-10-21.

**Step 1, done 2026-10-21:**
- Jersey designer (KitPicker): plain, hoops, stripes, halves, sash, band; main, second and
  number colour. Club kit on the home banner sheet (Crest / Kit tabs), stored as
  `tag_settings.ourKit`; saving also sets `colour_primary` / `colour_secondary`.
- Opposition kits on each team page, stored as `tag_settings.oppKit` by team key, shown in
  the Opposition list; merges carry the kit across.
- Add a team: set up an opponent before any match (`tag_settings.oppTeams`), with kit and
  notes; delete it while it has no matches.
- Crest upload on the home banner, stored small on `clubs.crest`.

**Step 2, done 2026-10-22 (colours):**
- Both taggers use team colours by default (teamCols): each kit main colour, or its second
  when the main is too dark to read (navy with sky blue reads as sky blue), lightened in
  OKLab until it reads on the dark tagger. When the two are too close it tries the other
  side's second colour, then ours, then falls back to green (us) and blue (them). A side
  with no kit keeps its usual colour. Kits are read fresh when a tagger opens.
- Small jerseys beside the team names in both taggers' scoreboards.

**Still to do:**
- ~~Line-up screen and Fan Zone kits~~: done 2026-10-22. Kits card at the top of the line-up
  screen with a one-match opposition kit (`tag_settings.matchKit` by match id, read by both
  taggers and Fan Zone). Fan Zone shows jerseys and kit colours; the public link gets them
  from `live_board` (club_kit, opp_kit), see supabase/migrations/20261022_live_board_kits.sql.
- Kits beside team names in match lists; crests in the taggers, Fan Zone and opposition pages.
- Pitch map and dashboard dots in team colours.

## Payments (Stripe)

Discussed 2026-10-21. Waiting on a price decision.

- Start manual: a Stripe Payment Link for a one-time club licence, reply with a club code.
- Pricing section on the club page, terms of sale and privacy pages.
- Later: Stripe webhook to a Supabase function that issues the club code and emails it.

## Other open items

- Opposition starting order in the taggers' opposition grid (still 1 to 15 plus subs).
- Help assistant: the `support-agent` function is not deployed, so Help always falls back.
- Team sheet reader: optionally capture marks such as asterisks; optional stronger model for
  messy handwritten sheets.
