# External repository fact-check

Evidence paths below are relative to `C:/Users/brijb/Documents/trading_hub/materials/external_repos/<repo>/`. Repo source was read only. `vektor` has no `LICENSE` file; no code from it is reproduced here.

## Repository metadata

| Repo | Git commit | LICENSE file |
|---|---|---|
| RiskLens | `63b6fa242010a8f478d1d50fc6b938fa6f1245c9` | Yes (`LICENSE`) |
| Rotation-Index | `d575a4ba98fce9a680daa7b850002239a547779c` | Yes (`LICENSE`) |
| vektor | `f544c03734f8287248c3fb398e918edfcb628d3f` | No |

## Claims

| Lesson | Quoted claim (under 20 words) | Repo | File:line evidence | Verdict | Correct value if wrong |
|---|---|---|---|---|---|
| Part 1, preview (16) | “cross-asset rotation ... Connects NBA Lineup RAPM ... to factor shrinkage” | Rotation-Index | `model.py:28,50`; `possession_model.py:581` | verified | — |
| Part 1, preview (16) | “Equities (SPY, QQQ), Treasuries (TLT, IEF), Commodities (GLD), Crypto (BTC)” | Rotation-Index | `model.py:28-49`; `possession_model.py:118` | unverifiable | Listed sample assets are lesson examples, not established as repository universe by cited model source. |
| Part 1, preview (17) | “Cornish-Fisher VaR/CVaR ... RiskMetrics EWMA volatility” | RiskLens | `src/risklens/analytics/value_at_risk.py:60,104`; `src/risklens/analytics/volatility.py:39,55` | verified | — |
| Part 1, preview (17) | “dynamic inverse-volatility sizing” | RiskLens | `src/risklens/analytics/optimization.py:138,420` | unverifiable | Source supports portfolio optimization, but does not establish this sizing claim. |
| Part 1, preview (18) | “event-driven order lifecycles ... overnight gap risk ... Decimal portfolio accounting” | vektor | `backend/app/backtest/engine.py:100,150,178`; `backend/app/portfolio/accounting.py:1,14` | verified | — |
| Part 1, preview (19) | “strictly chronological train/test holdout splits (`split_calendar`)” | vektor | `backend/app/backtest/optimization.py:49` | verified | — |
| Part 1, preview (19) | “five automated ... flags” | vektor | `backend/app/backtest/optimization.py:80-112` | verified | — |
| Lesson 5 resources (97) | “`fit_ridge(X, y, w, lam)` and holdout validation `pick_lambda`” | Rotation-Index | `model.py:50,58` | verified | — |
| Lesson 5 mathematical bridge (42-51) | “20% game holdout in `Rotation-Index/model.py`” | Rotation-Index | `model.py:58-68`; `possession_model.py:831,903` | wrong | `model.py` selects lambda using an 80/20 split; possession model has its own holdout selection. |
| Lesson 5 resources (97) | “`Rotation-Index/model.py` and `possession_model.py`” | Rotation-Index | `model.py:50,58`; `possession_model.py:581,903` | verified | — |
| Lesson 6, heading and introduction (135-137) | “The RiskLens Framework” | RiskLens | `src/risklens/analytics/engine.py:58`; `src/risklens/analytics/value_at_risk.py:104` | verified | — |
| Lesson 6 formula heading (156) | “`RiskLens/analytics/value_at_risk.py`” | RiskLens | `src/risklens/analytics/value_at_risk.py:60` | wrong | Actual path: `src/risklens/analytics/value_at_risk.py`. |
| Lesson 6 volatility heading (168) | “`RiskLens/analytics/volatility.py`” | RiskLens | `src/risklens/analytics/volatility.py:39,55` | wrong | Actual path: `src/risklens/analytics/volatility.py`. |
| Lesson 6 model validation (179) | “Kupiec Proportion of Failures likelihood ratio test” | RiskLens | `src/risklens/analytics/value_at_risk.py:178-204` | verified | — |
| Lesson 6 resources (224) | “`_cornish_fisher_z` and ... `ewma_volatility`” | RiskLens | `src/risklens/analytics/value_at_risk.py:60`; `src/risklens/analytics/volatility.py:55` | verified | — |
| Lesson 6 limitations (255) | “via vertex and slope checks” | RiskLens | `src/risklens/analytics/value_at_risk.py:69-74` | verified | — |
| Lesson 7 timeline and slippage (265, 292) | “`vektor/backend/app/backtest/engine.py`” | vektor | `backend/app/backtest/engine.py:100,138-150,178` | verified | — |
| Lesson 7 accounting (300) | “`vektor/backend/app/portfolio/accounting.py`” | vektor | `backend/app/portfolio/accounting.py:14,24,60` | verified | — |
| Lesson 7 resources (347) | “`simulate()`, `fill_order()`, and `to_cents()`” | vektor | `backend/app/backtest/engine.py:100`; `backend/app/portfolio/accounting.py:24,60` | wrong | `fill_order()` and `to_cents()` are in `portfolio/accounting.py`, not `backtest/engine.py`. |
| Lesson 8 split and ranking (390, 494) | “`split_calendar()`, `rank()`, and `overfitting_report()`” | vektor | `backend/app/backtest/optimization.py:49,60,69` | verified | — |
| Lesson 8 five flags (384, 416-417) | “`return_reversal`, `sharpe_decay`, `few_trades`, `edge_of_grid`, `many_candidates`” | vektor | `backend/app/backtest/optimization.py:85-112` | verified | — |
| Lesson 8 flag (418-420) | “Train Return > 0 ≥ Test Return” | vektor | `backend/app/backtest/optimization.py:85-89` | verified | — |
| Lesson 8 flag (421-423) | “Test Sharpe < Train Sharpe / 2 or Test Sharpe is undefined” | vektor | `backend/app/backtest/optimization.py:90-96` | wrong | Also requires defined positive training Sharpe; otherwise no flag. |
| Lesson 8 flag (424-426) | “Closed Trades_train < 5” | vektor | `backend/app/backtest/optimization.py:29-30,97-101` | verified | — |
| Lesson 8 flag (427-428) | “selected parameter equals the minimum or maximum bound” | vektor | `backend/app/backtest/optimization.py:103-105,115-130` | verified | — |
| Lesson 8 flag (429-431) | “Candidate Combinations > 50” | vektor | `backend/app/backtest/optimization.py:32,107-112` | verified | — |
| Lesson 8 worked example (480) | “25 candidates tested ≤ 50. Flag not triggered.” | vektor | `backend/app/backtest/optimization.py:107` | verified | — |
| Lesson 8 project prompt (502-504) | “Sharpe decayed by >50%” | vektor | `backend/app/backtest/optimization.py:90-96` | wrong | It flags test Sharpe below half (strict `<`) or undefined, only when train Sharpe is defined and positive. |
| Part 2 library (598) | “possession-weighted ridge regression engine” | Rotation-Index | `possession_model.py:118,581,627-633` | verified | — |
| Part 2 library (599) | “Cornish-Fisher VaR/CVaR, EWMA/GARCH volatility forecasting, Kupiec backtesting” | RiskLens | `src/risklens/analytics/value_at_risk.py:104,178`; `src/risklens/analytics/volatility.py:55,121,162` | verified | — |
| Part 2 library (599) | “Equal Risk Contribution optimization” | RiskLens | `src/risklens/analytics/optimization.py:138,420` | unverifiable | File implements portfolio optimization; source checked does not establish ERC. |
| Part 2 library (600) | “Vectorized and event-driven backtesting engine” | vektor | `backend/app/backtest/engine.py:100` | wrong | Event-driven is supported; source does not establish vectorized execution. |
| Part 2 library (600) | “decimal portfolio accounting, chronological train/test splits, and overfitting detection reports” | vektor | `backend/app/portfolio/accounting.py:1,14`; `backend/app/backtest/optimization.py:49,69,80` | verified | — |

## Flag threshold summary

| Flag | Source rule | Verdict |
|---|---|---|
| `return_reversal` | Train return `> 0` and test return `<= 0` | verified |
| `sharpe_decay` | Train Sharpe defined and `> 0`; test Sharpe undefined or `< train / 2` | Lesson omits positive/defined-train guard |
| `few_trades` | Training closed trades `< 5` | verified |
| `edge_of_grid` | Selected parameter equals an endpoint for a grid dimension with at least two values | verified |
| `many_candidates` | Candidate count `> 50` | verified |
