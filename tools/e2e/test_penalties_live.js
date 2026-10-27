// Penalty shootout from the live tagger: kicks, tally, kept on the phone until saved, then the match ends.
const L = require('./lib.js');
module.exports = async function(t) {
  const init = () => { const n = Date.now(); localStorage.setItem('rsa_active', JSON.stringify({ matchId: 'mp', clubId: null, ts: n })); localStorage.setItem('rsa_sess_mp', JSON.stringify({ clockBase: 640, anchor: null, running: false, period: 4, halfEnded: false, savedAt: n })); };
  const r = await L.open({ fixtures: L.fixtures({ matches: [{ id: 'mp', club_id: L.C, opponent: 'Mayo', date: '2026-10-27', status: 'scheduled', competition: 'Championship', half_mins: 35, extra_time: true, attack_up: true }] }), init });
  const p = r.page;
  await L.clickTxt(p, '^PENALTIES$'); await L.wait(p, 400);
  t.ok('shootout screen opens', /PENALTY SHOOTOUT/.test(await L.text(p)));
  const kick = async (side, scored) => { await p.evaluate(([side, scored]) => { const bs = [...document.querySelectorAll('#root button')].filter(b => b.innerText.indexOf(scored ? 'Scored' : 'Missed') >= 0); bs[side === 'us' ? 0 : 1].click(); }, [side, scored]); await L.wait(p, 120); };
  const inp = await p.$$('input[inputmode=numeric]'); await inp[0].fill('7');
  for (const [s, k] of [['us', 1], ['opp', 1], ['us', 0], ['opp', 1], ['us', 1], ['opp', 0], ['us', 1], ['opp', 0], ['us', 1], ['opp', 1]]) await kick(s, k);
  t.ok('tally 4-3', /4 – 3/.test(await L.text(p)));
  t.ok('first kick keeps the shirt number', /#7/.test(await L.text(p)));
  t.eq('kicks kept on the phone', await p.evaluate(() => JSON.parse(localStorage.getItem('rsa_pens_mp')).length), 10);
  await L.clickTxt(p, '^Finish shootout$'); await L.wait(p, 1500);
  t.ok('winner confirmed', /win 4-3 on penalties/.test(r.dialogs.join(' ')), r.dialogs.join(' / '));
  t.ok('then the match ends', /End match and save the final score/.test(r.dialogs.join(' ')), r.dialogs.join(' / '));
  t.eq('kicks cleared from the phone once saved', await p.evaluate(() => localStorage.getItem('rsa_pens_mp')), null);
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
