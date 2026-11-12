// Season cards that used to list every game (droughts, time leading / level / behind, cards game
// by game) use a game filter instead: all games, the last 5, or one game picked from a list.
const L = require('./lib.js');
// Nine games: the three fixture games copied twice more on later dates, with a card in each.
function season() {
  const f = L.fixtures(), base = f.tables.matches.slice(), evs = f.tables.events.slice();
  base.forEach((m, k) => [1, 2].forEach(c => {
    const id = m.id + 'c' + c, d = new Date(Date.parse(m.date) + (c * 40 + k) * 86400000).toISOString().slice(0, 10);
    f.tables.matches.push(Object.assign({}, m, { id, date: d }));
    evs.filter(e => e.match_id === m.id).forEach(e => f.tables.events.push(Object.assign({}, e, { id: e.id + 'c' + c, match_id: id })));
  }));
  f.tables.matches.forEach((m, k) => f.tables.events.push({ id: 'card' + k, match_id: m.id, club_id: L.C, seq: 990, period: 1, team: k % 2 ? 'opp' : 'us', event_type: 'Bookings', outcome: 'Yellow', score: 0, player: k % 2 ? null : 'Sean Murphy', time_text: '00:20:00' }));
  return f;
}
module.exports = async function(t) {
  const r = await L.open({ fixtures: season() }), p = r.page;
  await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 1800);
  await L.clickTxt(p, '^Periods$'); await L.wait(p, 1000);
  const tx = await L.text(p);
  t.ok('periods: no list of every game', !/\nGAME\n/.test(tx) && (await p.evaluate(() => document.querySelectorAll('[data-game-pick]').length)) === 2, String(await p.evaluate(() => document.querySelectorAll('[data-game-pick]').length)));
  t.ok('periods: All games, Last 5 and a game picker', /All games · 9/.test(await L.buttons(p, 'All games')) && /Last 5/.test(await L.buttons(p, 'Last 5')) && await p.locator('select[aria-label="Pick a game"]').count() === 2);
  const avgAll = await p.evaluate(() => document.querySelector('[data-shot-drought="us"]').innerText);
  await p.evaluate(() => [...document.querySelectorAll('[data-game-pick]')][0].querySelectorAll('button')[1].click()); await L.wait(p, 300);
  t.ok('droughts: Last 5 averages the last 5 games', /The last 5 games/.test(await L.text(p)));
  const sel = p.locator('select[aria-label="Pick a game"]').first();
  const opt = await sel.evaluate(s => s.options[1].value); await sel.selectOption(opt); await L.wait(p, 300);
  t.ok('droughts: one game shows when each spell began', /from \d+′ · (1st|2nd) half/.test(await p.evaluate(() => document.querySelector('[data-shot-drought="us"]').parentNode.innerText)) && /avg longest/.test(avgAll));
  const gsSel = p.locator('select[aria-label="Pick a game"]').nth(1);
  await gsSel.selectOption(await gsSel.evaluate(s => s.options[1].value)); await L.wait(p, 300);
  t.ok('time leading: one game shows its result', /(won|lost) by \d+|drawn/.test(await L.text(p)));
  await L.clickTxt(p, '^Defence$'); await L.wait(p, 1000);
  const cards = await p.evaluate(() => { const s = document.body.innerText; return { last5: /LAST 5 GAMES WITH CARDS/.test(s), pick: !!document.querySelector('[data-game-pick]') }; });
  t.ok('cards: the last 5 games with cards, and a picker for the rest', cards.last5 && cards.pick, JSON.stringify(cards));
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
