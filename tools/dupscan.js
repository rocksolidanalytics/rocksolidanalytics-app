// node dupscan.js index.html [--list]
// AST-based: counts names declared more than once in the same hoisting scope
// (function decls hoist to the enclosing function, so a second one silently shadows the first).
const ts = require('./resolve').req('typescript');
const extract = require('./extract');
const src = extract(process.argv[2]);
const sf = ts.createSourceFile('b.js', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const isFnScope = n => ts.isFunctionLike(n) || ts.isSourceFile(n);
const dups = [];
function scan(scopeNode) {
  const names = {};
  const add = (name, kind, node) => { (names[name] = names[name] || []).push({ kind, line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1 }); };
  function walk(n) {
    if (n !== scopeNode && isFnScope(n)) {
      if (ts.isFunctionDeclaration(n) && n.name) add(n.name.text, 'function', n);
      scan(n); return;
    }
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) {
      const list = n.parent; const blockScoped = (ts.getCombinedNodeFlags(list) & ts.NodeFlags.BlockScoped) !== 0;
      if (!blockScoped || inDirectBody(n)) add(n.name.text, blockScoped ? 'let/const' : 'var', n);
    }
    ts.forEachChild(n, walk);
  }
  function inDirectBody(n) { let p = n.parent; while (p && !ts.isBlock(p) && !ts.isSourceFile(p)) p = p.parent; return p && (p.parent === scopeNode || p === scopeNode); }
  if (ts.isSourceFile(scopeNode)) ts.forEachChild(scopeNode, walk); else if (scopeNode.body) ts.forEachChild(scopeNode.body, walk);
  for (const [name, decls] of Object.entries(names)) {
    const fns = decls.filter(d => d.kind === 'function');
    if (fns.length > 1 || (fns.length && decls.length > 1)) dups.push({ name, decls, scope: scopeNode.name ? scopeNode.name.getText() : '(anon@' + (sf.getLineAndCharacterOfPosition(scopeNode.getStart()).line + 1) + ')' });
  }
}
scan(sf);
if (process.argv.includes('--list')) for (const d of dups) console.log(d.scope.padEnd(22), d.name.padEnd(16), d.decls.map(x => x.kind + '@' + x.line).join(' '));
const any = {}; (function w(n) { if (ts.isFunctionDeclaration(n) && n.name) any[n.name.text] = (any[n.name.text] || 0) + 1; ts.forEachChild(n, w); })(sf);
const cross = Object.values(any).filter(v => v > 1).length;
console.log('DUPSCAN same-scope=' + dups.length + ' (must be 0)  cross-scope=' + cross + ' (baseline 22)');
const CROSS_BASELINE = 22;
if (dups.length || cross > CROSS_BASELINE) process.exitCode = 1;
