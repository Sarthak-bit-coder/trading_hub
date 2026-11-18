# Trading Research Academy — Part 5: Discipline
Discipline curriculum for the Trading Research Academy. Educational simulation only. All portfolio values, tax calculations, and account examples are hypothetical unless a source is cited. Nothing here is a recommendation to trade any product, to adopt any tax position, or to engage any financial professional. Tax content is for educational purposes only and is not tax advice; consult a qualified tax professional for your specific situation.

## Start Here
Parts 1–4 covered what to trade, how to size it, what strategies look like in a backtest, and how an automated system works. Part 5 asks: what happens inside the trader's head, what rules protect retail traders in the United States and California, what does the IRS expect, and how do you know when a strategy is ready to share or graduate? The goal is to finish the course with a complete, honest picture of what systematic trading costs — psychologically, legally, and financially — before anything touches a live account.

## Course map
Available: Part 1 — exposure, products, orders, margin and basic sizing (Lessons 1–4).
Available: Part 2 — quantitative strategies, risk modeling, systematic execution and parameter optimization (Lessons 5–8).
Available: Part 3 — limit order books, liquidity and market impact, U.S. order routing, and high-frequency order-book dynamics (Lessons 9–12 in `app/content/part-3-microstructure.md`).
Available: Part 4 — how an automated trading system works, paper-only broker APIs, controls and forward testing (Lessons 13–16 in `app/content/part-4-automation.md`).
Available: Part 5 — discipline, U.S./California safeguards, tax introduction, friend-strategy rubric and graduation assessment (Lessons 17–20, this file).

---

## Lesson 17 — Trading Psychology and Process Discipline
### Objective and prerequisites
Identify five cognitive biases that affect retail traders, describe how a written trading process counteracts them, and explain how a trading journal functions as a discipline tool — not a performance diary.

Prerequisites: Lessons 1–4 (products, sizing, orders). Lessons 5–8 (strategy design, backtesting). Recommended: Lesson 15 (controls) for the connection between process discipline and system controls.

### Explanation and vocabulary
Research on individual investor behavior consistently documents that retail traders underperform passive benchmarks by a margin large enough to exceed plausible transaction costs — a gap the academic literature attributes substantially to behavioral patterns rather than to information disadvantage alone.

Barber and Odean (2000) analyzed 66,465 households with brokerage accounts from 1991 to 1996. Households that traded the most earned an annualized return of 11.4%, versus 18.5% for the market; trading costs explained only part of the gap. The authors concluded that overconfidence — in particular, overconfidence about the precision of private information — led to excessive trading. (Source: Barber, B.M. and Odean, T., "Trading Is Hazardous to Your Wealth: The Common Stock Investment Performance of Individual Investors," *Journal of Finance*, 55(2), 2000. See resources-notes.md: `barber-odean-hazardous`.)

Barber and Odean (2013) surveyed the broader behavioral-finance literature on individual investors, covering disposition effect, attention-driven buying, local bias, and trend chasing. (Source: Barber, B.M. and Odean, T., "The Behavior of Individual Investors," in *Handbook of the Economics of Finance*, 2013. See resources-notes.md: `barber-odean-behavior`.)

Daniel Kahneman's Nobel lecture (2002) synthesized the heuristics-and-biases research program: availability, representativeness, and anchoring as sources of systematic prediction error. (Source: Kahneman, D., "Maps of Bounded Rationality: Psychology for Behavioral Economics," *American Economic Review*, 93(5), 2003. See resources-notes.md: `kahneman-nobel-lecture`.)

**Five biases most relevant to retail traders:**

**1. Overconfidence.** Traders overestimate the accuracy of their predictions and the quality of their signal. The result is excessive position size and excessive turnover. Mitigation: apply sizing rules from Parts 1–2 mechanically; do not override position limits based on a "strong feeling."

**2. Disposition effect.** Traders tend to sell winners too early (to lock in gains) and hold losers too long (to avoid realizing a loss). This reverses the correct behavior in a momentum strategy and distorts tax outcomes. Mitigation: use a signal-based exit rule and execute it regardless of the unrealized P&L on the position.

**3. Recency bias.** Traders weight recent performance — their own or the market's — too heavily relative to the full distribution. A good week causes overconfidence; a bad week causes abandonment of a valid strategy. Mitigation: evaluate strategy performance over a statistically meaningful sample, not the last five days.

**4. Attention bias (attention-driven buying).** Retail investors are more likely to buy stocks that have recently been in the news, had an unusual price move, or appeared on a most-active list — not because those stocks have better expected returns, but because they attracted attention. Mitigation: trade only signals defined before the bar opens; do not add symbols to the universe based on what appeared in a news feed that day.

**5. Loss aversion.** Losses loom larger than equivalent gains (Kahneman, 2002). This leads traders to close winning positions prematurely and to stay in losing positions past any rational threshold. It also causes traders to abandon systematic rules when a drawdown feels unbearable, often at the worst possible time. Mitigation: define the maximum acceptable drawdown before trading starts; if it is breached, stop and review — but that review is a structured process, not an emotional override.

**The written trading process.** A trading process is a written document that specifies, in advance and in enough detail that another person could follow it, exactly what the system does: which signals it generates, how positions are sized, what controls are active, and under what conditions the system is modified or stopped. The process document exists because:

- When a drawdown happens (and it will), the question is whether the system behaved as designed. Without a process document, that question cannot be answered.
- Modifying a system during a drawdown is statistically equivalent to overfitting on recent data. The process document makes "I changed the parameters after a loss" visible and therefore accountable.
- A process that can be written down can be tested. A process that lives only in the trader's head cannot.

**The trading journal.** A trading journal is not a P&L diary. It is a record of:
1. What the system did (matches the audit log from Lesson 15).
2. Whether the trader followed the process (did you override a signal? did you skip the reconciliation step?).
3. What was learned (did the fill quality match expectations? did a data feed behave unexpectedly?).

A journal entry asking "how did I feel about today's performance?" is not useful. A journal entry asking "did I follow step 4 of the process?" is. The journal is a process-compliance tool.

Vocabulary:
- Overconfidence: a cognitive bias in which an agent overestimates the accuracy of their own predictions or private information.
- Disposition effect: the tendency to sell winners too early and hold losers too long, relative to what a rational strategy would dictate.
- Recency bias: weighting recent observations more heavily than the full historical distribution.
- Attention bias: buying or trading in assets that have recently attracted media or platform attention, independent of expected return.
- Loss aversion: the tendency to weight losses more heavily than equivalent gains; documented in Kahneman's prospect theory framework.
- Trading process: a written, ex-ante specification of every step the trading system takes.
- Trading journal: a process-compliance log distinct from a P&L diary.
- Drawdown: the peak-to-trough decline in portfolio value over a defined period. Part 2 covers drawdown statistics.

Formulas (plain text):
- None specific to this lesson. Drawdown and position-sizing formulas are in Parts 1–2.

### Worked example
Hypothetical scenario. All returns and account values are illustrative.

**Setup.** A trader runs a hypothetical daily mean-reversion strategy on five symbols, using a 1% volatility target per position (Part 2 sizing). The strategy had a hypothetical backtest Sharpe ratio of 0.8 and a maximum drawdown of 12%.

**Month 1 — normal operation.** The strategy produces small daily gains and losses. The trader follows the process, runs the audit log, and writes three journal entries: "Signal fired correctly on AAA and BBB. Skipped signal on CCC because feed was stale — control handled it correctly. No overrides." Process compliance: 100%.

**Month 2 — four-week drawdown.** The strategy loses 7% over four weeks. The trader's journal entries shift: "I think the volatility regime has changed. I'm thinking about adding a third symbol from the news. I almost overrode the exit signal on BBB to hold longer." These are warning signs of recency bias and attention bias.

The process document says: "Do not modify universe or parameters during a drawdown. Review only after a full calendar month of data at drawdown levels." The trader reads the process document, records "temptation to override — did not act on it," and continues.

**Month 3 — partial recovery.** The strategy recovers 4%. The trader's journal records that the two non-override decisions in Month 2 were process-compliant and that adding the news-based symbol would have added correlation and not improved performance, based on a hypothetical out-of-sample check.

**Lesson from the example.** The drawdown did not prove the strategy was broken; it proved the strategy was in drawdown. Only the process document made it possible to distinguish "working as designed under a losing streak" from "broken." Without the document, every drawdown is an ambiguous invitation to override.

### Common mistakes
1. Using the trading journal to track P&L rather than process compliance. P&L is already in the audit log. The journal's job is to record whether the trader followed the rules.
2. Modifying position sizes or signals during a drawdown without a pre-specified review trigger. If the process does not specify when and how parameters are reviewed, every drawdown becomes an opportunity for recency bias to masquerade as analysis.
3. Confusing a bad week with a broken strategy. A strategy with a Sharpe ratio of 0.8 and 20% annualized volatility will have weeks that feel catastrophic. That is not a signal; it is variance.
4. Setting the maximum drawdown threshold for review after experiencing the drawdown, rather than before. The threshold must be in the process document before trading starts.
5. Not keeping the process document version-controlled. If parameters are changed, the old version must be preserved so the change history is auditable.

### Resources
- Barber, B.M. and Odean, T., "Trading Is Hazardous to Your Wealth: The Common Stock Investment Performance of Individual Investors," *Journal of Finance*, 55(2), 773–806, 2000. https://faculty.haas.berkeley.edu/odean/papers%20current%20versions/individual_investor_performance_final.pdf (see resources-notes.md: `barber-odean-hazardous`)
- Barber, B.M. and Odean, T., "The Behavior of Individual Investors," in *Handbook of the Economics of Finance*, Elsevier, 2013. https://faculty.haas.berkeley.edu/odean/papers%20current%20versions/behavior_of_individual_investors.pdf (see resources-notes.md: `barber-odean-behavior`)
- Kahneman, D., "Maps of Bounded Rationality: Psychology for Behavioral Economics," *American Economic Review*, 93(5), 1449–1475, 2003. https://www.aeaweb.org/articles?id=10.1257/000282803322655392 (see resources-notes.md: `kahneman-nobel-lecture`)

### Assignment
1. For each of the five biases in this lesson, write one concrete example of how it could appear in a hypothetical daily equity strategy run. For each, write the process rule that would prevent or catch it.
2. Write a one-page trading process document for a hypothetical single-asset daily strategy: signal, sizing, controls, review trigger. Write it in enough detail that someone else could follow it without asking you a question.
3. Write three journal entries for the hypothetical Month 2 drawdown scenario above, using the process-compliance format: what the system did, whether you followed the process, and what you learned. Do not record P&L.
4. In your Strategy testing record, add a "behavioral risk" field: for each bias, rate your own susceptibility as Low / Medium / High and explain one personal mitigation. This field is for your own reflection and is not graded.

### Quiz
1. Barber and Odean (2000) found that households that traded the most earned approximately what annualized return, versus 18.5% for the market? A) 15.0% B) 11.4% C) 18.0% D) 8.0%
2. Which bias causes a trader to hold losing positions past any rational threshold to avoid realizing a loss? A) Overconfidence B) Recency bias C) Disposition effect D) Attention bias
3. What is the primary purpose of a trading journal in a systematic trading context? A) To record daily P&L B) To track process compliance and document whether rules were followed C) To identify new trade ideas from the news D) To satisfy tax record-keeping requirements
4. A trader modifies their signal parameters during a four-week drawdown without a pre-specified trigger. Which bias is most likely driving this action? A) Loss aversion and recency bias B) Attention bias C) Overconfidence alone D) Disposition effect alone
5. According to the lesson, when should the maximum drawdown threshold for a review be set? A) After experiencing a drawdown, once its magnitude is clear B) Before trading starts, in the process document C) When the account falls below 50% of its peak D) At the end of each calendar quarter

### Answers
1. B — Barber and Odean (2000) reported 11.4% annualized for the highest-turnover quintile versus 18.5% for the market. (Source: `barber-odean-hazardous`.)
2. C — The disposition effect describes holding losers too long and selling winners too early.
3. B — The journal tracks whether the trader followed the written process; P&L is already in the audit log.
4. A — Modifying parameters after a losing streak reflects recency bias (over-weighting recent losses) combined with loss aversion (the discomfort of the drawdown overrides the pre-specified rule).
5. B — The threshold must be in the process document before trading starts; setting it during a drawdown defeats its purpose.

### Mastery checkpoint
Write a complete process document for a hypothetical two-symbol daily strategy: signal definition, sizing rule, four controls (from Lesson 15), review trigger, and drawdown threshold. Then write a journal entry for a hypothetical day on which you were tempted to override the exit signal but did not, documenting the temptation, the process rule you consulted, and the decision you made.

### Limitations
The behavioral-finance research cited here covers retail equity investors, primarily in the U.S. in the 1990s and 2000s. Findings may differ across asset classes, time periods, and trading frequencies. Knowing about a bias does not reliably prevent it; this lesson cannot substitute for professional psychological support or for a broker's investor-protection resources. The research cited does not establish that all retail trading is irrational or that passive investing is optimal for every individual — it documents systematic deviations from rational models in aggregate data.

---

## Lesson 18 — U.S. and California Consumer Safeguards
### Objective and prerequisites
Identify the four U.S. regulators most relevant to retail traders (FINRA, SEC, CFPB, California DFPI), describe the protections each provides, explain the status of amended FINRA Rule 4210 day-trading margin provisions, and use official lookup tools to verify registration and check complaint records.

Prerequisites: Lessons 1–4 (products, margin, orders). Lesson 15 (controls). No legal background required.

### Explanation and vocabulary
**Regulatory landscape overview.** No single U.S. regulator covers all retail trading. Products, broker-dealers, and conduct each fall under different statutory frameworks. Retail traders benefit from understanding which regulator to contact and which registration to check.

**FINRA — Financial Industry Regulatory Authority.** FINRA is a self-regulatory organization (SRO) registered with the SEC. It writes and enforces rules for broker-dealers, registered investment advisers who are dual-registered, and associated persons. For retail traders, FINRA's most direct relevance is:

- Broker-dealer regulation: firms that execute equity and options orders for retail customers must be FINRA members. FINRA's BrokerCheck tool (https://brokercheck.finra.org) allows anyone to look up registration status, employment history, and regulatory actions for brokers and firms. (Source: FINRA, BrokerCheck — verify at finra.org/investors/research/brokercheck.)
- Margin rules: FINRA Rule 4210 sets minimum margin requirements for equity positions. The rule text is at https://www.finra.org/rules-guidance/rulebook/finra-rules/4210. (See resources-notes.md: `finra-rule-4210`.)
- Trading violations: FINRA publishes guidance on free-riding, good-faith violations, and the $2,000 minimum equity requirement for margin accounts. (Source: FINRA, "Intraday Trading Basics for Investors." See resources-notes.md: `finra-intraday-trading-basics`.)

**The pattern day trader rule — current status as of 2026.** FINRA amended Rule 4210 to replace the pattern-day-trader designation and day-trading margin provisions with intraday margin standards, effective June 4, 2026. The former framework defined a pattern day trader as a customer making four or more day trades in five business days and generally required $25,000 minimum equity. Firms may phase in compliance through October 20, 2027. This is FINRA rule filing SR-FINRA-2025-017, approved by SEC Release 34-105226; the notice URL cited in the prior draft is not the controlling source. Read: https://www.finra.org/rules-guidance/rule-filings/sr-finra-2025-017 and https://www.sec.gov/files/rules/sro/finra/2026/34-105226.pdf.)

Important transition caveat: individual broker-dealers may continue applying the old $25,000 minimum or stricter house rules during the transition period or permanently. Contact your specific broker to confirm which rules apply to your account. (Source: resources-notes.md.)

**SEC — Securities and Exchange Commission.** The SEC is the primary federal regulator for equity securities, options, and exchange-traded funds. For retail traders, the SEC's main protective functions are:

- Investor education: the SEC's Investor.gov website and investor alerts. The SEC issued a warning on September 15, 2022, that hypothetical, back-tested performance results have many inherent limitations and should not be used to predict future results. (Source: SEC, "Investor Alert: Be Cautious of Performance Claims Based on Hypothetical or Simulated Results," 2022-09-15. See resources-notes.md: `sec-performance-claims`.)
- Fraud enforcement: the SEC takes action against unregistered securities offerings, pump-and-dump schemes, and AI-related investment fraud.
- Joint alert on AI investment fraud: the SEC, NASAA, and FINRA issued a joint investor alert in 2024 on AI-related investment fraud. (Source: SEC/NASAA/FINRA, joint alert, 2024. See resources-notes.md: `sec-ai-investment-fraud`.)
- Social media fraud: the SEC issued an investor alert on social-media-based stock manipulation on 2026-02-06. (Source: SEC, investor alert, 2026-02-06. See resources-notes.md: `sec-social-media-stock-scams`.)

**CFPB — Consumer Financial Protection Bureau.** The CFPB regulates consumer financial products including certain brokerage accounts, payment systems, and lending. For retail traders, the CFPB is most relevant for:

- Complaints about broker-dealer conduct on consumer accounts (margin account disclosures, billing errors, unauthorized transactions). File complaints at https://www.consumerfinance.gov/complaint/.
- Oversight of fintech and digital payment products that connect to trading platforms.

The CFPB's jurisdiction over securities products is limited; most securities-related complaints should be filed with FINRA or the SEC.

**California DFPI — Department of Financial Protection and Innovation.** The DFPI is California's primary state financial regulator for consumer financial products not exclusively covered by federal law. For California retail traders, the DFPI:

- Licenses and regulates investment advisers, money transmitters, and certain fintech firms operating in California.
- Publishes a Crypto Scam Tracker listing reported crypto-related investment fraud. The tracker contains reports submitted by the public; DFPI notes that reported losses are unverified. (Source: DFPI, Crypto Scam Tracker — see resources-notes.md: `dfpi-crypto-scam-tracker`.)
- Publishes guidance on investment scam recognition. (Source: DFPI, investment scams page, updated 2026-04-22 — see resources-notes.md: `dfpi-investment-scams`.)
- File California-specific complaints at https://dfpi.ca.gov/file-a-complaint/.

**NFA — National Futures Association.** The NFA is the SRO for futures and forex dealers. For retail traders in futures or forex, verify registration at https://www.nfa.futures.org/BasicNet/. (Source: NFA, "Basic Registration Search" — see resources-notes.md: `nfa-basic`.) The CFTC issued a consumer advisory specifically about AI and "super intelligence" trading bots claiming to generate automated profits; verify registration before engaging any such service. (Source: CFTC, consumer advisory — see resources-notes.md: `cftc-ai-trading-bots`.)

**Margin rules reference.** The Federal Reserve's Regulation T (12 C.F.R. Part 220) sets the initial margin requirement for securities purchases. The text is available at https://www.law.cornell.edu/cfr/text/12/part-220. (Source: resources-notes.md: `reg-t-12cfr220`. Note: Cornell LII is a third-party host; the official ecfr.gov site blocked automated access during verification.) FINRA Rule 4210 sets maintenance margin requirements. FINRA's explanation of what triggers a margin call is at https://www.finra.org/investors/learn-to-invest/advanced-investing/margin-statistics. (See resources-notes.md: `finra-margin-calls`.)

Vocabulary:
- FINRA: Financial Industry Regulatory Authority; SRO for broker-dealers.
- SEC: Securities and Exchange Commission; primary federal regulator for securities.
- CFPB: Consumer Financial Protection Bureau; regulates consumer financial products.
- DFPI: California Department of Financial Protection and Innovation; California state financial regulator.
- NFA: National Futures Association; SRO for futures and forex dealers.
- SRO (self-regulatory organization): a private organization authorized by law to write and enforce rules for its members, subject to SEC oversight.
- BrokerCheck: FINRA's public database of broker and firm registration and disciplinary history.
- Pattern day trader (PDT): the former FINRA designation for accounts with four or more day trades in five business days; replaced by amended Rule 4210, effective June 4, 2026.
- Intraday margin standard: the replacement framework under FINRA RN 26-10. Full mechanics require reading the regulatory notice.
- Reg T: Federal Reserve Regulation T; sets initial margin requirements for securities purchases.
- Maintenance margin: the minimum equity percentage required to maintain an open position; enforced by FINRA Rule 4210 and broker house rules.

Formulas (plain text):
- Reg T initial margin requirement (equities): typically 50% of purchase price (see 12 C.F.R. § 220.12; verify current text).
- Maintenance margin under FINRA Rule 4210: typically 25% of market value for long positions (verify current text at finra.org/rules-guidance/rulebook/finra-rules/4210).
- Both figures are regulatory minima; brokers may require more.

### Worked example
Hypothetical scenario. All account values and margin figures are illustrative.

**Scenario A — checking broker registration.**
A California retail trader is evaluating a broker-dealer offering a new automated trading platform. Before opening an account, the trader:
1. Goes to https://brokercheck.finra.org and searches by firm name. Finds the firm is FINRA-registered, with no disclosures. Records the CRD number for future reference.
2. Checks https://dfpi.ca.gov for any California license or enforcement actions. Finds no actions.
3. Searches https://www.nfa.futures.org/BasicNet/ because the firm also offers futures products. Finds NFA registration is current.
4. Notes that checking registration does not guarantee the firm is safe or suitable — it confirms minimum regulatory compliance.

**Scenario B — margin call example.**
Hypothetical account: $20,000 equity, $40,000 total position value (50% initial margin under Reg T, hypothetically). Price declines; position value falls to $24,000.
```
Maintenance margin requirement: 25% × $24,000 = $6,000 minimum equity
Current equity: $24,000 - $20,000 (amount borrowed) = $4,000
$4,000 < $6,000 → margin call triggered
```
The broker issues a margin call requiring the account to be brought up to the maintenance minimum. The trader must deposit funds or liquidate positions. If not resolved within the broker's deadline, the broker may liquidate positions without further notice. (Source: FINRA guidance on margin calls — see resources-notes.md: `finra-margin-calls`.) All numbers are hypothetical.

**Scenario C — PDT rule transition.**
A California retail trader asks whether the $25,000 PDT minimum still applies in 2026. The broker explains its transition schedule under amended FINRA Rule 4210. Firms may phase in the new intraday margin standards through October 20, 2027. The trader checks FINRA SR-FINRA-2025-017 and the SEC approval order.

**Scenario D — recognizing an AI trading bot scam.**
A trader receives a social-media advertisement for an AI-powered trading bot that claims 300% annual returns with zero risk. The trader:
1. Checks the CFTC advisory at https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/fraudadv_SITradingBots.html and recognizes characteristics of the schemes described.
2. Searches the DFPI Crypto Scam Tracker.
3. Reports the advertisement to the SEC at https://www.sec.gov/tcr and to the DFPI if located in California.
The trader does not invest. (Source: CFTC advisory — see resources-notes.md: `cftc-ai-trading-bots`; SEC/NASAA/FINRA joint alert — see resources-notes.md: `sec-ai-investment-fraud`.)

### Common mistakes
1. Assuming that a FINRA-registered broker cannot engage in misconduct. Registration is a minimum qualification; check BrokerCheck's disclosures tab for complaints and regulatory actions.
2. Applying the old $25,000 PDT rule as if it is current law without checking with your specific broker. As of 2026-06-04, FINRA RN 26-10 replaced the framework, but brokers may apply house rules. Verify with your broker.
3. Filing securities complaints with the CFPB rather than FINRA or the SEC. The CFPB handles consumer financial products, but securities broker-dealer complaints are primarily handled by FINRA and the SEC.
4. Treating the DFPI Crypto Scam Tracker as a verified list of fraudulent firms. DFPI notes that the reports are unverified by the DFPI.
5. Believing that a strategy's hypothetical or back-tested results are predictive. The SEC warned explicitly against this on September 15, 2022.

### Resources
- FINRA, BrokerCheck. https://brokercheck.finra.org (see resources-notes.md: `brokercheck` — verify URL at finra.org)
- FINRA SR-FINRA-2025-017: https://www.finra.org/rules-guidance/rule-filings/sr-finra-2025-017; SEC approval order 34-105226: https://www.sec.gov/files/rules/sro/finra/2026/34-105226.pdf
- FINRA, "Intraday Trading Basics for Investors." https://www.finra.org/investors/learn-to-invest/advanced-investing/day-trading (see resources-notes.md: `finra-intraday-trading-basics`)
- FINRA, margin calls guidance. https://www.finra.org/investors/learn-to-invest/advanced-investing/margin-statistics (see resources-notes.md: `finra-margin-calls`)
- FINRA Rule 4210. https://www.finra.org/rules-guidance/rulebook/finra-rules/4210 (see resources-notes.md: `finra-rule-4210`)
- SEC, "Investor Alert: Be Cautious of Performance Claims Based on Hypothetical or Simulated Results," 2022-09-15. (see resources-notes.md: `sec-performance-claims`)
- SEC/NASAA/FINRA, joint investor alert on AI investment fraud, 2024. (see resources-notes.md: `sec-ai-investment-fraud`)
- SEC, investor alert on social-media stock scams, 2026-02-06. (see resources-notes.md: `sec-social-media-stock-scams`)
- Investor.gov, pattern day trader glossary entry. https://www.investor.gov (see resources-notes.md: `sec-pdt-glossary`)
- Regulation T, 12 C.F.R. Part 220. https://www.law.cornell.edu/cfr/text/12/part-220 (see resources-notes.md: `reg-t-12cfr220`; Cornell LII third-party host)
- DFPI, investment scams page, updated 2026-04-22. https://dfpi.ca.gov (see resources-notes.md: `dfpi-investment-scams`)
- DFPI, Crypto Scam Tracker. https://dfpi.ca.gov/crypto-scams/ (see resources-notes.md: `dfpi-crypto-scam-tracker`)
- CFTC, AI/SI trading bots consumer advisory. https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/fraudadv_SITradingBots.html (see resources-notes.md: `cftc-ai-trading-bots`)
- NFA, Basic Registration Search. https://www.nfa.futures.org/BasicNet/ (see resources-notes.md: `nfa-basic`)

### Assignment
1. Use FINRA BrokerCheck to look up any two publicly listed broker-dealers. For each, record: registration status, number of disclosures, and what types of disclosures appear (if any). Write a paragraph interpreting what you found — not whether the broker is "good," but what the record shows and what it does not show.
2. Using the hypothetical margin scenario (Scenario B), recalculate the margin call threshold if the maintenance margin requirement were 30% instead of 25%. Show your work.
3. Write a one-paragraph summary of FINRA SR-FINRA-2025-017 based on the filing and SEC approval order linked in this lesson. Record the date and explain the transition timeline.
4. For a hypothetical California trader receiving a social-media advertisement for an automated trading bot, write a step-by-step due-diligence checklist using all four regulators covered in this lesson. What would each regulator's lookup or resource tell you?

### Quiz
1. Which FINRA tool allows the public to check a broker-dealer's registration status and disciplinary history? A) NFA Basic B) BrokerCheck C) DFPI Scam Tracker D) SEC EDGAR
2. FINRA Rule 4210 amendments, effective 2026-06-04, replaced which rule? A) The wash-sale rule B) The pattern day trader $25,000 minimum and 4-trades-in-5-days designation C) Regulation T initial margin D) The best-execution standard
3. Which regulator would a California retail investor contact about an investment scam involving a California-licensed money transmitter? A) CFPB B) NFA C) DFPI D) CFTC
4. A broker continues applying the $25,000 PDT minimum after 2026-06-04. Is this permitted? A) No; brokers must immediately adopt the new intraday margin standard B) Yes; brokers may apply stricter house rules during and after the transition period C) No; the SEC prohibited it D) Yes; the old rule is still federal law
5. The SEC's 2022 investor alert warns retail traders about which practice? A) Using limit orders B) Relying on hypothetical, back-tested performance results as predictors of future results C) Filing FINRA complaints D) Trading futures without NFA registration

### Answers
1. B — BrokerCheck is FINRA's public broker and firm lookup tool. (Source: finra.org/brokercheck.)
2. B — FINRA amended Rule 4210 to replace the PDT framework with intraday margin standards, effective June 4, 2026. (SR-FINRA-2025-017; SEC Release 34-105226.)
3. C — The DFPI is California's state financial regulator for consumer financial products not exclusively covered by federal law.
4. B — Brokers may apply stricter house rules during the transition period (until 2027-10-20) or permanently. (Source: resources-notes.md.)
5. B — The SEC warned on 2022-09-15 that hypothetical, back-tested performance results have inherent limitations and should not be used to predict future results. (Source: `sec-performance-claims`.)

### Mastery checkpoint
Without referring to the lesson, name the four regulators and one specific protective function each provides for retail traders. Then describe the current PDT rule status and what a California retail trader should do to verify which rules apply to their specific brokerage account. Cite at least one primary source for each regulatory point.

### Limitations
This lesson covers only four U.S. regulators; others are relevant for specific products (e.g., CFTC for futures, state securities regulators for some products). Regulatory rules change; the description of FINRA RN 26-10 in this lesson is based on notes from resources-notes.md and should be verified against the current text at finra.org. California-specific rules change independently of federal rules; check dfpi.ca.gov for current California requirements. This lesson is not legal advice; consult a licensed attorney or compliance professional for guidance on your specific situation.

---

## Lesson 19 — Tax Introduction for U.S. Traders
### Objective and prerequisites
Identify three U.S. tax concepts relevant to retail traders (wash-sale rule, short-term vs. long-term capital gains, Form 8949), explain how Section 1256 contracts receive a different tax treatment, and explain the threshold at which digital-asset broker reporting applies. This lesson is educational only and is not tax advice. Consult a qualified tax professional for your specific situation.

Prerequisites: Lessons 1–4 (products: equities, options, futures, crypto). No prior tax knowledge required.

**Disclaimer.** Tax law is complex, changes frequently, and applies differently to each individual based on facts and circumstances. This lesson introduces vocabulary and concepts. It is not a substitute for professional advice. The IRS publications cited are authoritative for general principles; your specific situation may differ.

### Explanation and vocabulary
**Capital gains: short-term vs. long-term.** When a trader sells a security at a profit, the gain is taxable. The tax rate depends on how long the asset was held:

- Short-term capital gain: position held one year or less. Taxed at ordinary income tax rates.
- Long-term capital gain: position held more than one year. Taxed at preferential long-term capital gains rates (0%, 15%, or 20% for most taxpayers, depending on taxable income).

For most active retail traders, positions are held less than one year, so gains are short-term and taxed as ordinary income.

(Source: IRS Publication 550, "Investment Income and Expenses," 2025 edition. See resources-notes.md: `irs-pub-550`.)

**Wash-sale rule.** A wash sale occurs when a trader sells a security at a loss and, within 30 days before or after the sale, buys the same or a "substantially identical" security. The loss from a wash sale is disallowed for tax purposes; instead, it is added to the cost basis of the replacement security. The IRS defines this rule in Section 1091 of the Internal Revenue Code and in Publication 550. (Source: IRS Publication 550, 2025. See resources-notes.md: `irs-pub-550`.)

Wash-sale rules apply to stocks and securities. IRS guidance says they generally apply to digital assets that are also stock or securities for tax purposes, such as tokenized securities. The rule generally does not apply to cryptocurrency that is not stock or a security under current federal tax law; verify classification and current law. (IRS Schedule D instructions: https://www.irs.gov/instructions/i1040sd)

**Form 8949 — Sales and Other Dispositions of Capital Assets.** Every sale of a capital asset — including stocks, bonds, options, and certain crypto transactions — must be reported on Form 8949. The form requires: description of asset, date acquired, date sold, proceeds, cost basis, adjustments (including wash-sale adjustments), and resulting gain or loss. The totals from Form 8949 flow to Schedule D. (Source: IRS Form 8949 instructions. Verify current version at irs.gov.)

Brokers are required to report most stock and ETF transactions on Form 1099-B, which provides the information needed to complete Form 8949. Basis reporting requirements have expanded over time; older positions or transferred accounts may have missing basis information that the taxpayer must reconstruct.

**Section 1256 contracts.** Section 1256 covers regulated futures contracts, foreign currency contracts, nonequity options, dealer equity options, and dealer securities futures contracts. Covered contracts are marked to market at year-end; gains and losses generally receive a 60% long-term and 40% short-term split regardless of holding period. Some instruments that resemble broad-based index options do not qualify. (IRS Form 6781 (2025): https://www.irs.gov/pub/irs-pdf/f6781.pdf)

**Trader tax status and the 475(f) election.** The IRS distinguishes investors, traders, and dealers. A "trader in securities" who meets specific activity and frequency tests may elect mark-to-market accounting under Section 475(f), which converts capital gains and losses to ordinary income and loss, avoids the wash-sale rule, and allows loss deductions without the $3,000 capital loss limitation.  Traders must meet IRS activity tests. A timely valid election generally makes covered gains and losses ordinary and removes wash-sale and capital-loss limits for covered trading securities. Election is due by the prior-year return due date, without extensions; late elections generally are not allowed. Securities held for investment are excluded. (IRS Topic 429: https://www.irs.gov/taxtopics/tc429)

**Digital assets and broker reporting.** The IRS requires taxpayers to report income from digital-asset transactions. Brokers in scope report gross proceeds for covered digital-asset transactions on or after January 1, 2025; basis reporting applies to certain transactions on or after January 1, 2026. Coverage depends on broker and transaction type. Form 1099-DA is current, not proposed. (IRS: https://www.irs.gov/filing/digital-assets; https://www.irs.gov/forms-pubs/about-form-1099-da)

Vocabulary:
- Short-term capital gain: gain from a position held one year or less; taxed at ordinary income rates.
- Long-term capital gain: gain from a position held more than one year; taxed at preferential rates.
- Wash-sale rule: a rule disallowing a loss if the same or substantially identical security is purchased within 30 days before or after the sale at a loss.
- Substantially identical: a standard for the wash-sale rule that includes options on the same security and certain related instruments; the exact boundary requires professional guidance.
- Form 8949: IRS form for reporting capital asset sales; required for stocks, bonds, options, and certain crypto.
- Schedule D: IRS form summarizing capital gains and losses; receives totals from Form 8949.
- Form 1099-B: broker-issued statement of securities sales, basis, and proceeds; used to complete Form 8949.
- Section 1256 contract: a futures contract or certain options on broad-based indexes; subject to 60/40 mark-to-market tax treatment.
- Section 475(f) election: an optional election allowing traders in securities to use mark-to-market accounting; requires meeting activity tests and filing by the prior-year return deadline.
- 1099-DA: IRS information return for reportable digital-asset broker proceeds.
- Basis: the original cost of an asset, adjusted for certain events, used to compute gain or loss.
- Cost basis adjustment (wash sale): the disallowed loss is added to the basis of the replacement security.

Formulas (plain text):
- short_term_gain = proceeds - adjusted_basis, where holding_period <= 365 days
- long_term_gain = proceeds - adjusted_basis, where holding_period > 365 days
- wash_sale_adjusted_basis = replacement_security_basis + disallowed_loss
- Section 1256 split: 60% × total_gain_or_loss = long-term portion; 40% × total_gain_or_loss = short-term portion

### Worked example
Hypothetical trades. All prices, gains, and losses are illustrative. This example is not tax advice.

**Setup.** A hypothetical U.S. retail trader, in a hypothetical tax year, makes the following trades in a taxable brokerage account:
- Trade 1: Buy 100 shares of hypothetical stock AAA at $50.00 on January 2. Sell at $60.00 on March 15. Holding period: 72 days. Gain: (60 - 50) × 100 = $1,000. Short-term.
- Trade 2: Buy 100 shares of hypothetical stock BBB at $80.00 on January 5. Sell at $70.00 on March 20 (loss of $1,000). Buy 100 shares of BBB again on April 5 (within 30 days). Wash sale: loss disallowed. Adjusted basis of replacement BBB: $80 + $10 = $90 per share ($70 sale price + $10 disallowed loss per share added to $80 cost basis of replacement = $90 basis of new lot). [Note: adjusted basis calculation — original basis of BBB repurchase at $80 + $10 disallowed loss per share = $90.] Short-term gain on later sale of BBB will use $90 basis.
- Trade 3: Buy 1 hypothetical futures contract on a broad index at a price equivalent to $5,000. Sell at $5,500 at year-end. Gain: $500 × 1 contract = $500. Section 1256 treatment (hypothetical, 60/40 split): $300 long-term, $200 short-term.

**Form 8949 entries (abbreviated, hypothetical):**
```
AAA: Acquired 01/02, Sold 03/15, Proceeds $6,000, Basis $5,000, Gain $1,000 (short-term, Part I)
BBB: Acquired 01/05, Sold 03/20, Proceeds $7,000, Basis $8,000, Loss -$1,000, Wash sale adj. +$1,000, Net $0 (short-term, Part I)
Futures: Reported on Form 6781, not Form 8949 directly
```
The $1,000 BBB loss is disallowed this year. The adjusted basis of the replacement BBB lot is $90/share; that adjustment will reduce the gain (or increase the loss) when the replacement lot is eventually sold.

**Practical implication.** A systematic trader who frequently trades the same securities can generate wash-sale situations across many positions. Many broker 1099-B forms do not track wash sales across accounts (e.g., a wash sale triggered by a purchase in an IRA after a loss in a taxable account is not reported by the broker but may still apply). This is an area where professional advice is especially important.

### Common mistakes
1. Ignoring wash sales because "the broker will track it." Brokers track wash sales within a single account; they may not track cross-account wash sales. Cross-account situations require the taxpayer to track manually.
2. Assuming that futures gains are always better taxed than equity gains. The 60/40 split is favorable for short-term traders, but it also means that long-term losses are split 60/40, which may be less favorable in some cases. The analysis depends on individual circumstances.
3. Treating a 475(f) election as simple. It changes accounting methods and generally requires a timely election plus Form 3115; consult a tax professional before filing.
4. Assuming Form 1099-DA covers every broker or supplies basis in every case. Reporting phases in, and taxpayers remain responsible for reporting taxable transactions.
5. Using this lesson as tax advice. It is not. The examples use round numbers that do not represent any real tax situation. Consult a qualified tax professional.

### Resources
- IRS Publication 550, "Investment Income and Expenses," 2025 edition. Covers capital gains, wash-sale rule, and basis. https://www.irs.gov/publications/p550 (see resources-notes.md: `irs-pub-550`)
- IRS Topic No. 429, "Traders in Securities." Covers trader vs. investor distinction and 475(f) election. https://www.irs.gov/taxtopics/tc429 (see resources-notes.md: `irs-topic-429`)
- IRS Form 6781 and instructions, "Gains and Losses From Section 1256 Contracts and Straddles." https://www.irs.gov/forms-pubs/about-form-6781 (see resources-notes.md: `irs-form-6781`)
- IRS, digital assets tax guidance. https://www.irs.gov/businesses/small-businesses-self-employed/digital-assets (see resources-notes.md: `irs-digital-assets`)

### Assignment
1. For the three hypothetical trades in the worked example, trace the full tax impact: what appears on Form 8949, what adjustments are made for the wash sale, and what appears on Schedule D. Show each step.
2. A hypothetical trader sells 50 shares of stock CCC at a $500 loss on November 1 and repurchases 50 shares of CCC on November 20. Compute the wash-sale disallowance and the adjusted basis of the replacement shares, assuming an original basis of $40/share and a sale price of $30/share.
3. Research and summarize (in your own words) the difference between a "trader in securities" and an "investor" for IRS purposes, using IRS Topic No. 429. What tests does the IRS apply? Do not reproduce tax-law text; summarize the concepts.
4. Write a one-paragraph "tax awareness checklist" for a hypothetical retail trader: what records to keep, when to review wash-sale situations, and when to contact a tax professional. This is not tax advice; it is an organizational checklist.

### Quiz
1. A trader sells stock at a loss on March 15 and buys the same stock on March 25. What happens to the loss? A) It is fully deductible in the current year B) It is disallowed under the wash-sale rule and added to the basis of the replacement shares C) It is converted to a long-term loss D) It is deferred to the following tax year as a capital carryforward
2. A stock held for 400 days is sold at a gain. How is the gain taxed? A) As a short-term gain at ordinary income rates B) As a long-term gain at preferential rates C) As a Section 1256 gain with a 60/40 split D) As ordinary income under Section 475(f)
3. Under Section 1256, what percentage of a gain on a futures contract is treated as long-term capital gain, regardless of holding period? A) 40% B) 100% C) 60% D) 0%
4. What IRS form is used to report individual sales and dispositions of capital assets? A) Schedule D B) Form 1099-B C) Form 8949 D) Form 6781
5. A trader wants to make a Section 475(f) mark-to-market election for the current tax year. When must the election be made? A) By December 31 of the current year B) By the original due date of the prior year's tax return C) At any time before filing the current year's return D) Within 90 days of the first trade of the year

### Answers
1. B — The wash-sale rule disallows the loss when the same security is repurchased within 30 days before or after the sale at a loss; the disallowed loss is added to the cost basis of the replacement shares. (Source: IRS Publication 550.)
2. B — A position held more than one year qualifies for long-term capital gains rates. (Source: IRS Publication 550.)
3. C — Section 1256 contract gains and losses are generally split 60% long-term and 40% short-term, regardless of holding period. (IRS Form 6781.)
4. C — Form 8949 is used to report individual capital asset sales; totals flow to Schedule D.
5. B — The election is generally due by the prior-year return due date without extensions; late elections generally are not allowed. (IRS Topic 429.)

### Mastery checkpoint
Without referring to the lesson, explain: (1) what a wash sale is, and compute the adjusted basis for a hypothetical replacement position with a $200 disallowed loss on a $500 basis; (2) the difference in tax treatment between a stock held 364 days and one held 366 days; (3) why a retail futures trader might face a different effective tax rate than a retail equity trader on the same dollar gain. For item 3, cite the relevant IRS form or code section.

### Limitations
This lesson covers only the most basic tax concepts for U.S. retail traders in a taxable brokerage account. It does not cover: state income taxes (including California's treatment of capital gains); tax-advantaged accounts (IRA, 401k); options-specific tax treatment beyond the wash-sale mention; the straddle rules (Section 1092); foreign income; estate and gift tax; the net investment income tax (Section 1411); or any aspect of international tax. Tax law changes frequently; verify all information against current IRS publications before relying on it. This lesson is not tax advice.

---

## Lesson 20 — Friend-Strategy Review Rubric and Graduation Assessment
### Objective and prerequisites
Apply a structured rubric to evaluate a strategy presented by a hypothetical peer; identify common oversights in strategy design; and pass a cumulative graduation assessment covering all five parts of the course.

Prerequisites: All prior lessons (1–19). This is the final lesson.

### Explanation and vocabulary
**Why peer review?** A strategy that the designer cannot explain clearly, defend under challenge, or document in writing is not ready. The peer-review rubric is a structured exercise in which a "reviewer" plays the role of a skeptical but constructive reader. It is not about finding reasons to reject — it is about finding gaps that the designer missed because they are too close to their own work.

The rubric uses eight dimensions. Each dimension receives a score of 1 (not addressed), 2 (partially addressed), or 3 (fully addressed). A total of 20 or above out of 24 is a passing review. A score below 20 requires the designer to address the gaps and resubmit.

**The eight rubric dimensions:**

**1. Hypothesis clarity (max 3).** Does the designer state a specific, testable hypothesis for why the strategy should work? The hypothesis must be stated before the backtest results are shown. A hypothesis like "momentum works because short-term price trends persist due to slow information diffusion" is testable. "This signal worked in my backtest" is not a hypothesis. (Part 2 covers hypothesis formation.)

**2. Data and backtest integrity (max 3).** Does the designer demonstrate: (a) no look-ahead bias, (b) survivorship-bias-free data, and (c) out-of-sample test results separate from in-sample optimization? A single reported Sharpe ratio with no explanation of how the test period relates to the optimization period scores 1. (Parts 2 and 4 cover these risks. See also: resources-notes.md: `sec-performance-claims`.)

**3. Risk sizing and drawdown (max 3).** Does the designer specify a position-sizing method (Part 2) and report maximum historical drawdown, Sharpe ratio, and Calmar ratio for the out-of-sample period? A strategy with a Calmar ratio below 0.3 (hypothetical threshold; adjust based on strategy type) requires explanation. (Parts 1–2.)

**4. Execution realism (max 3).** Does the designer account for: estimated commissions, bid-ask spread, slippage, and borrow cost (for short positions)? Does the backtest use a conservative fill assumption or explain its fill model? A backtest that fills at the closing price without spread or slippage scores 1. (Part 3, Lessons 10–11; Part 4, Lesson 16.)

**5. Controls and automation (max 3).** Does the design include the four controls from Lesson 15 (kill switch, MDLL, position limits, audit log) and a plan for paper testing (Lesson 16)? A strategy that is "ready for live" without a paper run scores 1. (Part 4.)

**6. Regulatory and tax awareness (max 3).** Does the designer identify: the product type and applicable regulator (Part 5, Lesson 18); any PDT-rule or margin constraints relevant to the strategy's trading frequency; and a preliminary understanding of how gains and losses from the strategy will be taxed (Part 5, Lesson 19)? This dimension does not require professional advice — it requires evidence that the designer has read the relevant IRS and FINRA materials. [Tax advice: not provided here; Lesson 19 provides educational context only.]

**7. Psychology and process discipline (max 3).** Does the designer have a written process document (Lesson 17) specifying the signal, sizing, controls, review trigger, and drawdown threshold? Does the design acknowledge specific behavioral risks (overconfidence, disposition effect) and name mitigations? A design with no process document scores 1. (Part 5, Lesson 17.)

**8. Limitations and risk of loss (max 3).** Does the designer honestly state what the strategy cannot do, where it is most likely to fail, and what the realistic risk of total loss is for the allocated capital? A strategy presentation that lists only expected gains and no failure scenarios scores 1.

**Scoring:**
```
24 = Exceptional: all dimensions fully addressed
20–23 = Pass: ready to proceed to paper testing
15–19 = Revise: specific gaps must be addressed before paper testing
< 15 = Not ready: substantial redesign required
```

**Graduation assessment.** The graduation assessment is cumulative: 20 multiple-choice questions (four per Part) testing foundational concepts from Parts 1–5. A score of 15/20 or above is a passing grade.

Vocabulary:
- Peer review rubric: a structured evaluation tool with scored dimensions; used here to simulate a critical review of a strategy design.
- Look-ahead bias: using future data in a backtest as if it were known at the time of the simulated trade.
- Survivorship bias: including only assets that survived to the end of the test period, excluding those that were delisted or failed.
- Calmar ratio: annualized return divided by maximum drawdown; a combined risk-adjusted performance measure.
- Out-of-sample test: a test on data not used in parameter optimization; reduces overfitting risk.
- Process document: the written, pre-specified trading process from Lesson 17.

Formulas (plain text):
- Calmar ratio = annualized_return / max_drawdown (both expressed as positive decimals; e.g., 0.20 / 0.15 = 1.33)
- rubric_total = sum of scores on eight dimensions (max 24)
- graduation_pass = score >= 15 out of 20 questions

### Worked example
Hypothetical strategy review. All strategy parameters, returns, and drawdowns are illustrative.

**Reviewer scenario.** A hypothetical peer presents "Strategy Z": a daily mean-reversion strategy on five U.S. equities, using a 10-day z-score signal, full Kelly sizing, backtested 2010–2020, Sharpe ratio 1.4, maximum drawdown 18%.

**Scoring walk-through:**

Dimension 1 — Hypothesis clarity. The designer says: "stocks revert to their mean because institutional traders create short-term price dislocations." Testable? Partially — no citation and no mechanism for why this would persist. Score: 2.

Dimension 2 — Data and backtest integrity. The backtest covers 2010–2020. The optimization period is 2010–2018; the out-of-sample test is 2018–2020 (stated). No mention of survivorship-bias correction. Score: 2 (out-of-sample exists; survivorship bias not addressed).

Dimension 3 — Risk sizing and drawdown. Full Kelly sizing is used. Calmar ratio: 0.078 / 0.18 = 0.43. [Note: 0.078 annualized return derived from hypothetical numbers; hypothetical only.] Sharpe 1.4. The reviewer notes that full Kelly has a risk of ruin that is non-trivial; Part 2 recommends half-Kelly or lower for practical use. Score: 2.

Dimension 4 — Execution realism. The backtest fills at closing price; no spread or commission modeled. Score: 1.

Dimension 5 — Controls and automation. All four controls are listed; a 30-day paper-run plan is included. Score: 3.

Dimension 6 — Regulatory and tax awareness. The designer identifies U.S. equity securities (SEC/FINRA jurisdiction), confirms the account meets its applicable intraday margin requirements under amended FINRA Rule 4210, and notes that gains will be short-term (held < 1 year) and taxed as ordinary income. Score: 3.

Dimension 7 — Psychology and process discipline. A one-page process document is provided. The designer names overconfidence and recency bias as personal risks and identifies a 15% drawdown as the review trigger. Score: 3.

Dimension 8 — Limitations and risk of loss. The designer states: "The strategy may underperform or lose all allocated capital if mean-reversion conditions break down, as occurred in trend-following markets. The maximum realistic loss is the full position size per symbol times max drawdown." Score: 3.

**Total: 2 + 2 + 2 + 1 + 3 + 3 + 3 + 3 = 19. Result: Revise.**

**Gaps to address before resubmitting:**
- Dimension 2: document or disclose survivorship-bias status.
- Dimension 3: justify or reduce Kelly fraction; show risk-of-ruin calculation.
- Dimension 4: add realistic commission and spread model to the backtest; re-run with conservative fills.

The designer revises and resubmits. The re-run with $0.01/share commission and a 0.05% spread adds approximately 1.2% per year in costs (hypothetical). Revised Sharpe: 1.1. Strategy remains viable; score increases to 22. Result: Pass.

### Common mistakes
1. Scoring dimension 2 as 3 simply because an out-of-sample test exists, without checking whether the same data were used to select the in-sample test period or the signal parameters. An "out-of-sample" test run on a parameter set chosen after seeing its out-of-sample performance is not genuinely out-of-sample.
2. Treating dimension 6 as not applicable because "it's just education." The rubric is designed to build habits. A strategy designer who does not think about regulatory and tax implications before paper testing will not think about them before going live.
3. Giving full marks on dimension 7 for a process document that was written after the backtest results were seen. The process document should be written before or concurrent with the first backtest run, not as a post-hoc justification.
4. Treating the rubric total as the only output. The reviewer's written comments on each dimension are more valuable than the number; the number determines whether revision is required, but the comments tell the designer what to fix.
5. Inflating scores to avoid a revision. The rubric's value comes from honest scoring. A strategy that passes a dishonestly scored review and fails in live trading is a worse outcome than an honest revision.

### Resources
- SEC, "Investor Alert: Be Cautious of Performance Claims Based on Hypothetical or Simulated Results," 2022-09-15. (See resources-notes.md: `sec-performance-claims`.) Directly relevant to dimension 2: a reviewer should apply the SEC's framing when assessing backtest integrity.
- Barber, B.M. and Odean, T., "Trading Is Hazardous to Your Wealth," 2000. (See resources-notes.md: `barber-odean-hazardous`.) Background for dimension 7: behavioral costs of overconfidence.
- Bailey, D.H. and López de Prado, M., "The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting and Non-Normality," *Journal of Portfolio Management*, 40(5), 2014. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551 (see resources-notes.md: `deflated-sharpe-ratio`.) Background for dimension 2: why reported Sharpe ratios overstate true performance.
- FINRA SR-FINRA-2025-017: https://www.finra.org/rules-guidance/rule-filings/sr-finra-2025-017; SEC approval order 34-105226: https://www.sec.gov/files/rules/sro/finra/2026/34-105226.pdf
- IRS Publication 550, 2025. https://www.irs.gov/publications/p550 (see resources-notes.md: `irs-pub-550`.) Background for dimension 6: capital gains and wash-sale awareness.

### Assignment
1. Apply the full eight-dimension rubric to a hypothetical strategy of your own design. Write one paragraph per dimension, give a score with justification, and compute the total. If the total is below 20, list the specific revisions required and explain how you would address them.
2. Find one claim in a hypothetical strategy presentation (you may use the Strategy Z example or write your own) that the SEC's 2022 alert would flag as problematic. Explain what the claim is and why the alert applies.
3. Write a one-page "strategy passport" — a summary document a reviewer would need before scoring any strategy — covering all eight dimensions in one to three sentences each. This is the document the designer prepares before requesting a review.
4. Graduation journal entry: in 300–500 words, describe what you would do differently in the first strategy you designed (or would have designed) in this course, now that you have completed all 20 lessons. What is the most important thing you learned that changed how you think about trading?

### Quiz
**Graduation Assessment — 20 questions, four per Part. Passing: 15/20.**

**Part 1 questions:**
1. A trader buys one equity option contract covering 100 shares. If the premium is $3.00 per share, what is the total cost of the contract (ignoring commissions)? A) $3.00 B) $30.00 C) $300.00 D) $3,000.00
2. Which order type guarantees execution but not price? A) Limit order B) Stop-limit order C) Market order D) Good-till-cancelled order
3. Regulation T sets the initial margin requirement for equity securities at approximately what percentage of the purchase price? A) 10% B) 25% C) 50% D) 100%
4. A trader with $10,000 in a hypothetical account uses 2:1 margin to buy $20,000 of a hypothetical stock that falls 30%. What is the approximate loss as a percentage of the trader's equity? A) 30% B) 50% C) 60% D) 100%

**Part 2 questions:**
5. Under a simplified independent-return model, a strategy has a Sharpe ratio of 0.5. Roughly how many years reach a one-sided 5% t-statistic threshold? A) 1 year B) About 4 years C) About 11 years D) About 25 years
6. Which of the following is the most direct definition of look-ahead bias in a backtest? A) Using a data set with survivorship bias B) Using future data in a simulation as if it were known at the time of the trade C) Overfitting parameters to in-sample data D) Failing to subtract transaction costs
7. The Kelly criterion applied at full Kelly maximizes long-run geometric growth, but in practice traders often use half-Kelly or less. Which of these is the primary reason? A) Half-Kelly maximizes arithmetic return B) Full Kelly leads to a maximum drawdown of 100% in the worst case C) Full Kelly is not computable D) Half-Kelly is required by FINRA Rule 4210
8. A strategy's backtest shows a maximum drawdown of 20%. Its annualized return is 15%. What is its Calmar ratio? A) 1.33 B) 0.75 C) 3.00 D) 0.33

**Part 3 questions:**
9. What is the bid-ask spread for a hypothetical stock with a best bid of $49.95 and a best offer of $50.05? A) $0.05 B) $0.10 C) $50.00 D) $0.50
10. A trader submits a large market buy order. The order exhausts the best offer and fills against the next price level. What describes this effect? A) Adverse selection B) Market impact C) Front-running D) Internalization
11. Under the SEC's National Market System rules, what does Regulation NMS Reg NMS protect against? A) Over-borrowing in margin accounts B) Executing trades at prices inferior to the national best bid and offer C) High-frequency cancellation of limit orders D) Wash trading between related accounts
12. Which of these order types executes only at the closing auction price? A) Market order B) Limit order C) Market-on-close (MOC) order D) Stop-limit order

**Part 4 questions:**
13. What property of an execution layer ensures that retrying an order submission after a network timeout does not create a duplicate order? A) State persistence B) Idempotency via client-order IDs C) The kill switch D) The scheduler
14. A paper-trading API reports a resting limit buy filled in 1 second. What does this tell you about the likely fill time for the same order in a live market? A) The live order will fill in approximately 1 second B) Nothing definitive; paper fills ignore queue position and market depth C) The order book is favorable D) The strategy should be deployed immediately
15. The maximum daily loss limit (MDLL) in an automated system should include which of the following? A) Realized P&L only B) Mark-to-market P&L on open positions only C) Both realized and mark-to-market P&L D) P&L from the prior week
16. A paper run lasting four weeks produced a positive result. Which of the following statements about this result is correct? A) The strategy has a proven live edge B) The code ran correctly and controls fired as expected, but fill quality and execution costs are not confirmed C) The strategy should be scaled to full size D) No further testing is required

**Part 5 questions:**
17. Which regulator should a retail trader contact to verify that a U.S. broker-dealer is registered? A) CFPB B) DFPI C) FINRA (via BrokerCheck) D) NFA
18. Under amended FINRA Rule 4210, effective 2026-06-04, what replaced the pattern day trader $25,000 minimum equity requirement? A) A $10,000 minimum B) Intraday margin standards C) A ban on day trading for retail investors D) SEC Rule 15c3-3
19. A trader sells stock at a $500 loss on October 1 and buys the same stock on October 20. What tax rule applies? A) The Section 1256 mark-to-market rule B) The wash-sale rule, disallowing the $500 loss C) The long-term capital gains rate D) Section 475(f) ordinary income treatment
20. A hypothetical strategy presentation shows a Sharpe ratio of 2.5 based solely on in-sample backtested data with no out-of-sample test. According to the peer-review rubric in Lesson 20 and the SEC's 2022 investor alert, what is the most appropriate reviewer response? A) Accept the result as compelling performance evidence B) Score dimension 2 as 1 or 2 and require an out-of-sample test before passing C) Recommend immediate live deployment D) Score the full rubric as 24

### Answers
**Part 1:**
1. C — One option contract covers 100 shares; $3.00 × 100 = $300.00.
2. C — A market order guarantees execution at the prevailing price; it does not guarantee the price.
3. C — Regulation T initial margin for equities is typically 50%. (Source: 12 C.F.R. Part 220 — see resources-notes.md: `reg-t-12cfr220`.)
4. C — The $20,000 position falls 30% = $6,000 loss. Loss as % of $10,000 equity = 60%.

**Part 2:**
5. C — Under the simplified independent-return approximation, t = Sharpe × square root of years. A one-sided 5% threshold z ≈ 1.645 gives years ≈ (1.645/0.5)^2 = 10.82; option C (about 11 years). Estimate depends on assumptions.
6. B — Look-ahead bias is using future data in a simulation as if it were known at trade time.
7. B — Full Kelly sizing can result in a 100% drawdown in extreme scenarios; half-Kelly reduces ruin risk while still growing geometrically.
8. B — Calmar ratio = 15% / 20% = 0.75.

**Part 3:**
9. B — Bid-ask spread = $50.05 − $49.95 = $0.10.
10. B — Walking up the order book by exhausting the best offer is market impact.
11. B — Rule 611 prohibits trade-throughs of protected quotations, subject to exceptions. The SEC proposed rescinding it in June 2026; as of November 17, 2026, that proposal is not final. (https://www.sec.gov/rules-regulations/2026/06/s7-2026-20)
12. C — A market-on-close order executes at the closing auction price.

**Part 4:**
13. B — Idempotency enforced by unique client-order IDs prevents duplicate orders on retry.
14. B — Paper fills ignore queue position and market depth; a quick paper fill does not predict live fill time or probability.
15. C — The MDLL must include both realized P&L from closed trades and mark-to-market P&L from open positions. (Lesson 15.)
16. B — A paper run confirms code and controls; it does not confirm live fill quality, real costs, or a live edge. (Lesson 16.)

**Part 5:**
17. C — FINRA BrokerCheck verifies broker-dealer registration. (Lesson 18.)
18. B — FINRA amended Rule 4210 to replace the PDT framework with intraday margin standards, effective June 4, 2026. (SR-FINRA-2025-017; SEC Release 34-105226.)
19. B — Repurchasing the same security within 30 days of a loss triggers the wash-sale rule. (IRS Publication 550.)
20. B — An in-sample-only Sharpe ratio scores dimension 2 at 1 or 2; the SEC's 2022 alert specifically warns against relying on back-tested results without out-of-sample validation. (Sources: `sec-performance-claims`; Lesson 20 rubric, dimension 2.)

### Mastery checkpoint
Complete the full graduation assessment (20 questions) without referring to any lesson materials. Score yourself. For any question scored incorrectly, return to the relevant lesson, read the section that covers the concept, and write a one-paragraph explanation of why your original answer was wrong and what the correct reasoning is.

### Limitations
The peer-review rubric in this lesson is a structured learning tool, not a substitute for professional strategy review by a qualified investment adviser, compliance officer, or risk manager. The graduation assessment tests recall and basic application of concepts from Parts 1–5; it does not test quantitative skill, real coding ability, or the ability to execute trades safely in live markets. Completing this course does not qualify any person to manage money for others, provide investment advice, or represent that they are trained as a financial professional. All trading involves the risk of loss.

---

## Part 5 Assessment
The Part 5 assessment is integrated into Lesson 20's graduation assessment (20 questions, covering all five Parts). A score of 15/20 or above represents course completion. For Part 5 specifically, questions 17–20 assess Lessons 17–20. Review any lesson in Part 5 for which you scored below 3/4 on those four questions.

**Suggested sequence after completing the graduation assessment:**
1. If score ≥ 15/20: continue to paper testing (Part 4, Lesson 16) using the process document from Lesson 17.
2. If score < 15/20: return to the Part(s) with the most incorrect answers and re-read the relevant lessons.
3. All learners: check FINRA SR-FINRA-2025-017 and current IRS digital-asset guidance before relying on Lessons 18 and 19.

---

## Resource Library — Part 5
The following resources are referenced in Part 5 lessons. All URLs should be verified at the time of access; regulatory and tax content changes frequently.

### Trading psychology
- Barber, B.M. and Odean, T., "Trading Is Hazardous to Your Wealth," *Journal of Finance*, 55(2), 2000. https://faculty.haas.berkeley.edu/odean/papers%20current%20versions/individual_investor_performance_final.pdf
- Barber, B.M. and Odean, T., "The Behavior of Individual Investors," *Handbook of the Economics of Finance*, 2013. https://faculty.haas.berkeley.edu/odean/papers%20current%20versions/behavior_of_individual_investors.pdf
- Kahneman, D., "Maps of Bounded Rationality," *American Economic Review*, 93(5), 2003. https://www.aeaweb.org/articles?id=10.1257/000282803322655392

### U.S. regulatory safeguards
- FINRA BrokerCheck: https://brokercheck.finra.org
- FINRA SR-FINRA-2025-017 (Rule 4210 day-trading margin replacement): https://www.finra.org/rules-guidance/rule-filings/sr-finra-2025-017; SEC approval: https://www.sec.gov/files/rules/sro/finra/2026/34-105226.pdf
- FINRA Intraday Trading Basics: https://www.finra.org/investors/learn-to-invest/advanced-investing/day-trading
- FINRA Rule 4210 (margin): https://www.finra.org/rules-guidance/rulebook/finra-rules/4210
- FINRA Margin Calls guidance: https://www.finra.org/investors/learn-to-invest/advanced-investing/margin-statistics
- Investor.gov PDT glossary (SEC): https://www.investor.gov
- Regulation T, 12 C.F.R. Part 220: https://www.law.cornell.edu/cfr/text/12/part-220 (Cornell LII; third-party host)
- SEC investor alert, hypothetical performance, 2022-09-15: verify at sec.gov/investor/alerts
- SEC/NASAA/FINRA joint AI fraud alert, 2024: verify at sec.gov/investor/alerts
- SEC social-media stock scam alert, 2026-02-06: verify at sec.gov/investor/alerts
- NFA Basic Registration Search: https://www.nfa.futures.org/BasicNet/
- CFTC AI/SI trading bots advisory: https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/fraudadv_SITradingBots.html

### California DFPI
- DFPI investment scams page: https://dfpi.ca.gov (updated 2026-04-22)
- DFPI Crypto Scam Tracker: https://dfpi.ca.gov/crypto-scams/ (reported losses unverified by DFPI)
- DFPI complaints: https://dfpi.ca.gov/file-a-complaint/

### U.S. tax (educational only; not tax advice)
- IRS Publication 550 (2025): https://www.irs.gov/publications/p550
- IRS Topic No. 429 (Traders in Securities): https://www.irs.gov/taxtopics/tc429
- IRS Form 6781 and instructions: https://www.irs.gov/forms-pubs/about-form-6781
- IRS Digital Assets guidance: https://www.irs.gov/businesses/small-businesses-self-employed/digital-assets

### Strategy review and backtesting
- Bailey, D.H. and López de Prado, M., "The Deflated Sharpe Ratio," *Journal of Portfolio Management*, 40(5), 2014. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551
- SEC investor alert, hypothetical performance, 2022-09-15 (also listed above)
