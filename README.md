# Trading Research Academy — `trading_hub`

Local-first learning and research workspace. It is not a broker, signal service, financial adviser, or automatic trading system. No broker account, live quote feed, paid service, analytics, or AI provider is connected.

## Run locally

Install Node.js. In PowerShell, run from this project folder:

```powershell
node app/server.js
```

Open <http://127.0.0.1:8000>. Stop the server with `Ctrl+C`.

## What's in the app

- Part 1 lessons from `app/content/part-1.md`, with the supplied worked examples, original quizzes/answers, assignments, and mastery checkpoints. Additional short summaries, flashcards, deterministic calculations, scenario prompts, teach-back, and lesson notes are available in each lesson.
- Misconception notebook, locally saved questions with spaced review dates, and an optional personal-memory note that is not sent to a model.
- Research inbox for user-submitted links and excerpts. External posts are not scraped; claims and user-provided excerpts remain unverified until reviewed.
- Curated resources in `app/data/research-resources.json`, grouped by topic, with metadata-check dates, limitations, incentives, and a clear distinction between page/abstract review and audiovisual/transcript review.
- Local CSV backtest lab for U.S. stocks/ETFs. Data is imported by the user, validated, previewed, held in memory, replayed without future chart bars, and passed to the deterministic engine.
- Paper order practice, trading journal, product passport, strategy worksheet, and local backup/restore from the existing academy.

Only Part 1 was supplied. Parts 2–5 and advanced electives remain “Awaiting material.” No later lessons or strategy performance were invented.

## CSV format for the backtest lab

Required headers (case-insensitive):

```csv
timestamp,open,high,low,close,volume
2024-01-02,100,102,99,101,123456
```

`date`, `datetime`, or `time` may replace `timestamp`; volume is optional. Date-only daily rows are interpreted as UTC. Intraday date-times must include `Z` or an explicit `±HH:MM` offset. Rows are sorted chronologically; duplicate timestamps, invalid OHLC bounds, nonnumeric values, and timezone-ambiguous intraday timestamps are rejected. Files are limited to 15 MB. No tradable bars are forward-filled.

The import form records symbol, venue, timeframe, chart timezone, provider/source, currency, adjustment policy, retrieval time, usage-rights attestation, coverage, volume availability, and candidate intraday gaps. These fields are user-supplied; the app does not certify provider coverage, licensing, adjustments, or calendar suitability. Raw data is not persisted or uploaded. A SHA-256 hash of normalized bars is included in experiment exports; the original CSV is not embedded.

## Current backtest rule and fill model

The one educational example is a long-only simple-moving-average crossover:

1. At a completed bar close, if the prior close is at/below the prior SMA and the current close is above the current SMA, create a buy signal.
2. Execute the signal at the next bar's open, with the configured adverse slippage.
3. If a position is open and the completed close crosses below the SMA, create an exit signal and execute it at the next bar's open.
4. Allocate a configured percentage of current cash. Fractional shares are allowed in this research model; no margin or short selling is modeled.
5. Charge the configured fee and slippage basis points on each fill. The comparison benchmark buys the same allocation at the first bar's open and marks it at the last bar's close under the same fee/slippage settings.

There are no stop/target orders, so the engine makes no claim about within-bar ordering. A signal on the last bar remains unfilled. Open positions are marked to the last close and reported separately; they are not presented as closed trades. Results include a trade ledger, gross/net P&L, fees, win rate, average win/loss, expectancy, profit factor, drawdown, equity curve, buy-and-hold comparison, and a doubled-fee/slippage sensitivity. Undefined ratios and zero-trade samples are labeled rather than fabricated.

The first run exposes fixed chronological 60/20/20 exploration partitions and marks the holdout consumed. Each partition starts a separate account and its own indicator warmup; this is a coarse check, not a statistical validation protocol. No optimizer or AI-generated executable strategy code is included. Experiment records store rule/settings versions and the normalized-data hash.

### Asset support matrix

| Asset | Status | Payoff / price units and quantity | Margin | Events and limits |
| --- | --- | --- | --- | --- |
| U.S. stocks / ETFs | Data-dependent, basic long-only slice implemented | Simplified linear USD/share, fractional shares | None modeled | Corporate actions, dividends, splits, delistings, point-in-time universe, market sessions, tick/lot increments, borrow, and shorting are not modeled. |
| Individual bonds | Not implemented | Clean/dirty price, accrued interest, face value and day-count not modeled | None | Coupon schedules, calls, redemption and defaults not modeled; yield series cannot be used as dollar prices. |
| Bond ETFs | Not implemented in the backtest adapter | Not enabled as equity-like shares | None | Fund distributions and corporate actions are not modeled. |
| Listed options | Blocked / not implemented | No contract-level payoff, option chain or multiplier handling | None | Expiry, exercise, assignment, settlement and corporate adjustments are absent. Underlying candles are not option history. |
| Spot crypto | Not implemented | Venue/quote-currency units not modeled | None | Venue fees, custody, minimums and continuous sessions not modeled. |
| Perpetuals | Blocked | Payoff/mark/index units not modeled | None | Funding history, maintenance tiers and venue-specific liquidation absent. |
| Forex | Not implemented | Pair orientation, pip units and bid/ask not modeled | None | Financing and session calendars absent. Currency conversion is unavailable. |
| Futures | Blocked | Contract multiplier, tick value, expiry/roll and settlement absent | None | Contract-specific margin/liquidation and rolls not modeled; continuous series are not executable contract history. |

Only U.S. stocks/ETFs with user-provided CSV bars can run in this slice. Provider/API coverage and data licenses have not been verified. The Yahoo authorized product, endpoint, and authentication method are still unknown; there is no Yahoo API request in this build. No source data was supplied to run a historical sample during implementation.

## AI and privacy status

No model provider is configured. “Learning assist” performs local text matching against the supplied Part 1 lesson and stores questions only when you choose to save them. It does not simulate AI responses, fetch web research, inspect video, or read personal journals. The optional memory note is local and user-controlled. No credentials or account balances are in client code. A model adapter, server-side credentials, token/cost limit, and timeout are not implemented.

Progress, notes, journal entries, questionnaires, inbox items, and experiment metadata live in browser local storage. Imported bars remain in memory for the current page session. Browser data can be cleared by the browser/device; use Settings to export or restore a JSON backup. CSV exports guard spreadsheet formula prefixes.

## Resource review status

Newly added records were checked on 2026-11-05 using the linked publisher/regulator/course page or paper abstract/metadata. The IBKR YouTube entry is **metadata/description reviewed only**; no transcript or audiovisual content was reviewed, and no timestamps are claimed. Academic articles are not reproduced here; links lead to their publishers/repositories. Course-carried references remain separately labeled with their original verification notes.

## Tests

Run from this folder:

```powershell
node --check app/app.js
node --check app/backtest/engine.js
node --check app/backtest/ui.js
node --test app/backtest/engine.test.cjs
node --test app/tests/calculations.test.cjs
```

The engine tests cover OHLC import, timezone/duplicate rejection, next-bar execution, no final-bar future fill, cost sensitivity, and formula-safe CSV export. Existing calculator tests cover sizing and exposure behavior. Browser UI and mobile accessibility still require manual review.
