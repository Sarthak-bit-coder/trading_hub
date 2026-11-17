# Browser-app market API review

**Retrieved 2026-11-17.** Public-APIs source index: [Cryptocurrency, Finance, Currency Exchange](https://github.com/public-apis/public-apis#readme). That index labels authentication, HTTPS, and CORS, but those labels are leads only; each provider row below uses provider documentation. “Browser” means direct browser fetch, not a secret-bearing production client. No undocumented endpoint or scraping recommended.

## Best candidates (ranked)

1. **Frankfurter** — best browser-safe currency lesson: keyless; provider explicitly documents open CORS; no monthly/daily quota, with abuse rate limiting; daily reference rates across 219 currencies and 39 assets from 112 central banks, history to 1948. Commercial use of blended rates and local caching are allowed; direct provider rates retain source terms. Redistribution policy beyond use/display is not clearly specified. It is a reference-rate service, not intraday FX trading. Sources retrieved 2026-11-17: [API overview and terms](https://frankfurter.dev/), [JavaScript/CORS](https://frankfurter.dev/javascript/).
2. **CoinPaprika** — best keyless crypto teaching/demo candidate, but only if app is personal/noncommercial: free, no key; CORS allowed; 20,000 calls/month/IP and 10 requests/second; 2,000 assets and one year daily prices, latest full-day OHLCV. Requires “Powered by CoinPaprika”; no commercial use on free tier, and redistribution to customers requires Enterprise. Terms retrieved 2026-11-17: [pricing and scope](https://coinpaprika.com/api/), [API terms](https://coinpaprika.com/api-terms-of-use/), [developer docs](https://coinpaprika.com/developers).
3. **Alpha Vantage** — broadest single-provider educational market coverage: stocks, ETFs, FX, crypto, indicators, and economic series; free key; 25 requests/day on general free access, with unlimited requests claimed for verified open-source/educational projects. Historical daily data generally available; realtime and 15-minute US equity data are premium and licensed. CORS is not explicitly promised in reviewed provider material: verify in target browser before selection. Do not expose a shared key in a public app; no general raw-data redistribution permission found. Commercial use requires contacting provider. Sources retrieved 2026-11-17: [free key/rate limit](https://www.alphavantage.co/support/api-key/), [docs and coverage](https://www.alphavantage.co/documentation/), [market data policy](https://www.alphavantage.co/realtime_data_policy/), [terms](https://www.alphavantage.co/terms_of_service/).
4. **CoinGecko** — broad aggregated crypto market/on-chain coverage, but free Demo is for testing/exploration, not commercial display: key required; 100 calls/minute and 10,000/month; attribution mandatory. Free Demo cannot be used commercially; paid plans allow commercial display with attribution, while redistribution needs custom rights. Provider reviewed pages do not explicitly promise browser CORS; test before calling directly. Avoid shipping a shared key in client code. Sources retrieved 2026-11-17: [plans/coverage](https://www.coingecko.com/en/api), [key setup](https://support.coingecko.com/articles/9471335603-user-guide-how-to-sign-up-for-coingecko-demo-api-and-generate-an-api-key), [license distinctions](https://support.coingecko.com/articles/1043089972-what-are-the-differences-between-commercial-and-custom-licenses).
5. **Kraken public market data** — useful exchange-specific crypto prices/candles for market-structure exercises; public endpoints may be called without a private account key, but provider CORS and reuse rights are not established in the reviewed documentation. Rate limits depend on endpoint and request pattern; confirm current limits before use. Keep it optional until direct browser CORS and data terms are verified. Sources retrieved 2026-11-17: [REST API introduction](https://docs.kraken.com/exchange/guides/rest/introduction), [API docs](https://docs.kraken.com/api/).

## Other entries in the three index sections

Entries below are rejected for this browser-only curriculum until provider-owned policies establish the missing terms. Public-APIs directory flags are not guarantees of permitted use.

### Cryptocurrency

- **Coinbase, Gemini, Gate.io, Kraken, Binance, Bitfinex, KuCoin, MEXC, OKX, Poloniex, WhiteBIT, VALR, Mercado Bitcoin, Indodax, Paribu, NovaDAX, EXMO, CoinMarket, dYdX, and CryptoMarket:** exchange-specific or trading-oriented; no sufficiently verified combination of browser CORS, educational redistribution, and stable free limits for this app.
- **Coinlore, CoinRanking, CryptoCompare, CoinDesk, Cryptonator, CoinMarketCap, CoinLayer, CoinAPI, Coinpaprika (commercial use), CoinCap, Messari, WorldCoinIndex, Nomics, and CryptoKeyhole:** data may fit, but reviewed provider terms do not establish all requested browser, caching, and public display rights on a suitable free plan. CoinPaprika keyless personal use is the scoped exception above.
- **Infura, Solana JSON RPC, SoChain, Mempool, Ethplorer, and ZMOK:** infrastructure, chain state, or wallet endpoints; not a general multi-asset market feed, and public browser credentials/limits require separate diligence.
- **CryptAPI, Nexchange, NiceHash, Localbitcoins, and payment/exchange-operation APIs:** transaction or service APIs, not a suitable market-data source.
- **NFT, on-chain wallet, prediction-market, niche token safety, sentiment, mining, and new/low-documentation entries:** skip for first release; limited teaching value for whole-market basics and terms/CORS not sufficiently established.

### Finance

- **Barchart OnDemand, IG, Tradier:** potentially useful, but free-plan scope, market-data licensing, direct browser security, and redistribution limits need explicit provider confirmation; Tradier tokens must not be exposed in a browser.
- **Plaid and YNAB:** account aggregation/budgeting, not market prices; credentials and user financial data make them inappropriate for this lesson app.
- **Razorpay IFSC:** bank-branch codes, not securities or FX data.
- **Alpha Vantage:** selected above.

### Currency Exchange

- **Currencylayer, CurrencyAPI, CurrencyFreaks, ExchangeRate-API, Fixer, Open Exchange Rates, and other key-based converters:** provider plans vary; do not choose until current browser CORS, anonymous-key exposure, free limits, data freshness, commercial display, and caching terms are confirmed.
- **Currency-api / community-hosted converters:** unclear operator, durability, and rights; not a production dependency.
- **Frankfurter:** selected above.

## Product decision

Use Frankfurter for a currency conversion lesson. Use local synthetic fixtures for core stock/ETF, bond/rate, and options/futures lessons until a server-side provider and display license are chosen. CoinPaprika is suitable only for a noncommercial/personal prototype. Do not put provider secrets in browser code. The five ranked services do not replace exchange-licensed real-time market data.

**Claims date:** all provider facts above retrieved 2026-11-17. Policies, prices, and limits can change; recheck provider terms before release.
