// Live tagger on a weak signal: the first upload hangs and never answers. It must not hold up
// the tags after it, and once it times out it is sent again, so every tag (and its pitch spot)
// reaches the database for the Live Stats Pad and the dashboard.
const L = require('./lib.js');
module.exports = async function(t) {
  const id = 'mh';
  const f = L.fixtures({ matches: [{ id, club_id: L.C, opponent: 'Lucan', date: '2026-10-29', status: 'scheduled', competition: 'League', attack_up: true }] });
  f.hang = { events: 1 };
  const init = new Function('localStorage.setItem("rsa_active", JSON.stringify({ matchId: "' + id + '", clubId: null, ts: Date.now() })); localStorage.setItem("rsa_sess_' + id + '", JSON.stringify({ clockBase: 300, running: true, period: 1, halfEnded: false, anchor: Date.now(), savedAt: Date.now() }));');
  const r = await L.open({ fixtures: f, init }), p = r.page;
  async function kickout(oc, num, fy) {
    await L.clickTxt(p, '^KICKOUT$'); await L.wait(p, 300);
    await L.clickTxt(p, '^' + oc + '$'); await L.wait(p, 300);
    const b = await p.evaluate(() => { const s = [...document.querySelectorAll('#root svg')].map(x => x.getBoundingClientRect()).sort((a, z) => z.width * z.height - a.width * a.height)[0]; return [s.x, s.y, s.width, s.height]; });
    await p.mouse.click(b[0] + b[2] * 0.4, b[1] + b[3] * fy); await L.wait(p, 300);
    await L.wait(p, 600); await p.locator('#root button:visible').filter({ hasText: new RegExp('^' + num + '$') }).last().click(); await L.wait(p, 500);
  }
  await kickout('Won Clean', 4, 0.3);
  await kickout('Break Lost', 6, 0.4);
  const writes = () => p.evaluate(() => (window.__rsaWrites || []).filter(w => w[0] === 'events' && w[1] === 'upsert').map(w => ({ id: w[2].id, oc: w[2].outcome, x: w[2].x })));
  await L.wait(p, 3000);
  let w = await writes();
  t.eq('first upload is hanging, the second has not gone yet', w.map(x => x.oc), ['Won clean']);
  await L.wait(p, 24000);
  w = await writes();
  const ocs = w.map(x => x.oc);
  t.ok('after the time-out the first is sent again', ocs.filter(o => o === 'Won clean').length >= 2, ocs.join(' | '));
  t.ok('the second tag is uploaded too', ocs.includes('Break lost'), ocs.join(' | '));
  t.ok('both carry their pitch spot', w.every(x => x.x != null), JSON.stringify(w));
  t.eq('nothing left waiting on the phone', await p.evaluate(id => JSON.parse(localStorage.getItem('rsa_tag_' + id) || '[]').filter(x => x._pending).length, id), 0);
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
