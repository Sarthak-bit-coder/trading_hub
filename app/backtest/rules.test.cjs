const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('./strategies.js');

// Same ctx shape the engine builds: only bars 0..length-1 are visible.
const ctx = (closes, end = closes.length - 1) => {
  const bars = closes.map((c, i) => ({ time: i, o: c, h: c, l: c, c }));
  return { length: end + 1, bar: k => k >= 0 && k <= end ? bars[k] : undefined, close: k => k >= 0 && k <= end ? bars[k].c : undefined };
};
const run = (rule, closes, params) => Object.assign(Object.create(rule), { params: { ...rule.params, ...params } }).signal(ctx(closes));
const noLookAhead = (rule, closes, end, params) => {
  const r = Object.assign(Object.create(rule), { params: { ...rule.params, ...params } });
  const changed = closes.slice(); for (let i = end + 1; i < changed.length; i++) changed[i] *= 3;
  assert.equal(r.signal(ctx(closes, end)), r.signal(ctx(changed, end)));
};

test('EMA is seeded with the SMA and uses alpha 2/(n+1)', () => {
  const e = S.emaSeries([1, 2, 3, 4], 3);
  assert.deepEqual(e.slice(0, 2), [null, null]);
  assert.equal(e[2], 2);
  assert.equal(e[3], 0.5 * 4 + 0.5 * 2); // alpha = 2/4
});

test('200-day trend filter: warm-up, cross up, cross down, no look-ahead', () => {
  const p = { length: 5 };
  assert.equal(run(S.trendFilter, [10, 10, 10, 10, 10], p), null);
  assert.equal(run(S.trendFilter, [10, 10, 10, 10, 10, 12], p), 'buy');
  assert.equal(run(S.trendFilter, [10, 10, 10, 10, 10, 8], p), 'sell');
  assert.equal(run(S.trendFilter, [10, 10, 10, 10, 10, 10], p), null);
  noLookAhead(S.trendFilter, [10, 10, 10, 10, 10, 12, 1, 1], 5, p);
});

test('MACD cross: warm-up, buy after a turn up, sell after a turn down, no look-ahead', () => {
  const p = { fast: 3, slow: 6, signal: 3 };
  const down = Array.from({ length: 12 }, (_, i) => 100 - i);
  assert.equal(run(S.macd, down.slice(0, 7), p), null);
  const signals = closes => closes.map((_, i) => i < 9 ? null : run(S.macd, closes.slice(0, i + 1), p));
  const turnUp = [...down, 95, 100, 106, 112];
  assert.ok(signals(turnUp).includes('buy'));
  const turnDown = [...down.map(x => 200 - x), 95, 90, 84, 78];
  assert.ok(signals(turnDown).includes('sell'));
  assert.equal(run(S.macd, down, p), null); // steady trend, no cross
  noLookAhead(S.macd, turnUp, 13, p);
});

test('Bollinger re-entry: warm-up, buy on re-entry, sell at middle band, no look-ahead', () => {
  const p = { length: 5, k: 1.5 }; // with 5 bars one close can never sit 2 sd below its own band
  assert.equal(run(S.bollinger, [10, 10, 10, 10, 10], p), null);
  const base = [10, 11, 10, 11, 10, 11];
  assert.equal(run(S.bollinger, [...base, 5, 9], p), 'buy');
  assert.equal(run(S.bollinger, [...base, 12], p), 'sell');
  assert.equal(run(S.bollinger, [...base, 5], p), null);
  noLookAhead(S.bollinger, [...base, 5, 9, 1, 50], 7, p);
});

test('every strategy has a readable name and is exported in all', () => {
  assert.equal(S.all.length, 7);
  for (const s of S.all) assert.ok(s.name && s.id && s.schema);
});
