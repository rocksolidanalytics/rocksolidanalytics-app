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
