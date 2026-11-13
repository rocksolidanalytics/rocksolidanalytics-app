// Opposition page, Their style: one verdict per part (kickout strategy, where their scores come
// from, shooting, how you lose the ball, tackling), then the dashboard restart and shot maps. One match
// against Kilmacud with a known pattern, every opposition event facing the same way (they attack
// x = 0 in the first half, so their own goal is at x = 1).
const L = require('./lib.js');
module.exports = async function(t) {
  const f = L.fixtures();
  f.tables.matches.push({ id: 'km', club_id: L.C, opponent: 'Kilmacud', date: '2026-09-01', status: 'final', scouting: false, our_score: '0-10', opp_score: '1-12', our_total: 10, opp_total: 15 });
  let seq = 0, sec = 60;
  const ev = (o) => { seq++; sec += o.gap || 20; const m = Math.floor(sec / 60), s2 = sec % 60; f.tables.events.push(Object.assign({ id: 'k' + seq, match_id: 'km', club_id: L.C, seq, period: 1, score: 0, time_text: '00:' + String(m).padStart(2, '0') + ':' + String(s2).padStart(2, '0') }, o)); };
  // Their shots (they attack x = 0): 2 inside 21m, 2 at 21-40m, 3 from 40m+ (one a 2-pointer).
  [[0.08, 1, 'Point'], [0.1, 0, 'Wide'], [0.2, 1, 'Point'], [0.25, 0, 'Wide'], [0.32, 2, '2-Pointer'], [0.35, 0, 'Wide'], [0.4, 0, 'Short']].forEach(s => ev({ team: 'opp', event_type: 'Shot from play', outcome: s[2], score: s[1], x: s[0], y: 0.5 }));
  // Our scores, each followed by one of their kickouts: 5 long (3 kept, quick), 2 short (kept, slow), 1 medium.
  const kos = [[0.4, 'Won clean', 10], [0.45, 'Won clean', 12], [0.5, 'Break won', 15], [0.42, 'Lost clean', 20], [0.48, 'Break lost', 25], [0.8, 'Won clean', 60], [0.78, 'Won clean', 70], [0.6, 'Lost clean', 40]];
  kos.forEach(k => { ev({ team: 'us', event_type: 'Shot from play', outcome: 'Point', score: 1, x: 0.9, y: 0.5 }); ev({ team: 'opp', event_type: 'Kickout', outcome: k[1], x: k[0], y: 0.5, gap: k[2] }); });
  // Their tackles: 3 up in our third (x under 1/3), 2 in the middle, 1 at home.
  [0.2, 0.25, 0.3, 0.5, 0.6, 0.9].forEach(x => ev({ team: 'opp', event_type: 'Tackle', outcome: 'Contact', x, y: 0.4 }));
  // Our lost ball against them, all kicked away.
  [1, 2, 3, 4, 5].forEach(() => ev({ team: 'us', event_type: 'Possession lost', outcome: 'Kick Pass' }));
  // A second team with tackles tagged by jersey number only (no spot), as most tagging is.
  f.tables.matches.push({ id: 'nm', club_id: L.C, opponent: 'Naomh Mearnog', date: '2026-09-08', status: 'final', scouting: false, our_score: '0-11', opp_score: '0-09', our_total: 11, opp_total: 9 });
  ['#11', '#12', '#14', '#10', '#8', '#4', ''].forEach((pl, i) => f.tables.events.push({ id: 'nt' + i, match_id: 'nm', club_id: L.C, seq: 500 + i, period: 1, team: 'opp', event_type: 'Tackle', outcome: 'Contact', player: pl || null, score: 0, time_text: '00:1' + i + ':00' }));
  // Their scores, each with a known origin: our kick pass lost (1 pt), our kickout lost (1), their own
  // kickout won (1), our ball lost in contact (a 2-pointer). Then 3 more of our balls lost in contact.
  let ns = 600; const nv = o => f.tables.events.push(Object.assign({ id: 'ns' + ns, match_id: 'nm', club_id: L.C, seq: ns++, period: 1, score: 0, time_text: '00:30:00' }, o));
  nv({ team: 'us', event_type: 'Possession lost', outcome: 'Kick Pass' }); nv({ team: 'opp', event_type: 'Shot from play', outcome: 'Point', score: 1 });
  nv({ team: 'us', event_type: 'Kickout', outcome: 'Lost clean' }); nv({ team: 'opp', event_type: 'Shot from play', outcome: 'Point', score: 1 });
  nv({ team: 'opp', event_type: 'Kickout', outcome: 'Won clean' }); nv({ team: 'opp', event_type: 'Shot from play', outcome: 'Point', score: 1 });
  nv({ team: 'us', event_type: 'Possession lost', outcome: 'In Contact' }); nv({ team: 'opp', event_type: 'Shot from play', outcome: '2-Pointer', score: 2 });
  [1, 2, 3].forEach(() => nv({ team: 'us', event_type: 'Possession lost', outcome: 'In Contact' }));
  const r = await L.open({ fixtures: f }), p = r.page; await L.wait(p, 1000);
  await L.clickTxt(p, '^vs\\s*Opposition'); await L.wait(p, 1500);
  await p.getByText('Kilmacud').first().click(); await L.wait(p, 1200);
  const tiles = () => p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-os-tile]')].map(x => [x.getAttribute('data-os-tile'), x.innerText.replace(/\s+/g, ' ')])));
  const tl = await tiles();
  t.ok('kickout strategy: long, quick, with the share kept', /Long – Quick/.test(tl.ko) && /63% long · 63% quick · 63% kept/.test(tl.ko), JSON.stringify(tl));
  t.ok('shooting: distance shooters with the 2-pointer', /Distance shooters/.test(tl.sh) && /43% from 40m\+ · 1 two-pointer/.test(tl.sh), tl.sh);
  t.ok('lost ball: kicked away', /Kicked away/.test(tl.lo) && /100% of 5/.test(tl.lo), tl.lo);
  t.ok('tackling by spot: some press', /Some press|High press/.test(tl.tk || ''), tl.tk);
  t.ok('no bars or long reads left', await p.evaluate(() => !/They keep|Mostly long/.test(document.querySelector('[data-opp-style]').innerText)));
  // The restart map, as on the dashboard: length buttons, dots or efficiency, and the legend.
  const koMap = await p.evaluate(() => { const m = document.querySelector('[data-os-map="ko"]'); return m && { svg: !!m.querySelector('svg'), text: m.innerText }; });
  t.ok('restart map with the dashboard switches', koMap && koMap.svg && /KICKOUT MAP · 8/.test(koMap.text) && /Short/.test(koMap.text) && /Efficiency/.test(koMap.text), JSON.stringify(koMap));
  await p.locator('[data-os-map="ko"] button', { hasText: /^Long$/ }).click(); await L.wait(p, 300);
  t.ok('Long button keeps the 5 long kickouts', /KICKOUT MAP · 5/.test(await p.evaluate(() => document.querySelector('[data-os-map="ko"]').innerText)));
  const shMap = await p.evaluate(() => { const m = document.querySelector('[data-os-map="sh"]'); return m && { svg: !!m.querySelector('svg'), text: m.innerText }; });
  t.ok('shot map with the dashboard switches', shMap && shMap.svg && /SHOT MAP · 7 SHOTS/.test(shMap.text) && /Efficiency/.test(shMap.text) && /2-pointer/.test(shMap.text), JSON.stringify(shMap));
  t.ok('shot map only once on the page', await p.evaluate(() => !/THEIR SHOTS/.test(document.body.innerText)));
  await p.locator('[data-opp-style]').screenshot({ path: require('path').join(__dirname, 'out', 'opp_style.png') });
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
  // Tackles by jersey number: forwards make 4 of the 6 numbered tackles, so they press high.
  const r2 = await L.open({ fixtures: f }), p2 = r2.page; await L.wait(p2, 1000);
  await L.clickTxt(p2, '^vs\\s*Opposition'); await L.wait(p2, 1500);
  await p2.getByText('Naomh Mearnog').first().click(); await L.wait(p2, 1200);
  const tl2 = await p2.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-os-tile]')].map(x => [x.getAttribute('data-os-tile'), x.innerText.replace(/\s+/g, ' ')])));
  t.ok('tackling by jersey number: forwards make most, a high press', /High press/.test(tl2.tk || '') && /67% by forwards/.test(tl2.tk || ''), JSON.stringify(tl2));
  t.ok('scores: most from turnovers, then their own kickout', /Turnovers/.test(tl2.sc) && /60% of 5 pts · then own kickout 20%/.test(tl2.sc), tl2.sc);
  t.ok('lost ball: in contact, against the usual', /In contact/.test(tl2.lo) && /80% of 5 · usually \d+%/.test(tl2.lo), tl2.lo);
  t.ok('kickout tile says not enough when few are tagged', /Not enough tagged yet/.test(tl2.ko), tl2.ko);
  await p2.locator('[data-opp-style]').screenshot({ path: require('path').join(__dirname, 'out', 'opp_style2.png') });
  t.eq('no page errors (numbers)', r2.errors, []);
  await r2.browser.close();
};
