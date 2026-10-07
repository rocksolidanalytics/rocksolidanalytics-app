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
| 4 metrics | `cs_snapshot.js` | `computeStats`, `computeBenchmark` or `matchRatings` output differs from `baseline/computeStats.json` |

Notes
- The CDN scripts are served from `tools/node_modules` and Supabase is stubbed, so no network is needed.
  Playwright and TypeScript resolve from `tools/node_modules` or the global npm root.
- `dupscan.js` parses with the TypeScript compiler, so apostrophes in comments cannot fake an alarm.
  The cross-scope count (22 at commit 9454ae8) is legal reuse such as a local `save` in six components.
- The metrics baseline is 13 seeded synthetic cases (football, hurling, half filters, empty match).
  Regenerate it only for an intended metric change:
  `node cs_snapshot.js ../index.html baseline/computeStats.json`.
