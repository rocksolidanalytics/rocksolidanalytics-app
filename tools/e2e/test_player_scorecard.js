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
  await L.clickTxt(p, '^TARGETS$'); await L.wait(p, 300);
  await (await p.$('input[aria-label="Tackles per game target"]')).fill('0.4');
  await L.clickTxt(p, '^Save targets$'); await L.wait(p, 800);
  await L.clickTxt(p, '^SCORECARD$'); await L.wait(p, 300);
  const marks = await p.evaluate(() => [...document.querySelector('.rsa-sec table tbody').querySelectorAll('tr')].filter(tr => tr.children.length > 2).map(tr => tr.children[1].innerText.replace(/\s+/g, '')));
  t.ok('0.3 against a target of 0.4 is a near miss', marks.some(x => x === '0.3\u2248'), marks.join(' | '));
  t.ok('0 against 0.4 is still a miss', marks.some(x => x === '0\u2717'), marks.join(' | '));
  const nearRow = await p.evaluate(() => [...document.querySelector('.rsa-sec table tbody').querySelectorAll('tr')].findLastIndex(tr => tr.children.length > 2 && tr.children[1].innerText.indexOf('\u2248') >= 0));
  await p.evaluate(i => document.querySelector('.rsa-sec table tbody').querySelectorAll('tr')[i].click(), nearRow); await L.wait(p, 300);
  t.ok('the coaching point names the near miss', /Close on tackles per game \(0\.3 against 0\.4\)/.test(await L.text(p)));
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
