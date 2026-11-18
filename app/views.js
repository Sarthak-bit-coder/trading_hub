// Course registry, lessons, quizzes, review scheduling, journals, checklist and study plan.
// Loaded after app.js and backtest/ui.js; the functions here replace their older one-line versions.

const PARTS=[
  {n:1,file:'content/part-1.md',title:'Exposure, products, orders, margin and basic sizing',math:false},
  {n:2,file:'content/part-2-quant-strategies.md',title:'Quantitative strategies, risk and overfitting',math:true},
  {n:3,file:'content/part-3-microstructure.md',title:'Market microstructure and order books',math:false},
  {n:4,file:'content/part-4-automation.md',title:'How automated trading systems work',math:false},
  {n:5,file:'content/part-5-discipline.md',title:'Discipline, U.S. safeguards and tax basics',math:false}
];
let LESSONS=[];// {n, part, title, src}
const REVIEW_STEPS=[1,3,7,14,30,60];// days until the next review after each successful review

async function init(){
  applyTheme();
  const texts=await Promise.all(PARTS.map(p=>fetch(p.file).then(r=>r.ok?r.text():'').catch(()=>'')));
  LESSONS=[];
  texts.forEach((t,i)=>{for(const chunk of t.split(/(?=^## Lesson \d+ — )/m)){const m=chunk.match(/^## Lesson (\d+) — (.+)$/m);if(m&&chunk.startsWith('## Lesson'))LESSONS.push({n:+m[1],part:PARTS[i].n,title:m[2].trim(),src:chunk})}});
  LESSONS.sort((a,b)=>a.n-b.n);
  courseText=texts.filter(Boolean).join('\n\n')||'Unable to load course content. Run the local server from the app folder.';
  route();
}
const lessonByN=n=>LESSONS.find(l=>l.n===+n);
function lessonTitle(n){return lessonByN(n)?.title||'Lesson unavailable'}
function lessonPart(n){return lessonByN(n)?.part||'?'}
function partLessons(p){return LESSONS.filter(l=>l.part===p)}
function nextLesson(){return (LESSONS.find(l=>!state.mastered.includes(l.n))||LESSONS[0]||{n:1}).n}
const today=()=>new Date().toISOString().slice(0,10);
const addDays=d=>new Date(Date.now()+d*86400000).toISOString().slice(0,10);

// ---------- Review scheduling ----------
function dueItems(){
  const t=today(),q=(state.savedQuestions||[]).filter(x=>x.due&&x.due<=t),m=(state.misconceptions||[]).filter(x=>x.due&&x.due<=t);
  return {questions:q,misconceptions:m,total:q.length+m.length};
}
function scheduleNext(item){const stage=Math.min((item.stage||0)+1,REVIEW_STEPS.length-1);item.stage=stage;item.due=addDays(REVIEW_STEPS[stage]);item.lastReviewed=new Date().toISOString()}
function markQuestionReviewed(i){const q=state.savedQuestions[i];if(!q)return;scheduleNext(q);save();toast(`Next review ${q.due}`);assistant()}
function saveAssistQuestion(){const text=$('#assistQ').value.trim();if(!text)return;state.savedQuestions=state.savedQuestions||[];state.savedQuestions.push({text:text.slice(0,5000),mode:$('#assistMode').value,lesson:+$('#assistLesson').value,date:new Date().toISOString(),stage:0,due:addDays(REVIEW_STEPS[0])});save();assistant();toast('Question saved; first review tomorrow')}
function markMisconceptionReviewed(i){const x=state.misconceptions[i];if(!x)return;scheduleNext(x);save();toast(`Next review ${x.due}`);misconceptions()}

function misconceptions(){
  state.misconceptions=state.misconceptions||[];const t=today();
  app.innerHTML=`<div class="page-head"><div class="eyebrow">Your saved questions and mistakes</div><h1>Misconception notebook</h1><p>Record ideas you mixed up. Each note comes back for review after 1, 3, 7, 14, 30, then 60 days; marking it reviewed moves it to the next step.</p></div>
  <div class="card"><form id="misForm" class="form-grid"><div class="field"><label for="misConcept">Concept</label><input id="misConcept" name="concept" required maxlength="300" placeholder="e.g. margin vs notional"></div><div class="field"><label for="misLesson">Lesson</label><select id="misLesson" name="lesson"><option value="">Not linked</option>${LESSONS.map(l=>`<option value="${l.n}">Lesson ${l.n} · ${esc(l.title)}</option>`).join('')}</select></div><div class="field full"><label for="misNote">What I mixed up, and the corrected explanation</label><textarea id="misNote" name="note" required maxlength="5000"></textarea></div><div class="field full"><button class="button">Save misconception</button></div></form></div>
  <div class="grid grid-2">${state.misconceptions.map((x,i)=>`<div class="card"><span class="pill">${x.due&&x.due<=t?'DUE TO REVIEW':'NEXT REVIEW '+esc(x.due||'—')}</span><h3>${esc(x.concept)}</h3><p>${esc(x.note)}</p><small class="muted">${x.lesson?`Lesson ${esc(x.lesson)} · `:''}Saved ${esc((x.date||'').slice(0,10))}</small><div class="actions"><button class="button small" onclick="markMisconceptionReviewed(${i})">Reviewed</button><button class="button secondary small" onclick="deleteMisconception(${i})">Delete</button></div></div>`).join('')||'<div class="card empty">No review notes yet.</div>'}</div>`;
  $('#misForm').onsubmit=e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.target));state.misconceptions.push({concept:x.concept,note:x.note,lesson:x.lesson||'',date:new Date().toISOString(),stage:0,due:addDays(REVIEW_STEPS[0])});save();misconceptions()};
}

// ---------- Course map ----------
function courseStatus(){
  return `<div class="grid grid-2"><div class="card"><div class="row between"><h3>Core curriculum</h3><span class="status">${PARTS.filter(p=>partLessons(p.n).length).length} of ${PARTS.length} parts available</span></div>${PARTS.map(p=>{const ls=partLessons(p.n);return `<p><b>Part ${p.n} · ${ls.length?'Available':'Awaiting material'}:</b> ${esc(p.title)}${ls.length?` (Lessons ${ls[0].n}–${ls.at(-1).n})`:''}.</p>`}).join('')}</div><div class="card"><div class="row between"><h3>Your progress</h3><span class="status neutral">${state.mastered.length}/${LESSONS.length} mastered</span></div>${PARTS.filter(p=>partLessons(p.n).length).map(p=>{const ls=partLessons(p.n),done=ls.filter(l=>state.mastered.includes(l.n)).length;return `<p class="tiny"><b>Part ${p.n}</b> · ${done}/${ls.length} mastered</p><div class="progress-track"><span style="width:${ls.length?done/ls.length*100:0}%"></span></div>`}).join('')}</div></div>`;
}
function lessonRow(l){const n=l.n;return `<a class="lesson-row" href="#lesson/${n}"><span class="lesson-number">${String(n).padStart(2,'0')}</span><span><b>${esc(l.title)}</b><small>${state.read.includes(n)?'Read':'Not read'} · ${state.practiced.includes(n)?'Practiced':'Not practiced'} · Assignment ${state.assignments.includes(n)?'complete':'not complete'} · ${state.passed.includes(n)?'Quiz passed':'Quiz not passed'}</small></span><span class="status ${state.mastered.includes(n)?'':'neutral'}">${state.mastered.includes(n)?'Mastery shown':'Available'}</span></a>`}
function course(){
  app.innerHTML=`<div class="page-head"><div class="eyebrow">Your learning path</div><h1>Course map</h1><p>Progress records reading, practice, assignment, quiz performance and demonstrated mastery separately. Opening a lesson never counts as mastery. You can review any available lesson at any time.</p></div>${courseStatus()}
  ${PARTS.map(p=>{const ls=partLessons(p.n);return `<h2 class="section-title">Part ${p.n} · ${esc(p.title)}</h2>${ls.length?`<div class="lesson-list">${ls.map(lessonRow).join('')}</div>`:'<div class="card empty">Awaiting material. No progress can be earned on missing parts.</div>'}${p.n===1&&ls.length?`<div class="card" style="margin-top:9px"><div class="row between"><div><h3>Part 1 assessment</h3><p>${state.assessmentPassed?'Assessment passed':'Not yet passed'}</p></div><a class="button secondary small" href="#assessment">Open assessment</a></div></div>`:''}`}).join('')}
  ${state.customLessons.length?`<h2 class="section-title">Imported lessons</h2><div class="lesson-list">${state.customLessons.map(x=>`<a class="lesson-row" href="#custom/${encodeURIComponent(x.id)}"><span class="lesson-number">+</span><span><b>${esc(x.title)}</b><small>Part ${esc(x.part||'unspecified')} · Imported content</small></span><span class="status ${x.status==='available'?'':'waiting'}">${esc(x.status)}</span></a>`).join('')}</div>`:''}`;
}

// ---------- Lesson page ----------
const calcDrills={
  1:{q:'A $1,000 linear position falls 2%. What is the price loss before costs, in dollars?',a:20,tol:.01,why:'2% × $1,000 = $20.'},
  2:{q:'A futures contract moves four ticks against you at $1.25 per tick. Loss in dollars?',a:5,tol:.001,why:'4 × $1.25 = $5.'},
  3:{q:'A market buy fills 2 units at $100.10 and 2 units at $100.20. Average fill price?',a:100.15,tol:.001,why:'(2 × 100.10 + 2 × 100.20) ÷ 4 = $100.15.'},
  4:{q:'Loss budget $10, entry $100, stop $90, variable cost $0.50 per unit, quantity increment 0.1. Largest allowed quantity?',a:.9,tol:.001,why:'$10 ÷ ($100 − $90 + $0.50) = 0.952…, rounded down to the 0.1 increment = 0.9.'}
};
function gradeCalculation(n){const d=calcDrills[n],x=+$('#calcAnswer').value;$('#calcFeedback').textContent=Number.isFinite(x)&&Math.abs(x-d.a)<=d.tol?`Correct. ${d.why}`:`Not yet. ${d.why}`}
function saveTeachback(n){state.notes[`teachback_${n}`]=$('#teachback').value.slice(0,100000);save();toast('Teach-back saved locally')}
function lesson(n){
  if(!LESSONS.length){app.innerHTML='<div class="empty">Course content could not be loaded.</div>';return}
  const first=LESSONS[0].n,last=LESSONS.at(-1).n;n=Math.max(first,Math.min(last,+n||first));const L=lessonByN(n)||LESSONS[0];n=L.n;
  state.lesson=n;if(!state.read.includes(n)){state.read.push(n);save()}
  const full=L.src.split(/(?=^### )/m).filter(x=>!/^### (Quiz|Answers)\b/.test(x.trim())).join('');
  const heads=[...full.matchAll(/^### (.+)$/gm)].map(m=>m[1]),idx=LESSONS.indexOf(L),prev=LESSONS[idx-1],next=LESSONS[idx+1];
  const missing=LESSONS.filter(l=>l.n<n&&!state.mastered.includes(l.n)).map(l=>l.n),drill=calcDrills[n],attempts=(state.quizAttempts?.[n]||[]);
  app.innerHTML=`<div class="page-head"><div class="eyebrow">Part ${L.part} · Lesson ${n} of ${LESSONS.length}</div><h1>${esc(L.title)}</h1><p>Work through the course material below. Numerical price examples are hypothetical.</p><div class="actions"><button class="button secondary small" onclick="bookmark(${n})">${state.bookmarks.includes(n)?'★ Bookmarked':'☆ Bookmark'}</button><button class="button secondary small" onclick="markPractice(${n})">${state.practiced.includes(n)?'✓ Practiced':'Mark practiced'}</button></div></div>
  ${missing.length?`<div class="notice">Earlier checkpoint${missing.length>1?'s':''} not yet marked mastered: ${missing.slice(0,6).map(i=>`Lesson ${i}`).join(', ')}${missing.length>6?` and ${missing.length-6} more`:''}. You can continue or review earlier lessons.</div>`:''}
  <div class="lesson-layout"><article class="lesson-body">${md(full)}<hr>
  <h2 id="practice">Practice</h2>
  ${drill?`<h3>Calculation drill</h3><p>${esc(drill.q)}</p><div class="actions"><input id="calcAnswer" class="search" style="max-width:200px" type="number" step="any" aria-label="Your answer"><button class="button small" onclick="gradeCalculation(${n})">Check</button></div><p id="calcFeedback" class="tiny" role="status"></p>`:''}
  <h3>Teach-back</h3><p>Explain the main idea of this lesson in your own words, then write one sentence on what could make its worked example misleading in real trading.</p><textarea id="teachback" class="search" rows="5">${esc(state.notes[`teachback_${n}`]||'')}</textarea><div class="actions"><button class="button secondary small" onclick="saveTeachback(${n})">Save teach-back</button></div>
  <h2>Personal notes</h2><textarea id="notes" class="search" placeholder="Your notes stay in this browser…" rows="5">${esc(state.notes[n]||'')}</textarea>
  <div class="actions"><button class="button small" onclick="saveNote(${n})">Save notes</button><button class="button secondary small" onclick="quiz(${n})">Take lesson quiz</button><button class="button secondary small" onclick="markAssignment(${n})">${state.assignments.includes(n)?'✓ Assignment complete':'Mark assignment complete'}</button>${n===4?'<a class="button secondary small" href="#assessment">Part 1 assessment</a>':''}</div>
  ${attempts.length?`<p class="tiny muted">Quiz attempts: ${attempts.length} · best ${Math.max(...attempts.map(a=>a.score))}/${attempts[0].total}</p>`:''}
  <div id="quiz"></div><h2>Mastery checkpoint</h2><p>Use the checkpoint in the lesson text. Mastery is a learner attestation, not an automatic score.</p><div class="check-row"><input id="masterCheck" type="checkbox" ${state.mastered.includes(n)?'checked':''}><label for="masterCheck">I completed the checkpoint described above and can demonstrate the requested work.</label></div><button class="button small" onclick="master(${n})">Save mastery status</button></article>
  <aside class="toc"><b class="tiny">On this page</b>${[...heads,'Practice'].map(h=>`<a href="#lesson/${n}" onclick="event.preventDefault();document.getElementById('${slug(h)}')?.scrollIntoView({behavior:'smooth'})">${esc(h)}</a>`).join('')}</aside></div>
  <div class="actions">${prev?`<a class="button secondary" href="#lesson/${prev.n}">← Lesson ${prev.n}</a>`:''}${next?`<a class="button" href="#lesson/${next.n}">Lesson ${next.n} →</a>`:''}</div>`;
  renderMath(app.querySelector('.lesson-body'),PARTS.find(p=>p.n===L.part)?.math?99:0);
}

// ---------- Quizzes ----------
// Built-in quizzes (lessons 1-8) live in app.js; later lessons are parsed from the lesson's ### Quiz / ### Answers sections.
function parseQuiz(src){
  const sec=name=>(src.split(/(?=^### )/m).find(x=>new RegExp(`^### ${name}\\b`).test(x.trim()))||'').split('\n').slice(1).join('\n');
  const qs=[],ans={};let cur=null;
  for(const raw of sec('Quiz').split('\n')){const s=raw.trim();if(!s)continue;const m=s.match(/^(\d+)\.\s+(.*)$/);
    if(m){cur={q:m[2],opts:[]};qs[+m[1]-1]=cur}else if(cur&&/^[-*]?\s*[A-D][).]\s+/.test(s))cur.opts.push(s.replace(/^[-*]?\s*[A-D][).]\s+/,''));else if(cur)cur.q+=' '+s;
  }
  for(const q of qs.filter(Boolean)){if(!q.opts.length){const parts=q.q.split(/\s+(?=[A-D]\)\s)/);q.q=parts.shift();q.opts=parts.map(p=>p.replace(/^[A-D]\)\s+/,''))}}
  for(const raw of sec('Answers').split('\n')){const m=raw.trim().match(/^(\d+)\.\s*\**([A-D])\b\**\s*[—–:\-)]?\s*(.*)$/);if(m)ans[+m[1]-1]={k:'ABCD'.indexOf(m[2]),why:m[3]}}
  return qs.map((q,i)=>q&&ans[i]&&q.opts.length>1&&ans[i].k<q.opts.length?[q.q,q.opts,ans[i].k,ans[i].why]:null).filter(Boolean);
}
function quizFor(n){return quizzes[n]||parseQuiz(lessonByN(n)?.src||'')}
function shuffled(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
let currentQuiz=null;
function quiz(n){
  const q=quizFor(n);if(!q.length){$('#quiz').innerHTML='<div class="notice">No quiz is available for this lesson yet.</div>';return}
  // Shuffle question order and option order every attempt so the answer position carries no information.
  currentQuiz={n,items:shuffled(q).map(x=>{const opts=shuffled(x[1].map((t,j)=>({t,j})));return {q:x[0],opts,correct:opts.findIndex(o=>o.j===x[2]),why:x[3]}}),submitted:false};
  $('#quiz').innerHTML=`<h2>Lesson ${n} quiz</h2><p class="tiny muted">Questions and options are shuffled each attempt. Explanations unlock after you submit. Passing needs every answer right.</p><form id="quizForm">${currentQuiz.items.map((x,i)=>`<fieldset class="quiz-item"><legend>${i+1}. ${esc(x.q)}</legend>${x.opts.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${esc(o.t)}</label>`).join('')}<div class="answer" id="ans${i}"></div></fieldset>`).join('')}<button class="button small" type="button" onclick="grade(${n})">Submit answers</button> <button class="button secondary small" type="button" onclick="quiz(${n})">New attempt</button><span id="score" class="tiny" role="status"></span></form>`;
  $('#quiz').scrollIntoView({behavior:'smooth',block:'start'});
}
function grade(n){
  if(!currentQuiz||currentQuiz.n!==n)return;const items=currentQuiz.items;
  const answers=items.map((_,i)=>{const v=document.querySelector(`input[name=q${i}]:checked`);return v?+v.value:-1});
  if(answers.includes(-1)){toast('Answer every question before submitting');return}
  const result=AcademyMath.scoreQuiz(items.map(x=>x.correct),answers);
  items.forEach((x,i)=>{const el=$('#ans'+i);el.textContent=(answers[i]===x.correct?'Correct. ':`Not quite. Answer: ${x.opts[x.correct].t}. `)+(x.why||'');el.classList.add('show')});
  document.querySelectorAll('#quizForm input').forEach(x=>x.disabled=true);
  state.quizAttempts=state.quizAttempts||{};(state.quizAttempts[n]=state.quizAttempts[n]||[]).push({at:new Date().toISOString(),score:result.score,total:result.total});
  $('#score').textContent=` Score: ${result.score}/${result.total}.`;
  if(result.passed){state.passed=state.passed.includes(n)?state.passed:[...state.passed,n];toast('Quiz passed')}else toast('Review the explanations, then start a new attempt');
  save();
}

// ---------- Search ----------
function lessonSearch(q){
  const out=[];for(const l of LESSONS){let head='';for(const sec of l.src.split(/(?=^### )/m)){const h=sec.match(/^### (.+)$/m);if(h)head=h[1];if(/^### (Quiz|Answers)\b/.test(sec.trim()))continue;
    for(const line of sec.split('\n'))if(line.trim()&&!line.startsWith('#')&&line.toLowerCase().includes(q))out.push({l,head,line:line.trim()})}}
  return out;
}
const hitHtml=h=>`<div class="card"><p>${esc(h.line.slice(0,400))}</p><small class="muted">Part ${h.l.part} · <a href="#lesson/${h.l.n}">Lesson ${h.l.n}</a> · ${esc(h.head||h.l.title)}</small></div>`;
async function searchCourse(){
  const q=($('#allSearch')?.value||'').trim().toLowerCase(),out=$('#searchResults');if(!out)return;if(!q){out.innerHTML='';return}
  if(!currentResearchResources.length){try{currentResearchResources=await(await fetch('data/research-resources.json')).json()}catch{}}
  const res=currentResearchResources.filter(x=>`${x.title} ${x.creator} ${x.topics.join(' ')} ${x.why} ${x.claim}`.toLowerCase().includes(q)).map(x=>`<div class="card"><h3>${esc(x.title)}</h3><p>${esc(x.creator)} · ${esc(x.topics.join(' · '))}</p><a target="_blank" rel="noopener" href="${safeUrl(x.url)}">Open source ↗</a></div>`);
  out.innerHTML=[...lessonSearch(q).slice(0,15).map(hitHtml),...res].join('')||'<div class="empty">No course or resource matches.</div>';
}
function lookupCourse(){
  const q=$('#assistQ').value.trim().toLowerCase();if(!q){$('#assistResults').innerHTML='<p class="notice">Enter a term or question to search the lesson text.</p>';return}
  const hits=lessonSearch(q).slice(0,12);$('#assistResults').innerHTML=hits.length?`<h3>Local course matches</h3>${hits.map(hitHtml).join('')}`:'<p class="notice">No exact text match. Try a key term. This search did not consult an AI model or external sources.</p>';
}

// ---------- Home additions ----------
function reviewCard(){const d=dueItems();return `<div class="card"><div class="row between"><h3>Due for review</h3><span class="status ${d.total?'':'neutral'}">${d.total} due</span></div><p>${d.total?`${d.questions.length} saved question${d.questions.length===1?'':'s'} and ${d.misconceptions.length} misconception note${d.misconceptions.length===1?'':'s'} are due today.`:'Nothing is due. Saved questions and misconception notes come back after 1, 3, 7, 14, 30 and 60 days.'}</p><div class="actions"><a class="button secondary small" href="#assistant">Saved questions</a><a class="button secondary small" href="#misconceptions">Review notebook</a></div></div>`}

// ---------- Pre-trade checklist (saved) ----------
function pretrade(){
  state.checklist=state.checklist||{};const done=pretradeItems.filter((_,i)=>state.checklist[i]).length;
  app.innerHTML=`<div class="page-head"><div class="eyebrow">Saved in this browser</div><h1>Pre-trade checklist</h1><p>Use before every paper trade. Any unchecked item is an unknown; in this course an unknown critical detail means no trade.</p></div>
  <div class="card"><div class="field"><label for="ckSymbol">Trade this checklist is for</label><input id="ckSymbol" maxlength="80" placeholder="e.g. SPY paper buy, 2026-11-17" value="${esc(state.checklist.label||'')}" onchange="state.checklist.label=this.value;save()"></div>
  ${pretradeItems.map((x,i)=>`<div class="check-row"><input id="pc${i}" type="checkbox" ${state.checklist[i]?'checked':''} onchange="state.checklist[${i}]=this.checked;save();pretradeStatus()"><label for="pc${i}">${esc(x)}</label></div>`).join('')}
  <div id="pretradeStatus"></div><div class="actions"><button class="button secondary small" onclick="state.checklist={};save();pretrade()">Clear checklist</button><a class="button small" href="#paper">Open paper trading lab</a></div></div>`;
  pretradeStatus();
}
function pretradeStatus(){const n=pretradeItems.filter((_,i)=>state.checklist[i]).length,all=n===pretradeItems.length;$('#pretradeStatus').innerHTML=`<div class="notice ${all?'':'warning'}">${n}/${pretradeItems.length} checked · ${all?'Ready for a paper trade. This does not authorize a live trade.':'Not ready: unchecked items are unknowns.'}</div>`}

// ---------- Study planner (linked to lessons) ----------
function study(){
  state.studyPlan=state.studyPlan||{};const status=n=>state.mastered.includes(n)?'Mastered':state.passed.includes(n)?'Quiz passed':state.practiced.includes(n)?'Practiced':state.read.includes(n)?'Read':'Not started';
  app.innerHTML=`<div class="page-head"><div class="eyebrow">Your routine</div><h1>Study planner</h1><p>Give each lesson a target date if it helps. Each lesson takes about three sessions: read and reproduce the examples; complete the worksheet or simulation; take the quiz without notes and reconcile errors. Moving a date has no penalty and there are no streaks.</p></div>
  ${reviewCard()}
  <div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>Lesson</th><th>Status</th><th>Target date</th><th></th></tr></thead><tbody>${LESSONS.map(l=>{const d=state.studyPlan[l.n]||'',late=d&&d<today()&&!state.mastered.includes(l.n);return `<tr><td><b>${l.n}.</b> ${esc(l.title)}<br><small class="muted">Part ${l.part}</small></td><td>${status(l.n)}${late?' · <span class="text-red">past target</span>':''}</td><td><input type="date" aria-label="Target date for lesson ${l.n}" value="${esc(d)}" onchange="state.studyPlan[${l.n}]=this.value;save()"></td><td><a class="button secondary small" href="#lesson/${l.n}">Open</a></td></tr>`}).join('')}</tbody></table></div>
  <div class="actions"><button class="button secondary small" onclick="if(confirm('Clear all target dates?')){state.studyPlan={};save();study()}">Clear dates</button></div>
  <div class="notice">No fixed duration guarantees competence. Do not sacrifice sleep or school to keep pace.</div>`;
}

// ---------- Trading journal (grouped fields, auto-calculated P/L, summary) ----------
const journalGroups=[
  ['Trade',[['paper_or_live','Paper or live'],['timestamp_timezone','Date, time and timezone'],['symbol','Symbol'],['venue','Venue / broker'],['product_type','Product type'],['setup_version','Setup or strategy version']]],
  ['Plan',[['equity_before','Account equity before ($)'],['planned_loss_budget','Planned loss budget ($)'],['entry_planned','Planned entry ($)'],['stop_planned','Planned stop ($)'],['exit_planned','Planned target / exit ($)']]],
  ['Execution',[['quantity','Quantity'],['entry_actual','Actual entry ($)'],['exit_actual','Actual exit ($)'],['margin','Margin used ($)'],['fees','Fees ($)'],['funding_borrow_cost','Funding / borrow cost ($)']]],
  ['Result (calculated)',[['notional','Notional ($)'],['gross_pnl','Gross P/L ($)'],['net_pnl','Net P/L ($)']]],
  ['Review',[['rule_followed','Rules followed?'],['decision_quality','Decision quality'],['screenshot_reference','Screenshot or file reference'],['notes','Notes: what happened, what I would repeat or change']]]
];
const journalNumeric=['equity_before','entry_planned','entry_actual','quantity','notional','margin','stop_planned','exit_planned','exit_actual','gross_pnl','fees','funding_borrow_cost','net_pnl','planned_loss_budget'];
function journalCalc(){
  const f=$('#jform');if(!f)return;const v=k=>f.elements[k].value===''?NaN:+f.elements[k].value,set=(k,x)=>f.elements[k].value=Number.isFinite(x)?Math.round(x*100)/100:'';
  const q=v('quantity'),en=v('entry_actual'),ex=v('exit_actual'),fees=v('fees')||0,fund=v('funding_borrow_cost')||0;
  set('notional',q*en);const gross=q*(ex-en);set('gross_pnl',gross);set('net_pnl',gross-fees-fund);
}
function journalSummary(items){
  const closed=items.filter(x=>x.net_pnl!==''&&Number.isFinite(+x.net_pnl));if(!items.length)return '';
  const net=closed.reduce((s,x)=>s+ +x.net_pnl,0),wins=closed.filter(x=>+x.net_pnl>0).length,ruled=items.filter(x=>x.rule_followed==='yes').length,rated=items.filter(x=>x.rule_followed).length,good=items.filter(x=>x.decision_quality==='good').length;
  return `<div class="grid grid-3" style="margin-bottom:14px"><div class="card"><div class="metric">${cash(net)}</div><div class="metric-label">Net P/L across ${closed.length} closed entr${closed.length===1?'y':'ies'}</div></div><div class="card"><div class="metric">${closed.length?Math.round(wins/closed.length*100)+'%':'—'}</div><div class="metric-label">Winning entries</div></div><div class="card"><div class="metric">${rated?Math.round(ruled/rated*100)+'%':'—'}</div><div class="metric-label">Rules followed (of ${rated} rated) · ${good} rated good decisions</div></div></div><p class="tiny muted">Outcome and decision quality are tracked separately: a winning trade can still be a poor decision.</p>`;
}
function journal(){const items=state.journal;app.innerHTML=`<div class="page-head"><div class="eyebrow">Private · saved in this browser</div><h1>Trading journal</h1><p>Separate process quality from outcome. A winning result does not automatically mean the decision was good.</p></div>${journalSummary(items)}<div class="toolbar"><button class="button" onclick="journalForm()">＋ Add entry</button><button class="button secondary" onclick="exportCsv('journal')">Export CSV</button><input class="search" id="jsearch" placeholder="Search symbol, setup, notes…" oninput="filterJournal()" aria-label="Search journal"></div><div class="card"><div id="journalRows">${journalTable(items)}</div></div>`}
function journalForm(i=-1,prefill={}){
  const x=i<0?{...prefill}:state.journal[i],sel=(k,opts,blank)=>`<select id="jf-${k}" name="${k}"><option value="">${blank}</option>${opts.map(o=>`<option ${x[k]===o?'selected':''}>${o}</option>`).join('')}</select>`;
  const input=(k,label)=>{const auto=['notional','gross_pnl','net_pnl'].includes(k);return `<div class="field ${k==='notes'?'full':''}"><label for="jf-${k}">${label}</label>${k==='notes'?`<textarea id="jf-${k}" name="${k}" maxlength="20000">${esc(x[k]||'')}</textarea>`:k==='paper_or_live'?sel(k,['paper','live'],'Choose…'):k==='rule_followed'?sel(k,['yes','no','partial'],'Not recorded'):k==='decision_quality'?sel(k,['good','mixed','poor'],'Not rated'):`<input id="jf-${k}" name="${k}" value="${esc(x[k]??'')}" ${journalNumeric.includes(k)?'type="number" step="any"':''} ${auto?'readonly tabindex="-1"':''}>`}${auto?'<span class="hint">Calculated from quantity, entry, exit and costs</span>':''}</div>`};
  app.innerHTML=`<div class="page-head"><div class="eyebrow">Journal entry</div><h1>${i<0?'Add':'Edit'} entry</h1><p>A personal record, not a performance claim. Notional and P/L fill in as you type.</p></div><div class="card"><form id="jform">${journalGroups.map(([g,fs])=>`<fieldset class="form-group"><legend>${g}</legend><div class="form-grid">${fs.map(([k,l])=>input(k,l)).join('')}</div></fieldset>`).join('')}<div class="actions"><button class="button" type="submit">Save entry</button><a href="#journal" class="button secondary">Cancel</a></div></form></div>`;
  const f=$('#jform');f.addEventListener('input',journalCalc);journalCalc();
  f.onsubmit=e=>{e.preventDefault();const v=Object.fromEntries(new FormData(f));journalNumeric.filter(k=>['notional','gross_pnl','net_pnl'].includes(k)).forEach(k=>v[k]=f.elements[k].value);if(i<0)state.journal.unshift(v);else state.journal[i]=v;save();location.hash='#journal';toast('Entry saved locally')};
}

// ---------- Research journal ----------
const researchFields=[['question','Research question','What exactly am I trying to find out?'],['hypothesis','Hypothesis and why it might be true','State a mechanism, not just a pattern.'],['data','Data used','Symbol, source, dates, adjustment policy.'],['method','Method','Rule, parameters, costs, split. Decide this before looking at results.'],['experiment','Linked experiment',''],['result','What happened','Numbers from the run, including trade count and costs.'],['threats','What could make this misleading','Overfitting, data snooping, survivorship, costs, small sample.'],['next','Next step','']];
function researchJournal(){
  state.researchJournal=state.researchJournal||[];const exps=(state.experiments||[]).slice().reverse();
  app.innerHTML=`<div class="page-head"><div class="eyebrow">Saved in this browser</div><h1>Research journal</h1><p>One entry per question you test. Write the method before you look at results, then record what happened and decide. Rejected ideas are useful records too.</p></div>
  <div class="card"><form id="rjForm" class="form-grid">${researchFields.map(([k,l,ph])=>`<div class="field ${['question','experiment','data'].includes(k)?'':'full'}"><label for="rj-${k}">${l}</label>${k==='experiment'?`<select id="rj-${k}" name="${k}"><option value="">None</option>${exps.map(x=>`<option value="${esc(x.version)}">${esc(x.version)} · ${esc(x.rule)} · ${esc((x.date||'').slice(0,10))}</option>`).join('')}</select>`:k==='question'||k==='data'?`<input id="rj-${k}" name="${k}" maxlength="500" placeholder="${esc(ph)}" ${k==='question'?'required':''}>`:`<textarea id="rj-${k}" name="${k}" maxlength="5000" placeholder="${esc(ph)}"></textarea>`}</div>`).join('')}<div class="field"><label for="rj-decision">Decision</label><select id="rj-decision" name="decision"><option>open</option><option>continue testing</option><option>revise and retest</option><option>reject</option></select></div><div class="field full"><button class="button">Save research entry</button></div></form></div>
  <div class="grid">${state.researchJournal.map((x,i)=>`<article class="card"><div class="row between"><span class="status ${x.decision==='reject'?'waiting':'neutral'}">${esc(x.decision)}</span><small class="muted">${esc((x.date||'').slice(0,10))}${x.experiment?' · '+esc(x.experiment):''}</small></div><h3>${esc(x.question)}</h3>${researchFields.slice(1).filter(([k])=>x[k]&&k!=='experiment').map(([k,l])=>`<p><b>${l}:</b> ${esc(x[k])}</p>`).join('')}<div class="actions"><button class="button secondary small" onclick="if(confirm('Delete this research entry?')){state.researchJournal.splice(${i},1);save();researchJournal()}">Delete</button></div></article>`).join('')||'<div class="card empty">No research entries yet.</div>'}</div>`;
  $('#rjForm').onsubmit=e=>{e.preventDefault();state.researchJournal.unshift({...Object.fromEntries(new FormData(e.target)),date:new Date().toISOString()});save();researchJournal();toast('Research entry saved')};
}

// ---------- Connect sizing to the paper ticket and journal ----------
const _calcSizing=calcSizing;
calcSizing=function(){_calcSizing();const s=state.lastSizing;if(!s||$('#sizeResults .notice.warning'))return;$('#sizeResults').insertAdjacentHTML('beforeend',`<div class="actions"><button class="button small" onclick="sendSizingToPaper()">Send to paper order ticket</button><button class="button secondary small" onclick="sendSizingToJournal()">Log plan in journal</button></div>`)};
function sendSizingToPaper(){const s=state.lastSizing;state.ticketDraft={qty:s.quantity,sl:s.stop,entry:s.entry};save();location.hash='#paper'}
function sendSizingToJournal(){const s=state.lastSizing;location.hash='#journal';setTimeout(()=>journalForm(-1,{paper_or_live:'paper',equity_before:s.equity,planned_loss_budget:s.budget,entry_planned:s.entry,stop_planned:s.stop,quantity:s.quantity}),0)}

function render(v,arg){const views={home,course,lesson,assessment,exposure,sizing,orders,paper,pretrade,journal,passport,testing,friend,backtest,assistant,inbox,misconceptions,'research-journal':researchJournal,resources:resourcePage,glossary,study,settings,custom:customLessonPage};(Object.hasOwn(views,v)?views[v]:home)(arg)}

init();
