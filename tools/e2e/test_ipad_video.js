// Video tagger on an iPad in landscape: bigger score, labelled top buttons, bigger event labels
// and strip, and every half mark always shown; moving a mark already set asks first.
const L = require('./lib.js');
module.exports = async function(t) {
  const f = L.fixtures({ videoPack: true, matches: [{ id: 'iv', club_id: L.C, opponent: 'Mayo', date: '2026-10-27', status: 'scheduled' }] });
  const r = await L.open({ fixtures: f, w: 1180, h: 820, touch: true }), p = r.page;
  await L.videoTagger(p, 'Mayo');
  t.ok('iPad: the larger video layout is on', await p.evaluate(() => !!document.querySelector('#root .rsa-vtl')));
  t.ok('top buttons are labelled', /Full screen/.test(await L.text(p)) && /Undo last tag/.test(await L.text(p)) && /Tags/.test(await L.text(p)));
  const sz = await p.evaluate(() => ['.rsa-vtl-score', '.rsa-vtl-ev', '.rsa-vtl-strip button'].map(q => parseFloat(getComputedStyle(document.querySelector('#root ' + q)).fontSize)));
  t.ok('score, event labels and strip in large type', sz[0] >= 20 && sz[1] >= 16 && sz[2] >= 16, sz.join(','));
  t.ok('throw-in mark offered first', /Mark throw-in/.test(await L.buttons(p, 'Mark')));
  await L.seek(p, 3); await L.clickTxt(p, 'Mark throw-in$'); await L.wait(p, 300);
  await L.seek(p, 20); await L.clickTxt(p, 'Mark 2nd half$'); await L.wait(p, 300);
  const marks = await L.buttons(p, '^✓ (Throw|2nd)');
  t.ok('both marks stay on show with their times', /✓ Throw-in 00:03/.test(marks) && /✓ 2nd half 00:20/.test(marks), marks);
  await L.shot(p, 'ipad_video_land');
  const dockW = () => p.evaluate(() => { const d = document.querySelector('#root .rsa-vt > div > div[style*="right: 0px"][style*="bottom: 0px"]'); return d ? Math.round(d.getBoundingClientRect().width) : -1; });
  t.ok('tags panel stays shut until asked', !(await p.evaluate(() => !!document.querySelector('#root .rsa-vtl-dock'))));
  await L.clickTxt(p, 'Tags$'); await L.wait(p, 500);
  t.ok('tags panel opens wide', await p.evaluate(() => { const d = document.querySelector('#root .rsa-vtl-dock'); return d && d.getBoundingClientRect().width >= 500; }));
  await L.shot(p, 'ipad_video_tags');
  await p.evaluate(() => { const b = [...document.querySelectorAll('#root .rsa-vtl-dock button')].find(x => /✕|Close|›/.test(x.innerText.trim())); if (b) b.click(); }); await L.wait(p, 400);
  await L.seek(p, 5); await L.clickTxt(p, '^✓ Throw-in'); await L.wait(p, 300);
  t.ok('moving a mark asks first', r.dialogs.some(d => /Move the throw-in mark from 00:03 to 00:05/.test(d)), r.dialogs.join(' | '));
  t.ok('and then moves it', /✓ Throw-in 00:05/.test(await L.buttons(p, '^✓ Throw')));
  // The pitch step: all of the pitch above the strip.
  await L.seek(p, 25); await L.clickTxt(p, '^SHOT$'); await L.wait(p, 500);
  const fit = await p.evaluate(() => { const box = document.querySelector('#root .rsa-vtl-pitch'), strip = document.querySelector('#root .rsa-vtl-strip'); if (!box || !strip) return null; const svg = [...box.querySelectorAll('svg')].sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0]; return { pitchBottom: Math.round(svg.getBoundingClientRect().bottom), boxBottom: Math.round(box.getBoundingClientRect().bottom), stripTop: Math.round(strip.getBoundingClientRect().top), top: Math.round(box.getBoundingClientRect().top) }; });
  t.ok('pitch sits wholly above the strip and below the top', fit && fit.boxBottom <= fit.stripTop && fit.pitchBottom <= fit.stripTop && fit.top >= 0, JSON.stringify(fit));
  await L.shot(p, 'ipad_video_pitch');
  t.eq('iPad: no page errors', r.errors, []);
  await r.browser.close();
  const dsk = await L.open({ fixtures: f, w: 1440, h: 900 });
  await L.videoTagger(dsk.page, 'Mayo');
  t.ok('computer, wide window: the larger video layout', await dsk.page.evaluate(() => !!document.querySelector('#root .rsa-vtl')));
  await L.shot(dsk.page, 'desktop_video');
  t.eq('computer: no page errors', dsk.errors, []);
  await dsk.browser.close();
  const q = await L.open({ fixtures: f, w: 844, h: 390, touch: true });
  await L.videoTagger(q.page, 'Mayo');
  t.ok('phone landscape: no iPad layout', !(await q.page.evaluate(() => !!document.querySelector('#root .rsa-vtl'))));
  t.eq('phone: no page errors', q.errors, []);
  await q.browser.close();
};
