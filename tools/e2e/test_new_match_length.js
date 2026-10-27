// New match asks for the match length.
const L = require('./lib.js');
module.exports = async function(t) {
  const r = await L.open();
  await L.clickTxt(r.page, 'New [Mm]atch'); await L.wait(r.page, 1000);
  t.ok('MATCH LENGTH shown', /MATCH LENGTH/.test(await L.text(r.page)));
  t.eq('three lengths, 2x30 first', await L.buttons(r.page, '^\\d \\u00D7 \\d\\d$'), '2 × 30 | 2 × 35 | 3 × 20');
  t.eq('no page errors', r.errors, []);
  await r.browser.close();
};
