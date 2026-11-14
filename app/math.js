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
  const BACKUP_VERSION=2,LESSON_COUNT=8;
  const clone=value=>typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value));
  const plainObject=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
  function saveState(storage,key,value){storage.setItem(key,JSON.stringify(value));}
  function loadState(storage,key,defaults){
    const base=clone(defaults);
    try{const saved=JSON.parse(storage.getItem(key)||'{}');return plainObject(saved)?{...base,...saved}:base}catch{return base}
  }
  function migrateBackup(backup){
    if(!plainObject(backup)||!plainObject(backup.data)||![1,2].includes(backup.version))return null;
    return {...backup,version:BACKUP_VERSION,data:clone(backup.data)};
  }
  function validateBackup(o){
    const migrated=migrateBackup(o),d=migrated?.data,required=['read','practiced','assignments','passed','mastered','bookmarks','journal','passport','strategy','friend','paperTrades','watchlist','customLessons'],extra=['misconceptions','researchInbox','savedQuestions','experiments','assistantMemory','btPaperOrders','paperEquityCurve'];
    if(!migrated||required.some(k=>!Array.isArray(d[k]))||extra.some(k=>k in d&&!Array.isArray(d[k]))||!d.notes||typeof d.notes!=='object'||Array.isArray(d.notes)||!d.studyPlan||typeof d.studyPlan!=='object'||Array.isArray(d.studyPlan)||!['light','dark'].includes(d.theme)||!Number.isFinite(d.equity)||d.equity<=0)return false;
    if([...d.read,...d.practiced,...d.assignments,...d.passed,...d.mastered,...d.bookmarks].some(n=>!Number.isInteger(n)||n<1||n>LESSON_COUNT))return false;
    if(d.journal.length>10000||d.passport.length>1000||d.strategy.length>1000||d.friend.length>1000||d.paperTrades.length>10000||d.watchlist.length>200||d.customLessons.length>500)return false;
    if(!d.journal.every(x=>x&&typeof x==='object')||!d.passport.every(x=>x&&typeof x==='object')||!d.strategy.every(x=>x&&typeof x==='object')||!d.friend.every(x=>x&&typeof x==='object'))return false;
    if(!d.watchlist.every(x=>x&&/^[A-Z0-9.^=-]{1,15}$/.test(x.symbol)&&Number.isFinite(+x.price)&&+x.price>0))return false;
    if(!d.paperTrades.every(x=>x&&(x.side==='buy'||x.side==='sell')&&/^[A-Z0-9.^=-]{1,15}$/.test(x.symbol)&&Number.isFinite(+x.qty)&&+x.qty>0&&Number.isFinite(+x.price)&&+x.price>0))return false;
    if(!d.customLessons.every(x=>x&&/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(x.id)&&typeof x.title==='string'&&typeof x.content==='string'&&x.content.length<=100000&&['available','awaiting material'].includes(x.status)))return false;
    if(Object.entries(d.notes).some(([k,v])=>k.length>80||typeof v!=='string'||v.length>100000))return false;
    if((d.misconceptions||[]).length>1000||(d.researchInbox||[]).length>5000||(d.savedQuestions||[]).length>5000||(d.experiments||[]).length>5000||(d.assistantMemory||[]).length>10)return false;
    if(!(d.misconceptions||[]).every(x=>x&&typeof x.concept==='string'&&x.concept.length<=300&&typeof x.note==='string'&&x.note.length<=5000))return false;
    if(!(d.researchInbox||[]).every(x=>x&&typeof x.creator==='string'&&x.creator.length<=500&&typeof x.url==='string'&&/^https?:\/\//i.test(x.url)&&typeof x.claim==='string'&&x.claim.length<=5000&&typeof x.excerpt==='string'&&x.excerpt.length<=10000))return false;
    if(!(d.savedQuestions||[]).every(x=>x&&typeof x.text==='string'&&x.text.length<=5000&&Number.isInteger(+x.lesson)&&+x.lesson>=1&&+x.lesson<=LESSON_COUNT))return false;
    if(!(d.experiments||[]).every(x=>x&&typeof x.version==='string'&&typeof x.hash==='string'&&Number.isFinite(+x.netPnl)))return false;
    if(!(d.assistantMemory||[]).every(x=>typeof x==='string'&&x.length<=2000))return false;
    if((d.btPaperOrders||[]).length>10000||!(d.btPaperOrders||[]).every(x=>x&&['buy','sell'].includes(x.side)&&/^[A-Z0-9.^=-]{1,15}$/.test(x.symbol)&&['filled','rejected'].includes(x.status)&&Number.isFinite(+x.qty)&&+x.qty>0&&Number.isFinite(+x.price)&&+x.price>0&&Number.isFinite(+x.executionTime)))return false;
    if('paperEquityCurve' in d&&(!Array.isArray(d.paperEquityCurve)||d.paperEquityCurve.length>10000))return false;
    if('btPaperStartingEquity' in d&&(!Number.isFinite(+d.btPaperStartingEquity)||+d.btPaperStartingEquity<=0))return false;
    if('testConsumed' in d&&typeof d.testConsumed!=='boolean')return false;
    if(Object.prototype.hasOwnProperty.call(d,'datasetMeta')&&(!d.datasetMeta||typeof d.datasetMeta!=='object'||Array.isArray(d.datasetMeta)))return false;
    return typeof d.assessmentPassed==='boolean'
  }
  function calcRiskReward(type,entry,stopLoss,takeProfit){
    const isLong=String(type).toLowerCase().includes('long')||String(type).toLowerCase()==='buy';
    const e=+entry,sl=stopLoss!==null&&stopLoss!==undefined&&stopLoss!==''?+stopLoss:null;
    const tp=takeProfit!==null&&takeProfit!==undefined&&takeProfit!==''?+takeProfit:null;
    if(!Number.isFinite(e)||e<=0)return {risk:null,reward:null,ratio:null,formatted:'—',valid:false};
    const hasSl=sl!==null&&Number.isFinite(sl)&&sl>0;
    const hasTp=tp!==null&&Number.isFinite(tp)&&tp>0;
    if(!hasSl||!hasTp){
      return {risk:hasSl?Math.abs(e-sl):null,reward:hasTp?Math.abs(tp-e):null,ratio:null,formatted:'—',valid:false};
    }
    if(isLong){
      if(sl>=e||tp<=e)return {risk:null,reward:null,ratio:null,formatted:'Invalid SL/TP',valid:false};
      const risk=e-sl,reward=tp-e,ratio=reward/risk;
      return {risk,reward,ratio,formatted:`${ratio.toFixed(2)}:1`,valid:true};
    }else{
      if(sl<=e||tp>=e)return {risk:null,reward:null,ratio:null,formatted:'Invalid SL/TP',valid:false};
      const risk=sl-e,reward=e-tp,ratio=reward/risk;
      return {risk,reward,ratio,formatted:`${ratio.toFixed(2)}:1`,valid:true};
    }
  }
  function calcTradeFriction({price,qty,side,slippageBps=5,feeBps=5}){
    const p=+price,q=+qty;
    if(!Number.isFinite(p)||p<=0||!Number.isFinite(q)||q<=0)throw new Error('Price and quantity must be positive numbers');
    const slipRate=(+slippageBps||0)*0.0001,feeRate=(+feeBps||0)*0.0001;
    const isBuy=side==='buy'||String(side).toLowerCase().includes('long');
    const executedPrice=isBuy?p*(1+slipRate):p*(1-slipRate);
    const notional=q*executedPrice;
    const fee=notional*feeRate;
    const slippageCost=Math.abs(executedPrice-p)*q;
    const totalFriction=fee+slippageCost;
    return {basePrice:p,executedPrice,notional,fee,slippageCost,totalFriction};
  }
  function parametricVaR({notional,dailyVol,confidence=0.95}){
    const n=+notional,v=+dailyVol;
    const zMap={0.9:1.28155,0.95:1.644853,0.99:2.32635};
    const errors=[];
    if(!Number.isFinite(n)||n<=0)errors.push('Notional must be positive.');
    if(!Number.isFinite(v)||v<=0)errors.push('Daily volatility must be positive.');
    if(!(confidence in zMap))errors.push('Confidence must be 90%, 95%, or 99%.');
    if(errors.length)return {errors,valid:false,varDollar:null,varPct:null,z:null};
    const z=zMap[confidence];
    const varDollar=n*v*z;
    const varPct=v*z*100;
    return {errors:[],valid:true,varDollar,varPct,z};
  }
  function targetVolSize({equity,targetVol,assetVol,price,maxLeverage=1}){
    const errors=[];const eq=+equity,tv=+targetVol,av=+assetVol,pr=+price;
    if(!Number.isFinite(eq)||eq<=0)errors.push('Equity must be positive.');
    if(!Number.isFinite(tv)||tv<=0)errors.push('Target volatility must be positive.');
    if(!Number.isFinite(av)||av<=0)errors.push('Asset volatility must be positive.');
    if(!Number.isFinite(pr)||pr<=0)errors.push('Price must be positive.');
    if(!Number.isFinite(+maxLeverage)||+maxLeverage<=0)errors.push('Maximum leverage must be positive.');
    if(errors.length)return {errors,fits:false};
    const requestedLeverage=tv/av,leverage=Math.min(requestedLeverage,+maxLeverage),capped=requestedLeverage>leverage,weight=leverage;
    const targetNotional=eq*weight;
    const targetQty=targetNotional/pr;
    const dailyVaR=targetNotional*(av/Math.sqrt(252))*1.644853;
    return {errors:[],fits:true,weight,targetNotional,targetQty,leverage,capped,dailyVaR};
  }
  function maxDrawdown(equityCurve){
    if(!Array.isArray(equityCurve)||equityCurve.length<2){
      const v=typeof equityCurve?.[0]==='number'?equityCurve[0]:(equityCurve?.[0]?.equity??0);
      return {maxDdPct:0,maxDdDollar:0,peak:v,trough:v};
    }
    let peak=-Infinity,maxDdDollar=0,maxDdPct=0,peakAtMax=0,troughAtMax=0;
    for(const pt of equityCurve){
      const val=typeof pt==='number'?pt:+pt.equity;
      if(!Number.isFinite(val))continue;
      if(val>peak)peak=val;
      const ddDollar=peak-val;
      const ddPct=peak>0?(ddDollar/peak)*100:0;
      if(ddDollar>maxDdDollar){
        maxDdDollar=ddDollar;
        maxDdPct=ddPct;
        peakAtMax=peak;
        troughAtMax=val;
      }
    }
    return {maxDdPct,maxDdDollar,peak:peakAtMax,trough:troughAtMax};
  }
  function mulberry32(seed){let value=seed>>>0;return ()=>{value|=0;value=value+0x6D2B79F5|0;let t=Math.imul(value^value>>>15,1|value);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
  function simulatePriceTick(price,annualVol,dt=1/252,z=null,rng=Math.random){
    const p=+price,v=+annualVol,deltaT=+dt;
    if(!Number.isFinite(p)||p<=0)return {newPrice:p,pctChange:0};
    let normZ=z;
    if(normZ===null||!Number.isFinite(+normZ)){
      const u1=Math.max(1e-15,rng());
      const u2=rng();
      normZ=Math.sqrt(-2.0*Math.log(u1))*Math.cos(2.0*Math.PI*u2);
    }
    const drift=-0.5*v*v*deltaT;
    const diffusion=v*Math.sqrt(deltaT)*normZ;
    const factor=Math.exp(drift+diffusion);
    const newPrice=Math.max(1e-8,p*factor);
    const pctChange=((newPrice-p)/p)*100;
    return {newPrice,pctChange};
  }
  function calcPositions(trades=[],watchlist=[]){
    const priceMap={};
    for(const w of watchlist){
      if(w&&w.symbol)priceMap[w.symbol]=+w.price;
    }
    const map={};
    let totalRealized=0,totalFees=0;
    for(const t of trades){
      if(!t||!t.symbol||!Number.isFinite(+t.qty)||+t.qty<=0)continue;
      const sym=t.symbol,qty=+t.qty,price=+t.price;
      const fee=Number.isFinite(+t.fee)?+t.fee:0;
      totalFees+=fee;
      let p=map[sym]||{symbol:sym,netQty:0,avgEntry:0,sl:null,tp:null,realized:0};
      if(t.sl!==undefined&&t.sl!==null&&t.sl!=='')p.sl=+t.sl;
      if(t.tp!==undefined&&t.tp!==null&&t.tp!=='')p.tp=+t.tp;
      if(t.side==='buy'){
        if(p.netQty>=0){
          p.avgEntry=p.netQty>0?(p.avgEntry*p.netQty+price*qty)/(p.netQty+qty):price;
          p.netQty+=qty;
        }else{
          const shortQty=Math.abs(p.netQty);
          const closeQty=Math.min(qty,shortQty);
          const tradeRealized=(p.avgEntry-price)*closeQty;
          p.realized+=tradeRealized;
          totalRealized+=tradeRealized;
          const remQty=qty-closeQty;
          if(remQty>1e-8){
            p.netQty=remQty;
            p.avgEntry=price;
          }else{
            p.netQty+=closeQty;
            if(Math.abs(p.netQty)<1e-8){
              p.netQty=0;
              p.avgEntry=0;
              p.sl=null;
              p.tp=null;
            }
          }
        }
      }else if(t.side==='sell'){
        if(p.netQty<=0){
          const shortQty=Math.abs(p.netQty);
          p.avgEntry=shortQty>0?(p.avgEntry*shortQty+price*qty)/(shortQty+qty):price;
          p.netQty-=qty;
        }else{
          const longQty=p.netQty;
          const closeQty=Math.min(qty,longQty);
          const tradeRealized=(price-p.avgEntry)*closeQty;
          p.realized+=tradeRealized;
          totalRealized+=tradeRealized;
          const remQty=qty-closeQty;
          if(remQty>1e-8){
            p.netQty=-remQty;
            p.avgEntry=price;
          }else{
            p.netQty-=closeQty;
            if(Math.abs(p.netQty)<1e-8){
              p.netQty=0;
              p.avgEntry=0;
              p.sl=null;
              p.tp=null;
            }
          }
        }
      }
      map[sym]=p;
    }
    const positions=[];
    let totalUnrealized=0,totalNotional=0;
    for(const sym of Object.keys(map)){
      const p=map[sym];
      if(Math.abs(p.netQty)<1e-8)continue;
      const isLong=p.netQty>0;
      const absQty=Math.abs(p.netQty);
      const curPrice=priceMap[sym]??p.avgEntry;
      const notional=absQty*curPrice;
      const unrealized=isLong?absQty*(curPrice-p.avgEntry):absQty*(p.avgEntry-curPrice);
      const pnlPct=p.avgEntry>0?(isLong?(curPrice-p.avgEntry)/p.avgEntry:(p.avgEntry-curPrice)/p.avgEntry)*100:0;
      let slTriggered=false,tpTriggered=false;
      if(p.sl!==null&&Number.isFinite(p.sl)){
        if(isLong&&curPrice<=p.sl)slTriggered=true;
        if(!isLong&&curPrice>=p.sl)slTriggered=true;
      }
      if(p.tp!==null&&Number.isFinite(p.tp)){
        if(isLong&&curPrice>=p.tp)tpTriggered=true;
        if(!isLong&&curPrice<=p.tp)tpTriggered=true;
      }
      const rr=calcRiskReward(isLong?'Long':'Short',p.avgEntry,p.sl,p.tp);
      positions.push({
        symbol:sym,
        type:isLong?'Long':'Short',
        side:isLong?'buy':'sell',
        qty:absQty,
        netQty:p.netQty,
        entry:p.avgEntry,
        avg:p.avgEntry,
        price:curPrice,
        notional,
        unrealized,
        pnlPct,
        sl:p.sl,
        tp:p.tp,
        riskReward:rr,
        slTriggered,
        tpTriggered,
        realized:p.realized
      });
      totalUnrealized+=unrealized;
      totalNotional+=notional;
    }
    positions.totalRealized=totalRealized;
    positions.totalFees=totalFees;
    positions.totalUnrealized=totalUnrealized;
    positions.totalNotional=totalNotional;
    return positions;
  }
  const api={BACKUP_VERSION,exposure,sizeLong,scoreQuiz,saveState,loadState,migrateBackup,validateBackup,calcRiskReward,calcTradeFriction,parametricVaR,targetVolSize,maxDrawdown,mulberry32,simulatePriceTick,calcPositions};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.AcademyMath=api;
})(typeof window!=='undefined'?window:globalThis);
