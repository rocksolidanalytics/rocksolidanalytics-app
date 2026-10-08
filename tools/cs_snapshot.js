// node cs_snapshot.js index.html out.json
// Runs the real bundle in a VM with stubbed browser + supabase, then calls computeStats on seeded synthetic fixtures.
const fs = require('fs'), vm = require('vm'), path = require('path');
const extract = require('./extract');
const { req } = require('./resolve');
let src = extract(process.argv[2]);
const anchor = '  ReactDOM.createRoot(document.getElementById("root"))';
if (src.split(anchor).length !== 2) throw new Error('render anchor count != 1');
src = src.replace(anchor, '  globalThis.__RSA = { computeStats, computeBenchmark, matchRatings };\n' + anchor);
const noop = () => {}; const any = new Proxy(function () {}, { get: (t, k) => k === Symbol.toPrimitive ? () => '' : k === 'then' ? undefined : any, apply: () => any, construct: () => any });
const store = {};
const ctx = { console, Math, Date, JSON, Object, Array, String, Number, Set, Map, Promise, setTimeout, clearTimeout, setInterval, clearInterval,
  React: req('react'), ReactDOM: { createRoot: () => ({ render: noop }) },
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
  document: any, navigator: { userAgent: 'node' }, location: { search: '', hash: '', pathname: '/', href: 'http://x/' }, history: any,
  Papa: any, fetch: () => Promise.reject(new Error('offline')), URLSearchParams, matchMedia: () => ({ matches: false, addListener: noop, addEventListener: noop }) };
ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
ctx.addEventListener = noop; ctx.removeEventListener = noop;
ctx.supabase = { createClient: () => any };
vm.createContext(ctx); vm.runInContext(src, ctx, { filename: 'bundle.js' });
const { computeStats, computeBenchmark, matchRatings } = ctx.__RSA;

// seeded fixtures (shared with the screen harnesses)
const { mkMatch } = require('./fixtures').gen(20261007);
const football = [mkMatch('m1', 'Kilmacud', 'football', 160), mkMatch('m22', 'Ballyboden', 'football', 140), mkMatch('m333', 'Na Fianna', 'football', 180), mkMatch('m4444', 'AHB', 'football', 4)];
const hurling = [mkMatch('h1', 'Cuala', 'hurling', 170), mkMatch('h22', 'Na Piarsaigh', 'hurling', 150)];
const clubF = { id: 'c1', name: 'Bray Emmets', sport: 'football' }, clubH = { id: 'c2', name: 'Bray Emmets', sport: 'hurling' };
function canon(v, seen = new WeakSet()) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 'NUM:' + String(v);
  if (v === undefined) return 'UNDEF'; if (typeof v === 'function') return 'FN';
  if (v instanceof Set) return { SET: [...v].map(x => canon(x, seen)) };
  if (v && typeof v === 'object') { if (seen.has(v)) return 'CYCLE'; seen.add(v);
    if (Array.isArray(v)) return v.map(x => canon(x, seen));
    const o = {}; for (const k of Object.keys(v).sort()) o[k] = canon(v[k], seen); return o; }
  return v;
}
const out = {};
function run(label, set, club, half) {
  const ms = set.map(s => s.m), ev = set.flatMap(s => s.evs), ap = set.flatMap(s => s.apps);
  try { out[label] = canon(computeStats(ms, ev, ap, club, half)); } catch (e) { out[label] = 'THROW:' + e.message; }
}
for (const [i, s] of football.entries()) run('F.single.' + i, [s], clubF);
run('F.all', football, clubF); run('F.all.half1', football, clubF, '1'); run('F.all.half2', football, clubF, '2');
run('F.empty', [], clubF);
for (const [i, s] of hurling.entries()) run('H.single.' + i, [s], clubH);
run('H.all', hurling, clubH);
try { out.bench = canon(computeBenchmark(football.map(s => s.m), football.flatMap(s => s.evs), clubF)); } catch (e) { out.bench = 'THROW:' + e.message; }
try { out.ratings = canon(matchRatings(football.map(s => s.m), football.flatMap(s => s.evs))); } catch (e) { out.ratings = 'THROW:' + e.message; }
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
const throws = Object.entries(out).filter(([k, v]) => typeof v === 'string' && v.startsWith('THROW'));
console.log('cases', Object.keys(out).length, 'throws', throws.length, throws.map(t => t.join(' ')).join(' | '), 'bytes', fs.statSync(process.argv[3]).size);
