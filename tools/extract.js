// Returns the inline app bundle (the last script tag without src) from index.html
const fs = require('fs');
function extract(file) {
  const html = fs.readFileSync(file, 'utf8');
  const re = /<script>([\s\S]*?)<\/script>/g; let m, last = null, n = 0;
  while ((m = re.exec(html))) { last = m[1]; n++; }
  if (n !== 1) throw new Error('expected exactly 1 inline script, found ' + n);
  return last;
}
module.exports = extract;
if (require.main === module) { const out = process.argv[3]; fs.writeFileSync(out, extract(process.argv[2])); console.log('wrote', out); }
