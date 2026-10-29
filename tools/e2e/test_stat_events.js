// Tap a number: a head-to-head figure on a match lists its events, and Watch these and Show on
// pitch open Game film and the pitch map on just those events, with Show all to widen again.
const L = require('./lib.js');
module.exports = async function(t) {
  const f = L.fixtures({ matches: [{ id: 'fm', club_id: L.C, opponent: 'Mayo', date: '2026-10-25', status: 'final', competition: 'Championship', scouting: false,
    our_score: '0-04', opp_score: '0-03', our_total: 4, opp_total: 3, video_url: 'https://youtu.be/QyBK5QpmSfw', video_enabled: true, video_tagged: true, video_throwin: 5 }] });
  // 6 of ours and 6 of theirs; one of ours has no video time and no spot.
  f.tables.events = Array.from({ length: 12 }, (_, i) => ({ id: 'fe' + i, match_id: 'fm', club_id: L.C, seq: i + 1, period: 1, time_text: '00:' + String(2 + i).padStart(2, '0') + ':00',
    video_ts: i === 4 ? null : 125 + i * 60, team: i % 2 ? 'opp' : 'us', event_type: 'Shot from play', outcome: i % 3 ? 'Wide' : 'Point', score: i % 3 ? 0 : 1,
    player: i % 2 ? null : 'Sean Murphy', x: i === 4 ? null : 0.8, y: i === 4 ? null : 0.5 })).concat(f.tables.events);
  f.tables.events.find(e => e.id === 'fe4').time_text = null;
  const r = await L.open({ fixtures: f, w: 390, h: 844 }), p = r.page;
  await L.fakeYouTube(p);
  const tx = () => L.text(p);
  const openShots = async () => {
    await L.clickTxt(p, '^[WLD]\\s*Last match'); await L.wait(p, 2000);
    if (!/Tap a number/.test(await tx())) { await L.clickTxt(p, '^DETAIL$'); await L.wait(p, 800); }
    await p.click('button[aria-label="Shots from play: see the 6 events"]'); await L.wait(p, 600);
  };
  await openShots();
  await L.shot(p, 'stat_events_sheet');
  let s = await tx();
  t.ok('the sheet names the stat and the team', /Shots from play · Ballyvale Gaels/.test(s));
  t.ok('it lists the 6 events', /6 EVENTS/.test(s) && (s.match(/Shot from play · (Point|Wide)/g) || []).length === 6);
  t.ok('Watch these and Show on pitch offered', /Watch these/.test(s) && /Show on pitch/.test(s));
  await L.clickTxt(p, 'Watch these'); await L.wait(p, 2500);
  s = await tx();
  t.ok('Game film shows only the picked events', /5 of 6 with video/.test(s));
  const evRows = () => p.evaluate(() => [...document.querySelectorAll('#root button')].filter(b => /Sean Murphy/.test(b.innerText) && /\d\d:\d\d/.test(b.innerText)).length);
  t.eq('five clips listed, all ours', await evRows(), 5);
  await L.clickTxt(p, '^Show all$'); await L.wait(p, 600);
  t.ok('Show all brings back the full list', !/with video/.test(await tx()) && /Shot from play/.test(await tx()));
  await p.evaluate(() => document.querySelector('#root button[title=Back]').click()); await L.wait(p, 2000);
  t.ok('back returns to the match', /All matches/.test(await tx()));
  await p.evaluate(() => [...document.querySelectorAll('#root button')].find(b => /‹ All matches/.test(b.innerText)).click()); await L.wait(p, 500);
  await p.evaluate(() => document.querySelector('#root button').click()); await L.wait(p, 1200);
  await openShots();
  await L.clickTxt(p, 'Show on pitch'); await L.wait(p, 2000);
  s = await tx();
  t.ok('pitch map shows only the picked events', /5 of 6 on the pitch/.test(s));
  t.ok('its filters stay out of the way', !/^MATCH$/m.test(s));
  await L.shot(p, 'stat_events_pitch');
  await L.clickTxt(p, '^Show all$'); await L.wait(p, 600);
  t.ok('Show all brings the filters back', /^MATCH$/m.test(await tx()));
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
