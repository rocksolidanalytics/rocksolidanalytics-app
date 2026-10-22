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

## Expected scores from play, pooled across clubs

**Done 2026-10-22.** xS covers shots from play only (frees have their own stats). Zone rates
come from every club of the same sport in the app (`xp_baseline`, counts only, demo left
out), blended toward a typical rate where a zone has few shots (20 shots of weight), so
thin zones cannot set wild rates. Bands: football inside 21m, 21-45m, beyond 45m; hurling
and camogie inside 20m, 20-45m, 45-65m, beyond 65m. Replaces the old baseline, which
measured each club against its own season and never used the shared function (its zone
keys did not match). See supabase/migrations/20261022_xp_baseline_from_play.sql.
Pool on 2026-10-22: football 748 shots from 3 clubs, hurling 327 from 2, camogie 823 from 1.

**Later:** once a sport passes about 2,000 shots from play, replace zones with a smooth
distance-and-angle model so every shot gets its own expected value.

## Restart timeline and simpler expected scores

**Done 2026-10-22.**
- Restarts tab, one match: every restart of the chosen side in order, height = time to
  take, green won / red lost, circle = score for / triangle = score against / square = no
  score before the next restart, bigger for 2 or 3 points, half-time line, tap for detail,
  and a one-line read (typical time, quick v slow won, scores for and against).
- Expected scores grid: scores/shots per zone only; green or red only where the gap is
  clear and beyond chance; best and worst zones written out; frees use the free table.

**Next, if wanted:** turnovers by player that led to a score against, as a rate against the
team average with a minimum number of turnovers, so busy players are not flagged for
having the ball most.

## Cards, score sources and other events

**Done 2026-10-22.** New dashboard views, season and per match: Discipline (cards for us
and them, in order for a match, game by game and by player for a season) on Defence;
(Tagged score sources was removed on 2026-10-22: sources are worked out by logic, which
now reads Turnover won/lost tags, stops at half-time and infers a missing regain instead of
calling a score unclear; 95% agreement with the 82 hand-tagged sources at St Jude's
hurling, up from 44%);
an Other tab for every event with no view of its own (counts, outcomes, top players),
shown only when there is something in it.
Names that mean the same thing are grouped by `event-synonyms.json` (see the
event-synonyms skill). These views only; the main stats do not use it, and stored data is
never rewritten.

## Half-time view

**Done 2026-10-22.** Live tagger stats (Key Callouts) open with a half-time card from 25
minutes, at half-time and in the second half: up to three talking points ranked by the
biggest gaps (restarts and where they were lost, shooting, turnovers and how, frees given
away, and at half-time anything well off the usual first half from the last 10 games),
their danger player, where their restarts go and are won, the last 10 minutes, and a
Share button (phone share sheet, else WhatsApp). Nothing is said about a measure until
there is enough of it. The Live Stats Pad shows the same card for a match in progress.
Fixes: header reads HALF TIME with the time; the restart speed x length grid uses the same
direction and half filter as the zone grid, so lengths agree; no empty 10-minute column.
The video tagger has no live stats screen, so it is unchanged.

## Opposition match rating

**Done 2026-10-22.** The match rating (attack, defence, restarts, ranked 0 to 100 against
the other games of the club) now also rates the opposition on the same yardstick, from
their side of the ball, so the two numbers for a game compare directly. Match card shows
both with a verdict (outplayed them, evenly matched, they played better, or a win or loss
against the run of play); the breakdown adds their rating per measure; the season ratings
table adds a THEM column and average. Our own ratings are unchanged.

## How the app is built

Discussed 2026-10-22. The app is one file (`index.html`, about 1 MB, no build step).

- **Pin library versions** (10 minutes, do soon): React and Supabase load as `react@18` and
  `supabase-js@2`, so a new release reaches every user with no deploy from us and could
  break sign-in or saving. Pin exact versions, as PapaParse already is.
- **Split into a built codebase** only when one of these happens: a second developer, a
  second app sharing code, or past roughly 50 clubs where smaller updates matter. About a
  week of careful work, screen by screen, with the same checks running throughout.

## All-Ireland 2026 showcase (replaces the demo)

Agreed 2026-10-22. Tadhg tags 3 or 4 All-Ireland 2026 games first (football and hurling),
then we gate and present them.

- Setup: two showcase clubs, "All-Ireland 2026 - Football" and "All-Ireland 2026 - Hurling"
  (one sport per club), each with its own analyst sign-in (Gmail plus addresses). Kept out
  of vs Others.
- Tagging: each game as a scouting match ("County A v County B"), Championship, both team
  sheets, both counties set up under Opposition with kit and crest, same tagging detail for
  every game.
- After tagging: read-only viewer mode enforced in the database (visitors can look, never
  change); `?demo=1` opens a "pick a match" front door with match cards; club site demo
  button points to it; strip broadcast video links; no individual player ratings on show.
  Rock Solid Gaels stays until the showcase is live.

## Security: tighten write rules by role

Found 2026-10-22. RLS on matches, events and appearances lets any club member write
(players and demo visitors included); the app only hides the buttons. Limit insert, update
and delete to analysts before paying clubs come on.

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
