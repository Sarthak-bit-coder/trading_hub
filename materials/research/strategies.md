# Backtest lab strategy catalog

Rules below are educational hypotheses, not recommendations. Daily-bar signals use information available at that session's close; executable orders fill at the next session's open, matching the current engine. A close-based stop can only be acted on after the close, so gaps can exceed the stop. No rule here guarantees profit or beats buy-and-hold.

## Engine contract

`docs/CONTRACTS.md` is absent. `app/backtest/engine.js` reads timestamp, open, high, low, close, and optional volume; it does not model splits or dividends. Existing runner supports one long position, cash, percent allocation, fees, slippage, next-open fills, equity curve, trades, and a buy-and-hold benchmark. It has no ranking, portfolio, short, cash-yield, stop-fill, risk-volatility sizing, or rebalance scheduler. All strategies need timestamp/OHLC. Volume is not required by these rules.

## 1. SMA crossover (lab baseline)

**Rule.** Parameters: fast 50 sessions, slow 200 sessions; these are common illustrative defaults, not a uniquely published canonical pair. At close `t`, compute close-based simple averages. If flat and `SMA50[t] > SMA200[t]` after `SMA50[t-1] <= SMA200[t-1]`, enter long next open. If long and `SMA50[t] < SMA200[t]` after `SMA50[t-1] >= SMA200[t-1]`, exit next open. Otherwise keep state. Allocate 100% of available equity at entry; no leverage.

**Data source.** U.S. equity/ETF: Massive Stocks Basic (EOD, split-adjusted). Spot crypto: Binance Vision daily spot klines, single venue; requires crypto support. Document adjustment policy and do not mix adjusted/raw series.

**Source.** Brock, Lakonishok & LeBaron (1992), “Simple Technical Trading Rules and the Stochastic Properties of Stock Returns,” *Journal of Finance* 47(5), DOI: https://doi.org/10.1111/j.1540-6261.1992.tb04681.x. Full text not read. The source tests moving-average rules, but does not establish this exact 50/200 pair as a canonical default; this entry is a reproducible lab convention. Sullivan, Timmermann & White (1999), “Data-Snooping, Technical Trading Rule Performance, and the Bootstrap,” https://doi.org/10.1111/0022-1082.00163 (abstract read): emphasizes data-snooping correction across rule universes.

**Weakness / decay.** Lagging signals whipsaw in sideways markets, miss initial reversals, and trade less often than short-term rules. The published technical-rule evidence is vulnerable to data snooping; no reliable universal post-publication decay estimate for this exact pair. Test out of sample, include costs, and report parameter sensitivity.

**Engine fields.** timestamp, OHLC; start equity, allocation, fees, slippage. The current engine's SMA cross trigger resembles this, but only accepts one SMA length and close-versus-SMA crossing.

## 2. RSI(2) pullback (Connors / Alvarez)

**Rule.** Published setup: 200-session SMA trend filter, 2-period RSI threshold 10, exit when close rises above 5-session SMA. At close `t`, if flat, `close[t] > SMA200[t]`, and RSI(2)[t] < 10, enter long next open. If long and `close[t] > SMA5[t]`, exit next open. Otherwise hold. Use 100% of available equity; at most one position. RSI implementation must be specified (Wilder smoothing vs simple average); source's short lookback convention should be replicated where possible.

**Data source.** U.S. equities/ETFs: Massive Stocks Basic (split-adjusted daily bars). Crypto: Binance Vision daily bars can supply prices, but RSI(2) evidence is equity-specific and venue-specific.

**Source.** Larry Connors and Cesar Alvarez (2008), *Short Term Trading Strategies That Work: A Quantified Guide to Trading Stocks*, book, https://www.tradingmarkets.com/reports/ (publisher page; no DOI). Full text not read; exact rule summarized from the book in secondary descriptions, so verify against a lawful copy before teaching as a verbatim specification. The source is a book, not a peer-reviewed paper.

**Weakness / decay.** Frequent entries, small expected move per trade, and sensitivity to spread, slippage, corporate actions, and RSI convention. Severe declines can keep price under the 200-day filter for extended periods. No primary post-publication decay estimate located; do not imply the historical edge persisted.

**Engine fields.** timestamp, close (OHLC contract still requires O/H/L), start equity, allocation, costs. Engine needs RSI and multiple rolling averages; no new data field.

## 3. Donchian / Turtle System 1 breakout

**Rule.** Turtle defaults: 20-session entry breakout, 10-session opposite-channel exit, 20-session ATR-like `N`, 2N protective stop; position unit sized so a 1N price move equals 1% of equity. At close `t`, enter long next open if close exceeds the highest high of prior 20 completed sessions and flat. Set stop at entry fill minus 2N. While long, exit next open if close is below the lowest low of prior 10 completed sessions or close is at/below stop. For a clean daily-bar implementation, define stop execution explicitly; a close-trigger/next-open exit is conservative and is not the original intraday stop. One unit only; omit shorting, pyramids, and System 1 post-winning-breakout filter in this simplified variant.

**Data source.** U.S. stocks/ETFs: Massive Stocks Basic. Crypto: Binance Vision daily spot klines. Need high/low for channels and true range; volume unused.

**Source.** Richard Dennis and William Eckhardt's Turtle rules, republished as “The Original Turtle Trading Rules,” https://www.originalturtles.org/ (original course document; published copy scanned/available as PDF). Full text not read; scanned rule sheets not reliably text-readable, so cite as not read. Numeric settings above also appear in Curtis Faith (2007), *Way of the Turtle*, ISBN 978-0071486644; this secondary account is not used as primary evidence.

**Weakness / decay.** Breakouts produce many false starts in range-bound assets; exits give back open gains, and stop/position sizing depends on gap and volatility assumptions. Original rules targeted diversified futures with leverage and pyramiding, so a single unlevered equity/crypto adaptation is materially different. No defensible post-publication decay estimate established here.

**Engine fields.** timestamp, OHLC, start equity, fees/slippage. Needs rolling highs/lows, true range, stop state, and risk-based sizing; engine lacks stop orders and volatility sizing.

## 4. Time-series momentum (12-month sign)

**Rule.** Paper evaluates lookbacks from 1 to 12 months, not one uniquely mandated default. Lab convention uses 12 months (~252 U.S. sessions; crypto calendar uses 365 daily bars). At close `t`, calculate trailing total price return `close[t] / close[t-L] - 1`. If flat and return > 0, enter next open; if long and return <= 0, exit next open. Size at 100% equity, long/flat. This is a single-asset, unscaled adaptation of the paper's diversified futures portfolios.

**Data source.** U.S. equities/ETFs: Massive Stocks Basic, subject to its two-year history limit on Basic; that is too short for meaningful long-horizon validation. Crypto: Binance Vision daily spot bars; treat each symbol as one venue's price.

**Source.** Tobias J. Moskowitz, Yao Hua Ooi, and Lasse Heje Pedersen (2012), “Time series momentum,” *Journal of Financial Economics* 104(2), 228–250, https://doi.org/10.1016/j.jfineco.2011.11.003. Full text read. Study's tested universe is futures across equity indices, currencies, commodities, and bonds, not individual U.S. stocks or spot crypto.

**Weakness / decay.** The paper reports persistence over 1–12 months and partial reversal at longer horizons; it does not promise a single-asset rule will work. Trend strategies can suffer abrupt reversals and prolonged flat/cash periods. Cross-asset diversification and volatility scaling are omitted here. No post-publication decay claim made for this adaptation.

**Engine fields.** timestamp, close (OHLC still required), start equity, allocation, costs. Needs a trailing return window; no cross-asset data in current engine.

## 5. Dual momentum / Global Equities Momentum (Antonacci)

**Rule.** Published GEM uses a monthly decision among U.S. equities, international equities, and U.S. aggregate bonds. At month-end compare 12-month total returns of U.S. equities and international equities. Hold the higher-return equity fund if its return exceeds the 12-month Treasury-bill return; otherwise hold bonds. Rebalance at next session open. Equal one-asset allocation, long-only. This catalog records the rule but marks it **not runnable in the current single-symbol engine**. Do not substitute price-only signals for total returns without labeling the change.

**Data source.** Massive Stocks Basic can supply U.S. ETF bars, but lacks international-equity and bond/T-bill coverage here; FRED can supply selected rates but yields are not investable total-return bars. Therefore no complete recommended-source set in `data-sources.md` supplies GEM's required assets; add licensed total-return series before running.

**Source.** Gary Antonacci (2014), “Risk Premia Harvesting Through Dual Momentum,” *Journal of Financial Planning*, https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2042750. Full text read. Published rules are portfolio-level monthly rules.

**Weakness / decay.** Results depend on benchmark selection, total-return adjustments, monthly timing, and the defensive asset. Relative ranking forces an equity choice even when both equity markets fall; absolute filter addresses that by switching defensive. Historical results are sample-sensitive; no post-publication decay estimate claimed here. Strategy cannot be validated with one asset series.

**Engine fields.** Timestamp and adjusted close for all candidate assets plus benchmark T-bill total-return series; monthly scheduling, ranking, multi-asset positions, and full-rebalance sizing are missing from engine. Required OHLC fields still apply to each CSV.

## 6. 200-day trend filter (Faber)

**Rule.** Faber’s monthly 10-month SMA rule is the published default; 200 daily sessions is only an approximate adaptation. At each month-end close, if close > 10-month SMA, target 100% long; otherwise target 0% (cash). Submit rebalance for next session open. No additional entry/exit buffer. Do not silently call 200 daily bars identical: month-end sampling is part of published specification.

**Data source.** U.S. equities/ETFs: Massive Stocks Basic, split-adjusted. Crypto: Binance Vision spot daily bars are technically usable, but Faber's tests do not validate crypto.

**Source.** Mebane T. Faber (2007), “A Quantitative Approach to Tactical Asset Allocation,” *The Journal of Wealth Management*, 10(3), 2007, https://doi.org/10.3905/jwm.2007.698039. Full text read.

**Weakness / decay.** Monthly sampling still exits after deterioration and re-enters after recovery, creating whipsaw and possible missed rebound. Cash return is not modeled by a price-only engine. Faber's paper discusses historical samples; it does not establish persistent future outperformance. No independent post-publication decay number asserted.

**Engine fields.** timestamp, close (OHLC required), start equity, costs, and cash yield if modeled. Needs month-end scheduler and 10-month average; current engine evaluates daily and treats cash as zero-yield.

## 7. Cross-sectional momentum (Jegadeesh–Titman)

**Rule.** Original paper tests winner/loser portfolios across 3–12-month formation and holding periods. Lab convention: each month rank a fixed, survivorship-bias-controlled U.S. stock universe by prior 12-to-2-month total return (skip latest month); buy top decile equal-weighted, hold six months, and refresh monthly with overlapping cohorts. For long-only use winner decile only; sell positions leaving eligible top decile at rebalance. These 12/2 and six-month settings are a reproducible adaptation, not a claim that paper uniquely chose them.

**Data source.** Massive Stocks Basic lacks broad long history (two years on Basic) and point-in-time universe/total-return histories. EODHD Free is listed for one year only. No recommended source in `data-sources.md` is sufficient for valid historical constituent tests; name the required source as a licensed survivorship-bias-controlled total-return panel, not a currently approved provider.

**Source.** Narasimhan Jegadeesh and Sheridan Titman (1993), “Returns to Buying Winners and Selling Losers: Implications for Stock Market Efficiency,” *Journal of Finance* 48(1), 65–91, https://doi.org/10.1111/j.1540-6261.1993.tb04702.x. Full text read.

**Weakness / decay.** The authors report that part of first-year abnormal return dissipates over the following two years; this is reversal after formation, not proof the strategy vanished. Momentum crashes can occur after market rebounds, and turnover, delistings, survivorship bias, and trading costs matter. Original long-short results do not transfer directly to long-only portfolios.

**Engine fields.** Per-symbol timestamp, adjusted close, point-in-time universe membership, dividends/splits, and ranking panel; multi-asset positions, monthly cohorts, and portfolio weights unavailable. Volume unnecessary.

## Shared teaching guardrails

- Signals use only completed bars. Fill next open; record fees, slippage, and any overnight gap.
- Use split-adjusted equity prices consistently. Dividend reinvestment needs total-return data or explicit cash distributions; current engine models neither corporate actions nor dividends.
- Spot-crypto daily bars run continuously, unlike U.S. exchange sessions. Define 365-day lookbacks and UTC cutoffs; do not copy a 252-session equity window without labeling it.
- Report source sample periods when quoting source performance. This catalog gives no performance figures because no rule is claimed to beat buy-and-hold.
- Run untouched out-of-sample periods and parameter-sensitivity checks. Published rules selected after historical testing carry data-snooping and implementation risk.

