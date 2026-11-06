# Trading Research Academy — Part 1
Interim course volume for Sarthak. Educational simulations only. This is not the complete course. All numerical price examples are hypothetical.

## Start Here
Your first task is to explain every number on an order ticket, not to find a winning setup. Use paper trading for these assignments. Account equity, exposure, collateral and planned loss are different quantities. Do not treat a simulation as proof of achievable live execution or profitability.

## Course map
Available: Part 1 — exposure, products, orders, margin and basic sizing.
Awaiting material: Part 2 — liquidity, market structure, trading terminology and analysis tools.
Awaiting material: Part 3 — risk mathematics, costs, testing, uncertainty and benchmarks.
Awaiting material: Part 4 — fully specified trend/pullback, breakout and mean-reversion strategy labs.
Awaiting material: Part 5 — discipline, current U.S./California safeguards, tax introduction, complete friend-strategy rubric and graduation assessment.
Advanced electives are also awaiting material. Do not mark these parts available or completed.

## Lesson 1 — Exposure is not margin
### Objective and prerequisites
Distinguish account equity, notional exposure, margin and planned dollar loss. Prerequisites: multiplication, subtraction and percentages.
### Explanation and vocabulary
Equity is the account's net value including open profit/loss. Notional is the market exposure represented by a position. Margin is collateral supporting exposure. A loss budget is a planning constraint, not a guaranteed maximum loss. Long means benefiting from a price increase. Unrealized P/L means the position remains open.
For the simple linear long examples here: notional = quantity × price; price P/L = quantity × (exit − entry). These equations are not universal derivative payoff formulas.
### Worked example
Assume BTC at $50,000. A $100 spot purchase gives 0.002 BTC. A 0.020 BTC position represents $1,000 exposure. Under an assumed 10:1 notional-to-margin ratio, the latter requires approximately $100 collateral. A decline to $49,500 loses $1 on the smaller quantity but $10 on the larger quantity, before costs. That $10 is 10% of $100 account equity or 1% of $1,000 equity. Liquidation might intervene under actual product rules; no liquidation threshold is inferred.
A 10:1 notional-to-margin ratio does not imply 10:1 notional-to-account-equity. $1,000 exposure against $1,000 account equity is 1:1 by that second measure.
### Common mistakes
Reading margin as purchase value; assuming collateral caps loss; ignoring open losses; accidentally changing quantity while adjusting leverage; assuming simulated exposure establishes real custody.
### Resources
R1 TradingView leverage documentation; R2 CME margin lesson. See resource library.
### Assignment
Before a simulated order, record equity, symbol, quantity, entry, notional, leverage setting and margin. Calculate adverse price moves of 0.5%, 1% and 3%. Change leverage with quantity held constant and identify which numbers change.
### Quiz
1. A $1,000 linear position falls 2%: price loss?
2. Does $100 margin automatically cap loss at $100?
3. Does changing collateral leverage alone change price P/L with quantity fixed?
### Answers
1. $20 before costs. 2. No; liability and liquidation are product-specific. 3. No for this linear model; collateral conditions can change.
### Mastery checkpoint
Solve five fresh examples without confusing the four quantities; correctly annotate one simulated ticket. Repeat if the capital base is wrong.
### Limitations
The original trade's exact symbol, contract, account equity and quantity are unavailable. Approximately $100 supporting $1,000 suggests about 10:1 notional-to-margin, not necessarily account leverage.

## Lesson 2 — Read the product before the chart
### Objective and prerequisites
Identify what is owned or contracted. Prerequisite: Lesson 1.
### Explanation and vocabulary
An asset is an item or ownership interest. A derivative is a contract linked to a reference. A brokerage product is the actual legal/operational wrapper offered. A price chart alone does not establish legal rights.
An exchange organizes trading; a broker handles customer orders; a market maker quotes prices and manages inventory; clearing addresses settlement obligations under its rules; custody describes asset holding arrangements. These functions can be combined and do not make a product risk-free.
For a stock, identify company/share class. For an ETF, identify fund and holdings or exposure. For spot crypto, verify custody and withdrawal rights. For futures, verify multiplier, expiry, settlement and margin. For perpetual contracts, verify funding and liquidation terms. For forex, identify the actual contract rather than assuming currency delivery. For options, identify strike, expiry, exercise, multiplier and buyer/seller obligations. Options remain an advanced topic, not authorized by this brief introduction.
Tick means minimum price increment. Multiplier converts price movement into contract value. Settlement describes completion of obligations; expiry is termination under specifications.
### Worked example
Using a $5-per-index-point contract multiplier and 0.25-point tick, one tick is $1.25 per contract. At hypothetical index level 5,000, notional is $25,000. A 20-point adverse move loses $100 before costs. A product called micro can still be too large for a small account.
### Common mistakes
Confusing ticker labels with legal rights; ignoring multiplier or expiry; assuming a margin deposit buys the underlying; assuming all BTC products are spot.
### Resources
R3 Introduction to Futures; R4 Micro E-mini product overview.
### Assignment
Complete a product passport for one stock/ETF and one derivative using primary specifications. Include symbol, venue, product type, unit, multiplier, minimum size, tick, session/timezone, expiry, settlement, custody, costs, eligibility, margin and source URL. Mark gaps UNKNOWN.
### Quiz
1. Does futures margin purchase the underlying? 2. Four ticks in this example equal how much? 3. Does a BTC chart prove withdrawal rights?
### Answers
1. No. 2. $5. 3. No; inspect the product and account terms.
### Mastery checkpoint
Complete two passports with no unknown risk-critical fields. Missing specifications mean no trade in that product.
### Limitations
Hours, holidays, settlement, access, exercise, delivery and liability vary. Record timezone-aware timestamps. San Jose local time changes with daylight saving; never assume a fixed UTC offset year-round.

## Lesson 3 — Orders control different things
### Objective and prerequisites
Distinguish price constraints from execution priority. Prerequisites: Lessons 1–2.
### Explanation and vocabulary
Bid is a buying quote; ask is a selling quote; spread is their difference. Market orders seek execution at available prices without guaranteeing the price. Limits constrain acceptable price but can remain unfilled. Stop-market becomes a market order after its trigger. Stop-limit becomes a limit order and can remain unfilled after triggering. Trigger definitions and eligible sessions require product documentation.
Partial fill means only some quantity executes. Slippage compares actual execution with a stated reference. Time-in-force specifies order duration.
Trailing stops and brackets require verification of activation, synchronization, cancellation, persistence and local-versus-server behavior. Do not assume their names guarantee protection.
### Worked examples
Hypothetical asks: 2 units at $100.10, then 3 at $100.20; best bid $100.00. Assuming no competing orders or book changes, a market buy of 4 units costs $400.60, average $100.15. A buy limit at $100.10 can fill only 2 under these assumptions.
Own 10 shares at $100 with sell stop $98: intended price loss $20. If the next executable price after a gap is $90, loss is $100 before costs. A stop-limit triggered at $98 with limit $97 cannot sell at $90 and may leave the position open.
### Common mistakes
Treating stop price as guaranteed execution; assuming a limit touch guarantees a fill; ignoring remaining quantity; duplicating an order after a timeout without checking status.
### Resources
R5 SEC Types of Orders; R6 Schwab stop-order video.
### Assignment
Practice market, limit, cancellation and protective exits in simulation at the smallest practical size. Record submitted/working/partial/filled/rejected/canceled states where supported. Model a gap in a spreadsheet. Check order and position status before repeating a timed-out submission.
### Quiz
1. Does a limit touch guarantee a fill? 2. Which stop retains a price constraint? 3. Average fill in the book example? 4. Immediately repeat a timed-out order?
### Answers
1. No. 2. Stop-limit. 3. $100.15 before costs. 4. No; first verify order status and exposure.
### Mastery checkpoint
Explain six cases covering partial fill, gap, unfilled stop-limit, rejection, cancellation with remaining position and uncertain submission status.
### Limitations
Matching priority, triggers, off-hours eligibility, fees and order persistence vary. The hypothetical order book is not a full exchange simulator. Paper fills do not establish achievable live fills.

## Lesson 4 — Size from planned loss, not buying power
### Objective and prerequisites
Size a simple linear long position from a chosen loss budget. Prerequisites: Lessons 1–3.
### Explanation and vocabulary
Initial margin opens a position; maintenance margin is required to maintain it. Failure to meet requirements can produce demands for funds or forced reduction/liquidation. Cross and isolated labels do not by themselves establish legal loss limits. Do not invent a universal liquidation formula.
Available buying power, affordable planned loss and survival under worse execution are separate questions. Leverage does not improve predictive information.
### Worked example
Hypothetical BTC entry $50,000, planned stop $49,500. Price distance is $500 per BTC. Assume variable round-trip costs plus adverse-execution allowance of $20 per BTC and zero fixed cost, for illustration only. Estimated planned loss per BTC is $520.
Quantity <= (loss budget − fixed costs)/(entry − stop + variable cost per unit).
A $1 budget gives 0.001923 BTC before rounding, about $96.15 notional. A $10 budget gives 0.019230 BTC, about $961.54 notional. These budgets are arithmetic examples, not recommended percentages.
Round down to the permitted increment; check minimum order, cash, fees, margin and existing exposure. If the first quantity exits at $49,000 instead, approximate price loss is $1.923 plus $0.038 assumed costs, total about $1.96 rather than $1.
### Common mistakes
Sizing from maximum leverage; treating liquidation as the stop; increasing a budget to fit minimum size; ignoring fixed fees; increasing exposure after losses.
### Resources
R1 and R2. Neither specifies every venue's liquidation engine.
### Assignment
Calculate five cases: $100 account/$1 illustrative budget; $1,000/$10 budget; wider stop; fixed fees; minimum size above allowed quantity. For each, stress execution at twice the planned distance. Write NO TRADE when constraints cannot be met.
### Quiz
1. Is planned loss guaranteed? 2. Does leverage improve a signal? 3. What if minimum size exceeds budget? 4. Does reduced collateral lower unchanged linear quantity's price sensitivity?
### Answers
1. No. 2. No. 3. Reject the trade or choose another product; do not force it. 4. No.
### Mastery checkpoint
Correctly size five cases including costs, rounding, minimum size and worse execution. Explain why planned loss is not a cap.
### Limitations
This is a long linear educational model. Inverse contracts, options, collateral haircuts, portfolio margin, maintenance tiers and deficit liability require separate specifications.

## Part 1 assessment
Hypothetical account equity $1,000; long 0.020 BTC at $50,000; assumed notional-to-margin ratio 10:1; intended stop $49,500; actual exit $49,200; total fees $2. Calculate notional, illustrative margin, intended price loss, realized net loss and account drawdown. Explain why liquidation is unknown.
### Assessment answers
Notional $1,000; illustrative margin $100; intended pre-cost price loss $10; actual price loss $16 plus $2 fees = $18; drawdown 1.8%. No liquidation price follows without actual collateral, maintenance and reference-price rules. At $100 equity, the identical $18 loss would be 18%, if opening and execution were possible without prior liquidation.
Pass: all calculations correct and a clear distinction among margin, stop and maximum possible loss. Passing this part is not live-trading authorization.

## Study routine
Three sessions of 35–45 minutes plus one 45–60 minute review, adjusted around school. Read/reproduce examples; complete worksheet; practice simulation; then quiz without notes and reconcile errors. Repeat failed checkpoints. Do not sacrifice sleep or school to keep pace. No fixed duration guarantees competence.

## Pre-trade checklist
Paper/live labeled? Exact product/venue understood? Eligibility verified? Equity, notional, margin and budget separated? Quantity checked? Entry/stop/invalidation/exit written? Costs and worse execution calculated? Minimum size affordable? Correlated exposure reviewed? Session and triggers checked? Order status and cancellation understood? Emergency status-check method identified? Unknown critical field means no trade.

## Friend-strategy intake
Request market, venue, product, timeframe/timezone, setup, exact entry, stop/invalidation, exit, sizing, leverage, no-trade conditions, claimed performance, full trade history/testing procedure, costs, slippage and timestamped screenshots. Record missing information without inventing rules. Screenshots are examples, not complete performance evidence. Full rubric awaits later course material.

## Resource library
Verification statements below carry forward the earlier course research. Links have not been independently rechecked during this file-packaging step. Builder must not treat link inclusion as a new verification.
R1: How to trade with leverage in Paper Trading — TradingView. Public help article. Relevant sections: leverage by asset class, order ticket margin details, tracking account margin. Prerequisite: percentages. Useful for separating trade value and margin. Limitation: simulation, not live custody. Incentive: commercial subscriptions/platform. Page text retrieved during original course research.
https://www.tradingview.com/support/solutions/43000742700-how-to-trade-with-leverage-in-paper-trading/
R2: Margin: Know What's Needed — CME Group. Public lesson. Covers initial/maintenance margin; prerequisite: notional. Futures-specific, not universal crypto terms. Incentive: exchange participation. Page material verified in original research; no claim of full embedded-media review.
https://www.cmegroup.com/education/courses/introduction-to-futures/margin-know-what-is-needed
R3: Introduction to Futures — CME Group. Public course material. Relevant topics: specifications, codes, expiry/settlement, ticks, notional, margin. Prerequisite: Lesson 1. Mechanics, not evidence of profitability. Exchange commercial incentive. Syllabus verified in original research, not all media reviewed.
https://www.cmegroup.com/education/courses/introduction-to-futures
R4: Micro E-mini Equity Index futures products overview — CME Group. Public lesson. Relevant multiplier/tick discussion; prerequisite: multiplication. Verify current specifications before use. Exchange commercial incentive. Page material verified in original research.
https://www.cmegroup.com/education/courses/micro-e-mini-futures/micro-e-mini-futures-products-overview
R5: Types of Orders — SEC / Investor.gov. Free article. Relevant market/limit/stop sections. No prerequisite beyond buying/selling. Introductory securities scope. Regulatory education; no broker referral identified in relevant material. Page text retrieved in original research.
https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders
R6: Trading Up-Close: Stop and Stop-Limit Orders — Charles Schwab. Free YouTube video, 4:07. Prerequisite: bid/ask and long position. Original research retrieved transcript, not visual inspection. Reported transcript sections: 0:14 stop trigger; 0:41 stop-limit; 1:12 example; 2:43 continued-decline risk. Simplified equity examples. Description promotes Schwab account opening, education and subscription. No profitability evidence inferred.
https://www.youtube.com/watch?v=V-dnip2p3O4

## Starter glossary
Equity: account net value including open P/L.
Notional: reference market exposure represented by a position.
Margin: collateral supporting exposure or obligations under applicable rules.
Loss budget: planned dollar constraint, not guaranteed maximum loss.
Long: exposure benefiting from higher prices in the simple model used here.
Tick: minimum permitted price increment.
Multiplier: value represented by one contract price point.
Spread: ask minus bid for the stated quotes.
Slippage: actual execution versus a specified reference price.
Partial fill: less than the full order quantity executed.
Initial margin: required collateral to initiate a position.
Maintenance margin: required collateral/equity to maintain a position.
Liquidation: forced reduction/closure under applicable rules.

## Completeness
This package reconstructs the Part 1 teaching material from the conversation; it is not a byte-for-byte copy of the earlier files. No later course parts, profitable strategy results, current legal guidance or complete graduation assessment are included. The initial CSVs are editable templates, not automated calculators. The website must preserve these limitations.
