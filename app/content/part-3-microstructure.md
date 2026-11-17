# Trading Research Academy — Part 3: Market Microstructure
Market microstructure curriculum for the Trading Research Academy. Educational simulations only. All order books, quotes, fills and prices in examples are hypothetical unless a source is cited. Nothing here is a recommendation to trade any product.

## Start Here
Parts 1 and 2 treated a fill as one number. Part 3 opens that number up: who was ahead of you in the queue, how much was displayed, which venue executed the order, and what you could not see. The goal is to explain your own fills honestly, not to compete with professional trading firms on speed. Every lesson ends with what a retail trader can and cannot observe.

## Course map
Available: Part 1 — exposure, products, orders, margin and basic sizing (Lessons 1–4).
Available: Part 2 — quantitative strategies, risk modeling, systematic execution and parameter optimization (Lessons 5–8).
Available: Part 3 — limit order books, liquidity and market impact, U.S. order routing, and high-frequency order-book dynamics (Lessons 9–12, this file).
Available: Part 4 — how an automated trading system works, paper-only broker APIs, controls and forward testing (Lessons 13–16 in `app/content/part-4-automation.md`).
Available: Part 5 — discipline, U.S./California safeguards, tax introduction, friend-strategy rubric and graduation assessment (Lessons 17–20 in `app/content/part-5-discipline.md`).

---

## Lesson 9 — The Limit Order Book and Queue Priority
### Objective and prerequisites
Read a limit order book level by level, follow how incoming orders match against resting orders under price-time priority and pro-rata allocation, and estimate your queue position for a resting limit order.
Prerequisites: Lesson 3 (market, limit and stop orders; partial fills) and Lesson 7 (order lifecycle in an event-driven engine).

### Explanation and vocabulary
A limit order book is a venue's list of resting buy and sell limit orders, grouped by price. A matching engine pairs an incoming order with resting orders under the venue's published rules. Two rules decide who trades first:
1. Price priority: a better price always trades first. A bid at 49.99 trades before a bid at 49.98.
2. Allocation at the same price: under price-time priority (first in, first out, or FIFO), the earliest order at a price trades first. Under pro-rata allocation, an incoming order is split among resting orders in proportion to their size. Some futures products use mixtures (for example a top-order allocation, then pro-rata, then FIFO for the remainder). CME Group documents several such algorithms and assigns them by product, so check the specification of the exact product.

Queue position is the number of shares (or contracts) at your price that must trade or cancel before your order can fill. It improves when orders ahead of you fill or cancel. It does not improve when new orders join behind you.

Resting at the best bid has a hidden cost called adverse selection: your buy order tends to fill when sellers are eager, which is often just before the price falls. A limit order saves the spread when it fills but can fill at the worst moments and stay unfilled at the best ones.

Vocabulary:
- Limit order book: the venue's collection of resting limit orders, sorted by price and then by the allocation rule.
- Price level: all resting orders at one price on one side of the book.
- Best bid / best offer (ask): the highest resting buy price and lowest resting sell price on that venue.
- Spread: best ask minus best bid.
- Midpoint: (best bid + best ask) / 2.
- Tick size: minimum price increment the venue accepts for that product.
- Resting (passive) order: a limit order that did not execute on arrival and now waits in the book.
- Marketable order: a market order, or a limit order priced at or through the opposite best quote, that can execute immediately.
- Maker / taker: the resting side that provided liquidity / the incoming side that removed it. Many venues charge or rebate them differently.
- Price-time priority (FIFO): at the same price, earlier orders fill first.
- Pro-rata allocation: at the same price, an incoming order is shared in proportion to resting sizes, under product-specific minimums and rounding rules.
- Displayed vs reserve (iceberg) quantity: the visible part of an order versus a hidden remainder that refreshes. Priority rules for refreshed or hidden quantity are venue-specific.
- Cancel/replace: modifying an order. On many venues an increase in size or a price change resets time priority; check the venue rulebook before assuming either way.
- Queue position: shares ahead of you at your price.
- Adverse selection: the tendency for passive orders to fill when the counterparty has better short-term information.

Formulas (plain text):
- spread = best_ask - best_bid
- mid = (best_bid + best_ask) / 2
- spread_bps = spread / mid × 10,000
- pro-rata share for resting order i = incoming_qty × (size_i / total_size_at_level), before the product's minimum-allocation and rounding rules
- average fill price = sum(qty_k × price_k) / sum(qty_k)

### Worked example
Hypothetical stock XYZ on one venue with a $0.01 tick, price-time priority, and all orders displayed.

Asks (sell side):
- 50.02: 1,000 shares
- 50.01: 600 shares
- 50.00: 400 shares (order C 100 entered 09:30:00.050, order D 300 entered 09:30:00.300)

Bids (buy side):
- 49.99: 500 shares (order A 200 entered 09:30:00.100, order B 300 entered 09:30:00.400)
- 49.98: 800 shares

Step 1: Describe the top of book.
Spread = 50.00 - 49.99 = $0.01 (one tick). Mid = (49.99 + 50.00) / 2 = 49.995. Spread in basis points = 0.01 / 49.995 × 10,000 = 2.0 bps.

Step 2: Join the bid.
At 09:30:01.000 you place a buy limit for 100 shares at 49.99. Your queue position is 500 shares (A 200 + B 300).

Step 3: A market sell for 300 shares arrives.
It fills A 200 and then 100 of B. B has 200 left. Shares ahead of you = 200. Trades printed at your price (49.99) for 300 shares, yet you received nothing. A trade at your limit price does not mean your order filled.

Step 4: B cancels 150 shares.
B now has 50 shares. Shares ahead of you = 50.

Step 5: A market sell for 120 shares arrives.
It fills B's remaining 50 and then 70 of your 100. You have a partial fill of 70 shares at 49.99 and 30 shares still resting, now first in the queue.

Step 6: Adverse selection check.
Suppose the quote then moves to 49.97 bid / 49.98 ask. New mid = 49.975. Your 70 shares are marked at 70 × (49.975 - 49.99) = 70 × (-0.015) = -$1.05 before costs. You filled because sellers were active, and the price moved against you right after.

Step 7: Compare with taking liquidity.
A market buy of 700 shares against the original asks fills 400 at 50.00 (C first, then D) and 300 at 50.01.
Cost = 400 × 50.00 + 300 × 50.01 = 20,000 + 15,003 = $35,003.
Average price = 35,003 / 700 = 50.0043.
This assumes the book does not change while the order executes.

Step 8: Same level under pro-rata.
A price level holds three resting orders of 100, 300 and 600 shares (total 1,000), entered in that order. An incoming order for 200 shares arrives.
- FIFO: 100, 100, 0.
- Pure pro-rata: 200 × 100/1,000 = 20; 200 × 300/1,000 = 60; 200 × 600/1,000 = 120. Total 200.
Real pro-rata products add minimum allocations and rounding steps, so actual allocations can differ.

### Common mistakes
1. Assuming a trade printed at your limit price means you were filled. In Step 3, 300 shares traded at 49.99 and your order received nothing.
2. Assuming time priority survives every modification. Increasing size or changing price commonly sends the order to the back of the queue; verify the venue's rules rather than assuming.
3. Treating a passive limit fill as free. You save the spread when filled, but fills cluster when the price is about to move against you (adverse selection), and some orders never fill at all.

### Resources
- CME Group, "CME Globex Matching Algorithms" (client systems wiki). Official descriptions of FIFO, pro-rata, allocation and split algorithms and the steps each applies. Futures-specific; check which algorithm a product uses. https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457316046/CME+Globex+Matching+Algorithms
- Nasdaq, "Nasdaq TotalView-ITCH 5.0" specification (PDF). Shows how a real exchange feed reports add-order, execute, cancel and delete events for individual orders. Technical; read the message list, not every byte offset. https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf
- U.S. SEC, Rule 612 (Minimum Pricing Increment) frequently asked questions. Explains sub-penny restrictions on quotes and orders for NMS stocks. https://www.sec.gov/divisions/marketreg/subpenny612faq.htm
- Glosten, L. R., & Milgrom, P. R. (1985). "Bid, ask and transaction prices in a specialist market with heterogeneously informed traders." Journal of Financial Economics, 14(1), 71–100. Classic model showing that a spread can arise from informed trading alone. https://doi.org/10.1016/0304-405X(85)90044-3
- SEC / Investor.gov, "Types of Orders" (Part 1 resource R5). Plain-language order definitions. https://www.investor.gov/introduction-investing/investing-basics/how-stock-markets-work/types-orders

### Assignment
1. In the Paper lab, set a practice price for one watchlist symbol and write out a hypothetical five-level book (five bids, five asks, with order timestamps) in your notes.
2. Replay Steps 2–5 of the worked example with your own numbers: place a resting buy, then apply two incoming market sells and one cancellation. Record your queue position after each event.
3. Log each simulated order in the Journal with paper_or_live = paper, entry_planned, entry_actual and quantity. In notes, state whether the order was filled, partially filled or unfilled and why.
4. Compute the FIFO and pro-rata allocations for one price level of your choice with an incoming order that does not divide evenly. State which rounding assumption you used.

### Quiz
1. Under price-time priority, which resting order at the best bid fills first? A) The largest order B) The earliest order entered at that price C) The most recently entered order D) A randomly chosen order
2. You rest a buy at 49.99 with 500 shares ahead of you. An incoming market sell for 300 shares executes at 49.99. With no cancellations or new orders, how many shares are now ahead of you? A) 500 B) 300 C) 200 D) 0
3. A price level holds resting orders of 100, 300 and 600. Under pure pro-rata (ignoring minimums and rounding), how much of an incoming 200-share order does the 600-share order receive? A) 120 B) 200 C) 0 D) 60
4. Which statement about a buy limit order resting at the best bid is correct? A) It is guaranteed to fill if any trade prints at its price B) It is guaranteed price improvement C) It has priority over earlier orders at the same price D) It can stay unfilled even while trades print at its price
5. You cancel and resubmit a resting order at the same price with a larger size. Under typical price-time rules, what happens to your time priority? A) It is generally lost; the new order joins the back of the queue B) It is kept because the price is unchanged C) It improves because the order is larger D) It moves to the front because it was modified

### Answers
1. B — Price-time priority fills the earliest order at the best price first; size does not matter under FIFO.
2. C — The 300 shares fill orders ahead of you, leaving 500 - 300 = 200 shares in front.
3. A — 200 × 600/1,000 = 120 shares.
4. D — Orders ahead of you in the queue absorb the trades first, so prints at your price do not guarantee your fill.
5. A — A cancel-and-resubmit creates a new order with a new timestamp; size increases via modification also commonly lose priority. Always check the venue's rules.

### Mastery checkpoint
Given a fresh hypothetical book with at least three levels per side and five events (arrivals, cancels, market orders), correctly state after every event: best bid, best ask, spread, mid, your queue position, and your filled and remaining quantity. Also compute one FIFO and one pro-rata allocation. Repeat with a new book if any value is wrong.

### Limitations
Real venues have hidden and reserve orders, auctions at the open and close, self-trade prevention, order types with special priority, and product-specific allocation rules. This lesson uses one venue with fully displayed orders. U.S. stocks trade on many venues at once (Lesson 11), so one venue's book is never the whole market.

---

## Lesson 10 — Liquidity, Spreads, Depth and Market Impact
### Objective and prerequisites
Measure the cost of trading using quoted spread, effective spread, realized spread and price impact; estimate the cost of walking the book; and relate order size to available depth.
Prerequisites: Lesson 9 (order book mechanics), Lesson 4 (loss budgets that include costs), Lesson 7 (slippage in simulation).

### Explanation and vocabulary
Liquidity is the ability to trade a meaningful size quickly at a price close to the current midpoint. It has three practical dimensions: tightness (spread), depth (size available near the best prices) and resilience (how quickly depth returns after it is consumed).

The quoted spread is what the screen shows. The effective spread is what you actually paid relative to the midpoint at the time of your order. U.S. SEC Rule 605 execution-quality reports use these measures, and the 2024 amendments added an effective-to-quoted spread ratio to the required statistics.

For a buy order: effective spread = 2 × (fill price - mid at order arrival). For a sell order: effective spread = 2 × (mid at order arrival - fill price). The factor 2 converts a one-side cost into a round-trip-equivalent spread.

The effective spread can be split into two parts using the midpoint some time after the trade (for example 5 minutes later):
- realized spread (buy) = 2 × (fill price - later mid). This approximates what the liquidity provider kept.
- price impact (buy) = 2 × (later mid - mid at arrival). This approximates how much the price moved after the trade.
- effective spread = realized spread + price impact.
A large price impact means the counterparty who sold to you was adversely selected (the price moved up after they sold), which is why liquidity providers widen quotes when they suspect informed flow (Glosten–Milgrom, Kyle).

Market impact is the price movement your own order causes. For a single marketable order it shows up as walking the book. For a large order split over time, it accumulates as each piece consumes liquidity. Participation rate = your traded volume / total market volume over the same period. Splitting an order lowers impact per piece but adds timing risk, because the price can drift while you wait.

Vocabulary:
- Liquidity: ability to trade size quickly near the current price.
- Quoted spread: best ask minus best bid at a moment in time.
- Relative spread (bps): spread / mid × 10,000.
- Depth: total size displayed at or near the best prices.
- Walking the book: a marketable order consuming several price levels.
- Effective spread: 2 × the signed distance between the fill price and the arrival midpoint.
- Price improvement: execution at a better price than the best quote available at arrival.
- Realized spread: 2 × the signed distance between the fill and a later midpoint.
- Price impact: 2 × the signed move of the midpoint from arrival to the later time.
- Market impact: price movement caused by your own trading.
- Average daily volume (ADV): mean shares or contracts traded per day over a stated window.
- Participation rate: your volume / market volume in the same interval.
- Implementation shortfall: difference between a paper decision price and the actual average execution price, including fees.
- Kyle's lambda: a model parameter measuring how much price moves per unit of net order flow.

Formulas (plain text):
- quoted_spread = ask - bid; mid = (ask + bid) / 2
- effective_spread_buy = 2 × (fill - mid_arrival)
- realized_spread_buy = 2 × (fill - mid_later)
- price_impact_buy = 2 × (mid_later - mid_arrival)
- effective_spread = realized_spread + price_impact
- E/Q ratio = effective_spread / quoted_spread
- participation_rate = your_volume / market_volume

### Worked example
Part A — a liquid stock with price improvement (hypothetical).
Quote at arrival: bid 24.99, ask 25.01. Mid = 25.00. Quoted spread = $0.02. Relative spread = 0.02 / 25.00 × 10,000 = 8 bps.
You buy 1,000 shares and receive a fill at 25.005.
- Price improvement versus the ask = 25.01 - 25.005 = $0.005 per share, or 1,000 × 0.005 = $5.00 in total.
- Effective spread = 2 × (25.005 - 25.00) = $0.01 per share = 4 bps of mid.
- E/Q ratio = 0.01 / 0.02 = 50%.
Five minutes later the mid is 25.02.
- Realized spread = 2 × (25.005 - 25.02) = -$0.03.
- Price impact = 2 × (25.02 - 25.00) = $0.04.
- Check: -0.03 + 0.04 = 0.01, which equals the effective spread.
Interpretation: the seller who traded with you lost relative to the later mid. If that happens to a market maker often, it will quote wider or smaller.

Part B — a thin stock where size walks the book (hypothetical).
Quote: bid 9.95, ask 10.00. Mid = 9.975. Displayed asks: 500 at 10.00, 300 at 10.05, 1,000 at 10.15.
A market buy for 1,500 shares, assuming the book does not change during execution:
- 500 × 10.00 = 5,000.00
- 300 × 10.05 = 3,015.00
- 700 × 10.15 = 7,105.00
- Total = $15,120.00; average = 15,120 / 1,500 = 10.08.
Cost versus the ask = 1,500 × (10.08 - 10.00) = $120.00, or 80 bps of the ask price.
Cost versus the mid = 10.08 - 9.975 = $0.105 per share = 0.105 / 9.975 × 10,000 = about 105 bps.
If this stock's ADV were 60,000 shares, the order alone would be 1,500 / 60,000 = 2.5% of a full day's volume.
Link to Lesson 4: with a $10 loss budget, $120 of entry cost is 12 times the entire budget before the price moves at all. The correct answer is NO TRADE at that size, or a different product.

### Common mistakes
1. Using the quoted spread as the cost of any size. Depth at the best quote may be a few hundred shares; anything larger walks the book.
2. Measuring slippage against the last trade price instead of the arrival midpoint or the price at decision time, which hides part of the cost.
3. Assuming liquidity is constant. Spreads and depth change by time of day, around news, and across products; a cost estimate from a calm period understates cost in stressed periods.

### Resources
- U.S. SEC press release 2024-32, "SEC Adopts Amendments to Enhance Disclosure of Order Execution Information" (Rule 605), March 6, 2024. Lists the new effective-to-quoted spread ratio, realized-spread horizons, size improvement and millisecond time-to-execution statistics. https://www.sec.gov/news/press-release/2024-32
- U.S. SEC, Rule 605 amendments fact sheet (Release 34-99679). Short summary of who reports and what. https://www.sec.gov/files/34-99679-fact-sheet.pdf
- Electronic Code of Federal Regulations, 17 CFR 242.605 (Disclosure of order execution information). Primary rule text and definitions. https://www.ecfr.gov/current/title-17/chapter-II/part-242/subject-group-ECFRac68bdd026a46db/section-242.605
- Kyle, A. S. (1985). "Continuous Auctions and Insider Trading." Econometrica, 53(6), 1315–1335. Origin of the price-impact parameter lambda. https://doi.org/10.2307/1913210
- Glosten, L. R., & Milgrom, P. R. (1985). Journal of Financial Economics, 14(1), 71–100 (see Lesson 9). https://doi.org/10.1016/0304-405X(85)90044-3

### Assignment
1. Backtest lab: run the same SMA rule on one dataset with slippage set to 2, 10 and 50 bps per side (field `btSlip`). Record net P/L, trade count and maximum drawdown for each run in the Strategy testing record (cost_model and slippage_model fields).
2. Risk-sizing worksheet: re-size the Lesson 4 example after adding the Part B entry cost ($0.08 per share versus the ask) to the variable cost per unit. Record how the allowed quantity changes.
3. Write a hypothetical book for a thin product and compute the average fill, cost versus mid in bps, and participation rate for three order sizes. Mark NO TRADE where entry cost exceeds half your loss budget.
4. In the Product passport for one product, add a note on typical spread and the source and date you used.

### Quiz
1. Bid 24.99, ask 25.01. What is the quoted spread in basis points of the midpoint? A) 2 bps B) 4 bps C) 8 bps D) 80 bps
2. The arrival mid is 25.00 and your buy fills at 25.005. What is the effective spread per share? A) $0.01 B) $0.005 C) $0.02 D) $0.03
3. Why can a stock with a one-cent quoted spread still be expensive for a large order? A) Spreads never matter for stocks B) Brokers always charge more for large orders C) Market orders always fill at the midpoint D) The displayed size at the best quote may be small, so the order walks the book
4. A market maker sells to a buyer and the midpoint rises soon after. What does the resulting negative realized spread for the market maker suggest? A) The market maker profited from the trade B) The buyer was likely better informed about short-term direction (adverse selection) C) The trade was reported in error D) An exchange fee was charged
5. For the same total shares, which choice generally lowers expected market impact? A) One market order at the open B) One larger limit order placed through several price levels C) Smaller pieces at a lower participation rate spread over time, accepting timing risk D) Using more leverage

### Answers
1. C — 0.02 / 25.00 × 10,000 = 8 bps.
2. A — 2 × (25.005 - 25.00) = $0.01.
3. D — Spread describes only the best quote; depth decides the price of size.
4. B — Price moving in the buyer's favor after the trade means the liquidity provider sold too cheaply relative to later information.
5. C — Lower participation reduces impact per piece, but the price may move while you wait.

### Mastery checkpoint
For three fresh hypothetical trades (one buy with price improvement, one sell, one large order that walks the book), compute quoted spread, effective spread, E/Q ratio, realized spread, price impact and cost versus mid in dollars and bps. Show that realized spread + price impact = effective spread for each. Then state, for each trade, whether it fits a stated loss budget.

### Limitations
Displayed books omit hidden liquidity and other venues. Five-minute realized-spread windows are a convention, not a law of nature. Impact models estimated by academics or vendors depend on the sample, product and period, and a simple average-fill calculation ignores that other traders react to your order. Crypto venues often show full depth but can have very different depth from one exchange to another.

---

## Lesson 11 — Order Routing, Venues, Dark Pools and Payment for Order Flow (U.S.)
### Objective and prerequisites
Describe where a U.S. retail stock order can go after you press buy, how payment for order flow and best-execution duties interact, and how to read the public reports (Rule 606 and Rule 605) that describe routing and execution quality.
Prerequisites: Lessons 9–10. Lesson 2 (product and venue identification).

### Explanation and vocabulary
U.S. equities trade on many venues at once: registered national securities exchanges, alternative trading systems (ATSs), and broker-dealers that execute orders off-exchange (often called wholesalers or off-exchange market makers). Each exchange runs its own book. The consolidated best bid and offer across exchanges is the NBBO, published by the securities information processors (SIPs).

Typical paths for a retail market order:
1. Your broker routes it to a wholesaler, which executes it against its own inventory (internalization), often at or inside the NBBO.
2. Your broker routes it to an exchange.
3. Your broker or a router sends it to an ATS. ATSs that do not display orders to the public before execution are commonly called dark pools. Trades are still reported after execution.

An ATS is a trading system that meets the legal definition of an exchange but operates under the Regulation ATS exemption; it must register as a broker-dealer and file notice with the SEC (Form ATS, or Form ATS-N for NMS-stock ATSs). Filing is notice, not SEC approval.

Payment for order flow (PFOF) is compensation a broker receives for directing customer orders to a particular market maker or venue. FINRA Rule 5310 requires a broker to use reasonable diligence to find the best market so the resulting price is as favorable as possible under prevailing conditions. FINRA Regulatory Notice 21-23 restates long-standing guidance that receiving PFOF does not by itself violate best execution, but a firm may not let PFOF interfere with its best-execution duty, and firms must conduct regular and rigorous reviews of execution quality.

Public disclosures you can read:
- Rule 606 order-routing reports: broker-dealers publish quarterly reports on where they route non-directed orders in NMS stocks, broken down by calendar month after 2018 amendments, including the material terms of PFOF arrangements. Customers can also request order-specific routing information.
- Rule 605 execution-quality reports: market centers, and after the 2024 amendments larger broker-dealers (100,000 or more customer accounts) and single-dealer platforms, publish monthly execution-quality statistics plus a summary report. The amendments' compliance date was 18 months after the effective date; check the exact date before relying on a firm's report [unverified: exact compliance date].
- FINRA OTC Transparency data: weekly ATS and non-ATS volume by security, published with a delay (per FINRA's 2019 notice: two weeks for Tier 1 NMS stocks and four weeks for other NMS stocks and OTC equity securities; check the current page).

Rule changes in progress: Regulation NMS Rule 611 (the Order Protection or trade-through rule) currently requires trading centers to prevent trades at prices worse than protected displayed quotes, subject to exceptions. On June 11, 2026 the SEC proposed rescinding Rule 611 and Rule 610(e) (the locked/crossed market prohibition); comments were due August 17, 2026. As of this writing it is a proposal, not a final rule. Check the SEC's site for its current status before teaching it as current law.

Crypto contrast: there is no NBBO, Rule 605/606 equivalent, or trade-through rule for spot crypto. A crypto exchange is commonly the broker, the venue and the custodian at once, and prices can differ across exchanges.

Vocabulary:
- Venue: any place an order can execute (exchange, ATS, or a broker-dealer trading as principal).
- NBBO: national best bid and offer across exchanges' protected quotes.
- SIP: securities information processor that publishes consolidated quotes and trades.
- Wholesaler / off-exchange market maker: a broker-dealer that executes retail orders against its own account.
- Internalization: a firm executing customer orders against its own inventory.
- ATS: alternative trading system operating under Regulation ATS.
- Dark pool: an ATS that does not publicly display orders before execution.
- Payment for order flow: compensation to a broker for routing orders to a particular venue.
- Best execution: the duty to use reasonable diligence to obtain the most favorable terms reasonably available.
- Price improvement: execution better than the NBBO at arrival.
- Rule 606 report: public order-routing disclosure, including PFOF terms.
- Rule 605 report: public execution-quality statistics.
- Trade-through: an execution at a price worse than a protected quote displayed elsewhere.
- Smart order router: software that splits and sends orders across venues.

### Worked example
Part A — total cost, not headline commission (hypothetical numbers).
NBBO at arrival: 20.00 bid, 20.02 ask. Mid = 20.01. You buy 500 shares.
- Broker A: zero commission, receives PFOF, your fill is 20.015.
  Cost = 500 × 20.015 = $10,007.50.
  Price improvement versus the ask = 500 × (20.02 - 20.015) = $2.50.
  Effective spread = 2 × (20.015 - 20.01) = $0.01; E/Q = 0.01 / 0.02 = 50%.
- Broker B: $1.00 commission, your fill is 20.012.
  Cost = 500 × 20.012 + 1.00 = 10,006.00 + 1.00 = $10,007.00.
  Price improvement versus the ask = 500 × (20.02 - 20.012) = $4.00.
  Effective spread = 2 × (20.012 - 20.01) = $0.004; E/Q = 0.004 / 0.02 = 20%.
- Paying the full ask with no improvement and no commission: 500 × 20.02 = $10,010.00.
In this hypothetical, Broker B is $0.50 cheaper on this order despite the commission. One order proves nothing about either broker. Only aggregated statistics by order type and size (Rule 605) and repeated reviews can describe execution quality, and those numbers vary by month and stock.

Part B — trade-through (simplified).
Exchange X displays a protected offer of 300 shares at 20.02. Exchange Y's best offer is 20.03. Under Rule 611 as currently in force, Exchange Y generally may not execute an incoming buy at 20.03 while X's protected 20.02 quote is displayed, unless an exception applies (for example an intermarket sweep order that also takes X's quote). If the June 2026 proposal is adopted, this specific protection would be removed and best-execution duties would carry more weight.

### Common mistakes
1. Treating "commission-free" as "cost-free". Price received relative to the NBBO is part of the cost; Part A shows a commission broker can be cheaper.
2. Treating dark pools as unregulated or illegal. ATSs register as broker-dealers, file with the SEC, and report trades after execution; their orders are simply not displayed beforehand.
3. Judging a broker's execution quality from one fill or a marketing claim instead of Rule 605/606 data, which aggregate many orders and still need careful interpretation.

### Resources
- Electronic Code of Federal Regulations, 17 CFR 242.606 (Disclosure of order routing information). Primary text of the routing-report rule. https://www.ecfr.gov/current/title-17/chapter-II/part-242/subject-group-ECFRac68bdd026a46db/section-242.606
- FINRA Regulatory Notice 21-23, guidance on best execution and payment for order flow. https://www.finra.org/rules-guidance/notices/21-23
- FINRA, 2026 Annual Regulatory Oversight Report: Customer Order Handling — Best Execution and Order Routing Disclosures. https://www.finra.org/rules-guidance/guidance/reports/2026-finra-annual-regulatory-oversight-report/best-execution
- U.S. SEC, Alternative Trading System (ATS) list and Regulation ATS explanation. https://www.sec.gov/foia-services/frequently-requested-documents/alternative-trading-system-ats-list
- U.S. SEC Staff Report on Equity and Options Market Structure Conditions in Early 2021 (October 2021). Describes wholesalers, PFOF and dark pools during the January 2021 meme-stock period. https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf
- Sidley Austin, "SEC Proposes Rescission of the Order Protection Rule" (June 2026). Law-firm summary, secondary source; check the SEC release for authoritative text. https://www.sidley.com/en/insights/newsupdates/2026/06/sec-proposes-rescission-of-the-order-protection-rule

### Assignment
1. Find the most recent Rule 606 report for any U.S. retail broker (usually linked from its disclosures page). Record in your notes: the top three venues for market orders in S&P 500 stocks, and whether PFOF was received. Write UNKNOWN for anything you cannot find.
2. Product passport: for one U.S. stock and one crypto asset, fill venue, fees, custody and source_url. Add a note on who executes the order and who holds the asset in each case.
3. Repeat the Part A calculation for 100 shares and 5,000 shares, keeping the same per-share improvement and commission. Find the order size at which the two brokers cost the same.
4. Journal: for any Paper lab order, write which venue a real order of that type would likely reach, citing the 606 report, or write UNKNOWN.

### Quiz
1. What is payment for order flow? A) A fee a customer pays an exchange B) SIPC insurance on orders C) A rebate from the IRS D) Compensation a broker receives for directing customer orders to a particular market maker or venue
2. Which public document lists a broker's main routing venues and the terms of PFOF arrangements? A) A Rule 606 report B) Form 1099-DA C) A Rule 15c3-5 control log D) A margin agreement
3. Which description of a dark pool is accurate? A) An illegal trading venue B) An exchange that displays every order C) An ATS that does not display orders publicly before execution; trades are reported afterward D) A type of crypto wallet
4. In the worked example, why could the broker charging a commission be cheaper overall? A) Commissions are always cheaper than PFOF B) Total cost = price × quantity + fees, and better price improvement can outweigh a commission C) PFOF is illegal D) The two brokers saw different NBBOs
5. Does a single price-improved fill prove a broker provides best execution? A) Yes, always B) Yes, if the broker charges no commission C) Yes, if the stock is in the S&P 500 D) No; execution quality is assessed across many orders with statistics and regular reviews

### Answers
1. D — PFOF is compensation to the broker for routing orders, not a customer fee.
2. A — Rule 606 requires public routing reports including material PFOF terms.
3. C — Dark pools are ATSs with no pre-trade display; they register and report trades.
4. B — In Part A, B's better price saved $0.50 more than its $1.00 commission cost.
5. D — One fill can be lucky; best execution is a process judged on aggregate data.

### Mastery checkpoint
Draw (in words or a diagram) three possible paths for a retail market order in a U.S. stock and one for a spot crypto order. For each, name who executes it, who reports it, and what public data describes its quality. Then read one real Rule 606 report and summarize it in five sentences without overstating what it proves.

### Limitations
Market-structure rules are changing (the Rule 611 rescission proposal, 2024 Rule 605 and Rule 612 amendments). Verify current status on sec.gov and finra.org before relying on any rule description here. Rule 605/606 statistics are averages that can hide variation and depend on order mix. This lesson does not cover options routing, which has different rules and data.

---

## Lesson 12 — High-Frequency and Algorithmic Order-Book Dynamics: What Retail Can and Cannot See
### Objective and prerequisites
Describe how high-frequency and algorithmic traders interact with order books, explain why displayed liquidity can disappear before a retail order arrives, and list precisely what a retail trader can and cannot observe.
Prerequisites: Lessons 9–11.

### Explanation and vocabulary
High-frequency trading (HFT) refers to automated strategies that submit, modify and cancel very large numbers of orders with very low latency. Common activities include electronic market making (quoting both sides and managing inventory), cross-venue and cross-product arbitrage (for example between an ETF and its futures), and reacting to order-book events within microseconds.

Speed matters because continuous order books process messages one at a time. Budish, Cramton and Shim (2015) measured arbitrage opportunities between E-mini S&P 500 futures and the SPY ETF and found the median duration fell from 97 milliseconds in 2005 to 7 milliseconds in 2011 (per the Richmond Fed summary), while the opportunities themselves did not disappear. They argue continuous trading creates a speed race and propose frequent batch auctions as an alternative design.

On May 6, 2010, U.S. stock and futures prices fell and rebounded within minutes (the Flash Crash). The CFTC and SEC staff published a joint report on the event. Kirilenko, Kyle, Samadi and Tuzun (2017), using audit-trail data for the E-mini, report that the most active intraday intermediaries (classified as HFTs) did not change their trading pattern as prices fell; earlier working-paper versions described HFTs as contributing to volatility by demanding immediacy. The research shows how fast liquidity can vanish, not that any single group always helps or always harms.

Why displayed size vanishes: by the time your order travels from your device to your broker, through the broker's systems and router, to a venue, faster participants may have cancelled quotes or traded against them. Your screen is a delayed, sampled picture. Light in optical fiber covers roughly one kilometer every 5 microseconds [unverified: approximate physics figure], so geography alone creates delays that firms pay to minimize (colocation, direct feeds).

What a retail trader can usually observe:
- Your own order states, fills, fill prices and timestamps from your broker.
- Consolidated top-of-book quotes and trade prints (often via the broker; free data may be delayed or sampled).
- Depth-of-book for one venue if you subscribe (for example Nasdaq TotalView), showing displayed orders at that venue only.
- For crypto, many exchanges publish full displayed depth by WebSocket, but only for that exchange.
- Public aggregate reports with delays (Rule 605, Rule 606, FINRA OTC Transparency).

What a retail trader generally cannot observe:
- Your queue position at a venue.
- Hidden, reserve and dark-pool orders before execution.
- Wholesaler internalization decisions in real time.
- Who is on the other side of a trade or their intent.
- Every quote update: platforms sample or throttle updates.
- Exchange-level timestamps precise enough to reconstruct event order.

Manipulative practices such as spoofing (placing orders intended to be cancelled before execution to mislead others) are prohibited under U.S. law [unverified in this research pass: cite the CFTC and SEC enforcement pages before teaching specifics]. A pattern on your screen that looks like spoofing usually cannot be confirmed from retail data.

Vocabulary:
- High-frequency trading: automated trading with very low latency and high message rates.
- Algorithmic execution: software that splits a parent order into child orders (for example TWAP or VWAP schedules).
- Latency: time between an event and a reaction to it.
- Colocation: placing servers in or next to an exchange data center.
- Direct feed: a venue's own market-data feed, usually faster than consolidated data.
- Message-to-trade ratio: order messages (adds, modifies, cancels) per executed trade.
- Quote fading: displayed liquidity withdrawn as an order approaches.
- Level 1 / Level 2: top-of-book only / depth of book for one or more venues.
- Snapshot and incremental updates: a full book image followed by changes; missing an update corrupts your local book.
- Frequent batch auction: a market design that matches orders at discrete intervals instead of continuously.
- Spoofing: placing orders without intent to execute, to mislead other participants.

### Worked example
Part A — the vanishing offer (hypothetical).
Your depth screen for one venue shows: ask 50.00 × 2,000 shares, next ask 50.02 × 1,500.
You want 1,000 shares.
Option 1: marketable buy limit at 50.00 for 1,000 shares. By the time it arrives, 1,500 of the 2,000 shares at 50.00 have been cancelled or taken by faster orders. You receive 500 at 50.00. The remaining 500 shares rest as a bid at 50.00. You now hold half the intended position, and the rest may never fill.
Option 2: market buy for 1,000 shares on the same venue state. You receive 500 at 50.00 and 500 at 50.02.
Cost = 500 × 50.00 + 500 × 50.02 = 25,000 + 25,010 = $50,010. Average = 50.01.
Versus the screen's apparent cost (1,000 × 50.00 = $50,000), the extra cost is $10.
Trade-off: the limit order controls price but leaves quantity uncertain; the market order completes quantity but leaves price uncertain. Neither choice reveals what the faster traders knew.

Part B — sampling (hypothetical).
In one busy minute a venue produces 12,000 quote updates and 150 trades. Message-to-trade ratio = 12,000 / 150 = 80.
Your platform refreshes the screen 4 times per second: 4 × 60 = 240 snapshots per minute. At most 240 / 12,000 = 2% of the updates can appear on your screen, so most book changes are never visible to you.

Part C — crypto book integrity (concept).
A crypto exchange WebSocket level-2 channel sends a snapshot and then incremental updates; on Coinbase Advanced Trade a size of "0" means remove that price level. If your connection drops and you miss updates, your local book is wrong until you take a fresh snapshot. A bot that keeps trading on a stale book is trading on fiction (Lesson 13).

### Common mistakes
1. Treating displayed depth as a promise. Displayed size can be cancelled before your order arrives.
2. Assuming one venue's Level 2 is the whole market. U.S. stocks trade across exchanges, ATSs and wholesalers; crypto prices differ across exchanges.
3. Believing a retail setup can identify HFT intent, spoofing or "stop hunting" from a screen. The necessary data (queue positions, hidden orders, participant identities, precise timestamps) is not available to you.

### Resources
- Kirilenko, A., Kyle, A. S., Samadi, M., & Tuzun, T. (2017). "The Flash Crash: High-Frequency Trading in an Electronic Market." The Journal of Finance, 72(3), 967–998. https://doi.org/10.1111/jofi.12498
- Budish, E., Cramton, P., & Shim, J. (2015). "The High-Frequency Trading Arms Race: Frequent Batch Auctions as a Market Design Response." The Quarterly Journal of Economics, 130(4), 1547–1621. https://doi.org/10.1093/qje/qjv027
- Federal Reserve Bank of Richmond, Econ Focus 2015 Q3, "Research Spotlight" (plain-language summary of Budish et al.). https://www.richmondfed.org/publications/research/econ_focus/2015/q3/research_spotlight
- CFTC and SEC staff, "Findings Regarding the Market Events of May 6, 2010" (joint report, PDF). Primary account of the Flash Crash; long. https://www.sec.gov/files/marketevents-report.pdf
- Coinbase Developer Platform, Advanced Trade WebSocket "level2" channel documentation. Snapshot-plus-update order-book feed for one exchange. https://docs.cdp.coinbase.com/api-reference/advanced-trade-api/websocket/level2
- Nasdaq TotalView-ITCH 5.0 specification (see Lesson 9). https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf

### Assignment
1. Write two lists in your notes: "I can observe" and "I cannot observe", for your actual broker and data subscription. Mark each item with its source (broker documentation, data agreement, or UNKNOWN).
2. Paper lab: place three paper orders (one market, one marketable limit, one resting limit) on a watchlist symbol and record each in the Journal. In notes, explain how a live fill could differ from the paper fill, using Parts A and B.
3. Rework Part A with your own numbers for a thinner book, then compute the extra cost versus the screen price for a market order and the unfilled quantity for a limit order.
4. Read the Richmond Fed summary of Budish et al. and write five sentences explaining frequent batch auctions to a friend, without claiming they would make any trader profitable.

### Quiz
1. A Level 2 screen from one exchange shows which of these? A) All orders on all U.S. venues B) Hidden and dark-pool orders C) Displayed orders at that exchange only D) Your exact queue position
2. According to the published abstract of Kirilenko et al. (2017), what did the most active intraday intermediaries (HFTs) do as prices fell on May 6, 2010? A) They did not change their trading pattern B) They stopped trading entirely C) They bought aggressively to stop the decline D) They submitted the order that started the crash
3. Why can displayed size vanish before your order arrives? A) Brokers delete large orders from your screen B) The SIP shows orders that do not exist yet C) Regulators forbid filling retail orders at the displayed price D) Other participants cancel or trade against it faster than your order travels
4. What market design do Budish, Cramton and Shim propose? A) Banning limit orders B) Frequent batch auctions at short discrete intervals C) Mandatory payment for order flow D) Wider tick sizes for all stocks
5. Which can a retail trader reliably observe? A) Their queue position at each venue B) The identity of the counterparty C) Their own order states, fills and timestamps, plus public consolidated quotes and trades D) Dark-pool orders in real time

### Answers
1. C — Single-venue depth shows only that venue's displayed orders.
2. A — The published abstract reports that their trading pattern did not change as prices fell; earlier drafts framed their role differently.
3. D — Faster participants act on the same information before your message arrives.
4. B — Batch auctions reduce the value of tiny speed advantages by matching at discrete times.
5. C — Your own order data and public consolidated data are observable; the rest is not.

### Mastery checkpoint
Given a short hypothetical sequence of screen snapshots and your resulting fills, explain the gap between expected and actual execution using only observable evidence, list at least three unobservable explanations without choosing one as fact, and state what data would be needed to decide. Repeat if you claim to know another participant's intent.

### Limitations
Academic findings on HFT depend on the market, period and data access, and later studies sometimes disagree. Physical latency figures here are approximations. The lesson does not teach any low-latency strategy; retail infrastructure cannot compete on speed, and nothing here suggests that it should try.

---

## Part 3 assessment
Hypothetical one-venue book for stock QRS (tick $0.01, price-time priority, all displayed):
Asks: 30.00 × 200; 30.02 × 300; 30.05 × 500. Bids: 29.98 × 400 (two orders: 150 then 250); 29.97 × 600.
Tasks:
1. Compute spread, mid and spread in bps of mid.
2. You join the bid at 29.98 with 100 shares. A market sell for 300 shares arrives. What is your filled quantity and how many shares remain ahead of you?
3. A separate market buy for 600 shares arrives (book unchanged otherwise). Compute total cost and average price.
4. Using the arrival mid from Task 1, compute the effective spread per share and in bps for that 600-share buy.
5. Name two things a retail trader could not observe about this sequence.

### Assessment answers
1. Spread = 30.00 - 29.98 = $0.02. Mid = 29.99. Spread bps = 0.02 / 29.99 × 10,000 = about 6.7 bps.
2. The 300 shares fill the first order (150) and 150 of the second (250), leaving 100 of the second order ahead of you. Your fill = 0; shares ahead = 100.
3. 200 × 30.00 + 300 × 30.02 + 100 × 30.05 = 6,000 + 9,006 + 3,005 = $18,011. Average = 18,011 / 600 = 30.0183.
4. Effective spread = 2 × (30.0183 - 29.99) = about $0.0567 per share; 0.0567 / 29.99 × 10,000 = about 18.9 bps.
5. Any two of: queue position on a real venue, hidden or reserve orders, orders on other venues and dark pools, the identity or intent of the sellers, every quote update between screen refreshes.
Pass: all calculations correct within rounding, and Task 5 answered without claiming knowledge of other participants' intent. Passing is not live-trading authorization.

---

## Part 3 resource library
MR1: CME Group, CME Globex Matching Algorithms. https://cmegroupclientsite.atlassian.net/wiki/spaces/EPICSANDBOX/pages/457316046/CME+Globex+Matching+Algorithms
MR2: Nasdaq TotalView-ITCH 5.0 specification. https://www.nasdaqtrader.com/content/technicalsupport/specifications/dataproducts/NQTVITCHspecification.pdf
MR3: SEC press release 2024-32 (Rule 605 amendments). https://www.sec.gov/news/press-release/2024-32
MR4: 17 CFR 242.606 (Rule 606). https://www.ecfr.gov/current/title-17/chapter-II/part-242/subject-group-ECFRac68bdd026a46db/section-242.606
MR5: FINRA Regulatory Notice 21-23 (best execution and PFOF). https://www.finra.org/rules-guidance/notices/21-23
MR6: SEC Staff Report on Equity and Options Market Structure Conditions in Early 2021. https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf
MR7: Kyle (1985), Econometrica. https://doi.org/10.2307/1913210
MR8: Glosten & Milgrom (1985), Journal of Financial Economics. https://doi.org/10.1016/0304-405X(85)90044-3
MR9: Kirilenko, Kyle, Samadi & Tuzun (2017), Journal of Finance. https://doi.org/10.1111/jofi.12498
MR10: Budish, Cramton & Shim (2015), Quarterly Journal of Economics. https://doi.org/10.1093/qje/qjv027
Verification note: URLs and key facts were checked by web search or direct page retrieval in November 2026. Items marked [unverified] were not confirmed against a primary source.

## Microstructure glossary
Limit order book: a venue's resting limit orders sorted by price and allocation rule.
Price-time priority: earlier orders at the same price fill first.
Pro-rata allocation: incoming size shared in proportion to resting sizes, under product rules.
Queue position: shares ahead of you at your price.
Adverse selection: passive orders filling just before the price moves against them.
Effective spread: 2 × signed distance from fill to arrival midpoint.
Realized spread: 2 × signed distance from fill to a later midpoint.
Price impact: 2 × signed midpoint move from arrival to a later time.
Depth: displayed size near the best prices.
NBBO: national best bid and offer across exchanges.
ATS: alternative trading system under Regulation ATS.
Dark pool: an ATS without pre-trade public display.
Payment for order flow: compensation to a broker for routing orders.
Best execution: duty to seek the most favorable terms reasonably available.
Latency: delay between an event and a reaction.

## Completeness & safety disclaimers
Part 3 explains how orders interact with markets so that you can describe your own fills honestly. It contains no trading strategy and no claim that any order type, broker or venue produces better results for you. Rules cited here change; confirm current text on the regulator's site before relying on it. Educational use only.
