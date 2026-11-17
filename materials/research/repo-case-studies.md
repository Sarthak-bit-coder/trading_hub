# Trading project case studies

Local repositories were read in place at `C:/Users/brijb/Documents/trading_hub/materials/external_repos`; no files were changed. Line references use paths relative to each repository root. Retrieval date: 2026-11-17.

## Ledger-Stock-Market

**Purpose:** MIT desktop pretend-money stock-market game for children and teens. See `README.md:1-8`.

**Architecture:** Pygame desktop UI and lessons → local game/account state and simulated market → isolated safety helpers; optional Google sign-in. No production trading service.

**Data sources:** `Ledger Game.py:2336-2360` uses Yahoo Finance chart URL; `Ledger Game.py:2521-2536` uses Yahoo search/news URL. README claims live-updating prices. These URLs are visible in source, not documented market-data APIs; do not reproduce them in the new app.

**Algorithms:** simulated market motion, pretend-money trading, scam and bias learning games; not a research backtest. `ledger_safety.py:1-5` separates pure safety helpers for testing.

**Tests:** README’s `tests/` unittest suite; tests are present for safety and game behavior. Reproduce safety quizzes and simulated-only exercises, not its data transport.

**Learner can reproduce:** lesson-card interaction, scam spotting, bias reflection, and a deterministic toy market.

**License:** MIT (`LICENSE`).

## RiskLens

**Purpose:** MIT Streamlit portfolio risk analyzer; no separate service layer. `README.md` describes holdings, risk metrics, scenarios, volatility estimates, optimization, and report export.

**Architecture:** Streamlit `app.py` → `risklens` Python package → yfinance and Ken French factor downloads → pandas/numpy analytics → downloadable reports. README states there is no database/backend.

**Data sources:** `src/risklens/data.py:1-3` identifies the sole network boundary. `src/risklens/data.py:14` imports yfinance; `src/risklens/data.py:143-192` parse/download Ken French factor CSVs; lines 206 onward retrieve sector/country metadata.

**Algorithms:** returns and rebalancing, annualized return/volatility/Sharpe, max drawdown, VaR/CVaR and VaR backtest, EWMA/GARCH, Monte Carlo normal/Student-t/bootstrap, Fama-French regressions, risk attribution, HHI concentration, efficient frontier.

**Tests:** `tests/test_metrics.py`, `test_drawdown.py`, `test_engine.py`, `test_tail_risk.py`, `test_factor_data.py`, `test_optimization.py`, plus regression and input tests. Tests target calculations, validation, and regressions.

**Learner can reproduce:** a single-portfolio risk report with explicit return alignment, costs, sample-size caveats, and benchmark comparison.

**License:** MIT (`LICENSE`).

## Rotation-Index

**Purpose:** NBA player lineup-impact model. **This is a sports model, not a market model.** README identifies NBA lineup impact.

**Architecture:** NBA play-by-play and pinned game manifest → parser/cache/lineage validation → full-season audit gate → possession-level ridge model with game holdout → local Flask dashboard and diagnostics. Legacy lineup-total model is a separate fallback.

**Data sources:** `README.md` Phase 1 identifies `possessions_loader.py`, `pbpstats`, and public `pbpstats.com` API via legacy `data_loader.py`. `possessions_loader.py:1` documents resumable 2025–26 possession cache; `app.py:48` reads cached pbpstats play-by-play; README says current model inputs must pass the manifest gate.

**Algorithms:** adjusted plus-minus style possession regression with ridge penalty selected using game holdout; separate offense/defense effects; holdout errors compared to training-mean baseline; stability diagnostics. Do not call coefficients causal.

**Tests:** `test_possession_model.py`, `test_possessions_offline.py`, `test_possessions_download.py`, `test_season_isolation.py`, `test_storage_preflight.py`, `test_model.py`, and dashboard tests.

**Learner can reproduce:** ridge regression, grouping-aware chronological/game holdouts, baseline comparison, input lineage, and fail-closed publication gates. These transfer to market ML methodology, but NBA records do not teach market prediction.

**License:** MIT (`LICENSE`).

## vektor

**Purpose:** local-first paper-only market research dashboard for historical prices, portfolios, backtests, comparisons, and bounded parameter optimization. No brokerage or live orders.

**Architecture:** Next.js/React browser → typed HTTP API → FastAPI/Pydantic → portfolio and backtest services → validated market-data service and SQLite cache/storage → Yahoo Finance through yfinance. Optional Anthropic interpretation runs in backend and reads measured facts.

**Data sources:** `README.md` Tech Stack identifies Yahoo Finance via yfinance and SQLite. `backend/app/market_data/normalize.py:1` validates provider OHLCV; `backend/app/market_data/service.py:1-6` documents bounded fetch, cache, and same-symbol request coalescing. AI is optional and separate from financial arithmetic.

**Algorithms:** buy-and-hold, SMA crossover, Wilder RSI; bar-by-bar next-open fill simulation with Decimal, fees and slippage (`backend/app/backtest/engine.py:1-10`); portfolio return/risk analytics; grid optimization ranked on training data then chronological holdout; measured-fact-grounded optional AI explanations.

**Tests:** backend pytest suite covers API contracts, market data, backtest engine, storage, and AI grounding; frontend Node tests cover API, chart, accessibility, and UI behavior. See `backend/tests/` and `frontend/tests/`.

**Learner can reproduce:** typed API boundaries, price validation/caching, paper accounting, no-lookahead backtests, train/holdout discipline, and AI as commentary rather than authority.

**License:** No license file or explicit license declaration found in the clone as of 2026-11-17. All rights remain reserved by default. Read and describe only; do not copy its code, assets, or substantial prose.
