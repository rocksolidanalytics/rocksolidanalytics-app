# Validation tools

Offline gates for `index.html`. Run them before every push.

```
cd tools && npm install          # once: React, ReactDOM, supabase-js, papaparse
./validate.sh                    # all four gates against ../index.html
node selftest.js                 # proves each gate still catches its failure
SHOT=out.png ./validate.sh       # also screenshots the logged-out boot screen
```

| gate | file | fails when |
|---|---|---|
| 1 syntax | `extract.js` + `node --check` | the inline bundle does not parse |
| 2 boot | `boot_harness.js` | `#root` stays empty, a page error fires, or the error boundary shows. Runs on the sign-in route and the password-reset route (`#type=recovery`) |
| 3 shadowing | `dupscan.js` | any name is declared twice in one hoisting scope, or cross-scope reused function names rise above 22 |
| 3b escapes | `escscan.js` | a string literal still holds a backslash escape at runtime (double-escaped, shows as text). Must stay at 0 (all fixed by the HelpCenter pass) |
| 4 metrics | `cs_snapshot.js` | `computeStats`, `computeBenchmark` or `matchRatings` output differs from `baseline/computeStats.json` |

Notes
- The CDN scripts are served from `tools/node_modules` and Supabase is stubbed, so no network is needed.
  Playwright and TypeScript resolve from `tools/node_modules` or the global npm root.
- `dupscan.js` parses with the TypeScript compiler, so apostrophes in comments cannot fake an alarm.
  The cross-scope count (22 at commit 9454ae8) is legal reuse such as a local `save` in six components.
- The metrics baseline is 13 seeded synthetic cases (football, hurling, half filters, empty match).
  Regenerate it only for an intended metric change:
  `node cs_snapshot.js ../index.html baseline/computeStats.json`.

Screens behind sign-in
- `page.js` exports `openApp(file, { fixtures, hash, width, height })`, which opens the real page in Chromium.
- With `fixtures`, supabase-js is replaced by `fake_supabase.js`: a fixed session, rows per table
  (eq filters, single/maybeSingle), writes that succeed, and `INITIAL_SESSION` fired on subscribe.
- Example, an analyst with no club lands on Onboarding:
  `openApp('../index.html', { fixtures: { session: { user: { id: 'u1' } }, tables: { profiles: [{ id: 'u1', club_id: null }] } } })`

Browser tests (`e2e/`)
- `node e2e/run.js` runs every `e2e/test_*.js` in Chromium against the real `index.html` and prints PASS or FAIL
  per test with each failed check; it exits 1 on any failure. `node e2e/run.js youtube` runs the tests whose
  file name contains `youtube`. All seven take about 90 seconds.
- Covered: match format helpers, live tagger timing and extra time, new match length, penalty shootout,
  video tagger period marks (35 minutes with extra time, 3 x 20, marks read from the match on another device),
  the landscape strip, and YouTube in the video tagger and Game film through a stand-in player.
- Everything is synthetic: a made-up club, the seeded players from `fixtures.js` and `e2e/footage.webm`,
  a generated one-minute test clip. Never put real club data or exports in this folder.
- Screenshots go to `e2e/out/`, which is not committed. A new test exports `async function(t)` and records checks
  with `t.eq(label, got, want)` or `t.ok(label, condition)`; `e2e/lib.js` has the shared steps.
