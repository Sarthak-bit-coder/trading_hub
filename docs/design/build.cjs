// Inlines the shared sidebar into each page and renders PNGs with headless Edge.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const dir = __dirname, side = fs.readFileSync(path.join(dir, 'sidebar.html'), 'utf8');
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
fs.mkdirSync(path.join(dir, 'out'), { recursive: true }); fs.mkdirSync(path.join(dir, 'png'), { recursive: true });
const only = process.argv.slice(2);
for (const f of fs.readdirSync(path.join(dir, 'src')).filter(f => f.endsWith('.html'))) {
  const name = f.replace('.html', '');
  if (only.length && !only.includes(name)) continue;
  const html = fs.readFileSync(path.join(dir, 'src', f), 'utf8').replace(/<!--SIDEBAR:(\w+)-->/, (_, k) => side.replace(`data-k="${k}"`, `data-k="${k}" class="on"`));
  const out = path.join(dir, 'out', f); fs.writeFileSync(out, html);
  const h = Number((html.match(/<!--HEIGHT:(\d+)-->/) || [])[1] || 1100);
  execFileSync(edge, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=8000', `--window-size=1280,${h}`, `--screenshot=${path.join(dir, 'png', name + '.png')}`, 'file:///' + out.replace(/\\/g, '/')], { stdio: 'ignore', timeout: 60000 });
  console.log('rendered', name, h);
}
