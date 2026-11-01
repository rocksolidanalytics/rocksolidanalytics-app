// Home on a wide screen: tiles in one column, a club panel on the right with slides (last match,
// season, a player, the app, and leaderboards once there are games enough) that change on their
// own; the dots jump between them. Phones and an upright iPad keep the old layout.
const L = require('./lib.js');
module.exports = async function(t) {
  const panel = p => p.evaluate(() => !!document.querySelector('#root .rsa-homepanel'));
  const slide = p => p.evaluate(() => { const s = document.querySelector('#root .rsa-slide'); return s ? s.innerText : ''; });
  let r = await L.open({ fixtures: L.fixtures(), w: 1180, h: 820 }), p = r.page;
  await L.wait(p, 1500);
  t.ok('iPad sideways: the panel is shown', await panel(p));
  t.ok('the banner moves to the panel', await p.evaluate(() => getComputedStyle(document.querySelector('#root .rsa-hw-banner')).display === 'none'));
  const s1 = await slide(p);
  t.ok('first slide: the last match', /LAST MATCH/.test(s1) && /SHOTS FROM PLAY/.test(s1) && /TOP SCORER/.test(s1), s1.slice(0, 200));
  await L.shot(p, 'home_panel_ipad');
  const dots = await p.evaluate(() => [...document.querySelectorAll('#root .rsa-homepanel button[aria-label^="Show "]')].map(b => b.getAttribute('aria-label').slice(5)));
  t.eq('slides in order', dots, ['last match', 'season', 'player spotlight', 'Rock Solid Analytics', 'top scorers', 'work rate']);
  for (const [lab, re] of [['season', /SEASON .* W-D-L/], ['player spotlight', /PLAYER SPOTLIGHT/], ['Rock Solid Analytics', /Match analysis for every GAA club/], ['top scorers', /Top scorers/], ['work rate', /Work rate/]]) {
    await p.click('#root button[aria-label="Show ' + lab + '"]'); await L.wait(p, 300);
    t.ok('dot: ' + lab, re.test(await slide(p)), (await slide(p)).slice(0, 120));
  }
  await L.shot(p, 'home_panel_work');
  await p.evaluate(() => { const b = document.querySelector('#root button[aria-label="Show last match"]'); b.click(); });
  t.ok('a tapped dot pauses the slides', /paused/.test(await L.text(p)));
  await r.browser.close();

  r = await L.open({ fixtures: L.fixtures(), w: 1180, h: 820, init: () => { const si = window.setInterval; window.setInterval = (f, ms) => si(f, ms === 8000 ? 400 : ms); } }); p = r.page;
  await L.wait(p, 1500); const a = await slide(p); await L.wait(p, 900); const b = await slide(p);
  t.ok('the slides change on their own', a !== b);
  t.eq('no page errors (iPad)', r.errors, []);
  await r.browser.close();

  // A club in green and navy, with no turnovers won tagged: navy figures get the white outline,
  // and tackles take the place of turnovers won.
  const f = L.fixtures({ club: { colour_primary: '#34c967', colour_secondary: '#0b1c35' } });
  f.tables.events = f.tables.events.filter(e => e.event_type !== 'Turnover won' && e.event_type !== 'Turnover');
  r = await L.open({ fixtures: f, w: 1180, h: 820 }); p = r.page; await L.wait(p, 1500);
  await p.click('#root button[aria-label="Show season"]'); await L.wait(p, 300);
  const sh = await p.evaluate(() => { const navy = [...document.querySelectorAll('#root .rsa-slide span')].filter(x => /rgb\(11, 28, 53\)/.test(getComputedStyle(x).color)); return navy.length ? [navy.length, getComputedStyle(navy[0]).textShadow] : null; });
  t.ok('navy figures have the white outline', sh && /255, 255, 255/.test(sh[1]), JSON.stringify(sh));
  t.ok('tackles shown when no turnovers won are tagged', /TACKLES/.test(await slide(p)) && !/TURNOVERS WON/.test(await slide(p)), (await slide(p)).slice(0, 400));
  t.eq('no page errors (navy club)', r.errors, []);
  await r.browser.close();

  for (const [w, h, n] of [[390, 844, 'phone'], [820, 1180, 'upright iPad']]) {
    r = await L.open({ fixtures: L.fixtures(), w, h }); p = r.page; await L.wait(p, 1200);
    t.ok(n + ': no panel, banner as before', !(await panel(p)) && /Dashboard/.test(await L.text(p)));
    t.eq(n + ': no page errors', r.errors, []);
    await r.browser.close();
  }
};
