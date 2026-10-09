// node tools/tm_verify.js index.html events.json
// Runs the real bundle computeStats on an export of live events and prints the Group 1 checks from
// docs/RSA-SPEC-time-metrics.md. events.json = { matches: [{ id, club, sport, scouting }], events: [...] }
// with club as the first 8 chars of club_id. The export holds real club data: keep it out of the repo.
const fs = require('fs'), vm = require('vm'); const T = __dirname + '/';
const extract = require(T + 'extract'); const { req } = require(T + 'resolve');
let src = extract(process.argv[2]); const anchor = '  ReactDOM.createRoot(document.getElementById("root"))';
src = src.replace(anchor, '  globalThis.__RSA = { computeStats };\n' + anchor);
const noop = () => {}; const any = new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => '' : k === 'then' ? undefined : any, apply: () => any, construct: () => any });
const ctx = { console, Math, Date, JSON, Object, Array, String, Number, Set, Map, Promise, setTimeout, clearTimeout, setInterval, clearInterval, React: req('react'), ReactDOM: { createRoot: () => ({ render: noop }) },
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop }, document: any, navigator: { userAgent: 'node' }, location: { search: '', hash: '', pathname: '/', href: 'http://x/' }, history: any, Papa: any,
  fetch: () => Promise.reject(new Error('offline')), URLSearchParams, matchMedia: () => ({ matches: false, addListener: noop, addEventListener: noop }) };
ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx; ctx.addEventListener = noop; ctx.removeEventListener = noop; ctx.supabase = { createClient: () => any };
vm.createContext(ctx); vm.runInContext(src, ctx, { filename: 'bundle.js' }); const { computeStats } = ctx.__RSA;
const D = JSON.parse(fs.readFileSync(process.argv[3]));
function run(filter, sport) {
  const ms = D.matches.filter(filter).map(m => ({ id: m.id, our_total: 0, opp_total: 0 })); const ids = new Set(ms.map(m => m.id));
  return computeStats(ms, D.events.filter(e => ids.has(e.match_id)), [], { id: 'c', name: 'Club', sport: sport });
}
const pct = x => x == null ? '-' : (100 * x).toFixed(1);
// 1. Bray football block diffs
const bray = run(m => m.club === '972a7387' && m.sport === 'football' && !m.scouting, 'football');
const nM = new Set(D.events.filter(e => D.matches.find(m => m.id === e.match_id && m.club === '972a7387' && m.sport === 'football' && !m.scouting)).map(e => e.match_id)).size;
const tb = bray.timeBlocks;
console.log('BRAY FOOTBALL (' + nM + ' matches with events)');
console.log(' block  for  agst  diff  sh.for sh.agst  pps.for pps.agst');
tb.us.forEach((u, i) => { const o = tb.opp[i]; console.log(' ' + ['0-9','10-19','20-29','30-39','40-49','50-59','60-69'][i].padEnd(6), String(u.pts).padStart(4), String(o.pts).padStart(5), ((u.pts - o.pts > 0 ? '+' : '') + (u.pts - o.pts)).padStart(5), String(u.shots).padStart(7), String(o.shots).padStart(7), (u.pts / u.shots).toFixed(2).padStart(8), (o.pts / o.shots).toFixed(2).padStart(8)); });
console.log(' diffs:', tb.us.map((u, i) => u.pts - tb.opp[i].pts).join(', '), ' (spec +9, +6, +6, -3, -13, -4, -5)');
// 2. All-clubs bands, pooled us+opp, football thresholds as in the spec table
const all = run(() => true, 'football'); const pl = all.possLen;
const pool = all.possPairs; console.log('\nALL CLUBS possessions kept', pool.length, 'dropped neg', pl.dropped.neg, '>180', pl.dropped.long);
const ts = pl.ts; console.log(' thresholds', ts.join('/'));
ts.forEach((lo, i) => { const hi = ts[i + 1]; const s = pool.filter(p => p.dur >= lo && (hi == null || p.dur < hi)); const sh = s.filter(p => p.kind === 'shot').length, sc = s.filter(p => p.score > 0).length, pts = s.reduce((a, p) => a + p.score, 0);
  console.log(' ' + (lo + '-' + (hi == null ? '' : hi - 1) + 's').padEnd(7), 'shot', pct(sh / s.length).padStart(5), ' score', pct(sc / s.length).padStart(5), ' ppp', (pts / s.length).toFixed(3), ' n', s.length); });
console.log(' alive at t (pooled):', ts.map(t => { const s = pool.filter(p => p.dur >= t); return t + 's ' + pct(s.filter(p => p.kind === 'shot').length / s.length); }).join('  '));
// 3. Per-club medians, from the bundle output
function med(a) { a = a.slice().sort((x, y) => x - y); const n = a.length; return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2; }
console.log('\nPER-CLUB MEDIAN (all possessions | restart-initiated) [spec]');
[['972a7387', 'football', 'Bray football', 30], ['dddddddd', 'football', 'Gaels football', 32], ['b82b0e7e', 'hurling', 'Judes hurling', 21], ['81c42154', 'camogie', 'Judes camogie', 18], ['7e4a8c8a', 'hurling', 'Bray hurling', 16]].forEach(c => {
  const r = run(m => m.club === c[0], c[1]); const P = r.possPairs;
  console.log(' ' + c[2].padEnd(15), String(med(P.map(p => p.dur))).padStart(4), '|', String(med(P.filter(p => p.src === 'restart').map(p => p.dur))).padStart(4), '  [' + c[3] + ']   ref ' + r.possLen.ref + 's, thresholds ' + r.possLen.ts.join('/'));
});
