// Finds a package in tools/node_modules first, then in the global npm root.
const path = require('path'), fs = require('fs'), cp = require('child_process');
let globalRoot = null;
function dir(name) {
  const local = path.join(__dirname, 'node_modules', name);
  if (fs.existsSync(local)) return local;
  if (globalRoot === null) { try { globalRoot = cp.execSync('npm root -g', { encoding: 'utf8' }).trim(); } catch (e) { globalRoot = ''; } }
  const g = path.join(globalRoot, name);
  if (globalRoot && fs.existsSync(g)) return g;
  throw new Error('missing package ' + name + ': run npm install in tools/');
}
module.exports = { dir, req: name => require(dir(name)) };
