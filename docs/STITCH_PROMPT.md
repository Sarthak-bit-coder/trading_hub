# Google Stitch prompt: Trading Research Academy redesign

How to use: paste the **Global brief** into Stitch first (web, desktop + mobile). Then generate each **screen prompt** one at a time in the same project so the design system carries over. Ignore the current app's palette and layout; keep its content and navigation.

References were not pulled from Mobbin (its connector needs a paid plan). Good public references to show Stitch as screenshots: Linear (calm density), Stripe Docs (reading layout), Duolingo (lesson progress and quiz feedback), Robinhood and Public (order ticket clarity), TradingView (chart chrome).

---

## Global brief

Design a web app called **Trading Research Academy**: a calm, professional learning and research workspace that teaches the whole market (stocks, ETFs, bonds and rates, crypto, options basics) and lets learners practice with paper money and backtests. It is not a broker and never shows real orders or buy/sell signals. It should feel like a serious study tool for an adult learner, not a flashy trading app and not an AI-generated template.

**Tone:** calm, precise, trustworthy, quietly encouraging. Think a well-made textbook crossed with Linear.

**Layout:** left sidebar (collapsible to icons; becomes a bottom tab bar plus a "More" sheet on mobile) with three groups:
- **Learn:** Start here, Course map, Lesson reader, Assessments, Glossary & search, Review notebook, Study planner, Learning assist.
- **Practice:** Exposure explorer, Risk sizing, Order practice, Pre-trade checklist, Paper trading lab, Trading journal, Product passport.
- **Research:** Strategy workspace, Backtesting lab, Building a Trading Bot, Research inbox, Research journal, Resource library, Data library.
- Footer item: Data & settings. Top bar: breadcrumb, global search (Cmd/Ctrl+K), light/dark toggle, streak and progress chip.

**Visual system:**
- Neutral warm-gray surfaces with one deep teal accent. Green and red only for profit/loss and correct/incorrect, never decoration. Every color pair passes WCAG AA in light and dark mode.
- Type: a humanist sans for UI (Inter or Source Sans 3), a serif for long lesson text (Source Serif 4), a mono for numbers and code (JetBrains Mono, tabular figures). Numbers are right-aligned in tables.
- 8px spacing grid, 12px radius cards, 1px hairline borders instead of heavy shadows.
- A persistent amber **SYNTHETIC** or **PAPER** badge wherever prices are simulated. It must never look like live market data.
- Every result panel starts with a small "Assumptions" strip (data source, fees, slippage, dates) before the numbers.

**Motion (subtle and purposeful, 150-250 ms, ease-out; all disabled under prefers-reduced-motion):**
- Page transitions: content fades and rises 8px; the sidebar stays still.
- Progress rings and bars animate from the previous value to the new one when a lesson or quiz finishes.
- Quiz: a wrong answer gently shakes once; a right one fills with a soft check; the explanation slides open below.
- Charts draw their line left to right on first load; the crosshair follows the pointer with an OHLC tooltip.
- Order ticket: fee, risk and reward previews count up to new values as inputs change; a paper fill shows a brief ripple on the position row.
- Changed numbers in tables flash a faint background for 600 ms, then settle.
- Skeleton shimmer while a dataset or backtest loads, with a cancel button for long jobs.

**Accessibility:** everything keyboard reachable, visible focus rings, 44px touch targets on mobile, every chart has a data-table toggle, no information carried by color alone.

---

## Screen prompts

1. **Start here (home).** Greeting with the learner's display name, a "Continue lesson" hero card with a progress ring, today's review queue (spaced-repetition cards due), a course progress strip across all parts, recent journal entries, and a quiet safety note ("Educational. Paper only."). Mobile: hero card first, then the review queue.

2. **Course map.** Parts as horizontal tracks: Part 1 Foundations through Part 5 Discipline, plus new tracks Bonds & Rates, Crypto Markets, Options Basics, ML for Markets, and Building a Trading Bot. Each lesson is a node with states: locked, available, in progress, mastered. Hover shows the objective and time estimate.

3. **Lesson reader.** Reading column of about 70 characters in the serif face, with KaTeX math inline and in display blocks. Sticky right rail: section outline, notes, bookmarks. Sections: Objective, Explanation, Worked example (numbers in a mono card), Common mistakes, Assignment, Quiz, Mastery checkpoint. The quiz shows one question per card with immediate feedback and an explanation. A "teach-back" text box closes the lesson.

4. **Building a Trading Bot (case-study track).** A pipeline diagram across the top: Data, Signal, Sizing & risk, Execution, Accounting, Monitoring. Each stage opens a case-study panel for one of the author's projects (vektor, RiskLens, Rotation-Index, Ledger): where the data comes from, how it is cleaned, the core math, tests, and limits. Code excerpts sit in collapsible mono blocks with a license tag.

5. **Paper trading lab.** Left: watchlist with SYNTHETIC price badges and sparklines. Center: candlestick chart with zoom, pan and crosshair. Right: order ticket with symbol, side, quantity, optional stop-loss and take-profit, fee and slippage preview, a risk:reward bar, a cash check, and a large "Place paper order" button. Below: positions and orders tables, and an equity curve with a drawdown band. Mobile: chart on top, ticket as a bottom sheet.

6. **Backtesting lab.** A step header: 1 Data, 2 Strategy, 3 Assumptions, 4 Results. Strategy picker cards (SMA cross, RSI(2), Donchian breakout, time-series momentum) with parameter forms. Results: equity vs buy-and-hold chart; metrics grid (CAGR, Sharpe, Sortino, max drawdown, exposure, with "undefined" shown honestly); a trade ledger where each row expands into a plain-English "why this trade" explanation; a Monte Carlo band; an overfitting panel with flags and a trial counter. The locked holdout is a padlocked card with a one-time "Reveal test" action.

7. **Trading journal.** Table and card views; filters by setup, outcome and emotion tag; an entry drawer with a rule-adherence checklist and a bias radar (FOMO, revenge trading, loss aversion).

8. **Glossary & search.** Command-palette style search across lessons, glossary and resources, with grouped results and keyboard navigation.

9. **Data & settings.** Backup and restore (JSON), CSV exports, theme, display name, a data-source registry with license and attestation status, and a red-outlined "Reset local data" zone with a confirm step.

Deliver desktop (1440px) and mobile (390px) frames for each screen, plus a component sheet: buttons, inputs, tabs, badges (SYNTHETIC, PAPER, UNVERIFIED), metric tiles, tables, quiz card, and chart chrome.
