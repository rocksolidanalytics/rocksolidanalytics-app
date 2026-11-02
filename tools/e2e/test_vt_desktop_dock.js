// Video tagger on a computer: the video sits above the seek strip so its own play bar shows,
// and the Tags panel closes from a click on the video, the Escape key or a full-size Close.
const L = require('./lib.js');
module.exports = async function(t) {
  for (const [w, h] of [[1280, 790], [1180, 820]]) {
    const n = w + 'x' + h;
    const r = await L.open({ fixtures: L.fixtures({ videoPack: true, matches: [{ id: 'dk', club_id: L.C, opponent: 'Mayo', date: '2026-10-27', status: 'scheduled' }] }), w, h, touch: w === 1180 }), p = r.page;
    await L.videoTagger(p, 'Mayo'); await L.wait(p, 500);
    const gap = await p.evaluate(() => { const v = document.querySelector('#root video').getBoundingClientRect(), s = document.querySelector('.rsa-vtl-strip').getBoundingClientRect(); return Math.round(s.top - v.bottom); });
    t.ok(n + ': the video ends above the seek strip', gap >= 0, 'gap ' + gap);
    const dockW = () => p.evaluate(() => { const d = document.querySelector('.rsa-vtl-dock'); return d ? Math.round(d.getBoundingClientRect().width) : 0; });
    const openTags = async () => { await L.clickTxt(p, 'Tags$'); await L.wait(p, 400); };
    await openTags();
    t.ok(n + ': Tags opens the panel', (await dockW()) > 200);
    const cb = await p.evaluate(() => { const b = document.querySelector('button[aria-label="Close tags"]'); const r = b.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
    t.ok(n + ': the Close button is full size', cb[0] >= 60 && cb[1] >= 44, cb.join('x'));
    await L.shot(p, 'vt_dock_open_' + n);
    const vb = await p.evaluate(() => { const v = document.querySelector('#root video').getBoundingClientRect(); return [v.left + v.width * 0.3, v.top + v.height / 2]; });
    await p.mouse.click(vb[0], vb[1]); await L.wait(p, 400);
    t.eq(n + ': a click on the video closes it', await dockW(), 0);
    t.ok(n + ': and does not start the video', await p.evaluate(() => document.querySelector('#root video').paused));
    await openTags(); await p.keyboard.press('Escape'); await L.wait(p, 400);
    t.eq(n + ': Escape closes it', await dockW(), 0);
    await openTags(); await p.click('button[aria-label="Close tags"]'); await L.wait(p, 400);
    t.eq(n + ': Close closes it', await dockW(), 0);
    await L.shot(p, 'vt_dock_closed_' + n);
    t.eq(n + ': no page errors', r.errors, []);
    await r.browser.close();
  }
};
