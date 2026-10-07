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

// seeded fixtures
let seed = 20261007; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = a => a[Math.floor(rnd() * a.length)];
const TYPES = { kickout: 'Kickout', shot: 'Shot from play', free: 'Scoreable free', poss: 'Possession lost', tackle: 'Tackle', card: 'Bookings', freewon: 'Free won', towon: 'Turnover won', ruck: 'Ruck' };
const OUT = { kickout: ['Won clean', 'Break won', 'Break lost', 'Lost clean', 'Straight Over Sideline'], shot: ['Point', '2 Pointer', 'Goal', 'Wide', 'Blocked', 'Dropped Short', 'Saved', 'Woodwork'],
  free: ['Point', '2 Pointer', 'Goal', 'Wide', 'Dropped Short', 'Saved', 'Woodwork'], poss: ['In Contact', 'Kick Pass', 'Hand Pass', 'Handling', 'Intercepted', 'Foul', 'Shot Dropped Short', '3-Man Breach'],
  towon: ['Tackle', 'Interception', 'Loose Ball', 'Forced Error'], tackle: ['Contact Made', 'Block', 'Foul'], freewon: ['In Tackle', 'Off The Ball', 'Overcarry', 'Frontal Contact', 'Other'], card: ['Yellow', 'Black', 'Red'], ruck: ['Ruck Won', 'Ruck Lost'] };
const SC = { Point: 1, '2 Pointer': 2, Goal: 3 };
const PLAYERS = ['Sean Murphy', 'Ciaran Byrne', 'Darragh Kelly', 'Eoin Walsh', 'Padraig Doyle', 'Tomas Nolan', 'Cian Kavanagh', 'Niall Ryan', 'Oisin Brennan', 'Fionn Doran', 'Ruairi Kehoe', 'Conor Quinn', 'Aidan Farrell', 'Shane Lynch', 'Ronan Healy'];
function mkMatch(id, opponent, sport, nEv) {
  const keys = Object.keys(TYPES).filter(k => sport === 'hurling' || k !== 'ruck');
  const evs = []; let us = 0, op = 0;
  for (let i = 0; i < nEv; i++) {
    const k = pick(keys), oc = pick(OUT[k]), team = rnd() < 0.55 ? 'us' : 'opp';
    const score = (k === 'shot' || k === 'free') ? (SC[oc] || 0) : 0;
    if (team === 'us') us += score; else op += score;
    const placed = rnd() < 0.85;
    evs.push({ id: id + '-' + i, match_id: id, seq: i + 1, team, event_type: TYPES[k], outcome: oc, score, period: i < nEv / 2 ? 1 : 2,
      player: team === 'us' ? (rnd() < 0.9 ? pick(PLAYERS) : '') : null, x: placed ? +rnd().toFixed(4) : null, y: placed ? +rnd().toFixed(4) : null,
      time_text: String(Math.floor(i * 70 / nEv)).padStart(2, '0') + ':' + String(Math.floor(rnd() * 60)).padStart(2, '0') });
  }
  const apps = PLAYERS.map((p, j) => ({ match_id: id, player_name: p, jersey: j + 1, position_slot: j < 15 ? j + 1 : null }));
  return { m: { id, opponent, our_total: us, opp_total: op, date: '2026-0' + (id.length % 9 + 1) + '-1' + id.length % 9, venue: pick(['Home', 'Away', 'Neutral']), weather: pick(['Dry', 'Light Rain', 'Heavy Rain']), competition: 'League', sport }, evs, apps };
}
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
