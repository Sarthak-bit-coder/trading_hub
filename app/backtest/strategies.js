(function(root) {
  const mean = (ctx, end, length, key = 'c') => {
    if (!Number.isInteger(end) || !Number.isInteger(length) || length < 1 || end - length + 1 < 0 || end >= ctx.length) return null;
    let sum = 0;
    for (let i = end - length + 1; i <= end; i++) {
      const bar = ctx.bar(i);
      if (!bar || !Number.isFinite(bar[key])) return null;
      sum += bar[key];
    }
    return sum / length;
  };

  function sma(length = 200, fast = 50) {
    return {
      id: 'sma-cross',
      version: '1.0.0',
      params: { fast, slow: length },
      schema: {
        fast: { type: 'integer', min: 2, default: fast },
        slow: { type: 'integer', min: 3, default: length },
      },
      signal(ctx) {
        const p = this.params;
        const n = ctx.length;
        if (!Number.isFinite(p.fast) || !Number.isFinite(p.slow) || p.fast < 1 || p.slow < 1 || n < Math.max(p.fast, p.slow) + 1) return null;
        const f = mean(ctx, n - 1, p.fast);
        const s = mean(ctx, n - 1, p.slow);
        const pf = mean(ctx, n - 2, p.fast);
        const ps = mean(ctx, n - 2, p.slow);
        return pf <= ps && f > s ? 'buy' : pf >= ps && f < s ? 'sell' : null;
      },
    };
  }

  const rsi2 = {
    id: 'rsi2-pullback',
    version: '1.0.0',
    params: { trend: 200, exit: 5, threshold: 10 },
    schema: {
      trend: { type: 'integer', min: 2, default: 200 },
      exit: { type: 'integer', min: 2, default: 5 },
      threshold: { type: 'number', default: 10 },
    },
    signal(ctx) {
      const p = this.params;
      const n = ctx.length;
      if (n < Math.max(p.trend, p.exit, 3) || n < p.trend + 1) return null;
      const first = ctx.close(n - 3);
      const second = ctx.close(n - 2);
      const third = ctx.close(n - 1);
      const changes = [second - first, third - second];
      const gains = changes.map(value => Math.max(value, 0));
      const losses = changes.map(value => Math.max(-value, 0));
      const lossSum = losses.reduce((sum, value) => sum + value, 0);
      const rsi = lossSum === 0 ? 100 : 100 - 100 / (1 + gains.reduce((sum, value) => sum + value, 0) / lossSum);
      return ctx.close(n - 1) > mean(ctx, n - 1, p.trend) && rsi < p.threshold
        ? 'buy'
        : ctx.close(n - 1) > mean(ctx, n - 1, p.exit) ? 'sell' : null;
    },
  };

  const donchian = {
    id: 'donchian-system-1',
    version: '1.0.0',
    params: { entry: 20, exit: 10 },
    schema: {
      entry: { type: 'integer', min: 2, default: 20 },
      exit: { type: 'integer', min: 2, default: 10 },
    },
    signal(ctx) {
      const p = this.params;
      const n = ctx.length;
      if (n <= p.entry) return null;
      let highest = -Infinity;
      for (let i = n - p.entry - 1; i < n - 1; i++) highest = Math.max(highest, ctx.bar(i).h);
      if (ctx.close(n - 1) > highest) return 'buy';
      if (n > p.exit) {
        let lowest = Infinity;
        for (let i = n - p.exit - 1; i < n - 1; i++) lowest = Math.min(lowest, ctx.bar(i).l);
        if (ctx.close(n - 1) < lowest) return 'sell';
      }
      return null;
    },
  };

  const momentum = {
    id: 'time-series-momentum',
    version: '1.0.0',
    params: { lookback: 252 },
    schema: { lookback: { type: 'integer', min: 2, default: 252 } },
    signal(ctx) {
      const n = ctx.length;
      const lookback = this.params.lookback;
      return n <= lookback ? null : ctx.close(n - 1) / ctx.close(n - lookback - 1) - 1 > 0 ? 'buy' : 'sell';
    },
  };

  const api = { sma, rsi2, donchian, momentum, all: [sma(), rsi2, donchian, momentum] };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.BacktestStrategies = api;
})(typeof window !== 'undefined' ? window : globalThis);
