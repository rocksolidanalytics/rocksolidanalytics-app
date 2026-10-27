// Runs every test_*.js in this folder (or the ones named on the command line) and exits 1 on any
// failure. A test exports async function(t), where t.eq(label, got, want) and t.ok(label, cond)
// record checks. Screenshots go to out/ (not committed).
//   node e2e/run.js               all tests
//   node e2e/run.js live_format   tests whose file name contains live_format
const fs = require('fs');
const path = require('path');

(async () => {
  const want = process.argv.slice(2);
  const files = fs.readdirSync(__dirname).filter(f => /^test_.*\.js$/.test(f) && (!want.length || want.some(w => f.includes(w)))).sort();
  let pass = 0, fail = 0;
  for (const f of files) {
    const checks = [];
    const t = {
      eq: (label, got, exp) => checks.push({ label, ok: JSON.stringify(got) === JSON.stringify(exp), detail: 'got ' + JSON.stringify(got) + ', want ' + JSON.stringify(exp) }),
      ok: (label, cond, detail) => checks.push({ label, ok: !!cond, detail: detail || '' })
    };
    const t0 = Date.now();
    try { await require(path.join(__dirname, f))(t); }
    catch (e) { checks.push({ label: 'ran without throwing', ok: false, detail: String(e && e.message || e).split('\n')[0] }); }
    const bad = checks.filter(c => !c.ok);
    console.log((bad.length ? 'FAIL ' : 'PASS ') + f + '  (' + checks.length + ' checks, ' + Math.round((Date.now() - t0) / 1000) + 's)');
    bad.forEach(c => console.log('     x ' + c.label + (c.detail ? ': ' + c.detail : '')));
    if (bad.length || !checks.length) fail++; else pass++;
  }
  console.log(fail ? 'E2E: ' + fail + ' of ' + files.length + ' FAILED' : 'E2E: ALL ' + pass + ' PASS');
  process.exit(fail ? 1 : 0);
})();
