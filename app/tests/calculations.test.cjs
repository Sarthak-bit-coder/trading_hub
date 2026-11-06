const test=require('node:test');
const assert=require('node:assert/strict');
const {exposure,sizeLong,scoreQuiz,saveState,loadState,validateBackup}=require('../math.js');

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
