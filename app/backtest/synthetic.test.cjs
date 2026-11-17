const test=require('node:test');
const assert=require('node:assert/strict');
const {generateBars}=require('./synthetic.js');
const {parseCSV}=require('./engine.js');

test('same seed repeats bars; different seeds differ',()=>{
  const a=generateBars({seed:42,count:20}),b=generateBars({seed:42,count:20}),c=generateBars({seed:43,count:20});
  assert.deepEqual(a,b);assert.notDeepEqual(a.bars,c.bars);assert.equal(a.name,'SYNTHETIC-GBM-seed42');assert.equal(a.synthetic,true);
});
test('generated bars preserve OHLC, time, and volume invariants over 10,000 bars',()=>{
  const {bars}=generateBars({seed:17,count:10000});
  for(let i=0;i<bars.length;i++){
    const b=bars[i];assert.equal(b.time,Date.UTC(2020,0,1)+i*86400000);
    assert.equal(b.o,i?bars[i-1].c:100);assert.ok(b.h>=Math.max(b.o,b.c));assert.ok(b.l<=Math.min(b.o,b.c));assert.ok(b.l>0);assert.ok(Number.isInteger(b.v));
  }
});
test('generated bars pass engine CSV importer',()=>{
  const {bars}=generateBars({seed:8,count:5});
  const csv='date,open,high,low,close,volume\n'+bars.map(b=>[new Date(b.time).toISOString().slice(0,10),b.o,b.h,b.l,b.c,b.v].join(',')).join('\n');
  assert.equal(parseCSV(csv).length,bars.length);
});
test('invalid generator inputs throw clear errors',()=>{
  for(const options of [{seed:1,count:1},{seed:1.2,count:2},{seed:1,count:2,start:'2020-02-30'},{seed:1,count:2,startPrice:0},{seed:1,count:2,drift:Infinity},{seed:1,count:2,vol:-1},{seed:1,count:2,stepDays:0}])assert.throws(()=>generateBars(options));
});
