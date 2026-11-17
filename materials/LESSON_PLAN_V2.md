# Trading Research Academy — Curriculum V2

This plan expands the current app into a whole-market learning path. It teaches research and simulated decisions, not personalized advice or real-money execution.

## Existing Parts 1–5

Parts 1–3 retain their app content headings verbatim. The content folder currently has Parts 1, 2, and 3 only. Parts 4 and 5 below are proposed extensions, not existing lessons.

### Part 1 — Trading foundations

Keep headings from `app/content/part-1.md`. Objectives: exposure and margin; read the product; order types; size from planned loss; risk controls and review. Prerequisites: none. Sources: existing lesson Resources; SEC Investor.gov [Introduction to Investing](https://www.investor.gov/introduction-investing).

### Part 2 — Quantitative strategies

Keep headings from `app/content/part-2-quant-strategies.md`. Objectives: express rules, calculate returns, compare strategies, account for costs and uncertainty. Prerequisites: Part 1, percentages, spreadsheets. Sources: existing lesson Resources; Bailey et al., [The Probability of Backtest Overfitting](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2326253).

### Part 3 — Market microstructure

Keep headings from `app/content/part-3-microstructure.md`. Objectives: order books, liquidity, spreads, routing, impact, and limits of retail visibility. Prerequisites: Part 1. Sources: existing lesson Resources; SEC [Market Structure](https://www.sec.gov/marketstructure).

### Part 4 — Automation (written, pending review)

- **Lesson 13: How an Automated Trading System Works**
- **Lesson 14: Paper-Only Broker APIs: Concepts and Safe Habits**
- **Lesson 15: Controls: Kill Switch, Maximum Daily Loss, Position Limits, Audit Log**
- **Lesson 16: Forward Testing and Paper Runs vs. Backtests**

Prerequisites: Parts 1–3. Part 10 builds on these concepts through research and paper simulation.

### Part 5 — Discipline (written, pending review)

- **Lesson 17: Trading Psychology and Process Discipline**
- **Lesson 18: U.S. and California Consumer Safeguards**
- **Lesson 19: Tax Introduction for U.S. Traders**
- **Lesson 20: Friend-Strategy Review Rubric and Graduation Assessment**

Prerequisites: Parts 1–4. Move uncovered proposed topics—portfolio risk measures, research question and hypothesis, data provenance/licensing, experiment logs, paper portfolio review, communicating uncertainty, security/privacy, and capstone presentation—to later parts.

## New market coverage

Every lesson uses dated or clearly labeled illustrative data. It must distinguish a reference price from an executable quote.

### Part 6 — Bonds and interest rates

- **Bond cash flows and yield** — Calculate coupon, price, current yield, and yield to maturity; explain why price and yield move inversely. Prerequisites: percentages, compounding. Sources: [Investor.gov: Bonds](https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds).
- **Duration, convexity, and rate risk** — Estimate price sensitivity and explain approximation limits. Prerequisites: bond cash flows. Sources: [FINRA: Bond risks](https://www.finra.org/investors/investing/investment-products/bonds).
- **Treasury curve and policy rates** — Read yield curve shapes; separate policy rates, market yields, and inflation. Prerequisites: bond yield. Sources: [U.S. Treasury rates](https://home.treasury.gov/resource-center/data-chart-center/interest-rates); [Federal Reserve FRED](https://fred.stlouisfed.org/docs/api/fred/).
- **Credit and bond funds** — Compare sovereign/corporate credit risk, maturity, and ETF duration. Prerequisites: bond basics. Sources: Investor.gov Bonds; FINRA Bond risks.

### Part 7 — Crypto markets

- **Tokens, networks, custody** — Distinguish asset, protocol, exchange, wallet, and custody risk. Prerequisites: Part 1. Sources: [Investor.gov: Crypto assets](https://www.investor.gov/introduction-investing/investing-basics/investment-products/crypto-asset).
- **Exchange books, spread, and 24/7 trading** — Read a crypto order book and compare venue price, volume, and liquidity. Prerequisites: Part 3. Sources: [CoinGecko API](https://www.coingecko.com/en/api); [Kraken API docs](https://docs.kraken.com/api/).
- **Stablecoins and operational risk** — Explain peg, reserve, redemption, issuer, and chain risks. Prerequisites: crypto vocabulary. Sources: Investor.gov Crypto assets; provider disclosures for any cited token.
- **Crypto data lab** — Compare sampled price/volume histories and document provider scope, timestamp, and gaps. Prerequisites: Parts 2 and 5. Sources: [CoinPaprika](https://coinpaprika.com/api/); [Frankfurter](https://frankfurter.dev/).

### Part 8 — Options and futures basics

- **Calls, puts, and payoff diagrams** — Draw long call/put payoff and distinguish payoff from profit after premium. Prerequisites: algebra, Part 1 risk sizing. Sources: [OCC Options Industry Council](https://www.optionseducation.org/).
- **Premium and Greeks** — Explain intrinsic/time value, delta, theta, implied volatility, and model dependence. Prerequisites: payoff diagrams. Sources: OCC Options Industry Council.
- **Exercise, assignment, and expiration** — Walk through contract multiplier, exercise styles, assignment, and expiration risk. Prerequisites: calls and puts. Sources: [OCC Characteristics and Risks of Standardized Options](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document).
- **Futures contracts and margin** — Explain notional exposure, daily settlement, initial/maintenance margin, and roll risk. Prerequisites: Part 1 exposure and margin. Sources: [CFTC: Futures market basics](https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/FuturesMarketBasics/index.htm).
- **Derivatives risk lab** — Compare bounded-loss and potentially large-loss examples in a payoff simulator. Prerequisites: all above. Sources: OCC disclosure document; CFTC Futures Market Basics.

### Part 9 — ML for markets

- **Labels, features, and leakage** — Define prediction target and prevent future information from entering features. Prerequisites: Parts 2 and 5, basic probability. Sources: [Rotation-Index case study](research/repo-case-studies.md#rotation-index); Bailey et al., Probability of Backtest Overfitting.
- **Train, validation, and chronological holdout** — Split by time or grouped event, never randomize future market rows into training. Prerequisites: labels/features. Sources: Rotation-Index case study; scikit-learn [TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html).
- **Ridge regression and baselines** — Fit a regularized linear model and compare it with a simple mean/no-change baseline. Prerequisites: linear equations, train/test split. Sources: Rotation-Index case study; scikit-learn [Ridge](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.Ridge.html).
- **Backtest overfitting and regime change** — Explain multiple testing, survivorship, transaction costs, and unstable relationships. Prerequisites: earlier ML lessons. Sources: Bailey et al.; [RiskLens](research/repo-case-studies.md#risklens).
- **Model communication** — Report uncertainty, sample limits, data revisions, and why predictive fit does not prove profit or causality. Prerequisites: all ML lessons. Sources: all three case studies below.

**Limits:** markets are noisy and adaptive. A good historical score can be leakage, chance, or regime fit. ML cannot promise returns, remove risk, or turn correlation into causality. Baselines, holdouts, costs, and uncertainty belong beside every result.

### Part 10 — Building a Trading Bot (Lessons 21 onward)

Bot means research and paper simulation. No brokerage connection or live orders in this curriculum.

- **Lesson 21: Vektor: architecture and data pipeline** — Trace browser, API, backend services, provider validation, SQLite cache, and portfolio storage. Prerequisites: Parts 1, 4, and 5. Sources: [Vektor case study](research/repo-case-studies.md#vektor); repository README (read-only; no license).
- **Lesson 22: Vektor: clean, validate, and store prices** — Design checks for dates, OHLCV consistency, missing sessions, cache freshness, and provenance. Prerequisites: research data provenance. Sources: Vektor case study; Frankfurter API overview.
- **Lesson 23: Vektor: signals, math, and execution simulation** — Reproduce SMA/RSI signals, next-bar fills, fees, slippage, and Decimal accounting in a toy notebook. Prerequisites: Parts 2–4. Sources: Vektor case study.
- **Lesson 24: Vektor: tests and limits** — Identify no-lookahead checks, deterministic tests, provider risk, and the limits of Yahoo-derived data. Prerequisites: prior Vektor lessons. Sources: Vektor case study.
- **Lesson 25: RiskLens: portfolio risk engine** — Recreate volatility, Sharpe, drawdown, VaR/CVaR, and a stress test; state assumptions. Prerequisites: Parts 4 and 5. Sources: [RiskLens case study](research/repo-case-studies.md#risklens); SEC/FINRA bond and investing education links.
- **Lesson 26: RiskLens: data and model testing** — Trace Yahoo prices and factor CSVs, input checks, regression tests, and history-length warnings. Prerequisites: research data provenance, Parts 4 and 5. Sources: RiskLens case study.
- **Lesson 27: Rotation-Index: ridge regression and holdouts** — Reproduce a small ridge model, game-group holdout, and baseline comparison. State plainly: this is NBA data, not a market model. Prerequisites: Part 9 linear regression. Sources: [Rotation-Index case study](research/repo-case-studies.md#rotation-index).
- **Lesson 28: Rotation-Index: lineage and publication gates** — Audit source IDs, cache completeness, normalization, and fail-closed model publication. Prerequisites: research data provenance. Sources: Rotation-Index case study.
- **Lesson 29: Data to backtest** — Build an auditable pipeline with documented provider, schema, timestamps, missing values, and permitted retention. Prerequisites: prior data lessons. Sources: [API review](research/apis.md); Vektor case study.
- **Lesson 30: Backtest with baselines and costs** — Compare a simple benchmark and strategy with holdout, fees, slippage, and no-lookahead execution. Prerequisites: Parts 2 and 4. Sources: all repo case studies.
- **Lesson 31: Paper trading and review** — Run simulated orders, record reasons, compare expected/realized behavior, and stop on data errors. Prerequisites: Parts 4 and 5, backtest. Sources: Vektor case study; Ledger design lessons.
- **Lesson 32: Controls and safe failure** — Set position/exposure limits, stale-data guard, loss stop, kill switch, audit log, and manual review. Prerequisites: Parts 1 and 4. Sources: RiskLens and Vektor case studies.

## Ledger features worth adapting

Ledger-Stock-Market is MIT and designed for children. Adapt interaction patterns, not age assumptions: this academy targets a broader learner and must keep derivatives, crypto, and trading clearly simulated.

- **Scam Detective — adapt.** Scenario cards train source checking, guaranteed-return skepticism, urgency recognition, and credential safety. Avoid real personal data.
- **Bias radar — adapt.** Private reflection prompts for FOMO, loss aversion, and revenge trading help learners inspect decisions without diagnosis or public ranking.
- **Bot battles — adapt cautiously.** Use deterministic, simulated strategy comparisons with identical data, costs, and risk caps. Score process and drawdown, not only profit.
- **Academy cards — adapt.** Short cards plus retrieval quiz fit mobile learning. Keep worked examples, sources, accessible controls, and a “limits” card.

Ledger is MIT (`LICENSE` in the clone). Its Yahoo URLs are undocumented and should not be copied as a data integration.

## AI/ML options — decision for the user

| Option | Runs locally without provider? | Key and cost |
|---|---|---|
| Static lessons, quiz hints, rule-based scam feedback, chart annotations, fixed baselines | Yes | No key; no API cost |
| Ridge regression, bootstrap, backtests, portfolio metrics | Yes, using local Python/runtime libraries; browser-only implementation can use simple JavaScript math | No model-provider key; hosting/runtime cost may apply |
| Local small language model for open-ended tutor | Yes, if user device has suitable runtime and memory | No API key; hardware, download, latency, and maintenance costs |
| Hosted LLM explanations | No | Provider key required on server; usage billed by model/provider. Exact cost depends on model, prompt/output tokens, and current rates; choose provider/model and budget before enabling. |
| AI financial-data interpretation | No, if using hosted LLM | Requires data API and LLM key; separate data licensing and token costs. Never let model invent prices or execute trades. |

**Decision for user:** choose static/local-only, optional local model, or hosted LLM. Until chosen, design the course to work with AI disabled. Keep keys server-side, show sources and measured facts, and label generated text as interpretation.
