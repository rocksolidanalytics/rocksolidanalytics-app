// Browser-side stand-in for supabase-js, served in place of the CDN script.
// Reads window.__RSA_FIX = { session, tables: { name: [rows] }, rpc: { name: data }, delay: { table: ms } }.
// delay holds a table read back so loading states can be captured.
// Reads filter rows by eq; writes succeed and echo their payload. No network.
(function () {
  function fix() { return window.__RSA_FIX || {}; }
  function builder(table) {
    var st = { eq: [], one: null, write: null };
    var b;
    function result() {
      if (st.write) return { data: st.write.payload, error: null };
      var rows = ((fix().tables || {})[table] || []).filter(function (r) {
        return st.eq.every(function (f) { return String(r[f[0]]) === String(f[1]); });
      });
      if (st.one) return { data: rows[0] || null, error: st.one === 'single' && !rows.length ? { message: 'no rows' } : null, count: rows.length };
      return { data: rows, error: null, count: rows.length };
    }
    b = new Proxy({}, { get: function (_, k) {
      if (k === 'then') return function (ok, bad) { var ms = (fix().delay || {})[table] || 0; return new Promise(function (r) { setTimeout(function () { r(result()); }, ms); }).then(ok, bad); };
      if (k === 'eq') return function (c, v) { st.eq.push([c, v]); return b; };
      if (k === 'single' || k === 'maybeSingle') return function () { st.one = k; return b; };
      if (k === 'insert' || k === 'upsert' || k === 'update') return function (p) { st.write = { kind: k, payload: Array.isArray(p) ? p : Object.assign({ id: 'fake-' + table }, p) }; return b; };
      if (k === 'delete') return function () { st.write = { kind: k, payload: null }; return b; };
      return function () { return b; };
    } });
    return b;
  }
  var any = new Proxy(function () {}, { get: function (_, k) { return k === 'then' ? undefined : any; }, apply: function () { return any; } });
  window.supabase = { createClient: function () {
    var ok = function (d) { return Promise.resolve({ data: d || {}, error: null }); };
    return {
      from: builder,
      rpc: function (name) { return Promise.resolve({ data: (fix().rpc || {})[name] || null, error: null }); },
      auth: {
        getSession: function () { return ok({ session: fix().session || null }); },
        getUser: function () { return ok({ user: (fix().session || {}).user || null }); },
        onAuthStateChange: function (cb) { setTimeout(function () { cb('INITIAL_SESSION', fix().session || null); }, 0); return { data: { subscription: { unsubscribe: function () {} } } }; },
        signOut: function () { return ok(); }, signInWithPassword: function () { return ok(); }, signUp: function () { return ok(); },
        signInAnonymously: function () { return ok(); }, resetPasswordForEmail: function () { return ok(); }, updateUser: function () { return ok(); }
      },
      storage: any, channel: function () { return any; }, removeChannel: function () {}, functions: any
    };
  } };
})();
