# Match report spec (version 2)

One match report, the same layout for every game and every club. The tier decides how much
of it is included; nothing else changes it. The report is built by `exportMatchReport` in
`index.html` (Dashboard, one match, Export) and prints its tier and version in the footer
("Report v2"). Any change to the sections, their order or a definition is a new version:
update this file and `REPORT_VERSION` together.

## Tiers

| Tier | Name | Price (per game) | Includes |
|---|---|---|---|
| 1 | Summary | EUR 50 | Sections 1, 3, 4, 5 and 6; in Match stats only shots and frees keep their breakdown |
| 2 | Analysis | EUR 75 | Sections 1 and 3 to 15, plus up to 5 video playlists; Attacks without its table |
| 3 | Full breakdown | EUR 200 | All 18 sections, plus a clip playlist for every player |

Club members (lifetime access, EUR 850) get the full breakdown from Export.

Tagging depth follows the tier bought. Summary is tagged for the team (every event with its
outcome and place, players named where the report needs them: scorers, cards, restart
winners). Analysis adds the team-level video events: attacks, goalkeeper actions, duels,
breaking ball and throw-ins. The full breakdown names the player on every possession and adds
player possessions and score assists. An
upgrade to the full breakdown means tagging the game again, charged as the difference
between the two prices.

Tier 1 has no comparisons with other teams (no expected scores, no rankings).

## Sections, in order

Header: both teams, date, competition, round or stage, venue, referee, and the tier name.

A scouting match (two other teams, such as an All-Ireland final) is reported for the match as a
whole: both teams are named, and the sections marked *both sides* below cover each team alike.
For a club's own game those sections cover the club only.

Sections marked *video events* appear only when the detailed video events were tagged.

1. **Result.** Both jerseys beside the score (stand-in jerseys when a side has no kit),
   half-time and full-time table, scores from frees, and each side's scorers (goals-points,
   frees in brackets) with a card beside any player booked (yellow, black or red); a booked
   player who did not score is listed after the scorers.
2. **Score by period.** Scores in 10-minute blocks.
3. **Match flow.** The running score of both sides through the game (a dot per score, a larger
   dot for a goal, the half-time line), with lead changes, times level, each side's biggest
   lead and best scoring run.
4. **Key performers** (*both sides*). The leader in each category: top scorer, most
   possessions, assists, tackles, turnovers won and restarts won (a category with nothing
   tagged is left out). Up to three players level are all named.
5. **Match stats.** Head-to-head bars in the two team colours, a main bar per measure with
   its breakdown underneath: possessions (shots and scores per 10 possessions), shots from
   play and scoreable frees (goal, point, 2-pointer, wide, saved, dropped short, blocked,
   woodwork, conversion), restarts won (own taken, own kept, theirs won, won clean, won on
   the break), tackles (contact, blocks and hooks, fouls, per 10 opposition possessions),
   ball lost (by type, turnovers won), rucks when tagged. Above the bars, donuts of each side's
   share of possessions, shots (from play and frees), restarts won and turnovers won. *Video events:* duels won,
   breaking ball won, throw-ins won (clean, on the break).
6. **Shot maps.** Both sides, the app's own map: point, 2-pointer, goal, miss; frees as squares.
7. **Where scores came from.** Each score put down to how the passage began (own or their
   restart, turnover by type, throw-in).
8. **Attacks** (*video events*). Each side: attacks, share that led to a shot and a score, and
   the share recycled, a pitch map with an arrow per lane (left, central, right) for runs and
   for kick or strike passes, longer for more attacks, and one into the square for high balls,
   and the same figures by how the attack was made (run left, central or right, kick pass left, central or
   right, high ball to the square).
9. **Restart maps.** Both sides, numbered with who won or lost each restart.
10. **Restart to shot.** Both sides, short (under 45m), mid (45 to 65m), long (over 65m):
    restarts, won, led to a shot, led to a score.
11. **Breaking ball.** Breaks won on each side's own restarts.
12. **Goalkeepers** (*video events*). Each keeper: shots saved and parried, high balls caught,
    punched and dropped, sweeping clearances, goals conceded.
13. **Turnovers.** Share of turnovers won that led to a shot and a score, each side; how many
    times the ball was lost and how many of those led to a score against; ball lost by type
    (*both sides*).
14. **Conversion by zone.** Shots from play by distance band and side of the pitch.
15. **Expected scores from play.** Scores from play against what the chances usually bring
    (pooled from every club's games at the sport).
16. **Players** (*both sides*). Every player tagged: possessions, shots, scored, ball lost, ball
    lost that led to a score against, restarts won, tackles. With video events also hand
    passes, kick (strike) passes, solos and assists.
17. **Score assists** (*video events*). Each side: assists by player and type, who each player
    set up, and how many of the side's scores had an assist.
18. **Tackles** (*both sides*). Tackles by player.

Footer: Rock Solid Analytics, tier, report version, match date.

## Definitions

- **Possessions** (team): shots plus the times the ball was lost (a shot that drops short
  counts once).
- **Possessions** (player): times on the ball that were tagged: shots, ball lost, restarts
  won, turnovers won, rucks won. Where Player possession tags exist (detailed video tagging),
  each shot and free taken still counts as the shooter's possession, so the Player possession
  outcomes Shot from play and Scoreable free taken are never needed on top of the shot.
- **Restarts won**: every restart a side came away with, its own and the opposition's. On a
  restart the tagged player is whoever won the ball.
- **Kept**: own restarts won clean or on the break.
- **Conversion**: scores from all attempts of that kind.
- **Led to a shot / score**: the side won the ball and got a shot or score away before
  losing it again; frees count as shots.
- **Attack ending**: an attack ends with the next shot (a shot or a score if it was the same
  side's), the ball lost, a restart, the other side on the attack, or 90 seconds without a
  shot. An attack followed by another attack of the same side before any shot was **recycled**.
- **Assist to scorer**: each assist is matched to the nearest score by the same side, up to a
  minute either way (a free or penalty won to a free scored, up to two minutes after).
- **Duels and breaking ball** count each side's own tags. A throw-in lost by one side is won by
  the other.
- **Match flow minutes** count from the start of each half. Where the second-half clock
  overlaps first-half stoppage time (video tagging), the second half is drawn after the first.
- **Ball lost that led to a score against**: the opposition scored before the ball was won
  back.
- A bar shows each side's share of the two figures.

## Video (delivered with the report as playlist links)

- Tier 2: up to five playlists. Default set: scores for, scores against, restarts lost,
  ball lost that led to a score against, frees conceded.
- Tier 3: the five above plus one playlist per player.

## Open decisions

- Whether paid customers' games count in the shared expected scores pool and in other clubs'
  rankings (default: yes).
- Player ratings on the Tier 3 player page (default: counts only, no ratings).
