const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname);
const port=Number(process.env.PORT)||8000;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/markdown; charset=utf-8','.csv':'text/csv; charset=utf-8','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png'};
// Inline event handlers are used throughout the UI, so script-src needs 'unsafe-inline'.
// connect/img/form/frame restrictions still limit where injected markup could send data.
const security={'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Cross-Origin-Resource-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"};
const allowedHosts=new Set([`127.0.0.1:${port}`,`localhost:${port}`]);
const deny=(res,code,text)=>{res.writeHead(code,{'Content-Type':'text/plain; charset=utf-8',...security});res.end(text)};
const server=http.createServer((req,res)=>{
  // Reject other Host values so a DNS-rebinding page cannot read this server as its own origin.
  if(!allowedHosts.has(String(req.headers.host||'').toLowerCase()))return deny(res,403,'Forbidden');
  if(req.method!=='GET'&&req.method!=='HEAD')return deny(res,405,'Method not allowed');
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{return deny(res,400,'Bad request')}
  if(pathname.includes('\0'))return deny(res,400,'Bad request');
  const file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep))return deny(res,403,'Forbidden');
  fs.stat(file,(err,st)=>{
    const target=!err&&st.isDirectory()?path.join(file,'index.html'):file;
    fs.readFile(target,(e,data)=>{if(e)return deny(res,404,'Not found');
      res.writeHead(200,{'Content-Type':types[path.extname(target).toLowerCase()]||'application/octet-stream',...security});res.end(req.method==='HEAD'?undefined:data);
    });
  });
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is already in use. Stop the other server or run with a different PORT.`:e.message);process.exit(1)});
server.listen(port,'127.0.0.1',()=>console.log(`Trading Research Academy: http://127.0.0.1:${port}`));
