// Match format helpers: period starts for 30, 35 and 3x20 games, extra time, time since score.
const fs = require('fs');
const { APP } = require('./lib.js');
module.exports = async function(t) {
  const src = fs.readFileSync(APP, 'utf8');
  const i = src.indexOf('  function mFmt(m) {'), j = src.indexOf('  // Whole seconds only: the video tagger clock is fractional.');
  const pad2 = n => String(n).padStart(2, '0');
  const H = new Function('pad2', src.slice(i, j) + '; return { perStart, perName, perShort, ttShort, secsSinceScore, pensNote };')(pad2);
  const m35 = { half_mins: 35 }, m3 = { half_mins: 20, periods: 3 };
  t.eq('empty format: 2nd half starts at 30:00', H.perStart({}, 2), 1800);
  t.eq('35 min: 2nd half, ET 1st, ET 2nd start', [2, 3, 4].map(p => H.perStart(m35, p)), [2100, 4200, 4800]);
  t.eq('3x20: period 3 starts at 40:00', H.perStart(m3, 3), 2400);
  t.eq('names, 35 min with ET', [1, 2, 3, 4].map(p => H.perName(m35, p)), ['1st half', '2nd half', 'ET 1st half', 'ET 2nd half']);
  t.eq('names, 3x20', [1, 2, 3].map(p => H.perName(m3, p)), ['1st period', '2nd period', '3rd period']);
  t.eq('short names', [H.perShort({}, 2), H.perShort(m3, 3), H.perShort(m35, 3)], ['H2', 'P3', 'ET1']);
  t.eq('clock text past the hour', H.ttShort('01:10:02'), '70:02');
  const ev = [{ team: 'us', score: 1, period: 1, time_text: '00:20:00' }, { team: 'opp', score: 0, period: 1, time_text: '00:29:00' }];
  t.eq('since score across half-time, 30 min', H.secsSinceScore(ev, 'us', 2, 300, {}), { secs: 840, scored: true });
  const ev35 = [{ team: 'us', score: 1, period: 1, time_text: '00:20:00' }, { team: 'opp', score: 0, period: 1, time_text: '00:34:00' }, { team: 'x', period: 2, time_text: '01:05:00' }];
  t.eq('since score into extra time, 35 min', H.secsSinceScore(ev35, 'us', 3, 60, m35), { secs: 2700, scored: true });
  t.eq('penalties note', H.pensNote({ penalties: { winner: 'opp', us: 3, opp: 4 } }, 'Us', 'Them'), 'Them won 4-3 on penalties');
  t.eq('no shootout, no note', H.pensNote({}, 'Us', 'Them'), '');
};
