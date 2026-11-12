// The sidebar on the other big-screen pages: each page opens inside the sidebar frame with its
// own item marked, pages fit the width, the taggers stay full screen, and phones have no sidebar.
const L = require('./lib.js');
module.exports = async function(t) {
  const f = L.fixtures({ matches: [{ id: 'gf', club_id: L.C, opponent: 'An Tochar', date: '2026-10-20', status: 'final', video_tagged: true, video_enabled: true, video_url: 'https://youtu.be/QyBK5QpmSfw', video_throwin: 5 }] });
  for (const [w, h, n] of [[1180, 820, 'iPad sideways'], [820, 1180, 'upright iPad']]) {
    const r = await L.open({ fixtures: f, w, h }), p = r.page; await L.fakeYouTube(p); await L.wait(p, 1200);
    for (const lab of ['Dashboard', 'Game film', 'Pitch map', 'Opposition', 'Squad', 'Live Stats Pad', 'Tactical pad', 'Video tagger']) {
      await p.click('.rsa-hs-side button[aria-label="' + lab + '"]'); await L.wait(p, 1300);
      const m = await p.evaluate(() => ({ page: document.querySelector('[data-nav-page]') && document.querySelector('[data-nav-page]').getAttribute('data-nav-page'), cur: (document.querySelector('.rsa-hs-side [aria-current="page"]') || {}).getAttribute ? document.querySelector('.rsa-hs-side [aria-current="page"]').getAttribute('aria-label') : null, spill: document.documentElement.scrollWidth > window.innerWidth + 1 }));
      t.ok(n + ': ' + lab + ' opens in the sidebar frame, marked, no sideways scroll', m.page === lab && m.cur === lab && !m.spill, JSON.stringify(m));
    }
    await p.click('.rsa-hs-side button[aria-label="Home"]'); await L.wait(p, 1000);
    t.ok(n + ': Home from the sidebar', await p.evaluate(() => !!document.querySelector('[data-home-last]')));
    await L.resumeTagging(p); await L.wait(p, 1200);
    t.ok(n + ': the live tagger stays full screen', await p.evaluate(() => !document.querySelector('.rsa-hs-side')));
    t.eq(n + ': no page errors', r.errors, []);
    await r.browser.close();
  }
  const r = await L.open({ fixtures: f, w: 390, h: 844 }), p = r.page; await L.wait(p, 1000);
  await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 1500);
  t.ok('phone: pages have no sidebar', await p.evaluate(() => !document.querySelector('.rsa-hs-side')) && /Season/.test(await L.text(p)));
  t.eq('phone: no page errors', r.errors, []);
  await r.browser.close();
};
