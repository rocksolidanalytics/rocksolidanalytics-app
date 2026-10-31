// New match asks for the match length with two sliders: periods (2 or 3) and minutes per period
// (10 to 45), starting at 2 x 30; the choice is saved on the match and remembered next time.
const L = require('./lib.js');
module.exports = async function(t) {
  const r = await L.open(), p = r.page;
  await L.clickTxt(p, 'New [Mm]atch'); await L.wait(p, 1000);
  t.ok('MATCH LENGTH shown, 2 x 30 to start', /MATCH LENGTH\s*2 × 30 MIN/.test(await L.text(p)), (await L.text(p)).slice(0, 400));
  t.eq('periods slider 2 to 3', await p.evaluate(() => { const s = document.querySelector('input[aria-label="Periods"]'); return s && [s.min, s.max, s.value].join(','); }), '2,3,2');
  t.eq('minutes slider 10 to 45', await p.evaluate(() => { const s = document.querySelector('input[aria-label="Minutes each"]'); return s && [s.min, s.max, s.value].join(','); }), '10,45,30');
  await p.locator('input[aria-label="Periods"]').fill('3'); await p.locator('input[aria-label="Minutes each"]').fill('20'); await L.wait(p, 200);
  t.ok('summary follows the sliders', /3 × 20 MIN/.test(await L.text(p)));
  await p.fill('input[placeholder="e.g. Rathnew"]', 'Rathcoole'); await L.wait(p, 200);
  await p.evaluate(() => { const b = [...document.querySelectorAll('#root button')].filter(b => !b.disabled && /create|start|next|tag/i.test(b.innerText)).pop(); b.click(); }); await L.wait(p, 1200);
  const ins = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'matches' && x[1] === 'insert').map(x => [x[2].half_mins, x[2].periods]));
  t.eq('saved on the match as 3 periods of 20', ins[0], [20, 3]);
  t.eq('remembered for next time', await p.evaluate(() => Object.keys(localStorage).filter(k => k.indexOf('rsa_mlen_') === 0).map(k => localStorage.getItem(k))[0]), '3x20');
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
