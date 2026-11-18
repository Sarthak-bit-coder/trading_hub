// Popular symbols for the pickers, and real-price lookups through the app's market API.
(function (root) {
  const STOCKS = {
    AAPL: 'Apple', MSFT: 'Microsoft', NVDA: 'NVIDIA', AMZN: 'Amazon', GOOGL: 'Alphabet', META: 'Meta Platforms', TSLA: 'Tesla',
    AVGO: 'Broadcom', 'BRK.B': 'Berkshire Hathaway', JPM: 'JPMorgan Chase', V: 'Visa', MA: 'Mastercard', UNH: 'UnitedHealth',
    LLY: 'Eli Lilly', JNJ: 'Johnson & Johnson', XOM: 'Exxon Mobil', WMT: 'Walmart', PG: 'Procter & Gamble', HD: 'Home Depot',
    COST: 'Costco', NFLX: 'Netflix', AMD: 'AMD', INTC: 'Intel', KO: 'Coca-Cola', PEP: 'PepsiCo', DIS: 'Disney', BA: 'Boeing',
    CRM: 'Salesforce', ORCL: 'Oracle', ADBE: 'Adobe', PLTR: 'Palantir', UBER: 'Uber',
  };
  const ETFS = {
    SPY: 'S&P 500 ETF', QQQ: 'Nasdaq-100 ETF', DIA: 'Dow Jones ETF', IWM: 'Russell 2000 ETF', VTI: 'Total US market ETF',
    VOO: 'Vanguard S&P 500 ETF', TLT: '20+ year Treasury ETF', SHY: '1-3 year Treasury ETF', GLD: 'Gold ETF', XLK: 'Tech sector ETF',
  };
  // Crypto symbol -> CoinPaprika id (quotes) and Kraken pair (daily bars).
  const CRYPTO = {
    'BTC-USD': ['btc-bitcoin', 'XBTUSD', 'Bitcoin'], 'ETH-USD': ['eth-ethereum', 'ETHUSD', 'Ethereum'], 'SOL-USD': ['sol-solana', 'SOLUSD', 'Solana'],
    'XRP-USD': ['xrp-xrp', 'XRPUSD', 'XRP'], 'ADA-USD': ['ada-cardano', 'ADAUSD', 'Cardano'], 'DOGE-USD': ['doge-dogecoin', 'XDGUSD', 'Dogecoin'],
    'AVAX-USD': ['avax-avalanche', 'AVAXUSD', 'Avalanche'], 'LINK-USD': ['link-chainlink', 'LINKUSD', 'Chainlink'],
    'LTC-USD': ['ltc-litecoin', 'LTCUSD', 'Litecoin'], PEPE: ['pepe-pepe', 'PEPEUSD', 'Pepe'],
  };
  const isCrypto = s => Object.hasOwn(CRYPTO, s);
  const all = () => [...Object.keys(STOCKS), ...Object.keys(ETFS), ...Object.keys(CRYPTO)];
  const label = s => STOCKS[s] || ETFS[s] || CRYPTO[s]?.[2] || '';
  const category = s => isCrypto(s) ? 'Crypto' : ETFS[s] ? 'ETFs' : 'Stocks';

  const round = p => p >= 1 ? Math.round(p * 100) / 100 : +Number(p).toPrecision(6);
  async function get(url) {
    const r = await fetch(url), j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) throw new Error(j.error || 'HTTP ' + r.status);
    return j;
  }
  // Latest price: Finnhub quote for stocks/ETFs, CoinPaprika for listed crypto.
  async function quote(symbol) {
    const s = String(symbol).toUpperCase();
    if (isCrypto(s)) {
      const j = await get('/api/market/crypto/paprika/today?coin=' + encodeURIComponent(CRYPTO[s][0]));
      return { price: round(j.quote.c), time: j.quote.time, provider: 'CoinPaprika', category: 'Crypto' };
    }
    if (/-USD$/.test(s)) throw new Error('This crypto is not in the list yet. Try BTC-USD, ETH-USD or SOL-USD.');
    const j = await get('/api/market/finnhub?symbol=' + encodeURIComponent(s));
    return { price: round(j.quote.c), time: j.quote.time, provider: 'Finnhub', category: category(s) };
  }
  root.MarketSymbols = { all, label, category, isCrypto, quote, krakenPair: s => CRYPTO[String(s).toUpperCase()]?.[1] || null, stocks: () => [...Object.keys(STOCKS), ...Object.keys(ETFS)] };
})(typeof window !== 'undefined' ? window : globalThis);
