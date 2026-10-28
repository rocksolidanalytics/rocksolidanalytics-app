// Season Players tab: the scorecard lists named players with 3+ games (not shirt numbers such as
// the opposition player who won one of our kickouts), keepers on their own card, one ball-lost
// column with the kind of loss in the coaching point, colours that agree with each target, and
// coach targets that save.
const L = require('./lib.js');
module.exports = async function(t) {
  const f = L.fixtures();
  ['f1', 'f2', 'f3'].forEach((m, i) => {
    f.tables.events.push({ id: m + 'ko', match_id: m, club_id: L.C, seq: 800, team: 'us', event_type: 'Kickout', outcome: 'Break lost', score: 0, period: 1, player: '#11', time_text: '05:00' });
    f.tables.events.push({ id: m + 'tk', match_id: m, club_id: L.C, seq: 801, team: 'us', event_type: 'Tackle', outcome: 'Contact Made', score: 0, period: 1, player: '#9', time_text: '06:00' });
    [['Kick Pass', 2], ['Hand Pass', i === 0 ? 1 : 0]].forEach(([oc, n]) => { for (let k = 0; k < n; k++) f.tables.events.push({ id: m + oc + k, match_id: m, club_id: L.C, seq: 810 + k, team: 'us', event_type: 'Possession lost', outcome: oc, score: 0, period: 1, player: 'Aidan Farrell', time_text: '07:00' }); });
  });
  const r = await L.open({ fixtures: f, w: 390, h: 844 }), p = r.page;
  const press = async (label, dir, n) => { for (let i = 0; i < n; i++) { await p.click('button[aria-label="' + label + ' ' + dir + '"]'); await L.wait(p, 60); } };
  const rowsOf = () => p.evaluate(() => [...document.querySelector('.rsa-sec table tbody').querySelectorAll('tr')].filter(tr => tr.children.length > 2).map(tr => ({ name: tr.children[0].innerText.split(' ·')[0].trim(), cells: [...tr.children].slice(1).map(td => ({ txt: td.innerText.replace(/\s+/g, ' ').trim(), lab: td.getAttribute('aria-label') || '' })) })));
  await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 1500);
  await L.clickTxt(p, '^Players$'); await L.wait(p, 1000);
  let tx = await L.text(p);
  t.ok('scorecard shown on the season Players tab', /PLAYER SCORECARD/.test(tx));
  t.ok('keepers on their own card', /GOALKEEPERS/.test(tx));
  t.eq('no Scorecard / Targets switch, a small Adjust targets link instead', await L.buttons(p, '^(SCORECARD|TARGETS|Adjust targets)$'), 'Adjust targets');
  const heads = await p.evaluate(() => [...document.querySelector('.rsa-sec table thead').querySelectorAll('tr')[1].children].slice(1).map(th => th.innerText.split('\n')[0]));
  t.eq('one ball-lost column', heads, ['Tkl/g', 'Foul %', 'Lost/g', 'Sh/g', 'Acc %']);
  let rows = await rowsOf();
  t.ok('shirt numbers (our lost kickouts, unnamed tackles) are not on the card', !rows.some(x => x.name.charAt(0) === '#'), rows.map(x => x.name).join(', '));
  t.eq('14 outfield players and 1 keeper', await p.evaluate(() => [...document.querySelectorAll('.rsa-sec table')].slice(0, 2).map(tb => tb.querySelectorAll('tbody tr').length)), [14, 1]);
  t.ok('no tick or cross symbols', !/[✓✗≈]/.test(await p.evaluate(() => document.querySelector('.rsa-sec table tbody').innerText)));
  // Every coloured cell agrees with the target shown under it: met, rounds to it, or misses
  const bad = [];
  rows.forEach(x => x.cells.forEach((c, i) => { const m = /^([\d.]+)%? ([≥≤]) ([\d.]+)%?$/.exec(c.txt); if (!m) return; const v = +m[1], tg = +m[3], up = m[2] === '≥', pct = /%/.test(c.txt);
    const want = (up ? v >= tg : v <= tg) ? 'on target' : (pct ? Math.abs(v - tg) <= 5 : Math.abs(v - tg) < 0.5) ? 'near miss' : 'off target';
    if (!c.lab.endsWith(want)) bad.push(x.name + ' col ' + i + ': ' + c.txt + ' is ' + c.lab); }));
  t.eq('every colour agrees with its target', bad, []);
  t.ok('ball lost has near misses and misses to check', rows.some(x => /near miss/.test(x.cells[2].lab)) || rows.some(x => /off target/.test(x.cells[2].lab)));
  // Coaching point says how the ball is lost
  const ai = await p.evaluate(() => [...document.querySelector('.rsa-sec table tbody').querySelectorAll('tr')].findIndex(tr => tr.children[0].innerText.indexOf('Aidan Farrell') === 0));
  await p.evaluate(i => document.querySelector('.rsa-sec table tbody').querySelectorAll('tr')[i].click(), ai); await L.wait(p, 300);
  tx = await L.text(p);
  t.ok('coaching point names the main way the ball is lost', /Most lost balls are kick passes \(6 of 7\), then hand passes \(1\)\./.test(tx), (tx.match(/(On target|Nearly|Effort|Clean|Work on)[^\n]*/) || [''])[0]);
  t.ok('and offers the player profile', /Open player profile/.test(tx));
  // Targets: whole numbers, automatic until changed
  await L.clickTxt(p, '^Adjust targets$'); await L.wait(p, 300);
  const stepText = () => p.evaluate(() => document.querySelector('div[aria-label="Tackles per game target"]').innerText.replace(/\s+/g, ' ').trim());
  t.eq('squad tackle target is automatic and a whole number', await stepText(), '0 AUTO');
  await press('Tackles per game target', 'higher', 3);
  t.eq('plus steps by one and marks it set', await stepText(), '3 SET');
  await L.clickTxt(p, '^Save targets$'); await L.wait(p, 800);
  t.ok('targets save', /✓ Targets saved/.test(await L.text(p)));
  await L.clickTxt(p, 'Back to the scorecard$'); await L.wait(p, 300);
  t.ok('a squad target set by the coach shows in the heading', /Tkl\/g\n≥ 3/.test(await L.text(p)));
  rows = await rowsOf();
  t.eq('every player now misses it', rows.every(x => /off target$/.test(x.cells[0].lab)), true);
  await L.clickTxt(p, '^Adjust targets$'); await L.wait(p, 300);
  await p.click('button[aria-label="Tackles per game target reset"]'); await L.wait(p, 100);
  t.eq('Reset goes back to automatic', await stepText(), '0 AUTO');
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
