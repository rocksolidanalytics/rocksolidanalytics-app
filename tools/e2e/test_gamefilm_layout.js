// Game film fits the screen: on a phone in landscape the video sits beside a scrolling clip list
// instead of filling the screen; portrait stays stacked.
const L = require('./lib.js');
module.exports = async function(t) {
  for (const [w, h, side] of [[740, 360, true], [915, 412, true], [390, 844, false], [1180, 820, true]]) {
    const f = L.fixtures({ matches: [{ id: 'gf', club_id: L.C, opponent: 'An Tochar', date: '2026-10-20', status: 'final', video_tagged: true, video_enabled: true, video_url: 'https://youtu.be/QyBK5QpmSfw', video_throwin: 5 }] });
    f.tables.events = Array.from({ length: 40 }, (_, i) => ({ id: 'e' + i, match_id: 'gf', club_id: L.C, seq: i + 1, period: 1, time_text: '00:' + String(1 + i).padStart(2, '0') + ':00', team: i % 2 ? 'opp' : 'us', event_type: ['Shot from play', 'Kickout', 'Tackle'][i % 3], outcome: 'Point', score: i % 3 ? 0 : 1 })).concat(f.tables.events);
    const r = await L.open({ fixtures: f, w, h }), p = r.page;
    await L.fakeYouTube(p);
    await p.getByText('Game film', { exact: true }).first().click(); await L.wait(p, 1200);
    // The games list: small cards in a grid, not full-width tiles.
    const cards = await p.evaluate(() => [...document.querySelectorAll('[data-gf-grid] > button')].map(b => { const r = b.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; }));
    t.ok(w + 'x' + h + ': games list is small cards', cards.length === 1 && cards[0][1] <= 120 && cards[0][0] <= Math.max(260, w / 2), JSON.stringify(cards));
    await L.clickTxt(p, 'Watch'); await L.wait(p, 1800);
    const m = await p.evaluate(() => { const v = document.querySelector('.rsa-gf-video').getBoundingClientRect(), e = document.querySelector('.rsa-gf-events').getBoundingClientRect(); return { vBottom: v.bottom, vRight: v.right, eLeft: e.left }; });
    const n = w + 'x' + h;
    t.ok(n + ': video and its buttons fit the screen height', m.vBottom <= h + 1, 'video ends at ' + Math.round(m.vBottom));
    t.eq(n + (side ? ': clip list beside the video' : ': clip list under the video'), m.eLeft >= m.vRight - 1, side);
    // A phone on its side: the video fills the height, with the play buttons in a strip beside it.
    if (h < 560) {
      const q = await p.evaluate(() => { const f = document.querySelector('.rsa-gf-frame').getBoundingClientRect(), c = document.querySelector('.rsa-gf-ctrls').getBoundingClientRect(); return { fw: f.width, fh: f.height, cLeft: c.left, fRight: f.right }; });
      t.ok(n + ': video at least 3/4 of the screen height', q.fh >= h * 0.7, JSON.stringify(q));
      t.ok(n + ': play buttons in a strip beside the video', q.cLeft >= q.fRight, JSON.stringify(q));
    }
    if (w >= 1000) {
      const vw = await p.evaluate(() => document.querySelector('.rsa-gf-video').getBoundingClientRect().width);
      t.ok(n + ': video takes about two thirds of the width', vw >= w * 0.6, String(vw));
    }
    t.eq(n + ': no page errors', r.errors, []);
    await r.browser.close();
  }
};
