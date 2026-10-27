// YouTube in the video tagger and Game film, with a stand-in player: controls off, the app bar,
// and the tap layer that only appears once the video has played.
const L = require('./lib.js');
module.exports = async function(t) {
  for (const [w, h, n] of [[1180, 820, 'iPad'], [390, 844, 'phone']]) {
    let r = await L.open({ fixtures: L.fixtures({ videoPack: true, matches: [{ id: 'yt', club_id: L.C, opponent: 'Kerry v Mayo', date: '2026-07-26', status: 'scheduled', scouting: true }] }), w, h }), p = r.page;
    await L.fakeYouTube(p);
    await p.getByText('Video tagger', { exact: true }).click(); await L.wait(p, 800);
    await p.getByText('Kerry v Mayo').first().click(); await L.wait(p, 1000);
    await L.clickTxt(p, 'YouTube / Dropbox'); await L.wait(p, 300);
    await p.fill('input[placeholder^="YouTube link"]', 'https://youtu.be/QyBK5QpmSfw?si=abc'); await L.clickTxt(p, '^Load video$'); await L.wait(p, 2500);
    t.eq(n + ' tagger: video id read from the link', await p.evaluate(() => window.__vid), 'QyBK5QpmSfw');
    t.eq(n + ' tagger: YouTube controls off', await p.evaluate(() => window.__ytVars && window.__ytVars.controls), 0);
    t.eq(n + ' tagger: no tap layer before the first play', await L.tapLayers(p), 0);
    await L.clickTxt(p, '^▶$'); await L.wait(p, 800);
    t.eq(n + ' tagger: tap layer once playing', await L.tapLayers(p), 1);
    await p.evaluate(() => [...document.querySelectorAll('#root div')].find(d => d.style.zIndex === '2' && d.style.cursor === 'pointer' && d.style.inset).click()); await L.wait(p, 400);
    t.eq(n + ' tagger: a tap on the video pauses through the app', await p.evaluate(() => window.__ytCalls), ['play', 'pause']);
    t.eq(n + ' tagger: no page errors', r.errors, []);
    await r.browser.close();

    r = await L.open({ fixtures: L.fixtures({ matches: [{ id: 'gf', club_id: L.C, opponent: 'An Tochar', date: '2026-10-20', status: 'final', video_tagged: true, video_enabled: true, video_url: 'https://youtu.be/QyBK5QpmSfw', video_throwin: 5 }] }), w, h }); p = r.page;
    await L.fakeYouTube(p);
    await p.getByText('Game film', { exact: true }).first().click(); await L.wait(p, 1200);
    await p.getByText('An Tochar').first().click().catch(() => {}); await L.wait(p, 600);
    await L.clickTxt(p, 'Watch'); await L.wait(p, 2500);
    t.ok(n + ' Game film: clips start 8s before', /STARTS 8s BEFORE/.test(await L.text(p)));
    t.eq(n + ' Game film: no tap layer before the first play', await L.tapLayers(p), 0);
    await p.evaluate(() => document.querySelector('#root video').play()); await L.wait(p, 800);
    t.eq(n + ' Game film: tap layer once playing', await L.tapLayers(p), 1);
    await p.evaluate(() => [...document.querySelectorAll('#root div')].find(d => d.style.zIndex === '2' && d.style.cursor === 'pointer' && d.style.inset).click()); await L.wait(p, 400);
    t.eq(n + ' Game film: a tap pauses through the app', await p.evaluate(() => window.__ytCalls), ['pause']);
    t.eq(n + ' Game film: no page errors', r.errors, []);
    await r.browser.close();
  }
};
