// Club colours: the frame (Dashboard tile, tabs) takes the club kit, "us" in the stats is the kit
// main colour as it is (a white outline when it is too dark to read), "them" is our second kit
// colour when it is clearly apart from the main one, and a club with no colours keeps green and blue.
const L = require('./lib.js');
const hex = rgb => '#' + rgb.match(/\d+/g).slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join('');
module.exports = async function(t) {
  async function look(colours) {
    const f = L.fixtures();
    Object.assign(f.tables.clubs[0], colours);
    const r = await L.open({ fixtures: f }), p = r.page;
    const tile = await p.evaluate(() => { const b = [...document.querySelectorAll('#root button')].find(x => /Season stats/.test(x.innerText)); return getComputedStyle(b).backgroundImage; });
    await p.getByText('Dashboard', { exact: true }).first().click(); await L.wait(p, 1500);
    // The season head to head: the first pair of bars, ours and theirs.
    const ring = await p.evaluate(() => [...document.querySelectorAll('#root div')].filter(d => d.children.length === 0 && /%$/.test(d.style.width) && d.style.background && d.style.height === '').slice(0, 2).map(b => getComputedStyle(b).boxShadow));
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
    return { tile, us: hex(ink.us.c), usLine: ink.us.sh, them: hex(ink.them.c), themLine: ink.them.sh, ring };
  }
  const maroon = await look({ name: 'Maroon Test', colour_primary: '#5a1426', colour_secondary: '#ffffff' });
  t.ok('maroon: Dashboard tile in the club colour', /rgb\(90, 20, 38\)/.test(maroon.tile), maroon.tile);
  t.eq('maroon: our score in the kit colour as it is', maroon.us, '#5a1426');
  t.ok('maroon: dark, so it gets a white outline', /255, 255, 255/.test(maroon.usLine), maroon.usLine);
  t.eq('maroon: them in our second colour, white', maroon.them, '#ffffff');
  t.ok('maroon: both head-to-head bars ringed, not just ours', maroon.ring.length === 2 && maroon.ring.every(r => /255, 255, 255/.test(r)), JSON.stringify(maroon.ring));
  t.eq('maroon: white them text has no outline', maroon.themLine, 'none');
  const wick = await look({ name: 'Wicklow GAA', colour_primary: '#1f4fa0', colour_secondary: '#f7d117' });
  t.eq('wicklow: our score in Wicklow blue', wick.us, '#1f4fa0');
  t.eq('wicklow: them in Wicklow gold', wick.them, '#f7d117');
  const navy = await look({ name: 'Navy Second', colour_primary: '#d32f2f', colour_secondary: '#0b1c35' });
  t.eq('red and navy: them in navy', navy.them, '#0b1c35');
  t.ok('red and navy: navy is dark, so them gets the outline', /255, 255, 255/.test(navy.themLine), navy.themLine);
  const same = await look({ name: 'Two Blues', colour_primary: '#1f4fa0', colour_secondary: '#4a9eff' });
  t.ok('two blues: a second colour too close is not used', !['#4a9eff', '#1f4fa0'].includes(same.them), same.them);
  const green = await look({ name: 'Green Club', colour_primary: '#34c967', colour_secondary: null });
  t.eq('light green: no outline needed', green.usLine, 'none');
  t.ok('light green: bars without rings', green.ring.every(r => r === 'none'), JSON.stringify(green.ring));
  const none = await look({ name: 'No Colours', colour_primary: null, colour_secondary: null });
  t.eq('no colours: green for us', none.us, '#34c967');
  t.eq('no colours: blue for them', none.them, '#4a9eff');
  t.ok('no colours: green Dashboard tile as before', /rgb\(52, 201, 103\)/.test(none.tile), none.tile);
};
