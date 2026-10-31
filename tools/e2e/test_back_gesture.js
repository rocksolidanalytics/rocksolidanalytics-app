// The phone back gesture (browser back) moves back inside the app, the same as its Back buttons,
// instead of leaving the app; on the home screen it is left alone.
const L = require('./lib.js');
module.exports = async function(t) {
  const r = await L.open({ fixtures: L.fixtures() }), p = r.page;
  const back = async () => { await p.goBack({ timeout: 3000 }).catch(() => {}); await L.wait(p, 900); };
  const onHome = async () => /Season stats, scorers/.test(await L.text(p)) && !/All matches/.test(await L.text(p));
  t.ok('home: no extra history step', (await p.evaluate(() => history.state && history.state.rsaBack)) !== 1);
  await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 2000);
  t.ok('dashboard: a history step is kept', (await p.evaluate(() => history.state && history.state.rsaBack)) === 1);
  await back();
  t.ok('dashboard: back returns home, still in the app', await onHome() && /app\.local/.test(p.url()));
  await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 1800);
  await L.clickTxt(p, '^Matches$'); await L.wait(p, 600);
  await p.getByText('Rathnew').first().click(); await L.wait(p, 1800);
  t.ok('match: opened', /All matches/.test(await L.text(p)));
  await back();
  t.ok('match: back goes to the match list', /TAP A MATCH FOR ITS FULL REPORT/i.test(await L.text(p)) && !/All matches/.test(await L.text(p)), (await L.text(p)).slice(0, 200));
  await back();
  t.ok('match list: back again returns home', await onHome());
  await p.getByText('Game film', { exact: true }).first().click(); await L.wait(p, 1800);
  await back();
  t.ok('game film: back returns home', await onHome());
  await p.getByText('Edit match information', { exact: true }).first().click(); await L.wait(p, 1800);
  t.ok('line-ups: opened', /LINE-UPS/.test(await L.text(p)));
  await back();
  t.ok('line-ups: back returns home', await onHome());
  await L.wait(p, 1800);
  t.ok('home again: the history step is dropped', (await p.evaluate(() => history.state && history.state.rsaBack)) !== 1);
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
