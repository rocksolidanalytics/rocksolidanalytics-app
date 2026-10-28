// Scorecard targets by line and by player: a line target applies only to that line on the
// Season view; the Last 3 games view counts games hitting each own match target.
const L = require('./lib.js');
const rowsOf = p => p.evaluate(() => [...document.querySelector('.rsa-sec table tbody').querySelectorAll('tr')].filter(tr => tr.children.length > 2).map(tr => ({ name: tr.children[0].innerText.split('\n')[0].split(' ·')[0].trim(), tk: tr.children[1].innerText.replace(/\s+/g, ' ').trim(), lab: tr.children[1].getAttribute('aria-label') })));
module.exports = async function(t) {
  const r = await L.open({ w: 390, h: 844 }), p = r.page;
  const press = async (label, dir, n) => { for (let i = 0; i < n; i++) { await p.click('button[aria-label="' + label + ' ' + dir + '"]'); await L.wait(p, 60); } };
  await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 1500);
  await L.clickTxt(p, '^Players$'); await L.wait(p, 1000);
  // Line target: backs (shirts 2 to 7) raised three steps above the squad target
  await L.clickTxt(p, '^TARGETS$'); await L.wait(p, 300);
  t.ok('targets screen has squad, line and player parts', /SQUAD[\s\S]*BY LINE[\s\S]*PLAYER MATCH TARGETS/.test(await L.text(p)));
  await L.clickTxt(p, '^Backs$'); await press('Tackles per game target for back', 'higher', 3);
  await L.clickTxt(p, '^Save targets$'); await L.wait(p, 800);
  await L.clickTxt(p, '^SCORECARD$'); await L.wait(p, 300);
  const backs = ['Ciaran Byrne', 'Darragh Kelly', 'Eoin Walsh', 'Padraig Doyle', 'Tomas Nolan', 'Cian Kavanagh'];
  let rows = await rowsOf(p);
  const bRows = rows.filter(x => backs.includes(x.name)), oRows = rows.filter(x => !backs.includes(x.name));
  t.eq('six backs on the card', bRows.length, 6);
  t.ok('backs measured against the line target and all miss it', bRows.every(x => /line ≥ 0\.5/.test(x.tk) && /off target$/.test(x.lab)), JSON.stringify(bRows));
  t.ok('other lines still use the squad target', oRows.every(x => !/line/.test(x.tk)), JSON.stringify(oRows.slice(0, 3)));
  t.ok('heading notes that lines have their own targets', /· lines/.test(await L.text(p)));
  // Last 3 games against own match targets
  await L.clickTxt(p, '^LAST 3 GAMES$'); await L.wait(p, 300);
  t.ok('Last 3 games view headed by own targets', /own target/.test(await L.text(p)));
  rows = await rowsOf(p);
  t.ok('tackles shown as games hit out of 3', rows.every(x => /^\d\/3 ≥ \d+$/.test(x.tk)), JSON.stringify(rows.slice(0, 3)));
  const pick = rows.find(x => /off target$/.test(x.lab));
  t.ok('someone misses their own tackle target', !!pick);
  // Give that player a match target of 0 tackles: every game now meets it
  await L.clickTxt(p, '^TARGETS$'); await L.wait(p, 300);
  await p.selectOption('select[aria-label="Player"]', pick.name); await L.wait(p, 200);
  await press('Tackles per game match target for ' + pick.name, 'lower', 1);
  await L.clickTxt(p, '^Save targets$'); await L.wait(p, 800);
  t.ok('player targets save', /✓ Targets saved/.test(await L.text(p)));
  await L.clickTxt(p, '^SCORECARD$'); await L.wait(p, 300);
  rows = await rowsOf(p);
  const after = rows.find(x => x.name === pick.name);
  t.eq(pick.name + ' now hits 3 of 3 against a target of 0', after && after.tk + ' | ' + after.lab, '3/3 ≥ 0 | 3/3, on target');
  await L.shot(p, 'sc_last3');
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
