// Live tagger on an iPad: upright it asks to be turned sideways; sideways it gets the bigger
// layout and the pitch step fills the screen with the landscape pitch. Phones are unchanged.
const L = require('./lib.js');
module.exports = async function(t) {
  const id = 'mi';
  const f = L.fixtures({ matches: [{ id, club_id: L.C, opponent: 'Lucan', date: '2026-10-27', status: 'scheduled', competition: 'League', attack_up: true }] });
  const init = new Function('localStorage.setItem("rsa_active", JSON.stringify({ matchId: "' + id + '", clubId: null, ts: Date.now() })); localStorage.setItem("rsa_sess_' + id + '", JSON.stringify({ clockBase: 300, running: false, period: 1, halfEnded: false, anchor: Date.now(), savedAt: Date.now() }));');
  const turn = p => p.evaluate(() => /Turn your iPad sideways/.test(document.body.innerText));
  const tl = p => p.evaluate(() => !!document.querySelector('#root .rsa-tl'));

  let r = await L.open({ fixtures: f, init, w: 820, h: 1180, touch: true }), p = r.page;
  await L.wait(p, 800);
  t.ok('iPad upright: asks to turn sideways', await turn(p));
  await L.shot(p, 'ipad_tagger_upright');
  await p.setViewportSize({ width: 1180, height: 820 }); await L.wait(p, 600);
  t.ok('turned: the prompt goes', !(await turn(p)));
  t.ok('turned: the iPad layout is on', await tl(p));
  const evH = await p.evaluate(() => { const b = document.querySelector('#root .rsa-tl-ev'); return b ? Math.round(b.getBoundingClientRect().height) : 0; });
  t.ok('turned: event buttons are tall', evH >= 50, String(evH));
  await L.shot(p, 'ipad_tagger_land');
  await L.clickTxt(p, '^SHOT$'); await L.wait(p, 300);
  await L.shot(p, 'ipad_tagger_outcome');
  await L.clickTxt(p, '^Point$'); await L.wait(p, 400);
  const pr = await p.evaluate(() => { const el = document.querySelector('#root .rsa-tl-pitch'); if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  t.eq('pitch step fills the screen', pr, [1180, 820]);
  t.ok('pitch step has Cancel and both team ends', /Cancel/.test(await L.buttons(p, 'Cancel')) && /◀ BALLYVALE/.test(await L.text(p)) && /LUCAN ▶/.test(await L.text(p)));
  await L.shot(p, 'ipad_tagger_pitch');
  const svg = await p.evaluate(() => { const s = [...document.querySelectorAll('#root .rsa-tl-pitch svg')].sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0]; const r = s.getBoundingClientRect(); return { x: r.left + r.width * 0.8, y: r.top + r.height * 0.5, w: r.width }; });
  t.ok('pitch is wide', svg.w > 900, String(svg.w));
  await p.mouse.click(svg.x, svg.y); await L.wait(p, 900);
  t.ok('after the spot, the player step', /PLAYER #/.test(await L.text(p)), (await L.text(p)).slice(0, 300));
  await L.shot(p, 'ipad_tagger_player');
  await L.clickTxt(p, '^NONE$'); await L.wait(p, 600);
  const tags = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'events').map(x => [].concat(x[2])).flat().filter(e => e && e.event_type));
  t.ok('the tag is saved with its spot', tags.length >= 1 && tags[0].outcome === 'Point' && tags[0].x > 0.6, JSON.stringify(tags).slice(0, 300));
  t.eq('iPad: no page errors', r.errors, []);
  await r.browser.close();

  r = await L.open({ fixtures: f, init, w: 390, h: 844, touch: true }); p = r.page;
  await L.wait(p, 800);
  t.ok('phone: no prompt and no iPad layout', !(await turn(p)) && !(await tl(p)));
  t.eq('phone: no page errors', r.errors, []);
  await r.browser.close();
};
