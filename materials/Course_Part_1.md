# Trading Research Academy: Part 1
Reconstructed teaching volume for Sarthak from this conversation. This is not the complete course and is not a byte-for-byte recovery of earlier files. Educational simulations only. Numerical market examples are hypothetical. No demonstrated profitable strategy is supplied.

## Start Here
Understand what an order does before trying to make money from it. Separate account equity, exposure, collateral and planned loss. Use paper trading for the assignments. Simulation results do not establish live profitability. Missing risk-critical specifications mean no trade.

## Course map and availability
Available: Part 1 — exposure, product literacy, orders, margin and basic sizing.
Awaiting material: Part 2 — liquidity, market structure, analysis tools, strategy comparison, and critical evaluation of SMC/ICT terminology.
Awaiting material: Part 3 — full risk mathematics, costs, research design, biases, uncertainty and benchmarks.
Awaiting material: Part 4 — fully specified trend/pullback, breakout and mean-reversion labs.
Awaiting material: Part 5 — operating discipline, current authoritative U.S./California safeguards and tax introduction, full friend-strategy rubric and graduation assessment.
Advanced electives remain unavailable. Never display these planned parts as completed lessons.

## Lesson 1 — Exposure is not margin
### Learning objective
Distinguish account equity, notional exposure, margin and loss budget.
### Prerequisites
Multiplication, subtraction and percentages.
### Plain-English explanation
Equity is account net value including open profit/loss. Notional is the market exposure a position represents. Margin is collateral supporting an obligation. A planned loss budget is a sizing constraint, not a guaranteed cap. Long means benefiting from higher prices in the simple linear examples here.
For a simple linear long: notional = quantity × price; price P/L = quantity × (exit − entry). These are not universal formulas for inverse contracts or options.
### Worked example
Hypothetical BTC is $50,000. Buying $100 spot gives 0.002 BTC. Taking 0.020 BTC exposure gives $1,000 notional. With an assumed 10:1 notional-to-margin ratio, the second position requires approximately $100 margin. At $49,500, the smaller quantity loses $1; the larger loses $10 before costs. A $10 loss is 10% of $100 equity but 1% of $1,000 equity. Actual liquidation might intervene; no threshold is inferred.
$1,000 notional divided by $100 margin is 10:1; $1,000 notional divided by $1,000 account equity is 1:1. Always name the denominator.
### Vocabulary
Equity; notional; collateral; long; unrealized P/L; leverage ratio.
### Beginner mistakes
Reading margin as purchase value; assuming collateral caps losses; ignoring open losses; inadvertently changing quantity when changing leverage; treating simulated BTC as actual custody.
### Resources
R1 TradingView leverage documentation and R2 CME margin lesson in the library.
### Assignment
Record symbol, equity, entry, quantity, notional, margin and leverage before a simulated order. Calculate 0.5%, 1% and 3% adverse moves. Change margin leverage while holding quantity fixed; record what changes.
### Quiz
1. A $1,000 linear position falls 2%: loss before costs?
2. Does $100 margin automatically cap total loss at $100?
3. Does a different margin ratio alone change fixed-quantity linear price P/L?
### Answers and explanations
1. $20. 2. No; contract and account rules determine liability. 3. No; quantity and price movement determine this price P/L, although margin and liquidation conditions may change.
### Mastery checkpoint
Solve five fresh examples and correctly annotate one simulated order ticket without confusing the four quantities.
### Uncertainty
The original position's symbol, exact quantity, account equity and contract terms are not available. Approximately $100 supporting $1,000 suggests about 10:1 notional-to-margin only.

## Lesson 2 — Read the product before the chart
### Learning objective and prerequisites
Identify what is owned or contracted. Prerequisite: Lesson 1.
### Plain-English explanation
An asset is an item or ownership interest. A derivative is a contract linked to a reference. A brokerage product is the actual legal/operational wrapper. A chart does not establish rights.
Read the product: for stocks, company/share class; ETFs, fund holdings and exposures; spot crypto, custody and withdrawal; futures, multiplier/expiry/settlement/margin; perpetuals, funding and liquidation terms; forex, whether the product is currency delivery or a leveraged contract; options, underlying/strike/expiry/exercise/multiplier and buyer/seller obligations. This overview is not preparation to trade options.
Exchange organizes trading; broker handles customer orders; market maker quotes prices and manages inventory; clearing addresses settlement obligations under its rules; custodian holds assets. Functions may be combined.
### Vocabulary
Tick: minimum permitted price increment. Multiplier: value represented by one price point. Settlement: completion of contractual obligations. Expiry: termination under specifications. Custody: asset holding arrangement.
### Worked example
A contract with $5 per index point and 0.25-point tick has $1.25 tick value. At hypothetical index level 5,000, notional is $25,000. A 20-point adverse move loses $100 before costs. A small-sounding product name does not establish affordability.
### Beginner mistakes
Ignoring multiplier or expiry; assuming all BTC symbols are spot; assuming collateral purchases the underlying; confusing intermediaries.
### Resources
R3 Introduction to Futures; R4 Micro E-mini product overview.
### Assignment
Complete a product passport for one stock/ETF and one derivative from primary specifications: symbol, venue, legal product, quantity unit, multiplier, minimum size, tick, session/timezone, expiry, settlement, custody, costs, eligibility and margin documentation. Write UNKNOWN rather than guessing.
### Quiz
1. Does futures margin buy the underlying? 2. Four ticks in the example equal? 3. Does a BTC chart prove withdrawal rights?
### Answers
1. No. 2. $5. 3. No; inspect the actual product and agreement.
### Mastery checkpoint
Complete two passports with no unknown risk-critical fields. Missing critical terms mean no trade in that product.
### Uncertainty
Sessions, holidays, settlement, delivery, exercise, eligibility, custody and liability vary. Use timezone-aware timestamps rather than an assumed fixed local offset.

## Lesson 3 — Orders control different things
### Learning objective and prerequisites
Distinguish execution priority from price constraints. Prerequisites: Lessons 1–2.
### Plain-English explanation
Bid is a buying quote; ask is a selling quote; spread is ask minus bid. Market orders seek execution at available prices, not a guaranteed last price. Limits restrict acceptable execution price but can remain unfilled. Stop-market activates a market order; stop-limit activates a limit order that can remain unfilled. Verify trigger reference and eligible sessions.
Trailing/bracket features require documentation of activation, synchronization, cancellation, persistence and local/server behavior. Do not infer protection from their names.
### Vocabulary
Partial fill: only some quantity executes. Slippage: actual execution versus a specified reference. Time-in-force: eligible duration. Trigger: activating condition.
### Worked examples
Hypothetical ask book: 2 units at $100.10, 3 at $100.20; bid $100.00. With no changes or competing orders, buying 4 at market costs $400.60, average $100.15. A $100.10 buy limit can fill only 2 under these assumptions.
Own 10 shares at $100, stop $98: intended price loss $20. If the next executable price after a gap is $90, price loss is $100. A $98-trigger/$97-limit sell stop-limit cannot sell at $90 and may leave the position open.
### Beginner mistakes
Treating stop as guaranteed price; assuming a limit touch guarantees fill; ignoring remaining quantity; duplicating a timed-out submission without checking status.
### Resources
R5 SEC Types of Orders; R6 Schwab stop-order video.
### Assignment
In simulation practice market, limit, cancel and protective-exit handling at minimal size. Record working/partial/filled/rejected/canceled states where supported. Model a gap in a spreadsheet. Verify position and order status before resubmission.
### Quiz
1. Does a limit touch guarantee execution? 2. Which stop retains a price limit? 3. Book example average? 4. Repeat an uncertain submission immediately?
### Answers
1. No. 2. Stop-limit. 3. $100.15 before costs. 4. No; verify status first to avoid duplicate exposure.
### Mastery checkpoint
Explain six cases: partial fill, gap, unfilled stop-limit, rejection, canceled order with remaining position, uncertain submission.
### Uncertainty
Matching, triggers, fees, off-hours behavior and persistence vary. The hypothetical book is not a full exchange matching model. Paper fills do not establish achievable live fills.

## Lesson 4 — Size from planned loss, not buying power
### Learning objective and prerequisites
Size a simple linear long position from a chosen loss budget. Prerequisites: Lessons 1–3.
### Explanation and vocabulary
Initial margin opens a position; maintenance margin is required to keep it. Breaches may result in demands for collateral or forced reduction/liquidation. Cross/isolated labels alone do not establish legal maximum liability. No universal liquidation formula is supplied.
Available buying power, affordable planned loss and ability to survive worse execution are separate tests. Leverage changes exposure/collateral constraints, not predictive information.
### Worked example
Hypothetical BTC entry $50,000, stop $49,500. Distance $500 per BTC. Assume variable round-trip cost/adverse-execution allowance $20 per BTC and zero fixed fees. Planned loss per BTC = $520.
Quantity <= (loss budget − fixed costs)/(entry − stop + variable cost per unit).
For $100 equity and illustrative $1 budget: 0.001923 BTC before rounding; about $96.15 notional. For $1,000 equity and $10 budget: 0.019230 BTC; about $961.54 notional. These are arithmetic illustrations, not recommended percentages.
Round down to permitted increment; check minimum size, cash, costs, margin and existing exposure. If the first position exits at $49,000, approximate loss is $1.923 plus $0.038 assumed costs = $1.96, not $1.
### Beginner mistakes
Sizing from maximum leverage; using liquidation as stop; enlarging budget to fit minimum size; ignoring fixed fees; increasing exposure after losses.
### Resources
R1 and R2. Neither specifies every liquidation engine.
### Assignment
Calculate five cases: $100/$1 illustrative budget; $1,000/$10; wider stop; fixed fees; minimum size too large. Stress each with twice the planned adverse distance. Mark NO TRADE when constraints fail.
### Quiz
1. Is planned loss guaranteed? 2. Does leverage improve the signal? 3. Minimum size exceeds budget: what now? 4. Does lower collateral change fixed-quantity price sensitivity?
### Answers
1. No. 2. No. 3. Reject the trade or choose a suitable product, not a forced larger budget. 4. No in this linear model.
### Mastery checkpoint
Correctly size five cases including costs, rounding, size constraints and worse execution; explain why planned loss is not a cap.
### Uncertainty
Shorts, inverse contracts, options, collateral haircuts, maintenance tiers, portfolio margin and deficit liability need separate specifications.

## Part 1 assessment
Equity $1,000; long 0.020 BTC; entry $50,000; assumed notional-to-margin ratio 10:1; planned stop $49,500; actual exit $49,200; fees $2. Calculate notional, illustrative margin, intended price loss, realized net loss and account drawdown. Explain why liquidation remains unknown.
### Answers
$1,000 notional; $100 illustrative margin; $10 intended price loss; $16 actual price loss + $2 fees = $18; 1.8% drawdown. Liquidation needs actual maintenance, collateral and reference rules. With $100 equity, $18 would be 18% if the trade could open and execute without prior liquidation. Pass only if all calculations and distinctions are correct; this is not live-trading authorization.

## Study routine
Three sessions of 35–45 minutes plus one 45–60 minute review, adjusted around school. Read/reproduce examples; complete assignments; practice simulation; quiz without notes and reconcile mistakes. Repeat failed checkpoints. Do not sacrifice sleep/school; no elapsed duration guarantees competence.

## Pre-trade checklist
Paper/live labeled? Exact product/venue and eligibility verified? Equity/notional/margin/budget separated? Quantity checked? Entry/stop/invalidation/exit written? Costs and worse execution modeled? Minimum size affordable? Existing correlated exposure reviewed? Session/trigger/cancellation understood? Order status verified? Backup status-check method known? Unknown critical field means no trade.

## Friend-strategy intake and review
Request market/venue/product; timeframe/timezone; setup; exact entry; stop/invalidation; exit; sizing/leverage; no-trade rules; performance claim; complete history/test method; costs; slippage; timestamped screenshots.
Record missing fields without guessing. A screenshot is not complete performance evidence. Review by fair restatement, ambiguous rules, plausible mechanism versus story, untestable claims, leverage/tail risk, objective test, support/rejection evidence. This is an initial framework, not the full later rubric.

## Starter glossary
Equity: account net value including open P/L.
Notional: reference market exposure represented by a position.
Margin: collateral supporting obligations under applicable rules.
Loss budget: planned constraint, not guaranteed maximum loss.
Long: higher-price-benefiting exposure in this model.
Tick: minimum permitted price increment.
Multiplier: contract value per price point.
Spread: ask minus bid for stated quotes.
Slippage: execution compared with a specified reference.
Partial fill: less than full quantity executed.
Liquidation: forced reduction/closure under applicable rules.

## Resource library and provenance
Verification notes carry forward earlier course research in this conversation. Links were not independently rechecked during packaging. Do not relabel inclusion as fresh verification.
R1 — How to trade with leverage in Paper Trading; TradingView; public help article. Relevant: leverage by asset class, ticket margin details, account margin. Prerequisite: percentages. Purpose: distinguish trade value/collateral. Limitation: simulation, not live custody. Incentive: commercial platform/subscriptions. Page text retrieved in earlier course research.
https://www.tradingview.com/support/solutions/43000742700-how-to-trade-with-leverage-in-paper-trading/
R2 — Margin: Know What's Needed; CME Group; public lesson. Relevant initial/maintenance margin. Prerequisite notional. Futures scope, not universal crypto rules. Exchange commercial incentive. Earlier page material verified; full embedded-media viewing not claimed.
https://www.cmegroup.com/education/courses/introduction-to-futures/margin-know-what-is-needed
R3 — Introduction to Futures; CME Group; public course material. Relevant specifications, codes, expiry, settlement, ticks, notional, margin. Prerequisite Lesson 1. Mechanics not profitability evidence. Exchange incentive. Syllabus verified earlier, not all media reviewed.
https://www.cmegroup.com/education/courses/introduction-to-futures
R4 — Micro E-mini Equity Index futures products overview; CME Group; public lesson. Multiplier/tick discussion. Prerequisite multiplication. Verify current specifications before use. Exchange incentive. Earlier page material verified.
https://www.cmegroup.com/education/courses/micro-e-mini-futures/micro-e-mini-futures-products-overview
R5 — Types of Orders; SEC/Investor.gov; free article. Market/limit/stop sections. Basic buying/selling prerequisite. Introductory securities scope. Regulatory education, no referral identified in relevant material. Earlier page text retrieved.
https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders
R6 — Trading Up-Close: Stop and Stop-Limit Orders; Charles Schwab; free YouTube, reported duration 4:07. Prerequisite bid/ask and long position. Earlier transcript retrieved, no visual inspection claimed. Transcript sections reported: 0:14 trigger, 0:41 stop-limit, 1:12 example, 2:43 continued decline. Simplified equities. Description promotes account opening/education/subscription.
https://www.youtube.com/watch?v=V-dnip2p3O4
