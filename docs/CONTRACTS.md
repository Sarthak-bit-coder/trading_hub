# Backtest contracts

Contracts for the backtest engine, UI, and data layer. Bars use `{time, o, h, l, c, v}`: epoch-millisecond timestamp, open, high, low, close, and volume (`null` when absent).

## Strategy

A strategy has a stable `id`, semantic `version`, runtime `params`, parameter `schema`, and `signal(ctx)`. Signal returns `'buy'`, `'sell'`, or `null`.

```js
const strategy = {
  id: 'sma-cross',
  version: '1.0.0',
  params: { length: 5 },
  schema: { length: { type: 'integer', min: 2, default: 5 } },
  signal(ctx) {
    const bars = ctx.bars; // frozen bars through current bar only
    if (bars.length < this.params.length + 1) return null;
    const n = this.params.length;
    const mean = xs => xs.reduce((s, b) => s + b.c, 0) / n;
    const now = mean(bars.slice(-n));
    const prev = mean(bars.slice(-n - 1, -1));
    const bar = bars.at(-1), prior = bars.at(-2);
    if (prior.c <= prev && bar.c > now) return 'buy';
    if (prior.c >= prev && bar.c < now) return 'sell';
    return null;
  }
};
```

Engine calls `signal` once per bar, after that bar closes. Build `ctx.bars` as a new array containing only `bars.slice(0, i + 1)` and freeze both the array and its bar objects before calling. Never pass the source array, future bars, or a mutable view. This makes future bars unreachable to strategy code by construction. Orders fill no earlier than the next bar under the existing next-open execution model.

## Run result

`BacktestEngine.run()` currently returns these fields. Preserve names and meanings for compatibility:

```js
{
  barsCount, trades, equity, signals, openPosition,
  finalEquity, netPnl, benchmarkEquity, benchmarkPnl,
  maxDrawdown, winRate, expectancy, profitFactor,
  feeBps, slippageBps, smaLength, allocationPct, startEquity,
  fees, estimatedExitFee, unclosedSignal, unrealizedPnl
}
```

`trades` contain `entryTime`, `exitTime`, `entrySignalTime`, `entryPrice`, `exitPrice`, `quantity`, `grossPnl`, `fees`, `netPnl`, and `barsHeld`. `equity` points are `{time, value}`; `signals` are `{time, side}`. `openPosition` is `null` or `{quantity, entryTime, entryPrice, markPrice, entryFee, unrealizedPnl}`. `unclosedSignal` is `null` or the pending `{side, signalTime}`. `maxDrawdown` is a fraction. Ratio-like existing fields are `null` when unavailable.

New fields: none in this compatibility shape. Metrics below are a separate new result section; add it as `metrics` without removing or renaming current fields.

## Metrics (new: `metrics`)

Compute from per-bar equity returns. `annualizationFactor` is explicit: 252 for U.S. equity sessions, 365 for daily crypto bars, or another documented bars-per-year value. Do not infer it silently.

```js
{
  annualizationFactor: 252,
  cagr: 0.08,                 // fraction per year
  volatility: 0.16,           // annualized standard deviation
  sharpe: { value: 0.5, reason: null },
  sortino: { value: 0.7, reason: null },
  calmar: { value: 0.4, reason: null },
  exposure: 0.25,              // fraction of bars with open position
  maxDrawdown: 0.20,           // fraction, peak-to-trough
  longestDrawdownBars: 12      // bars from peak until recovery; ongoing drawdown ends at last bar
}
```

`value` is a number or `null`. Every undefined ratio uses `null` plus a short `reason`, such as `{value:null, reason:'No downside returns'}`. Apply this to CAGR, volatility, and each ratio when its inputs are undefined; never emit `NaN` or `Infinity`. Sharpe uses annualized mean excess return divided by annualized volatility; Sortino uses annualized mean excess return divided by annualized downside deviation; Calmar is CAGR divided by maximum drawdown. Risk-free rate defaults to zero and must be stated if changed. Drawdown duration counts bars after the peak through recovery; an unrecovered drawdown runs through the final bar.

## Dataset record (new)

`id` is the lowercase hex SHA-256 digest of the exact imported CSV bytes, before decoding or normalization. Same bytes mean same ID. Do not hash parsed bars.

```js
{
  id: '64-lowercase-hex-characters',
  source: 'User-provided CSV',
  licenseAttestation: { status: 'user-attested', text: 'I have rights to use this data.' },
  coverage: { start: 1735689600000, end: 1767139200000, bars: 253 },
  adjustmentPolicy: 'As supplied; Close column; no further adjustment',
  synthetic: false
}
```

`licenseAttestation` records the user's declared license or usage basis; it is provenance, not legal verification. `coverage` timestamps are epoch milliseconds. `adjustmentPolicy` must describe source adjustment and selected price column. Keep imported source and provenance attached to the dataset.

## Synthetic data (new)

Expose seeded demo/test generation through `window.SyntheticData`. Every result and UI use must remain visibly labeled synthetic; never describe these bars as market data.

```js
const sample = window.SyntheticData.generateBars({
  seed: 42,
  count: 252,
  startTime: Date.UTC(2025, 0, 1),
  startPrice: 100,
  drift: 0.0002,
  volatility: 0.01
});
// { name: 'Synthetic GBM (seed 42)', synthetic: true, bars: [...] }
```

Generation is deterministic for the same arguments and uses a seeded PRNG. Each bar follows the standard `{time, o, h, l, c, v}` shape. Additional defaults and GBM sampling details belong to the implementation; preserve the required return shape and synthetic label.
