# Backlog

Open items first, then decisions, then what has been done, newest first.

## Open

**Parked until the Christmas break: auto-tagging from video (suggested tags).** Idea agreed
2026-11-12, not started. Bray Emmets football has 16 matches with video and a timestamp on each
event: the training set for a separate video model that suggests tags in the Video tagger for an
analyst to accept or edit (not fully automatic, and not Claude itself being trained).
- Step 1 (free): timestamp audit. Spot-check ~50 events over 3-4 matches against the video: is
  video_ts on the moment or a second or two late, and is each throw-in sync right.
- Step 2 (free): originals from YouTube Studio onto a local drive (16 matches ~30-60 GB); first
  experiments on Kaggle (~30 free GPU hours a week) or Colab. Hold out ~4 matches for testing.
  Start with when and what (kickout, shot, score, wide); team, outcome, tackles, player and pitch
  spot come later and are harder.
- Step 3 (only if step 2 works): cheap storage (Backblaze B2 / Cloudflare R2, ~EUR 0.50-1 a month
  for 50 GB), a small Python service, "suggested" tags in the tagger; every accept or fix becomes
  new training data. Rented GPU runs ~EUR 5-20 each if Kaggle is not enough.
- Needs: written consent from the club and players for footage used in training (GDPR, minors);
  footage kept private. Consistent filming (high, wide, fixed, 1080p) helps as much as more games.

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
  1-20 to 1-17; use it to check the tagging). Both team sheets loaded 2026-10-23 (26 each).
  Next: tag from the full match video (the RTE highlights are 22 minutes, not enough). Both containers have the detailed video events switched on
  (goalkeeper action, player possession, attack, score assist, duel, breaking ball,
  throw-in).
- Kerry v Mayo tagged in full 2026-10-25 (960 tags; scores match the result, 1-17 to 1-20).
  Checked and tidied: keeper on Clifford's goal set to Jack Livingstone, two Kerry tackle
  names cleared (they named the Mayo ball carriers; fill in the tacklers from the video),
  David Clifford's assist on Paudie Clifford's point set to Point, Carney's 2-pointer and
  O'Shea's point nudged to the right side of the 40m arc; Enda Hession's assist moved from
  38:40 to 37:50, just after Tommy Conroy's point (a duplicate 2-pointer assist deleted).
  Line-up: Paul Towey started for Mayo in place of Conor Loftus (Towey now starting position
  11 wearing 23, Loftus a sub wearing 11). Tadhg Morley's one tag (1:22) was Mayo's Paul Towey,
  fixed by Tadhg. Kerry's line-up left as published (Tom O'Sullivan,
  first half only, shows as a sub; it only affects starts and subs). Tagging checked and
  done.
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
screen). Pricing and terms on the club page done 2026-10-23 (booking by email; reports back
within 3 days of the video and team sheets; live tagging travel included in Dublin and
Wicklow, full refund if the game is postponed; footage must be theirs to share). Still to do:
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
- Attacks (Performa: a possession reaching the opposition 45): an estimate from existing
  tags (shots, frees won and turnovers in the attacking third), clearly labelled, and an
  optional Attack tag for clubs that want the exact figure. Only one game has custom
  "Entry into Opp 45" tags today.
- Pricing page line, maybe later: "less than one season of a single-team video
  subscription" (Hudl GAA packs about EUR 1,550 to 3,250 a year via an Irish reseller).

**Detailed video events, next** (report v2 live since 2026-10-26, see Done; still to do)
- Score by period uses the raw clock, so on video-tagged games the 30-40 block mixes
  first-half stoppage time with the start of the second half (Kerry v Mayo). Option: blocks
  per half (1st half 0-10 ... 30+, 2nd half 0-10 ... 30+). Needs a yes, it changes every report.
- Duels and breaking ball by player; goalkeeper restarts by keeper (the restart tag names the
  winner, not the taker).
- The app screens (Overview, Attack tab) do not show the video events yet; only the report does.
- The event editor offers per-match events, but `matches` has no `custom_events` column, so
  saving events for a single match fails; club-wide events work (found 2026-10-23).

**Match format, still open** (built 2026-10-27, see Done).
- Edit match does not offer the match length. Changing it on a match already tagged would move
  its second-half times, so it should only be allowed before tagging starts.
- The stats half filter (1st / 2nd) leaves extra-time and 3rd-period events in All only, and
  the report score-by-half table has no extra-time rows yet.
- Club grades are Senior / Intermediate / Junior, with no Inter-county, so 35 minutes can't
  default from grade. The last choice is remembered per club instead.
- Penalty kicks are kept on the match (matches.penalties), not as events, so they are not in
  player stats or the timeline.

**Player scorecard, still open** (built 2026-10-28, see Done).
- Ball lost is per game, not per possession: busy players lose the ball more. Player
  possessions are only tagged in the video tagger; once enough are tagged, show a loss rate.
- Keeper high-ball column waits on Goalkeeper action tags (8 so far).
- Colour only: red and green cells are hard to tell apart for some colour-blind coaches. If
  one says so, add a small symbol back on red cells.
- Last 3 games are the three most recent games each player played, not the team last three.

**Founding offer, still open** (drafted 2026-10-29).
- The app knows only free and lifetime clubs. The EUR 350 annual plan needs a licence with an
  end date (and what happens when it lapses) before the founding offer closes; the terms
  promise its renewal and cancelling terms before then.
- Founding places are not counted anywhere: keep a tally of founding sales (club_orgs could
  carry a founding flag), and optionally show places left on the club page. There are now
  10 places, not 20 (2026-10-30).
- WhatsApp help is promised on the terms, club page and Wicklow deck, but no number or link
  is published: add one when Tadhg has it.

**Video tagger design follow-ups** (from the 2026-10-27 review, see Done).
- Bring the live and video taggers onto one shared tagging core, next time a feature touches
  both (score, end match, offline queue and period logic exist twice).
- Store new tags by video position and derive the match clock from the period marks.

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
- Desktop and wide-screen video tagger needs a proper layout (Tadhg 2026-10-25, screenshot
  at about 1280 wide). With the dock open the right event column is hidden behind it, so only
  half the events show; the left column stretches 4 events to huge buttons with tiny labels;
  the bottom strip runs under the dock and Finish & save overlaps it; the video leaves a lot
  of black space. Ideas: cap button height and grow the label, put the dock beside the right
  column rather than over it (or move the right column next to the left when the dock is
  open), keep the strip within the video width, and use the spare height for a bigger video.
- Opposition starting order in the taggers' opposition grid (still 1 to 15 plus subs).
- Help assistant: the `support-agent` function is not deployed, so Help always falls back.
- Team sheet reader: optionally capture marks such as asterisks; optional stronger model for
  messy handwritten sheets.

**Wicklow GAA presentation, still open** (deck made 2026-10-29, see Done 2026-10-30).
- Fill the placeholders: the county price on the offer slide, the date on the cover, the
  dates on the next-steps slide.
- Confirm Bray Emmets are happy for their real data to be shown, and that Wicklow GAA is
  happy for its crest and the academy logo to appear as "prepared for".
- Under-18 player logins: agree with Wicklow's Children's Officer (the data slide says so).
- Decide the county deal's shape: lifetime (with an early-closure part-refund, for example
  full in year 1, half in year 2) or a fixed term such as 5 years. A solicitor should look
  over the final county contract.
- Before presenting: a separate demo club account for the live tagging part of the demo,
  so Bray's stats are not touched.

**Stats journey, still open** (stages 1 to 3 done 2026-10-29)
- Try it with the analyst who found it jumpy, and fix what still feels like jumping around.
- More tappable numbers: the match head-to-head and the kickout panels are done. Next
  candidates are Source of scores, then the Players tab (a player's own events).
- Season figures could open their events per match (pick a match, then watch), if wanted.

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
- **Reports for app users (2026-10-25).** Export opens on the full breakdown for every club
  using the app (lifetime and free plan); the tiers only shape the per-game service. App
  users build their own playlists; per-game customers get them made.
- **Requests and bespoke work (2026-10-25).** A setting that already exists: show or set it
  up. Good for every club: build it for all, free (report changes go into the next report
  version). One club only: quote it as paid work, built as an option switched on for that
  club, never a separate copy of the app. On the club page and in the terms.
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

## Done 2026-11-12

**Match pulse in the momentum style; live tagger tidy-ups.** The Match pulse is redrawn to sit
beside Momentum: the same borderless card, centred "Match pulse" title, 0' / HT / FT along the
bottom and team-colour legend. Every event is a thin spike from the dashed 50% line (ours up,
theirs down; scores tall with a dot, sized goal > 2-pointer > point; misses, kickouts and ball
lost short), and the chance of winning is one step line across it. Touch shows the minute and
the chance then. The live tagger start control is a drawn triangle instead of the play
character, which an iPad shows as a large colour emoji; the other play and pause characters in
the app now ask for the plain text form too. In the in-game stats (DETAILED), shot efficiency by
distance moved up to sit with the shot map and expected points, before the restart maps.
Test: `tools/e2e/test_live_tidy.js`.

**Figtree in the taggers too.** The live tagger and video tagger now use Figtree like the rest
of the app; Barlow Condensed is no longer loaded at all. Checked on a phone and an iPad on its
side: no button text spills; on a phone "Turnover won" takes two lines and longer tag rows wrap.

**Players tab: one panel, Averages or vs Targets.** The season Players tab no longer shows the
scorecard and the breakdown side by side. Two switches above one table: AVERAGES / VS TARGETS,
and SEASON / LAST 3 GAMES, which now applies to both. Averages are per game (points, shots,
tackles, kickouts won, ball lost, xS+-), each player over the games they have tagged events in
(shown after the name), sortable by column; the last 3 games are the 3 latest with tagged events,
worked out by the same stats code. VS TARGETS is the scorecard as before (Adjust targets link
kept). Both choices are kept on the device. A single match still shows the plain breakdown.

**Periods: time without a shot, and one heading at a time.** The scoring droughts card adds,
under each side, the longest spell WITHOUT A SHOT (from play or a scoreable free), measured the
same way (each half on its own; half-time never counts), with the minute and half it began; over
several games, the average longest per game. Worked out outside the main stats code. The period
breakdown has a row of buttons (All, Scoring, Shooting, Restarts, Ball lost, Possession, Tackles)
to show one heading at a time; All by default and the pick is kept on the device.
Test: `tools/e2e/test_periods.js`.

**Season cards: a game filter instead of a list of every game.** Lists that grew with every game
(and would keep growing over 2 or 3 seasons) are gone. The scoring droughts card and the time
leading / level / behind card open on all games (averages / totals) with buttons for All games and
Last 5 (from 6 games) and a "One game" picker; one game shows that game alone (when each spell
began; its result). The season cards view on Defence shows the last 5 games with cards, with the
same picker for any other game.
Test: `tools/e2e/test_game_pick.js` (a nine-game season).

**Home on iPad and computer: sidebar layout (step 1).** From 760px wide and 560px tall (iPad either
way up, a computer) Home is a new layout (HomeShell); phones keep the tiles, held sideways too. A sidebar reaches every part of
the app (Home, Dashboard; Video: Game film, Video tagger; Match: New match, Live Stats Pad, Pitch
map, Opposition, Match information, Import data; Club: Squad, Fan Zone, Tactical pad, Tagging
template; Help and Sign out at the foot; players see only what they can open). A top bar has the
date and Live Stats Pad, New match and the club crest (crest and kit). Middle: club banner,
Dashboard, the last match (score, shots, accuracy, kickouts kept for both sides, top scorer, full
report) beside a tagging card (resume the live game, or new match; video tagger), then the 4 newest
playlists (shared marked, drawings counted). Right: this season (record, points scored and
conceded a game, shot accuracy, kickouts kept), top 3 scorers, and club (join code, free plan,
matches stored, appearance). An upright iPad shows the sidebar as icons and the right column under
the middle. The season figures load through one shared hook (useHomeStats) also used by the old
slide panel, which no longer shows. Test: `tools/e2e/test_home_panel.js` rewritten.
Step 2, the same day: the sidebar on the other big-screen pages (Dashboard, Game film, Video
tagger list, New match, Live Stats Pad, Pitch map, Opposition, Match information, Import data,
Squad, Fan Zone, Tactical pad, Tagging template, Help). The sidebar is its own component (SideNav)
and pages sit in a frame (NavFrame) from App, with this page marked; the page actions are one set
(navGo) shared with Home. The live tagger and the video tagger itself stay full screen; phones
have no sidebar. Pages in the frame fill its width up to 1280px; Game film keeps the sidebar as icons so the
video stays about two thirds of the screen. Test: `tools/e2e/test_sidenav.js`.
Next: step 3, fixtures (Up next) and search.

## Done 2026-11-11

**Momentum chart on a match (FotMob style).** The match overview (KEY and DETAIL) opens with
a Momentum card: a smoothed wave above the line when we are on top and below when the opposition
is, in the two team colours, with goals marked on their side, a dashed half-time line and
0' / HT / FT along the bottom. Pressure is built from scores (a point 3, a 2-pointer double that at 6,
a goal 8), shots (1.5) and ball won (kickouts, turnovers, frees, dispossessions, 1 each), each
spread over about a minute and a half and scaled to the busiest spell of the match. A red card
(or second yellow) gives the other team a push of 5 spread over about four minutes; a black card
3 over about two and a half. Goals, 2-pointers and red / black cards are marked on the side of
the team that scored or was carded, nudged apart when close. Touch or hover shows the minute and
who was on top in the line under the legend.
Test: `tools/e2e/test_momentum.js`.

**Match overview in the FotMob style (KEY view).** The match card is now the two teams either
side of the score (crest, kit jersey or initial; name; total under each score; Full time / half /
Live), with the scorers for each side underneath (their named scorers on the right). Momentum
sits straight under it. The six key figures plus possession lost are one Top stats card: the
stat name in the middle, a figure each side, and the leading figure in a pill of that team
colour (fouls and ball lost lead when lower), ringed in white for a dark kit as the bars are. The ball-lost breakdown stays below. Cards have no
borders, and on an iPad or computer the overview is a centred column 720px wide. DETAIL is
unchanged. Checks added to `tools/e2e/test_momentum.js`.

**Figtree font across the app (FotMob feel).** FotMob uses GT Walsheim, a paid font; Figtree
is the closest free one (Google Fonts) and fits a GAA score on one line. The body text, chart
labels, exported reports and the burned-in export text are now Figtree. Figures and small labels
(the MONO face, 503 places) follow a page variable, --rsa-mono: Figtree on every screen, but
Barlow Condensed stays on the live tagger and the video tagger, where narrow text keeps the big
buttons fitting. Swapping in GT Walsheim later (with a web licence and the font files) is a
change to that variable and the font link.

**Momentum or Match pulse, and their scorers.** A switch above the chart picks Momentum (the
default) or the Match pulse, on KEY and DETAIL; the device remembers the choice. On the DETAIL
score card, tapping a side of the score lists that team's scorers (their named scorers, then
"Not named" for the rest), with a bar in the team colour under the side shown. The card now
names the opponent instead of "Opposition" and long club names end in an ellipsis instead of
being cut at 14 letters. The Match pulse no longer prints 30' on top of HT.

**Light mode (Appearance on Home).** A new Appearance card at the bottom of Home picks Dark
(the default), Light, or Phone (follows the phone setting). It is kept on the device and a change
reloads the page. Light swaps the shared colours (pale grey page, white cards, near-black text,
darker green, blue, gold and red so they read on white), sets the browser bar colour, and gives
the overview cards a faint shadow. Club colours that are too pale to read on white are now
darkened (they are lightened on dark, as before), and dark-kit outlines become dark on light.
Both taggers, the pitch map, Game film and shared links follow the setting; the pitch stays green.
Test: `tools/e2e/test_theme.js`.

## Done 2026-11-08

**Drawing over video (telestration), step 1.** Game film has a DRAW button under the video. It
pauses the video and opens drawing tools over the frame: arrow, curve, dashed run line, ring
around a player, zone (tap four corners), pen and text label, in six colours, with undo and
clear. Analysts press SAVE TO CLIP and the drawing is saved on the playlist clip that covers that
moment (`clip.draw = { at, hold: 4, shapes }`, points as fractions of the frame, inside the
existing `clips` jsonb, so no schema change). If more than one clip covers it, a list asks which
one. Each clip with a drawing shows "Drawing at m:ss" in the playlist panel, with VIEW and
REMOVE. Shared links pause at the drawing, show it for 4 seconds, then play on, and the clip is
marked with a pencil. FULL SCREEN puts the video and tools full screen where the browser allows
it. The playlists now load once in Game film and the panel uses that copy, so a later edit cannot
save over a new drawing. YouTube does not let the app read frames, so drawings cannot be burned
into an exported video. Test: `tools/e2e/test_telestration.js`.
Still to do: the keyframed spotlight and tap-to-track ideas (steps 2 and 3) are to be tried
outside the app first.

**Video tagger: team colour bar on event rows.** Each row in the tagger event list now shows
the team as a 3px bar in the team colour down its left edge (as on the Performa screen), and the
event name is white instead of being painted in the team colour, which was hard to read for
dark kits. Test: a check in `tools/e2e/test_clip_player.js`.

**Game film on a phone on its side: bigger video.** The play buttons (and the draw and full
screen buttons) move into a strip down the right of the video, the header is slimmer and the
"tap an event" hint is hidden, so the video fills the screen height: about 580px wide on a
915x412 phone instead of 455. While drawing, the seven tools take that strip and the colours and
undo / clear / save / close sit in one row under the video. Tablets and portrait are unchanged.
Not fixable from the app: YouTube shows its own title, share and "Watch on YouTube" overlay
whenever the video is paused or not yet started, inside its player where the app cannot reach.

**Drawing in the Video tagger.** A ✎ button (in the play controls; "Draw" in the top bar with
the phone on its side) pauses the video and opens the same drawing tools as Game film, with the
tools in a strip along the bottom. The drawing covers the picture itself, not the black bars, so
it lines up the same in Game film and shared links. SAVE TO CLIP puts it on the playlist clip
covering that moment (this match or across games). The playlist editor shows "Drawing at m:ss"
with VIEW and REMOVE. Export clips now burns the drawing in: the exported video holds on the
frame for 4 seconds with the drawing on it, then plays on (notes still burned in as before).
Test: `tools/e2e/test_tagger_drawing.js`.

**Game film: bigger video on an iPad on its side, small cards for the games.** On a tablet
or computer held sideways the video now takes about two thirds of the width (was 55%), with the
playlists and events beside it. The games list is a grid of cards instead of full-width tiles: a
strip in the opponent kit colour along the top, their crest or jersey (or initial), the name,
the full date and a Watch button; the whole card opens the game. Two cards a row on a phone,
about five on an iPad on its side. Manage keeps the old full layout with the link boxes.

## Done 2026-11-02

**Home on a computer: panel and text size.** The slide in the right-hand panel (last match,
season, player, top scorers, work rate) now sits in the middle of the panel instead of at the top
with a gap under it, and the tile titles and descriptions on the left are larger on a wide home
(17px and 13px). The dark strip to the right in the screenshot was the browser scrollbar: at
1280 wide the page fills the window and on wider screens it is centred.

**Video tagger on a computer: Tags panel and the play bar (feedback from Si).** Clicking on the
video now closes the Tags panel when it is open (without playing or pausing it), and so does
the Escape key; the panel's close button is now a full-size "Close »" instead of a small
». The video now ends above the seek strip («10s, -5s, +5s, 10s») instead of under it, so
the video's own play bar and timeline are no longer hidden. Same on the iPad sideways.
Test: `test_vt_desktop_dock.js`.

**Match score beside each shot in the video tagger and Game film.** Tadhg: show the match
score beside each shot, from a free or from play. Every shot from play and scoreable free in
the video tagger tag list and the Game film event list now shows the score just after it, own
team first (e.g. 1-01 – 0-02): white when the shot scored, grey when it missed. It is counted
in match order (half, then clock), so a moment tagged later still gets the score at that point
in the game. Other events show no score. Test: `test_run_score.js`.

Deployed to main: map tap cards with xS at 25a4b8a (rollback 4f8285e), the GAA ball spinner at
a9af3bf (rollback 25a4b8a), the match score beside each shot at aa5ef8f (rollback 232cc86),
the video tagger Tags panel and play bar fixes at bcafbb8 (rollback aa5ef8f), the wide home
panel and text size at a365aa9 (rollback 7079bd3). All 27 e2e tests pass.

**A GAA ball for the loading spinner.** Tadhg: make the loading circle GAA related, like an
O’Neills football. The spinner is now a Gaelic football drawn in lines (the band round the
middle and the panel seams above and below) rolling round; hurling and camogie clubs get a
sliotar with its seam. No maker’s name on it (a trademark, and unreadable at 14-26px). It keeps
the colour of each place it is used, so it still shows on green buttons and the scoreboard.

**Tap a dot on the season and match maps for its details.** Tadhg: GAA Tracker shows a shot's
details when you hover over it. On the Dashboard shot map (Attack) and restart map (Restarts),
tapping a dot now rings it in white and shows a card under the map: the player and number,
what it was and how it ended (SHOT · POINT, FREE · WIDE, KICKOUT · WON CLEAN, in green for
a score or a win and red otherwise), and the match it came from with the half and clock
(v Kilcoole · 2026-10-30 · H1 12:34). Shots from play also show their xS on the right of the card: the
scoring chance for that zone (the same rate the xS panel and the player xS± column use, so it
follows the shared rates once they load). Frees and restarts show none, as xS covers shots
from play only. Tapping the dot again or the close button hides it;
changing the filters or switching to the efficiency view clears it. Each dot has a larger hidden
touch target, so it works with a finger on the phone and iPad. Exported reports are unchanged.
The stats are untouched: the link from a dot to its tagged event is kept out of the stats data.
Test: `test_map_tap.js`.

## Done 2026-11-01

**Larger tagger layouts on a computer too.** Tadhg: optimise for desktop as well. The live and
video tagger layouts made for the iPad sideways (bigger event buttons, score, clock, strip,
full-screen pitch, labelled buttons, half marks) now also apply on a computer whenever the
window is wide (landscape, at least 1000 by 560, no touch screen). A computer never gets the
turn-sideways screen; a tall or narrow window keeps the standard layout. The home panel already
worked on a computer. Desktop checks added to test_ipad_tagger.js and test_ipad_video.js.

**Home on a wide screen: tiles left, club panel right.** iPad sideways and computers (wider than
1000px and landscape): the tiles stack in one column on the left and a panel on the right stays
in view while the tiles scroll. The panel has the club banner (moved from the left) and slides
that change every 8 seconds with a fade: last match (score, result, six figures us v them, top
scorer), season (W-D-L, average score, the same figures as totals), a player spotlight (number,
position, games, scored, shot efficiency, tackles, turnovers won, per game, "most in the squad"
or "top 3" worked out), the Rock Solid Analytics logo, top scorers and work rate (top five;
these two wait until there are 2 games and 3 players). Dots jump to a slide and pause it for 30
seconds (hovering pauses on a computer); tapping the score or record opens the match or the
dashboard. A club with no finished match sees "Tag your first match". Figures use the latest
season only and six event types, read in pages of 1000 and kept on the device per club
(rsa_homepanel2_<club>), read again only when a new match is finished. Phones and an upright
iPad are unchanged. New browser test test_home_panel.js (24 tests now).
Then, from Tadhg's iPad photo of Bray: the navy "them" figures lacked the white outline (now on
every figure, with the ring on the leaderboard bars), and turnovers won read 0 v 0 as Bray tag
no turnovers won; turnovers now count "Turnover won" or "Turnover" with a won outcome (as the
dashboard), and when neither side has any the card shows tackles instead. Saved figures moved to
a new key so devices read them again once.

**Efficiency maps on the season shot and restart maps.** From Tadhg's Stephen Curry example,
then mock-ups redone in the app style at his ask. The OWN SHOT MAP and OWN RESTART MAP cards
have a Dots / Efficiency switch (kept per device, rsa_mapview). Efficiency draws, between the
grass and the lines of the same pitch, the scoring rate (shots from play only, frees left out)
or the restart win rate where each landed, against the average of what is shown: app red below,
gold level, green above, smoothed over about 4.5m and stronger where more points sit. The player
picker (shots) and All / Short / Mid / Long (restarts) still apply, and the Opposition side too.
Under 40 points the colours are faded with a note; under 20 there is no layer, just "Not enough
... yet". Legend: Below / Above average, or Lost / Won more often, with the count and rate. New
browser test test_eff_maps.js (23 tests now).

## Done 2026-10-31

**iPad video tagger: pitch step no longer cut off.** Tadhg's photo: the bottom of the pop-up
pitch was hidden behind the bottom strip, as the strip buttons got taller. On a tablet in
landscape the pitch now sits above the strip (96px up) and is sized to the height left
(80vw, 900px or (100dvh - 230px) x 1.55, whichever is smallest), with 14px labels. The iPad
video test checks the whole pitch is above the strip and below the top.

**iPad video tagger in landscape.** From Tadhg's iPad screenshot: the event boxes were big but
the score, the full screen / undo / tags buttons, the strip and the tags list were small, and
once the halves were marked there was no button to mark or move them. On a tablet in landscape
(rsa-vtl, explicit sizes): the score chip 21px, the top buttons 16px and labelled (Full screen,
Undo last tag, Tags), event labels 17px, every bottom strip button 16px and 52px tall (seek,
outcomes, players, Save), the tags panel wider (up to 520px) with 15px text, and the strip
stopping at the panel while it is open. The strip now shows every half mark ("✓ Throw-in
00:03", "✓ 2nd half 32:10", "⚑ Mark ..." for the next); moving a mark already set asks first,
as it changes the match clock on the tags. Phones unchanged. New browser test
test_ipad_video.js (22 tests now). Deployed (main at c4c8a38, rollback feaaee0).

**iPad tagger header, fixed on the real iPad.** Tadhg's iPad screenshot showed the event buttons
right but the score banner still small with a lot of empty space: iPad Safari ignored the CSS
zoom used for the header, Sub/Team/Undo row and banners (the emulator honoured it). Replaced with
explicit sizes in landscape on a tablet: score 52px with the total 22px, clock 50px, half 16px,
win chance 16px, team names 18px with a 28px crest, time since score 16px, the clock column 220px
wide, the Sub/Team/Undo row and banners 15 to 16px, a bigger back arrow. test_ipad_tagger.js
now checks the font sizes rather than zoom. Deployed (main at c31bdfe, rollback 2bd207e)
together with the match length sliders, name suggestions and scouting explainer below.

**Name suggestions and a scouting explainer.** On New match (and Edit match information) the
Opposition, Home team, Away team and Referee boxes offer earlier names as taps under the box as
you type: teams from the club's matches (both sides of a scouted "A v B", the club's own name
left out) and referees, most used first; a name with a word starting with what was typed comes
before one only containing it, so "b" gives Baltinglass, Blessington, Bray Emmets. They go once
the box holds one exactly. Under Scout a Match: "Tag a game you are not playing in, to learn
about teams you will meet", and once on, how tagging works (single tap home, double tap away),
that results, scorers and line-ups build up under Opposition, that it is kept apart from the
club's own stats, and that on the free plan it counts as one of the free matches. New browser
test test_name_suggest.js (21 tests now).

**Match length as sliders.** Setting up a game (and scouting one) now has two sliders under
MATCH LENGTH, Periods (2 or 3) and Minutes each (10 to 45), starting at 2 x 30 with the
summary beside the heading ("2 × 30 MIN"), in place of the three 2x30 / 2x35 / 3x20 buttons.
Saved as before (half_mins and periods, left empty for 30 and 2) and remembered per club as
"2x30" (older saves read as before). The ranges are what the database allows. Test
test_new_match_length.js rewritten (slider ranges, the summary, the saved match, the memory).

**iPad live tagger: sideways, full-screen pitch, bigger controls.** From Tadhg's comparison with
Performa on the iPad. A web app cannot lock the iPad rotation (Apple ignores it for home screen
apps), so the live tagger on a tablet held upright shows "Turn your iPad sideways to tag" over
everything (the clock keeps running, tags are safe, "Leave the tagger" is there); phones and
computers are unchanged (tablet = touch screen at least 700 by 950). Sideways (rsa-tl): the event
column is 200px wide with buttons filling its height (17px text), outcome tiles 20px, player
numbers 30px with names 14px, prompts 15px, the tag list 15px. The pitch step covers the whole
screen with the landscape pitch (same tap-to-spot mapping as upright, so saved spots are the
same), the teams named at each end (◀ BALLYVALE ... LUCAN ▶), "ATTACKING LEFT/RIGHT GOAL", a
sideways SWAP, and a Cancel button. New browser test test_ipad_tagger.js (20 tests now).
Then, at Tadhg's ask, the top of the screen scales up the same way: the score, team names,
clock and time since score (zoom 1.6), the Sub, Team and Undo row (1.5) and the sync, half-time
and confirmation banners (1.4); the full-screen pitch now starts under the score and clock so
they stay in view, sized to the height left. Deployed (main at 2bd207e, rollback 054ebe0),
together with the share message and the back gesture below. Tadhg to try a practice match on
the iPad before the next real one.

**Phone back gesture stays in the app.** Tadhg (Android, screen recording): swiping back on Edit
match information left the app, as screens change without browser history. Now, while the
screen shows an in-app back control (the arrow Back button, or "‹ All matches", "‹ Close",
"‹ Video hub", "← Back to ..."), the app keeps one history step; the back gesture or Android
back button presses that control (the one in the topmost layer, a text link before the arrow),
so it lands where Back would. On the home screen there is no step, so back leaves as before.
Works on the iPad edge swipe too. New browser test test_back_gesture.js (19 tests now).

**A ready message when sharing a playlist.** SHARE now sends a message, not a bare link: the
playlist name; the game ("v An Tochar · 2026-10-20", or "Across games"), the number of clips and
total time; "What to look for:" with each clip note numbered as in the player (up to 6, then
"(n more in the link)"); and the link. A shared playlist also has a green WHATSAPP button
(wa.me, opens WhatsApp with the message ready to send to a chat or group) and COPY MESSAGE for
anywhere else. Covered in test_clip_player.js (47 checks).

**Clip lengths by event type.** In the video tagger playlist mode, "Clip lengths" opens a sheet
listing every event type tagged (and any already set), each with a lead and tail slider. The
lengths are for the whole club (clubs.tag_settings.clipSpans, saved read-change-write so other
settings are kept) and go onto each clip as it is ticked into a playlist (new, across games or
per player); clips now also keep their event type (ev). Any clip can still be changed on its
own. An open playlist has "Use the event lengths on every clip", which also works on older
clips by matching the start of their label. Event types with nothing set use the standard 6s
lead and 5s tail. Covered in test_clip_player.js (43 checks). Deployed (main at 054ebe0,
rollback beedefd).

**One playlist per player.** In the video tagger playlist mode there is now a SELECT ALL CLIPS
box over the folders, and the save bar has "One playlist per player": the ticked clips are
split by player into playlists named "<player> · v <opponent>" (or a typed ending, such as
"turnovers v Mayo"). Tick everything for a full review per player, or one folder for each
player's turnovers or shots. Clips with no player are left out. Running it again after more
tagging tops up each player's playlist instead of making copies. Each one is shared from Game
film, Clip bank as usual (player logins are not tied to a squad name, so the app cannot yet
put them straight into each player's own view). Covered in test_clip_player.js (37 checks).
Deployed (main at beedefd, rollback c0aae9a).

**Video up the home screen.** Tadhg: the video part was too far down the list. Game film and
Video tagger now have their own VIDEO section straight after the Dashboard and Last match
tiles (side by side on iPad), ahead of MATCH and ANALYSIS, with subtitles that say what they
are for: "Watch games, clips & playlists for the squad" and "Tag a match from footage, build
clip playlists". Players see Game film there too ("your clips & playlists"). Deployed (main at
c0aae9a, rollback c5f9c44).

**Clip lead and tail as sliders; shared clips without the YouTube bar.** Asked for from a
screenshot of the Game film clip bank. Lead and tail were fixed chips (3, 6, 10, 15, 30 and 2,
5, 10, 20 seconds); both are now sliders from 0 to 60 seconds in steps of 1, saved when let go,
in the Game film clip bank and in the video tagger playlist editor (new SpanSlider). The real
fix for the YouTube controls: the shared clip page (?clips= link) ran YouTube with its own
controls on, so the bar and title flashed over the first seconds of every clip after each
seek. It now runs with controls off, like the tagger and Game film, with a clear tap layer
over the video (after the first play, which some phones need to start) and a PLAY / PAUSE
button between PREV and NEXT, so no extra lead-in is needed to hide them. New browser test
test_clip_player.js (18 tests now, all pass).

**Playlists: tick a whole folder, add to an existing playlist, reorder.** After comparing how
Hudl, Sportscode, Nacsport and Veo do it (filter, then select all or hand-pick into a new or
existing playlist), Tadhg kept mix and match and added: in playlist mode each folder of the
video tagger clip tree (event, outcome, player) has a tick box that selects all its clips
(part-ticked when some are); the save bar can add to a playlist already made (new clips go
on the end, ones already in it are skipped and counted); and every clip has up and down
buttons in the clip bank and the tagger playlist editor. Covered in test_clip_player.js.
Deployed (main at b70eb50, rollback 7e08e20), with the sliders and the shared player fix.

**Playlists across games.** Database change applied to the live project 2026-10-31 (migration
playlists_across_games); both existing shared links checked and still resolve. Deployed (main
at c5f9c44, rollback b70eb50). Tadhg to try one across two games on his phone. The video
tagger save bar offers "New playlist across games" and "Add to ... (across games)" on every
match, so a coach can go game by game ticking, say, the Kickout folder into "Kickouts this
season". Such a playlist has no match of its own (match_id null) and each clip carries its
match_id. The Game film clip bank shows them first under ACROSS GAMES, each clip naming its
game, with the same sliders, notes, reorder and share. The shared link plays them in order,
loading the next game video at the clip start when the game changes (a short hold stops the
auto-advance reading the old video time while it loads); clips whose match is gone are left
out. Database change, tested on a local Postgres: playlists.match_id may be null, and
clip_playlist returns videos (one per match of the same club used by the clips) for such a
playlist, one-game playlists unchanged. The fake database learned .is(column, null).
Covered in test_clip_player.js (31 checks).

**Security tidy-up** (Supabase security advisor, 2026-10-30).
- About 30 SECURITY DEFINER functions can be called without signing in (club_activity,
  club_usage, live_board and more): check each one returns nothing about another club.
- 10 functions have no fixed search_path: one line each to set it.
- Leaked password protection is off (likely needs the Pro plan).
- The Pointless quiz shares this database: a separate Supabase project would keep the two apart.
- Turn on two-factor sign-in for the Supabase dashboard account.

**iPad live tagger, still open.**
- Try it on the real iPad at a practice match: the turn-sideways prompt, button sizes, and that
  pitch taps land where expected. Tests ran in an iPad emulator only. Event buttons confirmed on
  the real iPad (Tadhg, 31 Oct); the new header confirmed too ("iPad layout now looks really
  good"). The video tagger refresh still to be checked on the real iPad.
- Video tagger pitch step on the iPad: fixed 31 Oct (bottom was cut off behind the taller
  strip). Check on the real iPad.
- Lesson: iPad Safari ignored CSS zoom that the emulator honoured; use explicit sizes.
- The video tagger and the stats screens keep their current sizes on iPad; the same treatment
  could follow if wanted.

**Match format, still open.**
- Four quarters (or one period) would need the database check widened (periods in 2, 3), period
  names past three, and the stats half filters (they show 1ST and 2ND only, even for 3 x 20).

**Playlists, still open.**
- The shared playlist "PO Break" is on a match with no YouTube link saved, so its link shows
  timestamps only: add the link to that match if it should play.
- Who watched a shared playlist (proposed 2026-10-31).
- "Use the event lengths" is in the video tagger playlist editor only; the Game film clip bank
  could have it too.
- Player logins tied to a squad name, so a player's own playlists (and stats) show for them
  without a shared link.


**Club colours through the app.** Asked for after the mock-up (Bray, Wicklow, Éire Óg). The
frame takes the club kit: the Dashboard tile (main colour shading darker, edged in the second
colour), the Analytics wordmark, tab underlines, section pills, the half and Key / Detail
switches, Export / Share / Save, the Season Read card, the Resume Tagging tile and the
restarts and shots team switches. In the stats "us" is the kit main colour exactly as it is
(Tadhg's wish), with a fine white outline on text and a white ring on bars when it is too
dark to read on the dark background (a dark maroon, a navy); "them" is the opposition kit
when known for that match, else our second kit colour (Tadhg's call: Wicklow's opposition in
gold, Éire Óg's in white, Bray's in navy with the outline), else blue when the second colour
is missing or too close to the main one, else whichever of orange, gold, green and purple is
furthest from ours. Bars and chart marks come in pairs, so when either side needs the white
ring both get it (Tadhg's call); text keeps its own outline, only on a colour too dark to read. Covered: key callouts and the donut, the match score card and scorers, head
to head (numbers, bars, names), restarts won and restart speed, periods tables and chart,
score types and origins, cards, time metrics, droughts, source of scores, the pitch map's
team colours and the match pulse (its win-probability line is now grey so it never clashes
with a blue team). Green, amber and red for good, close and bad are unchanged, as are the
taggers (they keep their lightened kit colour; their stats sheet shows the true colour). A
club with no colours set looks exactly as before. New browser test test_club_colours.js
(maroon, Wicklow, a light green and a club with no colours).

**Club colours: softer outline.** After the before/after mock-up (Wicklow, Bray, maroon),
Tadhg chose a lighter touch. Only a really dark colour (a maroon, a navy) is treated as dark:
its big numbers (score, key callouts, kickout speed) keep the fine white outline and its bars
get a faint 1px half-strength ring, still paired on both bars. Small text in a dim colour (head
to head numbers and names, periods, tables, droughts, sources, cards) uses a lighter shade of
the colour instead of an outline. Wicklow blue no longer gets any outline or ring.
test_club_colours.js now also checks Wicklow has no outline or rings and maroon small numbers
are a lighter maroon without an outline.

**Club colours deployed** (main at 50f0c01, rollback 764b5e0), with the softer outline.
Clubs see their own kit in the app from now on; a club without colours set looks as before.

**St Jude's: them in sky blue.** St Jude's (navy, sky blue) showed the opposition in gold,
because the rule turned down a second colour in the same colour family as the main one. Our own
second colour is now used when it shares the family but is far lighter or darker (a lightness
gap of 35 or more, as navy and sky blue); two mid blues are still too close, and an opposition
kit keeps the strict rule. Nothing stored changed. test_club_colours.js covers navy and sky blue.
Deployed (main at 5680452, rollback 50f0c01).

**The price buys the app only.** Tadhg's rule, now said plainly everywhere: EUR 850 (and any
plan, the county licence included) buys use of the app, data clean-up if needed and minor help
by email. Nothing else is included: training sessions and workshops, set-up days,
presentations, match reports, league or championship reports (EUR 75 each) and us tagging a
game are all extra. Changed: terms (in short, what it covers and does not, a new section for
season reports, training and presentations, dated 30 October 2026), the club page (founding
card and fine print), the in-app free matches message, and the Wicklow deck (offer slide no
longer says set-up and training are included; its extras box is headed "Everything else is
extra" and adds training workshops or presentations, quoted; the rollout and next-steps
slides call the workshop a booked extra and on-the-day support becomes help by email).

**Founding places cut to 10; help by WhatsApp.** The founding offer (EUR 850 once) is now for
the first 10 clubs, not 20, or until 31 December 2027 (terms and club page). Minor help is by
email or WhatsApp when something is unclear (terms, club page, Wicklow deck offer, rollout and
next-steps slides). No WhatsApp number is published yet. Both pricing changes (app only, and
10 places with WhatsApp help) deployed (main at 7e08e20, rollback 5680452).

**Supabase free plan: how long it lasts.** Checked 2026-10-30: the database is about 20 MB of
the 500 MB allowed, so storage is years away. The first real limit is bandwidth (5 GB a month):
at a worst case of about 1 MB per Dashboard open, that is roughly 25 to 30 clubs using it
actively. Free projects also pause after 7 days with no activity. Plan: move to Pro ($25 a
month) once clubs or the county are paying, and before a county roll-out.

**Wicklow deck: reports.** Slide 20 says match reports export free from a team's own tags;
the offer slide adds a league or championship report at EUR 75 each. The app has no such
report yet (match reports only): build one, or make them by hand for now.

**Hung-upload fix deployed** (main at 113c266, rollback 6b877e9). Together with the kickout
taps, time since last shot and the since-score timer running from the throw-in (all
2026-10-29), it is now live.

**Lifetime access: no fixed term.** Tadhg asked whether to cap lifetime access at, say, 5
years in case the app ever closes. Decision: no cap. The terms already say lifetime access
lasts for as long as Rock Solid Analytics operates, with at least 3 months notice and a copy
of the club's data if it closes; a 5-year cap would need renaming ("lifetime" that ends
reads as misleading), sets a renewal date and gives no extra protection. The county deal may
still be done differently (see Open).

**Wicklow GAA presentation deck** (claude.ai Slides artifact, private: "Rock Solid Analytics
for Wicklow GAA", made 2026-10-29). For a possible presentation to Wicklow GAA and its
academy in a few weeks; academy first, talk plus live demo, the ask being lifetime access for
every academy squad and adult team with reports and live tagging extra. 25 slides with
speaker notes and a five-step demo script: why and what, Bray Emmets' season as proof (3,298
tagged events, 16 matches, 9 from video), scorecard, targets, clips for players, player
logins, a week in a squad, live and video tagging, the match view, source of scores,
kickouts, pitch map, opposition and tactical pad, Kerry v Mayo reports, roll-out over 8
weeks, the offer, data and safeguarding (facts from the privacy notice), next steps.
Screenshots taken fresh from the app with real Bray Emmets and All-Ireland showcase data
(scratch fixtures only, nothing committed); the video screens use illustrative footage and
say so. Wicklow crest and academy logo on the cover, the academy divider and the closing
slide. Offer slide wording changed today from "forever" to "for as long as the app runs",
to match the terms.

**Data security question answered.** Tadhg asked whether Supabase encrypts emails and personal
data or relies on the site. Answer: Supabase encrypts in transit (HTTPS) and at rest (disks and
backups), stores passwords only as hashes, and keeps emails in its own auth table that the
public API cannot read (our tables hold no emails). There is no field-level encryption, so the
Supabase dashboard login is the real key. What keeps clubs apart is row level security, on for
every table: club members only for players, events, matches and appearances, own profile only.
Advisor findings are listed under Open (security tidy-up).

**Four more Instagram posts** (2026-10-31, not in the repository): a helmet colours reel and a
tactical pad reel (both with covers, fictional Ballyvale Gaels data), an any-device post and a
one club, one account, every code post, with captions. The captions are a Google Doc in Drive
(Rock Solid App / 2026-10 October / 5 Instagram / 2026-10-31 Helmets, tactical pad, any device,
one club); the images and videos were too big for the Drive connector and were sent to Tadhg to
save there.

**Instagram reels: Instagram size and a club colours reel** (not in the repository). The four
reels and the demo were 780x1688, which Instagram would crop top and bottom (captions
included); all five were padded to 1080x1920. A fifth reel, Club colours (38s), shows the
fictional Ballyvale Gaels in Wicklow blue and gold (home tile, season head to head, match key
callouts, head to head, restarts), with a cover and a caption in the captions file. The club
stays fictional on purpose: Wicklow GAA name or crest on public posts with made-up data would
need their permission.

## Done 2026-10-29

**Free matches back to 5 for new sign-ups.** club_orgs.match_limit now defaults to 5
(database changed, migration 20261029_free_matches_5.sql); checked that a new club gets 5.
The three clubs already on the free licence were then dropped to 5 as well, at Tadhg's call
(0, 2 and 1 used, so none is at the limit). The club page and the terms say 5 (terms last
updated 29 October). The app reads the number from the database, so its
"X of 5 free matches used" bar and the limit message follow on their own. Later the same day:
the business plan (Claude doc) and the Instagram plan source and spreadsheet (week 11 offer)
say 5 too. Still saying 10, waiting on the Google Docs and Sheets connectors: the Drive copies
in Rock Solid App/2026-10 October (Instagram plan Sheet, business plan, project background,
terms and pricing page copies).

**Stats journey, stage 1 of 3.** Tadhg showed the app to another analyst and it felt like a
lot of jumping around: analysis starts from six home tiles, Game film and Pitch map each
pick their own match, and the dashboard has up to five rows of controls. Stage 1: a Last
match tile on home opens that match's stats directly; the match view has Watch this match
(when it has video) and Pitch map, which open on that match, and back from them returns to
the match instead of home. Fixed on the way: the dashboard loaded matches without their
format and penalties, so the timeline half-time line sat at 30:00 on 35-minute games and the
won on penalties note never showed (now shown at the top of the match view). New browser
test test_match_journey.js.

**Stats journey, stage 2 of 3.** The stats tabs are Season, Matches and Compare; Benchmark,
Conditions and vs Others are a switch inside Compare, which opens on the last one used. On a
match the half switch and Key / Detail share one slim row. Half, Key / Detail, the ratings
Us / Them view, the competition and the Compare view are remembered on the device. New
browser test test_stats_filters.js.

**Stats journey, stage 3 of 3.** On a match, every count in the head-to-head (possessions,
shots and their outcomes, restarts, tackles, ball lost, rucks, cards) is a button: tapping
it lists those events with their time and player, with Watch these (Game film showing just
those clips, in order, with Show all) and Show on pitch (the pitch map with just those
events, filters hidden until Show all). Season averages are not tappable (too many games
behind them). New browser test test_stat_events.js. All three stages deployed (main at
410e216; rollback dd35450).

**Kickout panels tappable.** On the Restarts tab (season and match), a green hint under the
team switch says "Tap a number below to see those kickouts on the pitch map". The Restart to
shot numbers (restarts, won, to shot, to score, per band and in total), the When the restart
is lost counts and the cells of both zone grids open the pitch map on just those kickouts,
coloured by outcome, and back returns to the Restarts tab on the same side. The head-to-head
hint now also says taps lead to watching or the pitch map. The event ids ride on the stats as
hidden properties, so the stats output (and its snapshot gate) is unchanged. New browser test
test_kickout_taps.js.

**Time since last shot.** Asked for by the analyst Tadhg showed the app to. In the live and
video tagger headers, the "since score" line under each team's score is now a button: tapping
it switches both teams to the time since their last shot (shots from play and scoreable
frees, any outcome), shown in gold, and tapping again switches back. The choice is kept on
the device. Before a team's first score (or shot) the line runs with the match clock
instead of saying "NO SCORE". New browser test test_since_shot.js, and test_format_helpers checks the shot
count.

**Live tags stalling on a weak signal (fixed).** Tadhg showed a live match on a phone hotspot
and the restart spots did not update live. The tagger's own map reads the phone's copy and
was fine; the Live Stats Pad and dashboards read the database, and nothing from that session
reached it. Cause: uploads had no time limit, and the tagger waits for each upload before the
next, so one request that hung on the hotspot (never failing) held back every tag after it
until the tagger was reopened. An upload now counts as failed after 15 seconds and is retried
on the next 8-second sync; ids are made on the phone, so a late arrival is never doubled. The
same upload is used by the background sync and the video tagger. New browser test
test_upload_hang.js (the fake database can now hang writes; the test fails without the fix).

**Founding-club offer.** Lifetime access at EUR 850 becomes a
founding offer: the first 20 clubs (cut to 10 on 2026-10-30) to buy it, or until 31 December 2027, whichever comes
first (Bray Emmets and St Jude's, given lifetime free as early supporters, do not use a
place). After it: EUR 1,500 lifetime or EUR 350 a year. Match reports and live tagging are
stated as extra to any plan. No fair-use limit on the team-sheet reader (Tadhg's call).
Club page, terms and the business plan (products table and line) updated.

Also made (not in the repository): four Instagram reels with covers and post captions (live
tagging, kickouts, clips for players, player scorecard), recorded from the app with the
fictional Ballyvale Gaels data, plus the first 42-second app video.

## Done 2026-10-28

**Player scorecard** (Players tab, season view; started late on 2026-10-27). Tadhg's idea: a
scorecard for every player with 3 or more games, effort columns against technique columns,
each judged against a target, so coaching points read like "effort is good, technique needs
work". Built outside computeStats, so no existing figure moved.
- Columns: tackles per game and tackle foul %; possession lost per game from a kick (strike)
  pass, hand pass, in contact and handling; shots per game and accuracy. Percentages only from
  5 attempts; shots per game only marked from 5 shots, so defenders are not marked down.
- Goalkeepers (mostly started in shirt 1) get their own card: kickouts won and won clean in
  their games (kickouts are tagged to the receiver, so this is the team figure), saves per
  game and save % from the opposition shots, high balls kept from 5 tagged (8 tagged so far).
- Marks: green meets the target, amber is a near miss (within 10% of the target and at least
  0.1, or 5 points on a percentage), red misses. First built with tick, approx and cross
  symbols; after Tadhg saw it on his phone the symbols went and the number and a faint tint
  of the cell carry the colour, with faint lines between the Tackling, Ball lost and Shooting
  groups. Screen readers still hear on target, near miss or off target.
- Targets, in three levels on the Targets screen, saved in clubs.tag_settings (targets,
  lineTargets, playerTargets), no schema change: squad (squad average unless set); by line
  (backs 2 to 7, midfield 8 and 9, forwards 10 to 15, by the line a player started in most);
  and personal whole-number match targets, by default one better than the player's own
  average (3.6 tackles a game gives 4). Season view uses line, then squad. A new Last 3 games
  view colours each player against their own match targets: games hit out of 3 (3/3 green,
  2/3 amber) and percentages over the 3 games together.
- Tapping a player gives the coaching point, Open player profile (the burst graphs) and Set
  match targets. Browser tests test_player_scorecard.js and test_scorecard_targets.js.
- Deployed (main at 903b516). Tadhg has it on real data (screenshot 01:56).

**Scorecard targets, after Tadhg tried them** (screen recording 08:24).
- The Targets screen had text boxes with the automatic value greyed as a hint, which read as
  something to fill in. Each target now shows the value in use, labelled AUTO until a coach
  changes it, with minus and plus buttons and Reset; no typing, so no phone keyboard.
- Line targets showed the same numbers for every line, because a line fell back to the squad
  target until a coach set one. A line now gets its own automatic target from the average of
  its players (2 or more). Order: line target set by a coach, squad target set by a coach,
  automatic line target, automatic squad target. Each cell shows the target it is measured
  against; the heading reads by line.
- Targets are whole numbers for one game (nobody can aim to lose 0.3 balls a match):
  automatic ones are the average rounded (1.7 tackles gives 2), steps of 1 (5 on a
  percentage). Amber now means the season average rounds to the target.
- Browser tests cover all of it, including backs with a higher line target than forwards.
  Deployed (main at 89e5a8d).
- Targets are automatic, so the Scorecard / Targets switch is gone: the scorecard opens
  straight on Season / Last 3 games, with a small Adjust targets link under the table (and
  Back to the scorecard on the targets screen). Set match targets on a player still goes there.
- Ball lost is one column now (possessions lost per game). The four kick pass, hand pass, in
  contact and handling columns were too fine; the coaching point says how the ball is mostly
  lost instead (Most lost balls are kick passes, 6 of 10), once a player has lost it 3 times.
- Shirt-number players (#11 and so on) were on the list: mostly the opposition player who won
  one of our kickouts, since a kickout is tagged with whoever received it (204 such tags in
  37 matches). Only tackles, lost possessions, shots and a starting place now put a player on
  the scorecard, and shirt numbers are left out whenever the club has named players.

## Done 2026-10-27

**Home screen in even rows on iPad landscape and desktop.** The two uneven columns (Match on
the left, Analysis and Tools on the right) are replaced by one two-column grid: each section
label spans the width and its tiles sit two to a row at the same height. Resume Tagging moves
to the top of Match and spans the width, so New match, Import data, Edit match information and
Squad pair up; the player join code line sits under Fan Zone. Phones are unchanged apart from
Resume coming first. Deployed (main at d49219f, with the club page wording fix below).

**Video tagger landscape: halves and Save in reach.** In landscape the Mark throw-in, Mark
2nd half and Finish & save controls only lived in the side menu (the three-line button), so
a first-time user saw no way to start or save. The bottom strip now shows the next half to
mark (Mark throw-in in gold until it is set, then Mark 2nd half, then nothing) and a green
Save, beside the seek buttons. Portrait is unchanged. Deployed (8e42cb6).

**Video tagger takes YouTube links.** The link box (now "YouTube / Dropbox / URL") accepts a
YouTube link and plays it in a YouTube player; a small stand-in gives the tagger the same
time, seek, play and pause it uses on a file, so tagging, the seek buttons, mark halves and
resume all work unchanged. Nothing is copied to the device, so it avoids the iPad memory
crash, and a reload only needs the link again. The link is saved on the match when it has no
YouTube link yet (Game film can then use it). Clip export says it needs a file. Checked with a
stand-in YouTube player (the test machine cannot reach YouTube): loads, tags, sends seeks.
Still to check on the iPad with a real YouTube video: seek accuracy and tagging timestamps.
Deployed (main at f31042c).

**YouTube controls hidden in the tagger.** The YouTube player now starts with its own
controls, keyboard and full-screen button off, and the tagger draws its own bar over the
video: play/pause, a scrub bar and the time (top of the video in landscape, so it clears the
scoreboard; bottom in portrait). YouTube still shows its logo and, while paused, can show a
title or end screen; that cannot be turned off. Deployed (main at 8d8618f).
Follow-up after a screen recording on Android (Game film): with controls off YouTube still
shows its title, share, watch-later and pause overlay whenever the video is tapped. Once the
video has played, a clear layer now sits over the player in Game film and the video tagger:
a tap plays or pauses through the app and never reaches YouTube, so the overlay no longer
appears. Before the first play taps still go to YouTube (its cover with the big play button
and Watch on YouTube stays until then; the iPad can refuse to start a video any other way).
The recording also showed YouTube putting the same overlay up by itself for about 4 seconds
every time a clip starts or jumps (not only on a tap), and that cannot be shortened. Game film
clips now start 8 seconds before the tagged moment (was 5), so the overlay covers the build-up
and is gone by the moment itself. Tap layer deployed at 8d8618f, 8-second start at 14039ed.

**Match format: 35-minute halves, extra time, penalties, 3 x 20.** New matches table columns
(half_mins, periods, extra_time, et_mins, period_marks, penalties), all empty for existing
matches, which keeps their old meaning (two 30-minute halves), so nothing already tagged
moves. New match asks for the length: 2 x 30, 2 x 35 or 3 x 20 (last choice kept per club).
Live tagger: the clock, period labels, half-time card, time since score and win probability
read the match length. In the last 5 minutes of a 2-half game, level or in the championship,
EXTRA TIME ends normal time and runs ET 1st and 2nd halves (periods 3 and 4, 10 minutes, clock
running on to 70:00 on a 35-minute match). Level after ET, PENALTIES opens the shootout, then
the match ends. The clock now reads past 60 minutes (it showed 10:02 for 70:02 before, which
also hit long stoppage time on 30-minute games). Video tagger: one mark per period, + Extra time
adds two ET marks, and Penalty shootout appears once the ET 2nd half is marked. Shootout: shirt
number (optional), Scored or Missed per kick, undo, saved on the phone as you go; Finish saves
the winner and kicks and leaves the score alone. The dashboard and report show "won 4-3 on
penalties". Game film seeks and the timeline half-time line use the match length. Deployed
(main at 8d8618f). Tested in the browser only so far; first real 35-minute or extra-time match
on the iPad still to check.

**Video tagger: match length and period marks read from the match.** Found while reviewing
the tagger design: the Video tagger match list loaded only a few columns, so a match opened
from it had no half length and a 35-minute match was timed as 30 (live from 8d8618f to
e9ea14a; no 35-minute match was tagged on video in between, as far as we know). The list now
loads the format and mark columns, and the tagger reads the full match row when it opens.
Period marks (throw-in, 2nd half, ET) were written to the match but only read back from the
device that made them; a phone or iPad with no marks of its own now uses the ones saved on the
match, so tagging carries on across devices. Marks made on the device still win. Deployed
(main at e9ea14a).

**Browser tests in the repository (tools/e2e).** The Playwright tests had only lived in a
scratch folder and were lost with each session. Seven now sit in tools/e2e and run with
`node e2e/run.js` from tools/ (about 90 seconds, PASS or FAIL per test, 74 checks): match
format helpers, live tagger timing and extra time, new match length, penalty shootout, video
tagger marks (35 minutes with ET, 3 x 20, marks from another device), the landscape strip,
and YouTube in the tagger and Game film through a stand-in player. All data is synthetic,
with a generated one-minute test clip (310 KB); no real club data in the repository. A
deliberate break (Game film start back to 5 seconds) was caught. Run before every commit
alongside validate.sh.

**Game film on a phone in landscape.** Tadhg found the watch screen stuck on an Android phone
held sideways: below 760px wide it stacked a full-width video over the clip list, and in
landscape a 16:9 video is taller than the screen, so it covered everything and swipes landed
on the YouTube player (nothing scrolled). A landscape phone (height up to 560px) now gets the
side-by-side layout, and the video column is capped so the video and its buttons fit the
screen height (also on tablets and desktop, where an 800 x 360 screen ran 15px off the
bottom). Portrait unchanged. At 740 x 360 the video now ends at 331px (was 544px). New browser
test test_gamefilm_layout.js (eight tests now, all pass). Deployed (main at 36555de); not yet
tried on a real phone.

**Video tagger landscape: every event button fits on small phones.** Checked while looking at
feedback Gemini gave Tadhg on the landscape tagger (Tadhg chose to leave the rest as it is).
On a phone about 740 x 360 the last button in each side column (Shot and Card for hurling)
ran off the screen. Buttons now go down to 28px with 4px gaps, still filling the column on
larger screens, and a column scrolls if a club has more events. The landscape test covers a
small phone and fails on the old layout. Deployed (main at bff8639).

**Video tagger design review** (Tadhg asked what we would do differently from scratch).
Keep: one tap for us and two for them, pause on tag, outcome then pitch spot then player, the
throw-in and half-time mapping, saving tags with no signal. Change gradually, no rewrite:
(1) store each tag by video position and work the match clock out from it, instead of clock
text plus period (the 30-minute assumption sat in about 12 places); (2) period marks on the
match (done today); (3) one player interface for file, link and YouTube, streaming first,
never copying a whole match into browser storage; (4) one tagging core shared by the live and
video taggers, which are separate copies today; (5) design for iPad landscape first, with
keyboard shortcuts on desktop; (6) browser tests in the repository (done today), later
modules and type checking.

**Video tagger: saving the video on load, tried and reverted.** Saving a picked video to the
device as soon as it loaded (with an IndexedDB fallback) went live at a9be286. Tadhg then
picked a match video from Photos on the iPad and Safari crashed ("A problem repeatedly
occurred"), most likely from copying a very large file into browser storage while it was
also playing. Reverted (main back to the earlier behaviour: the video is only kept at Finish
& save; revert deployed at 548a40f). Tadhg then got repeated crashes picking from Photos even
after the revert: picking from Photos makes the iPad copy (and sometimes convert) the whole
file first, which can run Safari out of memory on its own. Advice for the iPad: save the video
to Files and pick it from there, or use a YouTube or Dropbox link (YouTube added below). Open:
find a way to keep a local video across an iPad tab reload without copying the whole file in
the page.

**iPad wallpaper.** 2732 x 2732 PNG (works in both orientations): the goalposts logo on the
app's dark background with a green glow, ROCK SOLID ANALYTICS (Analytics in green) and GAA
STATS & VIDEO underneath, a faint pitch outline behind. Made from the 512px app icon, so a
larger logo file would make it sharper. Sent to Tadhg; not in the repository.

**Club page: per-game intro fixed** (committed 2026-10-26, live today). The "Or we tag it for
you" intro still said every game is tagged in full whatever level is booked; it now says games
are tagged to the depth of the level chosen, matching the terms.

**Monthly record in Google Drive.** Folder Rock Solid App (staff account, shared with Tadhg's
personal account) with a READ ME and a folder per month. 2026-10 October holds: a project
background doc; copies of BACKLOG.md, REPORT-SPEC.md and RSA-SPEC-time-metrics.md; the
event-synonyms skill and JSON plus the UI redesign skill doc; the business plan, terms,
privacy notice and pricing page as live; the Instagram plan (Google Sheet) and captions.
Tadhg to drop in the Kerry v Mayo report pages and the week 1 to 7 slides (zips sent).
Each month: ask Claude to "make this month's record in the Rock Solid App folder".

**Business plan** (claude.ai doc, copy in Drive). Low spend; likely case two new lifetime
clubs plus some reports and live tagging, about EUR 3,500 for about 115 hours a year; gates at
the end of January, July and October. Bray Emmets and St Jude's have lifetime free as early
supporters, so no paying customer yet.

**Instagram wording.** "Parish" changed to "club" everywhere (week 1 slide 5, week 2 cover and
headline, weeks 33 and 50); week 11 is the 10 free matches offer.

## Done 2026-10-26

**Match report v2 live** (deployed three times today; main at 683d0f5).
- After Tadhg's first look: an attack followed by another attack of the same side counts as
  recycled (shown beside to a shot and to a score). Scorers and cards moved into the Result
  card, with a yellow, black or red card beside the booked player; Cards left out of Match
  stats. Donuts above the Match stats bars (possessions, shots, restarts won, turnovers won).
- Attack pitch map per side: an arrow per lane for runs (solid) and kick or strike passes
  (dashed), longer for more attacks, and a dotted curve into the square for high balls;
  open chevron heads, a start dot, the count in a tag at each head. The table by attack type
  stays underneath (full breakdown only).
- Key performers after Match flow: the leader of each side in top scorer, possessions,
  assists, tackles, turnovers won and restarts won; up to three players level are named. A
  calculated player of the match was decided against (the tags favour forwards and a pick
  from figures invites argument); an analyst's own pick would need a new match field.

**Report tiers.** Summary: result with scorers and cards, match flow, key performers, match
stats (breakdown under shots and frees only, bars in flowing columns), shot maps. Analysis
adds the full stats breakdown, where scores came from, attacks (map, no table), restart maps,
restart to shot, breaking ball, goalkeepers, turnovers, conversion by zone, expected scores.
Full breakdown adds score by period, the attack table, players, score assists, tackles.

**Pricing and tagging depth.** Full breakdown EUR 150 to EUR 200 (Kerry v Mayo took hours even
from broadcast footage). Tagging follows the tier bought: Summary for the team; Analysis adds
attacks, goalkeeper actions, duels, breaking ball and throw-ins; the full breakdown names the
player on every possession and adds assists. An upgrade is a retag charged at the difference.
Club page (Analysis card leads with kickout chains, expected scores and goalkeepers; "five
full breakdowns cost more than lifetime"), terms and report spec updated.

**Instagram.** Slides for weeks 5 to 7 made in the week 1 to 4 style: week 5 Kerry v Mayo,
what the numbers said (8 slides: cover, match flow facts, attack maps, kickout chains, xS,
goalkeepers, key performers, call to book); week 6 match reports and the three levels; week
7 live tagging. Plan spreadsheet updated: weeks 1 to 7 Ready; week 8 tag it back from the
video; week 11 now the 10 free matches offer (founding clubs dropped); week 37 "free to
start, no monthly subscription"; week 39 why I built it; week 48 three numbers to review from
your season; week 51 lifetime access explained. Files in the session scratchpad (insta).

**App reports by email.** Table usage_log (migration 20261026_usage_log.sql, run by Tadhg in
the SQL editor): anyone can write, nobody can read through the API. The app logs opens,
reports made, Fan Zone views, live and video tagger opens, and script errors (five per page
load at most, network failures left out); writes are fire and forget. Privacy page says what
is recorded and that it is kept 12 months (a clean-up job for older rows is still to add).
Two scheduled tasks with the Supabase and Gmail connectors (added by Tadhg), emailing
staff.rocksolidanalytics@gmail.com: Daily app report, 7:45am Irish time every day but Monday,
only when something happened; Weekly app report, Mondays 7:44am, totals and week on week,
most active and quiet clubs, sales signals, errors, Supabase advisors, site check. They run
on the claude.ai plan, not the API credits used by the team sheet reader.

**Hurling final ready to tag.** Galway v Limerick, Championship Final, 19 July 2026, Croke
Park, referee James Owens, in the All-Ireland 2026 - Hurling container (owner account
tadhgdornan+aihurling@gmail.com linked). Team sheets from Wikipedia (Galway slots 1-26,
Limerick 101-126) with every helmet colour (Limerick 23 yellow and green); Galway maroon and
Limerick green kits; location off for keeper, possession, duel and breaking ball tags.

**Fix: saving an edited scout team sheet.** Editing a saved sheet inserted a second row on
each slot, which the unique (match, slot) rule refused, so Save always failed. Rows are now
written in place on their slot (keeping the jersey number and player link) and only slots
left empty are removed. Tested against the database as the hurling owner, then rolled back.

## Done 2026-10-25

- Match report v2 built: a scouting match is reported for the match as a whole (both team
  names, both teams in Turnovers, Ball lost by type, Players and Tackles). New sections: Match
  flow, Attacks, Goalkeepers, Score assists; duels, breaking ball and throw-ins in Match stats;
  hand, kick and solo and assists in Players. Video sections show only when those events are
  tagged. Spec in docs/REPORT-SPEC.md (v2). Checked on Kerry v Mayo (92 attacks, 32 assists,
  11 keeper tags); a club game (Bray v Carnew) the same as before apart from Match flow.

## Done 2026-10-24

**Score assist.** A seventh detailed video event: goal, point, 2-pointer (football only),
free won, penalty won, with a pitch spot; tag the player who made the pass or won the free.
Video only, scores nothing, sits after Attack in the default video order. In the one-tap
set and switched on for both All-Ireland containers. Backlog: assists in the player
breakdown, and the scouting report as a whole-match report (both after the finals).

**Video tagger landscape: events down both sides.** In landscape (phone or iPad) the event
buttons fill two columns either side of the video, first half of the button order on the
left, the rest on the right, all on screen at once; the video sits between them. The bottom
strip, between the columns, shows -10s, -5s, +5s, +10s and the tap hint when idle, then the
outcome, pitch and player steps as before. Portrait is unchanged. The video stays paused while a tag is
in progress (trying to play shows "Finish or cancel the tag first"), the player step keeps
-5s and +5s, and the columns and strip sit 16px off the bottom edge (plus the phone safe
area).

**Goalkeeper action: Goal conceded.** New outcome (scores nothing; the goal itself is still
the shot). In the one-tap set and in both All-Ireland containers.

## Done 2026-10-23

**Scouting team names on screen.** The video tagger scoreboard (portrait) and the scouting
dashboard showed Team A and Team B for a scouting match set up without separate team
details (Kerry v Mayo); both now take the names from the match name first. The edit sheets
did the same (All-Ireland / Kerry v Mayo on the team buttons): the video tagger edit sheet
and tap hint, and the live tagger edit sheet, attacking-direction label and tap hint, now
use the two team names.

**Tagger button order.** The video tagger defaults to the phases of play: restart and
contests (kickout or puckout, throw-in, ruck, breaking ball), on the ball (player
possession, attack, shot, free), the ball changing hands (turnover, turnover won, tackle,
duel, free won), the keeper, discipline, then any other custom events. The live tagger keeps
its order. Each club can change either order with up and down arrows on the tagging
template screen (BUTTON ORDER, Video tagger / Live tagger, Back to the default order),
saved as `tag_settings.order`. Core and custom events now sit in one list, each keeping its
own button style.

**Scout team sheets editable.** Edit match information now lists scouting matches too; a
scouting match opens the match editor, which has an Edit team sheets button: the same scout
sheet screen (photo reader, subs to 30), loaded with the saved names. Saving writes the new
rows first and only then removes the old ones. Kerry v Mayo team sheets loaded from the
published teams (26 each, 1 to 15 starting).

**Detailed video events.** A ready-made pack added from the event editor in one tap (+ Add
the detailed video events): Goalkeeper action (shot saved, shot parried, high ball caught,
punched, dropped, sweeping clearance), Player possession (hand pass, kick or strike pass,
solo or carry, shot from play, quick free taken, scoreable free taken, sideline taken, mark
claimed in football), Attack (how it reached the 45: run left, central or right, kick or
strike pass left, central or right, high ball to square; where it ended is read from the
tags that follow), Duel (won, lost, free won, free conceded), Breaking ball
(won, lost) and Throw-in (won clean, lost clean, break won, break lost; no pitch spot). Marked video only (`videoOnly`), so the live tagger leaves them out; all score
0 and are matched by exact name, so no existing stat moves (checked with 300 extra tags in
a real game). They show in the Other events view for now. Switched on for both All-Ireland
containers.

**Live tagger stats bars.** The live tagger stats (Detailed) use the same head-to-head
groups as Overview and the report, in the tagging colours, following the Full / 1st / 2nd
half switch. More measures there: possession share, accuracy, tackle foul rate, and short,
mid and long restarts won. Overview and the tagger share one component (`H2HPanel`); the old
`CompareBars` is removed. The video tagger has no stats screen, so it is unchanged.

**Match report tiers (report v1).** One fixed layout written down in docs/REPORT-SPEC.md;
the tier decides how much is included. Summary (EUR 50): result, score by period, scorers,
match stats with breakdowns, shot maps. Analysis (EUR 75): adds where scores came from,
restart maps, restart to shot for both sides, breaking ball, turnovers, conversion by zone,
expected scores. Full breakdown (EUR 150): adds a player table (possessions, shots, scored,
ball lost, ball lost that led to a score against, restarts won, tackles) and tackles by
player. Summary / Analysis / Full switch on the report screen; Export opens on Full; the
footer names the tier and version. Shown with Bray Emmets v Carnew Emmets (29 Aug).

**Per-game services on the club page and in the terms.** "Or we tag it for you": Summary
EUR 50, Analysis EUR 75, Full breakdown EUR 150, live tagging EUR 150 in Dublin and Wicklow
(travel included, price on request elsewhere), booking by email. Terms: reports within 3
days of the video and team sheets, full refund if a live game is postponed or called off or
a report cannot be delivered, footage must be the club's to share, games kept in the
team's own space. Privacy: names entered from the club's team sheet on its behalf.

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
