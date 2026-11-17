(function(root){
  function mulberry32(seed){
    let state=Number(seed)>>>0;
    return function(){
      let t=state+=0x6D2B79F5;
      t=Math.imul(t^(t>>>15),t|1);
      t^=t+Math.imul(t^(t>>>7),t|61);
      return ((t^(t>>>14))>>>0)/4294967296;
    };
  }
  function generateBars({seed,count,start='2020-01-01',startPrice=100,drift=0.0003,vol=0.015,stepDays=1}={}){
    if(!Number.isInteger(seed)||!Number.isFinite(seed))throw new Error('seed must be a finite integer.');
    if(!Number.isInteger(count)||count<2)throw new Error('count must be an integer of at least 2.');
    if(typeof start!=='string'||!/^\d{4}-\d\d-\d\d$/.test(start)||!Number.isFinite(Date.parse(start+'T00:00:00Z'))||new Date(start+'T00:00:00Z').toISOString().slice(0,10)!==start)throw new Error('start must be a valid YYYY-MM-DD date.');
    if(!Number.isFinite(startPrice)||startPrice<=0)throw new Error('startPrice must be finite and greater than 0.');
    if(!Number.isFinite(drift))throw new Error('drift must be finite.');
    if(!Number.isFinite(vol)||vol<0)throw new Error('vol must be finite and at least 0.');
    if(!Number.isFinite(stepDays)||stepDays<=0)throw new Error('stepDays must be finite and greater than 0.');
    const random=mulberry32(seed),bars=[];let close=startPrice,spare=null;
    function normal(){
      if(spare!==null){const value=spare;spare=null;return value}
      let u=0,v=0;while(u===0)u=random();while(v===0)v=random();
      const radius=Math.sqrt(-2*Math.log(u)),angle=2*Math.PI*v;
      spare=radius*Math.sin(angle);return radius*Math.cos(angle);
    }
    for(let i=0;i<count;i++){
      const o=close;
      if(i>0)close=o*Math.exp((drift-vol*vol/2)+vol*normal());
      const c=close,spread=vol*(0.25+random());
      const h=Math.max(o,c)*(1+spread),l=Math.min(o,c)*Math.exp(-spread);
      bars.push({time:Date.parse(start+'T00:00:00Z')+i*stepDays*86400000,o,h,l,c,v:Math.floor(random()*1000000)});
    }
    return {name:`SYNTHETIC-GBM-seed${seed}`,synthetic:true,bars};
  }
  const api={mulberry32,generateBars};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.SyntheticData=api;
})(typeof window!=='undefined'?window:globalThis);
