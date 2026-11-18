# Trading Research Academy — Part 2: Advanced Quantitative Strategies
Advanced quantitative strategy curriculum for the Trading Research Academy. Educational simulations and research methodology only. All numerical examples are hypothetical.

## Start Here
Part 1 established the non-negotiable mechanical foundation: separating account equity, notional exposure, margin collateral, and planned loss budget. Part 2 builds upon that foundation by introducing systematic quantitative models:
1. Multi-asset momentum rotation and ridge-regularized adjusted plus-minus (RAPM) factor models.
2. The RiskLens framework: asymmetric downside risk, Cornish-Fisher Value-at-Risk (VaR), Conditional VaR, and dynamic volatility targeting.
3. Systematic execution mechanics: discrete order lifecycle, gap risk, stop-loss / take-profit dynamics, and pure-decimal paper portfolio accounting.
4. Parameter optimization, chronological train/test holdouts, and automated overfitting diagnostics.

Simulation is never proof of future live profitability, liquidity, or execution capability.

## Course map
Available: Part 1 — exposure, products, orders, margin and basic sizing.
Available: Part 2 — advanced quantitative strategies, risk modeling, systematic execution, and parameter optimization.
Awaiting material: Part 3 — institutional liquidity, market microstructure, and high-frequency order book dynamics.
Awaiting material: Part 4 — automated live execution bridges, algorithmic routing, and broker API integration.
Awaiting material: Part 5 — professional portfolio governance, compliance, California/U.S. regulatory safeguards, and graduation assessment.

## Lesson 5 — Multi-Asset Momentum & The Rotation Index
### Objective and prerequisites
Master the construction of multi-asset momentum rotation models across diverse asset classes (Equities, Treasuries, Commodities, Crypto, and Memecoins) and apply ridge-regularized adjusted plus-minus (RAPM) principles from sports handicapping to eliminate factor collinearity and control turnover friction.
Prerequisites: Lessons 1–4, compound returns, z-score normalization, and basic matrix multiplication.

### Explanation and vocabulary
Momentum describes the empirical tendency of assets with superior recent performance to continue outperforming over short-to-medium horizons.
Time-series momentum (absolute momentum) compares an asset's return against a cash hurdle or its own historical moving average (e.g., is the asset trending upward?).
Cross-sectional momentum (relative momentum) ranks a basket of assets against each other at each rebalancing interval and allocates capital to the top-ranking deciles or percentiles.

A Multi-Asset Rotation Index dynamically shifts portfolio weights across fundamentally different economic categories:
1. Equities: broad market (SPY), tech/growth (QQQ), and cyclical/defensive sectors (XLK, XLE, XLF, XLU).
2. Fixed income / Treasuries: long-duration (TLT), intermediate-duration (IEF), and cash equivalents (SHY, BIL).
3. Commodities: store-of-value hedges (GLD) and industrial/energy resources (USO, DBC).
4. Crypto assets: large-cap digital commodities (BTC, ETH).
5. High-beta / speculative tokens (e.g. DOGE, PEPE, SOL ecosystem tokens): assets with extreme volatility, short lifecycles, asymmetric left-tail liquidation risks, and rapid momentum decay.

The Memecoin Dilemma: In speculative crypto regimes, lower-liquidity tokens frequently show massive 30-day relative price surges. However, unconstrained rotation into high-beta or memecoin tokens fails in live trading because of:
- Liquidity dry-ups: bid-ask spreads widen from 10 bps to 500+ bps during market pullbacks.
- Rapid alpha half-life: memecoin momentum often peaks within days, meaning monthly or bi-weekly rebalancing buys the exact top.
- Severe slippage: market impact consumes any theoretical paper outperformance.

The Mathematical Bridge: NBA Lineup RAPM from `Rotation-Index`:
In basketball analytics (`materials/external_repos/Rotation-Index`), a player's raw plus-minus (+/-) is heavily confounded by who they share the court with (teammates) and who they play against (opponents). A bench player who shares minutes with superstar starters will exhibit an artificially inflated plus-minus, while an elite defender carrying weak teammates will exhibit an artificially depressed plus-minus.
To isolate true individual player impact per 100 possessions ($y$), analysts formulate the linear system:
$y = X \beta + \epsilon$
where each row represents a distinct lineup stint, $X$ contains indicators for offensive players (+1), defensive players (-1), and game context (home-court advantage, opponent baseline), weighted by possession volume $W$.
Because teammates play together repeatedly, $X$ is severely collinear, making standard Ordinary Least Squares (OLS) explode with erratic, extreme coefficients.

The solution is Ridge Regression (Tikhonov Regularization):
$(X^T W X + \lambda I) \beta = X^T W y$
where $\lambda \ge 0$ is a shrinkage penalty selected on a holdout split (`pick_lambda` in `Rotation-Index/model.py` uses an 80/20 train/validation split). Ridge regression shrinks individual player coefficients toward zero (the prior belief of an average/replacement-level player), suppressing noise and isolating true marginal value.

Application to Multi-Asset Rotation:
When rotating assets across macro regimes, raw asset returns are similarly confounded by:
- Common macro factor drift (the "tide" lifting all boats: S&P beta, USD liquidity, interest rate shifts).
- Inter-asset collinearity (high-beta tech stocks moving simultaneously with crypto).
- Noisy idiosyncratic spikes.
By framing asset rotation through a regularized factor model, we decompose raw returns into systematic factor betas ("lineup/opponent effects") and pure idiosyncratic momentum ($\alpha$). Ridge shrinkage dampens erratic spikes, prevents capital from chasing fleeting memecoin noise, and drastically reduces costly portfolio turnover.

### Worked example
Consider a 4-asset universe evaluated over a 6-month formation period:
1. S&P 500 ETF (SPY): 6-month return $+12\%$, annualized volatility $\sigma = 14\%$.
2. Long-Term Treasury ETF (TLT): 6-month return $-6\%$, annualized volatility $\sigma = 16\%$.
3. Bitcoin (BTC): 6-month return $+36\%$, annualized volatility $\sigma = 60\%$.
4. Speculative Memecoin Token (MEME): 6-month return $+80\%$, annualized volatility $\sigma = 140\%$.

Step 1: Naive Nominal Return Ranking:
Raw rank: MEME (+80%) > BTC (+36%) > SPY (+12%) > TLT (-6%).
A naive momentum strategy would allocate 100% of capital to MEME.

Step 2: Volatility-Adjusted Momentum (Risk-Standardized):
Compute volatility-scaled momentum scores: 6-month excess return divided by annualized volatility, with a 6-month risk-free return of $R_f = 2\%$ (about 4% annualized). Because the return covers 6 months and the volatility is annual, these scores rank assets but are not Sharpe ratios; to make them comparable to a Sharpe ratio, scale volatility to the period ($\sigma \times \sqrt{0.5}$) or annualize the return.
- SPY score: $(12\% - 2\%) / 14\% = 10 / 14 \approx 0.714$
- TLT score: $(-6\% - 2\%) / 16\% = -8 / 16 = -0.500$
- BTC score: $(36\% - 2\%) / 60\% = 34 / 60 \approx 0.567$
- MEME score: $(80\% - 2\%) / 140\% = 78 / 140 \approx 0.557$

Result after risk-standardization:
SPY (0.714) > BTC (0.567) > MEME (0.557) > TLT (-0.500).
SPY delivers the highest quality, most stable momentum unit per unit of volatility risk.

Step 3: Turnover and Liquidity Penalty:
Assume round-trip execution cost (spread + slippage + fees):
- SPY: 0.05% (5 bps)
- BTC: 0.30% (30 bps)
- MEME: 4.50% (450 bps, accounting for pool fees, price impact, and slippage)
Cost drag on MEME after 12 monthly rotations: $1 - (1 - 0.045)^{12} \approx 42.5\%$ of capital consumed by turnover friction alone (simple addition, $12 \times 4.5\% = 54\%$, overstates it because each cost applies to a smaller balance).
Ridge shrinkage penalizes noisy, high-turnover assets, correctly retaining capital in scalable, cost-efficient momentum leaders.

### Common mistakes
1. Chasing unadjusted nominal percentage gains without normalizing for asset volatility.
2. Ignoring turnover and bid-ask spread expansion in low-liquidity crypto/memecoin tokens.
3. Overfitting lookback windows: selecting a 14-day lookback because it caught one viral memecoin rally, ignoring that it generates 26 whipsaws per year during sideways consolidation.
4. Assuming positive cross-sectional momentum implies positive absolute returns: in a severe bear market (2008, 2022), the "best" relative asset may still lose 25% if an absolute trend filter (cash hurdle) is omitted.

### Resources
- `Rotation-Index` repository (`materials/external_repos/Rotation-Index/model.py` and `possession_model.py`): inspection of Ridge regression solver `fit_ridge(X, y, w, lam)` and holdout validation `pick_lambda`.
- Asness, C. S., Moskowitz, T. J., & Pedersen, L. H. (2013). "Value and Momentum Everywhere." *The Journal of Finance*, 68(3), 929-985.
- Jegadeesh, N., & Titman, S. (1993). "Returns to Buying Winners and Selling Losers." *The Journal of Finance*, 48(1), 65-91.

### Assignment
1. Using historical monthly closing prices for SPY, TLT, GLD, and BTC over the past 24 months, calculate:
   - 3-month and 12-month trailing returns.
   - 12-month realized standard deviation.
   - Risk-adjusted momentum score: $(R_{12} - R_f) / \sigma_{12}$.
2. Design a dynamic dual-momentum rule:
   - Absolute filter: asset must trade above its 200-day simple moving average (or have a positive 12-month return). If false, allocate that asset's share to cash equivalents (SHY).
   - Relative filter: rank eligible assets and hold the top 2.
3. Calculate the turnover rate (percentage of portfolio reallocated) under monthly vs quarterly rebalancing.

### Quiz
1. In a multi-asset momentum framework, why does an asset with $+50\%$ return not automatically outrank an asset with $+20\%$ return?
2. How does Ridge regression regularize player or asset coefficients in the `Rotation-Index` model?
3. What happens to a momentum strategy that holds the top relative crypto asset during a market-wide liquidity collapse if no absolute trend filter is active?
4. Why is high rebalancing frequency particularly toxic to memecoin rotation strategies?

### Answers
1. The $+50\%$ asset may carry disproportionate volatility (e.g. 150% annualized vol vs 15% vol), yielding a substantially lower risk-adjusted score and higher probability of deep drawdown.
2. Ridge regression adds an $L_2$ penalty $(\lambda I)$ to the normal equations $(X^T W X + \lambda I)\beta = X^T W y$, shrinking noisy, collinear coefficients toward zero (the prior of average contribution).
3. The portfolio remains 100% invested in the "least bad" falling asset, absorbing full market drawdowns; an absolute momentum filter forces capital into cash/Treasuries when trends turn negative.
4. Memecoins suffer from massive bid-ask spreads, pool swap taxes, and price impact; frequent rebalancing causes transaction friction to rapidly compound and cannibalize gross gains.

### Mastery checkpoint
Produce a reproducible calculation script or spreadsheet comparing 4 assets across 3 rebalance dates. Demonstrate:
1. Normalization of raw returns by rolling volatility.
2. Inclusion of an absolute cash hurdle.
3. Exact deduction of round-trip execution costs.
4. Demonstration that the chosen allocation would have triggered a cash defensive shift during a known historical drawdown.

### Limitations
Past momentum does not guarantee trend persistence; momentum strategies are prone to sharp "momentum crashes" when market regimes abruptly invert (e.g., sudden interest rate pivots or short squeezes). Ridge penalties shrink variance but introduce estimation bias.

---

## Lesson 6 — The RiskLens Framework: Downside Risk, Cornish-Fisher VaR/CVaR, and Volatility Targeting
### Objective and prerequisites
Analyze non-normal portfolio return distributions, calculate Cornish-Fisher Value-at-Risk (VaR) and Conditional VaR (Expected Shortfall) to capture skewness and fat tails, and construct dynamic volatility-targeting mechanisms to protect capital.
Prerequisites: Lesson 4 (loss budgeting), probability distributions, sample skewness, sample kurtosis, and rolling standard deviation.

### Explanation and vocabulary
The Gaussian Assumption Fallacy: Traditional finance models (Markowitz Mean-Variance, naive Sharpe ratio) assume returns follow a symmetrical normal (Gaussian) distribution. In reality, financial returns across equities, crypto, and derivatives exhibit:
- Negative skewness ($s < 0$): crashes are sharper, steeper, and faster than gradual bull-market rallies.
- Excess kurtosis ($k > 0$, leptokurtosis): fat tails where extreme 4-sigma and 5-sigma outlier days happen orders of magnitude more frequently than predicted by a bell curve.

Downside Risk Metrics:
- Semi-variance & Downside Deviation: calculates standard deviation using only returns that fall below a minimum acceptable return (MAR, typically 0 or the risk-free rate).
- Sortino Ratio: $(R_p - R_f) / \sigma_{\text{downside}}$, penalizing only harmful downside volatility while ignoring upside volatility.
- Calmar Ratio: Annualized Return divided by Maximum Drawdown.

Value-at-Risk (VaR) and Conditional Value-at-Risk (CVaR):
- Value-at-Risk ($\text{VaR}_\alpha$): the threshold dollar loss or percentage loss that will not be exceeded with confidence level $(1 - \alpha)$ over time horizon $T$ (e.g. 1-day 95% VaR).
- Parametric (Normal) VaR:
  $\text{VaR}_{\alpha, \text{norm}} = -(\mu + z_\alpha \cdot \sigma)$
  where $z_\alpha$ is the standard normal critical value ($-1.645$ for 95%, $-2.326$ for 99%).

The Cornish-Fisher Expansion (from `RiskLens/src/risklens/analytics/value_at_risk.py`):
When returns have sample skewness $s$ and sample excess kurtosis $k$, the Cornish-Fisher expansion adjusts the standard normal quantile $z_\alpha$ into an asymmetric, fat-tailed quantile $z_{\text{CF}}$:
$$z_{\text{CF}} = z_\alpha + \frac{z_\alpha^2 - 1}{6} s + \frac{z_\alpha^3 - 3z_\alpha}{24} k - \frac{2z_\alpha^3 - 5z_\alpha}{36} s^2$$
Cornish-Fisher VaR is then:
$$\text{VaR}_{\alpha, \text{CF}} = -(\mu + z_{\text{CF}} \cdot \sigma)$$
When an asset exhibits negative skewness ($s < 0$) and fat tails ($k > 0$), $z_{\text{CF}}$ shifts substantially further into the left tail than $z_\alpha$, preventing the dangerous underestimation of catastrophic tail risk.

Conditional Value-at-Risk ($\text{CVaR}_\alpha$ / Expected Shortfall):
VaR only answers: "What is the minimum loss on bad days?" It tells you nothing about how severe losses can get once VaR is breached. CVaR calculates the expected average loss given that the loss has exceeded the VaR threshold:
$$\text{CVaR}_\alpha = E[L \mid L \ge \text{VaR}_\alpha]$$
CVaR is a coherent risk measure (satisfying subadditivity: risk of a portfolio is less than or equal to the sum of individual risks), whereas VaR is not.

Volatility Forecasting & Sizing (from `RiskLens/src/risklens/analytics/volatility.py`):
- RiskMetrics Exponentially Weighted Moving Average (EWMA):
  $$\sigma^2_t = \lambda \sigma^2_{t-1} + (1 - \lambda) r_t^2, \quad \text{with } \lambda = 0.94$$
  EWMA places exponential weighting on recent returns, reacting immediately to volatility spikes.
- Volatility Targeting (Vol Targeting):
  Rather than maintaining fixed dollar notional exposure, an algorithm sets a constant target portfolio volatility $\sigma^*$ (e.g. 10% annualized).
  The portfolio weight allocated to risky assets on day $t$ is:
  $$w_t = \min\left(w_{\max}, \frac{\sigma^*}{\hat{\sigma}_t}\right)$$
  When market volatility $\hat{\sigma}_t$ spikes (e.g. during a market crash to 40%), exposure $w_t$ automatically scales down to $10\% / 40\% = 0.25$ (75% moved to cash). When volatility contracts during steady bull markets (e.g. 10%), exposure scales back up to 1.0. This prevents exponential portfolio drawdowns.

Model Validation: The Kupiec POF Test:
A VaR model must be audited. In `RiskLens`, the Kupiec Proportion of Failures likelihood ratio test ($LR_{\text{POF}}$) verifies whether observed breach counts match theoretical expectations ($1 - \text{confidence}$). If actual breaches significantly exceed expected breaches, the risk model is rejected.

### Worked example
Assume a trading account with $\$100,000$ equity invested in a systematic strategy.
Daily return distribution parameters over the past 252 days:
- Daily mean return $\mu = 0.05\%$ ($+0.0005$)
- Daily standard deviation $\sigma = 1.5\%$ ($0.015$)
- Sample skewness $s = -0.70$ (left-tailed crash risk)
- Sample excess kurtosis $k = 3.60$ (heavy fat tails)
- Confidence level $95\%$ ($\alpha = 0.05$, standard normal $z = -1.644853$)

Step 1: Compute Naive Gaussian 1-Day 95% VaR:
$$\text{VaR}_{\text{norm}} = -(\mu + z \sigma) = -(0.0005 + (-1.644853) \times 0.015) = -(-0.02417) = +2.417\%$$
In dollars: $2.417\% \times \$100,000 = \$2,417$.

Step 2: Compute Cornish-Fisher Quantile Adjustment:
- Term 1: $z = -1.644853$
- Term 2: $\frac{z^2 - 1}{6} s = \frac{(-1.644853)^2 - 1}{6} \times (-0.70) = \frac{2.70554 - 1}{6} \times (-0.70) = \frac{1.70554}{6} \times (-0.70) \approx -0.19898$
- Term 3: $\frac{z^3 - 3z}{24} k = \frac{-4.4502 + 4.9346}{24} \times 3.60 = \frac{0.4844}{24} \times 3.60 \approx +0.07266$
- Term 4: $-\frac{2z^3 - 5z}{36} s^2 = -\frac{2(-4.4502) - 5(-1.644853)}{36} \times (-0.70)^2 = -\frac{-8.9004 + 8.2243}{36} \times 0.49 = -\frac{-0.6761}{36} \times 0.49 \approx +0.00920$

Summing the terms for $z_{\text{CF}}$:
$$z_{\text{CF}} = -1.644853 - 0.19898 + 0.07266 + 0.00920 \approx -1.76197$$
Notice that $z_{\text{CF}}$ has shifted further into the adverse tail (from $-1.645$ to $-1.762$).
(For a 99% VaR with $z = -2.326$ and the same $s = -0.70$, $k = 3.60$, the shift is larger: $z_{\text{CF}} \approx -3.498$.)

Step 3: Compute Cornish-Fisher VaR:
$$\text{VaR}_{\text{CF}} = -(0.0005 + (-1.76197) \times 0.015) = -(-0.02593) = +2.593\%$$
In dollars: $\$2,593$.
The naive Gaussian model underestimated tail risk by about $\$176$ per day at 95% confidence. At 99% the gap is about $\$1,758$ per day (normal VaR $\$3,440$ versus Cornish-Fisher VaR $\$5,197$).

Step 4: Dynamic Volatility Targeting:
Target annualized volatility: $\sigma^* = 12\%$ (daily target $\sigma^*_{\text{day}} = 12\% / \sqrt{252} \approx 0.756\%$).
If recent forecast volatility $\hat{\sigma}_t = 1.50\%$ daily:
$$w_t = \frac{\sigma^*_{\text{day}}}{\hat{\sigma}_t} = \frac{0.756\%}{1.50\%} = 0.504 \quad (50.4\% \text{ allocated to risk asset, } 49.6\% \text{ cash})$$
Notional position: $\$50,400$.
Revised 1-day Cornish-Fisher dollar risk: $\$50,400 \times 2.593\% \approx \$1,307$, keeping the portfolio within safe boundaries.

### Common mistakes
1. Relying on Gaussian standard deviation for crypto or option payoffs where kurtosis exceeds 5.0.
2. Treating VaR as a ceiling: believing that because 95% 1-day VaR is $2.6\%$, the portfolio cannot lose $10\%$ on an extreme shock day.
3. Ignoring volatility clustering: market volatility is autocorrelated (Mandelbrot: large changes tend to be followed by large changes). Using an unweighted 1-year average volatility fails to respond when an explosive volatility regime starts.
4. Using static leverage during high-volatility regimes.

### Resources
- `RiskLens` repository (`materials/external_repos/RiskLens/src/risklens/analytics/value_at_risk.py` and `volatility.py`): Cornish-Fisher implementation `_cornish_fisher_z` and RiskMetrics EWMA engine `ewma_volatility`.
- Favre, L., & Galeano, J. A. (2002). "Mean-Modified Value-at-Risk with Hedge Funds." *The Journal of Alternative Investments*, 5(2), 21-25.
- J.P. Morgan / Reuters (1996). *RiskMetrics Technical Document* (4th ed.). New York.

### Assignment
1. Take a series of 100 historical returns with known crash outliers. Calculate:
   - Sample mean, sample variance, sample skewness, and sample excess kurtosis.
   - 95% Normal VaR vs 95% Cornish-Fisher VaR.
   - Historical empirical VaR (quantile function).
2. Count the number of days where actual losses breached Normal VaR vs Cornish-Fisher VaR.
3. Implement an EWMA volatility tracker with $\lambda = 0.94$ and calculate the volatility-targeted position weight for each day given a target volatility of 15% annualized.

### Quiz
1. What does a negative skewness coefficient ($s < 0$) indicate about the shape of return losses?
2. How does the Cornish-Fisher expansion modify the standard normal $z$-score when returns exhibit fat tails ($k > 0$)?
3. Why is Conditional VaR (Expected Shortfall) theoretically superior to Value at Risk?
4. How does systematic volatility targeting respond when an asset enters a violent market crash?

### Answers
1. It indicates that the return distribution has an asymmetric, extended left tail: downside crashes are larger and more sudden than upside rallies.
2. It expands $z$ further into the negative tail ($|z_{\text{CF}}| > |z|$), raising the required loss threshold to accurately reflect higher outlier probability.
3. CVaR measures the average severity of losses beyond the VaR cutoff and is subadditive (coherent), whereas VaR is blind to the magnitude of losses once the breach occurs.
4. Forecast volatility surges; the volatility-targeting algorithm automatically reduces the position weight ($w_t = \sigma^* / \hat{\sigma}_t$), scaling down risk exposure and shifting capital into cash.

### Mastery checkpoint
Implement both Normal VaR and Cornish-Fisher VaR on a dataset. Show that:
1. When skewness is zero and kurtosis is zero, Cornish-Fisher VaR exactly equals Normal VaR.
2. When skewness is negative and kurtosis is positive, Cornish-Fisher VaR yields a strictly larger loss forecast.
3. Verify the Kupiec breach rate over a 252-day testing sample.

### Limitations
The Cornish-Fisher expansion is a polynomial approximation; when skewness or kurtosis is excessively extreme (e.g., $k > 10$), the transformation can become non-monotonic and break down (as guarded in `RiskLens/analytics/value_at_risk.py` via vertex and slope checks). VaR and CVaR models cannot foresee unprecedented structural breaks, exchange insolvencies, or liquidity halts.

---

## Lesson 7 — Systematic Execution, Stop Loss / Take Profit Mechanics, and Paper Trading
### Objective and prerequisites
Understand the exact event-driven order execution lifecycle, eliminate lookahead and execution bias, master stop-loss and take-profit mechanics under discrete gap conditions, and implement pure-decimal paper portfolio accounting.
Prerequisites: Lessons 1–3 (order types and execution priorities), Lesson 4 (position sizing), and basic algorithmic simulation logic.

### Explanation and vocabulary
The Event-Driven Execution Timeline (from `vektor/backend/app/backtest/engine.py`):
In an honest backtest or execution engine, bars represent discrete time intervals with Open, High, Low, Close (OHLC).
The strict causality sequence must follow:
1. Bar $t-1$ Close: Strategy processes completed market data up to bar $t-1$ close. If entry or exit conditions are met, a signal is generated at timestamp $t-1$.
2. Bar $t$ Open: Orders created from bar $t-1$ signals execute at the Open of Bar $t$.
   - Sells execute first: selling frees cash before buying commences.
   - Buys execute second: buy quantity is sized strictly from cash available after sells clear.
3. Bar $t$ High/Low/Close: Intraday price action unfolds. Open positions are marked-to-market at Bar $t$ Close.
4. Final Bar Rule: A signal generated on the final bar of historical data can NEVER fill because no future bar ($t+1$) exists.

Lookahead Bias: A common backtesting error where an algorithm uses the Close of Bar $t$ to buy at the Open of Bar $t$. In real-time trading, Bar $t$ Open happened hours before Bar $t$ Close was known. Any system exhibiting this flaw produces fabricated, unachievable performance.

Stop-Loss (SL) and Take-Profit (TP) Execution Mechanics:
- Intraday High/Low Evaluation:
  For a long position with Stop Loss $P_{\text{stop}}$ and Take Profit $P_{\text{tp}}$:
  - If $\text{Low}_t \le P_{\text{stop}}$: stop loss is triggered.
  - If $\text{High}_t \ge P_{\text{tp}}$: take profit is triggered.
- The Gap Risk Reality:
  When holding overnight or over weekends, markets frequently open at prices significantly lower than the previous close.
  If you hold an asset at $\$100$ with a protective stop at $\$95$, and the market opens Monday morning at $\$88$ due to adverse news:
  - A stop-market order triggers at $\$88$ and executes at the next available market price (e.g. $\$87.80$). Your realized loss is $\$12.20$ per unit, NOT your intended $\$5.00$ planned loss!
  - A stop-limit order (Stop $\$95$, Limit $\$94.50$) triggers at $\$88$, but because the market price is below $\$94.50$, it CANNOT execute. The position remains 100% open, unhedged, and exposed to unlimited further losses.
- Trailing Stop Mechanics:
  A trailing stop ratchets the stop price upward as the market establishes new highest closes or highest highs:
  $$P_{\text{stop}, t} = \max\left(P_{\text{stop}, t-1}, H_t \cdot (1 - \delta)\right)$$
  where $H_t$ is the position's high-water mark and $\delta$ is the trailing percentage. Once ratcheted upward, a trailing stop NEVER moves downward.

Slippage and Cost Mechanics (from `vektor/backend/app/backtest/engine.py`):
Realistic backtesting must simulate adverse execution:
$$\text{Fill}_{\text{buy}} = \min(\text{Open}_t \cdot (1 + \text{slippage}), \text{High}_t)$$
$$\text{Fill}_{\text{sell}} = \max(\text{Open}_t \cdot (1 - \text{slippage}), \text{Low}_t)$$
Fills are strictly capped/floored within the bar's traded range.
Transaction fees:
$$\text{Fee} = \text{Fee}_{\text{fixed}} + \text{Notional} \cdot \text{Fee}_{\text{rate}}$$

Paper Portfolio Accounting (from `vektor/backend/app/portfolio/accounting.py`):
- Floating-Point Contamination: In financial programming, binary floating-point representations (IEEE 754 standard floats) introduce rounding drift (e.g. `0.1 + 0.2 = 0.30000000000000004`). Over thousands of trade iterations, stray fractions of cents accumulate, corrupting cash balances and performance reporting.
- Pure Decimal Arithmetic: Robust execution engines use arbitrary-precision `Decimal` arithmetic with `ROUND_HALF_EVEN` (banker's rounding). This app's paper lab gets the same cent-exact result in JavaScript by storing money as integer cents.
- Cent Conservation:
  - When selling a partial position of size $q_{\text{sell}}$ out of held $q_{\text{held}}$:
    $$\text{Cost Basis Removed} = \text{round}_{\text{cents}}\left(\text{Total Cost Basis} \times \frac{q_{\text{sell}}}{q_{\text{held}}}\right)$$
  - When selling the entire remaining position ($q_{\text{sell}} = q_{\text{held}}$): the engine removes the ENTIRE remaining cost basis directly, ensuring zero leftover pennies or phantom inventory.
- Cash Floor Constraint: Cash balances can never drop below $\$0.00$. If an order's notional plus required fees exceeds available cash, the order is rejected (`OrderRejected`).

### Worked example
Trace an account through an overnight gap event:
- Starting Account Cash: $\$10,000.00$
- Position target: Long 100 shares of Asset XYZ at Bar 1 Close ($\$50.00$).
- Costs: Slippage $0.10\%$ ($0.001$), Fee $\$1.00$ flat plus $0.05\%$ ($0.0005$) of notional.

Step 1: Order Execution at Bar 2 Open:
Bar 2 opens at $\$50.00$ (High $\$51.00$, Low $\$49.50$, Close $\$50.50$).
Execution buy price:
$$\text{Fill Price} = \min(50.00 \times (1 + 0.001), 51.00) = \$50.05$$
- Notional: $100 \times \$50.05 = \$5,005.00$
- Fee: $\$1.00 + (\$5,005.00 \times 0.0005) = \$1.00 + \$2.50 = \$3.50$
- Total Cash Deducted: $\$5,005.00 + \$3.50 = \$5,008.50$
- Remaining Cash: $\$10,000.00 - \$5,008.50 = \$4,991.50$
- Holding recorded: Quantity $100$, Cost Basis $\$5,008.50$ (average cost $\$50.085$/share).
- Protective stop set at $\$47.50$ (intended loss: $100 \times (\$50.05 - \$47.50) + \text{costs} \approx \$258.50$).

Step 2: Weekend Gap Down on Bar 3:
Adverse earnings release over the weekend. Bar 3 opens Monday at $\$42.00$ (High $\$43.00$, Low $\$41.00$, Close $\$42.50$).
The stop order at $\$47.50$ is triggered immediately at market open!
Execution sell price:
$$\text{Fill Price} = \max(42.00 \times (1 - 0.001), 41.00) = \$41.958 \to \$41.96 \text{ (nearest cent)}$$
- Notional: $100 \times \$41.96 = \$4,196.00$
- Fee: $\$1.00 + (\$4,196.00 \times 0.0005) = \$1.00 + \$2.098 \to \$3.10$
- Net Cash Proceeds: $\$4,196.00 - \$3.10 = \$4,192.90$
- New Cash Balance: $\$4,991.50 + \$4,192.90 = \$9,184.40$
- Realized Net Loss: Net Proceeds $(\$4,192.90) - \text{Cost Basis} (\$5,008.50) = -\$815.60$.
- Actual Account Drawdown: $\$815.60 / \$10,000 = 8.16\%$.

Notice: Intended risk was $\$258.50$ ($2.59\%$), but the gap produced an $\$815.60$ loss ($8.16\%$). This demonstrates why planned stop loss is never a guaranteed ceiling.

### Common mistakes
1. Filling market orders at the exact bar close where the signal occurred (lookahead bias).
2. Assuming stop orders fill at the designated stop price in gapping or low-liquidity markets.
3. Using floating-point variables to track trade cash balances in automated systems.
4. Failing to model execution fees and slippage, transforming what is actually a net losing strategy into an illusory backtest winner.

### Resources
- `vektor` repository: examination of `simulate()` in `backend/app/backtest/engine.py`, and of `fill_order()` and `to_cents()` in `backend/app/portfolio/accounting.py` (both under `materials/external_repos/vektor/`).
- Harris, L. (2003). *Trading and Exchanges: Market Microstructure for Practitioners*. Oxford University Press.
- Kissell, R. (2013). *The Science of Algorithmic Trading and Portfolio Management*. Academic Press.
- Rules you can test in the Backtesting lab, each written from a public definition (Retrieved 2026-11-17): [Turtle 20/10 Donchian breakout](https://www.turtletrader.com/rules/), [Connors RSI(2) pullback (StockCharts)](https://chartschool.stockcharts.com/table-of-contents/trading-strategies-and-models/trading-strategies/rsi-2), Faber's 200-day trend filter ([paper](https://www.onlineinvestingai.com/blog/wp-content/uploads/2011/04/A-Quantitative-Approach-to-Tactical-Asset-Allocation.pdf)), MACD 12/26/9 signal-line cross, and [Bollinger band re-entry](https://www.bollingerbands.com/bollinger-band-rules). The lab uses close-confirmed daily signals filled at the next open, long or flat only. None of these sources establishes a current edge.
- Ross Cameron, ["6 Day Trading Strategies, And How To Use Them"](https://finance.yahoo.com/news/6-day-trading-strategies-them-184013259.html), Yahoo Finance (Retrieved 2026-11-17). Gap and Go, momentum, bull flags, breakouts, pullbacks and reversals. These need intraday bars, spreads and halt handling, so daily bars cannot test them. Treat the author's results as claims, not evidence.
- Mashaid Ahmed, ["12 Best Day Trading Tips for Beginners"](https://finance.yahoo.com/news/12-best-day-trading-tips-135448213.html), Yahoo Finance (Retrieved 2026-11-17). Start small, plan risk and reward, use stops. A stop does not guarantee its price: gaps and fast markets fill worse.

### Assignment
1. Code or hand-calculate an event-driven backtest for 5 bars with 1 entry, 1 trailing stop revision, and 1 gap exit.
2. Verify that:
   - Sells process before buys on identical timestamps.
   - Cash deductions use exact decimal banker's rounding (`ROUND_HALF_EVEN`).
   - A signal produced on the final bar is tagged `unfilled`.
3. Compare the net P/L of the trade under zero fees/slippage versus realistic fees/slippage ($10$ bps slippage $+ \$2.00$ fee).

### Quiz
1. In an event-driven backtest, if a moving average crossover signal occurs at Bar 10 Close, at which price point should the simulated order execute?
2. If an overnight earnings gap opens below your stop-market price, at what price does the order fill?
3. Why does the `vektor` paper portfolio accounting engine mandate Python `Decimal` rather than standard `float`?
4. What happens when a backtest signal occurs on the very last bar of a dataset?

### Answers
1. At Bar 11 Open (adjusted for slippage and bounded by Bar 11 High/Low); never at Bar 10 Close.
2. At the next available market price at or near the open of trading (subject to available bids and slippage), not at the stop price.
3. Standard floating-point numbers suffer from binary rounding errors that accumulate over multiple trades; `Decimal` guarantees exact cent conservation and audited balance tracking.
4. It is marked as unfilled / expired because there is no subsequent bar available to execute the order.

### Mastery checkpoint
Demonstrate a 10-trade paper trading simulation ledger showing:
1. Exact timestamping distinguishing signal time ($t$) and execution time ($t+1$).
2. Full cost-basis removal on complete liquidation without fractional cent residuals.
3. At least one simulated gap event where realized loss exceeds the planned stop distance.

### Limitations
Historical OHLC bars cannot reveal true intra-bar order book queue priority or sub-second liquidity exhaustion. In live markets, exchange connectivity drops, API rate limits, and partial fill latency create slippage beyond simple bar boundaries.

---

## Lesson 8 — Parameter Optimization & Avoiding Overfitting
### Objective and prerequisites
Master parameter grid optimization, chronological train/test holdouts, and walk-forward analysis; detect statistical overfitting using diagnostic flags from the `vektor` framework (`return_reversal`, `sharpe_decay`, `few_trades`, `edge_of_grid`, `many_candidates`).
Prerequisites: Lessons 5–7, hypothesis testing, t-statistics, and objective functions (Sharpe, Calmar, Drawdown).

### Explanation and vocabulary
The Data-Mining Trap: Given enough parameter combinations (e.g., trying 2,000 combinations of moving average lengths, RSI bands, and exit thresholds on past data), an analyst is mathematically guaranteed to find a parameter set that produced stellar past returns purely by random chance. This is known as p-hacking, data snooping, or curve-fitting.

Chronological Split vs Random Shuffling (from `vektor/backend/app/backtest/optimization.py`):
In machine learning for computer vision or natural language, shuffling samples randomly across train and test sets is standard practice.
In quantitative finance, random shuffling is fatal:
- Shuffling causes lookahead leakage: future market regimes (e.g. 2020 volatility or 2022 rate hikes) contaminate past training bars.
- Financial data possesses strong serial autocorrelation and volatility clustering.
The only valid validation protocol is a strictly chronological split (`split_calendar`):
The first $K\%$ of historical calendar days form the training set ($\text{Train} = \text{days}[0 \dots M]$); the remaining $(100 - K)\%$ form the untouched holdout test set ($\text{Test} = \text{days}[M+1 \dots N]$).

Objective Functions:
When ranking parameter combinations on training data, the objective function determines what constitutes "optimal":
- Total Return: prone to selecting high-risk, unhedged outlier bets.
- Maximum Drawdown: favors strategies that barely trade.
- Annualized Sharpe Ratio: measures excess return per unit of total risk:
  $$\text{Sharpe}_{\text{annual}} = \frac{\bar{r}_{\text{daily}} - r_{f,\text{daily}}}{\sigma_{\text{daily}}} \cdot \sqrt{252}$$
  Use $\sqrt{252}$ only with a daily mean and daily standard deviation (use 365 for assets that trade every day, such as crypto). If $R_p$ and $\sigma_p$ are already annualized, the ratio is simply $(R_p - R_f) / \sigma_p$.
- Calmar Ratio: Annualized Return divided by Absolute Maximum Drawdown.

Walk-Forward Analysis (WFA):
Rather than relying on a single static train/test split, Walk-Forward Analysis steps through time iteratively:
1. Optimize parameters on Window 1 (e.g. Years 1–3).
2. Test the optimal parameters out-of-sample on Window 2 (e.g. Year 4).
3. Roll the window forward (e.g. Train Years 2–4, Test Year 5).
4. Splice together all out-of-sample segments to construct a continuous Walk-Forward Equity Curve.
Walk-Forward Efficiency (WFE):
$$\text{WFE} = \frac{\text{Annualized Return}_{\text{out-of-sample}}}{\text{Annualized Return}_{\text{in-sample}}}$$
A WFE below $50\%$ indicates severe parameter decay and overfitting.

The `vektor` Overfitting Diagnostic Flags (from `vektor/backend/app/backtest/optimization.py`):
When comparing in-sample training metrics to out-of-sample test metrics, the `vektor` framework computes five deterministic warning flags:
1. `return_reversal`:
   $$\text{Train Return} > 0 \ge \text{Test Return}$$
   The strategy generated profits in-sample but lost money or broke even out-of-sample.
2. `sharpe_decay`:
   Applies only when Train Sharpe is defined and $> 0$; it then fires if
   $$\text{Test Sharpe} < \frac{\text{Train Sharpe}}{2} \quad \text{(strict), or Test Sharpe is undefined}$$
   The out-of-sample risk-adjusted return collapsed by more than 50% relative to training performance.
3. `few_trades`:
   $$\text{Closed Trades}_{\text{train}} < 5$$
   The training sample contains fewer than 5 closed trades. It is statistically impossible to distinguish an edge from random luck on so few observations.
4. `edge_of_grid`:
   The selected parameter equals the minimum or maximum bound of the searched grid dimensions. This indicates that the parameter did not find a stable local interior maximum; the "optimal" value is artificially constrained by the grid boundary, or the parameter is diverging.
5. `many_candidates`:
   $$\text{Candidate Combinations} > 50$$
   More than 50 parameter variations were evaluated. Testing dozens of variants exponentially increases the probability that the top candidate is a false discovery (multiple testing bias).

Multiple Testing Penalties & Deflated Sharpe Ratio:
When $N$ independent trials are conducted, the expected maximum Sharpe ratio from pure noise with zero true skill is approximately:
$$E[\max(SR)] \approx \sqrt{2 \ln(N)}$$
This is in standard-error units: the expected maximum of $N$ standard-normal test statistics, not an annualized Sharpe ratio. If an analyst tests 100 independent variations ($N = 100$), the best one is expected to sit about $\sqrt{2 \ln(100)} \approx 3.03$ standard errors above zero by luck alone. In Sharpe terms that depends on sample length: the standard error of an annualized Sharpe ratio is roughly $1/\sqrt{\text{years}}$, so with 2 years of data luck alone can produce an annualized Sharpe near $3.03 / \sqrt{2} \approx 2.1$.
The Deflated Sharpe Ratio (Bailey and López de Prado) statistically adjusts the observed Sharpe ratio for the number of trials, sample length, skewness, and kurtosis.

### Worked example
An analyst tests an SMA crossover strategy on 1,000 consecutive daily Bitcoin bars (Bitcoin trades every day, so this covers about 2.7 calendar years):
- Chronological split: 75% train (first 750 bars, about 2.05 years), 25% test (last 250 bars, about 8 months).
- Grid dimensions:
  - Fast SMA: $[5, 10, 15, 20, 25]$ (5 values)
  - Slow SMA: $[30, 50, 100, 150, 200]$ (5 values)
  - Total combinations tested: $5 \times 5 = 25$ candidates.
- Optimization objective: Maximum Sharpe Ratio on training data.

Grid Search Result on Training Data (Top Candidate):
- Candidate #1 selected: Fast SMA $= 5$, Slow SMA $= 30$.
- In-Sample (Train) Results:
  - Total Return: $+142.0\%$
  - Annualized Sharpe Ratio: $1.95$
  - Maximum Drawdown: $-18.5\%$
  - Closed Trades: 28 trades

Out-of-Sample (Holdout Test) Evaluation on Candidate #1:
- The parameters $(5, 30)$ are executed on the untouched test data (last 250 bars):
  - Total Return: $-8.4\%$
  - Annualized Sharpe Ratio: $-0.25$
  - Maximum Drawdown: $-26.2\%$
  - Closed Trades: 9 trades

Diagnostic Overfitting Audit (applying `vektor` rules):
1. `return_reversal` check:
   Train Return $(+142\%) > 0 \ge$ Test Return $(-8.4\%)$.
   FLAG TRIGGERED: `return_reversal`. "The selected parameters gained on the training data but lost money on test data."
2. `sharpe_decay` check:
   Test Sharpe $(-0.25) < \text{Train Sharpe} / 2$ ($1.95 / 2 = 0.975$).
   FLAG TRIGGERED: `sharpe_decay`. "Test Sharpe ratio collapsed below half of training Sharpe ratio."
3. `few_trades` check:
   Closed training trades $= 28 \ge 5$.
   Flag not triggered.
4. `edge_of_grid` check:
   Fast SMA was tested over $[5, 10, 15, 20, 25]$.
   The selected value ($5$) is the absolute minimum boundary of the grid!
   Slow SMA was tested over $[30, 50, 100, 150, 200]$.
   The selected value ($30$) is the absolute minimum boundary of the grid!
   FLAG TRIGGERED: `edge_of_grid`. "fast_window, slow_window sit at the edge of the searched range; the true peak lies outside or reflects parameter instability."
5. `many_candidates` check:
   25 candidates tested $\le 50$.
   Flag not triggered.

Conclusion:
Despite an impressive backtest showing $+142\%$ return and a $1.95$ Sharpe ratio, the strategy is severely overfitted and unviable for live capital.

### Common mistakes
1. Randomly shuffling time-series bars during cross-validation (lookahead data contamination).
2. Optimizing dozens of parameters on a dataset with fewer than 30 closed trades.
3. Expanding grid bounds repeatedly until a winning parameter combination is found.
4. Discarding the out-of-sample holdout test when it fails and re-optimizing on the full dataset (destroying the validity of the holdout).
5. Believing that a high in-sample Sharpe ratio represents algorithmic intelligence rather than statistical curve-fitting.

### Resources
- `vektor` repository (`materials/external_repos/vektor/backend/app/backtest/optimization.py`): inspection of `split_calendar()`, `rank()`, and `overfitting_report()`.
- Bailey, D. H., Borwein, J. M., López de Prado, M., & Zhu, Q. V. (2014). "Pseudo-Mathematics and Financial Charlatanism: The Effects of Backtest Overfitting on Out-of-Sample Performance." *Notices of the AMS*, 61(5), 458-471.
- Harvey, C. R., Liu, Y., & Zhu, H. (2016). "... and the Cross-Section of Expected Returns." *The Review of Financial Studies*, 29(1), 5-68.

### Assignment
1. Construct an optimization grid for a dual-indicator strategy (e.g. SMA length and RSI threshold) across at least 16 parameter pairs.
2. Partition the data into a strict 70% chronological train set and 30% holdout test set.
3. Rank candidates on the train set by Sharpe ratio, then test the #1 candidate on the test set.
4. Formally evaluate the 5 `vektor` overfitting flags:
   - Check if return reversed.
   - If Train Sharpe is defined and $>0$: check if Test Sharpe is strictly below half of Train Sharpe, or undefined.
   - Check if training closed trades $<5$.
   - Check if any parameter sits on the grid boundary.
   - Count candidate combinations ($>50$).

### Quiz
1. Why is random k-fold cross-validation prohibited for financial time-series strategies?
2. What does the `sharpe_decay` flag in `vektor` signify?
3. If an optimal parameter is located on the boundary of your parameter grid, why is that considered an overfitting risk?
4. How does testing 200 candidate strategy variations affect the reliability of the single top-performing variant?

### Answers
1. Random shuffling destroys temporal order and allows future information (volatility regimes, price trends) to leak into the training dataset, creating severe lookahead bias.
2. It signifies that out-of-sample risk-adjusted performance collapsed to less than half of in-sample training performance ($SR_{\text{test}} < SR_{\text{train}} / 2$).
3. It indicates that the optimization did not locate a stable local plateau inside the search domain, but rather hit an artificial boundary constraint or is chasing an extreme parameter value.
4. It dramatically inflates multiple testing bias; when many variations are tested, the highest-ranking candidate is statistically likely to be pure luck rather than true market edge.

### Mastery checkpoint
Document a complete parameter optimization study that explicitly reports:
1. Exact chronological split dates.
2. Complete parameter grid specification.
3. Top in-sample candidate vs holdout out-of-sample performance metrics.
4. Comprehensive evaluation against all five `vektor` overfitting diagnostic flags.
5. A definitive Go / No-Go verdict for paper trading deployment.

### Limitations
Even a strategy that passes all five overfitting tests and achieves high walk-forward efficiency can degrade in live trading due to macroeconomic regime shifts, structural changes in market liquidity, regulatory interventions, or institutional crowding into the same trading signal.

---

## Part 2 assessment
Hypothetical Quantitative Strategy Evaluation:
A quantitative researcher develops a multi-asset rotation strategy across SPY, TLT, GLD, and BTC with dynamic volatility targeting and stop execution.
Parameters:
- Account equity: $\$100,000$.
- Daily asset stats: $\mu = 0.04\%$, $\sigma = 1.6\%$ daily ($25.4\%$ annualized), skewness $s = -0.80$, excess kurtosis $k = 4.0$.
- Volatility target: $\sigma^* = 12\%$ annualized.
- Optimization history: tested 64 parameter combinations on a 75/25 chronological split; top candidate generated 32 closed training trades with $SR_{\text{train}} = 1.90$ and $SR_{\text{test}} = 0.85$. Fast lookback parameter sits at the minimum grid boundary ($5$).
- Stop execution test: position of 50 units entered at $\$200.00$; protective stop at $\$190.00$; market gaps overnight to open at $\$180.00$ with $0.2\%$ slippage and $\$5$ fee.

Tasks:
1. Calculate the daily volatility target allocation weight $w_t$.
2. Calculate the 1-day 95% Normal VaR versus Cornish-Fisher VaR.
3. Calculate the realized net loss and drawdown from the overnight gap exit, comparing it to the planned stop loss.
4. Identify which `vektor` overfitting flags are triggered by this research process.

### Assessment answers
1. Volatility target weight:
   Annualized asset volatility is $25.4\%$.
   $w_t = 12\% / 25.4\% \approx 0.472$ ($47.2\%$ invested in risky assets, $52.8\%$ held in cash).
   Risky notional exposure is $\$47,200$.
2. 1-day 95% VaR:
   $z = -1.644853$.
   Normal VaR: $-(0.0004 + (-1.644853) \times 0.016) = -(-0.02592) = +2.59\%$.
   Cornish-Fisher expansion with $s = -0.80$ and $k = 4.0$:
   $z_{\text{CF}} \approx -1.821$.
   Cornish-Fisher VaR: $-(0.0004 + (-1.821) \times 0.016) \approx +2.87\%$.
   Cornish-Fisher captures an additional $0.28\%$ of tail risk ($+\$280$ per $\$100\text{k}$).
3. Execution gap loss:
   Sell fill at open: $\$180.00 \times (1 - 0.002) = \$179.64$.
   Sell notional: $50 \times \$179.64 = \$8,982.00$.
   Net proceeds after $\$5$ fee: $\$8,977.00$.
   Entry notional: $50 \times \$200.00 = \$10,000.00$.
   Realized net loss: $\$8,977.00 - \$10,000.00 = -\$1,023.00$ ($1.023\%$ account drawdown).
   Planned stop loss was $50 \times (\$200 - \$190) = \$500.00$. The gap more than doubled the intended dollar loss.
4. Overfitting flags:
   - `edge_of_grid`: Fast lookback parameter sits at the boundary of the grid.
   - `sharpe_decay`: Test Sharpe ($0.85$) is less than half of Train Sharpe ($1.90 / 2 = 0.95$).
   - `many_candidates`: 64 combinations tested exceeds the 50 candidate threshold.
   The strategy exhibits clear symptoms of multiple testing bias and parameter decay.

Pass criteria: All mathematical steps correct, explicit distinction between planned stop and actual gap execution, and full identification of all three overfitting warning flags.

---

## Quantitative study routine & lab protocol
Session 1 (45 minutes): Study multi-asset momentum mathematics and run the `Rotation-Index` Ridge regularizer.
Session 2 (45 minutes): Compute Cornish-Fisher VaR and EWMA volatility targeting on a historical dataset.
Session 3 (45 minutes): Walk through event-driven bar execution and audit decimal portfolio accounting.
Session 4 (60 minutes): Execute parameter grid search with chronological holdouts and audit the 5 overfitting flags.

## Systematic quantitative checklist
1. Are asset returns normalized by realized volatility prior to momentum ranking?
2. Is an absolute trend filter (cash hurdle) active to avoid holding assets during market crashes?
3. Does the risk model compute higher moments (skewness and excess kurtosis) via Cornish-Fisher expansion?
4. Is portfolio exposure dynamically sized inversely to forecast volatility?
5. Does the backtest execute signals on Bar $t+1$ Open rather than Bar $t$ Close?
6. Are slippage and fees deducted from every order fill?
7. Is cash accounting managed with arbitrary-precision Decimal arithmetic?
8. Are historical splits strictly chronological without data shuffling?
9. Are all five `vektor` overfitting diagnostic flags evaluated?
10. Is any critical parameter sitting at the edge of the searched grid?

## Part 2 resource library
QR1: `materials/external_repos/Rotation-Index` — Regularized Adjusted Plus-Minus (RAPM) model and possession-weighted ridge regression engine.
QR2: `materials/external_repos/RiskLens` — Full portfolio risk analytics: Cornish-Fisher VaR/CVaR, EWMA/GARCH volatility forecasting, Kupiec backtesting, and Equal Risk Contribution optimization.
QR3: `materials/external_repos/vektor` — Event-driven backtesting engine, decimal portfolio accounting, chronological train/test splits, and overfitting detection reports.
QR4: Asness, Moskowitz, & Pedersen (2013) — "Value and Momentum Everywhere", *Journal of Finance*.
QR5: Bailey, Borwein, López de Prado, & Zhu (2014) — "Pseudo-Mathematics and Financial Charlatanism: The Effects of Backtest Overfitting", *Notices of the AMS*.
QR6: Harris (2003) — *Trading and Exchanges: Market Microstructure for Practitioners*, Oxford University Press.

## Quantitative glossary
Time-series momentum: Absolute trend measurement of an asset against cash or its own history.
Cross-sectional momentum: Relative ranking of assets against a peer universe.
Ridge regression: Regularized linear regression incorporating an $L_2$ penalty to shrink collinear coefficients toward zero.
Negative skewness: Asymmetric return distribution characterized by severe, extended crash tails.
Excess kurtosis: Heavy-tailed return distribution where extreme outliers occur more frequently than under a Gaussian curve.
Cornish-Fisher expansion: Polynomial transformation adjusting normal quantiles for sample skewness and kurtosis.
Value-at-Risk (VaR): Maximum expected loss at a given confidence level over a specific time horizon.
Conditional VaR (CVaR): Expected average loss given that the loss exceeds the VaR cutoff (Expected Shortfall).
Volatility targeting: Dynamic position sizing scaling exposure inversely to forecast volatility to stabilize portfolio risk.
Lookahead bias: The fatal error of using future market data to execute past trades in simulation.
Trailing stop: Dynamic stop-loss order that ratchets upward with new market highs and never moves downward.
Banker's rounding: Round-half-to-even rounding convention that eliminates systematic upward rounding bias.
Chronological split: Dividing time-series data such that all training dates strictly precede all testing dates.
Walk-Forward Analysis: Iterative optimization and out-of-sample forward evaluation across rolling historical windows.
Multiple testing bias: The statistical phenomenon where evaluating numerous strategy variants increases the probability of finding a lucky false positive.

## Completeness & safety disclaimers
Part 2 expands the Trading Research Academy into systematic quantitative strategies. These models provide structured tools for testing hypotheses, calculating risk, and preventing statistical self-deception. No mathematical model, backtest, or optimization guarantees future live execution efficiency, exchange solvency, or investment profitability. Educational use only.
