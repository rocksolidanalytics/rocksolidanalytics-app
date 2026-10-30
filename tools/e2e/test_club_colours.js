// Club colours: the frame (Dashboard tile, tabs) takes the club kit, "us" in the stats is the kit
// main colour as it is (a white outline when it is too dark to read), "them" is a colour clearly
// apart from ours and from our second colour, and a club with no colours keeps green and blue.
const L = require('./lib.js');
const hex = rgb => '#' + rgb.match(/\d+/g).slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('');
module.exports = async function(t) {
  async function look(colours) {
    const f = L.fixtures();
    Object.assign(f.tables.clubs[0], colours);
    const r = await L.open({ fixtures: f }), p = r.page;
    const tile = await p.evaluate(() => { const b = [...document.querySelectorAll('#root button')].find(x => /Season stats/.test(x.innerText)); return getComputedStyle(b).backgroundImage; });
    await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 1500);
    await L.clickTxt(p, '^Matches$'); await L.wait(p, 600);
    await p.getByText('Rathnew').first().click(); await L.wait(p, 1500);
    if (!/HEAD TO HEAD/.test(await L.text(p))) { await L.clickTxt(p, '^KEY$'); await L.wait(p, 500); }
    const ink = await p.evaluate(() => {
      const st = el => el ? { c: getComputedStyle(el).color, sh: getComputedStyle(el).textShadow } : null;
      const all = [...document.querySelectorAll('#root div')];
      const us = all.find(d => d.children.length === 0 && /^\d+-\d\d$/.test(d.innerText.trim()));
      const them = all.filter(d => d.children.length === 0 && /^\d+-\d\d$/.test(d.innerText.trim()))[1];
      return { us: st(us), them: st(them) };
    });
    t.eq(colours.name + ': no page errors', r.errors, []);
    await r.browser.close();
    return { tile, us: hex(ink.us.c), usLine: ink.us.sh, them: hex(ink.them.c) };
  }
  const maroon = await look({ name: 'Maroon Test', colour_primary: '#5a1426', colour_secondary: '#ffffff' });
  t.ok('maroon: Dashboard tile in the club colour', /rgb\(90, 20, 38\)/.test(maroon.tile), maroon.tile);
  t.eq('maroon: our score in the kit colour as it is', maroon.us, '#5a1426');
  t.ok('maroon: dark, so it gets a white outline', /255, 255, 255/.test(maroon.usLine), maroon.usLine);
  t.eq('maroon: them in blue', maroon.them, '#4a9eff');
  const wick = await look({ name: 'Wicklow GAA', colour_primary: '#1f4fa0', colour_secondary: '#f7d117' });
  t.eq('wicklow: our score in Wicklow blue', wick.us, '#1f4fa0');
  t.ok('wicklow: them is neither blue nor our gold', !['#4a9eff', '#f0c040'].includes(wick.them), wick.them);
  const green = await look({ name: 'Green Club', colour_primary: '#34c967', colour_secondary: null });
  t.eq('light green: no outline needed', green.usLine, 'none');
  const none = await look({ name: 'No Colours', colour_primary: null, colour_secondary: null });
  t.eq('no colours: green for us', none.us, '#34c967');
  t.eq('no colours: blue for them', none.them, '#4a9eff');
  t.ok('no colours: green Dashboard tile as before', /rgb\(52, 201, 103\)/.test(none.tile), none.tile);
};
