const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname);
const port = Number(process.env.PORT) || 8000;
// Tests point this at a temp folder so mocked prices never land in the real cache.
const cacheDir = process.env.MARKET_CACHE_DIR || path.join(root, '.cache');
const memoryCache = new Map();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.csv': 'text/csv; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const security = { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY', 'Cross-Origin-Resource-Policy': 'same-origin', 'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" };

const envFile = path.resolve(__dirname, '..', '.env');
try {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !Object.hasOwn(process.env, match[1])) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch {}
const keys = { alpha: process.env.ALPHA_VANTAGE_API_KEY, gecko: process.env.COINGECKO_DEMO_API_KEY };

const terms = {
  alphavantage: 'https://www.alphavantage.co/terms_of_service/',
  coingecko: 'https://www.coingecko.com/en/api_terms',
  kraken: 'https://www.kraken.com/legal',
  frankfurter: 'https://www.frankfurter.dev/terms/',
  coinpaprika: 'https://coinpaprika.com/terms/'
};
const valid = (value, regex) => typeof value === 'string' && regex.test(value);
const validDate = value => valid(value, /^\d{4}-\d\d-\d\d$/) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const number = value => value === null ? null : Number(value);
const bar = (time, o, h, l, c, v = null) => ({ time, o: number(o), h: number(h), l: number(l), c: number(c), v: number(v) });
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const send = (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...security }); res.end(JSON.stringify(data)); };
const fail = (res, status, error) => {
  let message = String(error).replace(/([?&]apikey=)[^&\s]+/ig, '$1[redacted]');
  for (const key of Object.values(keys)) if (key) message = message.split(key).join('[redacted]');
  send(res, status, { error: message.slice(0, 200) });
};

async function handleMarket(req, res, url, options = {}) {
  const fetcher = options.fetch || globalThis.fetch;
  const cache = options.cache || memoryCache;
  const now = options.now || Date.now;
  const p = url.pathname;
  const q = url.searchParams;
  if (p === '/api/market/status') return send(res, 200, { providers: {
    alphavantage: { configured: !!keys.alpha, limit: '25 requests/day' },
    coingecko: { configured: !!keys.gecko, limit: '10,000 calls/month' },
    kraken: { configured: true }, frankfurter: { configured: true }, coinpaprika: { configured: true }
  } });

  let provider, symbol, interval, endpoint, headers = {}, ttl, attribution, cacheParams;
  let transform;
  if (p === '/api/market/stocks') {
    symbol = q.get('symbol');
    if (!valid(symbol, /^[A-Z][A-Z0-9.\-]{0,9}$/)) return fail(res, 400, 'Invalid stock symbol');
    if (!keys.alpha) return fail(res, 503, 'Alpha Vantage not configured');
    provider = 'Alpha Vantage'; interval = '1d'; ttl = 86400000; attribution = 'Data provided by Alpha Vantage';
    endpoint = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=compact&apikey=${encodeURIComponent(keys.alpha)}`;
    cacheParams = { symbol };
    transform = body => Object.entries(body['Time Series (Daily)'] || {}).map(([day, row]) => bar(Date.parse(`${day}T00:00:00Z`), row['1. open'], row['2. high'], row['3. low'], row['4. close'], row['5. volume'])).sort((a, b) => a.time - b.time);
  } else if (p === '/api/market/crypto/kraken') {
    const pair = q.get('pair');
    if (!valid(pair, /^[A-Z0-9]{5,12}$/)) return fail(res, 400, 'Invalid Kraken pair');
    provider = 'Kraken'; symbol = pair; interval = '1d'; ttl = 43200000; attribution = 'Kraken public market data'; cacheParams = { pair };
    endpoint = `https://api.kraken.com/0/public/OHLC?pair=${encodeURIComponent(pair)}&interval=1440`;
    transform = body => {
      if (body.error?.length) throw Object.assign(new Error('Kraken provider error'), { status: 502 });
      const resultKey = Object.keys(body.result || {}).find(key => key !== 'last');
      const rows = body.result?.[resultKey] || [];
      const today = new Date(now()).toISOString().slice(0, 10);
      return rows.filter(row => new Date(Number(row[0]) * 1000).toISOString().slice(0, 10) !== today).map(row => bar(Number(row[0]) * 1000, row[1], row[2], row[3], row[4], row[6]));
    };
  } else if (p === '/api/market/crypto/gecko') {
    const id = q.get('id'), vs = q.get('vs'), days = q.get('days');
    if (!valid(id, /^[a-z0-9-]{1,60}$/) || !valid(vs, /^[a-z]{3,5}$/) || !['1', '7', '14', '30', '90', '180', '365'].includes(days)) return fail(res, 400, 'Invalid CoinGecko parameters');
    if (!keys.gecko) return fail(res, 503, 'CoinGecko not configured');
    provider = 'CoinGecko'; symbol = `${id}/${vs}`; interval = Number(days) > 30 ? '4d' : '4h'; ttl = 43200000; attribution = 'Data provided by CoinGecko'; headers['x-cg-demo-api-key'] = keys.gecko; cacheParams = { id, vs, days };
    endpoint = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/ohlc?vs_currency=${encodeURIComponent(vs)}&days=${encodeURIComponent(days)}`;
    transform = body => body.map(row => bar(row[0], row[1], row[2], row[3], row[4], null));
  } else if (p === '/api/market/crypto/paprika/today') {
    const coin = q.get('coin');
    if (!valid(coin, /^[a-z0-9-]{3,60}$/)) return fail(res, 400, 'Invalid CoinPaprika coin');
    provider = 'CoinPaprika'; symbol = coin; ttl = 300000; attribution = 'Data provided by CoinPaprika'; cacheParams = { coin };
    endpoint = `https://api.coinpaprika.com/v1/coins/${encodeURIComponent(coin)}/ohlcv/today`;
    transform = body => body[0] ? { quote: { time: Date.parse(body[0].time_open), o: number(body[0].open), h: number(body[0].high), l: number(body[0].low), c: number(body[0].close), v: number(body[0].volume), marketCap: number(body[0].market_cap) } } : null;
  } else if (p === '/api/market/fx') {
    const base = q.get('base'), symbols = q.get('symbols'), start = q.get('start');
    if (!valid(base, /^[A-Z]{3}$/) || !valid(symbols, /^[A-Z]{3}(,[A-Z]{3}){0,9}$/) || (start !== null && !validDate(start))) return fail(res, 400, 'Invalid FX parameters');
    provider = 'Frankfurter'; symbol = `${base}/${symbols}`; ttl = 43200000; attribution = 'Rates by Frankfurter'; cacheParams = { base, symbols, start };
    endpoint = `https://api.frankfurter.dev/v1/${start ? `${encodeURIComponent(start)}..` : 'latest'}?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(symbols)}`;
    transform = body => {
      if (!start) return { fx: { base, date: body.date, rates: body.rates } };
      const series = Object.entries(body.rates || {}).sort(([a], [b]) => a.localeCompare(b)).map(([date, rates]) => ({ date, rates }));
      return { fx: { base, series } };
    };
  } else return fail(res, 404, 'Market route not found');

  const key = `${p}?${JSON.stringify(cacheParams)}`;
  const file = path.join(cacheDir, `${hash(key)}.json`);
  let stale;
  const cached = cache.get(key);
  if (cached) stale = cached;
  else try { stale = JSON.parse(fs.readFileSync(file, 'utf8')); cache.set(key, stale); } catch {}
  if (stale && now() - stale.saved < ttl) return send(res, 200, { ...stale.data, cached: true });
  try {
    const response = await fetcher(endpoint, { headers, signal: AbortSignal.timeout(10000) });
    const body = await response.json();
    if (!response.ok) throw Object.assign(new Error('Market provider request failed'), { status: 502 });
    if (provider === 'Alpha Vantage' && (body.Information || body.Note || body['Error Message'])) throw Object.assign(new Error(String(body.Information || body.Note || body['Error Message']).replace(keys.alpha, '[redacted]')), { status: body['Error Message'] ? 400 : 429 });
    const value = transform(body);
    if (value === null) throw Object.assign(new Error('Provider returned no data'), { status: 502 });
    if (value.fx) {
      const data = { provider, ...value.fx };
      store(key, file, data, now(), cache); return send(res, 200, { ...data, cached: false });
    }
    if (value.quote) {
      const data = { provider, symbol, fetchedAt: new Date(now()).toISOString(), cached: false, ...value };
      store(key, file, data, now(), cache); return send(res, 200, data);
    }
    const bars = value;
    if (!bars.length || bars.some(b => !Number.isFinite(b.time) || [b.o, b.h, b.l, b.c].some(n => !Number.isFinite(n)))) throw Object.assign(new Error('Provider returned no usable bars'), { status: 502 });
    const data = { provider, symbol, interval, source: provider, terms: terms[provider.toLowerCase().replace(' ', '')], attribution, fetchedAt: new Date(now()).toISOString(), cached: false, bars };
    store(key, file, data, now(), cache); return send(res, 200, data);
  } catch (error) {
    if (stale) return send(res, 200, { ...stale.data, cached: true, stale: true });
    return fail(res, error.status || 502, error.message || 'Market provider unavailable');
  }
}

function store(key, file, data, saved, cache) {
  const record = { saved, data }; cache.set(key, record);
  try { fs.mkdirSync(cacheDir, { recursive: true }); fs.writeFileSync(file, JSON.stringify(record), 'utf8'); } catch {}
}

const allowedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
const deny = (res, code, text) => { res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8', ...security }); res.end(text); };
const server = http.createServer((req, res) => {
  if (!allowedHosts.has(String(req.headers.host || '').toLowerCase())) return deny(res, 403, 'Forbidden');
  if (req.method !== 'GET' && req.method !== 'HEAD') return deny(res, 405, 'Method not allowed');
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch { return deny(res, 400, 'Bad request'); }
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { return deny(res, 400, 'Bad request'); }
  if (pathname.includes('\0')) return deny(res, 400, 'Bad request');
  if (pathname.startsWith('/api/market')) {
    if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
    return void handleMarket(req, res, url);
  }
  const file = path.resolve(root, `.${pathname}`);
  if (file !== root && !file.startsWith(root + path.sep)) return deny(res, 403, 'Forbidden');
  fs.stat(file, (err, stat) => {
    const target = !err && stat.isDirectory() ? path.join(file, 'index.html') : file;
    fs.readFile(target, (error, data) => {
      if (error) return deny(res, 404, 'Not found');
      res.writeHead(200, { 'Content-Type': types[path.extname(target).toLowerCase()] || 'application/octet-stream', ...security });
      res.end(req.method === 'HEAD' ? undefined : data);
    });
  });
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Stop the other server or run with a different PORT.` : error.message); process.exit(1); });
if (require.main === module) server.listen(port, '127.0.0.1', () => console.log(`Trading Research Academy: http://127.0.0.1:${port}`));

module.exports = { handleMarket, server };
