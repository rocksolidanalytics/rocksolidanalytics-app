// Periods tab: the droughts card also shows the longest spell without a shot (never longer than
// the spell without a score), and the period breakdown shows one heading at a time from a row of
// buttons (All by default; the pick is kept on the device).
const L = require('./lib.js');
const mmss = s => { const p = s.split(':').map(Number); return p[0] * 60 + p[1]; };
module.exports = async function(t) {
  for (const scope of ['match', 'season']) {
    const r = await L.open({ fixtures: L.fixtures() }), p = r.page;
    if (scope === 'match') await L.clickTxt(p, 'Last match'); else await p.getByText('Dashboard', { exact: true }).first().click();
    await L.wait(p, 1800);
    await L.clickTxt(p, '^Periods$'); await L.wait(p, 1000);
    const dr = await p.evaluate(() => [...document.querySelectorAll('[data-shot-drought]')].map(x => ({ team: x.getAttribute('data-shot-drought'), t: (x.innerText.match(/\d+:\d\d/) || [''])[0], score: (x.parentNode.innerText.match(/\d+:\d\d/) || [''])[0] })));
    t.ok(scope + ': a spell without a shot for each side', dr.length === 2 && dr.every(x => /\d+:\d\d/.test(x.t)), JSON.stringify(dr));
    if (scope === 'match') t.ok('match: no shot spell is longer than the no score spell', dr.every(x => mmss(x.t) <= mmss(x.score)), JSON.stringify(dr));
    const heads = () => p.evaluate(() => [...document.querySelectorAll('td[colspan]')].map(x => x.innerText.trim()));
    t.ok(scope + ': every heading by default', (await heads()).length >= 6);
    await p.evaluate(() => [...document.querySelectorAll('[data-per-pick] button')].find(b => b.innerText.trim() === 'Shooting').click()); await L.wait(p, 300);
    t.eq(scope + ': a button shows that heading alone', await heads(), ['SHOOTING']);
    t.eq(scope + ': the pick is kept', await p.evaluate(() => localStorage.getItem('rsa_sp_persec')), 'SHOOTING');
    await p.evaluate(() => [...document.querySelectorAll('[data-per-pick] button')].find(b => b.innerText.trim() === 'All').click()); await L.wait(p, 200);
    t.eq(scope + ': no page errors', r.errors, []);
    await r.browser.close();
  }
};
