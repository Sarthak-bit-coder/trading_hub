const test = require('node:test');
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const { run, strategies, metrics } = require('./engine.js');
const { generateBars } = require('./synthetic.js');

const bars = [10, 9, 8, 9, 11, 12, 9, 8, 10, 12].map((c, i) => ({
  time: i,
  o: c,
  h: c + 1,
  l: c - 1,
  c,
  v: null,
}));

test('strategy receives bounded history and orders fill afterward', () => {
  const seen = [];
  const strategy = {
    id: 'probe',
    version: '1',
    params: {},
    schema: {},
    signal(ctx) {
      seen.push(ctx.length);
      assert.equal(ctx.bar(ctx.length), undefined);
      assert.equal(ctx.close(ctx.length), undefined);
      assert.ok(Object.isFrozen(ctx.bar(ctx.length - 1)));
      return ctx.length === 4 ? 'buy' : null;
    },
  };
  const result = run({ bars, strategy, feeBps: 0, slippageBps: 0 });
  assert.deepEqual(seen, bars.map((_, i) => i + 1));
  assert.equal(result.openPosition.entryTime, bars[4].time);
  assert.equal(result.signals[0].time, bars[3].time);
});

test('all four strategy factories expose required interface', () => {
  for (const strategy of strategies.all) {
    assert.equal(typeof strategy.signal, 'function');
    assert.ok(strategy.id && strategy.version && strategy.params && strategy.schema);
  }
});

test('every registered strategy runs on synthetic histories and trades at 2,000 bars', () => {
  for (const count of [500, 2000]) {
    const data = generateBars({ seed: 1, count }).bars;
    for (const definition of strategies.all) {
      assert.deepEqual(Object.keys(definition.params).sort(), Object.keys(definition.schema).sort());
      for (const [key, spec] of Object.entries(definition.schema)) assert.equal(definition.params[key], spec.default, `${definition.id}.${key} default`);
      const result = run({ bars: data, strategy: definition });
      if (count === 2000) assert.ok(result.trades.length > 0, `${definition.id} made no trades`);
    }
  }
});

test('stop target same-bar ambiguity exits at stop and flags trade', () => {
  const strategy = { id: 'buy', version: '1', params: {}, schema: {}, signal: ctx => ctx.length === 1 ? 'buy' : null };
  const data = [
    { time: 1, o: 10, h: 11, l: 9, c: 10 },
    { time: 2, o: 10, h: 15, l: 5, c: 10 },
  ];
  const result = run({ bars: data, strategy, startEquity: 1000, allocationPct: 100, feeBps: 0, slippageBps: 0, stopLossPct: 10, targetPct: 10 });
  assert.equal(result.trades[0].exitPrice, 9);
  assert.equal(result.trades[0].ambiguousStopTarget, true);
  assert.equal(result.trades[0].stopHit, true);
  assert.equal(result.trades[0].targetHit, true);
});

test('metrics are finite, annualized explicitly, and seeded Monte Carlo repeats', () => {
  const result = run({ bars, strategy: strategies.sma(3), feeBps: 0, slippageBps: 0 });
  assert.equal(result.metrics.annualizationFactor, 252);
  assert.deepEqual(result.metrics.monteCarlo, metrics.calculate(result, { annualizationFactor: 252 }).monteCarlo);
  for (const value of Object.values(result.metrics)) {
    if (typeof value === 'number') assert.ok(Number.isFinite(value));
  }
});

test('entry fills stay within bar and cannot precede signal', () => {
  const result = run({ bars, strategy: strategies.sma(3), feeBps: 0, slippageBps: 0 });
  for (const trade of result.trades) {
    const bar = bars.find(item => item.time === trade.entryTime);
    assert.ok(trade.entryPrice >= bar.l && trade.entryPrice <= bar.h);
    assert.ok(trade.entryTime >= trade.entrySignalTime);
  }
});

test('200,000 synthetic bars run in under three seconds', () => {
  const data = generateBars({ seed: 23, count: 200_000 }).bars;
  const strategy = { id: 'noop', version: '1', params: {}, schema: {}, signal: () => null };
  const start = performance.now();
  const result = run({ bars: data, strategy });
  const elapsed = performance.now() - start;
  assert.equal(result.barsCount, 200_000);
  assert.ok(elapsed < 3000, `run took ${elapsed.toFixed(0)}ms`);
});
