// Season shot and restart maps: tapping a dot shows a card with the player, the result and
// where in which match it happened; tapping it again or the close button hides it.
const L = require('./lib.js');
module.exports = async function(t) {
  const f = L.fixtures({ matches: [{ id: 'mt', club_id: L.C, opponent: 'Kilcoole', date: '2026-10-30', status: 'final', competition: 'League', scouting: false, our_score: '0-2', opp_score: '0-1', our_total: 2, opp_total: 1 }] });
  f.tables.events = [
    { id: 'ts1', match_id: 'mt', club_id: L.C, seq: 1, period: 1, time_text: '00:12:34', team: 'us', event_type: 'Shot from play', outcome: 'Point', score: 1, player: 'Sean Murphy', x: 0.8, y: 0.3 },
    { id: 'ts2', match_id: 'mt', club_id: L.C, seq: 2, period: 2, time_text: '00:05:10', team: 'us', event_type: 'Shot from play', outcome: 'Wide', score: 0, player: 'Cian Byrne', x: 0.75, y: 0.7 },
    { id: 'tk1', match_id: 'mt', club_id: L.C, seq: 3, period: 1, time_text: '00:20:00', team: 'us', event_type: 'Kickout', outcome: 'Won clean', score: 0, player: 'Cian Byrne', x: 0.4, y: 0.5 }
  ];
  const r = await L.open({ fixtures: f, w: 1180, h: 820 }), p = r.page;
  const tab = async n => { await p.evaluate(x => [...document.querySelectorAll('#root button')].find(b => b.innerText.trim() === x).click(), n); await L.wait(p, 900); };
  const card = () => p.evaluate(() => { const c = document.querySelector('#root [role=status]'); return c ? c.innerText.replace(/\s+/g, ' ').trim() : ''; });
  // Tap the dot whose transparent hit circle sits nearest the given map point.
  const tap = (lab, i) => p.evaluate(([q, k]) => { const l = [...document.querySelectorAll('#root div')].find(d => d.children.length === 0 && new RegExp(q).test(d.innerText.trim())); let c = l.parentElement; while (!c.querySelector('svg')) c = c.parentElement; const g = [...c.querySelectorAll('svg g')].filter(x => x.style.cursor === 'pointer'); g[k].dispatchEvent(new MouseEvent('click', { bubbles: true })); return g.length; }, [lab, i]);
  await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 2000);
  await tab('Attack');
  if (await p.evaluate(() => /Efficiency/.test(localStorage.getItem('rsa_mapview') || ''))) await L.clickTxt(p, '^Dots$');
  t.eq('shot map: no card before a tap', await card(), '');
  const n = await tap('SHOT MAP', 0); await L.wait(p, 300);
  const c1 = await card();
  t.ok('shot map: two tappable dots and a card for the first', n === 2 && /Sean Murphy/.test(c1) && /SHOT . POINT/.test(c1) && /v Kilcoole/.test(c1) && /H1 12:34/.test(c1) && /0\.\d\d xS/.test(c1), n + ' ' + c1);
  t.ok('shot map: the xS matches the zone rate', await p.evaluate(() => { const v = document.querySelector('#root [data-xs]'); return !!v && +v.dataset.xs > 0 && +v.dataset.xs < 1; }));
  await p.evaluate(() => document.querySelector('#root [role=status]').scrollIntoView({ block: 'end' })); await L.wait(p, 300);
  await L.shot(p, 'map_tap_shot');
  await tap('SHOT MAP', 1); await L.wait(p, 300);
  t.ok('shot map: another dot swaps the card', /Cian Byrne/.test(await card()) && /SHOT . WIDE/.test(await card()) && /H2 05:10/.test(await card()), await card());
  await tap('SHOT MAP', 1); await L.wait(p, 300);
  t.eq('shot map: tapping it again hides the card', await card(), '');
  await tab('Restarts');
  await tap('RESTART MAP$', 0); await L.wait(p, 300);
  t.ok('restart map: card for the kickout', /Cian Byrne/.test(await card()) && /KICKOUT . WON CLEAN/.test(await card()) && !/xS/.test(await card()), await card());
  await p.evaluate(() => document.querySelector('#root [role=status] button[aria-label=Close]').click()); await L.wait(p, 300);
  t.eq('restart map: the close button hides it', await card(), '');
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
