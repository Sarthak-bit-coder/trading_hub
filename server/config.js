// Public browser config. Only the Supabase URL and publishable (anon) key ever leave the server.
function publicConfig(env = process.env) {
  const url = String(env.SUPABASE_URL || '');
  const key = String(env.SUPABASE_PUBLISHABLE_KEY || '');
  const ok = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url) && key.length > 20;
  return ok ? { auth: true, supabaseUrl: url.replace(/\/$/, ''), supabaseKey: key } : { auth: false };
}
module.exports = { publicConfig };
