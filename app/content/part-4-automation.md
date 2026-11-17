# Trading Research Academy — Part 4: Automation
Automation curriculum for the Trading Research Academy. Educational simulations only. All order submissions, fills, latencies, and account values in examples are hypothetical unless a source is cited. Nothing here is a recommendation to trade any product or deploy any system with real money.

## Start Here
Parts 1–3 covered what to trade, how to size it, what strategies look like in a backtest, and how the order book processes an order. Part 4 asks: what happens when software runs the whole loop? The goal is to understand every component in an automated trading system, to know what can go wrong and when, and to build habits — paper-only APIs, kill switches, audit logs — before touching real money or real orders. Every lesson ends with what a retail automation setup can and cannot safely do.

## Course map
Available: Part 1 — exposure, products, orders, margin and basic sizing (Lessons 1–4).
Available: Part 2 — quantitative strategies, risk modeling, systematic execution and parameter optimization (Lessons 5–8).
Available: Part 3 — limit order books, liquidity and market impact, U.S. order routing, and high-frequency order-book dynamics (Lessons 9–12 in `app/content/part-3-microstructure.md`).
Available: Part 4 — how an automated trading system works, paper-only broker APIs, controls and forward testing (Lessons 13–16, this file).
Available: Part 5 — discipline, U.S./California safeguards, tax introduction, friend-strategy rubric and graduation assessment (Lessons 17–20 in `app/content/part-5-discipline.md`).

---

## Lesson 13 — How an Automated Trading System Works
### Objective and prerequisites
Describe the six components of an automated trading system (data, signal, sizing, execution, accounting, and monitoring), explain the role of a scheduler, and identify three failure modes — data-feed interruption, state-persistence loss, and duplicate orders — along with mitigations.

Prerequisites: Lessons 5–8 (strategy logic, risk sizing, backtesting). Lesson 7 (order lifecycle). Lesson 12 (what a retail setup can observe).

### Explanation and vocabulary
An automated trading system is software that replaces manual decision-making with a repeatable process. At minimum, every system contains these six components. They must work correctly together, not just individually.

**1. Data layer.** The data layer fetches and validates price, volume, and reference data from one or more feeds. For equities, common sources include a broker's streaming API or a consolidated data vendor. For crypto, an exchange WebSocket publishes a snapshot then incremental updates (Lesson 12). The data layer must detect stale feeds, missing bars, and malformed messages; trading on bad data is worse than not trading at all.

**2. Signal layer.** The signal layer applies the strategy's logic to validated data and produces a view of the desired position. For example, a moving-average crossover signal says "hold +100 shares of XYZ" or "hold 0 shares." The signal layer should not know anything about how orders are placed; it only knows what position it wants.

**3. Sizing layer.** The sizing layer translates a desired position into an order quantity, applying risk limits (maximum position, Kelly fraction, volatility target) from Part 2. It compares the desired position to the actual position in the accounting layer and computes the number of shares to buy or sell. Sizing must run after every signal update and after every fill, because a partial fill changes the actual position.

**4. Execution layer.** The execution layer sends orders to the broker API, tracks order states (open, partially filled, filled, cancelled, rejected), and handles errors. It must be idempotent: sending the same instruction twice must not create two orders. One way to enforce idempotency is a client-order-ID scheme — each intended order gets a unique ID generated from its parameters; before placing an order, the system checks whether that ID already exists in the broker's order list.

**5. Accounting layer.** The accounting layer maintains the system's view of positions, cash, and P&L. It must reconcile with the broker's official record at startup and periodically during the day. If the system's position disagrees with the broker's position, the system must pause until the disagreement is resolved — never trade on a position it cannot confirm.

**6. Monitoring layer.** The monitoring layer watches every other component and alerts a human when something is wrong: data feed silent for N seconds, drawdown exceeds threshold, order fill rate drops, exception thrown. It includes a kill switch (Lesson 15).

**Scheduler.** Real systems run on a scheduler — a component (or an operating-system task runner such as cron or Windows Task Scheduler) that launches the system at market open, triggers data fetches at each bar boundary, runs end-of-day reconciliation, and shuts down cleanly. A scheduler that fires twice, fires late, or fires during a maintenance window creates bugs that are hard to reproduce.

**Data-feed failure.** A feed can go silent for milliseconds or hours. The data layer must decide what to do: hold the last known price, flatten the position, or halt. Holding a stale price and treating it as new is dangerous because signal logic cannot distinguish a feed freeze from a genuine price. The safest default is to halt new signals until the feed recovers, then validate the gap before resuming.

**State persistence.** If the process crashes or the machine reboots, the system must know what positions it holds. Storing state only in RAM loses it on crash. The accounting layer must write its position and order state to durable storage (a file, a database) after every change, so a restarted process can recover. At startup, the system must reconcile the stored state with the broker's real-time position before placing any orders.

**Idempotent orders.** Network errors can cause an order-submission request to be received by the broker even though the system did not receive a confirmation. If the system retries blindly, it creates a duplicate order. Using unique client-order IDs and querying the broker for open orders before retrying prevents most duplicates.

Vocabulary:
- Automated trading system (ATS in a general sense; distinct from the alternative trading system of the same acronym in market-structure law): software that runs the full trade loop without manual intervention between signal and order.
- Event loop: the main control flow that waits for data events, calls signal and sizing logic, then calls the execution layer.
- Idempotency: the property that running an operation more than once produces the same result as running it once.
- Client-order ID (clOrdID): a unique identifier the system assigns to an order, separate from the broker's order ID, used to match acknowledgements and avoid duplicates.
- State persistence: writing system state to durable storage so it survives process restarts.
- Reconciliation: comparing the system's internal view of positions and orders with the broker's official record.
- Scheduler: a component that triggers system actions at defined times or intervals.
- Kill switch: a mechanism that immediately cancels all open orders and prevents new ones. Covered in Lesson 15.
- Stale data: data that has not been updated recently enough to be treated as current prices.
- Bar: one OHLCV observation over a fixed time interval (e.g., 1-minute, daily).

Formulas (plain text):
- desired_order_qty = desired_position - actual_position (before sizing limits are applied)
- position_check: if abs(system_position - broker_position) > tolerance, halt and alert
- idempotency key: hash or concatenation of (symbol, side, quantity, price_type, bar_timestamp)

### Worked example
Hypothetical single-asset daily system. All numbers are illustrative.

**Setup.** Strategy: buy when 10-day SMA crosses above 30-day SMA; sell when it crosses below. Universe: one hypothetical stock, ticker AAA. Bar interval: daily close. All prices, positions, and fills are hypothetical.

**Day 1 — normal cycle.**
1. Scheduler fires at 16:05 (5 minutes after close).
2. Data layer fetches the 16:00 close: $50.00. Feed is live; no gaps detected.
3. Signal layer computes 10-day SMA = 49.80, 30-day SMA = 49.50. Cross is active. Desired position: +200 shares.
4. Accounting layer reports current position: 0 shares. Desired order: buy 200 shares.
5. Sizing layer applies a $5,000 maximum position limit: 200 × 50 = $10,000, which exceeds the limit. Revised quantity: 100 shares (100 × 50 = $5,000).
6. Execution layer generates client-order ID "AAA-BUY-20260101-16:05" and submits a market-at-open order for the next session.
7. Accounting layer writes position = pending 100 to disk.
8. Next morning, fill reported: 100 shares at $50.20 (hypothetical slippage). Accounting layer writes position = +100.
9. Monitoring layer logs: no alerts. System idle until next bar.

**Day 2 — data-feed failure.**
1. Scheduler fires at 16:05.
2. Data layer attempts to fetch close. Feed returns no data. Last known price is 48 hours old.
3. Data layer sets feed_status = STALE. Signal layer is blocked from running.
4. Monitoring layer sends alert: "AAA feed stale — no signal computed."
5. System holds the existing +100-share position. No new orders.
6. The next day, the feed recovers. Data layer validates the gap: the missing close is retrieved from an alternative source. Signal layer resumes.

**Day 3 — crash and recovery.**
1. Process crashes mid-day due to an operating-system error. RAM is lost.
2. Process restarts. Accounting layer reads disk: position = +100 shares.
3. System queries broker API for open orders and positions: broker confirms +100 shares, no open orders.
4. Reconciliation passes. System resumes monitoring.
5. Contrast: if no state had been written to disk, the system would restart believing position = 0, and might place a spurious buy order, doubling the position.

**Day 4 — idempotency test.**
1. Execution layer submits order ID "AAA-SELL-20260104-16:05" at 16:05.
2. Network timeout: no confirmation received. System retries.
3. Before retrying, system queries broker for open orders. Broker already has the order (it was received despite the timeout).
4. System finds the matching client-order ID and does not submit a second order.
5. Without the ID check, two sell orders would have been placed.

### Common mistakes
1. Building the signal layer first and the monitoring layer last (or never). A signal can be correct while a feed failure, crash, or duplicate order produces large losses. Build monitoring before trading.
2. Storing positions only in a variable. A variable survives until the process ends. Write every position change to disk immediately.
3. Treating reconciliation as optional. Even a broker API can lag, misreport, or round quantities. Reconcile at startup and periodically, and halt on mismatch.
4. Assuming the scheduler fires exactly once. Task runners can fire twice on daylight-saving transitions or if a previous job has not exited. Make every job idempotent: running it twice should produce the same result.

### Resources
- Alpaca, "Paper Trading" (Alpaca Markets documentation). Describes paper-trading endpoint, fill simulation behavior, and what paper fills do not model (market impact, queue position, borrowing). Directly relevant to testing automation without live risk. https://alpaca.markets/learn/paper-trading (see resources-notes.md: `alpaca-paper-trading`)
- Interactive Brokers, "TWS API — Connecting" (IBKR Campus documentation). Covers paper port 7497 versus live port 7496, and the Read-Only API flag. Using port 7497 and Read-Only in development prevents accidental live orders. https://ibkr.info/node/1711 (see resources-notes.md: `ibkr-tws-api-config`)
- QuantConnect, "Paper Trading" (QuantConnect Documentation). Describes simulated fill model, latency, slippage, and fees in QuantConnect's paper environment. https://www.quantconnect.com/docs/v2/cloud-platform/live-trading/brokerages/quantconnect-paper-trading (see resources-notes.md: `qc-paper-trading`)
- CFTC, "Artificial Intelligence (Super Intelligence) Trading Bots" consumer advisory. Describes claims made by fraudulent automated-trading products and how to check registration. No date on page; URL is SITradingBots.html. https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/fraudadv_SITradingBots.html (see resources-notes.md: `cftc-ai-trading-bots`)

### Assignment
1. Draw (on paper or in your notes) the six-component diagram for a hypothetical daily strategy on one asset. Label the data flow between components: what does each component receive and what does it produce?
2. For each of the three failure modes in this lesson (feed failure, crash, duplicate order), write a one-paragraph mitigation plan specifying what your hypothetical system would do and what a human would be alerted to.
3. Design an idempotency key for a hypothetical system trading two symbols on a 1-minute bar. Write out three example keys and explain how a retry would use them.
4. In your Journal, create a paper entry labeled "automation audit — Day 1" describing the full cycle of the worked example in your own words, with the accounting layer's disk state after each event.

### Quiz
1. Which component translates a desired position into an order quantity and applies risk limits? A) The data layer B) The signal layer C) The sizing layer D) The monitoring layer
2. A system retries an order submission after a network timeout, but the broker already received the first request. What prevents a duplicate order from being placed? A) The kill switch B) State persistence C) Checking for an existing client-order ID before retrying D) The scheduler
3. A data feed goes silent for 2 hours. What is the safest default behavior for the signal layer? A) Hold the last price and continue trading B) Flatten all positions immediately C) Halt new signals until the feed recovers and the gap is validated D) Increase position size to average down
4. After a process crash and restart, what must the system do before placing any new orders? A) Reset the accounting layer to zero B) Reconcile stored state with the broker's official positions and orders C) Run the signal layer immediately to catch up D) Cancel all previous fills
5. Which scheduler risk is specific to daylight-saving time transitions? A) The scheduler uses the wrong symbol B) The scheduler fires twice or at the wrong time C) The data feed changes format D) The kill switch is disabled

### Answers
1. C — The sizing layer applies risk limits and computes the number of shares relative to the actual position.
2. C — A unique client-order ID lets the system find the existing order at the broker before retrying.
3. C — Halting new signals prevents trading on stale data; validate the gap before resuming.
4. B — Reconciliation confirms the actual broker state before the system acts on its recovered internal state.
5. B — Schedulers keyed to wall-clock time can fire twice or not at all during DST transitions; test for this.

### Mastery checkpoint
Given a hypothetical six-event sequence (normal bar, feed stale, two normal bars, process crash, restart), trace the state of each component through each event: what it receives, what it outputs, and what it writes to disk. Confirm that at no point does the system have an unreconciled position or a duplicate order.

### Limitations
Real automated systems also deal with corporate actions (splits, dividends), changes in symbol, partial symbol availability, maintenance windows at the broker, rate limits on API calls, and fee-tier changes. This lesson uses a simplified one-asset daily system; intraday systems add order-state complexity proportional to bar frequency. The word "automated" in this course refers to the software loop; regulatory definitions of "automated trading" or "algorithmic trading" vary by regulator and product and are not covered here.

---

## Lesson 14 — Paper-Only Broker APIs: Concepts and Safe Habits
### Objective and prerequisites
Explain what a paper-trading API endpoint provides, what it does not model, and how to configure a development environment so that code cannot accidentally submit live orders.

Prerequisites: Lesson 13 (automated system components). Lesson 11 (order routing basics).

### Explanation and vocabulary
A paper-trading API is a broker-provided endpoint that processes order requests and returns simulated fills, without submitting anything to a real market. It lets a developer test automation code — connection logic, order state handling, error handling, reconciliation — before connecting to live markets.

**What paper APIs do model.** Order submission, acknowledgement, and state changes (open → filled, open → cancelled, open → rejected). Fill callbacks and position updates. Error codes for malformed requests (bad symbol, insufficient simulated buying power). Some APIs model a simple slippage or delay.

**What paper APIs do not model.** Market impact (your order does not move the simulated price). Queue position (a resting limit at the best bid fills as if it were first in line). Realistic partial fills driven by actual order book depth. Borrowing costs and short-sale availability. Exchange fees and commissions (some APIs omit them in paper mode; check). Realistic rejection rates for unusual order types.

Because of these gaps, a strategy that works in paper trading can fail in live trading due to costs and fill quality. Paper trading tests the code, not the edge. It is a necessary step, not a sufficient one.

**Safe configuration habits.** The difference between a paper-order submission and a live-order submission is often a single URL, port number, or account token. These habits reduce the risk of connecting to the wrong endpoint:

1. Never store API keys in source code. Use environment variables or a secrets manager, with separate variables for paper and live keys.
2. Use separate configuration files for paper and live. Name them clearly: `config_paper.yaml`, `config_live.yaml`. The paper file should be the default; the live file must be loaded by explicit flag.
3. Use the broker's designated paper port or paper base URL. For Interactive Brokers TWS, the paper port is 7497 and the live port is 7496. Enable the TWS paper account's Read-Only API flag during development; a Read-Only connection can receive data but cannot submit orders, so a code bug cannot place a live order. (Source: IBKR Campus documentation — see resources-notes.md `ibkr-tws-api-config`.)
4. Add an assertion at startup: read the account type from the broker's API and halt if it is not "paper" when the config says paper. Some brokers return an account type or paper/live flag in their account-info endpoint.
5. Log every order submission with its destination endpoint and account ID before sending. If a live order is ever submitted by mistake, the log provides the evidence needed to request a cancellation or error trade.
6. Never run untested code on a live account. All code must run on paper for a defined minimum period (Lesson 16 covers forward-testing periods) before any consideration of going live.

**Concepts only — no credentials.** This course does not provide, request, or store API keys, account numbers, or authentication tokens. All examples use placeholder strings. No real orders are submitted in any course exercise.

Vocabulary:
- Paper-trading endpoint: a broker API URL or port that simulates order handling without real market execution.
- Simulated fill: a fill reported by the paper endpoint, not based on actual order-book depth or queue position.
- Environment variable: a process-level variable that stores a value (such as an API key) outside the source code.
- Read-Only API: a broker API mode that permits data subscriptions but blocks order submission.
- Port (networking): a numbered endpoint on a host; TWS uses port 7497 for paper and 7496 for live (source: IBKR Campus — see resources-notes.md `ibkr-tws-api-config`).
- Account assertion: a startup check that the connected account matches the expected type (paper vs. live).
- Secrets manager: a service or tool that stores credentials outside source code and injects them at runtime.

Formulas (plain text): None for this lesson. Concepts only.

### Worked example
Hypothetical configuration walkthrough. No real credentials appear. All values are illustrative.

**Step 1 — environment variables.**
```
# Terminal (Linux/macOS):
export AGY_BROKER_PAPER_KEY="PAPER_KEY_PLACEHOLDER"
export AGY_BROKER_LIVE_KEY="LIVE_KEY_PLACEHOLDER"

# Terminal (Windows PowerShell):
$env:AGY_BROKER_PAPER_KEY = "PAPER_KEY_PLACEHOLDER"
$env:AGY_BROKER_LIVE_KEY  = "LIVE_KEY_PLACEHOLDER"
```
The source code reads `os.environ["AGY_BROKER_PAPER_KEY"]`; no key appears in a file tracked by git.

**Step 2 — configuration files.**
```yaml
# config_paper.yaml
mode: paper
base_url: "https://paper-api.example-broker.com"
port: 7497
account_type_expected: "paper"
```
```yaml
# config_live.yaml
mode: live
base_url: "https://api.example-broker.com"
port: 7496
account_type_expected: "live"
```
The system loads `config_paper.yaml` by default. Loading `config_live.yaml` requires the command-line flag `--config config_live.yaml`, which a developer must type explicitly.

**Step 3 — startup assertion.**
```python
# Hypothetical pseudocode
config = load_config(args.config)
broker = connect(config.base_url, config.port, api_key=os.environ["AGY_BROKER_PAPER_KEY"])
account_info = broker.get_account()
assert account_info["type"] == config.account_type_expected, (
    f"Account type mismatch: expected {config.account_type_expected}, "
    f"got {account_info['type']}. Halting."
)
```
If `config_paper.yaml` is loaded but the credentials belong to a live account, the assertion fails and the process exits before any orders are submitted.

**Step 4 — paper fill gap awareness.**
Hypothetical scenario: a resting limit buy at $49.95 is placed in paper mode. The paper API reports a fill within 2 seconds because a print occurred at that price. In live trading, the same order might have been behind 10,000 shares in the queue and never filled. The paper result was optimistic. Record this risk in the Strategy testing record (field: `paper_fill_model_note`).

**Step 5 — log every order attempt.**
```
[2026-01-02 09:30:01] PAPER  submit_order  AAA  BUY  100  MKT  dest=paper-api.example-broker.com  acct=PA12345
[2026-01-02 09:30:01] PAPER  order_ack     AAA  id=agy-aaabuy-20260102-093001  status=open
[2026-01-02 09:30:03] PAPER  fill          AAA  100 @ 50.05  id=agy-aaabuy-20260102-093001
```
The word PAPER in every log line makes it unmistakable that this run is not live.

### Common mistakes
1. Storing a paper key and a live key in the same environment variable and switching between them manually. One copy-paste error submits a live order.
2. Trusting paper results as a live-fill forecast. Resting limits fill too often in paper; market orders may fill too cleanly. Treat paper as a code test, not a performance test.
3. Skipping the account-type assertion because "I'll remember which config I loaded." Human memory is not a safety control.
4. Running the live system under the same process or config as the paper system. Separate environments, separate configs, separate log directories.

### Resources
- Interactive Brokers, "TWS API — Connecting" (IBKR Campus). Paper port 7497 versus live 7496; Read-Only API flag. https://ibkr.info/node/1711 (see resources-notes.md: `ibkr-tws-api-config`)
- Alpaca, "Paper Trading" (Alpaca Markets documentation). Paper endpoint, simulated fill behavior, and explicit list of what is not modeled. https://alpaca.markets/learn/paper-trading (see resources-notes.md: `alpaca-paper-trading`)
- QuantConnect, "Paper Trading" (QuantConnect Documentation). Simulated fills, latency model, and fee handling in paper mode. https://www.quantconnect.com/docs/v2/cloud-platform/live-trading/brokerages/quantconnect-paper-trading (see resources-notes.md: `qc-paper-trading`)

### Assignment
1. Write a hypothetical configuration checklist for a paper-trading setup: list every setting that would need to change to go from paper to live, and explain the risk of each change.
2. Write three examples of log lines for a hypothetical paper system (one submission, one fill, one rejection), following the format in Step 5. Explain what information each field provides.
3. Design an account-type assertion for a broker API that returns the account mode in a field called `trading_mode` with values `"sandbox"` and `"production"`. Write the pseudocode check.
4. In your Strategy testing record, add a row for a hypothetical paper run on one strategy. Fill in: `paper_fill_model_note` (what the paper API does and does not model) and `paper_duration_days` (how long you would run paper before considering live — to be discussed in Lesson 16).

### Quiz
1. Which of these does a paper-trading API generally NOT model? A) Order acknowledgement B) Order rejection for bad symbol C) Market impact on prices D) Fill callbacks and position updates
2. For Interactive Brokers TWS, which port is designated for paper trading? A) 7496 B) 4001 C) 7497 D) 443
3. Why is a startup account-type assertion a useful safety control? A) It guarantees the strategy is profitable B) It prevents the system from connecting if the account type does not match the expected value, stopping a live connection when paper is intended C) It speeds up order submission D) It replaces the need for environment variables
4. A developer stores paper and live API keys in the same environment variable and switches them manually. What is the main risk? A) The strategy logic breaks B) The scheduler fires twice C) A copy-paste error or oversight could submit a real order on a live account D) The log files grow too large
5. A paper resting limit buy fills in 2 seconds. What does this tell you about live performance? A) The live order will also fill in 2 seconds B) Nothing definitive; paper fills ignore queue position and may be optimistic C) The strategy should be run live immediately D) The order book is favorable at that price

### Answers
1. C — Paper APIs simulate order state changes but do not model market impact; your order does not move the simulated price.
2. C — Port 7497 is the IBKR TWS paper port; 7496 is live. (Source: IBKR Campus documentation.)
3. B — The assertion halts the process if the connected account type does not match the config, preventing accidental live submission.
4. C — Manual key switching relies on human memory; a momentary error can connect the automation to a live account.
5. B — Paper fills ignore queue depth and queue position, so a quick paper fill does not predict live fill probability.

### Mastery checkpoint
Write a complete paper-trading configuration checklist for a hypothetical single-asset system: environment variables, config file contents, startup assertion pseudocode, log format, and a list of what the paper fills do and do not model. Then write a one-paragraph statement explaining why a good paper result does not prove a live edge.

### Limitations
Broker paper-trading APIs differ in what they simulate. Some charge simulated commissions; others do not. Some use last-sale prints to trigger limit fills; others use a simpler model. Read the specific documentation for any API you use. This lesson uses generic examples; always verify behavior against the official documentation of the specific broker.

---

## Lesson 15 — Controls: Kill Switch, Maximum Daily Loss, Position Limits, Audit Log
### Objective and prerequisites
Implement four essential controls for an automated trading system: a kill switch, a maximum daily loss limit, position limits per symbol, and an audit log. Explain what each control protects against and what it cannot protect against.

Prerequisites: Lesson 13 (system architecture). Lesson 14 (paper-only habits). Lesson 4 (loss budgets and position sizing).

### Explanation and vocabulary
Controls are rules embedded in the system that override strategy logic when risk conditions are breached. They exist because strategy logic can be wrong, feeds can produce bad data, and software can have bugs. Controls treat the automated system as a system that will sometimes fail, not as a system assumed to be correct.

**Kill switch.** A kill switch is a mechanism that immediately cancels all open orders and stops the system from placing new ones. It has two activation modes: (a) an external trigger — a human presses a button, runs a script, or sends a signal to the process, and (b) an internal trigger — the monitoring layer detects a condition (maximum loss breached, reconciliation failure, feed stale too long) and activates the kill switch automatically.

A kill switch must work even when the strategy code is in an infinite loop or an exception handler. The simplest approach is a file-flag: the monitoring layer checks for a file (e.g., `KILL`) at the start of every event loop iteration; if the file exists, the system cancels all orders and exits. A human can create this file from another terminal, even if the main process is stuck. External kill switches are also available through some broker APIs (a "cancel all orders" endpoint or a "close all positions" endpoint) and should be tested in paper mode before they are needed.

**Maximum daily loss limit.** The maximum daily loss limit halts all trading for the day once realized plus unrealized losses exceed a threshold. It is computed by the monitoring layer at each bar and after each fill:

```
daily_pnl = sum of (fill_pnl for all fills today) + sum of (mark-to-market_pnl for all open positions)
if daily_pnl < -max_daily_loss_limit:
    activate kill switch
    log: "Max daily loss breached — halted for the day."
```

The threshold is set before the trading day, not adjusted during it. Adjusting the limit when it is about to be breached is a form of risk control evasion and defeats the purpose.

**Position limits.** A position limit sets the maximum allowed position in a single symbol, in a direction, or in total gross exposure. The sizing layer checks position limits before every order:

```
if abs(proposed_position) > max_position_per_symbol:
    reduce order quantity so that abs(resulting_position) <= max_position_per_symbol
    log: "Position limit applied — order quantity reduced."
```

Position limits also apply to the total portfolio: if gross exposure (sum of absolute position values) exceeds a portfolio limit, no new positions are opened until existing ones are reduced. Position limits must be checked on the actual broker position, not only the system's internal state, to catch manual overrides or overnight fills.

**Audit log.** The audit log is an append-only file that records every event the system processes and every action it takes: data received, signal computed, order submitted, fill received, reconciliation result, control triggered. Each record includes a timestamp, component name, event type, and relevant parameters. The audit log is not the same as a debug log: it must be human-readable, complete, and never deleted or overwritten. Its purpose is to reconstruct what happened after a loss or a bug, to test whether a strategy worked as designed, and to satisfy any regulatory or brokerage record-keeping obligations.

A minimal audit log record format:
```
timestamp | component | event_type | symbol | quantity | price | order_id | notes
```

Vocabulary:
- Kill switch: a mechanism that cancels all open orders and prevents new ones, activated by a human or by the monitoring layer.
- Maximum daily loss limit (MDLL): a threshold below which daily P&L triggers a halt; set in advance.
- Position limit: a maximum allowed size for a position, per symbol, per direction, or for total gross exposure.
- Audit log: an append-only, human-readable record of every system event and action.
- Gross exposure: sum of absolute position values across all symbols.
- Mark-to-market P&L: unrealized gain or loss computed using current prices for open positions.
- File flag: a file whose presence signals a state to the system (e.g., `KILL` file triggers shutdown).
- Realized P&L: gain or loss from closed positions, computed from fill prices.

Formulas (plain text):
- daily_pnl = realized_pnl_today + mark_to_market_pnl_open_positions
- mark_to_market_pnl for a long position = (current_price - avg_entry_price) × quantity
- gross_exposure = sum of (abs(position_value) for each symbol)
- halt_condition: daily_pnl < -max_daily_loss_limit

### Worked example
Hypothetical single-day scenario with all four controls active. All prices and losses are illustrative.

**Configuration (set at 09:00, before trading starts):**
- max_daily_loss_limit: $500
- max_position_per_symbol: 200 shares
- max_gross_exposure: $20,000
- audit log file: `audit_2026-01-05.log`
- kill_flag_path: `controls/KILL`

**09:30 — first bar.**
System submits a buy of 100 shares of AAA at market open (position limit: 200; proposed position: 100 — allowed). Fill: 100 shares at $50.00. Audit log:
```
09:30:01 | EXEC | ORDER_SUBMIT | AAA | +100 | MKT | id=agy-001 | paper
09:30:03 | EXEC | FILL         | AAA | +100 | 50.00 | id=agy-001 |
09:30:03 | ACCT | POSITION     | AAA | 100 | cost=5000.00 |
09:30:03 | MON  | DAILY_PNL    | 0.00 | limit=-500.00 | ok
```

**10:15 — second signal.**
Signal says buy another 150 shares. Proposed position: 250. Exceeds limit of 200.
```
10:15:00 | SIG  | SIGNAL       | AAA | desired=250 |
10:15:00 | SIZE | LIMIT_APPLY  | AAA | reduced from 150 to 100 (position limit 200) |
10:15:01 | EXEC | ORDER_SUBMIT | AAA | +100 | MKT | id=agy-002 |
```
Fill: 100 shares at $50.50. Position: 200 shares. Gross exposure: 200 × 50.50 = $10,100.

**11:30 — price drops.**
AAA now quoted at $47.00.
```
11:30:00 | MON  | MK_TO_MKT    | AAA | pos=200 | entry_avg=50.25 | cur=47.00 | unreal_pnl=-650.00
11:30:00 | MON  | DAILY_PNL    | -650.00 | limit=-500.00 | BREACHED
11:30:00 | MON  | KILL_SWITCH  | ACTIVATED — daily loss limit breached
11:30:00 | EXEC | CANCEL_ALL   | open_orders=0 |
11:30:00 | SYS  | HALTED       | no new orders until tomorrow
```
The system has no open orders to cancel, but it logs the cancellation attempt. No new signals are processed for the rest of the day.

**11:35 — human check.**
An operator reads the audit log, confirms the halt was triggered correctly, decides whether to close the position manually or leave it overnight. The audit log provides the full record needed to make that decision.

**Manual kill switch test (run in paper mode before going live):**
Operator creates the file `controls/KILL` from a separate terminal. The monitoring layer detects the file at the next event-loop check and halts. Without this test, there is no guarantee the kill switch works under real conditions.

### Common mistakes
1. Setting the maximum daily loss limit to a number so large it is never triggered in normal operation. The limit should be calibrated to what a bad day looks like for the specific strategy's volatility — typically a multiple of one standard deviation of daily P&L, but always defined before trading.
2. Forgetting to include unrealized (mark-to-market) losses in the daily P&L calculation. A large unrealized loss can reverse; a limit based only on realized P&L does not capture it.
3. Placing position-limit checks only in the sizing layer without validating against the broker's actual position. A manual trade or a split/dividend can change the broker's position outside the system's knowledge.
4. Treating the audit log as an optional debug feature. If a loss occurs and the audit log is incomplete, there is no way to determine whether the system behaved as designed. The audit log is a first-class deliverable.
5. Never testing the kill switch in paper mode. A kill switch that has never been tested is an unknown. It may fail to connect to the broker API when activated under stress.

### Resources
- Interactive Brokers, "TWS API — Connecting" (IBKR Campus). Paper port 7497 and Read-Only flag. The Read-Only flag prevents order submission and is useful for testing kill-switch connectivity without accidentally placing orders. https://ibkr.info/node/1711 (see resources-notes.md: `ibkr-tws-api-config`)
- U.S. CFTC, "Artificial Intelligence (Super Intelligence) Trading Bots" consumer advisory. Describes systems marketed as automated that lack verifiable controls; contrasts with the control design in this lesson. https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/fraudadv_SITradingBots.html (see resources-notes.md: `cftc-ai-trading-bots`)
- U.S. SEC, "Staff Bulletin: Sales Practices for Investment Advisers — Use of AI and Automation" [unverified: title and URL not confirmed in resources-notes.md; verify at sec.gov before citing in materials]. Relevant background on control expectations.

### Assignment
1. For a hypothetical system trading two symbols, write the complete control-configuration block: max daily loss limit, position limit per symbol, gross-exposure limit, kill-flag path, and audit-log path. Explain how you chose each number.
2. Trace the hypothetical Day 1 of the worked example from scratch in your own words, writing out the audit log entries for each event.
3. Design a kill-switch test procedure for paper mode: what steps would you run, in what order, and what output would confirm the switch worked?
4. In your Strategy testing record, add a "controls" field: list all four controls you would use for the strategy under test, with the threshold for each. Explain how the MDLL relates to the strategy's expected daily volatility.

### Quiz
1. What is the primary purpose of a kill switch in an automated trading system? A) To increase position size when volatility rises B) To immediately cancel all open orders and prevent new ones C) To trigger a strategy recalibration D) To fetch a fresh data snapshot
2. Daily P&L for the MDLL check should include which of the following? A) Realized P&L only B) Mark-to-market P&L on open positions only C) Both realized P&L and mark-to-market P&L on open positions D) P&L from last week's trades
3. A position limit of 200 shares is configured. The current position is 150 shares. The strategy signals a buy of 100 shares. What should the sizing layer do? A) Submit 100 shares B) Submit 50 shares C) Cancel the signal entirely D) Submit 200 shares
4. Why must position limits be checked against the broker's actual position, not only the system's internal state? A) The broker always has a smaller position B) External events (manual trades, corporate actions) can change the broker's position without updating the system's internal state C) The system's state is always correct D) The audit log reconciles the two automatically
5. What is the defining property of an audit log that distinguishes it from a debug log? A) It records only errors B) It is append-only and must be complete enough to reconstruct every system event C) It is deleted after each session D) It only records fills

### Answers
1. B — The kill switch's purpose is to stop trading immediately: cancel open orders and block new ones.
2. C — The MDLL must include both realized losses from closed trades and unrealized mark-to-market losses from open positions.
3. B — 150 + 100 = 250, which exceeds the 200-share limit; submit only 50 shares to reach exactly 200.
4. B — Manual trades, corporate actions, or overnight fills can change the broker position without the system knowing; always check the source of truth.
5. B — An audit log must be append-only, human-readable, and complete enough to reconstruct what happened; it is not a debug tool and is not deleted.

### Mastery checkpoint
Given a hypothetical sequence: open long 180 shares, price rises 2%, price falls 8%, strategy signals add 50 shares, price falls another 5%. Trace daily P&L at each step, check position limits at the signal step, determine whether MDLL is breached, write the audit log entries for each event, and describe what the kill switch does and does not do when triggered.

### Limitations
Kill switches stop order submission but cannot reverse fills that have already occurred. Maximum daily loss limits use current prices; illiquid markets can have large bid-ask spreads that distort mark-to-market P&L. Audit logs do not by themselves satisfy any specific regulatory record-keeping requirement; consult a compliance professional before concluding they are sufficient. This lesson does not cover network-level controls such as pre-trade risk checks implemented by a DMA broker or clearing firm.

---

## Lesson 16 — Forward Testing and Paper Runs vs. Backtests
### Objective and prerequisites
Explain the difference between a backtest, a paper run (forward test in paper mode), and a live forward test; set minimum criteria for a paper run to be informative; and state the conditions under which a paper result supports — or does not support — a decision to trade live.

Prerequisites: Lessons 5–8 (strategy design and backtesting). Lesson 13 (automated system). Lesson 14 (paper APIs). Lesson 15 (controls).

### Explanation and vocabulary
**Backtest.** A backtest applies strategy logic to historical data. The result describes how the strategy would have performed if the data, fills, and parameters had all been known in advance and the code had been correct. Backtests suffer from look-ahead bias (using future information accidentally), survivorship bias (testing only assets that survived to be in the dataset), and overfitting (parameters that explain past data but not future data). Part 2 (Lessons 5–8) covers these risks in detail.

The SEC has published guidance warning that hypothetical, back-tested performance results have many inherent limitations and should not be used to predict future results. (Source: SEC, "Investor Alert: Be Cautious of Performance Claims Based on Hypothetical or Simulated Results," September 15, 2022. See resources-notes.md `sec-performance-claims`.)

**Paper run (forward test in paper mode).** A paper run deploys the full automated system — real-time data, real-time signals, real order submission — against a paper-trading API. The system runs forward in real time, not on historical data. It tests whether the code works as designed, whether controls fire at the right times, and whether the signal layer produces the expected outputs on live data. It does not test live fills, real market impact, or real execution costs (Lesson 14).

**Live forward test.** A live forward test runs the system on a live account with real but very small size — a minimum number of shares or contracts — for a defined period. It tests fill quality, real commissions, real slippage, and real execution-layer behavior under live conditions. It is not a full deployment; it is a final check before scaling.

**What a paper run can tell you:**
- The system connects correctly and handles disconnects.
- Signal logic produces the expected outputs on current data.
- Sizing limits and controls fire when expected.
- The audit log records events correctly.
- Idempotency works under real-time conditions.
- The scheduler fires at the right times.

**What a paper run cannot tell you:**
- Whether the strategy has an edge on live data. The paper result is based on fills that assume no queue position and no impact, so it overstates fill quality.
- Whether execution costs will allow profitability. Paper mode may omit commissions or model them poorly.
- How the system behaves under real market stress (flash crashes, exchange outages, circuit breakers).
- Whether the signal computed on the paper-API data feed matches what would have been computed on the live feed (data vendor or feed differences can produce different signals).

**Minimum criteria for a paper run to be informative.** There is no universal standard, but the following criteria are common in practitioner literature and consistent with the overfitting-prevention logic of Part 2 (Bailey et al., López de Prado; see resources-notes.md `deflated-sharpe-ratio`):

1. The paper run must span at least one full market cycle relevant to the strategy's frequency (e.g., for a daily strategy, at least 60–90 trading days; for intraday, at least 30 days with the full intraday session covered).
2. The run must include at least one period of elevated volatility or a market event (not just trending or low-volatility conditions).
3. Every control — MDLL, position limits, kill switch — must be tested at least once during the paper run, using a simulated breach if necessary.
4. Reconciliation must be run at every session boundary and results logged.
5. The paper-run P&L must be compared to the backtest P&L for the same period using the same data feed. Significant divergence (defined before the run, not after) is a red flag and must be investigated before going live.

**Comparison framework:**

| Dimension | Backtest | Paper run | Live forward test |
|---|---|---|---|
| Data | Historical | Real-time | Real-time |
| Fills | Simulated, often optimistic | Simulated, paper API rules | Real, with market impact |
| Code tested | Mostly signal and sizing | Full system, all components | Full system under real conditions |
| Controls tested | Partially | Yes, with simulated breaches | Yes, with real market events |
| Edge confirmed | No | No | Weak (small size, short period) |
| Required before scaling | Yes | Yes | Yes |

Vocabulary:
- Forward test: running a strategy on new, unseen data, in real time (live or paper) rather than on historical data.
- Paper run: a forward test using a paper-trading API; real-time data, simulated fills.
- Out-of-sample period: data not used during strategy development or parameter selection.
- Walk-forward: a method of evaluating a strategy by repeatedly training on a window and testing on the next window.
- Look-ahead bias: using information in a backtest that would not have been available at the time of the simulated decision.
- Survivorship bias: testing only assets or strategies that existed at the end of the sample, omitting those that failed or were delisted.
- Overfitting: parameters that explain historical data well but do not generalize to new data.
- Hypothetical performance: results computed on historical or simulated data, not from actual trading.

Formulas (plain text):
- paper_vs_backtest_divergence = paper_pnl_same_period - backtest_pnl_same_period
- trade_count_check: number of paper trades must be large enough to distinguish signal from noise (Part 2, Lesson 6)
- minimum_paper_duration: depends on strategy frequency; at least several multiples of the strategy's mean holding period

### Worked example
Hypothetical evaluation sequence. All results are illustrative.

**Step 1 — backtest summary (already complete from Part 2).**
Strategy: SMA crossover on hypothetical ticker AAA. In-sample period: Jan 2020 – Dec 2024. Net return: +18% annualized. Maximum drawdown: -14%. Sharpe ratio: 0.9 (annualized, before costs). Note: this result used parameters optimized on that period; Deflated Sharpe Ratio and walk-forward analysis (Bailey & López de Prado) were applied and suggested the edge is modest but statistically plausible. Out-of-sample period reserved: Jan–Jun 2026.

**Step 2 — paper run design.**
Duration: Jan 1 – Mar 31, 2026 (63 trading days).
Strategy frequency: daily bars. Required: at least one volatility event, all controls tested.
Data feed: broker paper API.
Comparison: backtest result for Jan–Mar 2026 (computed after the period using the same data).

**Step 3 — paper run result.**
Paper P&L (Jan–Mar 2026): +3.2% (hypothetical).
Backtest P&L (Jan–Mar 2026): +4.8% (hypothetical, computed ex-post from same data).
Divergence: -1.6 percentage points. Hypothetical cause: the paper API modeled a 2-tick delay; the backtest assumed immediate fills at close.
Control firings: MDLL triggered once on a hypothetical bad day (Feb 15, -$510 mark-to-market, limit $500); kill switch tested manually on day 10; reconciliation passed all 63 days.

**Step 4 — evaluation decision tree.**
- Was the system stable for the full run? Yes.
- Did all controls fire correctly? Yes.
- Was the divergence explained and plausible? Yes (fill timing difference).
- Was the paper P&L consistent with the out-of-sample backtest after adjusting for fill model? Roughly yes, within a margin pre-specified at 2 percentage points.
- Decision: proceed to a live forward test at minimum size (1 share of AAA per signal, real commissions, same controls) for 30 trading days. If that result is consistent, then and only then discuss scaling.

**Step 5 — what this result does NOT mean.**
The paper run does not prove the strategy will profit in the future. The 3.2% paper result came from 63 trading days with hypothetical fills; this is not a track record. Presenting this result to any other person as evidence of live performance would be misleading.

### Common mistakes
1. Ending the paper run after a good week. A paper run must span enough time to include both favorable and unfavorable conditions; a short lucky run proves nothing.
2. Comparing paper P&L to a backtest P&L computed on different data or different parameter settings. The comparison is only informative if both use the same input data for the same period.
3. Proceeding to live trading immediately after a successful backtest, skipping the paper run. The paper run tests the code, not the edge; skipping it means going live with untested system components.
4. Treating a paper-run result as a live track record. Paper fills are not real fills; paper P&L is not real P&L.
5. Setting divergence criteria after seeing the results. Define "acceptable divergence" before the paper run starts, so the evaluation is not rationalized after the fact.

### Resources
- U.S. SEC, "Investor Alert: Be Cautious of Performance Claims Based on Hypothetical or Simulated Results," September 15, 2022. Directly relevant to how backtest and paper results should and should not be described. https://www.sec.gov/investor/alerts/hypothetical-performance-results.html (see resources-notes.md: `sec-performance-claims`)
- Bailey, D. H., & López de Prado, M. (2014). "The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting and Non-Normality." Journal of Portfolio Management, 40(5), 94–107. Framework for assessing whether a backtest result is statistically meaningful. https://doi.org/10.3905/jpm.2014.40.5.094 (see resources-notes.md: `deflated-sharpe-ratio`)
- Quantopian/QuantRocket, "Lecture 19: Overfitting and Its Effects" (notebook). Covers the relationship between in-sample and out-of-sample performance. https://quantrocket.com/docs/lectures/19_Overfitting_and_Model_Parameters.html (see resources-notes.md: `quantopian-l19-overfitting`)
- Chan, E. (interviewee), Chat With Traders episode 052, 2016. Practical discussion of paper trading, forward testing, and when to trust backtest results. YouTube version: https://www.youtube.com/watch?v=mhxDq6E_EEE (see resources-notes.md: `chan-chatwithtraders-052`; note: chatwithtraders.com episode URL is not reliable — see resources-notes.md)

### Assignment
1. Design a paper-run evaluation plan for a hypothetical daily strategy: duration, minimum conditions to satisfy, pre-specified divergence threshold, and decision criteria. Write it out before looking at any results.
2. Compute the backtest-to-paper divergence for the worked example using the numbers in Step 3. Then change the paper P&L to 2.5% and 1.0% and determine whether each would pass the 2-percentage-point threshold.
3. In your Strategy testing record, add a "forward_test" section: planned paper-run start and end dates, divergence threshold, control-testing plan, and decision criteria for proceeding to a live forward test.
4. Write a one-page hypothetical post-mortem for a paper run that failed the control-test requirement (MDLL never triggered, kill switch never tested). What would you do before going live, and why?

### Quiz
1. What does a paper run test that a backtest does NOT test? A) Whether the strategy was profitable in the past B) Whether the strategy's signal is statistically significant C) Whether the full automated system — code, connections, controls — works correctly on real-time data D) Whether the parameters are optimal
2. A backtest produces 12% return for a quarter. The paper run for the same quarter produces 10% return. The divergence is 2 percentage points. If your pre-specified threshold was 3 percentage points, what should you conclude? A) The paper run failed; stop the strategy B) The divergence is within the pre-specified threshold; investigate the cause and proceed if explained C) The backtest was wrong; ignore it D) Proceed to live trading immediately without further testing
3. Which of the following is a gap that a paper run CANNOT close? A) Testing whether the scheduler fires at the right time B) Testing whether reconciliation works C) Testing whether live fills, real commissions, and real market impact are acceptable D) Testing whether the kill switch triggers on MDLL breach
4. What is the main bias introduced by ending a paper run after a profitable week? A) Look-ahead bias B) Survivorship bias C) Selection bias (choosing to end when results look good, avoiding unfavorable periods) D) Overfitting
5. The SEC investor alert on hypothetical performance warns that back-tested results have inherent limitations. What is one of those limitations? A) Backtests always produce negative returns B) Backtests cannot use real data C) Backtests are computed with the benefit of hindsight and may not reflect the impact of economic or market factors D) Backtests are only valid for index funds

### Answers
1. C — A paper run tests the full system end-to-end on real-time data; a backtest tests only signal logic on historical data.
2. B — 2 percentage points is within the 3-point pre-specified threshold; the cause should be investigated (e.g., fill model difference) but it is not an automatic failure.
3. C — Paper fills ignore market impact, queue position, and real commissions; only a live forward test with real fills can test these.
4. C — Stopping when results look good is a form of selection bias; the unfavorable periods that would have been seen next are excluded.
5. C — The SEC alert states that hypothetical results are computed with the benefit of hindsight and do not account for the impact of economic and market conditions. (Source: SEC investor alert, September 15, 2022.)

### Mastery checkpoint
Write an evaluation memo for a hypothetical paper run: strategy description, paper-run plan (duration, control tests, divergence threshold), paper-run results (P&L, control firings, reconciliation), comparison to the backtest for the same period, and a decision — proceed to live forward test, extend paper run, or halt — with the reason. The memo must reference the SEC investor-alert guidance on hypothetical results.

### Limitations
No paper run, however long, can replicate live market conditions. Live fills, real commissions, real borrowing costs, real exchange outages, real circuit breakers, and real liquidity crises are not modeled in paper mode. The minimum-duration criteria in this lesson are practitioner guidelines, not regulatory requirements. Walk-forward and deflated-Sharpe approaches (Part 2) reduce but do not eliminate the risk of false-positive backtests.

---

## Part 4 Assessment
Answer all five questions in writing, in your own words. Use only the concepts from Parts 1–4. If you cannot answer a question without looking at the lesson, re-read the relevant lesson and try again.

1. Draw the six-component architecture of an automated trading system. For each component, state one failure mode and one mitigation.
2. Explain idempotency in the context of order submission. Why does it matter, and how does a client-order ID enforce it?
3. A developer runs paper-trading code on a laptop. What three configuration controls reduce the risk of an accidental live order?
4. A system has a $400 maximum daily loss limit. At 11:00 the system holds 500 shares with an average entry of $20.00. The current price is $19.15. What is the mark-to-market P&L, is the limit breached, and what should the system do?
5. A backtest over five years produces a Sharpe ratio of 1.2. A 60-day paper run on the same strategy produces a positive return. A colleague says this is enough evidence to deploy live at full size. Identify three specific problems with that conclusion.

**Assessment answers (self-check):**
1. See Lesson 13. Each component: data (failure: stale feed; mitigation: halt on stale), signal (failure: wrong computation; mitigation: unit tests and sanity checks), sizing (failure: limit not applied; mitigation: check before every order), execution (failure: duplicate order; mitigation: idempotent client-order IDs), accounting (failure: position drift; mitigation: reconciliation), monitoring (failure: alert not sent; mitigation: test the alert path in paper mode).
2. Idempotency means that submitting the same order twice produces the same result as submitting it once. A client-order ID generated from the order's parameters lets the system find the existing order at the broker before retrying; if found, no second order is submitted.
3. Separate paper/live configuration files with paper as the default; a startup account-type assertion that halts if the account type is not "paper"; and the broker's Read-Only API flag during development.
4. Mark-to-market P&L = (19.15 - 20.00) × 500 = -$0.85 × 500 = -$425.00. The limit ($400) is breached. The monitoring layer should activate the kill switch, cancel all open orders, and log the breach.
5. Problems: (a) the Sharpe ratio is computed in-sample; without a deflated or out-of-sample check it may be overfitted (Part 2, Lesson 8; Bailey & López de Prado). (b) A 60-day paper run does not test live fill quality, real commissions, or real market impact. (c) Paper-run P&L is based on simulated fills; it is not a live track record. Full deployment at full size is not justified.

## Part 4 Resource Library
Resources listed here are cited in one or more lessons. Verify URLs and content before use, as documentation changes.

| ID | Title | Lessons | Notes |
|---|---|---|---|
| `alpaca-paper-trading` | Alpaca, "Paper Trading" | 13, 14 | Describes fill model and gaps |
| `ibkr-tws-api-config` | IBKR Campus, "TWS API — Connecting" | 13, 14, 15 | Paper port 7497 vs. live 7496; Read-Only flag |
| `qc-paper-trading` | QuantConnect, "Paper Trading" | 13, 14 | Simulated fill and fee model |
| `sec-performance-claims` | SEC, "Investor Alert: Hypothetical Performance," 2022-09-15 | 16 | Limitations of backtested results |
| `deflated-sharpe-ratio` | Bailey & López de Prado (2014) | 16 | Overfitting and false-positive backtests |
| `quantopian-l19-overfitting` | Quantopian/QuantRocket Lecture 19 | 16 | In-sample vs. out-of-sample |
| `chan-chatwithtraders-052` | Ernie Chan, Chat With Traders 052, 2016 | 16 | Practitioner forward-testing discussion |
| `cftc-ai-trading-bots` | CFTC, "SI Trading Bots" advisory | 13, 15 | Fraudulent automated-trading claims; no date on page |
