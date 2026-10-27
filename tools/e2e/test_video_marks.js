// Video tagger marks: a mark per period, + Extra time, the shootout button, video time to match
// clock, and marks saved on the match used by another device.
const L = require('./lib.js');
const hdr = page => page.evaluate(() => (document.body.innerText.match(/(\d{2}:\d{2})\n([A-Z0-9 ]*(?:HALF|PERIOD))/) || ['none'])[0].replace(/\n/g, ' '));
const marks = page => L.buttons(page, 'Mark|✓ (Throw|2nd|3rd|Extra|ET)|Extra time|Penalt');
const M = (o) => [Object.assign({ id: 'mv', club_id: L.C, opponent: 'Mayo', date: '2026-10-27', status: 'scheduled' }, o)];
module.exports = async function(t) {
  // 35 minutes with extra time, phone portrait
  let r = await L.open({ fixtures: L.fixtures({ videoPack: true, matches: M({ half_mins: 35 }) }) }), p = r.page;
  await L.videoTagger(p, 'Mayo');
  t.eq('35: marks before starting', await marks(p), '⚑ Mark throw-in | ⚑ Mark 2nd half');
  for (const [s, b] of [[2, 'Mark throw-in'], [10, 'Mark 2nd half'], [null, '^\\+ Extra time$'], [20, 'Mark extra time'], [26, 'Mark ET 2nd half']]) { if (s != null) await L.seek(p, s); await L.clickTxt(p, b); await L.wait(p, 250); }
  t.eq('35: all marks set, shootout offered', await marks(p), '✓ Throw-in 00:02 | ✓ 2nd half 00:10 | ✓ Extra time 00:20 | ✓ ET 2nd half 00:26 | Penalty shootout');
  await L.seek(p, 25); await L.wait(p, 300);
  t.eq('35: 5s into ET reads 70:05', await hdr(p), '70:05 ET 1ST HALF');
  await L.seek(p, 15); await L.wait(p, 300);
  t.eq('35: 5s into the 2nd half reads 35:05', await hdr(p), '35:05 2ND HALF');
  await L.clickTxt(p, '^Penalty shootout$'); await L.wait(p, 400);
  t.ok('35: shootout opens over the video', /PENALTY SHOOTOUT/.test(await L.text(p)));
  await p.click('button[aria-label=Back]'); await L.wait(p, 300);
  t.ok('35: video still loaded after closing it', !!(await p.$('#root video')));
  t.eq('35: no page errors', r.errors, []);
  await r.browser.close();

  // 3 x 20, iPad landscape: the strip offers the next mark until all three are set
  r = await L.open({ fixtures: L.fixtures({ videoPack: true, matches: M({ half_mins: 20, periods: 3 }) }), w: 1180, h: 820 }); p = r.page;
  await L.videoTagger(p, 'Mayo');
  for (const [s, b] of [[2, 'Mark throw-in'], [10, 'Mark 2nd period'], [20, 'Mark 3rd period']]) { await L.seek(p, s); await L.clickTxt(p, b); await L.wait(p, 250); }
  t.ok('3x20: no mark left to offer', !/Mark/.test(await L.buttons(p, 'Mark')), await L.buttons(p, 'Mark'));
  await L.seek(p, 23); await L.wait(p, 300);
  t.ok('3x20: 3s into period 3 reads P3 40:03', /P3 40:03/.test(await L.text(p)));
  t.eq('3x20: no page errors', r.errors, []);
  await r.browser.close();

  // Another device: no marks saved here, so the ones on the match are used
  r = await L.open({ fixtures: L.fixtures({ videoPack: true, matches: M({ half_mins: 35, extra_time: true, video_throwin: 2, video_halfstart: 10, period_marks: { 3: { video_start: 20, added_secs: 30 } } }) }) }); p = r.page;
  await L.videoTagger(p, 'Mayo');
  t.eq('other device: marks come from the match', await marks(p), '✓ Throw-in 00:02 | ✓ 2nd half 00:10 | ✓ Extra time 00:20 | ⚑ Mark ET 2nd half');
  await L.seek(p, 25); await L.wait(p, 300);
  t.eq('other device: ET clock from those marks', await hdr(p), '70:05 ET 1ST HALF');
  await r.browser.close();

  // This device has its own marks: they win
  r = await L.open({ fixtures: L.fixtures({ videoPack: true, matches: M({ half_mins: 35, video_throwin: 2, video_halfstart: 10 }) }), init: () => localStorage.setItem('rsa_vsync_mv', JSON.stringify({ throwIn: 1, halfStart: 12 })) }); p = r.page;
  await L.videoTagger(p, 'Mayo');
  t.eq('this device: own marks kept', await marks(p), '✓ Throw-in 00:01 | ✓ 2nd half 00:12 | + Extra time');
  await r.browser.close();
};
