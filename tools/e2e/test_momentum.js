// Momentum chart on a match: one wave above the line for us and below for the opposition,
// goals marked on their side, 0' / HT / FT along the bottom, and a readout on touch.
const L = require('./lib.js');
module.exports = async function(t) {
  const f = L.fixtures();
  // A 2-pointer for us, a red card for them and a black card for us, in every match.
  f.tables.matches.forEach((mm, k) => f.tables.events.push(
    { id: 'tp' + k, match_id: mm.id, club_id: L.C, seq: 900, period: 1, team: 'us', event_type: 'Shot from play', outcome: '2 Pointer', score: 2, time_text: '00:12:30' },
    { id: 'rc' + k, match_id: mm.id, club_id: L.C, seq: 901, period: 2, team: 'opp', event_type: 'Bookings', outcome: 'Red', score: 0, time_text: '00:45:00' },
    { id: 'bc' + k, match_id: mm.id, club_id: L.C, seq: 902, period: 2, team: 'us', event_type: 'Bookings', outcome: 'Black', score: 0, time_text: '00:52:00' }));
  const goalsOf = id => { const evs = f.tables.events.filter(e => e.match_id === id && e.score === 3 && /Shot from play|Scoreable free/.test(e.event_type)); return { us: evs.filter(e => e.team === 'us').length, opp: evs.filter(e => e.team === 'opp').length }; };
  for (const [w, h] of [[390, 844], [1180, 820]]) {
    const r = await L.open({ fixtures: f, w, h }), p = r.page;
    // The match on the home Last match tile.
    const opp = ((await L.text(p)).match(/Last match \u00b7 v ([A-Za-z]+)/) || [])[1];
    const goals = goalsOf((f.tables.matches.find(x => x.opponent === opp) || {}).id);
    await L.clickTxt(p, 'Last match'); await L.wait(p, 2000);
    const n = w + 'x' + h;
    const m = await p.evaluate(() => { const c = document.querySelector('[data-momentum]'); if (!c) return null; c.scrollIntoView(); const s = c.querySelector('svg'); return { paths: s.querySelectorAll('path').length, us: s.querySelectorAll('[data-goal="us"]').length, opp: s.querySelectorAll('[data-goal="opp"]').length, text: c.innerText, w: s.getBoundingClientRect().width }; });
    t.ok(n + ': momentum chart on the match', m && m.paths === 2, JSON.stringify(m));
    t.ok(n + ': goals marked on the right side', m && m.us === goals.us && m.opp === goals.opp, JSON.stringify([m && m.us, m && m.opp, goals]));
    const mk = await p.evaluate(() => { const s = document.querySelector('[data-momentum] svg'); return { two: s.querySelectorAll('[data-two="us"]').length, red: s.querySelectorAll('[data-card="red:opp"]').length, black: s.querySelectorAll('[data-card="black:us"]').length, text: document.querySelector('[data-momentum]').innerText }; });
    t.ok(n + ': 2-pointer, red and black card marked on the right side', mk.two >= 1 && mk.red >= 1 && mk.black >= 1 && /2-pointer/.test(mk.text) && /red card/.test(mk.text), JSON.stringify(mk));
    t.ok(n + ': axis and legend', m && /0'/.test(m.text) && /HT/.test(m.text) && /FT/.test(m.text) && /Ballyvale/.test(m.text), m && m.text);
    t.ok(n + ': fits the card', m && m.w <= w);
    const b = await p.locator('[data-momentum] svg').boundingBox();
    await p.mouse.move(b.x + b.width * 0.3, b.y + b.height * 0.5); await L.wait(p, 200);
    t.ok(n + ': touch shows the minute and who is on top', /\d+' · (even|.+ on top)/.test(await p.evaluate(() => document.querySelector('[data-momentum]').innerText)));
    await p.locator('[data-momentum]').screenshot({ path: require('path').join(__dirname, 'out', 'momentum-' + w + '.png') });
    t.eq(n + ': no page errors', r.errors, []);
    await r.browser.close();
  }
};
