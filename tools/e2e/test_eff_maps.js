// Season shot and restart maps: a Dots / Efficiency switch (kept per device). Efficiency draws
// the scoring or win rate against the average in the app colours, with the player and length
// filters still applying; too few shots fades the layer or leaves it out with a note.
const L = require('./lib.js');
module.exports = async function(t) {
  // A synthetic match with 120 shots from play, 12 frees and 90 of our kickouts, spread over the pitch.
  const f = L.fixtures({ matches: [{ id: 'ef', club_id: L.C, opponent: 'Kilcoole', date: '2026-10-30', status: 'final', competition: 'League', scouting: false, our_score: '0-40', opp_score: '0-10', our_total: 40, opp_total: 10 }] });
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ev = [];
  for (let i = 0; i < 132; i++) { const fr = i >= 120, x = 0.62 + rnd() * 0.33, y = 0.2 + rnd() * 0.6, sc = rnd() < (y < 0.5 ? 0.65 : 0.3) ? 1 : 0;
    ev.push({ id: 'es' + i, match_id: 'ef', club_id: L.C, seq: i + 1, period: 1, time_text: '00:10:00', team: 'us', event_type: fr ? 'Scoreable free' : 'Shot from play', outcome: sc ? 'Point' : 'Wide', score: sc, player: i < 110 ? 'Sean Murphy' : 'Cian Byrne', x, y }); }
  for (let i = 0; i < 90; i++) { const x = 0.15 + rnd() * 0.55, y = 0.1 + rnd() * 0.8, w = rnd() < (y < 0.5 ? 0.75 : 0.4);
    ev.push({ id: 'ek' + i, match_id: 'ef', club_id: L.C, seq: 200 + i, period: 1, time_text: '00:20:00', team: 'us', event_type: 'Kickout', outcome: w ? 'Won clean' : 'Lost clean', score: 0, player: 'Cian Byrne', x, y }); }
  f.tables.events = ev.concat(f.tables.events);
  const r = await L.open({ fixtures: f, w: 1180, h: 820 }), p = r.page;
  const tab = async n => { await p.evaluate(x => [...document.querySelectorAll('#root button')].find(b => b.innerText.trim() === x).click(), n); await L.wait(p, 900); };
  const layer = () => p.evaluate(() => { const i = document.querySelector('#root image[data-eff]'); return i ? +i.getAttribute('data-eff') : 0; });
  const dots = q => p.evaluate(sel => { const lab = [...document.querySelectorAll('#root div')].find(d => d.children.length === 0 && new RegExp(sel).test(d.innerText.trim())); let c = lab.parentElement; while (c && !c.querySelector('svg')) c = c.parentElement; return [...c.querySelectorAll('svg circle')].filter(x => /34c967|e0584d|f0c040|B06CFF/i.test(x.getAttribute('fill') + x.getAttribute('stroke'))).length; }, q);
  await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 2000);
  await tab('Attack');
  t.ok('shot map: dots by default with the switch', (await L.buttons(p, '^(Dots|Efficiency)$')) === 'Dots | Efficiency' && (await dots('SHOT MAP')) > 20 && (await layer()) === 0);
  await L.clickTxt(p, '^Efficiency$'); await L.wait(p, 600);
  const n = await layer();
  t.ok('shot map: efficiency layer drawn from shots from play, dots gone', n >= 40 && (await dots('SHOT MAP')) === 0, n + ' / ' + await dots('SHOT MAP'));
  t.ok('shot map: legend and note', /Below average/.test(await L.text(p)) && new RegExp(n + ' shots from play, \\d+% scored').test(await L.text(p)));
  await p.evaluate(() => [...document.querySelectorAll('#root div')].find(d => d.children.length === 0 && /SHOT MAP/.test(d.innerText)).scrollIntoView()); await L.shot(p, 'eff_shots');
  const sel = await p.evaluate(() => { const s = [...document.querySelectorAll('#root select')].find(x => [...x.options].some(o => /All players/.test(o.text))); const o = [...s.options].slice(1).sort((a, b) => +a.text.match(/\((\d+)\)/)[1] - +b.text.match(/\((\d+)\)/)[1])[0]; const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; set.call(s, o.value); s.dispatchEvent(new Event('change', { bubbles: true })); return o.text; });
  await L.wait(p, 500);
  t.ok('shot map: a player with few shots gets the not-enough note', /Not enough shots from play for an efficiency map yet|Only \d+ shots from play so far/.test(await L.text(p)), sel);
  await tab('Restarts');
  t.ok('restart map: the choice carries over', (await layer()) > 0 && /Won more often/.test(await L.text(p)));
  const all = await layer();
  await p.evaluate(() => { const lab = [...document.querySelectorAll('#root div')].find(d => d.children.length === 0 && /RESTART MAP$/.test(d.innerText.trim())); let c = lab.parentElement; while (!c.querySelector('svg')) c = c.parentElement; [...c.querySelectorAll('button')].find(b => b.innerText.trim() === 'Long').click(); }); await L.wait(p, 500);
  const lng = await layer();
  t.ok('restart map: the length filter applies', lng > 0 && lng < all, all + ' -> ' + lng);
  await p.evaluate(() => [...document.querySelectorAll('#root div')].find(d => d.children.length === 0 && /RESTART MAP$/.test(d.innerText.trim())).scrollIntoView()); await L.shot(p, 'eff_restarts');
  await p.reload(); await L.wait(p, 1500);
  t.eq('the choice is kept on the device', await p.evaluate(() => localStorage.getItem('rsa_mapview')), 'eff');
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
