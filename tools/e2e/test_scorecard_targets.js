// Scorecard targets by line and by player. Each line gets its own automatic target from its
// players; a line target set by the coach applies only to that line; the Last 3 games view
// counts games hitting each own whole-number match target.
const L = require('./lib.js');
const rowsOf = p => p.evaluate(() => [...document.querySelector('.rsa-sec table tbody').querySelectorAll('tr')].filter(tr => tr.children.length > 2).map(tr => ({ name: tr.children[0].innerText.split('\n')[0].split(' ·')[0].trim(), tk: tr.children[1].innerText.replace(/\s+/g, ' ').trim(), lab: tr.children[1].getAttribute('aria-label') })));
module.exports = async function(t) {
  const r = await L.open({ w: 390, h: 844 }), p = r.page;
  const press = async (label, dir, n) => { for (let i = 0; i < n; i++) { await p.click('button[aria-label="' + label + ' ' + dir + '"]'); await L.wait(p, 60); } };
  await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 1500);
  await L.clickTxt(p, '^Players$'); await L.wait(p, 1000);
  t.ok('season targets are by line when nothing is set', /Tkl\/g\nby line/.test(await L.text(p)));
  let rows = await rowsOf(p);
  t.ok('each tackle cell shows its line target as a whole number', rows.every(x => /^[\d.]+ ≥ \d+$/.test(x.tk)), JSON.stringify(rows.slice(0, 3)));
  // Line target set by the coach: backs (shirts 2 to 7) three tackles above their line average
  await L.clickTxt(p, '^TARGETS$'); await L.wait(p, 300);
  t.ok('targets screen has squad, line and player parts', /SQUAD[\s\S]*BY LINE[\s\S]*PLAYER MATCH TARGETS/.test(await L.text(p)));
  await L.clickTxt(p, '^Backs$'); await L.wait(p, 100);
  t.ok('line rows show the line average', /Line average/.test(await L.text(p)));
  await press('Tackles per game target for back', 'higher', 3);
  await L.clickTxt(p, '^Save targets$'); await L.wait(p, 800);
  await L.clickTxt(p, '^SCORECARD$'); await L.wait(p, 300);
  const backs = ['Ciaran Byrne', 'Darragh Kelly', 'Eoin Walsh', 'Padraig Doyle', 'Tomas Nolan', 'Cian Kavanagh'];
  rows = await rowsOf(p);
  const bRows = rows.filter(x => backs.includes(x.name)), oRows = rows.filter(x => !backs.includes(x.name));
  t.eq('six backs on the card', bRows.length, 6);
  t.ok('backs measured against their new line target of 3 and all miss it', bRows.every(x => /≥ 3$/.test(x.tk) && /off target$/.test(x.lab)), JSON.stringify(bRows));
  t.ok('other lines keep their own automatic targets', oRows.every(x => !/≥ 3$/.test(x.tk)), JSON.stringify(oRows.slice(0, 3)));
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
  t.eq('no page errors', r.errors, []);
  await r.browser.close();

  // Backs who tackle far more than the forwards get a higher automatic line target
  const f = L.fixtures();
  ['f1', 'f2', 'f3'].forEach(m => backs.forEach((n, i) => { for (let k = 0; k < 4 + (i % 2); k++) f.tables.events.push({ id: m + n + k, match_id: m, club_id: L.C, seq: 900 + k, team: 'us', event_type: 'Tackle', outcome: 'Contact Made', score: 0, period: 1, player: n, time_text: '10:00' }); }));
  const r2 = await L.open({ fixtures: f, w: 390, h: 844 }), p2 = r2.page;
  await p2.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p2, 1500);
  await L.clickTxt(p2, '^Players$'); await L.wait(p2, 1000);
  await L.clickTxt(p2, '^TARGETS$'); await L.wait(p2, 300);
  const auto = {};
  for (const [ln, k] of [['Backs', 'back'], ['Forwards', 'fwd']]) { await L.clickTxt(p2, '^' + ln + '$'); await L.wait(p2, 100); auto[k] = await p2.evaluate(k => document.querySelector('div[aria-label="Tackles per game target for ' + k + '"]').innerText.replace(/\s+/g, ' '), k); }
  t.eq('automatic line targets differ by line', auto, { back: '5 AUTO', fwd: '0 AUTO' });
  await L.clickTxt(p2, '^SCORECARD$'); await L.wait(p2, 300);
  const r2rows = await rowsOf(p2);
  t.ok('a back on 4.3 misses the backs target of 5', r2rows.some(x => x.tk === '4.3 \u2265 5' && /off target$/.test(x.lab)), JSON.stringify(r2rows.slice(0, 4)));
  t.ok('a forward on 0.3 meets the forwards target of 0', r2rows.some(x => x.tk === '0.3 \u2265 0' && /on target$/.test(x.lab)));
  await r2.browser.close();
};
