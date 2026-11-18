# Design rules for the revised Trading Research Academy screens

The Stitch export reads as AI-made. Every revised screen must fix these problems.

## Remove
- Invented jargon and pseudo-precision: "analytical pipeline is calibrated", "Volatility Damping Efficiency 1.68x", "Capacity ceiling ~$25.0M", "Engine tick #892,104 LIVE", "DSR 88.4% SAFE", "optimal recall trigger based on exponential forgetting curves".
- Vanity metrics with no source: retention %, "Paper Sharpe", streak counters, fire emoji, XP.
- An uppercase letter-spaced micro-label on every card. Use at most one small grey label per card, in sentence case.
- A badge or pill on every element. The only badges allowed: SYNTHETIC (amber, `.tag.synthetic`), REAL DATA (green, `.tag.real`), and a plain neutral `.tag` for a single status.
- Features the app does not have: short selling, margin and leverage, Level 2 order book, intraday 5m/15m/1h bars, CRSP data, "clone specification", "export TeX".
- Fake people ("Alex M."), and fake dataset or journal citations.
- Contradictions, for example "100% cash" next to "margin committed 40.8%".
- Wrong breadcrumbs: every screen must show its own path, for example "Practice / Paper trading lab".

## Keep
- Warm neutral background, white panels, 1px hairline borders, deep teal accent `#0d6e6e`, green and red only for profit/loss.
- Inter for all UI text and headings (standard fonts, no serif), JetBrains Mono only for numbers and code. Content sits in card boxes with 1px borders.
- Motion: cards fade and rise once on load, small hover lift; all off under prefers-reduced-motion.
- Honest, plain copy that matches the real app: Lessons 1-20 in Parts 1-5; paper trading is long-only, cash-only and daily; prices are SYNTHETIC unless loaded from Alpha Vantage, Kraken or CoinGecko (REAL DATA).
- Right-aligned numbers in tables, tabular figures.

## Structure
- `base.css` holds every style. Add a class there only if no existing class fits.
- Each page lives in `src/<name>.html`, starts with `<!--HEIGHT:NNNN-->` (the render height) and puts `<!--SIDEBAR:<key>-->` where the sidebar goes. Sidebar keys: home, course, lesson, assessments, glossary, review, study, assist, exposure, risk, orders, pretrade, paper, journal, passport, strategy, backtest, bot, inbox, rjournal, resources, data, settings.
- Do NOT edit base.css, sidebar.html or build.cjs (other agents share them). Put page-only styles in a <style> block in the page head.
- Render with `node build.cjs <name>`, which writes `png/<name>.png`.
- Use `src/home.html` as the reference for tone and density.
