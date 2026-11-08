// Drawing over paused video: in Game film an analyst draws arrows, zones and labels on the
// frame and saves the drawing onto the playlist clip that covers that moment; a shared link
// pauses at the drawing, shows it for its hold, then plays on.
const L = require('./lib.js');
// A stand-in YouTube player whose clock is window.__t, with the player calls in window.__ytCalls.
const fakeYT = () => {
  window.__ytCalls = []; window.__t = 0;
  window.YT = { Player: function(host, o) {
    let st = -1; const set = s => { st = s; o.events.onStateChange && o.events.onStateChange({ data: s }); };
    this.playVideo = () => { window.__ytCalls.push('play'); set(1); }; this.pauseVideo = () => { window.__ytCalls.push('pause'); set(2); };
    this.seekTo = t => { window.__ytCalls.push('seek ' + Math.round(t)); };
    this.loadVideoById = () => {};
    this.getCurrentTime = () => window.__t; this.getPlayerState = () => st; this.destroy = () => {};
    setTimeout(() => o.events.onReady && o.events.onReady({ target: this }), 50);
  } };
};
const writes = p => p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists').map(x => x[2]));
const shapes = (p, which) => p.evaluate(w => { const s = document.querySelector('svg[data-tele="' + w + '"]'); return s ? [...s.querySelectorAll('g[data-shape]')].map(g => g.getAttribute('data-shape')) : null; }, which);
// Pointer at a fraction of the drawing surface.
async function xy(p, fx, fy) { const b = await p.locator('svg[data-tele="canvas"]').boundingBox(); return [b.x + b.width * fx, b.y + b.height * fy]; }
async function drag(p, a, b) {
  const s = await xy(p, a[0], a[1]), e = await xy(p, b[0], b[1]);
  await p.mouse.move(s[0], s[1]); await p.mouse.down();
  for (let k = 1; k <= 6; k++) await p.mouse.move(s[0] + (e[0] - s[0]) * k / 6, s[1] + (e[1] - s[1]) * k / 6);
  await p.mouse.up(); await L.wait(p, 150);
}
async function tap(p, fx, fy) { const q = await xy(p, fx, fy); await p.mouse.click(q[0], q[1]); await L.wait(p, 120); }

module.exports = async function(t) {
  const g = L.fixtures({ matches: [{ id: 'gf', club_id: L.C, opponent: 'An Tochar', date: '2026-10-20', status: 'final', video_tagged: true, video_enabled: true, video_url: 'https://youtu.be/QyBK5QpmSfw', video_throwin: 5 }] });
  g.tables.playlists = [{ id: 'pl1', club_id: L.C, match_id: 'gf', name: 'Playlist 1', token: null, clips: [{ label: 'Point', video_ts: 20, pre: 6, post: 5 }] }];
  let r = await L.open({ fixtures: g, init: fakeYT, w: 1180, h: 820 }), p = r.page;
  await p.getByText('Game film', { exact: true }).first().click(); await L.wait(p, 1200);
  await L.clickTxt(p, 'Watch'); await L.wait(p, 1200);
  t.ok('game film: a draw button under the video', await p.locator('button[aria-label="Draw"]').count() === 1);
  await p.evaluate(() => { window.__t = 20.4; });
  await p.click('button[aria-label="Draw"]'); await L.wait(p, 300);
  t.ok('draw: the video pauses', (await p.evaluate(() => window.__ytCalls)).slice(-1)[0] === 'pause');
  t.ok('draw: tools and a drawing surface appear', await p.evaluate(() => !!document.querySelector('[data-tele="tools"]') && !!document.querySelector('svg[data-tele="canvas"]')));
  await drag(p, [0.2, 0.6], [0.6, 0.3]);
  await p.click('button[aria-label="Zone"]'); await L.wait(p, 150);
  for (const q of [[0.5, 0.5], [0.8, 0.5], [0.8, 0.8], [0.5, 0.8]]) await tap(p, q[0], q[1]);
  await p.click('button[aria-label="Text"]'); await L.wait(p, 150);
  await tap(p, 0.3, 0.2);
  await p.keyboard.type('Space here'); await p.keyboard.press('Enter'); await L.wait(p, 200);
  t.eq('draw: an arrow, a zone and a label', await shapes(p, 'canvas'), ['arrow', 'zone', 'text']);
  await L.clickTxt(p, '^UNDO$'); await L.wait(p, 150);
  t.eq('draw: undo takes off the last shape', await shapes(p, 'canvas'), ['arrow', 'zone']);
  await p.click('button[aria-label="Ring"]'); await L.wait(p, 150);
  await drag(p, [0.4, 0.7], [0.48, 0.7]);
  await L.shot(p, 'telestration-tools');
  await L.clickTxt(p, '^SAVE TO CLIP$'); await L.wait(p, 400);
  const w = await writes(p), last = w[w.length - 1] || {};
  const d = last.clips && last.clips[0] && last.clips[0].draw;
  t.ok('save: the drawing goes onto the clip covering that moment', d && d.shapes.length === 3 && d.at === 20.4 && d.hold === 4, JSON.stringify(w).slice(0, 300));
  t.ok('save: the clip keeps its lead and tail', last.clips && last.clips[0].pre === 6 && last.clips[0].post === 5);
  t.ok('save: points are kept as fractions of the frame', d && d.shapes.every(s => s.p.every(q => q[0] >= 0 && q[0] <= 1 && q[1] >= 0 && q[1] <= 1)));
  t.eq('save: the drawing stays on show over the video', await shapes(p, 'layer'), ['arrow', 'zone', 'ring']);
  t.ok('save: a message says where it went', /Drawing saved to Playlist 1/.test(await L.text(p)));
  await p.getByText('Playlist 1', { exact: true }).first().click(); await L.wait(p, 300);
  t.ok('playlist: the clip shows its drawing', /Drawing at 0:20/.test(await L.text(p)));
  await p.evaluate(() => { window.__t = 100; });
  await p.click('button[aria-label="Draw"]'); await L.wait(p, 200);
  t.eq('draw again: starts from the drawing on show', await shapes(p, 'canvas'), ['arrow', 'zone', 'ring']);
  const n0 = (await writes(p)).length;
  await L.clickTxt(p, '^SAVE TO CLIP$'); await L.wait(p, 300);
  t.ok('save: no clip at this moment says so and saves nothing', /No playlist clip covers this moment/.test(await L.text(p)) && (await writes(p)).length === n0);
  await L.clickTxt(p, '^CLOSE$'); await L.wait(p, 200);
  await L.clickTxt(p, '^REMOVE$'); await L.wait(p, 300);
  const w2 = await writes(p), l2 = w2[w2.length - 1] || {};
  t.ok('playlist: REMOVE takes the drawing off the clip', l2.clips && l2.clips[0] && !l2.clips[0].draw && l2.clips[0].label === 'Point', JSON.stringify(l2).slice(0, 200));
  t.eq('playlist: a removed drawing leaves the video', await shapes(p, 'layer'), null);
  await L.shot(p, 'telestration');
  t.eq('game film drawing: no page errors', r.errors, []);
  await r.browser.close();

  // A shared link pauses at the drawing, shows it for its hold, then plays on.
  const f = L.fixtures();
  f.rpc.clip_playlist = { name: 'Playlist 1', opponent: 'An Tochar', match_date: '2026-10-20', video_url: 'https://youtu.be/QyBK5QpmSfw',
    clips: [{ label: 'Point', video_ts: 20, pre: 6, post: 5, draw: { at: 22, hold: 1, shapes: [{ k: 'arrow', c: '#F2C14E', p: [[0.2, 0.5], [0.6, 0.3]] }, { k: 'text', c: '#FFFFFF', p: [[0.5, 0.2]], t: 'Run here' }] } }, { label: 'Wide', video_ts: 40 }] };
  r = await L.open({ fixtures: f, hash: '?clips=tok1', init: fakeYT }); p = r.page;
  await L.wait(p, 800);
  await p.evaluate(() => { window.__t = 15; }); await L.wait(p, 500);
  t.eq('shared link: no drawing before its moment', await shapes(p, 'layer'), null);
  t.ok('shared link: a clip with a drawing is marked', /Point ✎/.test(await L.text(p)));
  await p.evaluate(() => { window.__t = 22.2; }); await L.wait(p, 600);
  t.eq('shared link: the drawing shows at its moment', await shapes(p, 'layer'), ['arrow', 'text']);
  const calls = await p.evaluate(() => window.__ytCalls);
  t.ok('shared link: the video pauses on the frame', calls.includes('pause') && calls.includes('seek 22'), JSON.stringify(calls));
  await L.wait(p, 1200);
  t.eq('shared link: after the hold the drawing goes', await shapes(p, 'layer'), null);
  t.eq('shared link: and the clip plays on', (await p.evaluate(() => window.__ytCalls)).slice(-1)[0], 'play');
  await L.wait(p, 600);
  t.eq('shared link: the drawing shows once per play of the clip', await shapes(p, 'layer'), null);
  t.eq('shared link drawing: no page errors', r.errors, []);
  await r.browser.close();
};
