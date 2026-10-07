// node tools/selftest.js   Plants known failure modes into temp copies and checks every gate catches its one.
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const T = __dirname, src = fs.readFileSync(path.join(T, '..', 'index.html'), 'utf8');
function plant(a, b) { if (src.split(a).length !== 2) throw new Error('anchor count != 1: ' + a); return src.replace(a, b); }
function gate(html) { const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'rsa-')), 'index.html'); fs.writeFileSync(f, html);
  try { cp.execFileSync(path.join(T, 'validate.sh'), [f], { stdio: 'pipe' }); return 'PASSED'; } catch (e) { return 'FAILED'; } }
const cases = [
  ['clean file passes', src, 'PASSED'],
  ['shadowed plSave is caught', plant('    function plSave(', '    function plSave() {}\n    function plSave('), 'FAILED'],
  ['RESTARTS recursion is caught', plant('  function App() {', '  function App() { RESTARTS = function() { return RESTARTS(); }; RESTARTS();'), 'FAILED'],
  ['computeStats change is caught', plant('    const scorers = Object.entries(sc)', '    sf += 1;\n    const scorers = Object.entries(sc)'), 'FAILED'],
];
let bad = 0;
for (const [name, html, want] of cases) { const got = gate(html); if (got !== want) bad++; console.log((got === want ? 'ok   ' : 'FAIL ') + name + ' (' + got + ')'); }
process.exitCode = bad ? 1 : 0;
