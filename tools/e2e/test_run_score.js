// Video tagger and Game film: each shot (from play or a free) shows the match score just after
// it, own team first, counted in match order even when a moment was tagged later.
const L = require('./lib.js');
const EV = [ // [seq, period, clock, team, type, outcome, score]
  [1, 1, '00:05:00', 'us', 'Shot from play', 'Point', 1],
  [2, 1, '00:08:00', 'opp', 'Shot from play', 'Wide', 0],
  [3, 1, '00:12:00', 'us', 'Shot from play', 'Goal', 3],
  [4, 1, '00:15:00', 'opp', 'Scoreable free', 'Point', 1],
  [5, 2, '00:33:00', 'us', 'Shot from play', 'Wide', 0],
  [6, 1, '00:10:00', 'opp', 'Shot from play', 'Point', 1],
  [7, 1, '00:11:00', 'us', 'Kickout', 'Won clean', 0]];
const WANT = { '05:00': '0-01 – 0-00', '08:00': '0-01 – 0-00', '10:00': '0-01 – 0-01', '12:00': '1-01 – 0-01', '15:00': '1-01 – 0-02', '33:00': '1-01 – 0-02' };
const fx = () => {
  const f = L.fixtures({ matches: [{ id: 'rs', club_id: L.C, opponent: 'An Tochar', date: '2026-10-20', status: 'final', video_tagged: true, video_enabled: true, video_url: 'https://youtu.be/QyBK5QpmSfw', video_throwin: 5, video_halfstart: 2400 }] });
  f.tables.events = EV.map(([seq, period, time_text, team, event_type, outcome, score]) => ({ id: 'r' + seq, match_id: 'rs', club_id: L.C, seq, period, time_text, team, event_type, outcome, score, x: 0.8, y: 0.5 })).concat(f.tables.events.filter(e => e.match_id !== 'rs'));
  return f;
};
const read = p => p.evaluate(() => [...document.querySelectorAll('#root [data-runscore]')].map(n => { let c = n.parentElement; while (c && !/\d\d:\d\d/.test(c.innerText.split(n.innerText).join(''))) c = c.parentElement; const tx = c.innerText.split(n.innerText).join(''), full = tx.match(/\d\d:(\d\d:\d\d)/); return [full ? full[1] : tx.match(/\d\d:\d\d/)[0], n.getAttribute('data-runscore')]; }));
module.exports = async function(t) {
  // Game film
  let r = await L.open({ fixtures: fx(), w: 1180, h: 820 }), p = r.page;
  await L.fakeYouTube(p);
  await p.getByText('Game film', { exact: true }).first().click(); await L.wait(p, 1200);
  await L.clickTxt(p, 'Watch'); await L.wait(p, 1800);
  await p.evaluate(() => [...document.querySelectorAll('#root button')].filter(b => b.firstChild && /^\W*(Shot from play|Scoreable free|Kickout)$/.test(b.firstChild.textContent.trim())).forEach(b => b.click()));
  await L.wait(p, 400);
  let got = await read(p);
  t.eq('game film: a score beside each of the 6 shots, none on the kickout', got.length, 6);
  t.ok('game film: the score after each shot, in match order', got.length === 6 && got.every(([k, v]) => WANT[k] === v), JSON.stringify(got));
  await L.shot(p, 'run_score_gamefilm');
  t.eq('game film: no page errors', r.errors, []);
  await r.browser.close();
  // Video tagger
  r = await L.open({ fixtures: fx() }); p = r.page;
  await L.videoTagger(p, 'An Tochar'); await L.wait(p, 800);
  got = await read(p);
  t.ok('video tagger: the same scores on its tag list', got.length === 6 && got.every(([k, v]) => WANT[k] === v), JSON.stringify(got));
  await L.shot(p, 'run_score_tagger');
  t.eq('video tagger: no page errors', r.errors, []);
  await r.browser.close();
};
