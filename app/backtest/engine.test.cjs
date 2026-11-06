const test=require('node:test');
const assert=require('node:assert/strict');
const {parseCSV,run,csv}=require('./engine.js');
const bars=()=>[4,3,2,2,4,5,4,2].map((c,i)=>({time:Date.UTC(2024,0,i+1),o:[4,3,2,2,4,4,5,3][i],h:c+.25,l:c-.25,c,v:1000}));

test('CSV importer validates and sorts OHLC bars; volume is optional',()=>{
  const b=parseCSV('date,open,high,low,close\n2024-01-02,2,3,1,2.5\n2024-01-01,1,2,0.5,1.5');
  assert.equal(b.length,2);assert.ok(b[0].time<b[1].time);assert.equal(b[0].v,null);
});
test('CSV importer rejects invalid OHLC, duplicates and timezone-ambiguous intraday times',()=>{
  assert.throws(()=>parseCSV('date,open,high,low,close\n2024-01-01T09:30,1,2,0,1'));
  assert.throws(()=>parseCSV('date,open,high,low,close\n2024-01-01,1,1,2,1'));
  assert.throws(()=>parseCSV('date,open,high,low,close\n2024-01-01,1,2,0,1\n2024-01-01,1,2,0,1'),/Duplicate/);
});
test('signals use completed closes and execute at the next bar open',()=>{
  const x=run({bars:bars(),smaLength:3,startEquity:10000,allocationPct:25,feeBps:0,slippageBps:0});
  assert.equal(x.trades.length,1);assert.equal(x.trades[0].entryTime,bars()[5].time);assert.equal(x.trades[0].entrySignalTime,bars()[4].time);assert.equal(x.trades[0].entryPrice,bars()[5].o);assert.equal(x.trades[0].exitTime,bars()[7].time);assert.equal(x.trades[0].exitPrice,bars()[7].o);assert.equal(x.trades[0].netPnl,-625);assert.equal(x.finalEquity,9375);
});
test('a pending signal on the final bar does not fill using future data',()=>{
  const short=bars().slice(0,5),x=run({bars:short,smaLength:3,startEquity:10000,allocationPct:25,feeBps:0,slippageBps:0});
  assert.equal(x.trades.length,0);assert.equal(x.openPosition,null);assert.equal(x.finalEquity,10000);assert.equal(x.unclosedSignal.side,'buy');
});
test('fees and slippage reduce otherwise identical net results',()=>{
  const free=run({bars:bars(),smaLength:3,startEquity:10000,allocationPct:25,feeBps:0,slippageBps:0});
  const costly=run({bars:bars(),smaLength:3,startEquity:10000,allocationPct:25,feeBps:10,slippageBps:20});
  assert.ok(costly.netPnl<free.netPnl);assert.ok(costly.trades[0].fees>0);
});
test('CSV export guards spreadsheet formula injection',()=>{
  assert.match(csv([['value'],['=1+1']]),/"'=1\+1"/);
});
