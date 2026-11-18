const test = require('node:test');
const assert = require('node:assert/strict');
const { guard, _reset } = require('../../server/guard.js');
const { publicConfig } = require('../../server/config.js');

const env = { SUPABASE_URL: 'https://abcdefgh.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'pk_test_publishable_key_value_123', DATA_USER_EMAILS: 'Owner@Example.com' };
const res = () => ({ status: 0, headers: {}, body: '', writeHead(s, h) { this.status = s; this.headers = h; }, end(b) { this.body = b; } });
const req = (auth, ip = '1.2.3.4') => ({ headers: { authorization: auth, 'x-forwarded-for': ip }, socket: {} });
const url = p => new URL(p, 'https://x.invalid');
const okUser = async () => ({ ok: true, json: async () => ({ id: 'user-1', email: 'owner@example.com' }) });

test('keyed routes need a session when Supabase is configured', async () => {
  _reset(); const r = res();
  assert.equal(await guard(req(), r, url('/api/market/stocks?symbol=SPY'), { env, fetch: okUser }), false);
  assert.equal(r.status, 401);
});

test('a valid session passes and is verified once per cache window', async () => {
  _reset(); let calls = 0; const f = async (...a) => { calls++; return okUser(...a); };
  const token = 'Bearer ' + 'a'.repeat(40);
  assert.equal(await guard(req(token), res(), url('/api/market/stocks'), { env, fetch: f }), true);
  assert.equal(await guard(req(token), res(), url('/api/market/stocks'), { env, fetch: f }), true);
  assert.equal(calls, 1);
});

test('an invalid session is rejected', async () => {
  _reset(); const r = res();
  const bad = async () => ({ ok: false, json: async () => ({}) });
  assert.equal(await guard(req('Bearer ' + 'b'.repeat(40)), r, url('/api/market/stocks'), { env, fetch: bad }), false);
  assert.equal(r.status, 401);
});

test('signed-in users not on the owner allowlist get 403', async () => {
  _reset(); const r = res();
  const other = async () => ({ ok: true, json: async () => ({ id: 'user-2', email: 'someone@example.com' }) });
  assert.equal(await guard(req('Bearer ' + 'c'.repeat(40)), r, url('/api/market/tiingo'), { env, fetch: other }), false);
  assert.equal(r.status, 403);
  const r2 = res();
  assert.equal(await guard(req('Bearer ' + 'd'.repeat(40)), r2, url('/api/market/stocks'), { env: { ...env, DATA_USER_EMAILS: '' }, fetch: okUser }), false);
  assert.equal(r2.status, 403);
  assert.equal(await guard(req('Bearer ' + 'e'.repeat(40)), res(), url('/api/market/stocks'), { env: { ...env, DATA_USER_EMAILS: '', DATA_USER_IDS: 'user-1' }, fetch: okUser }), true);
});

test('keyless routes stay open but are rate-limited per IP', async () => {
  _reset(); let last;
  for (let i = 0; i < 121; i++) { last = res(); await guard(req(undefined, '9.9.9.9'), last, url('/api/market/fx'), { env, now: () => 1000 }); }
  assert.equal(last.status, 429);
  assert.ok(Number(last.headers['Retry-After']) > 0);
  assert.equal(await guard(req(undefined, '8.8.8.8'), res(), url('/api/market/fx'), { env, now: () => 1000 }), true);
});

test('without Supabase config (local use) keyed routes are allowed', async () => {
  _reset();
  assert.equal(await guard(req(), res(), url('/api/market/stocks'), { env: {} }), true);
});

test('public config exposes only a valid Supabase URL and publishable key', () => {
  assert.deepEqual(publicConfig({}), { auth: false });
  assert.deepEqual(publicConfig({ SUPABASE_URL: 'http://evil.example', SUPABASE_PUBLISHABLE_KEY: 'x'.repeat(30) }), { auth: false });
  const c = publicConfig({ ...env, SUPABASE_SECRET_KEY: 'sb_secret_should_never_leak' });
  assert.equal(c.auth, true);
  assert.ok(!JSON.stringify(c).includes('sb_secret'));
});
