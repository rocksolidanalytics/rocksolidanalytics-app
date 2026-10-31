// Shared clip links play without the YouTube bar (it flashed over the start of every clip), with
// a tap layer and a PLAY / PAUSE button; lead and tail are sliders that save when let go.
const L = require('./lib.js');
// A stand-in YouTube player that exists before the page builds its own, with no real video.
const fakeYT = () => {
  window.__ytCalls = [];
  window.YT = { Player: function(host, o) {
    let st = -1; const set = s => { st = s; o.events.onStateChange && o.events.onStateChange({ data: s }); };
    window.__ytVars = o.playerVars;
    this.playVideo = () => { window.__ytCalls.push('play'); set(1); }; this.pauseVideo = () => { window.__ytCalls.push('pause'); set(2); };
    this.seekTo = t => { window.__ytCalls.push('seek ' + Math.round(t)); };
    this.getCurrentTime = () => 0; this.getPlayerState = () => st; this.destroy = () => {};
    setTimeout(() => o.events.onReady && o.events.onReady({ target: this }), 50);
  } };
};
module.exports = async function(t) {
  const f = L.fixtures();
  f.rpc.clip_playlist = { name: 'Playlist 1', opponent: 'An Tochar', match_date: '2026-10-20', video_url: 'https://youtu.be/QyBK5QpmSfw',
    clips: [{ label: 'Point', video_ts: 20, pre: 6, post: 5 }, { label: 'Wide', video_ts: 40 }] };
  let r = await L.open({ fixtures: f, hash: '?clips=tok1', init: fakeYT }), p = r.page;
  await L.wait(p, 800);
  t.eq('shared link: YouTube controls off', await p.evaluate(() => window.__ytVars && window.__ytVars.controls), 0);
  t.ok('shared link: first clip starts at its lead', (await p.evaluate(() => window.__ytCalls)).includes('seek 14'), JSON.stringify(await p.evaluate(() => window.__ytCalls)));
  t.ok('shared link: PREV, PAUSE and NEXT buttons', /PREV/.test(await L.buttons(p, 'PREV')) && /PAUSE/.test(await L.buttons(p, '^PAUSE$')) && /NEXT/.test(await L.buttons(p, 'NEXT')));
  t.eq('shared link: tap layer over the video once playing', await L.tapLayers(p), 1);
  await p.evaluate(() => [...document.querySelectorAll('#root div')].find(d => d.style.zIndex === '2' && d.style.cursor === 'pointer' && d.style.inset).click()); await L.wait(p, 300);
  t.ok('shared link: a tap on the video pauses', /^PLAY$/.test(await L.buttons(p, '^PLAY$')) && (await p.evaluate(() => window.__ytCalls)).slice(-1)[0] === 'pause');
  await L.clickTxt(p, '^PLAY$'); await L.wait(p, 300);
  t.eq('shared link: PLAY plays again', (await p.evaluate(() => window.__ytCalls)).slice(-1)[0], 'play');
  t.eq('shared link: no page errors', r.errors, []);
  await r.browser.close();

  const g = L.fixtures({ matches: [{ id: 'gf', club_id: L.C, opponent: 'An Tochar', date: '2026-10-20', status: 'final', video_tagged: true, video_enabled: true, video_url: 'https://youtu.be/QyBK5QpmSfw', video_throwin: 5 }] });
  g.tables.playlists = [{ id: 'pl1', club_id: L.C, match_id: 'gf', name: 'Playlist 1', token: null, clips: [{ label: 'Point', video_ts: 20 }], matches: { id: 'gf', date: '2026-10-20', opponent: 'An Tochar' } }];
  r = await L.open({ fixtures: g }); p = r.page;
  await p.getByText('Game film', { exact: true }).first().click(); await L.wait(p, 1200);
  await p.getByText('Clip bank').first().click(); await L.wait(p, 500);
  await p.getByText('Playlist 1').first().click().catch(() => {}); await L.wait(p, 500);
  const lead = p.locator('input[aria-label="lead seconds"]').first();
  t.eq('clip bank: lead is a slider at the default 6s', await lead.inputValue(), '6');
  await lead.fill('12'); await lead.blur(); await L.wait(p, 500);
  const w = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists').map(x => x[2]));
  t.ok('clip bank: letting go saves the new lead', w.some(x => x && x.clips && x.clips[0] && x.clips[0].pre === 12), JSON.stringify(w).slice(0, 300));
  t.ok('clip bank: clip length follows', /17s/.test(await L.text(p)));
  t.eq('clip bank: no page errors', r.errors, []);
  await r.browser.close();
};
