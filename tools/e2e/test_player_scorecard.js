// Season Players tab: the scorecard lists players with 3+ games, keepers on their own card,
// colours against whole-number targets, a coaching point on tap, and coach targets that save.
const L = require('./lib.js');
module.exports = async function(t) {
  const r = await L.open({ w: 390, h: 844 }), p = r.page;
  const press = async (label, dir, n) => { for (let i = 0; i < n; i++) { await p.click('button[aria-label="' + label + ' ' + dir + '"]'); await L.wait(p, 60); } };
  // Labels of one column (1 tackles, 6 handling) down the outfield table.
  const col = i => p.evaluate(i => [...document.querySelector('.rsa-sec table tbody').querySelectorAll('tr')].filter(tr => tr.children.length > 2).map(tr => tr.children[i].getAttribute('aria-label')), i);
  await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 1500);
  await L.clickTxt(p, '^Players$'); await L.wait(p, 1000);
  let tx = await L.text(p);
  t.ok('scorecard shown on the season Players tab', /PLAYER SCORECARD/.test(tx));
  t.ok('keepers on their own card', /GOALKEEPERS/.test(tx));
  const rows = await p.evaluate(() => [...document.querySelectorAll('.rsa-sec table')].map(tb => tb.querySelectorAll('tbody tr').length));
  t.eq('14 outfield players and 1 keeper with 3 games', rows.slice(0, 2), [14, 1]);
  t.ok('no tick or cross symbols', !/[✓✗≈]/.test(await p.evaluate(() => document.querySelector('.rsa-sec table tbody').innerText)));
  // Handling: automatic target 0 a game, so 0.3 rounds to it (amber) and 0 meets it (green)
  const hd = await col(6);
  t.ok('handling: 0.3 is a near miss and 0 meets a target of 0', hd.every(x => x === '0.3, near miss' || x === '0, on target') && hd.includes('0.3, near miss') && hd.includes('0, on target'), hd.join(' | '));
  const nearRow = await p.evaluate(() => [...document.querySelector('.rsa-sec table tbody').querySelectorAll('tr')].findIndex(tr => tr.children.length > 2 && /near miss/.test(tr.children[6].getAttribute('aria-label'))));
  await p.evaluate(i => document.querySelector('.rsa-sec table tbody').querySelectorAll('tr')[i].click(), nearRow); await L.wait(p, 300);
  tx = await L.text(p);
  t.ok('the coaching point names the near miss', /Close on possession lost from handling errors, per game \(0\.3 against 0\)/.test(tx), (tx.match(/(On target|Nearly|Effort|Clean|Work on)[^\n]*/) || [''])[0]);
  t.ok('and offers the player profile', /Open player profile/.test(tx));
  // Targets: whole numbers, automatic until changed
  await L.clickTxt(p, '^TARGETS$'); await L.wait(p, 300);
  const stepText = () => p.evaluate(() => document.querySelector('div[aria-label="Tackles per game target"]').innerText.replace(/\s+/g, ' ').trim());
  t.eq('squad tackle target is automatic and a whole number', await stepText(), '0 AUTO');
  await press('Tackles per game target', 'higher', 3);
  t.eq('plus steps by one and marks it set', await stepText(), '3 SET');
  await L.clickTxt(p, '^Save targets$'); await L.wait(p, 800);
  t.ok('targets save', /✓ Targets saved/.test(await L.text(p)));
  await L.clickTxt(p, '^SCORECARD$'); await L.wait(p, 300);
  t.ok('a squad target set by the coach shows in the heading', /Tkl\/g\n≥ 3/.test(await L.text(p)));
  t.eq('every player now misses it', (await col(1)).every(x => /off target$/.test(x)), true);
  await L.clickTxt(p, '^TARGETS$'); await L.wait(p, 300);
  await p.click('button[aria-label="Tackles per game target reset"]'); await L.wait(p, 100);
  t.eq('Reset goes back to automatic', await stepText(), '0 AUTO');
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
