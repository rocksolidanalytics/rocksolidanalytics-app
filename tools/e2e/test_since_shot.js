// Live tagger header: the time since a team last scored can be switched to time since their last
// shot by tapping it; both teams switch together and the choice is kept after a reload.
const L = require('./lib.js');
module.exports = async function(t) {
  const id = 'ms';
  const f = L.fixtures({ matches: [{ id, club_id: L.C, opponent: 'Lucan', date: '2026-10-27', status: 'scheduled', competition: 'League', attack_up: true }] });
  // Ours: a point at 5:00 and a wide at 15:00. Theirs: a wide at 8:00, no score.
  f.tables.events = [
    { id: 's1', match_id: id, club_id: L.C, seq: 1, period: 1, time_text: '00:05:00', team: 'us', event_type: 'Shot from play', outcome: 'Point', score: 1, player: 'Sean Murphy' },
    { id: 's2', match_id: id, club_id: L.C, seq: 2, period: 1, time_text: '00:08:00', team: 'opp', event_type: 'Shot from play', outcome: 'Wide', score: 0 },
    { id: 's3', match_id: id, club_id: L.C, seq: 3, period: 1, time_text: '00:15:00', team: 'us', event_type: 'Shot from play', outcome: 'Wide', score: 0, player: 'Sean Murphy' }].concat(f.tables.events);
  const init = new Function('localStorage.setItem("rsa_active", JSON.stringify({ matchId: "' + id + '", clubId: null, ts: Date.now() })); localStorage.setItem("rsa_sess_' + id + '", JSON.stringify({ clockBase: 1200, running: false, period: 1, halfEnded: false, anchor: Date.now(), savedAt: Date.now() }));');
  const r = await L.open({ fixtures: f, init }), p = r.page;
  const lines = () => p.evaluate(() => [...document.querySelectorAll('#root button[aria-label^="Time since last"]')].map(b => b.innerText.trim()));
  const before = await lines();
  t.eq('two lines, both since score', before.map(x => x.replace(/^[\d:]+ /, '')), ['SINCE SCORE', 'NO SCORE']);
  t.ok('ours counts from the point at 5:00', /^15:00 /.test(before[0]), before.join(' | '));
  await p.click('#root button[aria-label^="Time since last score"]'); await L.wait(p, 300);
  const after = await lines();
  t.eq('both switch to since shot', after, ['5:00 SINCE SHOT', '12:00 SINCE SHOT']);
  await p.reload(); await L.wait(p, 2000);
  t.eq('the choice is kept after a reload', (await lines()).map(x => x.replace(/^[\d:]+ /, '')), ['SINCE SHOT', 'SINCE SHOT']);
  await p.click('#root button[aria-label^="Time since last shot"]'); await L.wait(p, 300);
  t.eq('tapping again goes back to since score', (await lines()).map(x => x.replace(/^[\d:]+ /, '')), ['SINCE SCORE', 'NO SCORE']);
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
