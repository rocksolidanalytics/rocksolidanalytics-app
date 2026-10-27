// Shared helpers for the browser tests in this folder. Everything is synthetic: a made-up club,
// the seeded players from ../fixtures.js, and a generated one-minute test clip (footage.webm).
const fs = require('fs');
const path = require('path');
const { openApp } = require('../page.js');
const { gen, PLAYERS } = require('../fixtures.js');

const APP = path.join(__dirname, '..', '..', 'index.html');
const FOOTAGE = path.join(__dirname, 'footage.webm');
const OUT = path.join(__dirname, 'out');
const C = 'c1';

// The football video event pack, read from the app itself so the tests follow it.
function videoPack(sport) {
  const src = fs.readFileSync(APP, 'utf8');
  const i = src.indexOf('  function videoPack(sport) {'), j = src.indexOf('  function newCE() {', i);
  return new Function(src.slice(i, j) + '; return videoPack;')()(sport);
}

// A signed-in analyst at Ballyvale Gaels (fictional) with three finished league matches.
// extra.matches go in front, so a test match is first in every list.
function fixtures(extra) {
  extra = extra || {};
  const g = gen(20261027);
  const ms = [], evs = [], apps = [];
  ['Rathnew', 'Kiltegan', 'Annacurra'].forEach((opp, k) => { const r = g.mkMatch('f' + (k + 1), opp, 'football', 60, C); r.m.our_score = '0-' + String(r.m.our_total).padStart(2, '0'); r.m.opp_score = '0-' + String(r.m.opp_total).padStart(2, '0'); ms.push(r.m); evs.push(...r.evs); apps.push(...r.apps); });
  const club = Object.assign({ id: C, name: 'Ballyvale Gaels', county: 'Wicklow', sport: 'football', colour_primary: '#0a6b3d', colour_secondary: '#f2c230', verified: true, join_code: 'TEST01' }, extra.club || {});
  if (extra.videoPack) club.custom_events = videoPack('football');
  return { session: { user: { id: 'u1', email: 'coach@example.com' }, access_token: 't' },
    tables: { profiles: [{ id: 'u1', club_id: C, role: 'analyst' }], clubs: [club], matches: (extra.matches || []).concat(ms), events: evs, appearances: apps,
      players: PLAYERS.map((n, i) => ({ id: 'p' + i, club_id: C, name: n })), playlists: [] }, rpc: {} };
}

// Opens the app. o: { fixtures, w, h, init }. Dialogs are accepted and their text kept in r.dialogs.
async function open(o) {
  o = o || {};
  const r = await openApp(APP, { fixtures: o.fixtures || fixtures(), width: o.w || 390, height: o.h || 844, init: o.init });
  r.dialogs = [];
  r.page.on('dialog', d => { r.dialogs.push(d.message()); d.accept(); });
  await r.page.waitForTimeout(1500);
  return r;
}

// Clicks the first button whose text matches the regular expression source re.
const clickTxt = (page, re) => page.evaluate(r => { const b = [...document.querySelectorAll('#root button')].find(b => new RegExp(r).test(b.innerText.trim())); if (!b) throw new Error('no button ' + r); b.click(); }, re);
// Button texts matching re, joined with " | ".
const buttons = (page, re) => page.evaluate(r => [...document.querySelectorAll('#root button')].map(b => b.innerText.trim().replace(/\s+/g, ' ')).filter(t => new RegExp(r).test(t)).join(' | '), re);
const text = page => page.evaluate(() => document.body.innerText);
const wait = (page, ms) => page.waitForTimeout(ms);

// Opens the video tagger on the first match named opp and loads the test clip.
async function videoTagger(page, opp) {
  await page.getByText('Video tagger', { exact: true }).click(); await wait(page, 800);
  await page.getByText(opp).first().click(); await wait(page, 1000);
  const fi = await page.$$('input[type=file]'); await fi[0].setInputFiles(FOOTAGE); await wait(page, 1500);
}
async function seek(page, t) { await page.evaluate(t => { const v = document.querySelector('#root video'); v.pause(); v.currentTime = t; }, t); await wait(page, 400); }

// Stands in for the YouTube IFrame API (the test machine cannot reach YouTube): a video element
// playing the test clip, with the player calls recorded in window.__ytCalls.
async function fakeYouTube(page) {
  await page.route('**/fake-yt.webm', rt => rt.fulfill({ body: fs.readFileSync(FOOTAGE), contentType: 'video/webm' }));
  await page.evaluate(() => {
    window.__ytCalls = [];
    window.YT = { Player: function(host, o) {
      const v = document.createElement('video'); v.src = '/fake-yt.webm'; v.muted = true; v.style.width = '100%'; v.style.height = '100%'; host.appendChild(v);
      let st = -1; const set = s => { st = s; o.events.onStateChange && o.events.onStateChange({ data: s }); };
      v.addEventListener('loadeddata', () => o.events.onReady && o.events.onReady(), { once: true });
      v.addEventListener('play', () => set(1)); v.addEventListener('pause', () => set(2));
      this.playVideo = () => { window.__ytCalls.push('play'); v.play(); }; this.pauseVideo = () => { window.__ytCalls.push('pause'); v.pause(); };
      this.seekTo = t => { window.__ytCalls.push('seek ' + Math.round(t)); v.currentTime = t; };
      this.getCurrentTime = () => v.currentTime; this.getDuration = () => v.duration; this.getPlayerState = () => st;
      this.destroy = () => v.remove(); this.setPlaybackRate = x => { v.playbackRate = x; };
      window.__vid = o.videoId; window.__ytVars = o.playerVars;
    } };
  });
}
// Number of clear tap layers over a YouTube player.
const tapLayers = page => page.evaluate(() => [...document.querySelectorAll('#root div')].filter(d => d.style.zIndex === '2' && d.style.cursor === 'pointer' && d.style.inset).length);

async function shot(page, name) { fs.mkdirSync(OUT, { recursive: true }); await page.screenshot({ path: path.join(OUT, name + '.png') }); }

module.exports = { APP, FOOTAGE, C, fixtures, videoPack, open, clickTxt, buttons, text, wait, videoTagger, seek, fakeYouTube, tapLayers, shot };
