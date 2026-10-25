# Match report spec (version 1)

One match report, the same layout for every game and every club. The tier decides how much
of it is included; nothing else changes it. The report is built by `exportMatchReport` in
`index.html` (Dashboard, one match, Export) and prints its tier and version in the footer
("Report v1"). Any change to the sections, their order or a definition is a new version:
update this file and `REPORT_VERSION` together.

## Tiers

| Tier | Name | Price (per game) | Includes |
|---|---|---|---|
| 1 | Summary | EUR 50 | Sections 1 to 5 |
| 2 | Analysis | EUR 75 | Sections 1 to 12, plus up to 5 video playlists |
| 3 | Full breakdown | EUR 150 | Sections 1 to 14, plus a clip playlist for every player |

Club members (lifetime access, EUR 850) get the full breakdown from Export. Every paid game
is tagged to the full standard whatever tier is bought, so an upgrade is only a new report.

Tier 1 has no comparisons with other teams (no expected scores, no rankings).

## Sections, in order

Header: both teams, date, competition, round or stage, venue, referee, and the tier name.

1. **Result.** Both jerseys beside the score (stand-in jerseys when a side has no kit),
   half-time and full-time table, scores from frees.
2. **Score by period.** Scores in 10-minute blocks.
3. **Scorers.** Both sides, goals-points, frees in brackets.
4. **Match stats.** Head-to-head bars in the two team colours, a main bar per measure with
   its breakdown underneath: possessions (shots and scores per 10 possessions), shots from
   play and scoreable frees (goal, point, 2-pointer, wide, saved, dropped short, blocked,
   woodwork, conversion), restarts won (own taken, own kept, theirs won, won clean, won on
   the break), tackles (contact, blocks and hooks, fouls, per 10 opposition possessions),
   ball lost (by type, turnovers won), rucks and cards when tagged.
5. **Shot maps.** Both sides, the app's own map: point, 2-pointer, goal, miss; frees as squares.
6. **Where scores came from.** Each score put down to how the passage began (own or their
   restart, turnover by type, throw-in).
7. **Restart maps.** Both sides, numbered with who won or lost each restart.
8. **Restart to shot.** Both sides, short (under 45m), mid (45 to 65m), long (over 65m):
   restarts, won, led to a shot, led to a score.
9. **Breaking ball.** Breaks won on each side's own restarts.
10. **Turnovers.** Share of turnovers won that led to a shot and a score, each side; how many
    times we lost the ball and how many of those led to a score against; ball lost by type.
11. **Conversion by zone.** Shots from play by distance band and side of the pitch.
12. **Expected scores from play.** Scores from play against what the chances usually bring
    (pooled from every club's games at the sport).
13. **Players.** Every player tagged on our side: possessions, shots, scored, ball lost, ball
    lost that led to a score against, restarts won, tackles.
14. **Tackles.** Tackles by player.

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
