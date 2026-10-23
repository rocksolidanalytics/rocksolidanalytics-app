# Backlog

Open items first, then decisions, then what has been done, newest first.

## Open

**All-Ireland 2026 showcase (replaces the demo)**, agreed 2026-10-22, set up 2026-10-23.
- Done: two containers, "All-Ireland 2026 - Football" and "All-Ireland 2026 - Hurling"
  (`clubs.showcase`, grade Inter-county, lifetime, no join code; see
  supabase/migrations/20261023_showcase_clubs.sql). Showcases are left out of the expected
  scores pool; the Inter-county grade keeps them in a rankings field of their own. Kerry and
  Mayo are under Opposition in the football container with kits (green with gold band, green
  with red band).
- Football owner account linked 2026-10-23 (the +aifootball address). Hurling: sign up a
  second + address when needed and link it as owner from the database side (joining by
  code would make it a player).
- First game set up: Kerry v Mayo, Championship Final, 26 July 2026, Croke Park (Mayo won
  1-20 to 1-17; use it to check the tagging). Next: both team sheets (photo reader on the
  scout sheet screen), then tag from the full match video (the RTE highlights are 22
  minutes, not enough).
- Plan (2026-10-23): tag the All-Ireland finals in painstaking detail and build the
  showcase reports (all three tiers) from them.
- After tagging: read-only viewer mode enforced in the database (visitors can look, never
  change; can build on `can_edit_club`); `?demo=1` opens a "pick a match" front door with
  match cards; club site demo button points to it; strip broadcast video links; no
  individual player ratings on show. Rock Solid Gaels stays until the showcase is live.

**Per-game tagging service**, agreed 2026-10-23: EUR 50 Summary, EUR 75 Analysis (plus up
to 5 playlists), EUR 150 Full breakdown (plus a playlist per player), and live tagging at
EUR 150 in Dublin and Wicklow (price on request elsewhere), alongside the EUR 850 lifetime
membership. One standard report: docs/REPORT-SPEC.md (version 1, tier switch on the report
screen). Pricing and terms on the club page done 2026-10-23 (booking by email). Still to do:
deliver playlist links with the report; the open decisions in the spec (shared figures,
player ratings).

**Payments**
- Automatic unlock from a Revolut payment notification, if payments become regular. Until
  then a club is unlocked by hand (see How to unlock a club under Decisions).

**St Jude's Camogie player names, parked 2026-10-23** (Tadhg checking the team sheets).
- Number-only tags for our side: most are kickouts we lost, where the number is the
  opposition player who won it (correct, leave). Genuinely unnamed St Jude's players, about
  21 tags: Dicksboro 10 Aug #13, #17 (x4), #20, #21, #22 (x2); SOPER 6 Sep #25 (x2);
  Kilmacud Crokes 14 Sep #25 (x12, incl. 2 kickout breaks won); Faughs 21 Sep #22. Need
  the team sheets. Opposition and scouting number tags are other teams and stay.
- Shortened squad names: "Caitriona Dev" (22 tags), "Sianne mcd" (1).

**Match report and dashboard, next**
- Same head-to-head bars in the live tagger stats screen (still the old green and blue
  CompareBars).
- Attacks (Performa: a possession reaching the opposition 45): an estimate from existing
  tags (shots, frees won and turnovers in the attacking third), clearly labelled, and an
  optional Attack tag for clubs that want the exact figure. Only one game has custom
  "Entry into Opp 45" tags today.
- Pricing page line, maybe later: "less than one season of a single-team video
  subscription" (Hudl GAA packs about EUR 1,550 to 3,250 a year via an Irish reseller).

**Analysis, later**
- Expected scores: once a sport passes about 2,000 shots from play, replace zones with a
  smooth distance-and-angle model so every shot gets its own expected value.
- vs Others: a club that names an app club differently from that club's own name is counted
  twice; each new club needs the same Opposition rename (worth an automatic suggestion).
  A club with one game (St Patrick's) can rank near the top; consider a minimum games count.
- Set plays: tag which play was called on a kickout and show how often it was won; export a
  play as a short video for the squad WhatsApp.
- Kits: pitch map and dashboard dots in team colours.

**App and tagging**
- Opposition starting order in the taggers' opposition grid (still 1 to 15 plus subs).
- Help assistant: the `support-agent` function is not deployed, so Help always falls back.
- Team sheet reader: optionally capture marks such as asterisks; optional stronger model for
  messy handwritten sheets.

**How the app is built**, discussed 2026-10-22. The app is one file (`index.html`, about
1 MB, no build step). Split into a built codebase only when one of these happens: a second
developer, a second app sharing code, or past roughly 50 clubs where smaller updates
matter. About a week of careful work, screen by screen, with the same checks throughout.

## Decisions

- **No backfills.** Stored data is not rewritten to fix old tagging. St Jude's hurling has
  91 points and goals (two games) stored with a score of 0, so those games show no scoring
  in the main stats; left as is by choice (2026-10-22). The expected scores pool still
  counts them, because it reads the outcome as well as the score.
- **Synonyms feed the new views only.** `event-synonyms.json` groups names for the Cards
  and Other events views; the main stats, ratings and comparisons do not use it, so club
  numbers do not move when it changes. St Jude's hurling "Turnover" events are therefore
  not in its main turnover figures (2026-10-22).
- **Score sources come from logic, not tags.** Score Source tags are not shown as a view.

- **Pricing (2026-10-22).** Free plan: 10 matches per club, shared by all its teams, every
  match counted (scouted and imported included); nothing is taken away at the limit. Lifetime
  access: EUR 850 once for the whole club, no subscription; not VAT registered. Paid through
  Revolut Business (already the business bank; chosen over Stripe), by card through the
  payment link or by bank transfer against an invoice. Terms: full refund within 14 days;
  3 months notice and a copy of the data if the service ever closes; seller Rock Solid
  Analytics, run by Tadhg Dornan, A63 AW20, Ireland.
- **Early supporters.** Bray Emmets and St Jude's have lifetime access free.
- **How to unlock a club** after payment (Supabase SQL editor; check the name and county
  match `clubs` first):
  `update club_orgs set licence = 'lifetime' where id in (select org_id from clubs where name = 'CLUB NAME' and county = 'COUNTY');`

- **One-off customers.** A team that pays for per-game reports or live tagging gets a
  lifetime container (like the showcase ones: no join code, created from the database side)
  with Tadhg as the only analyst; nobody else is added. Customers get the report page and
  playlist links, not a login. If the club later buys lifetime access, the games come with
  it (2026-10-23).

## iPad layout

**Started 2026-10-22.** On screens 1000px and wider (iPad landscape, laptops) the app uses
the width; phones and portrait iPads are unchanged. Done: Home in two columns (Match |
Analysis and Tools); dashboard sections and the Overview comparison cards in two columns,
season and match, also in the Live Stats Pad; tactical pad with the pitch on the left at
full height and plays and controls on the right (landscape); Opposition list in two
columns. Wide screens now go up to 1200px.

**Still to look at:** the opposition team page, match lists, Game film list, the video
tagger in landscape, and button sizes in the live tagger on a big screen.

## Done 2026-10-23

**Overview head-to-head bars.** The dashboard Overview (match Detailed view and season) uses
the same groups as the match report, from one function (`h2hGroups`): thick main bar, its
breakdown underneath, each card with its small icon. A match uses both kits; a season shows
per-game averages in the club main colour against its second colour (green and blue when
none are set; when the two are too close, the club keeps its colour and the opposition
takes green or blue). Measures only the old view had (possession share, accuracy, breaking
ball, defensive work rate, tackle foul rate, frees won, turnover to shot and score) sit in
a More measures card.

**All-Ireland showcase set up.** `clubs.showcase` (left out of the expected scores pool),
football and hurling containers (Inter-county grade, lifetime, no join code), Kerry and Mayo
under Opposition with kits, football owner account linked, Kerry v Mayo created and set to
Championship Final, 26 July 2026, Croke Park. See
supabase/migrations/20261023_showcase_clubs.sql.

**Scouting matches.** The scout team sheet screen reads each team from a photo (same reader
as the line-up screen; players go to their jersey number). Subs up to 30 (rows 21 to 30 open
with + More subs or when a photo fills them). New scouting matches choose a competition and
an optional round or stage. Scouted League and Championship games now count in vs Others,
as designed (untagged competition had been leaving them out).

**Match report refreshed** (learnings from an inter-county Performa report). Team colours
from the kits throughout (score, tables, scorers, Match Stats; darker kit colours when
printed). The Key Stats table is now Match Stats, after the scorers: head-to-head bars
split in the two colours, a thick bar per main measure (possessions, shots from play,
scoreable frees, restarts won, tackles, ball lost, rucks and cards when tagged) with its
breakdown in thinner bars underneath, and a short note on the terms. Shot and restart maps
are now the app's own (PitchMap, KickoutMap and legends drawn off screen and copied in),
replacing the report's simpler copy. Each team's jersey sits beside the score; a side with
no kit wears a stand-in (green with blue sleeves for us, the reverse for them).

**St Jude's Camogie player duplicates merged** (data change, asked for by Tadhg). AMD into
Anna Marie Durkan (2 tags; now 21) and Molly C into Molly Crowther (19 tags; now 20); the
AMD and Molly C squad entries removed (squad now 36). Trailing spaces and curly apostrophes
removed from names (25 tags, 8 line-up rows), so "Aoife Higgins " and "Emma O’Byrne" no
longer show as separate players.

## Done 2026-10-22

**Free plan and lifetime access.** The licence sits on the club, not the team: new
`club_orgs` table, each team linked by `clubs.org_id`; a new team joins the club with the
same name and county, otherwise it starts a new free club; only the database side can move
a team or change a licence. A trigger refuses an 11th match for a free club with a message
pointing to the email; `club_usage` gives the app the count. Home shows owners and analysts
on the free plan "X of 10 free matches used" with a bar and an Unlock lifetime button (opens
the pricing section); players and lifetime clubs see nothing. Import checks the allowance
before saving anything. Clubs grouped: Bray Emmets (3 teams, 22 matches, lifetime), St
Jude's (2, 27, lifetime), Eadestown GAA (2 used), St Patrick's (1), Kill (0). Kill GAA test
deleted. See supabase/migrations/20261022_club_licence_and_cap.sql; tested (cap refuses at
the limit, scouting included; a new Bray team joins Bray as lifetime).

**Pricing, terms and privacy.** Pricing section on the club page: free plan and lifetime
(EUR 850), Pay by card (Revolut payment link), Request an invoice (email with club, county
and invoice address), and a note to email the club name after paying. New terms.html and
privacy.html, linked from the footer and the pricing section. Privacy lists where data
goes: Supabase (EU, Stockholm), Anthropic (team sheet photos), GitHub Pages, YouTube,
Revolut.

**Write rules by role.** Reading stays club-wide; adding, changing and deleting matches,
tags, line-ups, squads and playlists only for the owner and analysts (`can_edit_club`);
club settings the same. Demo visitors can add and change their own new rows but not the
demo data (before 22 Oct) or the demo club settings. `live_match` (unused) no longer
writable. App: players no longer see New match or Import data; Game film playlists and
Opposition team pages are read-only for players with a message. Tested as a Bray player,
a Bray analyst and a demo visitor. See supabase/migrations/20261022_write_rules_by_role.sql.

**Library versions pinned.** React and React DOM 18.3.1, supabase-js 2.118.0 (the versions
users already ran), PapaParse 5.4.1, so an outside release can no longer change the app.

**Half-time view.** Live tagger stats (Key Callouts) open with a half-time card from 25
minutes, at half-time and in the second half: up to three talking points ranked by the
biggest gaps (restarts and where they were lost, shooting, turnovers and how, frees given
away, and at half-time anything well off the usual first half from the last 10 games),
their danger player, where their restarts go and are won, the last 10 minutes, and a Share
button (phone share sheet, else WhatsApp). Nothing is said about a measure until there is
enough of it. The Live Stats Pad shows the same card for a match in progress. Fixes: header
reads HALF TIME with the time; the restart speed x length grid uses the same direction and
half filter as the zone grid, so lengths agree; no empty 10-minute column. The video tagger
has no live stats screen, so it is unchanged.

**Expected scores from play, pooled across clubs.** xS covers shots from play only (frees
have their own stats) everywhere it appears: summary, zone grid, players, Periods, report.
Zone rates come from every tagged game of the same sport, both sides (`xp_baseline`,
counts only, demo left out), blended toward a typical rate where a zone has few shots (20
shots of weight). Bands: football inside 21m, 21-45m, beyond 45m; hurling and camogie
inside 20m, 20-45m, 45-65m, beyond 65m. Replaces the old baseline, which measured each club
against its own season and never used the shared function (its zone keys did not match).
The grid shows scores/shots per zone; green or red only where the gap is clear and beyond
chance; best and worst zones written out; the panel says what the rates are based on.
See supabase/migrations/20261022_xp_baseline_from_play.sql. Pool on 2026-10-22: football
748 shots, 19 games, 13 teams; hurling 327 shots, 7 games, 8 teams (Bray 173, St Jude's
154); camogie 823 shots, 22 games, 20 teams.

**Score sources by logic.** `scoreSourceOf` reads every gain and loss (including Turnover
won/lost tags, Turnover won and tackle dispossessions), stops at half-time, and when it
meets a tag where the scoring team had lost the ball it puts the score down to a turnover
won back instead of calling it unclear. 95% agreement with the 82 hand-tagged sources at
St Jude's hurling, up from 44%. The panel notes how many scores were traced past a missing
or misplaced tag.

**Season Read rewritten.** Instead of restating the record and averages, it says what they
mean (only lines with enough behind them): form (last five and whether the margin is up or
down on the season), what decides games (the measure that moves most between wins and the
rest), who the scoring depends on (top scorer share, share from frees, top two together),
where scores come from and where conceded scores start, the record when under half of own
restarts are kept (only when that clearly differs), and finishing from play against what the
chances usually bring. Built outside the stats engine; fewer than three games keeps the
short notes. Laid out as points: a coloured label (green strength, red worry, grey neutral),
a bold headline with the key numbers, a quieter detail line, and W/D/L chips for the last
five.

**Restart timeline.** Restarts tab, one match (also in the Live Stats Pad): every restart
of the chosen side in order. Dots: height = seconds to take, green won / red lost, a dashed
line for the typical time. A strip underneath shows what came before the next restart:
green bar up when the side taking it scored, red bar down when the other side did, one
step per point. Half-time line, tap any restart for detail, one-line read on top.

**Turnovers that led to a score against.** On the Players tab (season and match), in the
Live Stats Pad and in the live tagger stats (Detailed), always closed by default. Rate of
punished turnovers (they scored before the ball was won back) against the team rate; only
players with 8+ turnovers in a season or 2+ in a match; red only when 10+ points above the
team rate with 3+ punished.

**Cards and other events.** Discipline view on Defence (cards for us and them; in order for
a match, game by game and by player for a season). An Other tab for every event with no view
of its own (counts, outcomes, top players), shown only when there is something in it. Names
that mean the same thing are grouped by `event-synonyms.json` (see the event-synonyms
skill).

**Match ratings.** The opposition is rated on the same yardstick, from their side of the
ball: match card shows both with a verdict (outplayed them, evenly matched, they played
better, or a result against the run of play) and their rating per measure; the season
table has a Us / Them / +/- switch (+/- shows ours minus theirs in green or red, and
sorting and averages follow the switch). Our own ratings are unchanged.

**Set plays on the tactical pad.** Analysts build a play as steps: set the shape, tap + Step,
move the jerseys and ball, repeat. Play glides between steps (1x or half speed) with faint
trails for every run; step back and forward by hand. Move / Arrow / Zone / Undo mark tools;
each mark belongs to the step it is drawn on (kept in that step under `_d`). Plays are saved
by name on the club (`tag_settings.plays`) with rename, copy, delete, delete step and
+ New play (back to the starting line-up). Players see and watch saved plays, read-only.
Dots use the club kit colour against blue, with the tagger clash check.

**vs Others comparison.** The dashboard ranks a club against every team at its sport and
grade: other clubs using the app plus the teams they have played or scouted (League and
Championship), see supabase/migrations/20261022_club_rankings2.sql. Opponents count for
scores, shot and restart efficiency; line and keeper numbers compare app clubs only. The tab
says what the field is and falls back to the clubs-only `club_rankings` if the new function
is missing. Data tidy: Bray football sees St Pats as St Patrick's and St Patrick's sees Bray1
as Bray Emmets (`tag_settings.oppName`); the two Ta v Tb test matches in St Jude's hurling
were deleted. Fields after the tidy: Wicklow senior football 10 teams, senior hurling 8,
camogie 16.

**Kits and crests, steps 2 and 3.**
- Both taggers use team colours by default (teamCols): each kit main colour, or its second
  when the main is too dark to read, lightened in OKLab until it reads on the dark tagger.
  When the two are too close it tries the other side's second colour, then ours, then falls
  back to green (us) and blue (them). Small jerseys beside the team names in the scoreboards.
- Kits card at the top of the line-up screen with a one-match opposition kit
  (`tag_settings.matchKit`). Fan Zone shows jerseys and kit colours; the public link gets
  them from `live_board` (supabase/migrations/20261022_live_board_kits.sql).
- Opposition crest upload on each team page (64px, `tag_settings.oppCrest`, carried by
  merges). Match lists show the opposition crest, else their kit. Taggers and Fan Zone show
  crests; the public link reads them from `live_crests` (applied;
  supabase/migrations/20261022_live_crests.sql).

**Demo.** The old static `demo/` page redirects to `?demo=1` (the live app). The demo club
(Rock Solid Gaels) has a maroon and white hooped kit, kits for its eight opponents (Dublin
and Mayo in their real colours) and three sample set plays: short kickout to the corner,
long kickout to the drop zone, and pressing their kickout.

## Done 2026-10-21

**Kits and crests, step 1.** Jersey designer (KitPicker: plain, hoops, stripes, halves,
sash, band; main, second and number colour). Club kit on the home banner sheet (Crest / Kit
tabs), stored as `tag_settings.ourKit`; saving also sets `colour_primary` /
`colour_secondary`. Opposition kits on each team page (`tag_settings.oppKit` by team key),
shown in the Opposition list; merges carry the kit across. Add a team before any match
(`tag_settings.oppTeams`), with kit and notes; delete it while it has no matches. Crest
upload on the home banner, stored small on `clubs.crest`.
