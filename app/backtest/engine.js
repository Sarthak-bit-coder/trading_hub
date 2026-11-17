(function(root){
  const finite=x=>Number.isFinite(Number(x));
  function parseCSV(text){
    if(typeof text!=='string'||text.length>15_000_000)throw new Error('CSV is empty or exceeds the 15 MB limit.');
    const rows=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++}else if(c==='"')quoted=false;else cell+=c;continue}
      if(c==='"'&&cell===''){quoted=true;continue}
      if(c===','){row.push(cell);cell='';continue}
      if(c==='\n'){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';continue}
      cell+=c;
    }
    if(quoted)throw new Error('CSV has an unclosed quoted field.');
    if(cell.length||row.length){row.push(cell.replace(/\r$/,''));rows.push(row)}
    const nonempty=rows.filter(r=>r.some(c=>String(c).trim()!==''));if(nonempty.length<2)throw new Error('CSV needs a header and at least two data rows.');
    const headers=nonempty.shift().map(x=>x.trim().toLowerCase());
    const index={time:headers.findIndex(x=>['timestamp','datetime','date','time'].includes(x)),open:headers.indexOf('open'),high:headers.indexOf('high'),low:headers.indexOf('low'),close:headers.indexOf('close'),volume:headers.indexOf('volume')};
    if(Object.entries(index).some(([k,v])=>k!=='volume'&&v<0))throw new Error('Required columns: timestamp (or date), open, high, low, close. Volume is optional.');
    const bars=nonempty.map((r,j)=>{
      const stamp=String(r[index.time]??'').trim();if(!/^\d{4}-\d\d-\d\d$/.test(stamp)&&!/(Z|[+-]\d\d:\d\d)$/i.test(stamp))throw new Error(`Timestamp on data row ${j+2} needs an explicit timezone (Z or ±HH:MM); date-only daily bars are treated as UTC.`);
      const time=Date.parse(stamp),o=Number(r[index.open]),h=Number(r[index.high]),l=Number(r[index.low]),c=Number(r[index.close]),v=index.volume<0?null:Number(r[index.volume]);
      if(!Number.isFinite(time)||[o,h,l,c].some(x=>!Number.isFinite(x))||!(l<=Math.min(o,c)&&h>=Math.max(o,c)&&h>=l))throw new Error(`Invalid timestamp or OHLC values on data row ${j+2}. Check timezone and candle integrity.`);
      if(index.volume>=0&&(!Number.isFinite(v)||v<0))throw new Error(`Invalid volume on data row ${j+2}.`);
      return {time,o,h,l,c,v,sourceRow:j+2};
    }).sort((a,b)=>a.time-b.time);
    for(let i=1;i<bars.length;i++)if(bars[i].time===bars[i-1].time)throw new Error(`Duplicate timestamp: ${new Date(bars[i].time).toISOString()}`);
    return bars;
  }
  function smaAt(bars,i,n){if(i<n-1)return null;let s=0;for(let j=i-n+1;j<=i;j++)s+=bars[j].c;return s/n}
  function run({bars,smaLength=5,strategy=null,startEquity=10000,allocationPct=25,feeBps=1,slippageBps=2,stopLossPct=null,targetPct=null,annualizationFactor=252,seed=1}){
    if(!Array.isArray(bars)||(!strategy&&bars.length<Number(smaLength)+2)||strategy&&bars.length<2)throw new Error(`Need enough valid bars for this strategy.`);
    if(!Number.isInteger(+smaLength)||smaLength<2||!finite(startEquity)||startEquity<=0||!finite(allocationPct)||allocationPct<=0||allocationPct>100||!finite(feeBps)||feeBps<0||!finite(slippageBps)||slippageBps<0)throw new Error('Check strategy settings: SMA length ≥2, equity >0, allocation 0–100%, costs ≥0.');
    const strategyBars=strategy?bars.map(bar=>Object.freeze({...bar})):null;
    let cash=Number(startEquity),position=null,pending=null;const trades=[],equity=[],signals=[];const costsBps=Number(feeBps)+Number(slippageBps);
    let exposureBars=0,ambiguousStopTarget=false;
    for(let i=0;i<bars.length;i++){
      const b=bars[i];
      if(pending){
        const side=pending.side, slip=Number(slippageBps)/10000, fill=b.o*(side==='buy'?1+slip:1-slip);
        if(side==='buy'&&!position){const budget=cash*Number(allocationPct)/100;const qty=budget/(fill*(1+Number(feeBps)/10000));const entryFee=qty*fill*Number(feeBps)/10000;position={qty,fill,time:b.time,entryBar:i,entryFee,signalTime:pending.signalTime,stop:stopLossPct==null?null:fill*(1-Number(stopLossPct)/100),target:targetPct==null?null:fill*(1+Number(targetPct)/100)};cash-=qty*fill+entryFee;}
        else if(side==='sell'&&position){const exitFee=position.qty*fill*Number(feeBps)/10000;const gross=position.qty*(fill-position.fill),net=gross-position.entryFee-exitFee;cash+=position.qty*fill-exitFee;trades.push({entryTime:position.time,exitTime:b.time,entrySignalTime:position.signalTime,entryPrice:position.fill,exitPrice:fill,quantity:position.qty,grossPnl:gross,fees:position.entryFee+exitFee,netPnl:net,barsHeld:i-position.entryBar});position=null;}
        pending=null;
      }
      if(position){exposureBars++;const stop=position.stop,target=position.target,stopHit=stop!=null&&b.l<=stop,targetHit=target!=null&&b.h>=target;if(stopHit||targetHit){if(stopHit&&targetHit)ambiguousStopTarget=true;const px=stopHit?Math.min(b.o,stop):Math.max(b.o,target),fee=position.qty*px*Number(feeBps)/10000,gross=position.qty*(px-position.fill),net=gross-position.entryFee-fee;cash+=position.qty*px-fee;trades.push({entryTime:position.time,exitTime:b.time,entrySignalTime:position.signalTime,entryPrice:position.fill,exitPrice:px,quantity:position.qty,grossPnl:gross,fees:position.entryFee+fee,netPnl:net,barsHeld:i-position.entryBar,ambiguousStopTarget:stopHit&&targetHit});position=null;}}
      let side=null;
      if(strategy){side=strategy.signal.call(strategy,{length:i+1,bar:k=>Number.isInteger(k)&&k>=0&&k<=i?strategyBars[k]:undefined,close:k=>Number.isInteger(k)&&k>=0&&k<=i?strategyBars[k].c:undefined});}
      else {const prevSma=smaAt(bars,i-1,+smaLength),nowSma=smaAt(bars,i,+smaLength);if(i>0&&prevSma!==null&&nowSma!==null){
        if(!position&&bars[i-1].c<=prevSma&&b.c>nowSma)side='buy';else if(position&&bars[i-1].c>=prevSma&&b.c<nowSma)side='sell';}}
      if(side&&((side==='buy'&&!position)||(side==='sell'&&position))){pending={side,signalTime:b.time};signals.push({time:b.time,side})}
      const marked=position?cash+position.qty*b.c:cash;equity.push({time:b.time,value:marked});
    }
    const last=bars.at(-1);const openPosition=position?{quantity:position.qty,entryTime:position.time,entryPrice:position.fill,markPrice:last.c,entryFee:position.entryFee,unrealizedPnl:position.qty*(last.c-position.fill)-position.entryFee}:null;
    let peak=Number(startEquity),maxDrawdown=0;for(const p of equity){peak=Math.max(peak,p.value);if(peak>0)maxDrawdown=Math.max(maxDrawdown,(peak-p.value)/peak)}
    const wins=trades.filter(t=>t.netPnl>0),losses=trades.filter(t=>t.netPnl<0),sum=xs=>xs.reduce((a,x)=>a+x.netPnl,0),gross=sum(trades);
    const grossGains=trades.filter(t=>t.netPnl>0).reduce((a,t)=>a+t.netPnl,0),grossLosses=Math.abs(trades.filter(t=>t.netPnl<0).reduce((a,t)=>a+t.netPnl,0));
    const firstBar=bars[0],lastBar=bars.at(-1),buyFill=firstBar.o*(1+Number(slippageBps)/10000),sellFill=lastBar.c*(1-Number(slippageBps)/10000),benchQty=(Number(startEquity)*Number(allocationPct)/100)/(buyFill*(1+Number(feeBps)/10000)),benchmarkEquity=Number(startEquity)-benchQty*buyFill-benchQty*buyFill*Number(feeBps)/10000+benchQty*sellFill-benchQty*sellFill*Number(feeBps)/10000;
    const estimatedExitFee=openPosition?openPosition.quantity*openPosition.markPrice*Number(feeBps)/10000:0;
    const result={barsCount:bars.length,trades,equity,signals,openPosition,finalEquity:equity.at(-1).value,netPnl:equity.at(-1).value-Number(startEquity),benchmarkEquity,benchmarkPnl:benchmarkEquity-Number(startEquity),maxDrawdown,winRate:trades.length?wins.length/trades.length:null,expectancy:trades.length?sum(trades)/trades.length:null,profitFactor:grossLosses?grossGains/grossLosses:null,feeBps:Number(feeBps),slippageBps:Number(slippageBps),smaLength:+smaLength,allocationPct:+allocationPct,startEquity:+startEquity,fees:trades.reduce((a,t)=>a+t.fees,0)+(openPosition?.entryFee||0),estimatedExitFee,unclosedSignal:pending,unrealizedPnl:openPosition?.unrealizedPnl||0,exposureBars,ambiguousStopTarget};
    if(root.BacktestMetrics){result.metrics=root.BacktestMetrics.calculate(result,{annualizationFactor,seed});}return result;
  }
  function csv(rows){const safe=x=>{let s=String(x??'');if(!/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(s)&&/^[=+\-@\t\r]/.test(s))s="'"+s;return `"${s.replaceAll('"','""')}"`};return rows.map(r=>r.map(safe).join(',')).join('\r\n')}
  const api={parseCSV,run,csv};if(typeof module!=='undefined'&&module.exports){api.strategies=require('./strategies.js');api.metrics=require('./metrics.js');module.exports=api;root.BacktestMetrics=api.metrics;root.BacktestStrategies=api.strategies;}root.BacktestEngine=api;
})(typeof window!=='undefined'?window:globalThis);
