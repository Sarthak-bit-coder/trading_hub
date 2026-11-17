const test=require('node:test');
const assert=require('node:assert/strict');
const {paperLedger,cents}=require('../math.js');

test('integer cents ledger preserves round trips, partial and full basis, and fees',()=>{
  const watch=[{symbol:'XYZ',price:10}];
  let x=paperLedger([{side:'buy',symbol:'XYZ',qty:3,priceCents:1001,feeCents:2}],watch,100000);
  assert.equal(x.cashCents,96995);
  assert.equal(cents(x.positions[0].avg),1001);
  x=paperLedger([{side:'buy',symbol:'XYZ',qty:3,priceCents:1001,feeCents:2},{side:'sell',symbol:'XYZ',qty:1,priceCents:1200,feeCents:1}],watch,100000);
  assert.equal(x.cashCents,98194);
  assert.equal(cents(x.positions[0].avg),1001);
  x=paperLedger([{side:'buy',symbol:'XYZ',qty:3,priceCents:1001,feeCents:2},{side:'sell',symbol:'XYZ',qty:3,priceCents:1001,feeCents:2}],watch,100000);
  assert.equal(x.positions.length,0);
  assert.equal(x.cashCents,99996);
});

test('full sell closes basis and records realized cash P/L in equity curve',()=>{
  const trades=[];let curve=[10000];
  for(const [side,price] of [['buy',100.10],['sell',101.23]]){
    const friction=require('../math.js').calcTradeFriction({price,qty:10,side});
    trades.push({side,symbol:'SPY',qty:10,priceCents:cents(friction.executedPrice),feeCents:cents(friction.fee),notionalCents:cents(cents(friction.executedPrice)*10/100)});
    const ledger=paperLedger(trades,[{symbol:'SPY',price:590.25}],1000000);
    curve.push(ledger.equityCents/100);
  }
  const result=paperLedger(trades,[{symbol:'SPY',price:590.25}],1000000);
  assert.equal(result.positions.length,0);
  assert.deepEqual(result.orders.map(t=>t.side),['buy','sell']);
  assert.equal(result.cashCents,1000929);
  assert.equal(curve.at(-1),10009.29);
  assert.equal(curve[0],10000);
  assert.equal(cents(1011.80-0.51-1001.50-0.50),929); // Sell proceeds - sell fee - buy basis - buy fee.
});

test('open positions use last synthetic fill price instead of watchlist price',()=>{
  const f=require('../math.js').calcTradeFriction({price:100.10,qty:10,side:'buy'});
  const ledger=paperLedger([{side:'buy',symbol:'SPY',qty:10,priceCents:cents(f.executedPrice),feeCents:cents(f.fee)}],[{symbol:'SPY',price:590.25}],1000000);
  assert.equal(ledger.positions[0].price,100.15);
  assert.equal(ledger.positions[0].unrealized,0);
  assert.equal(ledger.equityCents,999950);
});

