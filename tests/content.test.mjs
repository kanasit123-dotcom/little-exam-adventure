import test from 'node:test';
import assert from 'node:assert/strict';
import { VERTICAL_SLICE_12 } from '../src/content/vertical-slice-12.js';
import { validateQuestionSet } from '../src/core/content-validator.js';

test('vertical slice has 12 valid and unique questions', () => {
  const report = validateQuestionSet(VERTICAL_SLICE_12);
  assert.deepEqual(report.errors, []);
  assert.equal(report.ok, true);
});

test('vertical slice balances three subjects', () => {
  const counts = VERTICAL_SLICE_12.reduce((all, question) => {
    all[question.subject] = (all[question.subject] || 0) + 1;
    return all;
  }, {});
  assert.deepEqual(counts, { thai: 4, english: 4, math: 4 });
});

test('exam-facing fields contain no hint or correctness feedback', () => {
  for (const question of VERTICAL_SLICE_12) {
    assert.equal('hint' in question, false, question.id);
    assert.equal('feedback' in question, false, question.id);
    assert.ok(question.review.steps.length >= 2, question.id);
  }
});

test('column questions include fixed, correct problems', () => {
  const questions = VERTICAL_SLICE_12.filter((question) => question.kind === 'column-choice');
  assert.deepEqual(questions.map((question) => question.problem), [
    { op: '+', a: 8, b: 7, result: 15 },
    { op: '-', a: 12, b: 5, result: 7 },
  ]);
});

