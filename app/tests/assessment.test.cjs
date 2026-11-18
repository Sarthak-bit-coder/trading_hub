const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// app.js is a browser script, so check the Part 1 assessment data statically.
// Regression: a refactor once deleted assessQ while the page still used it.
test('Part 1 assessment questions are defined where the page uses them', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  const line = src.split('\n').find(l => l.startsWith('const assessQ='));
  assert.ok(line, 'const assessQ= must exist in app.js');
  const questions = Function(`${line}; return assessQ;`)();
  assert.equal(questions.length, 6);
  for (const [prompt, options, answer] of questions) {
    assert.equal(typeof prompt, 'string');
    assert.ok(Number.isInteger(answer) && answer >= 0 && answer < options.length);
  }
});
