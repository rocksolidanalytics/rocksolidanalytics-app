// Stats tabs are Season, Matches and Compare (Benchmark, Conditions and vs Others inside it), and
// the slim filter bar keeps the half and Key / Detail choice, with the Compare view, between visits.
const L = require('./lib.js');
module.exports = async function(t) {
  const r = await L.open({ w: 390, h: 844 }), p = r.page;
  const tabs = () => L.buttons(p, '^(Season|Matches|Compare|Benchmark|Conditions|vs Others)$');
  const pressed = () => p.evaluate(() => [...document.querySelectorAll('#root button[aria-pressed=true]')].map(b => b.innerText.trim()).join(' | '));
  const openStats = async () => { await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 1500); };
  await openStats();
  t.eq('three top tabs', await tabs(), 'Season | Matches | Compare');
  await L.clickTxt(p, '^Compare$'); await L.wait(p, 600);
  t.ok('Compare opens on Benchmark', /^BENCHMARK/.test(await pressed()), await pressed());
  await L.clickTxt(p, '^CONDITIONS$'); await L.wait(p, 600);
  t.ok('Conditions picked inside Compare', /CONDITIONS/.test(await pressed()));
  await L.clickTxt(p, '^Season$'); await L.wait(p, 600);
  await L.clickTxt(p, '^2ND$'); await L.wait(p, 400);
  t.ok('season half set to 2nd', /2ND/.test(await pressed()));
  await L.clickTxt(p, '^Matches$'); await L.wait(p, 600);
  await p.getByText('Rathnew').first().click(); await L.wait(p, 1200);
  let pr = await pressed();
  t.ok('the match keeps the 2nd half', /2ND/.test(pr), pr);
  t.ok('half and Key / Detail share one row', await p.evaluate(() => { const b = document.querySelector('.rsa-fbar'); return !!b && /2ND/.test(b.innerText) && /DETAIL/.test(b.innerText); }));
  await L.clickTxt(p, '^DETAIL$'); await L.wait(p, 600);
  // Leave the stats and come back: the choices are still there.
  await p.evaluate(() => document.querySelector('#root button').click()); await L.wait(p, 1200);
  await openStats();
  await L.clickTxt(p, '^Compare$'); await L.wait(p, 600);
  t.ok('Compare remembers Conditions', /CONDITIONS/.test(await pressed()));
  await L.clickTxt(p, '^Matches$'); await L.wait(p, 600);
  await p.getByText('Rathnew').first().click(); await L.wait(p, 1200);
  pr = await pressed();
  t.ok('match remembers 2nd half and Detail', /2ND/.test(pr) && /DETAIL/.test(pr), pr);
  await L.shot(p, 'stats_filters');
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
