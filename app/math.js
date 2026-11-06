(function(root){
  function exposure({equity,entry,quantity,ratio,exit,fees}){
    const vals=[equity,entry,quantity,ratio,exit,fees];
    if(vals.some(v=>!Number.isFinite(+v))||equity<=0||entry<=0||quantity<=0||ratio<=0||exit<0||fees<0) throw new Error('Invalid exposure inputs');
    const notional=quantity*entry,gross=quantity*(exit-entry),net=gross-fees;
    return {notional,margin:notional/ratio,gross,net,pctEquity:net/equity*100,notionalToEquity:notional/equity,notionalToMargin:ratio};
  }
  function sizeLong({equity,budget,entry,stop,variableCost,fixedCost,increment,minSize,worseExit,marginRatio=null}){
    const errors=[];const vals=[equity,budget,entry,stop,variableCost,fixedCost,increment,minSize,worseExit];
    if(vals.some(v=>!Number.isFinite(+v)))errors.push('All numeric fields must be valid.');
    if(equity<=0||entry<=0||stop<=0)errors.push('Equity and prices must be positive.');
    if(!(stop<entry))errors.push('For this long-only model, the stop must be below entry.');
    if(budget<=fixedCost)errors.push('Loss budget must exceed fixed costs.');
    if(variableCost<0||fixedCost<0)errors.push('Cost assumptions cannot be negative.');
    if(increment<=0)errors.push('Quantity increment must be positive.');
    if(minSize<0)errors.push('Minimum order size cannot be negative.');
    const perUnit=entry-stop+variableCost;
    if(perUnit<=0)errors.push('Risk per unit must be greater than zero.');
    if(worseExit<0)errors.push('Worse-execution exit cannot be negative.');
    if(marginRatio!==null&&(!Number.isFinite(+marginRatio)||marginRatio<=0))errors.push('Optional margin ratio must be positive.');
    if(errors.length)return {errors};
    const raw=(budget-fixedCost)/perUnit;
    const quantity=Math.floor((raw+1e-12)/increment)*increment;
    if(quantity<minSize||quantity<=0)return {errors:[],fits:false,quantity,raw};
    const notional=quantity*entry,plannedLoss=quantity*perUnit+fixedCost;
    const worseLoss=quantity*(entry-worseExit)+quantity*variableCost+fixedCost;
    return {errors:[],fits:true,raw,quantity,notional,plannedLoss,budgetPct:budget/equity*100,worseLoss,margin:marginRatio?notional/marginRatio:null};
  }
  function scoreQuiz(correctIndexes,answers){let score=0;correctIndexes.forEach((correct,i)=>{if(answers[i]===correct)score++});return {score,total:correctIndexes.length,passed:correctIndexes.length>0&&score===correctIndexes.length};}
  function saveState(storage,key,value){storage.setItem(key,JSON.stringify(value));}
  function loadState(storage,key,defaults){try{return {...defaults,...JSON.parse(storage.getItem(key)||'{}')}}catch{return {...defaults}}}
  function validateBackup(o){
    const d=o?.data,required=['read','practiced','assignments','passed','mastered','bookmarks','journal','passport','strategy','friend','paperTrades','watchlist','customLessons'],extra=['misconceptions','researchInbox','savedQuestions','experiments','assistantMemory','btPaperOrders'];
    if(o?.version!==1||!d||required.some(k=>!Array.isArray(d[k]))||extra.some(k=>k in d&&!Array.isArray(d[k]))||!d.notes||typeof d.notes!=='object'||Array.isArray(d.notes)||!d.studyPlan||typeof d.studyPlan!=='object'||Array.isArray(d.studyPlan)||!['light','dark'].includes(d.theme)||!Number.isFinite(d.equity)||d.equity<=0)return false;
    if([...d.read,...d.practiced,...d.assignments,...d.passed,...d.mastered,...d.bookmarks].some(n=>!Number.isInteger(n)||n<1||n>4))return false;
    if(d.journal.length>10000||d.passport.length>1000||d.strategy.length>1000||d.friend.length>1000||d.paperTrades.length>10000||d.watchlist.length>200||d.customLessons.length>500)return false;
    if(!d.journal.every(x=>x&&typeof x==='object')||!d.passport.every(x=>x&&typeof x==='object')||!d.strategy.every(x=>x&&typeof x==='object')||!d.friend.every(x=>x&&typeof x==='object'))return false;
    if(!d.watchlist.every(x=>x&&/^[A-Z0-9.^=-]{1,15}$/.test(x.symbol)&&Number.isFinite(+x.price)&&+x.price>0))return false;
    if(!d.paperTrades.every(x=>x&&(x.side==='buy'||x.side==='sell')&&/^[A-Z0-9.^=-]{1,15}$/.test(x.symbol)&&Number.isFinite(+x.qty)&&+x.qty>0&&Number.isFinite(+x.price)&&+x.price>0))return false;
    if(!d.customLessons.every(x=>x&&/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(x.id)&&typeof x.title==='string'&&typeof x.content==='string'&&x.content.length<=100000&&['available','awaiting material'].includes(x.status)))return false;
    if(Object.entries(d.notes).some(([k,v])=>k.length>80||typeof v!=='string'||v.length>100000))return false;
    if((d.misconceptions||[]).length>1000||(d.researchInbox||[]).length>5000||(d.savedQuestions||[]).length>5000||(d.experiments||[]).length>5000||(d.assistantMemory||[]).length>10)return false;
    if(!(d.misconceptions||[]).every(x=>x&&typeof x.concept==='string'&&x.concept.length<=300&&typeof x.note==='string'&&x.note.length<=5000))return false;
    if(!(d.researchInbox||[]).every(x=>x&&typeof x.creator==='string'&&x.creator.length<=500&&typeof x.url==='string'&&/^https?:\/\//i.test(x.url)&&typeof x.claim==='string'&&x.claim.length<=5000&&typeof x.excerpt==='string'&&x.excerpt.length<=10000))return false;
    if(!(d.savedQuestions||[]).every(x=>x&&typeof x.text==='string'&&x.text.length<=5000&&Number.isInteger(+x.lesson)&&+x.lesson>=1&&+x.lesson<=4))return false;
    if(!(d.experiments||[]).every(x=>x&&typeof x.version==='string'&&typeof x.hash==='string'&&Number.isFinite(+x.netPnl)))return false;
    if(!(d.assistantMemory||[]).every(x=>typeof x==='string'&&x.length<=2000))return false;
    if((d.btPaperOrders||[]).length>10000||!(d.btPaperOrders||[]).every(x=>x&&['buy','sell'].includes(x.side)&&/^[A-Z0-9.^=-]{1,15}$/.test(x.symbol)&&['filled','rejected'].includes(x.status)&&Number.isFinite(+x.qty)&&+x.qty>0&&Number.isFinite(+x.price)&&+x.price>0&&Number.isFinite(+x.executionTime)))return false;
    if('btPaperStartingEquity' in d&&(!Number.isFinite(+d.btPaperStartingEquity)||+d.btPaperStartingEquity<=0))return false;
    if('testConsumed' in d&&typeof d.testConsumed!=='boolean')return false;
    if(Object.prototype.hasOwnProperty.call(d,'datasetMeta')&&(!d.datasetMeta||typeof d.datasetMeta!=='object'||Array.isArray(d.datasetMeta)))return false;
    return typeof d.assessmentPassed==='boolean'
  }
  const api={exposure,sizeLong,scoreQuiz,saveState,loadState,validateBackup};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.AcademyMath=api;
})(typeof window!=='undefined'?window:globalThis);
