# Custom Learning Plan Editor & Curriculum Expansion Prompt
**Trading Research Academy (`trading_hub`)**

> **How to use this file**: Copy the prompt template in [Section 3](#3-the-master-ai-prompt-copy--paste-into-any-ai) into any conversational AI (Perplexity, ChatGPT, Claude, Antigravity, Gemini, or local LLMs). Fill in the bracketed variables in [Section 2](#2-customization-variables) to tailor your trading curriculum, create new elective lessons, or adapt the material to your specific target assets and mathematical background.

---

## 1. Academy Architecture & Design Constraints

Before expanding the curriculum, review how the Trading Research Academy is built so any new content parses and functions smoothly:

1. **Strict Educational Framing**:
   - All modules emphasize *mechanics first, then disciplined decision-making, then systematic testing*.
   - Never claim or promise live profitability. Simulations, backtests, and paper trading are educational sandboxes, not proof of achievable live execution or legal custody.
   - Always distinguish four separate quantities: **Account Equity**, **Notional Exposure**, **Margin Collateral**, and **Planned Loss Budget**.

2. **Course File Structure**:
   - `app/content/part-1.md`: Lessons 1–4 (Foundational mechanics, product passports, order types, linear loss-budget sizing).
   - `app/content/part-2-quant-strategies.md`: Lessons 5–8 (Multi-asset momentum & RAPM rotation, RiskLens downside risk/VaR, systematic execution & paper portfolio accounting, parameter optimization & overfitting prevention).
   - `materials/external_repos/`:
     - `Rotation-Index`: NBA Lineup RAPM (Ridge Regression Regularized Adjusted Plus-Minus) applied to factor decomposition, collinearity control, and cross-asset momentum.
     - `RiskLens`: Non-Gaussian risk modeling, sample skewness, excess kurtosis, Cornish-Fisher VaR/CVaR, RiskMetrics EWMA volatility forecasting, and volatility targeting.
     - `vektor`: Event-driven backtesting, lookahead-free bar execution ($t-1$ signal $\to t$ open fill), arbitrary-precision Decimal portfolio accounting, chronological train/test splits, and automated overfitting diagnostics.

3. **Markdown Parser Standard**:
   The web application's internal parser (`app/app.js` and `app/backtest/ui.js`) splits lessons using regular expressions and renders markdown blocks. Every lesson **must** use this exact heading hierarchy:
   ```markdown
   ## Lesson <N> — <Title>
   ### Objective and prerequisites
   ### Explanation and vocabulary
   ### Worked example
   ### Common mistakes
   ### Resources
   ### Assignment
   ### Quiz
   1. <Question 1>
   2. <Question 2>
   3. <Question 3>
   4. <Question 4>
   ### Answers
   1. <Answer 1> 2. <Answer 2> 3. <Answer 3> 4. <Answer 4>
   ### Mastery checkpoint
   ### Limitations
   ```

4. **Web Importer JSON Schema**:
   To import custom lessons into the browser via the Academy settings page (`#settings` $\to$ **Import future lessons**), the AI can format lessons into this JSON payload:
   ```json
   {
     "lessons": [
       {
         "id": "lesson-5-rotation-index",
         "title": "Multi-Asset Momentum & The Rotation Index",
         "part": "2",
         "stage": "quant",
         "status": "available",
         "content": "### Objective and prerequisites\n...\n### Explanation and vocabulary\n..."
       }
     ]
   }
   ```

---

## 2. Customization Variables

Before prompting the AI, choose your parameters from the options below:

| Parameter | Options / Examples | Your Choice |
| :--- | :--- | :--- |
| **Learner Background** | Beginner (high school/undergrad), Intermediate (Python/Data Science), Advanced (Math/Physics/CS) | `[Specify here]` |
| **Primary Asset Focus** | US Equities/ETFs, Crypto/DeFi/Memecoins, FX & Fixed Income, Commodities, Options/Derivatives, Sports Betting Markets | `[Specify here]` |
| **Core Quantitative Interest** | Momentum/Rotation, Mean Reversion, Statistical Arbitrage, Volatility Surface Modeling, Machine Learning / Factor Models, Market Microstructure | `[Specify here]` |
| **Weekly Study Budget** | 2 hours/week (casual), 5 hours/week (steady), 10+ hours/week (intensive research) | `[Specify here]` |
| **Software Stack** | Python (NumPy, pandas, SciPy), JavaScript/TypeScript (Web sandbox), R, Excel/Google Sheets | `[Specify here]` |
| **Target Output Format** | Complete Markdown lesson file, Interactive JSON import file, or Custom Syllabi Roadmap | `[Specify here]` |

---

## 3. The Master AI Prompt (Copy & Paste Into Any AI)

Copy everything inside the box below and paste it into ChatGPT, Claude, Perplexity, or Antigravity:

```text
You are the Lead Quantitative Curriculum Architect for the Trading Research Academy ("trading_hub"), an institutional-grade educational platform for systematic trading research.

### CONTEXT & KNOWLEDGE BASE:
The Academy teaches empirical trading mechanics and quantitative research without sales hype, unhedged leverage, or false promises of profitability.
It comprises:
1. Part 1 (Fundamentals): Exposure vs Margin, Product Passports, Order Types & Execution Priorities, Sizing from Loss Budgets.
2. Part 2 (Quantitative Strategies):
   - Multi-Asset Momentum & The Rotation Index (incorporating NBA Lineup Ridge-Regularized Adjusted Plus-Minus from materials/external_repos/Rotation-Index).
   - RiskLens Downside Risk Framework (Sample Skewness, Excess Kurtosis, Cornish-Fisher VaR/CVaR, RiskMetrics EWMA Volatility, Dynamic Volatility Targeting from materials/external_repos/RiskLens).
   - Systematic Execution & Paper Portfolio Accounting (Bar causality: t-1 close signal -> t open execution, overnight gap risk, pure Decimal banker's rounding from materials/external_repos/vektor).
   - Parameter Optimization & Overfitting Diagnostics (Grid search, strictly chronological holdout splits, and vektor's 5 overfitting flags: return_reversal, sharpe_decay, few_trades, edge_of_grid, many_candidates).

### MY LEARNER PROFILE:
- Background & Skill Level: [INSERT: e.g. Undergraduate in CS with basic Python, or Discretionary trader learning math]
- Target Asset Class(es): [INSERT: e.g. Crypto & Memecoins, US Large-Cap Equities, Treasury Bond Futures, Options]
- Research Topic to Add or Expand: [INSERT: e.g. Lesson on Pairs Trading and Cointegration, or Deep dive on Options Volatility Skew, or Microstructure Order Book Imbalance]
- Tooling / Languages: [INSERT: e.g. Python (pandas/scipy) + Trading Research Academy Web Sandbox]
- Weekly Study Hours: [INSERT: e.g. 4 hours / week]

### YOUR TASK:
Generate a rigorous, complete, battle-tested curriculum extension or new lesson. Follow these mandatory rules:

1. STRICT FORMATTING COMPLIANCE:
The lesson must follow the exact Trading Research Academy Markdown schema so it parses seamlessly in the app:
## Lesson <N> — <Lesson Title>
### Objective and prerequisites
### Explanation and vocabulary
### Worked example (Must include step-by-step numbers, clear equations, and tangible inputs/outputs)
### Common mistakes (At least 4 substantive analytical or execution pitfalls)
### Resources (Citing foundational academic papers, official exchange specs, or external repos)
### Assignment (Practical, reproducible exercise with verifiable constraints)
### Quiz (Exactly 4 numbered conceptual & numerical questions)
### Answers (Complete numerical step-by-step solutions and conceptual keys)
### Mastery checkpoint (Self-attestation criteria requiring observable proof of work)
### Limitations (Explicit failure modes, regulatory assumptions, and market regime risks)

2. METHODOLOGICAL RIGOR:
- Never assume a normal distribution when calculating risk. Address skewness and kurtosis.
- Never use random k-fold shuffling for time-series backtests; enforce strictly chronological train/test splits.
- For momentum or rotation models, enforce an absolute trend filter (cash hurdle) and deduct realistic transaction costs (slippage, bid-ask spread, exchange fees).
- Distinguish between theoretical paper models and physical liquidity constraints (especially for micro-caps, memecoins, or illiquid derivatives).
- Enforce lookahead-free bar causality: signals generated at Bar t-1 Close can only execute at Bar t Open.

3. OPTIONAL JSON EXPORT:
If requested, also provide a valid JSON object matching the Academy's custom lesson import schema (`{ "lessons": [{ "id": "...", "title": "...", "part": "2", "stage": "quant", "status": "available", "content": "..." }] }`).

Proceed to output the customized curriculum plan and complete lesson content now.
```

---

## 4. Example Curriculum Extension Blueprints

Here are pre-engineered templates you can request using the master prompt above:

### Blueprint A: Crypto Derivatives & Perpetual Funding Rate Arbitrage
- **Focus**: Perpetual futures, funding rate mechanics ($8$-hour funding intervals), basis spread vs spot, delta-neutral cash-and-carry.
- **Risk Core**: Liquidation cascades, counterparty/exchange solvency risk, cross-collateral haircuts, funding rate inversion during sustained bear regimes.
- **Assignment**: Calculate annual net yield on a BTC basis trade after deducting spot exchange custody fees, taker execution fees, and 30-day funding decay.

### Blueprint B: Statistical Arbitrage & Cointegration Pairs Trading
- **Focus**: Engle-Granger two-step cointegration, Augmented Dickey-Fuller (ADF) test, Ornstein-Uhlenbeck mean-reverting spread modeling, z-score threshold execution.
- **Risk Core**: Structural break in cointegration (pair diverges permanently due to corporate restructuring or insolvency), margin divergence across long and short legs.
- **Assignment**: Test cointegration between two sector peers (e.g. KO vs PEP or XOM vs CVX); calculate half-life of mean reversion and set dynamic stop bands.

### Blueprint C: Options Volatility & Asymmetric Payoff Engineering
- **Focus**: Implied volatility (IV) smile and surface, Black-Scholes-Merton limitations, Greeks (Delta, Gamma, Vega, Theta), delta-neutral hedging.
- **Risk Core**: Pin risk, catastrophic gamma explosions into expiration, IV crush post-earnings, discrete hedging slippage.
- **Assignment**: Construct a defined-risk vertical spread; calculate maximum profit, maximum loss, breakeven, and the Cornish-Fisher tail loss of an unhedged naked short leg.

### Blueprint D: Sports Analytics & Market Making in Betting Exchanges
- **Focus**: Building directly on `Rotation-Index`: converting NBA possession RAPM into point spread handicapping, Kelly criterion staking, closing line value (CLV).
- **Risk Core**: Vig/juice friction, low-sample variance, lineup scratch latency, exchange liquidity limits.
- **Assignment**: Calculate closing line value on 50 simulated games; evaluate bankroll drawdown under full Kelly vs fractional (0.25) Kelly staking.

---

## 5. Course Parser Verification Guide

If you generate new markdown content using this prompt, verify it against the Trading Research Academy test suite before committing:

1. **Heading Syntax**: Ensure there is a space after `##` and `###`. Do not use `####` or bold text for main section headers.
2. **Quiz Format**: Ensure `### Quiz` contains numbered items (`1. `, `2. `) and `### Answers` contains corresponding numbered explanations.
3. **Local Testing**:
   - Save your markdown file in `app/content/`.
   - Run calculations and backtest engine tests via terminal:
     ```bash
     node app/tests/calculations.test.cjs
     node app/backtest/engine.test.cjs
     ```
   - Launch the local academy server:
     ```bash
     node app/server.js
     ```
   - Open `http://127.0.0.1:8000` in your browser and verify the lesson displays with working TOC, flashcards, and quizzes.
