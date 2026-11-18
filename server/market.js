const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..', 'app');
const port = Number(process.env.PORT) || 8000;
// Tests point this at a temp folder so mocked prices never land in the real cache.
const cacheDir = process.env.MARKET_CACHE_DIR || (process.env.VERCEL ? path.join(require('node:os').tmpdir(), 'market-cache') : path.join(root, '.cache'));
const memoryCache = new Map();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.csv': 'text/csv; charset=utf-8', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };
const security = { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY', 'Cross-Origin-Resource-Policy': 'same-origin', 'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" };

const envFile = path.resolve(__dirname, '..', '.env');
try {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !Object.hasOwn(process.env, match[1])) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch {}
const keys = { alpha: process.env.ALPHA_VANTAGE_API_KEY, gecko: process.env.COINGECKO_DEMO_API_KEY, tiingo: process.env.TIINGO_API_KEY, finnhub: process.env.FINNHUB_API_KEY };
const AGREE_PCT = 0.5; // cross-check tolerance between providers' closes

const terms = {
  alphavantage: 'https://www.alphavantage.co/terms_of_service/',
  coingecko: 'https://www.coingecko.com/en/api_terms',
  kraken: 'https://www.kraken.com/legal',
  frankfurter: 'https://www.frankfurter.dev/terms/',
  coinpaprika: 'https://coinpaprika.com/terms/',
  tiingo: 'https://www.tiingo.com/about/terms',
  finnhub: 'https://finnhub.io/terms-of-service'
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
    tiingo: { configured: !!keys.tiingo, limit: '1,000 requests/day, personal use' },
    finnhub: { configured: !!keys.finnhub, limit: '60 calls/minute, quotes only' },
    kraken: { configured: true }, frankfurter: { configured: true }, coinpaprika: { configured: true }
  } });

  if (p === '/api/market/verify') return verify(res, q.get('symbol'), options);

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
  } else if (p === '/api/market/tiingo') {
    symbol = q.get('symbol');
    if (!valid(symbol, /^[A-Z][A-Z0-9.-]{0,9}$/)) return fail(res, 400, 'Invalid stock symbol');
    if (!keys.tiingo) return fail(res, 503, 'Tiingo not configured');
    provider = 'Tiingo'; interval = '1d'; ttl = 86400000; attribution = 'Data provided by Tiingo'; headers.Authorization = `Token ${keys.tiingo}`;
    const start = new Date(now() - 400 * 86400000).toISOString().slice(0, 10);
    cacheParams = { symbol };
    endpoint = `https://api.tiingo.com/tiingo/daily/${encodeURIComponent(symbol.toLowerCase())}/prices?startDate=${start}`;
    transform = body => Array.isArray(body) ? body.map(row => bar(Date.parse(row.date), row.open, row.high, row.low, row.close, row.volume)) : [];
  } else if (p === '/api/market/finnhub') {
    symbol = q.get('symbol');
    if (!valid(symbol, /^[A-Z][A-Z0-9.-]{0,9}$/)) return fail(res, 400, 'Invalid stock symbol');
    if (!keys.finnhub) return fail(res, 503, 'Finnhub not configured');
    provider = 'Finnhub'; ttl = 300000; attribution = 'Data provided by Finnhub'; headers['X-Finnhub-Token'] = keys.finnhub; cacheParams = { symbol };
    endpoint = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}`;
    // Finnhub answers unknown symbols with zeros instead of an error.
    transform = body => Number(body?.c) > 0 ? { quote: { time: Number(body.t) * 1000, o: number(body.o), h: number(body.h), l: number(body.l), c: number(body.c), prevClose: number(body.pc) } } : null;
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

// Runs another market route in-process so verify reuses its validation and cache.
function internal(pathname, options) {
  return new Promise(resolve => {
    const res = { writeHead(status) { this.status = status; }, end(body) { resolve({ status: this.status, body: JSON.parse(body) }); } };
    handleMarket({}, res, new URL(pathname, 'https://internal.invalid'), options).catch(() => resolve({ status: 502, body: {} }));
  });
}

// Deterministic cross-check: compares daily closes on the same dates across providers. No AI, no guessing.
async function verify(res, symbol, options) {
  if (!valid(symbol, /^[A-Z][A-Z0-9.-]{0,9}$/)) return fail(res, 400, 'Invalid stock symbol');
  const q = encodeURIComponent(symbol);
  const [alpha, tiingo, finnhub] = await Promise.all(['stocks', 'tiingo', 'finnhub'].map(r => internal(`/api/market/${r}?symbol=${q}`, options)));
  const day = t => new Date(t).toISOString().slice(0, 10);
  const closes = {};
  for (const [name, r] of [['Alpha Vantage', alpha], ['Tiingo', tiingo]]) if (r.status === 200) for (const b of r.body.bars.slice(-10)) (closes[day(b.time)] ||= {})[name] = b.c;
  if (finnhub.status === 200 && Number.isFinite(finnhub.body.quote?.time) && finnhub.body.quote.time > 0) {
    // prevClose belongs to the latest daily bar before the quote's own trading day.
    const before = Object.keys(closes).filter(d => d < day(finnhub.body.quote.time)).sort().pop();
    if (before) closes[before].Finnhub = finnhub.body.quote.prevClose;
  }
  const rows = Object.entries(closes).sort(([a], [b]) => a.localeCompare(b)).map(([date, values]) => {
    const v = Object.values(values);
    const spreadPct = v.length > 1 ? (Math.max(...v) - Math.min(...v)) / Math.min(...v) * 100 : null;
    return { date, values, sources: v.length, spreadPct: spreadPct === null ? null : Math.round(spreadPct * 1000) / 1000, agree: spreadPct === null ? null : spreadPct <= AGREE_PCT };
  });
  const checked = rows.filter(r => r.sources > 1);
  send(res, 200, {
    symbol, tolerancePct: AGREE_PCT,
    providers: { 'Alpha Vantage': alpha.status === 200 ? 'ok' : alpha.body.error || 'unavailable', Tiingo: tiingo.status === 200 ? 'ok' : tiingo.body.error || 'unavailable', Finnhub: finnhub.status === 200 ? 'ok' : finnhub.body.error || 'unavailable' },
    checkedDays: checked.length, disagreements: checked.filter(r => !r.agree).length,
    verdict: !checked.length ? 'not enough sources to compare' : checked.every(r => r.agree) ? 'agree' : 'disagree', rows
  });
}

function store(key, file, data, saved, cache) {
  const record = { saved, data }; cache.set(key, record);
  try { fs.mkdirSync(cacheDir, { recursive: true }); fs.writeFileSync(file, JSON.stringify(record), 'utf8'); } catch {}
}

module.exports = { handleMarket, security, types, send };
