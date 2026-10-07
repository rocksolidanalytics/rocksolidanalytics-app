// node boot_harness.js index.html [shot.png] [width]
// Loads the real page in Chromium with CDN scripts served from local vendor copies and Supabase stubbed offline.
const { dir, req } = require('./resolve');
const { chromium } = req('playwright');
const path = require('path'), fs = require('fs');
const file = path.resolve(process.argv[2]); const shot = process.argv[3]; const width = +(process.argv[4] || 390);
const LOCAL = {
  'react.production.min.js': dir('react') + '/umd/react.production.min.js',
  'react-dom.production.min.js': dir('react-dom') + '/umd/react-dom.production.min.js',
  'supabase-js@2': dir('@supabase/supabase-js') + '/dist/umd/supabase.js',
  'papaparse.min.js': dir('papaparse') + '/papaparse.min.js' };
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 2 });
  const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|supabase|fetch/i.test(m.text())) errs.push('console: ' + m.text()); });
  await pg.route('**/*', r => {
    const u = r.request().url();
    if (u.startsWith('http://app.local/')) { const f = path.join(path.dirname(file), u.slice(17).split('?')[0] || path.basename(file)); return fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404, body: '' }); }
    for (const k in LOCAL) if (u.includes(k)) return r.fulfill({ path: LOCAL[k], contentType: 'application/javascript' });
    if (u.includes('supabase.co')) return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    if (u.includes('fonts.g')) return r.continue();
    return r.abort();
  });
  await pg.goto('http://app.local/' + path.basename(file));
  let ok = false;
  try { await pg.waitForFunction(() => { const r = document.getElementById('root'); return r && r.innerText.trim().length > 20; }, null, { timeout: 15000 }); ok = true; } catch (e) {}
  await pg.waitForTimeout(600);
  if (shot) await pg.screenshot({ path: shot, fullPage: true });
  const blank = await pg.evaluate(() => /Something went wrong|blank/i.test(document.body.innerText));
  await b.close();
  if (ok && !errs.length && !blank) console.log('PASS __RENDER_REACHED__');
  else { console.log('FAIL', ok ? '' : 'root-empty', blank ? 'error-boundary' : '', errs.join(' | ')); process.exitCode = 1; }
})();
