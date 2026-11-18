// Renders overview sheets (4 screens per row) of every revised screen, grouped by nav section.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const url = p => 'file:///' + p.split(path.sep).join('/');
const groups = {
  learn: ['home:Start here', 'course:Course map', 'lesson:Lesson reader', 'assessments:Assessments', 'glossary:Glossary & search', 'review:Review notebook', 'study:Study planner', 'assist:Learning assist'],
  practice: ['exposure:Exposure explorer', 'risk:Risk sizing', 'orders:Order practice', 'pretrade:Pre-trade checklist', 'paper:Paper trading lab', 'journal:Trading journal', 'passport:Product passport', 'settings:Data & settings'],
  research: ['strategy:Strategy workspace', 'backtest:Backtesting lab', 'bot:Building a trading bot', 'inbox:Research inbox', 'rjournal:Research journal', 'resources:Resource library', 'data:Data library'],
};
fs.mkdirSync(path.join(__dirname, 'sheets'), { recursive: true });
for (const [g, items] of Object.entries(groups)) {
  const cells = items.map(s => { const [k, t] = s.split(':'); return `<figure><figcaption>${t}</figcaption><img src="${url(path.join(__dirname, 'png', k + '.png'))}"></figure>`; }).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#e9e6e0;font:600 18px Segoe UI,sans-serif;color:#1c1a17}.g{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;padding:26px;align-items:start}figure{margin:0}figcaption{margin-bottom:8px}img{width:100%;border-radius:6px;box-shadow:0 1px 6px rgba(0,0,0,.12);background:#fff}</style><div class="g">${cells}</div>`;
  const f = path.join(__dirname, 'sheets', g + '.html'); fs.writeFileSync(f, html);
  execFileSync(edge, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--virtual-time-budget=4000', '--window-size=1800,1250', '--screenshot=' + path.join(__dirname, 'sheets', g + '.png'), url(f)], { stdio: 'ignore', timeout: 60000 });
  console.log('sheet', g);
}
