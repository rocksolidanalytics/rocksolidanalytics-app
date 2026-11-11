// Appearance on Home: Dark (the default), Light, or follow the phone. Kept on the device; a
// change reloads with the new colours.
const L = require('./lib.js');
const bg = p => p.evaluate(() => ({ theme: document.documentElement.getAttribute('data-theme'), body: getComputedStyle(document.body).backgroundColor, meta: document.querySelector('meta[name=theme-color]').getAttribute('content') }));
module.exports = async function(t) {
  const r = await L.open({ fixtures: L.fixtures() }), p = r.page;
  let b = await bg(p);
  t.ok('dark by default', b.theme !== 'light' && b.body === 'rgb(10, 10, 13)', JSON.stringify(b));
  t.ok('Appearance offered on Home', /APPEARANCE/.test(await L.text(p)) && /PHONE/.test(await L.buttons(p, 'PHONE')));
  await Promise.all([p.waitForNavigation().catch(() => {}), L.clickTxt(p, '^LIGHT$')]); await L.wait(p, 1500);
  b = await bg(p);
  t.ok('Light reloads in light colours', b.theme === 'light' && b.body === 'rgb(243, 244, 246)' && b.meta === '#F3F4F6', JSON.stringify(b));
  const tile = await p.evaluate(() => { const x = [...document.querySelectorAll('#root button')].find(e => /Game film/.test(e.innerText)); return getComputedStyle(x).backgroundColor; });
  t.eq('cards turn white', tile, 'rgb(255, 255, 255)');
  t.eq('the choice is kept on the device', await p.evaluate(() => localStorage.getItem('rsa_theme')), 'light');
  await L.clickTxt(p, 'Last match'); await L.wait(p, 1800);
  t.ok('the match overview draws in light', await p.evaluate(() => !!document.querySelector('[data-fm="head"]') && getComputedStyle(document.querySelector('[data-fm="head"]')).backgroundColor === 'rgb(255, 255, 255)'));
  // Phone: follows the phone setting.
  await p.evaluate(() => localStorage.setItem('rsa_theme', 'auto'));
  await p.emulateMedia({ colorScheme: 'dark' }); await p.reload(); await L.wait(p, 1500);
  t.ok('Phone: dark when the phone is dark', (await bg(p)).theme !== 'light');
  await p.emulateMedia({ colorScheme: 'light' }); await p.reload(); await L.wait(p, 1500);
  t.eq('Phone: light when the phone is light', (await bg(p)).theme, 'light');
  await p.evaluate(() => localStorage.setItem('rsa_theme', 'dark'));
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
