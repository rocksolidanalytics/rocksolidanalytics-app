// Shared clip links play without the YouTube bar (it flashed over the start of every clip), with
// a tap layer and a PLAY / PAUSE button; lead and tail are sliders that save when let go.
const L = require('./lib.js');
// A stand-in YouTube player that exists before the page builds its own, with no real video.
const fakeYT = () => {
  window.__ytCalls = [];
  window.YT = { Player: function(host, o) {
    let st = -1; const set = s => { st = s; o.events.onStateChange && o.events.onStateChange({ data: s }); };
    window.__ytVars = o.playerVars; window.__vid = o.videoId;
    this.playVideo = () => { window.__ytCalls.push('play'); set(1); }; this.pauseVideo = () => { window.__ytCalls.push('pause'); set(2); };
    this.seekTo = t => { window.__ytCalls.push('seek ' + Math.round(t)); };
    this.loadVideoById = o => { window.__ytCalls.push('load ' + o.videoId + ' ' + Math.round(o.startSeconds)); };
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
  await p.selectOption('select[aria-label="Save to"]', 'm:0'); await L.wait(p, 200);
  await L.clickTxt(p, 'Add 4$'); await L.wait(p, 600);
  let pw = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists' && x[1] === 'update').map(x => x[2].clips.map(c => c.id).join(',')));
  t.eq('tagger: added to the end of the existing playlist, no repeats', pw.slice(-1)[0], 'e3,e1,e2,e4');
  t.ok('tagger: says how many were added', /3 clips added to Shooting/.test(await L.text(p)) && /1 already in it/.test(await L.text(p)));
  await p.click('button[aria-label^="Move down: Shot from play Wide"]'); await L.wait(p, 400);
  pw = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists' && x[1] === 'update').map(x => x[2].clips.map(c => c.id).join(',')));
  t.eq('tagger: move down saves the new order', pw.slice(-1)[0], 'e1,e3,e2,e4');
  t.eq('tagger: no page errors', r.errors, []);
  await r.browser.close();

  // Across games: a new playlist from Mayo, then clips from Kerry added to it in the Kerry tagger.
  const two = () => { const x = L.fixtures({ videoPack: true, matches: [{ id: 'mv', club_id: L.C, opponent: 'Mayo', date: '2026-10-27', status: 'final', video_throwin: 2 }, { id: 'mk', club_id: L.C, opponent: 'Kerry', date: '2026-10-20', status: 'final', video_throwin: 2 }] });
    x.tables.events = [sh('e1', 4, 'Point', 'Sean Murphy'), sh('e2', 8, 'Point', 'Cian Byrne'), Object.assign(sh('k1', 6, 'Wide', 'Sean Murphy'), { match_id: 'mk' })].concat(x.tables.events); return x; };
  r = await L.open({ fixtures: two() }); p = r.page;
  await L.videoTagger(p, 'Mayo');
  await L.clickTxt(p, '^Folders$'); await L.clickTxt(p, 'Playlist$'); await L.wait(p, 300);
  await p.click('input[aria-label="Select all 2"]'); await L.wait(p, 200);
  await p.selectOption('select[aria-label="Save to"]', 'mix'); await p.fill('input[placeholder="Playlist name"]', 'Shots this season');
  await L.clickTxt(p, 'Save 2$'); await L.wait(p, 600);
  const ins = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists' && x[1] === 'insert').map(x => x[2]));
  t.ok('across games: saved with no match of its own', ins.length === 1 && ins[0].match_id === null && ins[0].name === 'Shots this season', JSON.stringify(ins));
  t.ok('across games: each clip names its match', ins[0] && ins[0].clips.every(c => c.match_id === 'mv'));
  t.eq('across games: no page errors (Mayo)', r.errors, []);
  await r.browser.close();
  const k = two(); k.tables.playlists = [{ id: 'mix1', club_id: L.C, match_id: null, name: 'Shots this season', token: null, clips: [{ id: 'e1', video_ts: 4, match_id: 'mv', label: 'Shot from play Point Sean Murphy' }] }];
  r = await L.open({ fixtures: k }); p = r.page;
  await L.videoTagger(p, 'Kerry');
  await L.clickTxt(p, '^Folders$'); await L.clickTxt(p, 'Playlist$'); await L.wait(p, 300);
  await p.click('input[aria-label="Select all 1"]'); await L.wait(p, 200);
  const opts = await p.evaluate(() => [...document.querySelectorAll('select[aria-label="Save to"] option')].map(o => o.textContent));
  t.ok('across games: offered in another game', opts.includes('Add to Shots this season (across games)'), opts.join(' | '));
  await p.selectOption('select[aria-label="Save to"]', 'x:0'); await L.clickTxt(p, 'Add 1$'); await L.wait(p, 600);
  const up = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists' && x[1] === 'update').map(x => x[2].clips.map(c => c.id + '@' + c.match_id).join(',')));
  t.eq('across games: Kerry clip added after the Mayo one', up.slice(-1)[0], 'e1@mv,k1@mk');
  t.eq('across games: no page errors (Kerry)', r.errors, []);
  await r.browser.close();

  // One playlist per player: select all, split by player; a second run tops up instead of copying.
  r = await L.open({ fixtures: v }); p = r.page;
  await L.videoTagger(p, 'Mayo');
  await L.clickTxt(p, '^Folders$'); await L.clickTxt(p, 'Playlist$'); await L.wait(p, 300);
  t.ok('per player: a select-all box over the folders', /SELECT ALL CLIPS · 4/.test(await L.text(p)));
  await p.click('input[aria-label="Select all 4"]'); await L.wait(p, 200);
  await p.selectOption('select[aria-label="Save to"]', 'pp'); await L.clickTxt(p, 'Save 4$'); await L.wait(p, 600);
  let pi = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists' && x[1] === 'insert').map(x => x[2]));
  t.eq('per player: one playlist each, named with the opponent', pi.length === 1 ? pi[0].map(x => x.name + ':' + x.clips.map(c => c.id).join('+')).join(' | ') : JSON.stringify(pi), 'Cian Byrne · v Mayo:e2 | Sean Murphy · v Mayo:e1+e3+e4');
  t.ok('per player: says how many were made', /2 player playlists made/.test(await L.text(p)));
  t.eq('per player: no page errors', r.errors, []);
  await r.browser.close();
  const v2 = JSON.parse(JSON.stringify(v)); v2.tables.playlists = [{ id: 'sm', club_id: L.C, match_id: 'mv', name: 'Sean Murphy · v Mayo', token: null, clips: [{ id: 'e1', video_ts: 4, label: 'x' }] }];
  r = await L.open({ fixtures: v2 }); p = r.page;
  await L.videoTagger(p, 'Mayo');
  await L.clickTxt(p, '^Folders$'); await L.clickTxt(p, 'Playlist$'); await L.wait(p, 300);
  await p.click('input[aria-label="Select all 4"]'); await L.wait(p, 200);
  await p.selectOption('select[aria-label="Save to"]', 'pp'); await L.clickTxt(p, 'Save 4$'); await L.wait(p, 600);
  const w2 = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists').map(x => x[1] + ':' + (Array.isArray(x[2]) ? x[2].map(y => y.name).join('+') : x[2].clips.map(c => c.id).join('+'))));
  t.eq('per player: second run tops up Sean and makes Cian', w2.join(' | '), 'update:e1+e3+e4 | insert:Cian Byrne · v Mayo');
  t.eq('per player: no page errors (second run)', r.errors, []);
  await r.browser.close();

  // Clip lengths by event: set Shot from play to a 12s lead, new clips take it, and an older
  // playlist (clips with no event saved) picks it up from the button.
  const v3 = JSON.parse(JSON.stringify(v)); v3.tables.playlists[0].clips = [{ id: 'e3', video_ts: 12, label: 'Shot from play Wide Sean Murphy' }];
  r = await L.open({ fixtures: v3 }); p = r.page;
  await L.videoTagger(p, 'Mayo');
  await L.clickTxt(p, '^Folders$'); await L.clickTxt(p, 'Playlist$'); await L.wait(p, 300);
  await L.clickTxt(p, 'Clip lengths$'); await L.wait(p, 300);
  t.ok('lengths: the sheet lists the event types tagged', /Clip lengths by event/.test(await L.text(p)) && /Shot from play/.test(await L.text(p)));
  const sl = p.locator('input[aria-label="lead seconds"]').first(); await sl.fill('12'); await sl.blur(); await L.wait(p, 500);
  const cw = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'clubs').map(x => x[2].tag_settings && x[2].tag_settings.clipSpans));
  t.eq('lengths: saved in the club settings', JSON.stringify(cw.slice(-1)[0]), '{"Shot from play":{"pre":12,"post":5}}');
  await p.click('button[aria-label=Back]'); await L.wait(p, 300);
  await p.click('input[aria-label="Select all 4"]'); await L.wait(p, 200);
  await p.fill('input[placeholder="Playlist name"]', 'Shots'); await L.clickTxt(p, 'Save 4$'); await L.wait(p, 600);
  const ni = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists' && x[1] === 'insert').map(x => x[2].clips.map(c => c.ev + ':' + c.pre + '/' + c.post).join(',')));
  t.eq('lengths: new clips take the event length', ni.slice(-1)[0], 'Shot from play:12/5,Shot from play:12/5,Shot from play:12/5,Shot from play:12/5');
  t.eq('lengths: no page errors', r.errors, []);
  await r.browser.close();
  v3.tables.clubs[0].tag_settings = Object.assign({}, v3.tables.clubs[0].tag_settings || {}, { clipSpans: { 'Shot from play': { pre: 12, post: 5 } } });
  r = await L.open({ fixtures: v3 }); p = r.page;
  await L.videoTagger(p, 'Mayo');
  await p.click('button[title="Edit clip lengths and notes"]'); await L.wait(p, 400);
  await L.clickTxt(p, 'Use the event lengths on every clip'); await L.wait(p, 400);
  const uw = await p.evaluate(() => (window.__rsaWrites || []).filter(x => x[0] === 'playlists' && x[1] === 'update').map(x => x[2].clips.map(c => c.id + ':' + c.pre).join(',')));
  t.eq('lengths: an older playlist picks them up from its labels', uw.slice(-1)[0], 'e3:12');
  t.eq('lengths: no page errors (older playlist)', r.errors, []);
  await r.browser.close();

  // Clip bank: its own group, each clip says which game.
  k.tables.playlists[0].clips.push({ id: 'k1', video_ts: 6, match_id: 'mk', label: 'Shot from play Wide Sean Murphy' });
  r = await L.open({ fixtures: k }); p = r.page;
  await p.getByText('Game film', { exact: true }).first().click(); await L.wait(p, 1200);
  await p.getByText('Clip bank').first().click(); await L.wait(p, 500);
  await p.getByText('Shots this season').first().click(); await L.wait(p, 500);
  let tx = await L.text(p);
  t.ok('clip bank: an Across games group', /ACROSS GAMES/.test(tx));
  t.ok('clip bank: each clip names its game', /v Mayo · 2026-10-27/.test(tx) && /v Kerry · 2026-10-20/.test(tx));
  t.eq('clip bank: no page errors (across games)', r.errors, []);
  await r.browser.close();

  // Shared link across games: the next clip from another game loads that video at its start.
  const sf = L.fixtures();
  sf.rpc.clip_playlist = { name: 'Shots this season', clips: [{ id: 'e1', video_ts: 20, match_id: 'mv', label: 'Point' }, { id: 'k1', video_ts: 40, match_id: 'mk', label: 'Wide' }, { id: 'zz', video_ts: 9, match_id: 'gone', label: 'Gone' }],
    videos: { mv: { video_url: 'https://youtu.be/AAAAAAAAAAA', opponent: 'Mayo', date: '2026-10-27' }, mk: { video_url: 'https://youtu.be/BBBBBBBBBBB', opponent: 'Kerry', date: '2026-10-20' } } };
  r = await L.open({ fixtures: sf, hash: '?clips=tok2', init: fakeYT }); p = r.page;
  await L.wait(p, 800);
  tx = await L.text(p);
  t.ok('shared across games: header and games named', /Across games · 2 clips/.test(tx) && /v Mayo · 0:14/.test(tx) && /v Kerry · 0:34/.test(tx), tx.slice(0, 300));
  t.eq('shared across games: starts on the first game video', await p.evaluate(() => window.__vid), 'AAAAAAAAAAA');
  await L.clickTxt(p, 'NEXT'); await L.wait(p, 300);
  t.eq('shared across games: next clip loads the Kerry video at its start', (await p.evaluate(() => window.__ytCalls)).slice(-1)[0], 'load BBBBBBBBBBB 34');
  t.eq('shared across games: no page errors', r.errors, []);
  await r.browser.close();
};
