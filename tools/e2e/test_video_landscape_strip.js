// Video tagger in landscape: the strip shows the next mark and a Save button from the start.
const L = require('./lib.js');
module.exports = async function(t) {
  for (const [w, h, n] of [[1180, 820, 'iPad'], [844, 390, 'phone'], [740, 360, 'small phone']]) {
    const r = await L.open({ fixtures: L.fixtures({ videoPack: true, matches: [{ id: 'ls', club_id: L.C, opponent: 'Mayo', date: '2026-10-27', status: 'scheduled' }] }), w, h }), p = r.page;
    await L.videoTagger(p, 'Mayo');
    t.ok(n + ': throw-in mark and Save in view at the start', /Mark throw-in/.test(await L.buttons(p, 'Mark')) && /Save/.test(await L.buttons(p, 'Save')), await L.buttons(p, 'Mark|Save'));
    const off = await p.evaluate(() => [...document.querySelectorAll('#root button')].filter(b => b.offsetParent && b.closest('div[style*="top: 58px"]')).filter(b => b.getBoundingClientRect().bottom > innerHeight + 1).map(b => b.innerText.trim()));
    t.eq(n + ': every event button on screen', off, []);
    await L.seek(p, 3); await L.clickTxt(p, 'Mark throw-in'); await L.wait(p, 300);
    t.ok(n + ': then the 2nd half mark', /Mark 2nd half/.test(await L.buttons(p, 'Mark')), await L.buttons(p, 'Mark'));
    t.eq(n + ': no page errors', r.errors, []);
    await L.shot(p, 'strip_' + n);
    await r.browser.close();
  }
};
