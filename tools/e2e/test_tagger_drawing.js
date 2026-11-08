// Drawing in the Video tagger: draw on the paused video, save it on the playlist clip covering
// that moment, view and remove it from the playlist, and export the clip with it burned in.
const L = require('./lib.js');
const writes = p => p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists').map(x => x[2]));
async function xy(p, fx, fy) { const b = await p.locator('svg[data-tele="canvas"]').boundingBox(); return [b.x + b.width * fx, b.y + b.height * fy]; }
async function drag(p, a, b) {
  const s = await xy(p, a[0], a[1]), e = await xy(p, b[0], b[1]);
  await p.mouse.move(s[0], s[1]); await p.mouse.down();
  for (let k = 1; k <= 6; k++) await p.mouse.move(s[0] + (e[0] - s[0]) * k / 6, s[1] + (e[1] - s[1]) * k / 6);
  await p.mouse.up(); await L.wait(p, 150);
}

module.exports = async function(t) {
  const v = L.fixtures({ videoPack: true, matches: [{ id: 'mv', club_id: L.C, opponent: 'Mayo', date: '2026-10-27', status: 'final', video_throwin: 2 }] });
  v.tables.playlists = [{ id: 'plx', club_id: L.C, match_id: 'mv', name: 'Shooting', token: null, clips: [{ id: 'e3', video_ts: 12, pre: 1, post: 1, label: 'Shot from play Wide Sean Murphy' }] }];
  // Counts canvas strokes of a Path2D (only the drawing painter strokes paths that way).
  const r = await L.open({ fixtures: v, init: () => { window.__paths = 0; const o = CanvasRenderingContext2D.prototype.stroke; CanvasRenderingContext2D.prototype.stroke = function(a) { if (a) window.__paths++; return o.apply(this, arguments); }; } }), p = r.page;
  await L.videoTagger(p, 'Mayo');
  await L.seek(p, 12.3);
  t.eq('tagger: a draw button by the video controls', await p.locator('button[aria-label="Draw"]').count(), 1);
  await p.click('button[aria-label="Draw"]'); await L.wait(p, 500);
  t.ok('draw: the video is paused', await p.evaluate(() => document.querySelector('#root video').paused));
  const box = await p.evaluate(() => { const l = document.querySelector('[data-vt-tele]').getBoundingClientRect(), vv = document.querySelector('#root video'), b = vv.getBoundingClientRect(); return { lw: l.width, lh: l.height, ratio: vv.videoWidth / vv.videoHeight, inside: l.left >= b.left - 1 && l.right <= b.right + 1 && l.top >= b.top - 1 && l.bottom <= b.bottom + 1 }; });
  t.ok('draw: the layer covers the picture, at its shape', box.inside && Math.abs(box.lw / box.lh - box.ratio) < 0.02, JSON.stringify(box));
  t.ok('draw: tools along the bottom', await p.evaluate(() => !!document.querySelector('.rsa-vt-tele [data-tele="tools"]')));
  await drag(p, [0.2, 0.6], [0.6, 0.3]);
  await p.click('button[aria-label="Run"]'); await L.wait(p, 100);
  await drag(p, [0.3, 0.8], [0.7, 0.7]);
  await L.clickTxt(p, '^SAVE TO CLIP$'); await L.wait(p, 400);
  const w = await writes(p), last = w[w.length - 1] || {};
  const d = last.clips && last.clips[0] && last.clips[0].draw;
  t.ok('save: the drawing goes onto the clip', d && d.shapes.length === 2 && d.shapes[1].k === 'run' && Math.abs(d.at - 12.3) < 0.15, JSON.stringify(w).slice(0, 300));
  t.ok('save: the drawing stays on show', await p.evaluate(() => document.querySelectorAll('[data-vt-tele="show"] g[data-shape]').length) === 2);
  await p.evaluate(() => document.querySelector('#root video').play()); await L.wait(p, 400);
  t.eq('play: the drawing goes', await p.evaluate(() => document.querySelectorAll('[data-vt-tele]').length), 0);
  await p.evaluate(() => document.querySelector('#root video').pause());
  await p.click('button[title="Edit clip lengths and notes"]'); await L.wait(p, 400);
  t.ok('playlist: the clip shows its drawing', /Drawing at 0:12/.test(await L.text(p)));
  await L.clickTxt(p, '^VIEW$'); await L.wait(p, 500);
  t.ok('playlist: VIEW shows it over the video', await p.evaluate(() => document.querySelectorAll('[data-vt-tele="show"] g[data-shape]').length) === 2);
  // Export: the clip holds on its drawing with the shapes painted into the video.
  await p.click('button[title="Edit clip lengths and notes"]'); await L.wait(p, 400);
  await L.clickTxt(p, 'Export clips'); await L.wait(p, 6500);
  t.ok('export: finishes with a file to save', /^SAVE$/.test(await L.buttons(p, '^SAVE$')), await L.buttons(p, '.'));
  t.ok('export: the drawing is painted into the exported video', await p.evaluate(() => window.__paths) > 10, String(await p.evaluate(() => window.__paths)));
  await L.clickTxt(p, '^SAVE$'); await L.wait(p, 300);
  await p.click('button[title="Edit clip lengths and notes"]').catch(() => {}); await L.wait(p, 400);
  await L.clickTxt(p, '^REMOVE$'); await L.wait(p, 400);
  const w2 = await writes(p), l2 = w2[w2.length - 1] || {};
  t.ok('playlist: REMOVE takes the drawing off', l2.clips && l2.clips[0] && !l2.clips[0].draw && l2.clips[0].id === 'e3', JSON.stringify(l2).slice(0, 200));
  t.eq('tagger drawing: no page errors', r.errors, []);
  await r.browser.close();

  // Phone on its side: the drawing tools sit in one strip along the bottom.
  const r2 = await L.open({ fixtures: v, w: 915, h: 412 }), p2 = r2.page;
  await L.videoTagger(p2, 'Mayo');
  await L.seek(p2, 12.3);
  await p2.locator('button[aria-label="Draw"]').first().click(); await L.wait(p2, 500);
  const hgt = await p2.evaluate(() => document.querySelector('.rsa-vt-tele').getBoundingClientRect().height);
  t.ok('landscape: the drawing tools take one strip', hgt <= 70, String(hgt));
  await L.shot(p2, 'tagger-drawing-land');
  t.eq('landscape tagger drawing: no page errors', r2.errors, []);
  await r2.browser.close();
};
