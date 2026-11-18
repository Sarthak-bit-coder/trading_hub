const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { handleMarket, security, types, send } = require('../server/market.js');
const { publicConfig } = require('../server/config.js');
const { guard } = require('../server/guard.js');
const root = path.resolve(__dirname);
const port = Number(process.env.PORT) || 8000;
const allowedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
const deny = (res, code, text) => { res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8', ...security }); res.end(text); };
const server = http.createServer((req, res) => {
  if (!allowedHosts.has(String(req.headers.host || '').toLowerCase())) return deny(res, 403, 'Forbidden');
  if (req.method !== 'GET' && req.method !== 'HEAD') return deny(res, 405, 'Method not allowed');
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch { return deny(res, 400, 'Bad request'); }
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { return deny(res, 400, 'Bad request'); }
  if (pathname.includes('\0')) return deny(res, 400, 'Bad request');
  if (pathname.startsWith('/api/market')) {
    if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
    return void guard(req, res, url).then(ok => ok && handleMarket(req, res, url));
  }
  if (pathname === '/api/config') return send(res, 200, publicConfig());
  // Same routes as vercel.json: landing page at /, the app at /app.
  if (pathname === '/') pathname = '/home.html';
  else if (pathname === '/app' || pathname === '/app/') pathname = '/index.html';
  const file = path.resolve(root, `.${pathname}`);
  if (file !== root && !file.startsWith(root + path.sep)) return deny(res, 403, 'Forbidden');
  fs.stat(file, (err, stat) => {
    const target = !err && stat.isDirectory() ? path.join(file, 'index.html') : file;
    fs.readFile(target, (error, data) => {
      if (error) return deny(res, 404, 'Not found');
      res.writeHead(200, { 'Content-Type': types[path.extname(target).toLowerCase()] || 'application/octet-stream', ...security });
      res.end(req.method === 'HEAD' ? undefined : data);
    });
  });
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Stop the other server or run with a different PORT.` : error.message); process.exit(1); });
if (require.main === module) server.listen(port, '127.0.0.1', () => console.log(`Trading Research Academy: http://127.0.0.1:${port}`));

module.exports = { handleMarket, server };
