// openApp(file, { fixtures, hash, width, height }) -> { browser, page, errors }
// Real index.html in Chromium; CDN scripts from tools/node_modules; supabase-js replaced by fake_supabase.js when fixtures are given.
const path = require('path');
const { dir, req } = require('./resolve');
const { chromium } = req('playwright');
async function openApp(file, o) {
  o = o || {};
  const LOCAL = {
    'react.production.min.js': dir('react') + '/umd/react.production.min.js',
    'react-dom.production.min.js': dir('react-dom') + '/umd/react-dom.production.min.js',
    'supabase-js@2': o.fixtures ? path.join(__dirname, 'fake_supabase.js') : dir('@supabase/supabase-js') + '/dist/umd/supabase.js',
    'papaparse.min.js': dir('papaparse') + '/papaparse.min.js' };
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: o.width || 360, height: o.height || 760 }, deviceScaleFactor: 2, reducedMotion: o.reducedMotion || 'no-preference' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text().split('\n')[0]); });
  if (o.fixtures) await page.addInitScript(f => { window.__RSA_FIX = f; }, o.fixtures);
  await page.route('**/*', r => {
    const u = r.request().url();
    if (u.startsWith('http://app.local/')) return r.fulfill({ path: path.resolve(file) });
    for (const k in LOCAL) if (u.includes(k)) return r.fulfill({ path: LOCAL[k], contentType: 'application/javascript' });
    if (u.includes('supabase.co')) return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    if (u.includes('fonts.g')) return r.continue();
    return r.abort();
  });
  await page.goto('http://app.local/index.html' + (o.hash || ''));
  return { browser, page, errors };
}
module.exports = { openApp };
