# RSA — time-based metrics specification

**Written:** 9 October 2026
**Purpose:** implementation spec for a family of metrics derived entirely from event timestamps, requiring **no new tagging**.
**Status:** designed and data-validated, not built.

## Why this family exists

Tagger adoption across all 59 matches in the database:

| Field / event type | Matches tagged in |
|---|---|
| Timestamp (`time_text`, every event) | 59 / 59 |
| Restart (`Kickout`) | 59 / 59 |
| Shot (`Shot from play` / `Scoreable free`) | 58 / 59 |
| `Possession lost` | 51 / 59 |
| `Free conceded` | 15 / 59 |
| `Turnover` | 4 / 59 |
| `Entry Into Opp 45` | 1 / 59 |

Every event type ever added to capture extra nuance has collapsed to near-zero adoption; the three that bound a possession are near-universal, and the timestamp is at 100%. `player` is blank 17.6% of the time and jersey-only (`#9`) another 28.1%, so only 54.3% carries a usable name.

**Design ruling:** extract more from the timestamp rather than add tagging load. Player-level possession tagging is explicitly out of scope — it loads the weakest field in the schema to produce a dimension that is already 46% unusable.

## Sequencing

Do not build this concurrently with the UI polish pass. Both produce a full-file replace of `index.html`, so the second to land discards the first unless rebuilt on it. Order: the three pending fixes → UI polish → this. Rebuild against the then-current HEAD, never a stale clone.

Within this spec, build in the groups given below, one commit per group. A twelve-metric single pass on an 833KB single-file bundle is the exact shape of change that goes wrong.

---

# Part 1 — Shared foundations

Build these once. Every metric below depends on them. All of it is **display-time only** — never modify stored values (standing project rule).

## 1.1 `evSecs(e)` — timestamp parse

`time_text` is 100% populated and carries genuine second-level resolution (60 distinct seconds values; only 1.8% land exactly on the minute, close to the 1.7% expected by chance). Two formats coexist: 9,866 events are `H:MM:SS` and 1,834 are `MM:SS`.

```js
function evSecs(e) {
  if (e.time_secs != null && e.time_secs > 0) return e.time_secs;
  var t = String(e.time_text || "");
  var p = t.split(":").map(Number);
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  if (p.length === 2) return p[0] * 60 + p[1];
  return 0;
}
```

Prefer `time_secs` where present but do **not** depend on it — it is populated on only 10 of 59 matches. Parse the hour field; ignoring it previously put a finding at "minute 1".

**The clock is continuous.** Verified: period 1 spans minutes 0–31 (p95), period 2 spans 31–61. The second half does not restart at zero, so `evSecs` is already a whole-match clock and needs no period offset. A ~5% tail of period-1 events carries a period-2 clock value (max 65 min) — tagging errors; see the guard in 1.4.

## 1.2 `canonOutcome(s)` — outcome normaliser

Outcome strings have fragmented into case and spelling variants. Any metric matching on outcome text will silently undercount without this. **Read-time normaliser only — do not run a data migration** (the standing rule is that stored values are never modified).

Live variant groups, from the current database:

| Canonical | Variants present |
|---|---|
| `2 Pointer` | `2 Pointer`, `2-Pointer`, `2 pointer` |
| `Saved` | `Saved`, `Save` |
| `Dropped Short` | `Dropped Short`, `Short` |
| `Hand Pass` | `Hand Pass`, `Hand pass` |
| `Kick Pass` | `Kick Pass`, `Kick pass` |
| `In Contact` | `In Contact`, `In contact` |
| `Won` (Ruck) | `Ruck Won`, `Won` |
| `Lost` (Ruck) | `Ruck Lost`, `Lost` |
| `Shot Dropped Short` | `Shot Dropped Short`, `Shot Short` |

Implement as lowercase-and-map. The `Save`/`Saved` split alone is 59 rows versus 43 — it already broke the score-source fix once, which is how it was found.

## 1.3 The possession model

A possession is bounded by a **gain** and an **end**. Both are derived from events that are tagged near-universally.

**Gain events** (the team gaining possession):

| Event | Outcome | Gaining team |
|---|---|---|
| `Kickout` | `Won clean`, `Break won` | the tagged team |
| `Kickout` | `Lost clean`, `Break lost` | the **other** team |
| `Possession lost` | any | the **other** team |
| `Turnover` | `Turnover won`, `In Contact`, `Interception` | the tagged team |
| `Ruck` | `Won` (canonical) | the tagged team |
| `Tackle` | `Dispossession` | the tagged team |
| `Free conceded` | any | the **other** team |

> The last row is a correction to the analysis prototype, which omitted it. Without it, the team awarded a free has its next possession attributed to an earlier gain, inflating duration. Only 285 rows, but fix it before shipping.

**End events** (the possession terminating):

| Event | Outcome | Kind |
|---|---|---|
| `Shot from play`, `Scoreable free` | any | `shot` |
| `Possession lost` | any | `lost` |
| `Free conceded` | any | `lost` |
| `Turnover` | `Turnover lost *` | `lost` |

**Pairing rule.** For each **end** event, find the most recent **gain** for the same team in the same `match_id` and `period`, with lower `seq`. Pair end-to-gain, not gain-to-end — pairing forward double-counts when two gains occur without an intervening end.

`duration = evSecs(end) - evSecs(gain)`.

Carry `kind` (`shot` / `lost`), `score`, and the gain's source (`restart` vs `other`) on each possession — several metrics need to split on them.

## 1.4 Guards

- **Discard `duration < 0`** — 9 cases, `seq` and timestamp disagreeing.
- **Discard or flag `duration > 180`** — 159 cases (3%), plainly spanning untagged play rather than real possession.
- **Never pair across a period boundary.** Half-time is not possession time.
- **Mixed match formats.** Matches run 60 and 70 minutes. Any block or late-game metric must either normalise to match length or exclude the final block from cross-match comparison. The 60–69 minute block is thin and not comparable to the others.
- **Cross-competition comparison is unsafe.** Tagging density differs by analyst — Bray's tackle counts jump from 28.7 to 141.5 per game between league and championship. Compare within a tagging regime, or state the caveat on the view.

## 1.5 Block model

`block = Math.min(Math.floor(evSecs(e) / 600), 6)` gives seven 10-minute blocks on the continuous clock. Use 5-minute blocks only for territory (4.2), where the extra resolution matters and the noise is tolerable.

---

# Part 2 — The metrics

Each entry gives the question it answers, the definition, and what to watch.

## Group 1 — When in the game

### 1.1 Block profile `[VALIDATED — already a finding]`

**Question:** when do we win and lose games?

Per 10-minute block, per team: points for, points against, shots for, shots against, and points per shot. Season view and single-match view.

**Already measured, Bray Emmets football, 16 matches:** +21 across the first half, −25 across the second. Worst block is 40–49 minutes at −13 — and it is a conversion problem, not a volume one: the opposition scored 57 from 54 shots (1.06 per shot) while Bray scored 44 from 62 (0.71). This is the strongest single finding in the family and should ship first.

Season totals to verify an implementation against (Bray Emmets football, `club_id = 972a7387-aeaa-4567-ad09-0f24f3b79e3c`, `scouting = false`, 16 matches):

| Block | For | Against | Diff | Shots for | Shots against |
|---|---|---|---|---|---|
| 0–9 | 48 | 39 | +9 | 69 | 57 |
| 10–19 | 37 | 31 | +6 | 71 | 63 |
| 20–29 | 51 | 45 | +6 | 75 | 46 |
| 30–39 | 52 | 55 | −3 | 71 | 78 |
| 40–49 | 44 | 57 | −13 | 62 | 54 |
| 50–59 | 39 | 43 | −4 | 57 | 47 |
| 60–69 | 9 | 14 | −5 | 21 | 23 |

**Watch:** exclude the 60–69 block from cross-match comparison (mixed formats).

### 1.2 Possession length bands `[VALIDATED]`

**Question:** how long should we hold the ball before shooting?

Band each possession by duration; report share leading to a shot, share leading to a score, and points per possession.

**Already measured, 5,217 possessions, all clubs:**

| Duration | → shot | → score | pts/possession |
|---|---|---|---|
| 0–9s | 37.8% | 18.0% | 0.228 |
| 10–19s | 44.3% | 21.6% | 0.262 |
| 20–29s | 54.2% | 22.4% | 0.289 |
| 30–44s | 61.5% | 34.6% | **0.433** |
| 45–59s | 65.8% | 32.6% | 0.393 |
| 60s+ | 58.6% | 29.5% | 0.371 |

Points per possession peaks at 30–44s and declines after. Conditioned on survival the shot rate is flat past 30 seconds (61.3% at 30s, 62.1% at 40s, 60.0% at 50s, 58.6% at 60s), so the whole gain is in reaching 30 seconds — holding longer buys nothing and costs scoring quality.

**Critical:** thresholds must be **sport-relative**. Median possession length is 30–32s in football but 16–21s in hurling and camogie, so a fixed 30-second band is near-median in one sport and deep in the tail in another. Either set bands per sport or express them as percentiles of that club's own distribution. (Checked: restricting to restart-initiated possessions barely narrows the spread, so this is genuinely the sport, not the analyst.)

Per-club medians to verify against: Bray football 30s, Rock Solid Gaels football 32s, St Jude's hurling 21s, St Jude's camogie 18s, Bray hurling 16s.

**Presentation note:** the "alive at *t*" framing is the statistically honest one and the one to show a coach — "if you still have it after 30 seconds you shoot 61% of the time". The band table is descriptive only; duration is measured *to* the terminating event, so longer possessions are mechanically more likely to have ended in a shot.

## Group 2 — Momentum and runs

Highest value after Group 1. This is what coaches talk about and nothing currently measures it.

### 2.1 Scoring droughts

**Question:** when do we go quiet?

Longest spell without a score, for and against, with its start minute. Report per match and the season distribution.

**Watch:** do not count the half-time interval as drought. Close each half's drought at the last event of the period.

### 2.2 Response time after conceding

**Question:** do we steady ourselves or tilt?

Median seconds from an opposition score to our next score. Plus the darker cut: share of concessions followed by **another** concession within two minutes, before we score. That second figure is as close to a tilt indicator as this data allows.

### 2.3 Burst detection

**Question:** are games decided in short bursts?

Count of windows containing 3+ scores inside five minutes, for and against. Pairs with 2.1 to give a rhythm profile — a team can have good totals and still lose on rhythm.

### 2.4 Time leading, level and behind

**Question:** how did the game actually feel?

Running scoreline from timestamped scores; sum seconds in each state. Cheap, and it reframes a narrow loss honestly in a season review.

## Group 3 — Tempo and game management

### 3.1 Substitution impact window

**Question:** did the changes work?

44 `Substitution` events already carry timestamps. For each, compare the 10 minutes before and after: shots, scores, points per shot, mean possession length. Attribute to the window, not to the player.

**Watch:** tiny per-match sample — only pool across a season, and never present a single substitution's window as evidence.

### 3.2 Restart speed, for and against

**Question:** are we quick enough, and are we letting them settle?

Seconds from a dead ball (score, wide, or any `_scDead` outcome) to the next `Kickout`. The defensive half is the more interesting one. Note the app already has a `RESTART SPEED · AVG` label, so some of this is half-built — check before duplicating.

### 3.3 Restart speed by game state

**Question:** how do we manage a lead?

3.2 split by whether the team is ahead, level or behind at that moment (needs the running scoreline from 2.4). Slowing down when ahead is game management and is currently invisible.

### 3.4 Transition speed by gain type

**Question:** is fast ball good ball?

Possession duration → outcome, split by whether the gain was a restart or a turnover. Expect these to behave differently; the headline finding that the fastest possessions convert *worst* is counterintuitive enough to be worth decomposing.

## Group 4 — Mechanism and scouting

### 4.1 Shot distance versus possession length

**Question:** *why* do long possessions decay?

Mean shot distance (from the existing `x`/`y`, using the derived-direction normalisation `koDirIndex`/`koOwnGoal`/`koNorm` from the restart fix) banded by possession duration. If 60-second possessions end in longer-range shots, the decay is "ran out of ideas and took what was going". If distance is flat, it is something else.

This is the one cut that tests the mechanism behind 1.2 with no new tagging, which is why it is worth doing despite being less presentable than the rest.

### 4.2 Territory over time

**Question:** when were we camped in their half, and when were we pinned?

Mean shot `x` per 5-minute block, direction-normalised. A crude but honest field-position timeline.

### 4.3 Opposition tempo fingerprint

**Question:** what should we expect on Sunday?

For a scouted opponent: median possession length, restart speed, and which blocks they score in. "They play at 22 seconds and score in bursts early in each half" is more use in a pre-match brief than another conversion percentage.

## Group 5 — Match dominance rebuild

**Replaces:** the proposal to relabel live win probability as "match dominance", which was rejected because a relabel misreads a team sitting on a late lead.

Build it from this time data instead, all rolling-window:

- share of ball-in-play time
- possession-length differential
- time since each side last scored
- territory (mean shot `x`, recent window)

Scoreline and time remaining are deliberately **dropped** — that is what makes it a dominance measure rather than a disguised win probability, and it is what makes it behave correctly for a team defending a lead.

**Depends on** Groups 1–3. Build last.

---

# Part 3 — Implementation notes

## Where it goes

All of it belongs in `computeStats`, alongside the existing `chains` and `_koBand`. The chain machinery and the `Possession lost`-as-sole-breaker ruling are already there — this is an extension, not a new engine.

Compute client-side, consistent with the existing architecture. Volume is trivial: ~90 possessions per match, 5,385 across the whole database.

The live tagger needs its own copies for anything shown at half-time, as it does for `bandOf` and `liveKoPts`. Keep the definitions byte-identical between the two or the dashboard and the pad will disagree — that has happened before.

## Validation gates (non-negotiable)

1. Assert every replacement count `== 1` **before** writing. A zero-match replace fails silently and `replace("")` prepends to the file.
2. `node --check` on the extracted bundle.
3. `boot_harness.js` — expect `PASS __RENDER_REACHED__`.
4. `dupscan.js` — **baseline is 18** as of HEAD `9454ae8`. Compare entry names and depths, not the printed byte offsets, which shift on every edit. Note that `dupscan` false-alarms on apostrophes in comments (it reads `'` as a string opener), so write bundle comments without them.
5. Anchor every edit to a **function name**, never a byte offset.
6. Provide the rollback SHA.

## Out of scope

- Any new tagging, and player-level possession attribution in particular.
- Ball-in-play percentage as a standalone metric — needs too many assumptions about what a gap means. (It appears in Group 5 only as a rolling-window component, where relative movement matters and the absolute value does not.)
- Frees-conceded clustering — only 15 of 59 matches carry the data.
- Any migration of stored outcome values. Normalise at read time.

## Known data issues these metrics inherit

- Duration includes stoppages. A free awarded mid-move inflates it; 3% of possessions exceed three minutes and are plainly untagged play.
- 8 score rows share a `(match_id, seq)` pair with another event, so the backwards walk order is arbitrary for those.
- Three match-periods have corrupt coordinates (both teams shooting at the same end) and cannot be direction-resolved: Bray Emmets v Tinahely (29 May 2026, both halves) and Eadestown v Round Towers (31 Jul 2026, H2). Affects 4.1 and 4.2 only.
