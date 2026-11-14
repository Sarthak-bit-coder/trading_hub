# `app.js` Modularization Plan & Migration Specification

This document specifies the exact refactoring of `app/app.js` (~71 KB single script) into standard, unbundled ES modules (`<script type="module">`). It fulfills the preparatory planning requirements of **Task P0-3** as defined in `materials/MASTER_PLAN.md`.

---

## 1. Target Folder & Module Structure

All files reside under `app/`, using native browser ES modules with relative imports (`.js` extension required) and zero build step.

```text
app/
├── index.html                  # <script type="module" src="main.js">
├── main.js                     # Root entry point: event delegation, router setup, lifecycle init
├── state.js                    # Reactive/persisted state store, load/save, constants, DEFAULT_WATCHLIST
├── router.js                   # Hash router, route registration, crumb & navigation sync
├── dom.js                      # DOM helper utilities ($, $$, esc, fmt, cash, fmtPrice, fmtQty, toast, theme)
├── markdown.js                 # Markdown parser, inline tokenizer, slug generator
├── views/                      # Domain & page view renderers
│   ├── home.js                 # #home view, route steps, summary metrics
│   ├── course.js               # #course view, course status, lesson listings
│   ├── lesson.js               # #lesson/:id reader, personal notes, checkpoints, bookmarks
│   ├── assessment.js           # #assessment view, Part 1 exam scoring & liquidation explanation
│   ├── exposure.js             # #exposure view, linear long model calculations
│   ├── sizing.js               # #sizing view, planned loss risk-sizing worksheet
│   ├── orders.js               # #orders view, hypothetical execution scenario practice
│   ├── pretrade.js             # #pretrade view, pre-trade risk checklist
│   ├── paper.js                # #paper view, order ticket, watchlist, simulated positions & orders
│   ├── journal.js              # #journal view, trade journal table, entry form, search
│   ├── passport.js             # #passport view, product diligence passport cards & form
│   ├── testing.js              # #testing view, strategy testing worksheet records & form
│   ├── friend.js               # #friend view, friend-strategy intake review & form
│   ├── resources.js            # #resources view, verified resource library cards & search filter
│   ├── glossary.js             # #glossary view, term cards, glossary filter & course search
│   ├── study.js                # #study view, study planner routine & schedule dates
│   ├── custom.js               # #custom/:id view, custom imported lesson renderer
│   ├── assistant.js            # #assistant view, learning assist local search & memory note
│   ├── misconceptions.js       # #misconceptions view, misconception notebook & review dates
│   └── settings.js             # #settings view, backup/restore, lesson JSON import, reset, CSV export
└── components/
    ├── quiz.js                 # Quiz rendering, option shuffling, grade & explanation reveal
    └── export.js               # CSV generator with formula-injection guard, JSON download helper
```

---

## 2. Function-to-Module Mapping

| Original Function in `app.js` | Destination Module | Description / Role |
| :--- | :--- | :--- |
| `$` | `dom.js` | `document.querySelector` wrapper |
| `KEY`, `DEFAULT_WATCHLIST`, `initial`, `state` | `state.js` | Application state management and storage constants |
| `loadState()`, `save()` | `state.js` | Read/write from `localStorage` using `AcademyMath` |
| `esc()`, `fmt()`, `cash()`, `fmtPrice()`, `fmtQty()` | `dom.js` | Formatting and escaping helpers |
| `toast()` | `dom.js` | Notification toast trigger |
| `applyTheme()`, `toggleTheme()` | `dom.js` | Theme attribute sync on `document.documentElement` |
| `init()` | `main.js` | Bootstrap lifecycle: theme, course text fetch, route |
| `route()`, `render()` | `router.js` | Hash change router and view dispatcher |
| `home()`, `toggleFirstSession()` | `views/home.js` | Home dashboard and onboarding steps |
| `lessonTitle()`, `courseStatus()`, `course()` | `views/course.js` | Course catalog, part listings, status summary |
| `md()`, `inline()`, `slug()` | `markdown.js` | Markdown parsing and text formatting |
| `lesson()`, `bookmark()`, `markPractice()`, `markAssignment()`, `saveNote()`, `master()` | `views/lesson.js` | Lesson reader and interactive study tools |
| `quizzes`, `quiz()`, `grade()`, `showAnswers()` | `components/quiz.js` | Lesson quiz state, question rendering, grading |
| `assessQ`, `assessment()`, `gradeAssessment()`, `revealAssessment()` | `views/assessment.js` | Part 1 capstone assessment exam |
| `exposure()`, `calcExposure()` | `views/exposure.js` | Exposure explorer interactive model |
| `sizing()`, `calcSizing()` | `views/sizing.js` | Risk sizing calculator and constraint checks |
| `scenarios`, `orders()`, `revealOrder()` | `views/orders.js` | Order-type execution scenario practice |
| `pretradeItems`, `pretrade()` | `views/pretrade.js` | Pre-trade risk checklist |
| `paper()`, `paperPositions()`, `changePrice()`, `addSymbol()`, `paperOrder()` | `views/paper.js` | Virtual paper trading sandbox |
| `journalFields`, `journal()`, `journalTable()`, `journalForm()`, `editJournal()`, `deleteJournal()`, `filterJournal()` | `views/journal.js` | Trade journal logs and editor |
| `passportFields`, `passport()`, `passportForm()`, `editPassport()` | `views/passport.js` | Product due diligence passport |
| `strategyFields`, `testing()`, `strategyForm()`, `editStrategy()` | `views/testing.js` | Strategy testing worksheet |
| `friendFields`, `friend()`, `friendForm()`, `editFriend()` | `views/friend.js` | Friend strategy intake review |
| `resources`, `resourcePage()`, `filterResearchResources()` | `views/resources.js` | Research resource library |
| `glossary()`, `filterGlossary()`, `searchCourse()` | `views/glossary.js` | Vocabulary lookup and full-text search |
| `study()`, `saveStudyPlan()` | `views/study.js` | Study routine scheduler |
| `customLessonPage()` | `views/custom.js` | Custom imported lesson viewer |
| `settings()`, `previewLessonImport()`, `applyLessonImport()`, `backup()`, `restore()`, `resetData()` | `views/settings.js` | Backup, restore, import, and data reset |
| `escapeCsv()`, `exportCsv()`, `download()` | `components/export.js` | Formula-safe CSV and JSON export routines |

---

## 3. Dead Code & Duplicate Implementations

The audit identified the following dead code, duplicates, and collisions:

1. **`resourcePage()` Redefinition (Dead / Overridden Function):**
   - Line 53 in `app/app.js` defines an asynchronous `resourcePage()` that fetches `app/data/research-resources.json`.
   - Line 84 in `app/app.js` defines a synchronous `resourcePage()` using static `resources` array.
   - Line 84 silently clobbers Line 53.
   - **Resolution:** Consolidate into `app/views/resources.js`, fetching `research-resources.json` with fallback to static references.
2. **`searchCourse()` Redefinition:**
   - Line 59 in `app/app.js` defines an asynchronous `searchCourse()` querying both course text and `research-resources.json`.
   - Line 87 in `app/app.js` defines a synchronous `searchCourse()` searching only course text.
   - Line 87 clobbers Line 59.
   - **Resolution:** Keep the unified search querying course text + resource database in `views/glossary.js`.
3. **Orphaned / Unwired Learning Functions (Issue B12):**
   - `toggleFlashcard(id)` (Line 54)
   - `gradeCalculation(n)` (Line 55)
   - `gradeScenario(n)` (Line 56)
   - `saveTeachback(n)` (Line 57)
   - These functions are defined in `app/app.js` but never referenced by any UI template.
   - **Resolution:** As specified in Task P0-3 / A-5, wire them cleanly into lesson interactive panels or modularize into a dedicated study-tools helper.
4. **`csvParse(s)` Unused Helper:**
   - Line 68 defines `csvParse(s)`, but it is never invoked anywhere in `app.js`.
   - **Resolution:** Move to `components/export.js` or discard if redundant with `backtest/engine.js`.
5. **Divergent CSV Export Guards (Issue B3):**
   - `app/app.js` `escapeCsv` and `app/backtest/engine.js` `csv` guard negative numbers by quoting (`'-625`), converting negative numbers to text.
   - **Resolution:** Unify in `components/export.js` with regex distinguishing leading `-` on non-numeric strings vs actual numbers.

---

## 4. Complete Inventory of Inline Handlers & Event Delegation Plan

Because `<script type="module">` creates a scoped module context where top-level functions are **not** attached to `window`, inline attributes (`onclick="..."`, `onchange="..."`, `oninput="..."`) fail with `ReferenceError`.

All user actions will be converted to `data-action` attributes and handled via delegated listeners on `#app` in `main.js`:

```javascript
// Example delegation in app/main.js
document.querySelector('#app').addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  actions[action]?.(target, e);
});
```

### Complete Inline Handler Map (49 Instances)

| Line | Original Attribute | Target Component / Action | New `data-action` Mapping |
| :--- | :--- | :--- | :--- |
| 32 | `onclick="toggleFirstSession('${s.id}')"` | Home route step checkbox | `data-action="toggle-first-session" data-step-id="${s.id}"` |
| 40 | `onclick="bookmark(${n})"` | Bookmark lesson | `data-action="bookmark-lesson" data-lesson="${n}"` |
| 40 | `onclick="markPractice(${n})"` | Mark lesson practiced | `data-action="mark-practice" data-lesson="${n}"` |
| 40 | `onclick="saveNote(${n})"` | Save personal note | `data-action="save-note" data-lesson="${n}"` |
| 40 | `onclick="quiz(${n})"` | Launch lesson quiz | `data-action="start-quiz" data-lesson="${n}"` |
| 40 | `onclick="markAssignment(${n})"` | Mark assignment done | `data-action="mark-assignment" data-lesson="${n}"` |
| 40 | `onclick="master(${n})"` | Attest mastery | `data-action="submit-mastery" data-lesson="${n}"` |
| 46 | `onclick="grade(${n})"` | Submit quiz answers | `data-action="grade-quiz" data-lesson="${n}"` |
| 46 | `onclick="showAnswers(${n})"` | Reveal quiz explanations | `data-action="reveal-quiz" data-lesson="${n}"` |
| 51 | `onclick="gradeAssessment()"` | Submit Part 1 assessment | `data-action="grade-assessment"` |
| 51 | `onclick="revealAssessment()"` | Reveal assessment answers | `data-action="reveal-assessment"` |
| 54 | `onclick="calcExposure()"` | Calculate linear exposure | `data-action="calc-exposure"` |
| 56 | `onclick="calcSizing()"` | Calculate position size | `data-action="calc-sizing"` |
| 59 | `onclick="revealOrder(${i})"` | Reveal order scenario answer | `data-action="reveal-order" data-scenario="${i}"` |
| 62 | `onclick="document.querySelectorAll(...)"` | Clear pre-trade checklist | `data-action="clear-pretrade"` |
| 63 | `onchange="changePrice(${i},this.value)"` | Change watchlist price | `data-action="change-price" data-index="${i}"` (delegated change) |
| 63 | `onclick="paperOrder(${i},'buy')"` | Paper buy order | `data-action="paper-order" data-index="${i}" data-side="buy"` |
| 63 | `onclick="paperOrder(${i},'sell')"` | Paper sell order | `data-action="paper-order" data-index="${i}" data-side="sell"` |
| 63 | `onclick="addSymbol()"` | Add ticker to watchlist | `data-action="add-watchlist-symbol"` |
| 69 | `onclick="journalForm()"` | Open new journal entry form | `data-action="new-journal-entry"` |
| 69 | `onclick="exportCsv('journal')"` | Export journal CSV | `data-action="export-csv" data-kind="journal"` |
| 69 | `oninput="filterJournal()"` | Search journal entries | `data-action="filter-journal"` (delegated input) |
| 70 | `onclick="editJournal(${i})"` | Edit journal entry | `data-action="edit-journal" data-index="${i}"` |
| 70 | `onclick="deleteJournal(${i})"` | Delete journal entry | `data-action="delete-journal" data-index="${i}"` |
| 75 | `onclick="passportForm()"` | Open new passport form | `data-action="new-passport"` |
| 75 | `onclick="exportCsv('passport')"` | Export passport CSV | `data-action="export-csv" data-kind="passport"` |
| 75 | `onclick="editPassport(${i})"` | Edit passport record | `data-action="edit-passport" data-index="${i}"` |
| 78 | `onclick="strategyForm()"` | Open new strategy form | `data-action="new-strategy"` |
| 78 | `onclick="exportCsv('strategy')"` | Export strategy CSV | `data-action="export-csv" data-kind="strategy"` |
| 78 | `onclick="editStrategy(${i})"` | Edit strategy record | `data-action="edit-strategy" data-index="${i}"` |
| 81 | `onclick="friendForm()"` | Open new friend intake form | `data-action="new-friend"` |
| 81 | `onclick="exportCsv('friend')"` | Export friend CSV | `data-action="export-csv" data-kind="friend"` |
| 81 | `onclick="editFriend(${i})"` | Open friend intake review | `data-action="edit-friend" data-index="${i}"` |
| 85 | `oninput="filterGlossary()"` | Search glossary terms | `data-action="filter-glossary"` (delegated input) |
| 85 | `oninput="searchCourse()"` | Search course content | `data-action="search-course"` (delegated input) |
| 88 | `onchange="saveStudyPlan()"` | Update study plan dates | `data-action="save-study-plan"` (delegated change) |
| 88 | `onclick="document.querySelectorAll(...)"` | Clear study plan dates | `data-action="clear-study-plan"` |
| 91 | `onclick="backup()"` | Download JSON backup | `data-action="download-backup"` |
| 91 | `onclick="$('#restoreFile').click()"` | Trigger file picker for restore | `data-action="trigger-restore-picker"` |
| 91 | `onchange="restore(event)"` | Restore JSON backup | `data-action="restore-backup"` (delegated change) |
| 91 | `onclick="$('#lessonImport').click()"` | Trigger file picker for lessons | `data-action="trigger-import-picker"` |
| 91 | `onchange="previewLessonImport(event)"`| Preview imported lesson JSON | `data-action="preview-lesson-import"` (delegated change) |
| 91 | `onclick="toggleTheme()"` | Toggle light/dark mode | `data-action="toggle-theme"` |
| 91 | `onclick="exportCsv('journal')"` | Settings: Export journal | `data-action="export-csv" data-kind="journal"` |
| 91 | `onclick="exportCsv('passport')"` | Settings: Export passport | `data-action="export-csv" data-kind="passport"` |
| 91 | `onclick="exportCsv('strategy')"` | Settings: Export strategy | `data-action="export-csv" data-kind="strategy"` |
| 91 | `onclick="exportCsv('friend')"` | Settings: Export friend | `data-action="export-csv" data-kind="friend"` |
| 91 | `onclick="resetData()"` | Reset all browser storage | `data-action="reset-storage"` |
| 93 | `onclick="applyLessonImport()"` | Commit imported lessons | `data-action="apply-lesson-import"` |

---

## 5. Verification & Click-Through Checklist

When the modularization is implemented in Task P0-3, the following end-to-end verification protocol must be executed before handoff:

### Syntax & Test Verification
1. Run `node --check app/main.js` and `node --check` on every newly extracted module file.
2. Run `node --check app/backtest/engine.js` and `node --check app/backtest/ui.js`.
3. Run `node --test app/backtest/engine.test.cjs` (all tests passing).
4. Run `node --test app/tests/calculations.test.cjs` (all tests passing).

### Manual Browser Click-Through Matrix (`http://127.0.0.1:8000`)
- [ ] **Navigation & Shell:** Click every sidebar link (`#home`, `#course`, `#assessment`, `#lesson/1`..`#lesson/8`, `#glossary`, `#assistant`, `#misconceptions`, `#study`, `#exposure`, `#sizing`, `#orders`, `#pretrade`, `#paper`, `#journal`, `#passport`, `#testing`, `#backtest`, `#friend`, `#inbox`, `#resources`, `#settings`). Check that the hash route updates, breadcrumbs match, and no uncaught exceptions appear in the DevTools console.
- [ ] **Home Dashboard (`#home`):** Click onboarding checklist buttons; verify completion state toggles and persists. Verify mastery counters display correct Part 1 vs Part 2 counts.
- [ ] **Lesson Reader (`#lesson/1`):** Verify TOC navigation jumps to headings. Click bookmark, mark practice, and save note. Test notes persistence across page reloads.
- [ ] **Interactive Quiz (`#lesson/1`):** Click "Take lesson quiz". Select options, submit answers, check score feedback, and reveal explanations.
- [ ] **Capstone Assessment (`#assessment`):** Complete hypothetical calculations, enter explanation (>20 chars), check confirmation checkbox, and submit. Ensure scoring and status update correctly.
- [ ] **Calculators (`#exposure`, `#sizing`):** Modify inputs and click Calculate. Verify output cards update and constraint errors render when invalid data is supplied.
- [ ] **Order Practice (`#orders`):** Select an answer on scenario cards and click "Check answer". Verify feedback reveals.
- [ ] **Paper Trading (`#paper`):** Modify assumed price in watchlist. Trigger simulated Buy and Sell orders. Check that positions and order history update.
- [ ] **Worksheets (`#journal`, `#passport`, `#testing`, `#friend`, `#inbox`):** Add, edit, and delete entries. Filter rows with search bar. Verify persistence across routes.
- [ ] **Backtest Lab (`#backtest`):** Switch between Research and Replay modes. Ensure chart SVG renders without errors.
- [ ] **Settings & Storage (`#settings`):**
  - Download JSON backup. Verify valid JSON schema.
  - Test restore with both v1 and v2 backups.
  - Switch theme (light/dark) using both topbar button and settings button.
  - Download CSV exports for each worksheet and inspect formulas for safe escaping.
  - Execute "Reset with confirmation" and confirm storage clears back to initial defaults.
- [ ] **Responsive Viewport:** Verify layout at 375px mobile width using DevTools device emulation. Ensure sidebar toggle drawer opens, overlays, and closes cleanly.
