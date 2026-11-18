// Access control for /api/market/*: keyed providers need a signed-in Supabase user on the owner allowlist; every route is rate-limited.
// Provider terms (Alpha Vantage, CoinGecko demo, Tiingo, Finnhub free tiers) are personal use, so keyed data stays owner-only by default.
const crypto = require('node:crypto');

// Routes that spend the owner's API quota. Everything else under /api/market is free to call.
const KEYED = new Set(['/api/market/stocks', '/api/market/crypto/gecko', '/api/market/finnhub', '/api/market/tiingo', '/api/market/verify']);
const LIMITS = { keyed: 60, open: 120 }; // requests per window
const WINDOW_MS = 60 * 60 * 1000;
const SESSION_TTL_MS = 5 * 60 * 1000;

// shortcut: in-memory state is per server instance, so limits are best-effort on multi-instance hosts; use a shared store (Upstash/Vercel KV) if abuse appears.
const buckets = new Map();
const sessions = new Map();

const deny = (res, status, error, extra = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(JSON.stringify({ error }));
};

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function take(key, limit, now) {
  let b = buckets.get(key);
  if (!b || now - b.start >= WINDOW_MS) { b = { start: now, count: 0 }; buckets.set(key, b); }
  b.count++;
  if (buckets.size > 10000) for (const [k, v] of buckets) if (now - v.start >= WINDOW_MS) buckets.delete(k);
  return b.count <= limit ? 0 : Math.ceil((b.start + WINDOW_MS - now) / 1000);
}

async function userFromToken(token, env, fetcher, now) {
  const id = crypto.createHash('sha256').update(token).digest('hex');
  const hit = sessions.get(id);
  if (hit && hit.until > now) return hit.user;
  const r = await fetcher(`${env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000)
  });
  if (!r.ok) return null;
  const body = await r.json();
  const user = typeof body?.id === 'string' ? { id: body.id, email: String(body.email || '').toLowerCase() } : null;
  if (user) sessions.set(id, { user, until: now + SESSION_TTL_MS });
  return user;
}

const list = v => String(v || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
const allowed = (user, env) => list(env.DATA_USER_IDS).includes(user.id.toLowerCase()) || (!!user.email && list(env.DATA_USER_EMAILS).includes(user.email));

// Returns true when the request may continue; otherwise it has already written the response.
async function guard(req, res, url, options = {}) {
  const env = options.env || process.env;
  const fetcher = options.fetch || globalThis.fetch;
  const now = (options.now || Date.now)();
  const keyed = KEYED.has(url.pathname);
  let who = `ip:${clientIp(req)}`;
  if (keyed && env.SUPABASE_URL && env.SUPABASE_PUBLISHABLE_KEY) {
    const token = String(req.headers.authorization || '').match(/^Bearer\s+([A-Za-z0-9._-]{20,4096})$/)?.[1];
    if (!token) return deny(res, 401, 'Sign in to load this data source'), false;
    let user = null;
    try { user = await userFromToken(token, env, fetcher, now); } catch { return deny(res, 503, 'Could not verify your session'), false; }
    if (!user) return deny(res, 401, 'Your session expired. Sign in again'), false;
    if (!allowed(user, env)) return deny(res, 403, 'This data source is limited to the site owner'), false;
    who = `user:${user.id}`;
  }
  const retry = take(`${keyed ? 'k' : 'o'}:${who}`, keyed ? LIMITS.keyed : LIMITS.open, now);
  if (retry) return deny(res, 429, 'Too many requests. Try again later', { 'Retry-After': String(retry) }), false;
  return true;
}

module.exports = { guard, KEYED, LIMITS, _reset: () => { buckets.clear(); sessions.clear(); } };
