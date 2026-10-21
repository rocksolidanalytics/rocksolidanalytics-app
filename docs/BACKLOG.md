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
- ~~Kits beside team names in match lists; crests in the taggers, Fan Zone and opposition
  pages~~: done 2026-10-22. Opposition crest upload on each team page (64px, stored as
  `tag_settings.oppCrest` by team key, carried by merges). Match lists show the opposition
  crest, else their kit. Taggers and Fan Zone show crests; the public link reads them once
  from `live_crests` (applied 2026-10-22), see supabase/migrations/20261022_live_crests.sql.
- Pitch map and dashboard dots in team colours.

## vs Others comparison

**Done 2026-10-22.** The dashboard ranks a club against every team at its sport and grade:
other clubs using the app plus the teams they have played or scouted (League and
Championship), see supabase/migrations/20261022_club_rankings2.sql. Opponents count for
scores, shot and restart efficiency; line and keeper numbers compare app clubs only. The
tab says what the field is (N clubs using the app plus M teams they played or scouted) and
falls back to the clubs-only `club_rankings` if the new function is missing.

- Data tidy, done: Bray football sees St Pats as St Patrick's and St Patrick's sees Bray1 as
  Bray Emmets (`tag_settings.oppName`), so neither is counted twice. The two Ta v Tb test
  matches in St Jude's hurling were deleted.
- Fields after the tidy: Wicklow senior football 10 teams (2 clubs + 8 opponents), senior
  hurling 8 (Bray Emmets, St Jude's + 6 opponents), camogie 16 (1 club + 15 opponents).

**Still to do:**
- A club that names an app club differently from that club's own name is counted twice.
  Each new club needs the same Opposition rename; worth an automatic suggestion later.
- Small samples: a club with one game (St Patrick's) can rank near the top. Consider a
  minimum games count before showing a rank.

## Set plays on the tactical pad

**Done 2026-10-22.** Analysts build a play as steps: set the shape, tap + Step, move the
jerseys and ball, repeat. Play glides between steps (1x or half speed) with faint trails for
every run; step back and forward by hand. Plays are saved by name on the club
(`tag_settings.plays`, each step the spot of every jersey and the ball), with rename, copy,
delete and delete step. Players see the saved plays and can watch them, not edit them. Dots
use the club kit colour against blue, with the tagger clash check.

**Later:**
- ~~Arrows or zones drawn on a step~~: done 2026-10-22. Move / Arrow / Zone / Undo mark
  tools while a play is open; each mark belongs to the step it is drawn on (kept in that
  step under `_d`), shows while that step is on screen, and players see them read-only.
- Tag which play was called on a kickout and show how often it was won.
- Export a play as a short video for the squad WhatsApp.

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
