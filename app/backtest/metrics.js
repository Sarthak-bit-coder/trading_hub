(function(root) {
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const undef = reason => ({ value: null, reason });

  function calculate(result, { annualizationFactor, riskFreeRate = 0, seed = 1, runs = 1000 } = {}) {
    if (!Number.isFinite(annualizationFactor) || annualizationFactor <= 0) {
      throw Error('annualizationFactor must be explicit and positive');
    }
    const equity = result.equity || [];
    const returns = equity.slice(1)
      .map((point, i) => point.value / equity[i].value - 1)
      .filter(Number.isFinite);
    const n = returns.length;
    const mean = n ? returns.reduce((sum, value) => sum + value, 0) / n : 0;
    const volatility = n > 1
      ? Math.sqrt(returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1) * annualizationFactor)
      : null;
    const downside = returns.filter(value => value < riskFreeRate / annualizationFactor);
    const downsideDeviation = downside.length
      ? Math.sqrt(downside.reduce((sum, value) => sum + (value - riskFreeRate / annualizationFactor) ** 2, 0) / n * annualizationFactor)
      : null;
    const cagr = equity.length && equity[0].value > 0 && equity.at(-1).value > 0
      ? (equity.at(-1).value / equity[0].value) ** (annualizationFactor / n) - 1
      : null;
    const ratio = (num, den, reason) => den > 0 ? { value: num / den, reason: null } : undef(reason);

    let peak = equity[0]?.value || 0;
    let peakAt = 0;
    let longest = 0;
    let maxDrawdown = 0;
    equity.forEach((point, i) => {
      if (point.value >= peak) {
        if (peakAt < i) longest = Math.max(longest, i - peakAt);
        peak = point.value;
        peakAt = i;
      } else {
        maxDrawdown = Math.max(maxDrawdown, (peak - point.value) / peak);
      }
    });
    if (equity.length - 1 > peakAt) longest = Math.max(longest, equity.length - 1 - peakAt);

    const trades = result.trades || [];
    const holding = trades.map(trade => trade.barsHeld);
    const profits = trades.map(trade => trade.netPnl);
    const random = mulberry32(seed);
    const paths = [];
    for (let k = 0; k < runs; k++) {
      let value = result.startEquity || 10000;
      let pathPeak = value;
      let drawdown = 0;
      const shuffled = profits.slice();
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      for (const profit of shuffled) {
        value += profit;
        pathPeak = Math.max(pathPeak, value);
        drawdown = Math.max(drawdown, (pathPeak - value) / pathPeak);
      }
      paths.push(drawdown);
    }
    paths.sort((a, b) => a - b);
    const percentile = p => paths.length ? paths[Math.floor((paths.length - 1) * p)] : null;

    return {
      annualizationFactor,
      cagr: cagr === null ? undef('Insufficient or invalid equity history') : { value: cagr, reason: null },
      volatility,
      sharpe: ratio((mean - riskFreeRate / annualizationFactor) * Math.sqrt(annualizationFactor), volatility, 'No return volatility'),
      sortino: ratio((mean - riskFreeRate / annualizationFactor) * Math.sqrt(annualizationFactor), downsideDeviation, 'No downside returns'),
      calmar: ratio(cagr, maxDrawdown, 'No drawdown'),
      exposure: result.barsCount ? result.exposureBars / result.barsCount : null,
      maxDrawdown,
      longestDrawdownBars: longest,
      averageHoldingBars: holding.length ? holding.reduce((sum, bars) => sum + bars, 0) / holding.length : null,
      maxHoldingBars: holding.length ? Math.max(...holding) : null,
      bestTrade: profits.length ? Math.max(...profits) : null,
      worstTrade: profits.length ? Math.min(...profits) : null,
      monteCarlo: {
        seed,
        runs,
        metric: 'maxDrawdown',
        percentile5: percentile(0.05),
        percentile95: percentile(0.95),
      },
    };
  }

  const api = { calculate, mulberry32 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.BacktestMetrics = api;
})(typeof window !== 'undefined' ? window : globalThis);
