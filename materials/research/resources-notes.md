# Research resources draft: notes

Companion to `resources-draft.json` (40 records, same schema as `app/data/research-resources.json`, no id or URL overlap with the 12 existing records). Verified 2026-11-16 and 2026-11-17. Each record's `verification` field records what was actually fetched.

Lesson keys: **P3** = Part 3 microstructure, **P4** = Part 4 automation/execution, **P5** = Part 5 discipline/safeguards/tax.

## Critical content update: the PDT rule is gone

FINRA Regulatory Notice 26-10 (2026-04-20) replaced the pattern day trader designation, the 4-trades-in-5-days count and the $25,000 minimum with intraday margin standards. The change took effect **2026-06-04**, and firms may phase it in until **2027-10-20**. Investor.gov's PDT glossary entry already says this. Any course text that teaches the $25k PDT rule as current must be revised. It should also explain that a student's broker may still apply the old rules during the transition, or stricter house rules.

## By topic

### Order types and execution (P3, P4)
- `sec-executing-order`: Investor.gov, Executing an Order (P3)
- `nasdaq-order-types`: Nasdaq order types and modifiers PDF, 2022 (P3)
- `mit-gensler-trading`: MIT 15.S08 Lecture 9, Trading and Capital Markets (P3)
- Already in the app: `sec-order-types` (Investor Bulletin on order types)

### Margin and leverage (P3, P5)
- `finra-margin-calls`: Know What Triggers a Margin Call, 2026-06-04 (P5)
- `cftc-futures-basics`: CFTC Basics of Futures Trading (P3)
- `finra-rule-4210`, `reg-t-12cfr220`: primary rule texts, instructor reference (P5)

### Market microstructure, spreads, market impact (P3)
- `sec-hft-litreview`: SEC staff HFT literature review, 2014
- `fed-quoted-spreads-machine-trading`: FEDS Note on spreads under stress, 2020
- `ucph-hft-lecture`: UCPH microstructure Lecture 12 part 1 (part 2: https://www.youtube.com/watch?v=DSrvRW8cuAo)
- `mit-gensler-trading` (also listed above)
- Gap: **market impact** has no dedicated verified resource. Almgren & Chriss, "Optimal Execution of Portfolio Transactions" (Journal of Risk, 2001), is the standard reference, but I found only paywalled or unofficial PDF copies, so it is not in the JSON.

### High-frequency trading basics (P3)
- `sec-hft-litreview`, `ucph-hft-lecture`, `fed-quoted-spreads-machine-trading`
- Not included: FEDS Note "How Do Principal Trading Firms and Dealers Trade around FOMC Statement Releases?" (Harkrader & Weitz, 2020-12-31). It was verified but is Treasury-specific. Add it if P3 needs more examples.

### Broker APIs and automated execution, paper trading only (P4)
- `alpaca-paper-trading`: the page lists what paper fills ignore (impact, slippage, queue, fees)
- `ibkr-tws-api-config`: paper port 7497 vs. live 7496, and the Read-Only default. These make a good "stay in paper" safeguard checklist.
- `qc-paper-trading`: QuantConnect simulated fills
- Already in the app: `ibkr-paper-video`
- Also verified but not included: IBKR Campus "Python API – Requesting Market Data" (published 2020-08-28, modified 2026-06-22) and IBKR docs "Using a Paper Account" (modified 2026-07-30)

### Backtesting pitfalls, overfitting, walk-forward, data snooping (P4)
- `quantopian-l19-overfitting`: Quantopian/QuantRocket Lecture 19
- `deflated-sharpe-ratio`: Bailey & López de Prado, 2014
- `lopezdeprado-overfitting-video`: **uncertain provenance** (third-party upload)
- `chan-chatwithtraders-052`: Ernie Chan interview, 2016
- `sec-performance-claims`: SEC warning on hypothetical back-tested results
- Already in the app: `backtesting-harvey-liu`, `pbo-bailey`
- Gap: no dedicated **walk-forward** resource was verified. PBO, Deflated Sharpe and Harvey-Liu cover the out-of-sample and multiple-testing ideas.

### Position sizing and risk of ruin (P5)
- `thorp-kelly-criterion`: Thorp 1997, Kelly sizing (third-party academic host)
- `carver-how-much-risk`: Carver blog, half-Kelly and risk targets
- Thin coverage. A video talk by Carver (Pepperstone Talks, "Systematic Trading and Trend Following 101", https://www.youtube.com/watch?v=duc9vJCfThs, 2022-06-16, 16:53) was verified but left out because it is on a broker channel.

### VaR, CVaR and volatility targeting (P5)
- `mit-var-lecture`: MIT 18.S096 Lecture 7, VaR
- `quantopian-l40-var-cvar`: VaR and CVaR notebook
- `man-vol-targeting`: Harvey & Korgaonkar, Man Group
- `nber-vol-managed-portfolios`: Moreira & Muir, 2016/2017

### Trading psychology and discipline (P5)
- `barber-odean-hazardous`: Trading Is Hazardous to Your Wealth, 2000
- `barber-odean-behavior`: The Behavior of Individual Investors, 2013
- `kahneman-nobel-lecture`: Maps of Bounded Rationality, 2002
- Gap: no practitioner discipline content (journaling, rule-following) from a reputable free source was verified.

### U.S. retail trader rules: PDT, Reg T, FINRA margin (P5)
- `finra-rn-26-10`: **primary source for the PDT replacement**
- `sec-pdt-glossary`: plain-language version, including the transition caveat
- `finra-intraday-trading-basics`: free-riding, good-faith violations, $2,000 minimum, 90-day freezes
- `finra-margin-calls`, `finra-rule-4210`, `reg-t-12cfr220`

### U.S. tax basics for traders (P5)
- `irs-pub-550`: capital gains and wash sales (Pub. 550, 2025)
- `irs-topic-429`: trader vs. investor status, 475(f) election
- `irs-form-6781`: Section 1256 contracts. The 60/40 split is in the form instructions, which I did not review.
- `irs-digital-assets`: crypto tax basics and broker reporting
- Also verified but not included: IRS Topic 409, Capital gains and losses (last reviewed 2026-11-09), and Investor.gov's "Wash Sales" glossary entry

### California consumer protections, DFPI (P5)
- `dfpi-investment-scams`: updated 2026-04-22
- `dfpi-crypto-scam-tracker`: reported losses are unverified, per DFPI
- Also verified but not included: DFPI press release "DFPI Launches Sweep of Investment Fraud Claiming Ties to Artificial Intelligence" (2023-04-19)

### Recognizing scams and unverified performance claims (P5, also P4 for bots)
- `cftc-ai-trading-bots`: the title uses "SI" (super intelligence); URL now at SITradingBots.html
- `sec-ai-investment-fraud`: joint SEC/NASAA/FINRA alert, 2024
- `sec-social-media-stock-scams`: 2026-02-06
- `sec-performance-claims`: 2022-09-15
- `nfa-basic`: futures/forex registration lookup
- Already in the app: `sec-social-risk`, `sec-day-trading`

## By lesson

- **Part 3 (microstructure):** sec-executing-order, nasdaq-order-types, mit-gensler-trading, cftc-futures-basics, sec-hft-litreview, fed-quoted-spreads-machine-trading, ucph-hft-lecture
- **Part 4 (automation/execution):** alpaca-paper-trading, ibkr-tws-api-config, qc-paper-trading, quantopian-l19-overfitting, deflated-sharpe-ratio, lopezdeprado-overfitting-video, chan-chatwithtraders-052, sec-performance-claims, cftc-ai-trading-bots
- **Part 5 (discipline/safeguards/tax):** thorp-kelly-criterion, carver-how-much-risk, mit-var-lecture, quantopian-l40-var-cvar, man-vol-targeting, nber-vol-managed-portfolios, barber-odean-hazardous, barber-odean-behavior, kahneman-nobel-lecture, finra-rn-26-10, sec-pdt-glossary, finra-intraday-trading-basics, finra-margin-calls, finra-rule-4210, reg-t-12cfr220, irs-pub-550, irs-topic-429, irs-form-6781, irs-digital-assets, dfpi-investment-scams, dfpi-crypto-scam-tracker, sec-ai-investment-fraud, sec-social-media-stock-scams, nfa-basic

## Verification caveats

- **Videos:** metadata only (title, channel, upload date, duration, description). No audiovisual content was watched and no transcripts were read. No timestamps were recorded.
- **Blocked sites:** investor.gov, sec.gov, ssrn.com, ams.org and interactivebrokers.com returned 403 to WebFetch. Where possible I fetched them with curl. sec.gov later rate-limited curl as well.
- **Partial reads:** these pages were only partly read because they are very long: FINRA 4210, IRS Pub 550, the DFPI tracker, and both Quantopian notebooks.
- **Uncertain or third-party hosting:** `lopezdeprado-overfitting-video` (unofficial channel), `thorp-kelly-criterion` (course-page host), `reg-t-12cfr220` (Cornell LII; official ecfr.gov blocked automated access).
- **No date shown on page:** man-vol-targeting, cftc-ai-trading-bots, cftc-futures-basics, sec-executing-order, qc-paper-trading.

## Dead or unusable links found

- 404: `https://www.finra.org/investors/investing/investment-products/stocks/purchasing-on-margin`
- 404: Investor.gov "trading-cash", "investor-bulletin-understanding-margin-accounts" and "red-flags-fraud" paths
- 404: CFA Institute RF 2015 PDF path
- 404: edwardothorp.com Kelly PDF
- 404: federalreserve.gov `regtcg.htm`
- Wrong target: `chatwithtraders.com/?p=836` loads the site homepage, not the Ernie Chan episode. The YouTube copy is used instead.
- SSL certificate failure: `lucylabs.gatech.edu/ml4t` (Georgia Tech ML4T) and Berkeley Haas HTML pages. The PDFs on Haas downloaded fine.
- Timeouts or 403: CME Group course pages ("Things to Know Before Trading CME Group Futures", Market by Order). Not included.
- Not found: no Two Sigma/AQR-specific item was newly verified (AQR is already in the app), and no Covel interview transcript was found. The Kaufman/Covel Trend Following Radio Ep. 253 video was verified (2023-01-27, 41:59, https://www.youtube.com/watch?v=oykL8fuGuzg) but left out to stay within 40.
