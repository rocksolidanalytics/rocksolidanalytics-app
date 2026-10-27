// Live tagger: a 30-minute game runs as before; a 35-minute championship game goes to extra time
// and the clock reads on past 60 minutes.
const L = require('./lib.js');
const session = (id, s) => new Function('localStorage.setItem("rsa_active", JSON.stringify({ matchId: "' + id + '", clubId: null, ts: Date.now() })); localStorage.setItem("rsa_sess_' + id + '", JSON.stringify(Object.assign(' + JSON.stringify(s) + ', { anchor: Date.now(), savedAt: Date.now() })));');
const clock = page => page.evaluate(() => { const m = document.body.innerText.match(/(\d{2}:\d{2})\n((?:ET )?\d\w\w HALF)/); return m ? m[1] + ' ' + m[2] : 'none'; });
module.exports = async function(t) {
  let r = await L.open({ fixtures: L.fixtures({ matches: [{ id: 'm30', club_id: L.C, opponent: 'Lucan', date: '2026-10-27', status: 'scheduled', competition: 'League', attack_up: true }] }), init: session('m30', { clockBase: 1500, running: true, period: 1, halfEnded: false }) });
  let p = r.page;
  t.ok('30 min: 1st half clock about 25:00', /^25:0\d 1ST HALF$/.test(await clock(p)), await clock(p));
  t.eq('30 min: buttons in the 1st half', await L.buttons(p, 'END|START|EXTRA|PENAL'), 'END 1ST HALF');
  await L.clickTxt(p, '^END 1ST HALF$'); await L.wait(p, 300);
  await L.clickTxt(p, '^START 2ND HALF$'); await L.wait(p, 1200);
  t.ok('30 min: 2nd half starts at 30:00', /^30:0\d 2ND HALF$/.test(await clock(p)), await clock(p));
  t.eq('30 min: no extra time button early in the 2nd half', await L.buttons(p, 'END|START|EXTRA|PENAL'), 'END MATCH');
  t.eq('30 min: no page errors', r.errors, []);
  await r.browser.close();

  r = await L.open({ fixtures: L.fixtures({ matches: [{ id: 'm35', club_id: L.C, opponent: 'Mayo', date: '2026-10-27', status: 'scheduled', competition: 'Championship', half_mins: 35, attack_up: true }] }), init: session('m35', { clockBase: 2110, running: false, period: 2, halfEnded: false }) });
  p = r.page;
  t.eq('35 min: end of the 2nd half offers extra time', await L.buttons(p, 'END|START|EXTRA|PENAL'), 'END MATCH | EXTRA TIME');
  await L.clickTxt(p, '^EXTRA TIME$'); await L.wait(p, 300);
  t.ok('35 min: extra time is confirmed first', /two 10-minute halves/.test(r.dialogs.join(' ')), r.dialogs.join(' / '));
  await L.clickTxt(p, '^START EXTRA TIME$'); await L.wait(p, 1200);
  t.ok('35 min: ET 1st half starts at 70:00', /^70:0\d ET 1ST HALF$/.test(await clock(p)), await clock(p));
  await L.clickTxt(p, '^END ET 1ST HALF$'); await L.wait(p, 300);
  await L.clickTxt(p, '^START ET 2ND HALF$'); await L.wait(p, 1200);
  t.ok('35 min: ET 2nd half starts at 80:00', /^80:0\d ET 2ND HALF$/.test(await clock(p)), await clock(p));
  t.eq('35 min: level at the end of ET offers penalties', await L.buttons(p, 'END|START|EXTRA|PENAL'), 'END MATCH | PENALTIES');
  t.eq('35 min: no page errors', r.errors, []);
  await r.browser.close();
};
