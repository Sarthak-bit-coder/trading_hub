const test = require('node:test');
const assert = require('node:assert/strict');

process.env.ALPHA_VANTAGE_API_KEY = 'test-alpha-key';
process.env.COINGECKO_DEMO_API_KEY = 'test-gecko-key';
process.env.TIINGO_API_KEY = 'test-tiingo-key';
process.env.FINNHUB_API_KEY = 'test-finnhub-key';
process.env.MARKET_CACHE_DIR = require('node:fs').mkdtempSync(require('node:path').join(require('node:os').tmpdir(), 'market-cache-test-'));
const { handleMarket } = require('../server.js');

async function call(path, body, options = {}) {
  const response = { status: 0, headers: {}, writeHead(status, headers) { this.status = status; this.headers = headers; }, end(value) { this.body = value; } };
  let calls = 0;
  const fetch = options.fetch || (async () => { calls++; return { ok: true, json: async () => body }; });
  await handleMarket({ method: 'GET' }, response, new URL(path, 'http://localhost'), { fetch, cache: options.cache || new Map(), now: () => Date.UTC(2026, 10, 18) });
  return { status: response.status, data: JSON.parse(response.body), calls, headers: response.headers };
}

test('rejects malformed parameters on every data route', async () => {
  for (const path of ['/api/market/stocks?symbol=spy', '/api/market/crypto/kraken?pair=bad!', '/api/market/crypto/gecko?id=BITCOIN&vs=usd&days=365', '/api/market/crypto/paprika/today?coin=BTC', '/api/market/fx?base=usd&symbols=EUR']) {
    assert.equal((await call(path)).status, 400, path);
  }
});

test('maps Alpha Vantage daily rows to ascending numeric bars', async () => {
  const result = await call('/api/market/stocks?symbol=SPY', { 'Meta Data': {}, 'Time Series (Daily)': { '2026-11-17': { '1. open': '738.39', '2. high': '739.76', '3. low': '727.00', '4. close': '732.44', '5. volume': '71636294' } } });
  assert.equal(result.status, 200); assert.equal(result.data.interval, '1d'); assert.equal(result.data.bars[0].o, 738.39); assert.equal(result.data.bars[0].v, 71636294);
});

test('maps Kraken OHLC and drops unfinished current candle', async () => {
  const result = await call('/api/market/crypto/kraken?pair=XBTUSD', { error: [], result: { XXBTZUSD: [[1732752000, '95946.8', '96652.0', '94653.6', '95637.8', '95402.0', '1141.159', 29180], [1794960000, '1', '2', '1', '2', '1', '3', 1]], last: 1 } });
  assert.equal(result.status, 200); assert.equal(result.data.bars.length, 1); assert.equal(result.data.bars[0].time, 1732752000000); assert.equal(result.data.bars[0].v, 1141.159);
});

test('maps CoinGecko OHLC with null volume and requested interval', async () => {
  const result = await call('/api/market/crypto/gecko?id=bitcoin&vs=usd&days=365', [[1794873600000, 100, 120, 90, 110]]);
  assert.equal(result.status, 200); assert.equal(result.data.interval, '4d'); assert.equal(result.data.bars[0].v, null);
});

test('maps CoinPaprika today quote', async () => {
  const result = await call('/api/market/crypto/paprika/today?coin=btc-bitcoin', [{ time_open: '2026-11-17T00:00:00Z', time_close: '2026-11-18T00:00:00Z', open: 1, high: 3, low: 1, close: 2, volume: 4, market_cap: 5 }]);
  assert.equal(result.status, 200); assert.equal(result.data.quote.marketCap, 5); assert.equal(result.data.symbol, 'btc-bitcoin');
});

test('maps Frankfurter latest and series responses', async () => {
  const latest = await call('/api/market/fx?base=USD&symbols=EUR,GBP', { base: 'USD', date: '2026-11-17', rates: { EUR: 0.9, GBP: 0.8 } });
  assert.deepEqual(latest.data.rates, { EUR: 0.9, GBP: 0.8 });
  const series = await call('/api/market/fx?base=USD&symbols=EUR&start=2026-11-01', { base: 'USD', rates: { '2026-11-03': { EUR: 0.9 } } });
  assert.deepEqual(series.data.series, [{ date: '2026-11-03', rates: { EUR: 0.9 } }]);
});

test('returns Alpha Vantage Information as an error without exposing key', async () => {
  const result = await call('/api/market/stocks?symbol=AAPL', { Information: 'Wait for key test-alpha-key' });
  assert.equal(result.status, 429); assert.match(result.data.error, /\[redacted\]/); assert.doesNotMatch(JSON.stringify(result.data), /test-alpha-key/);
});

test('fresh cache hit skips fetch; provider failure serves stale cache', async () => {
  const cache = new Map();
  const path = '/api/market/crypto/kraken?pair=XBTUSD';
  const first = await call(path, { error: [], result: { XXBTZUSD: [[1732752000, '1', '2', '1', '2', '1', '3', 1]], last: 0 } }, { cache });
  const hit = await call(path, null, { cache, fetch: async () => { throw Error('must not fetch'); } });
  assert.equal(first.status, 200); assert.equal(hit.data.cached, true);
  const stale = await call(path, null, { cache: new Map([...cache].map(([key, record]) => [key, { ...record, saved: 0 }])), fetch: async () => { throw Error('offline'); } });
  assert.equal(stale.data.stale, true);
});

test('provider errors never return fake API keys', async () => {
  const result = await call('/api/market/crypto/gecko?id=bitcoin&vs=usd&days=1', null, { fetch: async () => { throw Error('test-gecko-key'); } });
  assert.equal(result.status, 502); assert.doesNotMatch(JSON.stringify(result.data), /test-gecko-key/);
});

test('maps Tiingo daily prices and sends the key in a header, not the URL', async () => {
  let seen;
  const fetch = async (u, init) => { seen = { u, init }; return { ok: true, json: async () => [{ date: '2026-11-17T00:00:00.000Z', open: 1, high: 3, low: 1, close: 2, volume: 9 }] }; };
  const result = await call('/api/market/tiingo?symbol=SPY', null, { fetch });
  assert.equal(result.status, 200); assert.equal(result.data.provider, 'Tiingo'); assert.equal(result.data.bars[0].c, 2);
  assert.ok(!seen.u.includes('test-tiingo-key')); assert.equal(seen.init.headers.Authorization, 'Token test-tiingo-key');
});

test('Finnhub quote maps fields and treats an all-zero answer as no data', async () => {
  const ok = await call('/api/market/finnhub?symbol=SPY', { c: 10, o: 9, h: 11, l: 8, pc: 9.5, t: 1794960000 });
  assert.equal(ok.status, 200); assert.equal(ok.data.quote.prevClose, 9.5);
  assert.equal((await call('/api/market/finnhub?symbol=ZZZZ', { c: 0, pc: 0, t: 0 })).status, 502);
});

test('verify cross-checks closes on matching dates and flags disagreement', async () => {
  const fetch = async u => ({ ok: true, json: async () =>
    u.includes('alphavantage') ? { 'Time Series (Daily)': { '2026-11-16': { '1. open': 1, '2. high': 1, '3. low': 1, '4. close': '100.00' }, '2026-11-17': { '1. open': 1, '2. high': 1, '3. low': 1, '4. close': '101.00' } } }
    : u.includes('tiingo') ? [{ date: '2026-11-16T00:00:00.000Z', open: 1, high: 1, low: 1, close: 100.1 }, { date: '2026-11-17T00:00:00.000Z', open: 1, high: 1, low: 1, close: 103 }]
    : { c: 102, o: 1, h: 1, l: 1, pc: 101, t: Date.UTC(2026, 10, 18) / 1000 } });
  const r = await call('/api/market/verify?symbol=QQQ', null, { fetch });
  assert.equal(r.status, 200); assert.equal(r.data.checkedDays, 2); assert.equal(r.data.disagreements, 1); assert.equal(r.data.verdict, 'disagree');
  const last = r.data.rows.at(-1); assert.equal(last.values.Finnhub, 101); assert.equal(last.agree, false);
  assert.equal(r.data.rows[0].agree, true);
  assert.equal((await call('/api/market/verify?symbol=bad')).status, 400);
});
