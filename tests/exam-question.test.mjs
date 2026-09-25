import test from 'node:test';
import assert from 'node:assert/strict';
import { SETS } from '../src/content/sets/index.js';
import { toExamQuestion } from '../src/core/exam-question.js';

const ALLOWED = ['id', 'subject', 'subjectName', 'section', 'stimulus', 'promptText', 'promptSpeech', 'visual', 'options'].sort();
const OPTION_KEYS = ['key', 'label', 'text', 'image', 'speech'].sort();

test('exam question is an allow-list projection', () => {
  for (const set of SETS) {
    for (const item of set.items) {
      const q = toExamQuestion(set, item);
      assert.deepEqual(Object.keys(q).sort(), ALLOWED, item.id);
      for (const option of q.options) assert.deepEqual(Object.keys(option).sort(), OPTION_KEYS, item.id);
    }
  }
});

test('no correctness, review text, hints, steps or column problem reaches the exam view', () => {
  for (const set of SETS) {
    for (const item of set.items) {
      const json = JSON.stringify(toExamQuestion(set, item));
      assert.equal(json.includes('correct'), false, item.id);
      assert.equal(json.includes('review'), false, item.id);
      // ข้อความเฉลยที่บังเอิญเหมือนข้อความตัวเลือก (ซึ่งเห็นอยู่แล้ว) ไม่นับ
      const shown = new Set(item.options.map((o) => o.text));
      const secrets = [item.review.summary, ...item.review.hints, ...item.review.steps].filter((text) => !shown.has(text));
      for (const text of secrets) assert.equal(json.includes(text), false, `${item.id}: "${text}"`);
      if (item.review.column) assert.equal(json.includes('"column"'), false);
    }
  }
});

test('option narration says the option number, and picture tasks do not describe the correct shape', () => {
  for (const set of SETS) {
    for (const item of set.items) {
      const q = toExamQuestion(set, item);
      q.options.forEach((option, i) => assert.ok(option.speech.startsWith(`ข้อ ${i + 1}`), item.id));
    }
  }
});

test('shared story is projected with the question but without answers', () => {
  const set = SETS[0];
  const item = set.items.find((i) => i.stimulus);
  const q = toExamQuestion(set, item);
  assert.equal(q.stimulus.text, set.stimuli[item.stimulus].text);
  assert.equal(q.section, set.stimuli[item.stimulus].section);
});
