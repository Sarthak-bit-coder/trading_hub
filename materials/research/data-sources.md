# Market-data source evaluation (U.S. stocks/ETFs, spot crypto, rates)

Retrieved 2026-11-16 to 2026-11-17. Each source below lists its own retrieval date.
Scope: daily (and intraday where offered) OHLCV for U.S. stocks/ETFs and spot crypto, plus rates/macro series, for the local-only educational app.
Project rules applied: no scraping, no undocumented endpoints, no credentials in client code, and licensing taken only from the provider's own pages.

**This is not legal advice.** The quotes are short excerpts. Read the full terms before relying on any source. Anything not confirmed on a provider's own page is marked **not verified**. Some pages could not be read here: Stooq (JavaScript bot wall), the FMP pricing and terms pages (HTTP 403), the Nasdaq Data Link docs and terms (redirect to a 404), nasdaq.com (timeout), and the Coinbase terms page (HTTP 403). For those pages, the notes come from search-engine excerpts of the official page or are marked not verified.

## How this fits the app

- The backtest lab takes a `timestamp,open,high,low,close,volume` CSV. Date-only daily rows are read as UTC, and intraday rows need `Z` or an offset. Raw bars stay in memory and are not persisted (README, "CSV format").
- Only U.S. stocks/ETFs run today. Spot crypto is "Not implemented", and corporate actions are not modeled (README, "Asset support matrix"). So for equities, pick **one** adjustment policy (split-adjusted, or split+dividend) and record it in the import form.
- The user, not the app, downloads the file. Even so, the licence has to allow the learner to **save a CSV on their own disk**. That rules out Tiingo Free (see below).

## Comparison table: licensing

| Source | Personal/educational use | Local storage | Redistribution | Auth | Cost (entry) |
|---|---|---|---|---|---|
| **FRED (St. Louis Fed)** | Yes, explicitly | Not restricted for own use; check per-series copyright | Third-party copyrighted series need permission | Free API key (API); none for site download | Free |
| **Binance Vision bulk files** (data.binance.vision) | Yes: "academic research, non-monetized open educational projects" | Implied by CC BY-NC-SA 4.0 | Non-commercial only, with attribution and share-alike | None | Free |
| **Coinbase Exchange public candles** | Yes: "personal or research purposes" | Not verified (full terms page returned 403) | No app for other end users; redistribution goes through authorized partners | None | Free |
| **Massive (formerly Polygon.io) Stocks Basic** | Yes: "personal, non-business and non-commercial" | **Yes, explicitly**: "access, download, store and use" | No: "does not permit you to share Information with anyone else" | API key (query or Bearer header) | $0 |
| **EODHD Free** | Yes (Non-Professional User) | **Yes, explicitly**: "store, manipulate, and analyze… private, non-commercial" | No | `api_token` | $0 |
| **Alpha Vantage Free** | Not explicitly stated; commercial use needs contact | Not addressed in the terms text read | Not addressed in the terms text read | Free API key | $0 |
| **Alpaca Market Data Basic** | Not verified: official terms not retrieved | Not verified | Not verified | Key ID + secret headers | Free |
| **Kraken public OHLC / bulk OHLCVT** | Not explicitly granted for market data | Not addressed | General ToS bars making "Our Content" available to third parties | None | Free |
| **Binance REST klines** | Governed by general Binance Terms of Use: not verified | Not verified | Not verified | None (public) | Free |
| **Tiingo Free (Starter)** | "personal or internal business purposes" | **No**: Starter may not retain data "in any persistent or durable storage" | No | Token | $0 |
| **Financial Modeling Prep Basic** | Personal licence (search excerpt of official terms) | Not verified | No display or redistribution without written approval (excerpt) | `apikey` | $0 |
| **U.S. Treasury yield-curve CSV** | No terms shown on the page; not verified | Not verified | Not verified | None | Free |
| **Cboe VIX history CSV** | Disclaimer only; no licence grant | Not stated | Not stated | None | Free |
| **Nasdaq Data Link** | Terms not retrievable: not verified | Not verified | Not verified | `api_key` | Free key; equity EOD is premium |
| **Stooq** | **Not verified** (terms page behind a JS check) | Not verified | Not verified | None | Free |
| **Yahoo Finance** | No official market-data API exists. Site terms forbid automated collection | Site terms forbid creating "any database, archive" from data | Forbidden | n/a | CSV export needs a Gold subscription |
| **nasdaq.com historical page** | Not verified (timed out) | Not verified | Not verified | None | Free |
| **SEC EDGAR** | Public access; no OHLCV prices | n/a | n/a | User-Agent header | Free |

## Comparison table: data

| Source | History | Resolutions | Adjustments | Delay | Rate limit | Hand CSV download |
|---|---|---|---|---|---|---|
| FRED | Series-dependent (DGS10 from 1962-01-02) | Native frequency; API aggregates d/w/bw/m/q/sa/a | n/a (rates) | Daily update | Not stated numerically ("may impose limits") | `/data/<ID>` text page; API `file_type=csv` (zip) |
| Binance Vision | Not stated on the page (not verified; examples date from 2017–2020) | 1s, 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1mo | n/a (spot) | Daily files arrive the next day; monthly files on the first Monday | None (static files) | Download zip + `.CHECKSUM`; no header row; **microsecond timestamps from 2025-01-01** |
| Coinbase candles | Not stated (not verified) | 60, 300, 900, 3600, 21600, 86400 s | n/a | Live; "should not be polled frequently" | Public: 10 req/s per IP, burst 15 | No UI; needs a script with 300-candle pages |
| Massive Basic | **2 years** (Basic) | Any (minute to month) via the aggregates endpoint | `adjusted=true` (split) by default | End-of-day (Basic) | 5 calls/min (search excerpt of the pricing page) | Browser URL returns JSON; needs conversion |
| EODHD Free | **1 year** on Free (30+ years paid) | d/w/m (Free has no intraday) | Raw OHLC + `Adjusted_close` (split+div); volume split-adjusted | EOD | 20 calls/day, 20/min | Browser URL with `fmt=csv` returns `Date,Open,High,Low,Close,Adjusted_close,Volume` |
| Alpha Vantage Free | `compact` = latest 100 points; `full` (25+ yr) is premium | Daily free; intraday is premium | `TIME_SERIES_DAILY` is raw; adjusted is premium | Daily | 25 requests/day | `datatype=csv` in a browser URL |
| Alpaca Basic | Since 2016 | 1–59Min, 1–23Hour, 1Day, 1Week, 1–12Month | `adjustment=raw/split/dividend/spin-off/all` | Free: SIP history must be ≥15 min old | 200 calls/min | No UI; script needed |
| Kraken REST OHLC | **Last 720 candles only** | 1, 5, 15, 30, 60, 240, 1440, 10080, 21600 min | n/a | Live | Not stated for public endpoints | n/a |
| Kraken bulk OHLCVT | Full pair history through 2026-09-30, plus quarterly ZIPs | 1, 5, 15, 60, 240, 720, 1440 min | n/a | Quarterly | n/a | ZIP (full history ~5×2 GB parts); no header row; epoch seconds |
| Binance REST klines | Any range via start/end | 1s through 1M | n/a | Live | Weight 2 per call; per-IP limits; 429/418 bans | n/a |
| Tiingo Free | 30+ years | Daily (+ resample) | Raw + adjOpen/High/Low/Close/Volume, divCash, splitFactor | ~5:30 PM ET | 50/hr, 1,000/day, 500 symbols/mo | `format=csv`, **but storage is prohibited on Free** |
| FMP Basic | 5 years (search excerpt) | EOD | Not verified | EOD | 250/day (search excerpt) | Not verified |
| Treasury yield curve | Current page 2023+; archive for earlier years | Daily | n/a | Daily | n/a | Year CSV link on the TextView page |
| Cboe VIX | 1990 to present | Daily | n/a | Daily | n/a | `VIX_History.csv` link |
| Nasdaq Data Link | WIKI prices frozen since 2018 (third-party reports; not verified) | — | — | — | Anonymous: 20 per 10 min, 50/day; keyed: 300 per 10 s, 2,000 per 10 min, 50,000/day (from a search excerpt) | Not verified |

## Ranked recommendations (best-licensed first)

### (a) U.S. equities, daily

1. **Massive Stocks Basic.** This is the only free equity source whose own terms explicitly let an individual "access, download, store and use the Information" for personal, non-business use. It has a documented `adjusted` flag. Limits: 2 years of end-of-day history, 5 calls/min, and JSON only, so a converter step is needed. There is a 30-day delete-on-termination duty.
2. **EODHD Free.** Its terms explicitly let Non-Professional Users "store, manipulate, and analyze the data for private, non-commercial purposes". It offers a native CSV and a clearly documented adjustment rule (raw OHLC plus a split+dividend `Adjusted_close`). Limits: 1 year of history and 20 calls/day. The `demo` token covers AAPL.US, TSLA.US, VTI.US and AMZN.US without signup. Note that `Adjusted_close` changes over time.
3. **Alpaca Basic.** It has the best technical fit: data since 2016, explicit `adjustment` modes, and intraday bars. But Alpaca's own market-data licence text was **not verified**, so do not adopt it until those terms are read.
4. **Alpha Vantage Free.** The free tier gives only the latest 100 raw daily bars at 25 requests/day. The terms read here do not address storage. Use it only for tiny demos.
5. **Not recommended:**
   - **Tiingo Free:** persistent storage is prohibited on Starter.
   - **FMP:** terms not readable.
   - **Stooq:** terms not verifiable.
   - **Nasdaq Data Link:** no current free equity EOD data.
   - **nasdaq.com:** not verified.
   - **Yahoo:** no official API, and its terms ban automated collection and databases.

### (b) Spot crypto, daily and intraday

1. **Binance Vision bulk files (data.binance.vision).** These come under an explicit CC BY-NC-SA 4.0 licence that names "non-monetized open educational projects". They are static files with SHA-256 checksums and cover resolutions from 1s to 1mo. Two cautions: archives "may be updated at a later date", and spot timestamps are in microseconds from 2025-01-01. Whether Binance services are available in the learner's jurisdiction is **not verified**.
2. **Coinbase Exchange public candles.** No authentication. The terms explicitly allow "personal or research purposes" but bar building an app "for use by end users other than for you". Requests are capped at 300 candles each, and the resolutions are 1m, 5m, 15m, 1h, 6h and 1d.
3. **Kraken bulk OHLCVT CSV.** Deep history, but no data licence is published, and the general Terms of Service forbid making "Our Content" available to third parties. The REST OHLC endpoint returns only the last 720 candles.
4. **Binance REST klines.** Technically excellent, but only the general Terms of Use apply, which were **not verified**. Prefer the bulk files.

### (c) Rates and macro

1. **FRED.** Its terms explicitly say "you are free to use FRED for your own non-commercial, educational, and personal uses". It requires citation and a FRED API notice. Check each series for third-party copyright: the DGS10 page shows a generic "Data in this graph are copyrighted" banner, but its notes contain no "Copyright" marker.
2. **U.S. Treasury Daily Par Yield Curve CSV.** This is the primary source, with no key needed. Treasury's site-policy page did not state a copyright or licence position, so **not verified**.
3. **Alpha Vantage `TREASURY_YIELD`.** This is a re-serve of FRED and is bound by the FRED API terms. It adds nothing over FRED.

Rates are yields, not prices. Per the asset matrix, they must not be fed into the equity backtester as dollar bars.

## Per-source notes and quotes

### Yahoo Finance (retrieved 2026-11-16/17)
- **Official API: none found.** `developer.yahoo.com` lists Sign In With Yahoo, advertising tools and open-source projects, with "no Yahoo Finance market-data API" listed (https://developer.yahoo.com/).
- **`yfinance` is unofficial.** It wraps undocumented endpoints, which violates the project's no-undocumented-endpoints rule.
- **Terms** (https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html):
  - You may not "access or collect data… from our Services using any automated means… including… robots, spiders, scrapers, data mining tools".
  - You may not use data "to create any database, archive".
- **Manual export:** "Downloading historical data is available with a Yahoo Finance Gold subscription." The page also says: "This feature isn't available for all instruments due to data licensing restrictions" (https://help.yahoo.com/kb/SLN2311.html, search excerpt; Gold pricing conflicts across Yahoo pages, so it is not verified).
- **Verdict:** keep the existing `yahoo-finance-authorized-api` entry blocked.

### Stooq (retrieved 2026-11-17)
- `https://stooq.com/db/h/`, `https://stooq.com/q/d/?s=spy.us` and `https://stooq.com/terms.html` all return "This site requires JavaScript to verify your browser".
- A third-party R package says the data "can be only used under terms and conditions defined at: https://stooq.com/terms.html". The terms themselves are **not verified**.
- Adjustments, limits and history are all **not verified**.

### Binance (retrieved 2026-11-16/17)
- **Docs:**
  - Bulk files: https://github.com/binance/binance-public-data
  - REST: https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints
- **Terms:** https://github.com/binance/binance-public-data/blob/master/TERMS_AND_CONDITIONS.md
  - "Datasets are provided to you under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0".
  - "Permitted non-commercial uses are limited to academic research, non-monetized open educational projects".
  - "any commercial utilization requires a separate, written enterprise data license agreement".
  - The dataset terms are supplemental to the Binance Terms of Use.
- **Bulk file format:**
  - Path: `/data/spot/monthly/klines/{SYMBOL}/{interval}/{SYMBOL}-{interval}-{YYYY-MM}.zip`, with a matching `.CHECKSUM` file.
  - Columns: Open time, Open, High, Low, Close, Volume, Close time, Quote volume, Trades, Taker buy base, Taker buy quote, Ignore.
- **REST klines:**
  - `GET /api/v3/klines`, weight 2, max 1000 rows, no key needed for `NONE`-security endpoints.
  - A market-data-only base exists at `https://data-api.binance.vision`.
  - Limits are per IP. Clients get 429 on overrun and a 418 auto-ban that runs from 2 minutes up to 3 days (https://developers.binance.com/docs/binance-spot-api-docs/rest-api/limits).
- **Hand CSV:**
  1. Download the monthly zip and its `.CHECKSUM`.
  2. Verify with `certutil -hashfile <zip> SHA256` on Windows.
  3. Unzip, keep columns 1–6, and add a header row.
  4. Convert open time (ms before 2025, µs from 2025) to ISO-8601 with `Z`.

### Kraken (retrieved 2026-11-16/17)
- **REST** (https://docs.kraken.com/api/docs/rest-api/get-ohlc-data):
  - `GET https://api.kraken.com/0/public/OHLC`, no auth.
  - "Up to 720 of the most recent entries are returned". The last entry is the uncommitted current candle.
- **Bulk** (https://support.kraken.com/hc/en-us/articles/360047124832, updated 2026-11-02):
  - Columns: timestamp, open, high, low, close, volume, trades. No header row; gaps are not zero-filled.
  - The only legal text is "These materials are for general information purposes only."
- **Terms** (https://www.kraken.com/legal/global-terms §9): users may not "commercially exploit or make available to any third party Our Content in any way" or "create, use, operate, or employ any bots, robots, parsers, spiders, scripts".
- **Public REST rate limit:** not stated (**not verified**).

### Coinbase Exchange (retrieved 2026-11-16/17)
- **Docs:** https://docs.cdp.coinbase.com/exchange/reference/exchangerestapi_getproductcandles
  - `GET https://api.exchange.coinbase.com/products/{id}/candles`, no auth, max 300 candles per request.
  - Rows are `[time, low, high, open, close, volume]`. **Note the order.**
  - No candle is published for intervals with no ticks.
- **Rate limit:** public endpoints allow 10 req/s per IP, burst 15 (https://docs.cdp.coinbase.com/exchange/rest-api/rate-limits).
- **Terms** (https://www.coinbase.com/legal/market_data; the page itself returned 403, so this quote is from the official page as indexed in search):
  - The docs say "By accessing the Exchange Market Data API, you agree to be bound by the Market Data Terms of Use".
  - Use is "exclusively for you or your entity's personal or research purposes and may not be used to build an application intended for use by end users other than for you".

### FRED (retrieved 2026-11-16/17)
- **API docs:** https://fred.stlouisfed.org/docs/api/fred/series_observations.html
  - Key required. `file_type` is xml, json, xlsx or csv; csv comes as a zip with a README.
  - `limit` is at most 100000. ALFRED vintages are available.
- **API terms** (https://fred.stlouisfed.org/docs/api/terms_of_use.html):
  - Apps must display: "This product uses the FRED® API but is not endorsed or certified by the Federal Reserve Bank of St. Louis."
  - Data series "may be owned by third parties and subject to copyright restrictions".
  - There is no numeric rate limit.
- **Site terms** (https://fred.stlouisfed.org/legal/):
  - "you are free to use FRED for your own non-commercial, educational, and personal uses".
  - "please cite the source of the data and note that it was accessed via FRED".
- **Hand CSV:** `https://fred.stlouisfed.org/data/DGS10` shows the full DATE/VALUE text list (DGS10 runs from 1962-01-02). The series-page download button was **not confirmed** by fetch.

### U.S. Treasury (retrieved 2026-11-17)
- **Page:** https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value=2026
- **CSV link pattern:** `/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/2026/all?type=daily_treasury_yield_curve&field_tdr_date_value=2026&page&_format=csv`
- **Coverage:** 1 Mo through 30 Yr. Years before 2023 are in a separate archive.
- **Licence:** the site-policy page has no licence or public-domain statement (**not verified**).

### Alpha Vantage (retrieved 2026-11-17)
- **Docs** (https://www.alphavantage.co/documentation/):
  - `TIME_SERIES_DAILY` is raw, and "The "full" outputsize is available to premium keys".
  - `TIME_SERIES_DAILY_ADJUSTED` and intraday are premium.
  - `DIGITAL_CURRENCY_DAILY` has no premium label. It is "refreshed daily at midnight (UTC)" and its venue is unspecified.
  - `TREASURY_YIELD` is FRED-sourced.
- **Free limit** (https://www.alphavantage.co/support/): "25 API requests per day".
- **Terms** (https://www.alphavantage.co/terms_of_service/, PDF):
  - Users intending commercial use "please contact us".
  - The licence is "non-exclusive, non-sublicensable, non-transferable, non-assignable, revocable".
  - No storage or redistribution clause was found in the extracted text.

### Tiingo (retrieved 2026-11-17)
- **Docs:** https://www.tiingo.com/documentation/end-of-day
  - `https://api.tiingo.com/tiingo/daily/<ticker>/prices`
  - Fields include adjOpen through adjVolume, `divCash` and `splitFactor`.
  - Data is ready around 5:30 PM ET, with corrections until about 8 PM ET.
- **Pricing** (https://www.tiingo.com/about/pricing): Starter is $0 with 50/hr, 1,000/day, 500 symbols/month and 1 GB/month, labelled "Internal Use Only".
- **Terms** (https://www.tiingo.com/tos):
  - §1.6(a): on Starter and trial plans "you may not write, save, archive, back up, or otherwise retain Tiingo Data in any persistent or durable storage".
  - §7.3: "All data via the API is for internal consumption only."
- **Verdict:** incompatible with a save-a-CSV workflow on the free plan.

### Massive, formerly Polygon.io (retrieved 2026-11-17)
- polygon.io now 301-redirects to massive.com.
- **Docs** (https://massive.com/docs/rest/stocks/aggregates/custom-bars):
  - `GET /v2/aggs/ticker/{t}/range/{mult}/{timespan}/{from}/{to}`.
  - `adjusted` defaults to true (splits). `limit` is at most 50000.
  - Basic is "end-of-day" with 2 years of history; full history starts 2003-09-10.
- **Auth:** `apiKey` query parameter or `Authorization: Bearer` (https://massive.com/docs/rest/quickstart).
- **Pricing:** the pricing page fetched here showed only paid plans. The free Basic terms ($0, 5 calls/min, 2 years, EOD) come from a search excerpt of https://massive.com/pricing.
- **Terms** (https://massive.com/legal/individuals-terms-of-service and https://massive.com/legal/market-data-terms-of-service):
  - "solely for your own personal, non-business and non-commercial use"
  - "access, download, store and use the Information included in your plan"
  - "This license does not permit you to share Information with anyone else"
  - On termination, delete "within thirty (30) days, including downloaded files, stored copies and caches".

### EODHD (retrieved 2026-11-17)
- **Docs** (https://eodhd.com/financial-apis/api-for-historical-data-and-volumes):
  - `https://eodhd.com/api/eod/{SYMBOL}.US?api_token=…&fmt=csv&from=&to=&period=d`
  - OHLC is raw. `Adjusted_close` is split- and dividend-adjusted. Volume is split-adjusted.
  - The `demo` token covers AAPL.US, TSLA.US, VTI.US, AMZN.US, BTC-USD.CC and EURUSD.FOREX.
- **Pricing** (https://eodhd.com/pricing): Free is 20 calls/day and 1 year of EOD with no intraday. Paid starts at $19.99/mo for 30+ years.
- **Terms** (https://eodhd.com/financial-apis/terms-conditions):
  - Non-Professional Users "are permitted to store, manipulate, and analyze the data for private, non-commercial purposes".
  - Prohibited: "Selling, reselling, retransmitting, redistributing, displaying, or granting access to the Information".

### Nasdaq Data Link (retrieved 2026-11-17)
- The docs and terms pages redirect to a 404 (`data.nasdaq.com/accesstools`), so the terms are **not verified**.
- Rate limits come from a search excerpt of https://docs.data.nasdaq.com/docs/rate-limits:
  - Anonymous: "20 calls per 10 minutes and 50 calls per day".
  - Keyed: "300 calls per 10 seconds, 2,000 calls per 10 minutes and 50,000 calls per day".
- QuoteMedia US EOD is listed as Premium. The free WIKI prices are reported frozen since 2018-04-11 by third parties (**not verified**).

### Financial Modeling Prep (retrieved 2026-11-17)
- The official pricing and terms pages returned HTTP 403. Search excerpts of the official pages say:
  - The Basic plan is free with "250 calls per day", end-of-day data and a 5-year range (https://site.financialmodelingprep.com/api/pricing-md).
  - The licence is "strictly for their own personal, non-business and non-commercial purposes", with no public display or distribution without approval (https://site.financialmodelingprep.com/terms-of-service, dated 2023-08-01).
- Adjustment fields: **not verified**.

### Alpaca Market Data (retrieved 2026-11-17)
- **Docs:**
  - Plans: https://docs.alpaca.markets/docs/about-market-data-api. Basic is free, uses the IEX live feed, allows 200 historical calls/min and has history since 2016. The historical limit is "Latest 15 minutes". Basic is the default for paper and live accounts.
  - Bars: https://docs.alpaca.markets/reference/stockbars. `GET https://data.alpaca.markets/v2/stocks/bars` with `adjustment=raw|split|dividend|spin-off|all` and `feed=sip|iex|…`.
  - Auth: `APCA-API-KEY-ID` and `APCA-API-SECRET-KEY` headers. These must never be in client code; if used at all, they belong in a server-side or user-run script.
- Crypto bars now come from Alpaca's own venue only.
- **Market-data licence and redistribution terms:** **not verified.** The FAQ links to no terms.

### Official exchange and regulator downloads (retrieved 2026-11-17)
- **Cboe:** `https://cdn-api.cboe.com/api/global/us_indices/daily_prices/VIX_History.csv` covers 1990 to the present. The page carries a disclaimer only: data "is compiled for the convenience of site visitors and is furnished without responsibility for accuracy". No licence is granted. VIX is an index, not tradable OHLCV.
- **SEC EDGAR:** filings and XBRL only, with **no OHLCV price data**. "Current max request rate: 10 requests/second", and a declared User-Agent is required (https://www.sec.gov/os/accessing-edgar-data).
- **nasdaq.com historical page:** timed out twice, so it is **not verified**.

## Proposed `providers.json` entries (top 4)

```json
[
  {
    "id": "fred",
    "name": "FRED (Federal Reserve Bank of St. Louis) — rates/macro series",
    "status": "researched; manual CSV download only; not implemented (yield series are not tradable price bars)",
    "network": false,
    "credentials": false,
    "coverage": "U.S. Treasury constant-maturity yields (e.g. DGS10), policy rates and macro series; some series are third-party copyrighted",
    "historicalDepth": "Series-dependent; DGS10 from 1962-01-02 (checked 2026-11-17)",
    "resolution": "Native series frequency (daily for DGS*); API can aggregate to w/bw/m/q/sa/a",
    "delay": "Updated after source release (DGS10 last updated 2026-11-16)",
    "adjustments": "Not applicable (percent yields)",
    "apiLimits": "No numeric limit published; FRED 'may impose limits' (https://fred.stlouisfed.org/docs/api/terms_of_use.html)",
    "pricing": "Free",
    "license": "Own non-commercial, educational and personal use permitted; cite source and 'accessed via FRED'; check per-series copyright notes (https://fred.stlouisfed.org/legal/, retrieved 2026-11-17)",
    "authentication": "None for site download (fred.stlouisfed.org/data/<ID>); free API key for api.stlouisfed.org, which must stay out of client code",
    "nextRequirement": "Rates/yield asset type in the app (yields cannot be imported as equity bars); per-series copyright check recorded at import"
  },
  {
    "id": "binance-vision-bulk",
    "name": "Binance Vision public data (data.binance.vision) — spot klines",
    "status": "researched; manual file download only; not implemented (spot crypto not supported by backtester)",
    "network": false,
    "credentials": false,
    "coverage": "Binance spot pairs (single venue, not a consolidated price)",
    "historicalDepth": "Not stated on official page (not verified); files exist per pair/month",
    "resolution": "1s, 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1mo",
    "delay": "Daily files next day; monthly files first Monday of month",
    "adjustments": "Not applicable; archived files may be revised later (checksums published)",
    "apiLimits": "Static files; none published",
    "pricing": "Free",
    "license": "CC BY-NC-SA 4.0; permitted non-commercial uses include 'non-monetized open educational projects'; commercial use needs a written licence (https://github.com/binance/binance-public-data/blob/master/TERMS_AND_CONDITIONS.md, retrieved 2026-11-17)",
    "authentication": "None",
    "nextRequirement": "Spot-crypto asset support; converter for no-header 12-column files and ms (pre-2025) / µs (2025+) timestamps; jurisdiction availability not verified"
  },
  {
    "id": "coinbase-exchange-candles",
    "name": "Coinbase Exchange public candles API",
    "status": "researched; not implemented",
    "network": false,
    "credentials": false,
    "coverage": "Coinbase Exchange spot products (single venue)",
    "historicalDepth": "Not verified",
    "resolution": "60, 300, 900, 3600, 21600, 86400 seconds",
    "delay": "Live; provider says historical rates should not be polled frequently",
    "adjustments": "Not applicable; intervals with no ticks have no candle",
    "apiLimits": "Max 300 candles/request; public endpoints 10 req/s per IP, burst 15",
    "pricing": "Free",
    "license": "Market Data Terms: 'exclusively for you or your entity's personal or research purposes' and not for apps for other end users (https://www.coinbase.com/legal/market_data; page returned 403, quote from indexed official text, retrieved 2026-11-17)",
    "authentication": "None for market data",
    "nextRequirement": "User-run script (not in-app fetch) or future server adapter; note row order [time, low, high, open, close, volume]; read full terms directly"
  },
  {
    "id": "massive-stocks-basic",
    "name": "Massive (formerly Polygon.io) Stocks Basic — aggregates",
    "status": "researched; not implemented",
    "network": false,
    "credentials": false,
    "coverage": "All U.S. stock tickers",
    "historicalDepth": "2 years on Basic (full history from 2003-09-10 on higher plans)",
    "resolution": "Custom aggregates (minute to month) via /v2/aggs; Basic data is end-of-day",
    "delay": "End-of-day on Basic",
    "adjustments": "adjusted=true (split-adjusted) by default; adjusted=false for raw; dividend adjustment not verified",
    "apiLimits": "5 calls/minute on Basic (from search excerpt of official pricing page; not shown on fetched page)",
    "pricing": "$0 Basic (not verified on fetched page)",
    "license": "Personal, non-business, non-commercial; may 'access, download, store and use'; no sharing; delete within 30 days after licence ends (https://massive.com/legal/market-data-terms-of-service, retrieved 2026-11-17)",
    "authentication": "API key via apiKey query parameter or Authorization: Bearer header; must stay out of client code",
    "nextRequirement": "User-run JSON-to-CSV conversion script or server-side adapter; record adjustment policy at import"
  }
]
```

EODHD Free is the runner-up for U.S. equities, with explicit local-storage rights and native CSV but only 1 year of history. Alpaca becomes a candidate once its market-data licence is read.
