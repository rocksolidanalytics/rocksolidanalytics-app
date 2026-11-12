// The live tagger start button is a drawn triangle (an iPad shows the play character as a colour
// emoji), the in-game stats keep shot efficiency by distance with the shooting figures (before the
// restart maps), and the Match pulse is drawn in the momentum card style.
const L = require('./lib.js');
module.exports = async function(t) {
  let r = await L.open({ fixtures: L.fixtures(), w: 1180, h: 820, touch: true }), p = r.page;
  await L.clickTxt(p, 'Resume Tagging'); await L.wait(p, 1200); await L.clickTxt(p, 'Top of screen').catch(() => {}); await L.wait(p, 1200);
  t.ok('iPad live tagger: start is a drawn triangle, not the play character', await p.evaluate(() => !!document.querySelector('[data-start-icon]') && !/▶/.test(document.querySelector('.rsa-tl-clk').textContent)));
  await L.clickTxt(p, '^VIEW STATS$'); await L.wait(p, 1200); await L.clickTxt(p, '^DETAILED$'); await L.wait(p, 1000);
  const at = await p.evaluate(() => { const s = document.body.innerText; return ['SHOT MAP', 'SHOT EFFICIENCY BY DISTANCE', 'RESTART MAP', 'RESTART WIN % BY ZONE'].map(k => s.indexOf(k)); });
  t.ok('in-game stats: distance figures sit with the shots, before the restart maps', at.every(x => x >= 0) && at[0] < at[1] && at[1] < at[2] && at[2] < at[3], JSON.stringify(at));
  t.eq('live tagger: no page errors', r.errors, []);
  await r.browser.close();
  r = await L.open({ fixtures: L.fixtures(), init: () => { try { localStorage.setItem('rsa_sp_flow', 'pulse'); } catch (e) {} } }); p = r.page;
  await L.clickTxt(p, 'Last match'); await L.wait(p, 1800);
  const pl = await p.evaluate(() => { const c = document.querySelector('[data-pulse]'); return c && { text: c.innerText, wp: !!c.querySelector('[data-pulse-wp]'), scores: c.querySelectorAll('[data-pulse-score]').length }; });
  t.ok('match pulse: titled card with 0\' / HT / FT, win chance line and scores', pl && /Match pulse/.test(pl.text) && /HT/.test(pl.text) && /FT/.test(pl.text) && pl.wp && pl.scores > 3, JSON.stringify(pl));
  const b = await p.locator('[data-pulse] svg').boundingBox();
  await p.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.5); await L.wait(p, 200);
  t.ok('match pulse: touch reads the minute and the chance of winning', /\d+' · chance of winning \d+%/.test(await p.evaluate(() => document.querySelector('[data-pulse]').innerText)));
  t.eq('match pulse: no page errors', r.errors, []);
  await r.browser.close();
};
