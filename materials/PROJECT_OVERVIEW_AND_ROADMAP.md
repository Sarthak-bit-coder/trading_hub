# Trading Research Academy (`trading_hub`) — Master Project Overview & Roadmap

> **Repository:** `trading_hub`  
> **Related Repositories Inspected:**  
> - [`Rotation-Index`](https://github.com/RohinCodes15/Rotation-Index)  
> - [`RiskLens`](https://github.com/RohinCodes15/RiskLens)  
> - [`vektor`](https://github.com/RohinCodes15/vektor)  

---

## 1. What This App Is & What You Are Trying to Do

### 1.1 The Vision
You are building an all-in-one, local-first **Systematic Trading Education & Quantitative Research Workspace**. 

The progression follows a disciplined, institutional path:
$$\text{Foundational Learning} \longrightarrow \text{Rigorous Backtesting} \longrightarrow \text{Realistic Paper Trading} \longrightarrow \text{Systematic Real Trading}$$

### 1.2 Core Capabilities
1. **Curriculum & Mastery:** Structured educational lessons (starting with Part 1 market structure, margin mechanics, and order types, and now expanding to Part 2 quantitative strategies).
2. **Deterministic Research Lab:** Non-predictive, look-ahead-free historical backtesting that enforces next-bar execution at the open, realistic slippage, and fee drag.
3. **Paper Trading Simulation:** A virtual multi-asset sandbox (Stocks, ETFs, Bonds, Crypto, Memecoins) with Long and Short positions, Stop Loss (SL), Take Profit (TP), and portfolio equity tracking.
4. **Institutional Risk Lens:** Downside risk metrics including 1-day Value-at-Risk (VaR), Cornish-Fisher expansion for fat-tailed assets, target volatility position sizing, and maximum drawdown circuit breakers.
5. **Sports Probability & Cross-Asset Rotations:** Predictive models adapted from quantitative sports betting (such as NBA lineup RAPM using Ridge Regression) and multi-asset factor momentum.

---

## 2. Technical Audit of the 3 Repositories

All three repositories were cloned and inspected in detail under `materials/external_repos/`.

### 2.1 Repository 1: `Rotation-Index`
* **What It Actually Is:** An NBA basketball analytics engine that computes **Regularized Adjusted Plus-Minus (RAPM)**. In quantitative sports betting (e.g., Pinnacle or Circa market makers), this exact model is used to price point spreads, totals, and player propositions.
* **Data Sources:** 
  * Real NBA play-by-play possession logs via `pbpstats.com` API.
  * Pinned season manifest (`manifests/2025-26-regular-season.json` with 1,230 games).
  * 5-on-5 on-court lineup extraction for every possession.
* **Machine Learning / Mathematical Architecture:**
  * **Ridge Regression ($L_2$ Regularization):** Solves the multicollinearity problem of 5 teammates sharing the court:
    $$\hat{\beta} = (X^T W X + \lambda I)^{-1} X^T W y$$
  * **Objective:** Isolates each individual player's offensive and defensive rating per 100 possessions.
  * **Validation & Hyperparameter Tuning:** Tests a grid of penalties $\lambda \in [500, 16000]$ against an out-of-sample holdout of 20% of games (`pick_lambda()`).
* **Extractable Quant Concept:** Out-of-sample regularized factor estimation, game holdout cross-validation, and spread handicap modeling.

---

### 2.2 Repository 2: `RiskLens`
* **What It Actually Is:** A quantitative portfolio risk analytics system built in Python and Streamlit.
* **Data Sources:**
  * Daily OHLCV adjusted prices from **Yahoo Finance (`yfinance`)**.
  * Fama-French 3-Factor & 4-Factor datasets (Market, Size, Value, Momentum).
* **Mathematical Models & Algorithms:**
  * **Tail Risk & Value-at-Risk (VaR/CVaR):**
    * *Historical VaR:* Direct empirical percentile of observed loss distribution.
    * *Parametric Normal VaR:* $-( \mu + z_{\alpha} \cdot \sigma )$.
    * *Cornish-Fisher Modified VaR:* Adjusts the standard normal quantile $z$ for sample skewness ($S$) and excess kurtosis ($K$):
      $$z_{CF} = z + \frac{z^2 - 1}{6}S + \frac{z^3 - 3z}{24}K - \frac{2z^3 - 5z}{36}S^2$$
      Crucial for assets with fat tails (cryptocurrencies, memecoins, earnings shocks).
    * *Kupiec Proportion-of-Failures Test:* Chi-squared hypothesis testing on whether empirical VaR breaches match expected theoretical frequency.
  * **Portfolio Optimization & Allocation:**
    * Markowitz Mean-Variance optimization, Minimum Volatility, and Equal Risk Contribution (Risk Parity).
  * **Crisis Stress Testing:** Replaying historical market shocks (2008 Lehman collapse, 2020 COVID crash, 2022 Fed rate-hike shock).
* **Extractable Quant Concept:** Cornish-Fisher tail risk modeling, volatility-targeted sizing, and out-of-sample VaR backtesting.

---

### 2.3 Repository 3: `vektor`
* **What It Actually Is:** A local-first paper-trading and backtesting platform utilizing a Python FastAPI backend and typed Next.js frontend.
* **Data Sources & Storage:**
  * Daily historical bars from Yahoo Finance (`yfinance`), cached locally in **SQLite**.
* **Architecture & Features:**
  * **Paper Portfolio Ledger:** State machine maintaining simulated USD balances, cash, long/short positions, and an append-only audit trail of fills and commissions.
  * **Look-Ahead Bias Elimination:** Signals generated on bar close $t$ execute exclusively on the open of bar $t+1$ with adverse slippage.
  * **Parameter Grid Search:** Exhaustive testing of SMA and RSI parameters (up to 100 permutations) evaluated against a strict chronological holdout partition to prevent curve-fitting.
  * **AI Strategy Insights:** Uses an LLM (Anthropic Claude API) purely as an analytical explainer that reads objective backtest metrics and generates natural language evaluations of risk and regime vulnerabilities.
* **Extractable Quant Concept:** Local paper portfolio state machine, next-bar execution rules, and parameter grid search with overfitting penalties.

---

## 3. Chronicle of Everything That Has Happened

1. **Codebase Discovery & Verification:**
   - Audited the local `trading_hub` repository. Confirmed it is a zero-dependency, local-first web app running a Node.js static server on port 8000 with vanilla JS, CSS, and HTML.
   - Verified that all 17 initial unit tests passed cleanly.
2. **Accessing the Friend's Repositories:**
   - The user provided links to `Rotation-Index`, `RiskLens`, and `vektor`.
   - Identified that the repos were public on GitHub, bypassed the offline sandbox restrictions, and successfully cloned all 3 repositories into `materials/external_repos/`.
3. **Deep Source Code Inspection:**
   - Reverse-engineered `model.py` and `possession_model.py` in `Rotation-Index` to expose the Ridge Regression RAPM matrix formulation and holdout validation.
   - Reverse-engineered `value_at_risk.py`, `optimization.py`, and `simulation.py` in `RiskLens` to extract the Cornish-Fisher equations and Kupiec backtest.
   - Reverse-engineered `vektor`'s architecture to study the paper trading state machine, parameter grid search, and SQLite caching.
4. **Mathematical Library Expansion:**
   - Extended `app/math.js` with institutional math functions (`calcRiskReward`, `calcTradeFriction`, `parametricVaR`, `targetVolSize`, `maxDrawdown`, `simulatePriceTick`, `calcPositions`).
   - Expanded unit tests in `app/tests/calculations.test.cjs` from 17 to 24 tests, all passing with zero errors.

---

## 5. Active Implementation Roadmap

1. **Paper Trading Lab Overhaul (`app/app.js`):** Add multi-asset defaults, Long/Short support, SL/TP triggers, tick simulation, and RiskLens dashboard.
2. **Sub-Course Creation (`app/content/part-2-quant-strategies.md`):** Complete 4-lesson curriculum explaining how to build a bot with the extracted concepts.
3. **Master AI Prompt (`materials/PROMPT_EXTRACT_AND_BUILD_BOT.md`):** Ready-to-paste prompt for external models to generate bot modules.
