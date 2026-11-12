// Home on an iPad or a computer: a sidebar to every part of the app, a top bar with the quick
// actions, the club, last match, tagging and recent playlists in the middle, and the season, top
// scorers and club details on the right. An upright iPad keeps the sidebar as icons and puts the
// season under the middle. Phones keep the tiles.
const L = require('./lib.js');
module.exports = async function(t) {
  const f = L.fixtures();
  f.tables.playlists = [{ id: 'pl1', club_id: L.C, match_id: null, name: 'Shooting under pressure', token: 'tok_abcdefghijklmnop', created_at: new Date(Date.now() - 7200e3).toISOString(), clips: [{ label: 'Point', video_ts: 20, draw: { at: 20, hold: 4, shapes: [] } }], matches: null }];
  for (const [w, h, n] of [[1180, 820, 'iPad sideways'], [1440, 900, 'computer'], [820, 1180, 'upright iPad']]) {
    const r = await L.open({ fixtures: f, w, h }), p = r.page; await L.wait(p, 1800);
    const m = await p.evaluate(() => {
      const side = document.querySelector('.rsa-hs-side'), lbl = side && [...side.querySelectorAll('.rsa-hs-lbl')].find(x => x.innerText.trim() === 'Dashboard');
      const box = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width) }; };
      return { side: !!side, sideW: side && Math.round(side.getBoundingClientRect().width), labels: !!lbl && getComputedStyle(lbl).display !== 'none', last: box('[data-home-last]'), season: box('[data-home-season]'), feed: box('[data-home-feed]'), tag: document.querySelector('[data-home-tag]') && document.querySelector('[data-home-tag]').getAttribute('data-home-tag'), text: document.body.innerText };
    });
    t.ok(n + ': sidebar home', m.side && m.last && m.season && m.feed, JSON.stringify(m).slice(0, 200));
    if (w >= 1000) {
      t.ok(n + ': sidebar with labels', m.labels && m.sideW > 200, String(m.sideW));
      t.ok(n + ': season column on the right', m.season.x > m.last.x + m.last.w, JSON.stringify([m.last, m.season]));
    } else {
      t.ok(n + ': sidebar as icons only', !m.labels && m.sideW < 90, String(m.sideW));
      t.ok(n + ': season under the middle', m.season.y > m.feed.y, JSON.stringify([m.feed, m.season]));
    }
    t.ok(n + ': last match with its figures and top scorer', /LAST MATCH/.test(m.text) && /SHOTS/.test(m.text) && /Top scorer/.test(m.text));
    t.eq(n + ': tagging card offers resume', m.tag, 'resume');
    t.ok(n + ': recent playlists, shared marked, drawings counted', /Shooting under pressure/.test(m.text) && /SHARED/.test(m.text) && /1 drawing/.test(m.text));
    t.ok(n + ': this season, top scorers, club and appearance', /THIS SEASON/.test(m.text) && /TOP SCORERS/.test(m.text) && /Player join code/.test(m.text) && /PHONE/.test(m.text));
    if (n === 'iPad sideways') await L.shot(p, 'home_shell_ipad');
    t.eq(n + ': no page errors', r.errors, []);
    await r.browser.close();
  }
  // The sidebar opens each part of the app.
  let r = await L.open({ fixtures: f, w: 1180, h: 820 }), p = r.page; await L.wait(p, 1500);
  await p.click('.rsa-hs-side button[aria-label="Pitch map"]'); await L.wait(p, 1500);
  t.ok('sidebar: Pitch map opens', /PITCH MAP/i.test(await L.text(p)));
  await r.browser.close();
  r = await L.open({ fixtures: f, w: 1180, h: 820 }); p = r.page; await L.wait(p, 1500);
  await L.openLastMatch(p); await L.wait(p, 1800);
  t.ok('last match card: opens the match report', /All matches/.test(await L.text(p)));
  t.eq('no page errors (sidebar)', r.errors, []);
  await r.browser.close();
  // Phones keep the tiles.
  r = await L.open({ fixtures: f, w: 390, h: 844 }); p = r.page; await L.wait(p, 1200);
  t.ok('phone: tiles as before, no sidebar', !(await p.evaluate(() => !!document.querySelector('.rsa-hs-side'))) && /Last match · v/.test(await L.text(p)));
  t.eq('no page errors (phone)', r.errors, []);
  await r.browser.close();
};
