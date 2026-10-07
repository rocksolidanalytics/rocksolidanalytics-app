#!/usr/bin/env bash
# Usage: tools/validate.sh [index.html]   Runs every gate; exits non-zero on the first failure.
set -euo pipefail
T="$(cd "$(dirname "$0")" && pwd)"; F="$(realpath "${1:-$T/../index.html}")"; W="$(mktemp -d)"
trap 'rm -rf "$W"' EXIT
[ -d "$T/node_modules/react" ] || (cd "$T" && npm install --silent)
node "$T/extract.js" "$F" "$W/bundle.js" >/dev/null
node --check "$W/bundle.js" && echo "1 node --check      OK"
printf '2 boot harness      '; node "$T/boot_harness.js" "$F" "${SHOT:-}"
printf '3 '; node "$T/dupscan.js" "$F"
printf '4 computeStats      '; node "$T/cs_snapshot.js" "$F" "$W/cs.json" >/dev/null
if cmp -s "$T/baseline/computeStats.json" "$W/cs.json"; then echo "byte-identical to baseline"; else echo "DIFFERS FROM BASELINE"; diff <(head -c 4000 "$T/baseline/computeStats.json") <(head -c 4000 "$W/cs.json") | head -20; exit 1; fi
echo "ALL GATES PASS"
