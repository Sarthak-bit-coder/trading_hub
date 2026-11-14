# trading_hub — Master Plan (planner: Claude · executors: Antigravity, Codex, Grok)

Put this file at `materials/MASTER_PLAN.md`. It is the single source of truth for what to change and in what order. Agents follow the task IDs below. Sarthak relays each agent's report back to the planner, who reviews it and issues the next task.

Status of the audit: I read every file in `app/`, the docs, CSVs, data JSON, and the project READMEs, and ran the code. I did **not** read the source of the three `external_repos` (Rotation-Index, RiskLens, vektor); every claim the lessons make about them is unverified (see task C-1). Items marked **[verified]** were reproduced by running code. Items marked **[by reading]** come from reading the source and were not run.

Baseline: all syntax checks pass; 24/24 tests pass (6 engine + 18 calculations).

## Status log (planner keeps this current; newest last)
- 2026-11-13: **P0-0 done.** Baseline commit `fa40c27` is on GitHub `main` (`.gitignore` ignores `materials/external_repos/`). Tag `baseline-2026-11-13` to be placed on that commit.
- 2026-11-13: ponytail and caveman installed for Antigravity and Codex (Codex's caveman hook still awaits trust, see note below). Grok did not get past the install step.
- 2026-11-13: **Grok is out of credits.** Its tasks (P0-6, P2-2) are parked. P0-6 does not block anything. If Grok stays unavailable, Antigravity absorbs the chart work in P1-7 and Codex absorbs the tick simulator in P2-2.
- 2026-11-13: Antigravity's skill installs added ~233 third-party files (`.agents/`, `.claude/`, `.gemini/`, `agent/`) inside the project. They stay out of git (see `.gitignore`); commits must only contain project files.
- Agents began from the first version of the kickoff prompt, before this plan existed. From now on they follow the task IDs here.
- Next up: **P0-1 (Codex)** on branch `codex/p0-1`. Antigravity is on hold for P0-3 and writes `docs/MODULE_SPLIT.md` only.

---

## 1. Verdict

**Strong:** the educational framing and honesty are excellent (no fake data, clear limits, no-look-ahead rule, formula-injection guard, escaped HTML, localhost-only server). The engine's core fill logic is correct and tested. The math library is a good base.

**Weak:**
1. The data-safety layer has real bugs (backup restore breaks for Part 2, reset doesn't fully reset).
2. Part 2 lessons will render badly (LaTeX not supported) and contain several numeric errors.
3. The quizzes are guessable (the answer is the 2nd option about 90% of the time).
4. The backtest lab is a single hard-coded rule. It cannot yet teach what the course teaches (optimization, overfitting, walk-forward).
5. The paper-trading overhaul is not started in the UI; only the math exists.
6. `app.js` is one 71 KB file with onclick handlers everywhere, which three agents cannot safely edit in parallel.
7. Repo hygiene: all Part 2 work is uncommitted, there is no `.gitignore`, and three nested `.git` folders sit inside `materials/`.

---

## 2. Confirmed findings

### Severity HIGH
| ID | Finding | Where | Evidence | Fix |
|---|---|---|---|---|
| B1 | **Backup restore rejects any progress on Part 2.** Validator only allows lesson numbers 1-4. Reading Lesson 5 adds `5` to `read`, so the next backup fails "Invalid format". | `app/math.js` `validateBackup` (lines ~35, 45) | **[verified]** `read:[5]` → false, `mastered:[8]` → false, `savedQuestions` lesson 6 → false | Use a `LESSON_COUNT = 8` constant (1-8). Bump backup `version` to 2, accept 1 and 2, migrate 1→2. Test: round-trip a backup containing lessons 5-8. |
| B2 | **Default state arrays are shared and get mutated.** `loadState` does `{...defaults,...saved}` (shallow), so `state.read.push()`, `journal.unshift()`, `notes[n]=` mutate `initial`. "Reset local data" then restores the mutated `initial`, so entries survive a reset in the same session. | `app/math.js` `loadState`; `app/app.js` `resetData`, `restore` | **[verified]** after edits, `initial` = `{"read":[5],"journal":[{"a":1}],...}` | Deep-clone defaults (`structuredClone(initial)`) in load, reset and restore. Test it. |
| B9 | **Part 2 lessons use LaTeX; the renderer can't show it.** ~130 inline `$...$` and 23 `$$...$$` blocks print as raw text. The renderer also flattens nested bullets, closes `<ol>` with `</ul>`, and prints `---` as text. | `app/app.js` `md()`; `app/content/part-2-quant-strategies.md` | **[verified]** counts by grep; **[by reading]** renderer | Needs Sarthak's decision (see section 6, D1). Recommended: vendor KaTeX locally (static files, no CDN, no build). Also fix `md()` lists, nested bullets, `---`, and tables. |
| B10 | **Quiz answers are guessable.** Correct option is the 2nd choice in 23/25 lesson-quiz questions, 7/8 order scenarios, 5/6 assessment questions. | `app/app.js` `quizzes`, `scenarios`, `assessQ` | **[verified]** by script | Shuffle options at render time (keep a correct-answer mapping). Add a test that the shuffle keeps the right answer. |

### Severity MEDIUM
| ID | Finding | Where | Evidence | Fix |
|---|---|---|---|---|
| B3 | **CSV exports turn negative numbers into text.** The formula-injection guard prefixes any cell starting with `-`, so `-625` exports as `'-625`. Losses become text in Excel/Sheets. | `engine.js` `csv()`; `app.js` `escapeCsv` | **[verified]** `"'-625"` | Only guard non-numeric strings; export real numbers raw. Keep guarding `=`, `+`, `@`, tab, CR, and `-` followed by a non-digit. Test both. |
| B5 | **The "untouched test" isn't held out.** The first run computes and displays all three partitions, including the "untouched test 20%", then marks the holdout "consumed". `testConsumed` is one global flag, not per dataset. | `backtest/ui.js` `btRun`, `btSplitReport` | **[by reading]** | Real lock: run on development+validation only; require an explicit one-time "Reveal test" action per dataset hash; record it in the experiment log. Make `testConsumed` per dataset hash. |
| B7 | **Risk outputs can mislead.** `parametricVaR` returns `$0` on invalid input (tests even enforce it) and silently uses 95% for any confidence other than 90/95/99. `targetVolSize` has no leverage cap: a 2.5%-vol asset at 15% target returns 6x leverage. | `app/math.js` | **[verified]** | Return `errors` like `sizeLong` does; reject unsupported confidence; add `maxLeverage` (default 1) and a `capped` flag. Update the tests. |
| B4 | **Replay mode will crash or crawl on big files.** `Math.min(...vals)` spreads every bar into arguments (a 15 MB CSV is ~400k rows) and the volume scale recomputes the max inside a loop (O(n²)). | `backtest/ui.js` `renderBtChart` | **[by reading]** | Use loops or `reduce`; compute max once; downsample or use canvas for large ranges. |
| B12 | **README promises features that aren't wired.** It says every lesson has flashcards, deterministic calculations, scenario prompts and teach-back. `toggleFlashcard`, `gradeCalculation`, `gradeScenario`, `saveTeachback` exist but nothing calls them. `resourcePage` and `searchCourse` are defined twice (the `ui.js` copy silently overrides `app.js`). | `app.js`, `backtest/ui.js`, `README.md` | **[verified]** reference counts | Either wire them into the lesson page (recommended, see A-5) or delete them and fix the README. Remove duplicates. |
| B11 | **Quiz text lives in two places.** Quiz/answer text is hard-coded in `app.js` and also in the lesson markdown (which the reader hides). Course search can show answers. | `app.js`, `content/*.md` | **[by reading]** | One source of truth (parse `### Quiz/### Answers` from the markdown, or move quizzes to `data/quizzes.json`). Exclude Answers from search. |

### Severity LOW
| ID | Finding | Evidence | Fix |
|---|---|---|---|
| B6 | Engine: equity series has a duplicate first point (9 points for 8 bars, same timestamp). Reported `fees` for an open position include a hypothetical exit fee that is not deducted from equity (29.85 reported vs 12.44 deducted). | **[verified]** | Drop the pre-loop equity push; report only fees actually charged, and show "estimated exit cost" separately. |
| B8 | `loadState` with a stored string (e.g. `"abc"`) spreads it into `{0:'a',...}`. | **[verified]** | Only merge plain objects. |
| B13 | CSV importer: no UTF-8 BOM strip (Excel exports; header `﻿date` would fail), no `Adj Close` choice (Yahoo CSVs have both `Close` and `Adj Close`; importer silently uses `Close`), no semicolon delimiter, no ragged-row message. Timeframe and timezone dropdowns are labels only. | **[by reading]** (BOM test passed; JS `trim` handled it. Still add an explicit test.) | Add a column-mapping step (choose price column), delimiter detection, row-length errors. |
| B14 | Server: JSON files are served as `application/octet-stream`; no `Content-Security-Policy`. Inline `onclick` handlers block a strict CSP. | **[by reading]** | Add `.json` type. After the module split, switch to `addEventListener` / `data-action` delegation, then add CSP. |
| B15 | Home page: hard-coded name; the mastery counter shows `/4` but counts mastered lessons from both parts; Course map nav badge says `4`. | **[by reading]** | Count per part. |
| B16 | Paper lab still on the old model: `prompt()` for quantity, `paperPositions` duplicates `calcPositions`, watchlist `category`/`vol` unused, leftover `window._paperTickTimer` with no code behind it. Roadmap lists it as active (correct) but nothing in the UI exists yet. | **[by reading]** | Task D-1. |
| B17 | `search` shows "Part 1 course material · line N" for every hit, even Part 2; the line number is meaningless. | **[by reading]** | Show lesson + heading instead. |

### Repo hygiene (do this first)
| ID | Finding | Fix |
|---|---|---|
| H1 | Only 1 commit; 6 modified + 3 untracked files (all Part 2 work, both new docs) are uncommitted. | Commit now as "baseline", tag `baseline-2026-11-13`. |
| H2 | No `.gitignore`. | Add: `node_modules/`, `.DS_Store`, `*.log`, `.env*`, `materials/external_repos/`. |
| H3 | `materials/external_repos/` (27 MB, 3 repos) each contain their own `.git`. Committing them creates embedded repos. | Untrack them; keep a `materials/external_repos.md` listing repo URL + commit hash, re-clone on demand. |
| H4 | **License:** Rotation-Index and RiskLens ship a LICENSE file; **vektor has none** in the clone. | Never copy vektor code. Re-implement from the concepts (the course already only references function names). Note this in the README. |
| H5 | Duplicate files: `materials/Trading_Course_MATERIALS_ONLY.zip` repeats loose files; CSV schemas differ between `materials/*.csv` and `app/data/*.csv` (e.g. `strategy_version` vs `setup_version`, `rule_adherence` vs `rule_followed`). | Pick `app/data/` as canonical; document the mapping. |
| H6 | Roadmap says "calculations 17→24 tests"; the real split is 18 calculations + 6 engine = 24 total. Roadmap lists Part 2 as "to do" but it exists in draft. | Refresh the roadmap after each phase. |

### Course content: fact-check results (Part 2)
Computed independently. **Correct:** Lesson 6 Cornish-Fisher 95% math (z_CF ≈ -1.762, Normal VaR 2.417%, CF VaR 2.593%, +$176), vol-target example (0.504 weight, ~$1,307). Lesson 5 ratios (0.714, 0.567, 0.557, -0.5).
**Wrong or shaky:**
| ID | Lesson | Problem | Correct value / fix |
|---|---|---|---|
| C-a | 6 | 99% CF quantile stated as **-2.985**; and "over $1,100/day" gap. | With the same s=-0.70, k=3.60: z_CF(99%) ≈ **-3.498**; 99% VaR $3,440 (normal) vs $5,197 (CF), gap ≈ **$1,758**. |
| C-b | 7 | Sell fill 41.958 "→ $41.95". Cent rounding gives **$41.96**, so the downstream numbers change. | Notional $4,196.00, fee $3.10, proceeds $4,192.90, cash $9,184.40, realized loss **-$815.60**, drawdown **8.16%**. |
| C-c | 8 | Sharpe formula `(Rp-Rf)/σp · √252` is wrong when Rp and σp are already annualized. `√252` applies to a *daily* mean/σ ratio. | Show the daily form, or drop √252 for annualized inputs. |
| C-d | 8 | "Testing 100 variants gives an illusory Sharpe of 3.03" mixes units: √(2 ln N) is the expected max of N standard-normal z-scores, not an annualized Sharpe. | Say "in standard-error units" and tie it to sample length. |
| C-e | 8 | Worked example says "daily Bitcoin data, 4-year calendar, 1,000 bars". BTC trades every day, so 1,000 bars ≈ 2.7 years; and 750 train bars ≠ 2021-2023. | Make bars and dates consistent. |
| C-f | 5 | "Sharpe-style" score divides a **6-month** excess return by **annualized** volatility. The ranking is unaffected but the numbers aren't Sharpe ratios. Also: "compound return compounding" typo; 12 × 4.5% should be compounded. | Scale σ to the period (σ·√0.5) or annualize the return. |
| C-g | 7 + quiz | Lesson and quiz say the paper engine uses `Decimal`; our app uses JS floats. | Add a note, and build the integer-cents ledger in task D-1 so the lesson becomes true. |
| C-1 | all | Every statement about `vektor`, `RiskLens`, `Rotation-Index` code (function names, the five overfitting flags, thresholds) is **unverified**. | Codex checks each against the cloned sources and records pass/fail. |

---

## 3. Backtest lab: what to change (design)

Goal: one correct engine that can run many strategies, report honest metrics, and make overfitting visible. Keep scope to **U.S. stocks/ETFs and spot crypto**. Other asset types stay "not implemented".

**3.1 Engine (Codex)**
- Strategy interface: `strategy = {id, version, params, schema, signal(ctx) -> 'buy'|'sell'|null}` where `ctx` only exposes bars up to and including the current bar. Make look-ahead impossible by construction (pass a frozen slice or accessor, not the full array).
- Ship four rules that match the curated resource library: SMA cross, RSI(2) mean reversion, Donchian breakout, time-series momentum (with cash filter).
- Stops/targets with the conservative policy: gap exits fill at the open; if stop and target are both inside one bar, assume the stop hit first and flag the ambiguity.
- Sizing from planned loss, reusing `sizeLong`. Shorts later, only with a borrow-cost input.
- Fix B6. Add invariants tests: final equity = start + Σ net P/L + unrealized − costs; no fill price outside the bar's [low, high]; no trade timestamp before its signal.
- Seeded PRNG (`mulberry32`) for anything random, so tests and Monte Carlo are reproducible. Replace the unseeded `Math.random` in `simulatePriceTick` (inject an RNG).

**3.2 Metrics (Codex)**
CAGR, annualized volatility, Sharpe/Sortino/Calmar computed from per-bar equity returns with an explicit annualization factor (252 for equities, 365 for crypto, stated in the report), exposure %, average and max holding time, longest drawdown duration, best/worst trade, Monte Carlo shuffle of trade order (seeded, 1,000 runs, show the 5th-95th percentile band). Undefined ratios stay labeled "undefined".

**3.3 Validation workflow (Codex logic, Antigravity UI)**
1. Locked holdout (B5).
2. Parameter grid with a visible **trial counter** persisted per dataset hash. The count can only go up.
3. Overfitting report implementing the five flags from Lesson 8 (`return_reversal`, `sharpe_decay`, `few_trades`, `edge_of_grid`, `many_candidates`), plus a deflated-Sharpe-style warning that scales with the trial count.
4. Walk-forward (rolling train/test windows, splice OOS equity, report walk-forward efficiency).
5. Cost sensitivity sweep (0×, 1×, 2×, 4× costs) instead of only 2×.

**3.4 Data layer (Codex)**
- Importer hardening (B13): column mapping, `Adj Close` choice recorded in provenance, delimiter detection, explicit BOM handling and tests.
- Per-dataset registry: id = SHA-256, source, license/usage attestation, coverage, adjustment policy. Optional IndexedDB persistence so a dataset survives reload (opt-in, local only).
- One external adapter at a time, only after Sarthak approves (see D2). Verify current terms and limits first, no scraping, no keys in code.
- A clearly labeled **synthetic data generator** (seeded GBM, with a visible "SYNTHETIC" watermark and name) for demos and tests. It must never be called market data.

**3.5 UI (Antigravity) and charts (Grok)**
- Strategy picker with a parameter form generated from `schema`; show assumptions before results.
- Chart: draw the indicator (SMA etc.) and entry/exit markers, equity vs benchmark overlay, date axis, zoom/pan, crosshair. Use canvas for >2,000 bars. Fix B4.
- Run long jobs (grid, walk-forward, Monte Carlo) in a Web Worker with progress and cancel. `engine.js` is already a plain IIFE, so `importScripts` works.
- Explain-this-trade: each ledger row gets a plain-English, deterministic explanation ("SMA(5) crossed above at close of Jan 5; order filled at next open 4.00 plus 2 bps slippage; size = 25% of cash"). No AI needed. This is the best "learn how the bot thinks" feature.

---

## 4. Paper-trading lab overhaul (roadmap item 1)

- Replace `prompt()` with an order ticket: symbol, side, quantity, optional SL and TP, fee preview (`calcTradeFriction`), and R:R preview (`calcRiskReward`).
- Use `calcPositions` as the only position engine; delete `paperPositions`.
- Integer-cents ledger (store money as integer cents or BigInt) so Lesson 7's "cent conservation" is true in this app. Full-liquidation removes the exact remaining basis.
- Tick simulation: seeded GBM from `simulatePriceTick`, user-set volatility per symbol, play/pause/step. **Every price must be labeled SYNTHETIC** with a persistent badge; it is not market data. SL/TP evaluated per tick; gaps fill at the new price, not the stop price.
- Risk dashboard: add `cornishFisherVaR`, `cvar`, `ewmaVol` (λ=0.94) to `math.js`, with tests that reproduce the Lesson 6 numbers exactly (2.417%, 2.593%, z_CF -1.762 for 95%; and the corrected 99% values). Show VaR, CVaR, notional/equity, max drawdown (`maxDrawdown`), and target-vol sizing with the leverage cap.
- Keep paper and any user-entered "live" journal separate. No broker keys or real orders.

---

## 5. Quant data and learning how the bot works

**5.1 Data library page (Antigravity UI, Codex logic).** One screen listing every dataset: source, license, coverage, hash, adjustment policy, and which lessons/assignments use it. Lesson 5's assignment needs monthly SPY/TLT/GLD/BTC closes and Lesson 6 needs ~100 return observations; the page tells the learner exactly which CSV to bring and where it can legally come from.

**5.2 "How a trading bot works" (Antigravity drafts, Codex fact-checks).**
Pipeline diagram: data → signal → sizing and risk → execution → portfolio accounting → monitoring, each box linked to our file (`engine.js` signal and fills, `math.js` sizing and VaR, paper lab execution and accounting). Add the parts a *live* bot needs that a backtest hides: scheduler loop, data-feed failure handling, state persistence, idempotent orders, kill switch, max-daily-loss and position limits, audit log. Close with the honest message that most simple strategies do not beat buy-and-hold after costs, so the goal is process, not profit.

**5.3 Python parity track (Codex).** `materials/python/parity_sma.py` (about 50 lines, stdlib only or pandas) runs the same SMA rule on the same CSV; `materials/python/compare.mjs` runs `engine.js` and diffs trades and P&L to the cent. Mismatches are reported as bugs on one side. Add a `quant_study/` folder with one short script per lesson that rebuilds the worked example (Lesson 6 CF VaR script must reproduce the corrected numbers).

**5.4 Study path (course "Start Here").** Part 1 → Lesson 7 → Lesson 6 → Lesson 8 → Lesson 5. Each lesson page gets one required prompt: "write one sentence on what could make this result misleading". Wire up the existing flashcard/calculation/teach-back functions (B12).

**5.5 Bot roadmap (stages, each needs Sarthak's approval to start).**
- Bot v0: offline, daily bars from CSV, the strategy emits an "orders.csv" that a human reviews. No broker.
- Bot v1: forward paper run on new daily data with simulated fills; daily report; kill-switch rules tested.
- Later: broker paper API only with explicit approval. Real money is out of scope.

---

## 6. Decisions needed from Sarthak

- **D1: Math rendering.** Vendor KaTeX (static files copied into `app/vendor/katex/`, no CDN, no build step) **or** rewrite every formula in plain text. Planner recommends KaTeX (small, local, standard). This is an exception to "zero dependencies".
- **D2: First external data source.** Recommended order: Stooq CSV download (stocks/ETFs), Binance public data (crypto, no key), FRED (rates). Verify current terms before use. Which first?
- **D3: ES modules + data-action event handlers.** This removes inline `onclick` and enables a strict CSP, but touches every view. Recommended, done once in Phase 0.
- **D4: IndexedDB persistence for datasets** (opt-in)? Recommended yes.
- **D5: Annualization for crypto** (365) vs stocks (252). Recommended: per-dataset setting, default by asset type.

---

## 7. Work breakdown (task IDs, owners, order)

Branch naming: `<agent>/<task-id>`; small commits; each merge requires a review by a *different* agent (Codex reviews Antigravity and Grok; Antigravity reviews Codex's UI-facing changes). Nobody edits another lane's files without telling Sarthak. After every merge run:
`node --check app/app.js app/backtest/engine.js app/backtest/ui.js` (each file) and both `node --test` commands.

### Phase 0: foundation (finish before anything else)
| Task | Owner | Depends on | Done when |
|---|---|---|---|
| P0-0 | Sarthak (or Codex) | none | Baseline committed and tagged; `.gitignore` added; `external_repos/` untracked with a pinned-commit list (H1-H3). |
| P0-1 | **Codex** | P0-0 | B1, B2, B3, B6, B7, B8 fixed in `math.js` / `engine.js`, each with a failing-first test; backup v2 with 1→2 migration; seeded RNG injection. 24 → ~40 tests, all green. |
| P0-2 | **Codex** | P0-1 | Content fixes C-a…C-f applied; new tests reproduce the corrected Lesson 6 and Lesson 7 numbers; C-1 report (each repo claim: verified / wrong / unverifiable) saved as `materials/FACTCHECK.md`. |
| P0-3 | **Antigravity** | P0-1 | `app.js` split into ES modules (views, state, render helpers, quiz, journal, paper, settings); inline `onclick` replaced with `data-action` delegation; duplicates and dead code removed or wired (B12); home counters fixed (B15). Behavior identical: manual click-through of every nav page, at desktop and phone width, no console errors. |
| P0-4 | **Antigravity** | P0-3, D1 | `md()` rewritten: nested lists, ol/ul, `---`, tables, math via KaTeX (or plain-text formulas per D1). Lessons 5-8 look right in a browser. |
| P0-5 | **Antigravity** | P0-3 | Quizzes: shuffled options, single source of truth (B10, B11), Answers excluded from search; search hits show lesson + heading (B17). |
| P0-6 | **Grok** | P0-3 | Prototype the canvas chart module (candles + overlay + markers + zoom/pan + downsampling) as a standalone `app/charts/chart.js` against a synthetic seeded dataset. Fixes B4. Handoff note for Codex review. |

### Phase 1: backtest lab
| Task | Owner | Depends on |
|---|---|---|
| P1-1 | **Codex** | P0-1: write `docs/CONTRACTS.md` first (strategy interface, result shape, metrics shape, dataset record). Antigravity and Grok code against it. |
| P1-2 | Codex | P1-1: strategy interface + 4 rules + stops/targets + invariants tests (3.1). |
| P1-3 | Codex | P1-2: metrics + seeded Monte Carlo (3.2). |
| P1-4 | Codex (logic) + Antigravity (UI) | P1-3: locked holdout, trial counter, grid search, five overfitting flags, walk-forward (3.3). |
| P1-5 | Codex | P1-1: importer hardening + dataset registry + synthetic generator (3.4). |
| P1-6 | Antigravity | P1-2: strategy picker and results UI; assumptions-before-results panel; explain-this-trade. |
| P1-7 | Grok | P0-6, P1-2: integrate chart module (indicator overlay, markers, equity vs benchmark); Web Worker runner with progress/cancel. |
| P1-8 | Codex | P1-2: Python parity script + compare tool (5.3). |

### Phase 2: paper lab and risk (after Phase 1 is merged)
| Task | Owner |
|---|---|
| P2-1 | Codex: integer-cents ledger, `cornishFisherVaR`/`cvar`/`ewmaVol`, tests that reproduce the lessons. |
| P2-2 | Grok: seeded tick simulator with SYNTHETIC labeling, SL/TP gap logic, play/pause/step; Codex reviews. |
| P2-3 | Antigravity: order ticket, positions table, risk dashboard, browser verification at phone width. |

### Phase 3: learning content
| Task | Owner |
|---|---|
| P3-1 | Antigravity drafts, Codex fact-checks: "How a trading bot works" page and diagram (5.2). |
| P3-2 | Antigravity: data library page (5.1); study path and required reflection prompt on each lesson (5.4). |
| P3-3 | Codex: `quant_study/` scripts (one per lesson, outputs match lesson numbers). |
| P3-4 | Antigravity drafts, Codex fact-checks: `materials/PROMPT_EXTRACT_AND_BUILD_BOT.md`. |

### Phase 4 (only on Sarthak's go-ahead): Bot v0 / v1 per 5.5.

---

## 8. Process rules for the agents

1. One task per thread at a time. Start by restating the task ID and listing the files you will touch.
2. Failing test first for every bug fix. Report test counts before and after.
3. Never mark a task done without running the checks. If something could not be run (e.g. no browser), say so.
4. Report format: **Done / Checked / Risks / Next** (see the kickoff prompt).
5. If you find a new problem, do not fix it silently. Add it under "Found while working" in your report with severity and evidence; the planner will re-prioritize.
6. Keep educational framing: no profitability claims, no fake data, every synthetic number labeled.
