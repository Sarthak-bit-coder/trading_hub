(function(root){
  const registry={
    'user-csv':{id:'user-csv',available:true,load:text=>root.BacktestEngine.parseCSV(text),provenance:'User supplied; not independently verified'},
    'yahoo-authorized-api':{id:'yahoo-authorized-api',available:false,reason:'Authorized Yahoo API product, endpoint, terms and authentication method are not identified. No undocumented endpoint is called.'}
  };
  const api={list:()=>Object.values(registry).map(({id,available,reason,provenance})=>({id,available,reason,provenance})),load:(id,payload)=>{const p=registry[id];if(!p||!p.available)throw new Error(p?.reason||'Unknown market-data provider');return p.load(payload)}};
  root.MarketDataProviders=api;
})(typeof window!=='undefined'?window:globalThis);
