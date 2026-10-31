// New match: earlier opponents (and both teams of scouted games) and referees are offered as taps
// under their boxes as you type; scouting has a short explainer.
const L = require('./lib.js');
module.exports = async function(t) {
  const f = L.fixtures({ matches: [
    { id: 'a1', club_id: L.C, opponent: 'Baltinglass', date: '2026-05-01', status: 'final', scouting: false, referee: 'Brid Kearns' },
    { id: 'a2', club_id: L.C, opponent: 'Baltinglass', date: '2026-06-01', status: 'final', scouting: false, referee: 'Aidan Mullane' },
    { id: 'a3', club_id: L.C, opponent: 'Arklow Geraldines', date: '2026-06-08', status: 'final', scouting: false },
    { id: 'a4', club_id: L.C, opponent: 'Bray Emmets v Blessington', date: '2026-06-15', status: 'final', scouting: true, referee: 'Brid Kearns' }] });
  const r = await L.open({ fixtures: f }), p = r.page;
  const chips = () => p.evaluate(() => [...document.querySelectorAll('#root button[aria-label^="Use "]')].map(b => b.innerText.trim()));
  await L.clickTxt(p, 'New [Mm]atch'); await L.wait(p, 1000);
  t.ok('scouting hint shown', /Tag a game you are not playing in/.test(await L.text(p)));
  await p.fill('input[placeholder="e.g. Rathnew"]', 'b'); await L.wait(p, 300);
  const b = await chips();
  t.eq('typing b offers B teams, most played first', b.slice(0, 1), ['Baltinglass']);
  t.ok('scouted teams included', b.includes('Bray Emmets') && b.includes('Blessington') && !b.includes('Arklow Geraldines'), b.join(' | '));
  await p.click('button[aria-label="Use Baltinglass"]'); await L.wait(p, 200);
  t.eq('a tap fills it in', await p.inputValue('input[placeholder="e.g. Rathnew"]'), 'Baltinglass');
  t.eq('and the suggestions go', await chips(), []);
  await p.fill('input[placeholder="Name (optional)"]', 'k'); await L.wait(p, 300);
  t.eq('referees by surname too', await chips(), ['Brid Kearns']);
  await L.clickTxt(p, 'Scout a Match'); await L.wait(p, 300);
  t.ok('scouting explainer when on', /single tap for the home team, double tap for the away team/.test(await L.text(p)) && /counts as one of your free matches/.test(await L.text(p)));
  await p.fill('input[placeholder="e.g. Erins Isle"]', 'bl'); await L.wait(p, 300);
  t.eq('home team gets suggestions too', (await chips()).slice(0, 2), ['Blessington']);
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
