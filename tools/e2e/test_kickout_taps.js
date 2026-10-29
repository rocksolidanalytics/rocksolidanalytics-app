// Restarts tab: a hint says taps go to the pitch map; the Restart to shot numbers and the zone
// cells open the pitch map on just those kickouts, and back returns to the Restarts tab.
const L = require('./lib.js');
module.exports = async function(t) {
  const f = L.fixtures({ matches: [{ id: 'fm', club_id: L.C, opponent: 'Mayo', date: '2026-10-25', status: 'final', competition: 'Championship', scouting: false,
    our_score: '0-01', opp_score: '0-00', our_total: 1, opp_total: 0 }] });
  // 8 of our kickouts, alternately won and lost; the first won one leads to a point.
  const ko = Array.from({ length: 8 }, (_, i) => ({ id: 'ko' + i, match_id: 'fm', club_id: L.C, seq: 10 * i + 1, period: 1, time_text: '00:' + String(2 + i * 3).padStart(2, '0') + ':00',
    team: 'us', event_type: 'Kickout', outcome: i % 2 ? 'Break lost' : 'Won clean', score: 0, player: 'Cian Byrne', x: 0.15, y: 0.3 + 0.05 * i }));
  ko.push({ id: 'sh1', match_id: 'fm', club_id: L.C, seq: 2, period: 1, time_text: '00:02:30', team: 'us', event_type: 'Shot from play', outcome: 'Point', score: 1, player: 'Sean Murphy', x: 0.85, y: 0.5 });
  f.tables.events = ko.concat(f.tables.events);
  const r = await L.open({ fixtures: f, w: 390, h: 844 }), p = r.page;
  const tx = () => L.text(p);
  const restarts = async () => { await L.clickTxt(p, '^[WLD]\\s*Last match'); await L.wait(p, 2000); await L.clickTxt(p, '^Restarts$'); await L.wait(p, 800); };
  await restarts();
  t.ok('the tab says where a tap goes', /Tap a number below to see those kickouts on the pitch map/.test(await tx()));
  const labels = await p.evaluate(() => [...document.querySelectorAll('#root button[aria-label*="on the pitch map"]')].map(b => b.getAttribute('aria-label')));
  t.ok('restart to shot numbers are tappable', labels.includes('kickouts: see the 8 on the pitch map') && labels.includes('kickouts won: see the 4 on the pitch map') && labels.includes('kickouts won → shot: see the 1 on the pitch map'), labels.join(' | '));
  t.ok('zone cells are tappable', labels.some(l => /^(SHORT|MID|LONG) (LEFT|CENTRE|RIGHT): see the \d on the pitch map$/.test(l)), labels.join(' | '));
  await p.click('button[aria-label="kickouts won: see the 4 on the pitch map"]'); await L.wait(p, 2000);
  let s = await tx();
  t.ok('pitch map opens on just those kickouts', /Own kickouts won/.test(s) && /4 of 4 on the pitch/.test(s), s.slice(0, 300));
  t.ok('coloured by outcome', /Won clean/.test(s));
  await L.shot(p, 'kickout_taps_pitch');
  await p.evaluate(() => document.querySelector('#root button').click()); await L.wait(p, 2000);
  s = await tx();
  t.ok('back returns to the Restarts tab of the match', /All matches/.test(s) && /Tap a number below/.test(s));
  const cellLab = await p.evaluate(() => [...document.querySelectorAll('#root button[aria-label*="on the pitch map"]')].map(b => b.getAttribute('aria-label')).find(l => /^(SHORT|MID|LONG) (LEFT|CENTRE|RIGHT)/.test(l)));
  await p.click('button[aria-label="' + cellLab + '"]'); await L.wait(p, 2000);
  t.ok('a zone cell opens its kickouts', /Own (short|mid|long) kickouts · /.test(await tx()) && /on the pitch/.test(await tx()));
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
