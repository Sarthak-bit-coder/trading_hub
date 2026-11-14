const test=require('node:test');
const assert=require('node:assert/strict');
const {exposure,sizeLong,scoreQuiz,saveState,loadState,validateBackup,migrateBackup,calcRiskReward,calcTradeFriction,parametricVaR,targetVolSize,maxDrawdown,mulberry32,simulatePriceTick,calcPositions}=require('../math.js');

test('Part 1 starter example values',()=>{
  const x=exposure({equity:1000,entry:50000,quantity:.02,ratio:10,exit:49200,fees:2});
  assert.equal(x.notional,1000);assert.equal(x.margin,100);assert.equal(x.gross,-16);assert.equal(x.net,-18);assert.ok(Math.abs(x.pctEquity+1.8)<1e-10);
  assert.equal(.02*(50000-49500),10);
});
test('changing only margin ratio leaves linear P/L unchanged',()=>{
  const a=exposure({equity:1000,entry:50000,quantity:.02,ratio:10,exit:49200,fees:2});
  const b=exposure({equity:1000,entry:50000,quantity:.02,ratio:5,exit:49200,fees:2});
  assert.equal(a.gross,b.gross);assert.equal(a.net,b.net);assert.notEqual(a.margin,b.margin);
});
test('invalid exposure is rejected',()=>assert.throws(()=>exposure({equity:0,entry:50000,quantity:.02,ratio:10,exit:49200,fees:2})));
test('quantity rounds down to increment',()=>{
  const x=sizeLong({equity:1000,budget:10,entry:50000,stop:49500,variableCost:20,fixedCost:0,increment:.001,minSize:.001,worseExit:49000});
  assert.equal(x.fits,true);assert.equal(x.quantity,.019);assert.ok(x.quantity<=10/520);
});
test('fixed costs at or above budget produce no size',()=>{
  const x=sizeLong({equity:1000,budget:5,entry:100,stop:90,variableCost:0,fixedCost:5,increment:1,minSize:1,worseExit:80});
  assert.ok(x.errors.includes('Loss budget must exceed fixed costs.'));
});
test('minimum size violation is reported as no fit',()=>{
  const x=sizeLong({equity:1000,budget:1,entry:100,stop:90,variableCost:0,fixedCost:0,increment:1,minSize:1,worseExit:80});
  assert.equal(x.fits,false);
});
test('unsupported or invalid long sizing inputs are rejected',()=>{
  const x=sizeLong({equity:1000,budget:10,entry:100,stop:110,variableCost:0,fixedCost:0,increment:.1,minSize:.1,worseExit:90});
  assert.ok(x.errors.includes('For this long-only model, the stop must be below entry.'));
});
test('quiz scoring only passes a complete correct answer set',()=>{
  assert.deepEqual(scoreQuiz([1,0,2],[1,0,2]),{score:3,total:3,passed:true});
  assert.deepEqual(scoreQuiz([1,0,2],[1,-1,2]),{score:2,total:3,passed:false});
});
test('progress state round-trips through browser storage interface',()=>{
  const values=new Map(),storage={setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k)||null};
  const defaults={read:[],notes:{},theme:'light'};saveState(storage,'academy',{...defaults,read:[1],notes:{1:'review'}});
  assert.deepEqual(loadState(storage,'academy',defaults),{read:[1],notes:{1:'review'},theme:'light'});
});
test('loading state deep-clones defaults instead of sharing reset data',()=>{
  const values=new Map(),storage={setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k)||null};
  const defaults={read:[],notes:{},journal:[]};
  const state=loadState(storage,'academy',defaults);
  state.read.push(5);state.notes.lesson='review';state.journal.push({note:'kept'});
  assert.deepEqual(defaults,{read:[],notes:{},journal:[]});
});
test('loading state ignores a stored non-object',()=>{
  const storage={getItem:()=>JSON.stringify('abc')};
  assert.deepEqual(loadState(storage,'academy',{read:[],theme:'light'}),{read:[],theme:'light'});
});
test('backup validator accepts export shape and rejects invalid workbook data',()=>{
  const data={theme:'light',read:[1],practiced:[],assignments:[],passed:[],mastered:[],bookmarks:[],assessmentPassed:false,notes:{},studyPlan:{},journal:[],passport:[],strategy:[],friend:[],watchlist:[{symbol:'AAPL',price:190}],paperTrades:[],customLessons:[],equity:10000};
  assert.equal(validateBackup({version:1,data}),true);
  assert.equal(validateBackup({version:1,data:{...data,watchlist:[{symbol:'<script>',price:1}]}}),false);
});
test('backup validator accepts and bounds the new local research records',()=>{
  const data={theme:'light',read:[],practiced:[],assignments:[],passed:[],mastered:[],bookmarks:[],assessmentPassed:false,notes:{},studyPlan:{},journal:[],passport:[],strategy:[],friend:[],watchlist:[],paperTrades:[],customLessons:[],equity:10000,misconceptions:[{concept:'margin',note:'Margin is collateral.'}],researchInbox:[{creator:'Example',url:'https://example.com',claim:'A claim',excerpt:'User notes'}],savedQuestions:[{text:'What is notional?',lesson:1}],experiments:[{version:'v1',hash:'abc',netPnl:0}],assistantMemory:['Use short explanations.'],testConsumed:false};
  assert.equal(validateBackup({version:1,data}),true);
  assert.equal(validateBackup({version:1,data:{...data,researchInbox:[{creator:'bad',url:'javascript:alert(1)',claim:'x',excerpt:''}]}}),false);
  assert.equal(validateBackup({version:1,data:{...data,assistantMemory:'unexpected string'}}),false);
});
test('backup migration upgrades v1 and preserves Part 2 progress',()=>{
  const data={theme:'light',read:[5],practiced:[6],assignments:[7],passed:[],mastered:[8],bookmarks:[5],assessmentPassed:false,notes:{},studyPlan:{},journal:[],passport:[],strategy:[],friend:[],watchlist:[],paperTrades:[],customLessons:[],equity:10000,savedQuestions:[{text:'What is VaR?',lesson:6}]};
  const migrated=migrateBackup({version:1,data});
  assert.equal(migrated.version,2);
  assert.deepEqual(migrated.data.read,[5]);
  assert.equal(validateBackup(migrated),true);
});
test('backup validator accepts v2 Part 2 progress and rejects unknown versions',()=>{
  const data={theme:'light',read:[5],practiced:[],assignments:[],passed:[],mastered:[8],bookmarks:[],assessmentPassed:false,notes:{},studyPlan:{},journal:[],passport:[],strategy:[],friend:[],watchlist:[],paperTrades:[],customLessons:[],equity:10000};
  assert.equal(validateBackup({version:2,data}),true);
  assert.equal(validateBackup({version:3,data}),false);
});

test('risk reward ratio calculates correctly for long and short',()=>{
  const rrLong = calcRiskReward('Long', 100, 95, 115);
  assert.equal(rrLong.valid, true);
  assert.equal(rrLong.risk, 5);
  assert.equal(rrLong.reward, 15);
  assert.equal(rrLong.ratio, 3);
  assert.equal(rrLong.formatted, '3.00:1');

  const rrShort = calcRiskReward('Short', 100, 105, 85);
  assert.equal(rrShort.valid, true);
  assert.equal(rrShort.risk, 5);
  assert.equal(rrShort.reward, 15);
  assert.equal(rrShort.ratio, 3);
  assert.equal(rrShort.formatted, '3.00:1');

  const invalidLong = calcRiskReward('Long', 100, 105, 110);
  assert.equal(invalidLong.valid, false);

  const missingSl = calcRiskReward('Long', 100, null, 110);
  assert.equal(missingSl.valid, false);
  assert.equal(missingSl.ratio, null);
});

test('trade friction correctly computes slippage and fee drag',()=>{
  const buy = calcTradeFriction({ price: 100, qty: 10, side: 'buy', slippageBps: 5, feeBps: 5 });
  assert.equal(buy.basePrice, 100);
  assert.equal(buy.executedPrice, 100.05);
  assert.equal(buy.notional, 1000.5);
  assert.ok(Math.abs(buy.fee - 0.50025) < 1e-6);
  assert.ok(Math.abs(buy.slippageCost - 0.5) < 1e-6);
  assert.ok(Math.abs(buy.totalFriction - 1.00025) < 1e-6);

  const sell = calcTradeFriction({ price: 100, qty: 10, side: 'sell', slippageBps: 5, feeBps: 5 });
  assert.equal(sell.executedPrice, 99.95);
});

test('parametric 1-day VaR scales with exposure, volatility and confidence',()=>{
  const var95 = parametricVaR({ notional: 10000, dailyVol: 0.02, confidence: 0.95 });
  assert.ok(Math.abs(var95.varDollar - 328.97) < 0.1);
  assert.ok(Math.abs(var95.varPct - 3.2897) < 0.01);

  const invalid = parametricVaR({ notional: 0, dailyVol: 0.02 });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.length > 0);
  const unsupported = parametricVaR({ notional: 10000, dailyVol: 0.02, confidence: 0.975 });
  assert.equal(unsupported.valid, false);
  assert.ok(unsupported.errors.some(error=>error.includes('90%, 95%, or 99%')));
});

test('target volatility sizing calculates correct weights and notional',()=>{
  const sizing = targetVolSize({ equity: 10000, targetVol: 0.15, assetVol: 0.30, price: 50 });
  assert.equal(sizing.fits, true);
  assert.equal(sizing.weight, 0.5);
  assert.equal(sizing.targetNotional, 5000);
  assert.equal(sizing.targetQty, 100);
  assert.equal(sizing.leverage, 0.5);

  const capped = targetVolSize({ equity: 10000, targetVol: 0.15, assetVol: 0.025, price: 50 });
  assert.equal(capped.leverage, 1);
  assert.equal(capped.capped, true);

  const customCap = targetVolSize({ equity: 10000, targetVol: 0.15, assetVol: 0.025, price: 50, maxLeverage: 2 });
  assert.equal(customCap.leverage, 2);
  assert.equal(customCap.capped, true);

  const invalid = targetVolSize({ equity: -1000, targetVol: 0.15, assetVol: 0.30, price: 50 });
  assert.equal(invalid.fits, false);
  assert.ok(invalid.errors.length > 0);
});

test('max drawdown tracks peak and trough across equity curve',()=>{
  const curve = [10000, 10500, 9450, 10200, 11000, 9900];
  const mdd = maxDrawdown(curve);
  assert.equal(mdd.peak, 11000);
  assert.equal(mdd.trough, 9900);
  assert.equal(mdd.maxDdDollar, 1100);
  assert.ok(Math.abs(mdd.maxDdPct - 10) < 1e-6);

  const empty = maxDrawdown([]);
  assert.equal(empty.maxDdPct, 0);
});

test('price tick simulation preserves positive prices and applies GBM',()=>{
  const tickZeroZ = simulatePriceTick(100, 0.20, 1/252, 0);
  assert.ok(tickZeroZ.newPrice > 0);
  assert.ok(tickZeroZ.newPrice < 100); // drift is negative -0.5*sigma^2*dt

  const tickPositiveZ = simulatePriceTick(100, 0.20, 1/252, 1);
  assert.ok(tickPositiveZ.newPrice > 100);
});
test('seeded RNG makes simulated price ticks reproducible',()=>{
  const first=mulberry32(42),second=mulberry32(42);
  const a=simulatePriceTick(100,0.2,1/252,null,first);
  const b=simulatePriceTick(100,0.2,1/252,null,second);
  assert.deepEqual(a,b);
});

test('position calculator handles long, short, partial closes, and SL/TP triggers',()=>{
  const watchlist = [
    { symbol: 'AAPL', price: 110 },
    { symbol: 'TSLA', price: 180 },
    { symbol: 'SPY', price: 500 }
  ];

  const trades = [
    { side: 'buy', symbol: 'AAPL', qty: 10, price: 100, sl: 90, tp: 120, fee: 0.5 },
    { side: 'sell', symbol: 'TSLA', qty: 5, price: 200, sl: 210, tp: 170, fee: 0.5 }
  ];

  let pos = calcPositions(trades, watchlist);
  assert.equal(pos.length, 2);

  const aapl = pos.find(p => p.symbol === 'AAPL');
  assert.equal(aapl.type, 'Long');
  assert.equal(aapl.qty, 10);
  assert.equal(aapl.entry, 100);
  assert.equal(aapl.price, 110);
  assert.equal(aapl.unrealized, 100); // 10 * (110 - 100)
  assert.equal(aapl.slTriggered, false);
  assert.equal(aapl.tpTriggered, false);

  const tsla = pos.find(p => p.symbol === 'TSLA');
  assert.equal(tsla.type, 'Short');
  assert.equal(tsla.qty, 5);
  assert.equal(tsla.entry, 200);
  assert.equal(tsla.price, 180);
  assert.equal(tsla.unrealized, 100); // 5 * (200 - 180)

  // Now partial close AAPL
  trades.push({ side: 'sell', symbol: 'AAPL', qty: 4, price: 110, fee: 0.2 });
  pos = calcPositions(trades, watchlist);
  const aaplAfter = pos.find(p => p.symbol === 'AAPL');
  assert.equal(aaplAfter.qty, 6);
  assert.equal(pos.totalRealized, 40); // 4 * (110 - 100)

  // Price trigger test: AAPL drops to 89 (below SL 90)
  const triggerWatchlist = [
    { symbol: 'AAPL', price: 89 },
    { symbol: 'TSLA', price: 165 } // below TP 170 for short
  ];
  const triggerPos = calcPositions(trades, triggerWatchlist);
  const aaplTrigger = triggerPos.find(p => p.symbol === 'AAPL');
  assert.equal(aaplTrigger.slTriggered, true);

  const tslaTrigger = triggerPos.find(p => p.symbol === 'TSLA');
  assert.equal(tslaTrigger.tpTriggered, true);
});
