// Opposition page, Their style: kickouts by length and speed (with a restart map), where their
// tackles happen (a press), and how far out they shoot, each with a one-line read. One match
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
  const tx = await p.evaluate(() => document.querySelector('[data-opp-style]').innerText);
  t.ok('kickouts: mostly long, usually quick, with the share kept', /Mostly long \(63%\), usually quick\. They keep 63% of them\./.test(tx), tx.slice(0, 300));
  t.ok('kickouts: short / medium / long split with kept %', /25% short · 100% kept/.test(tx) && /13% medium · 0% kept/.test(tx) && /63% long · 60% kept/.test(tx), tx);
  t.ok('kickouts: quick / slow split', /63% quick/.test(tx) && /38% slow/.test(tx), tx);
  t.ok('lost ball: mostly kicked away against them', /kicked away \(100%\)|In line with your usual|Few turnovers in contact/.test(tx), tx);
  t.ok('shooting: from distance, with the 2-pointers', /They shoot from distance: 43% of shots from 40m or more\. 1 two-pointer from 3 tries from play\./.test(tx), tx);
  await L.clickTxt(p, 'RESTART MAP'); await L.wait(p, 400);
  t.ok('restart map opens with their kickouts', await p.evaluate(() => !!document.querySelector('[data-opp-style] svg')));
  await p.locator('[data-opp-style]').screenshot({ path: require('path').join(__dirname, 'out', 'opp_style.png') });
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
  // Tackles by jersey number: forwards make 4 of the 6 numbered tackles, so they press high.
  const r2 = await L.open({ fixtures: f }), p2 = r2.page; await L.wait(p2, 1000);
  await L.clickTxt(p2, '^vs\\s*Opposition'); await L.wait(p2, 1500);
  await p2.getByText('Naomh Mearnog').first().click(); await L.wait(p2, 1200);
  const tx2 = await p2.evaluate(() => document.querySelector('[data-opp-style]').innerText);
  t.ok('forwards tackling, when numbers are tagged, as an extra line', /They press high: forwards make 67% of their tackles\. About 7 tackles a game\./.test(tx2), tx2);
  t.ok('scores: most from turnovers, then their kickout', /Most from turnovers and frees \(60% of 5 points\), then their kickout \(20%\)\./.test(tx2), tx2);
  t.ok('scores: points off our turnovers by how we lost the ball', /Points off your turnovers: 1 from kick passes · 2 from in contact/.test(tx2), tx2);
  t.ok('lost ball: 80% in contact, compared with our usual', /80% of the ball you lost (against them )?was in contact/.test(tx2), tx2);
  await p2.locator('[data-opp-style]').screenshot({ path: require('path').join(__dirname, 'out', 'opp_style2.png') });
  t.eq('no page errors (numbers)', r2.errors, []);
  await r2.browser.close();
};
