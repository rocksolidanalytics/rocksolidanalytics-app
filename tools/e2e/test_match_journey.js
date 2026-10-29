// One match, no jumping around: the home Last match tile opens its stats; Watch this match and
// Pitch map open on that match and come back to it. The match view also gets its format and
// penalties now (the won on penalties note).
const L = require('./lib.js');
module.exports = async function(t) {
  const f = L.fixtures({ matches: [{ id: 'fm', club_id: L.C, opponent: 'Mayo', date: '2026-10-25', status: 'final', competition: 'Championship', scouting: false,
    our_score: '1-10', opp_score: '1-10', our_total: 13, opp_total: 13, half_mins: 35, extra_time: true, penalties: { winner: 'us', us: 4, opp: 3, kicks: [] },
    video_url: 'https://youtu.be/QyBK5QpmSfw', video_enabled: true, video_tagged: true, video_throwin: 5 }] });
  f.tables.events = Array.from({ length: 20 }, (_, i) => ({ id: 'fe' + i, match_id: 'fm', club_id: L.C, seq: i + 1, period: 1, time_text: '00:' + String(2 + i).padStart(2, '0') + ':00', video_ts: 125 + i * 60, team: i % 2 ? 'opp' : 'us', event_type: 'Shot from play', outcome: i % 3 ? 'Wide' : 'Point', score: i % 3 ? 0 : 1, player: i % 2 ? null : 'Sean Murphy', x: 0.8, y: 0.5 })).concat(f.tables.events);
  const r = await L.open({ fixtures: f, w: 390, h: 844 }), p = r.page;
  await L.fakeYouTube(p);
  const tx = () => L.text(p);
  t.ok('home shows the last finished match', /Last match · v Mayo/.test(await tx()));
  await L.clickTxt(p, '^D\\s*Last match'); await L.wait(p, 2000);
  let s = await tx();
  t.ok('the tile opens that match, not the season', /All matches/.test(s) && /Mayo/i.test(s));
  t.ok('match view offers its clips and pitch map', /Watch this match/.test(s) && /Pitch map/.test(s));
  t.ok('match view shows the shootout result', /won 4-3 on penalties/.test(s));
  await L.clickTxt(p, 'Watch this match'); await L.wait(p, 2500);
  t.ok('Watch this match opens Game film on that match', /STARTS 8s BEFORE/.test(await tx()));
  await p.evaluate(() => [...document.querySelectorAll('#root button')].find(b => /←|Back/.test(b.innerText.trim()) || b.getAttribute('title') === 'Back' || b.innerText.trim() === '').click()); await L.wait(p, 2000);
  s = await tx();
  t.ok('back from Game film returns to the match', /All matches/.test(s) && /Watch this match/.test(s));
  await L.clickTxt(p, 'Pitch map$'); await L.wait(p, 1500);
  t.eq('Pitch map opens filtered to that match', await p.evaluate(() => [...document.querySelectorAll('#root select')].map(x => x.value).includes('fm')), true);
  await p.evaluate(() => document.querySelector('#root button').click()); await L.wait(p, 2000);
  t.ok('back from Pitch map returns to the match', /All matches/.test(await tx()));
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
