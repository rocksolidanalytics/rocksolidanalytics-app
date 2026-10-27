// Season Players tab: the scorecard lists players with 3+ games, keepers on their own card,
// ticks against the squad average, a coaching point on tap, and coach targets that save.
const L = require('./lib.js');
module.exports = async function(t) {
  const r = await L.open({ w: 390, h: 844 }), p = r.page;
  await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 1500);
  await L.clickTxt(p, '^Players$'); await L.wait(p, 1000);
  let tx = await L.text(p);
  t.ok('scorecard shown on the season Players tab', /PLAYER SCORECARD/.test(tx));
  t.ok('keepers on their own card', /GOALKEEPERS/.test(tx));
  const rows = await p.evaluate(() => [...document.querySelectorAll('.rsa-sec table')].map(tb => tb.querySelectorAll('tbody tr').length));
  t.eq('14 outfield players and 1 keeper with 3 games', rows.slice(0, 2), [14, 1]);
  t.ok('ticks and crosses against the squad average', /✓/.test(tx) && /✗/.test(tx));
  await p.evaluate(() => document.querySelector('.rsa-sec table tbody tr').click()); await L.wait(p, 300);
  t.ok('tapping a player shows a coaching point and the profile button', /(On target across the board|Effort is good|Clean technique|Work on effort)/.test(await L.text(p)) && /Open player profile/.test(await L.text(p)));
  await L.clickTxt(p, '^TARGETS$'); await L.wait(p, 300);
  await (await p.$('input[aria-label="Tackles per game target"]')).fill('4');
  await L.clickTxt(p, '^Save targets$'); await L.wait(p, 800);
  t.ok('targets save', /✓ Targets saved/.test(await L.text(p)));
  await L.clickTxt(p, '^SCORECARD$'); await L.wait(p, 300);
  tx = await L.text(p);
  t.ok('the new target shows in the column header', /Tkl\/g\n≥ 4/.test(tx));
  t.eq('every player now misses the tackle target', await p.evaluate(() => [...document.querySelector('.rsa-sec table tbody').querySelectorAll('tr')].filter(tr => tr.children.length > 2).map(tr => tr.children[1].innerText.indexOf('✗') >= 0).every(Boolean)), true);
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
