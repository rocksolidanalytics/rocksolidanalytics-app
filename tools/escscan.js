// node escscan.js index.html [--list]
// Finds string literals whose runtime value still holds a backslash escape such as ’ or \xB7.
// That only happens when the source was double-escaped, so the screen shows the escape as text.
const fs = require('fs');
const ts = require('./resolve').req('typescript');
const extract = require('./extract');
const html = fs.readFileSync(process.argv[2], 'utf8');
const src = extract(process.argv[2]);
const base = html.slice(0, html.indexOf(src)).split('\n').length - 1;
const sf = ts.createSourceFile('b.js', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const decl = /^  (?:function|const|let|var) ([A-Za-z_$][\w$]*)/;
const owner = []; let o = '(top)';
src.split('\n').forEach((l, k) => { const m = decl.exec(l); if (m) o = m[1]; owner[k] = o; });
// Line from the character offset, counting only \n. The TypeScript line map also breaks on U+2028.
const nl = []; for (let k = 0; k < src.length; k++) if (src.charCodeAt(k) === 10) nl.push(k);
function lineOf(pos) { let lo = 0, hi = nl.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (nl[mid] < pos) lo = mid + 1; else hi = mid; } return lo; }
const hits = [];
(function walk(n) {
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n)) {
    if (/\\(u[0-9a-fA-F{]|x[0-9a-fA-F]{2})/.test(n.text)) {
      const ln = lineOf(n.getStart());
      hits.push({ line: base + ln + 1, owner: owner[ln], text: n.text });
    }
  }
  ts.forEachChild(n, walk);
})(sf);
if (process.argv.includes('--list')) for (const h of hits) console.log(String(h.line).padStart(5), h.owner.padEnd(16), JSON.stringify(h.text).slice(0, 80));
// Known leftovers (17 at d232561, 13 after VideoHub, 8 after DashView, 7 after ScoreSourcePanel); each is fixed in its screen pass. Lower this as they go.
const BASELINE = 7;
console.log('ESCSCAN literal escapes=' + hits.length + ' (baseline ' + BASELINE + ', may only fall)');
if (hits.length > BASELINE) process.exitCode = 1;
