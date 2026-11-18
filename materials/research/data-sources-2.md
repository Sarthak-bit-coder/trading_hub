# Data-source terms check

Retrieved 2026-11-17 from provider or project-owner pages. **Unverified** means the requested fact was not confirmed in a readable first-party source. This is a research note, not legal advice. Recheck terms and rate limits before production use.

## Finnhub free tier

| Question | Finding |
|---|---|
| US stock daily candles endpoint | `/stock/candle` (documented endpoint; API docs page loaded without readable body). Parameters commonly include symbol, resolution, from, and to. Free-tier access: **unverified**. |
| US stock quote endpoint | `/quote` (documented endpoint; API docs page loaded without readable body). Free-tier access: **unverified**. |
| Rate limit | Finnhub terms state an overall cap of **30 API calls per second**, in addition to plan limits. The free-plan per-minute limit was **not verified** from readable first-party pricing text. Do not rely on third-party reports of 60/min until the current pricing page is readable. |
| Historical candles free? | **Unverified.** The official Stock Candles documentation and pricing pages were fetched but exposed no readable content. Do not assume historical candles are included in free access. |
| Attribution | **Unverified.** The terms page reviewed did not specify a market-data attribution requirement. |
| Personal / commercial use | All plans listed on Finnhub are for personal use unless explicitly stated otherwise. Personal plans cannot be used by a business, even internally, without written approval. Redistribution or sharing access to data or derived results with any third party requires written approval. |
| Server-side use | Finnhub exposes HTTP API endpoints, so server-side requests are technically possible. Contractual permission for server-side processing/public display is **unverified**; the personal-use and no-redistribution terms above apply. Keep keys server-side, but do not interpret that as a grant to republish data. |

Sources retrieved 2026-11-17: [Finnhub API docs: quote](https://finnhub.io/docs/api/quote), [Finnhub API docs: stock candles](https://finnhub.io/docs/api/stock-candles), [Finnhub pricing](https://finnhub.io/pricing-stock-api-market-data), [Finnhub terms of service](https://finnhub.io/terms-of-service). The API docs and pricing pages rendered no readable text in this check. The terms page was readable and explicitly states the personal-use, redistribution, and 30-calls/second limits.

## Tiingo free Starter tier

| Question | Finding |
|---|---|
| End-of-day stock prices | Starter is $0/month and pricing lists Tiingo EOD Composite Prices. EOD API gives daily OHLCV and adjusted/raw values. The pricing page reports 500 unique symbols/month, 50 requests/hour, 1,000 requests/day, and 1 GB monthly bandwidth. |
| Crypto | Pricing lists Tiingo Crypto on Starter. Crypto docs describe historical price requests and aggregate OHLCV. They report coverage above 8,000 tickers; the product page says coverage changes over time. |
| Limits | Starter: 500 unique symbols/month; 50 requests/hour; 1,000/day; 1 GB/month. No minute- or second-level rate cap is described in Tiingo's general API docs. |
| Attribution | **Unverified.** The provider pages reviewed do not state a specific attribution string or requirement for Starter data. |
| Terms | Pricing labels Starter “Internal Use Only” and defines internal use as personal use only, with no display or sharing to another person or organization. Commercial use requires an appropriate paid/commercial plan; the docs direct commercial users to upgrade. The page's Power plan also says Internal Use Only; do not infer a redistribution grant from paid access. |
| Storage | Existing repo research notes Tiingo's Starter terms prohibit persistent/durable storage. This check did not retrieve a readable first-party clause on storage; **reverify before relying on it**. The current no-display/share restriction already rules out publishing the feed to learners. |

Sources retrieved 2026-11-17: [Tiingo pricing](https://www.tiingo.com/pricing), [general API docs](https://www.tiingo.com/documentation/), [EOD API docs](https://www.tiingo.com/documentation/end-of-day), [EOD product page](https://www.tiingo.com/products/end-of-day-stock-price-data), [crypto API docs](https://www.tiingo.com/documentation/crypto). Limits and internal-use language are listed on the pricing page; account-specific terms may add restrictions.

## TradingView Lightweight Charts

| Question | Finding |
|---|---|
| License | Apache-2.0, confirmed on npm and project docs. |
| Attribution requirement | Include the attribution notice from the package's `NOTICE` file and a link to `https://www.tradingview.com/` on a public page of the site or app. The library's `attributionLogo` option can satisfy the link requirement, but the `NOTICE` attribution notice is still required. |
| Current stable npm version | **5.3.0**, npm `latest` tag checked 2026-11-17. |
| UMD/IIFE standalone filename | `lightweight-charts.standalone.production.js` (IIFE, global `window.LightweightCharts`). Development build: `lightweight-charts.standalone.development.js`. |

Sources retrieved 2026-11-17: [Lightweight Charts getting started](https://tradingview.github.io/lightweight-charts/docs/5.0), [npm package](https://www.npmjs.com/package/lightweight-charts), [release notes](https://tradingview.github.io/lightweight-charts/docs/release-notes). “UMD” is the requested label; the project's docs call this build **IIFE**.

## TradingView embeddable widgets

TradingView advertises its widgets as free to embed on websites and provides default TradingView branding. Its terms require attribution to remain clearly visible on external use of TradingView products and specifically say attribution on widgets must remain as originally designed. Its widget FAQ provides embedding instructions and does not list an educational-site exclusion. Therefore, a **free educational site appears allowed to embed the standard branded widget**, subject to current Terms of Use, data availability, and preserving the built-in branding/attribution. This is an interpretation of the official pages, not a bespoke written approval from TradingView. (Retrieved 2026-11-17.)

Widget attribution: keep the built-in TradingView branding/link visible and unaltered. Do not remove or cover it. The official policy's general wording for chart/product attribution is a visible reference to TradingView; for a graphic or video where it is not visible, it gives “Charts by TradingView” as an example and requires at least 13 px / 10 pt. Preserve the widget's own attribution in the embed. (Retrieved 2026-11-17.)

Sources retrieved 2026-11-17: [free widgets](https://www.tradingview.com/widget/), [widget FAQ](https://www.tradingview.com/widget-docs/faq/general/), [widget formats](https://www.tradingview.com/widget-docs/widget-formats/), [TradingView terms and attribution policy](https://www.tradingview.com/policies/). Widgets use TradingView-hosted data; they do not expose an API for extracting that data. TradingView's terms restrict non-display use and use of TradingView content to build competing services.
