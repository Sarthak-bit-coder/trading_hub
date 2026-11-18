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
      name: 'Moving-average cross',
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
    name: 'RSI(2) pullback in an uptrend',
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
    name: 'Donchian 20/10 breakout',
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
    name: '12-month time-series momentum',
    version: '1.0.0',
    params: { lookback: 252 },
    schema: { lookback: { type: 'integer', min: 2, default: 252 } },
    signal(ctx) {
      const n = ctx.length;
      const lookback = this.params.lookback;
      return n <= lookback ? null : ctx.close(n - 1) / ctx.close(n - lookback - 1) - 1 > 0 ? 'buy' : 'sell';
    },
  };

  // EMA over closes 0..end, seeded with the SMA of the first `length` values. Returns the full series (null during warm-up).
  const emaSeries = (values, length) => {
    const out = new Array(values.length).fill(null);
    if (values.length < length) return out;
    let e = 0;
    for (let i = 0; i < length; i++) e += values[i];
    e /= length; out[length - 1] = e;
    const a = 2 / (length + 1);
    for (let i = length; i < values.length; i++) { e = a * values[i] + (1 - a) * e; out[i] = e; }
    return out;
  };
  const closes = ctx => Array.from({ length: ctx.length }, (_, i) => ctx.close(i));

  const trendFilter = {
    id: 'trend-filter-200',
    name: '200-day trend filter',
    version: '1.0.0',
    params: { length: 200 },
    schema: { length: { type: 'integer', min: 2, default: 200 } },
    signal(ctx) {
      const n = ctx.length, len = this.params.length;
      if (n < len + 1) return null;
      const now = mean(ctx, n - 1, len), before = mean(ctx, n - 2, len);
      const c = ctx.close(n - 1), pc = ctx.close(n - 2);
      return pc <= before && c > now ? 'buy' : pc >= before && c < now ? 'sell' : null;
    },
  };

  const macd = {
    id: 'macd-cross',
    name: 'MACD 12/26/9 cross',
    version: '1.0.0',
    params: { fast: 12, slow: 26, signal: 9 },
    schema: {
      fast: { type: 'integer', min: 2, default: 12 },
      slow: { type: 'integer', min: 3, default: 26 },
      signal: { type: 'integer', min: 2, default: 9 },
    },
    signal(ctx) {
      const p = this.params, n = ctx.length;
      if (p.fast >= p.slow || n < p.slow + p.signal) return null;
      const c = closes(ctx), f = emaSeries(c, p.fast), s = emaSeries(c, p.slow);
      const line = c.map((_, i) => f[i] === null || s[i] === null ? null : f[i] - s[i]).slice(p.slow - 1);
      const sig = emaSeries(line, p.signal);
      const m = line.length - 1;
      if (sig[m - 1] === null || sig[m - 1] === undefined) return null;
      const prev = line[m - 1] - sig[m - 1], last = line[m] - sig[m];
      return prev <= 0 && last > 0 ? 'buy' : prev >= 0 && last < 0 ? 'sell' : null;
    },
  };

  const bollinger = {
    id: 'bollinger-reentry',
    name: 'Bollinger band re-entry',
    version: '1.0.0',
    params: { length: 20, k: 2 },
    schema: {
      length: { type: 'integer', min: 2, default: 20 },
      k: { type: 'number', min: 0.1, default: 2 },
    },
    signal(ctx) {
      const { length: len, k } = this.params, n = ctx.length;
      if (n < len + 1) return null;
      const band = end => {
        const mid = mean(ctx, end, len);
        let v = 0;
        for (let i = end - len + 1; i <= end; i++) v += (ctx.close(i) - mid) ** 2;
        return { mid, lower: mid - k * Math.sqrt(v / len) };
      };
      const now = band(n - 1), before = band(n - 2), c = ctx.close(n - 1);
      if (ctx.close(n - 2) < before.lower && c > now.lower) return 'buy';
      return c >= now.mid ? 'sell' : null;
    },
  };

  const api = { sma, rsi2, donchian, momentum, trendFilter, macd, bollinger, emaSeries, all: [sma(), rsi2, donchian, momentum, trendFilter, macd, bollinger] };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.BacktestStrategies = api;
})(typeof window !== 'undefined' ? window : globalThis);
