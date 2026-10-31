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
  t.eq('clip bank: slider goes up to 60s', await lead.getAttribute('max'), '60');
  await lead.fill('12'); await lead.blur(); await L.wait(p, 500);
  const w = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists').map(x => x[2]));
  t.ok('clip bank: letting go saves the new lead', w.some(x => x && x.clips && x.clips[0] && x.clips[0].pre === 12), JSON.stringify(w).slice(0, 300));
  t.ok('clip bank: clip length follows', /17s/.test(await L.text(p)));
  t.eq('clip bank: no page errors', r.errors, []);
  await r.browser.close();

  // Video tagger: tick a whole folder, add it to a playlist already made, then reorder.
  const v = L.fixtures({ videoPack: true, matches: [{ id: 'mv', club_id: L.C, opponent: 'Mayo', date: '2026-10-27', status: 'final', video_throwin: 2 }] });
  const sh = (id, ts, oc, pl) => ({ id, match_id: 'mv', club_id: L.C, seq: ts, period: 1, team: 'us', event_type: 'Shot from play', outcome: oc, score: oc === 'Point' ? 1 : 0, player: pl, video_ts: ts, time_text: '00:00:' + String(ts).padStart(2, '0') });
  v.tables.events = [sh('e1', 4, 'Point', 'Sean Murphy'), sh('e2', 8, 'Point', 'Cian Byrne'), sh('e3', 12, 'Wide', 'Sean Murphy'), sh('e4', 16, 'Point', 'Sean Murphy')].concat(v.tables.events);
  v.tables.playlists = [{ id: 'plx', club_id: L.C, match_id: 'mv', name: 'Shooting', token: null, clips: [{ id: 'e3', video_ts: 12, label: 'Shot from play Wide Sean Murphy' }] }];
  r = await L.open({ fixtures: v }); p = r.page;
  await L.videoTagger(p, 'Mayo');
  await L.clickTxt(p, '^Folders$'); await L.wait(p, 300);
  await L.clickTxt(p, 'Playlist$'); await L.wait(p, 300);
  await L.clickTxt(p, 'Shot from play\\s+\\d'); await L.wait(p, 300);
  const cbs = await p.$$('input[aria-label^="Select all"]');
  t.ok('tagger: folders get a select-all box in playlist mode', cbs.length >= 2, String(cbs.length));
  await p.click('input[aria-label="Select all 4"]'); await L.wait(p, 300);
  t.ok('tagger: the folder ticks all 4 clips', /Save 4|Add 4/.test(await L.buttons(p, '(Save|Add) \\d')), await L.buttons(p, '(Save|Add) \\d'));
  await p.selectOption('select[aria-label="Save to"]', '0'); await L.wait(p, 200);
  await L.clickTxt(p, 'Add 4$'); await L.wait(p, 600);
  let pw = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists' && x[1] === 'update').map(x => x[2].clips.map(c => c.id).join(',')));
  t.eq('tagger: added to the end of the existing playlist, no repeats', pw.slice(-1)[0], 'e3,e1,e2,e4');
  t.ok('tagger: says how many were added', /3 clips added to Shooting/.test(await L.text(p)) && /1 already in it/.test(await L.text(p)));
  await p.click('button[aria-label^="Move down: Shot from play Wide"]'); await L.wait(p, 400);
  pw = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists' && x[1] === 'update').map(x => x[2].clips.map(c => c.id).join(',')));
  t.eq('tagger: move down saves the new order', pw.slice(-1)[0], 'e1,e3,e2,e4');
  t.eq('tagger: no page errors', r.errors, []);
  await r.browser.close();
};
