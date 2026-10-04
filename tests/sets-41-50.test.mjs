import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { SETS, getSet, stimulusOf } from '../src/content/sets/index.js';
import { createSession } from '../src/core/session.js';
import { toExamQuestion } from '../src/core/exam-question.js';
import { pair } from '../src/content/sets/authored-pairs.js';

const added = SETS.filter((set) => Number(set.id.slice(4)) >= 41 && Number(set.id.slice(4)) <= 50);
const right = (item) => item.options.find((option) => option.id === item.correctOptionId);
const find = (id) => added.flatMap((set) => set.items).find((item) => item.id === id);

test('sets 41-50 have 150 main and 150 genuinely changed transfer questions', () => {
  assert.equal(added.length, 10);
  for (const set of added) {
    assert.equal(set.order.length, 15, set.id);
    assert.equal(set.items.length, 30, set.id);
    assert.deepEqual(createSession(set, { now: 1 }).blocks.map((block) => block.length), [5, 5, 5]);
    const counts = {};
    for (const id of set.order) {
      const item = set.items.find((i) => i.id === id);
      counts[item.subject] = (counts[item.subject] || 0) + 1;
      const transfer = set.items.find((i) => i.id === item.review.transferIds[0]);
      assert.deepEqual(transfer.skillIds, item.skillIds);
      assert.notEqual(transfer.prompt.text + JSON.stringify(transfer.visual), item.prompt.text + JSON.stringify(item.visual), `${id}: do not merely reorder choices`);
      assert.ok(item.review.hints[0] && transfer.review.hints[0], id);
      const dto = toExamQuestion(set, item);
      for (const forbidden of ['review', 'correctOptionId', 'hint', 'hints', 'column']) assert.equal(forbidden in dto, false, id);
    }
    assert.equal(Object.keys(counts).length, 6, set.id);
    assert.ok(Object.values(counts).every((n) => n >= 2 && n <= 4), JSON.stringify(counts));
  }
});

test('all new column problems have numerically matching answers, including carry and borrow', () => {
  let checked = 0;
  for (const set of added) for (const item of set.items) {
    if (!item.review.column) continue;
    const { a, b, op } = item.review.column;
    assert.equal(Number.parseInt(right(item).text, 10), op === '+' ? a + b : a - b, item.id);
    checked++;
  }
  assert.ok(checked >= 50);
  assert.equal(right(find('s45-change-t')).text, '7 บาท');
  assert.equal(right(find('s48-cost')).text, '25 บาท');
});

test('new ordinal stories exclude the reference child and both endpoints', () => {
  assert.equal(right(find('s44-shorter')).text, `${7 - 1} คน`);
  assert.equal(right(find('s44-taller')).text, `${15 - 7} คน`);
  assert.equal(right(find('s44-between-count')).text, `${10 - 7 - 1} คน`);
  assert.equal(right(find('s44-between-count-t')).text, `${8 - 4 - 1} คน`);
  assert.equal(right(find('s44-taller-t')).text, `${18 - 9} คน`);
});

test('new rotations and matrices point to the expected figures without describing picture choices aloud', () => {
  const expected = {
    's41-turn': { arrow: 'left' }, 's41-turn-t': { arrow: 'down' },
    's42-half': { half: 'tl' }, 's42-half-t': { half: 'tr' },
    's43-missing': { shape: 'triangle' }, 's43-missing-t': { shape: 'square' },
    's44-rotation': { arrow: 'right' }, 's44-rotation-t': { arrow: 'down' },
    's46-matrix': { dots: 6 }, 's46-matrix-t': { dots: 5 },
    's47-dots': { dots: 6 }, 's47-dots-t': { dots: 8 },
    's49-wheel': { wheel: 6 }, 's49-wheel-t': { wheel: 3 },
    's49-matrix-shape': { shape: 'circle' }, 's49-matrix-shape-t': { shape: 'diamond' },
    's49-matrix-dots': { dots: 7 }, 's49-matrix-dots-t': { dots: 8 },
    's49-half-turn': { half: 'br' }, 's49-half-turn-t': { half: 'tl' },
    's50-matrix': { shape: 'square' }, 's50-matrix-t': { shape: 'triangle', fill: 'solid' },
  };
  for (const [id, figure] of Object.entries(expected)) {
    const item = find(id);
    assert.deepEqual(right(item).svg.figure, figure, id);
    assert.ok(item.options.every((option) => option.speech === ''), id);
  }
});

test('caption exercises identify project images, not unsupported free-writing assessment', () => {
  assert.equal(getSet('set-48').stimuli.help.visual.asset, 'pic-manner-help');
  assert.equal(right(find('s48-caption')).text, 'เด็กช่วยถือถุงของ');
  assert.equal(right(find('s48-specific-caption')).text, 'เด็กกินอาหารที่โต๊ะ');
  assert.equal(right(find('s48-specific-caption-t')).text, 'เด็กกำลังแปรงฟัน');
});

test('new questions do not reuse an existing stem and visual by merely changing choices', () => {
  const seen = new Map();
  for (const set of SETS) for (const item of set.items) {
    const signature = JSON.stringify([item.prompt.text, item.visual, stimulusOf(set, item)]);
    if (Number(set.id.slice(4)) >= 41) assert.ok(!seen.has(signature), `${item.id} repeats ${seen.get(signature)}`);
    seen.set(signature, item.id);
  }
});

test('pattern questions withhold the rule until review, and numerical matrices supply two worked visual pairs', () => {
  for (const set of added) for (const item of set.items) {
    if (!['figure-row', 'figure-grid'].includes(item.visual?.type)) continue;
    assert.equal(item.prompt.text, 'ภาพในช่อง ? ควรเป็นภาพใด', item.id);
    assert.equal(item.prompt.speech, undefined, item.id);
    if (item.visual.type === 'figure-grid' && item.visual.rows[0].every((f) => 'dots' in f)) {
      assert.equal(item.visual.rows[0].length, 3, `${item.id}: one pair can be ambiguous`);
    }
  }
});

test('authoring helper catches missing answers instead of silently emitting a bad key', () => {
  const data = { prompt: 'q', choices: ['a', 'b', 'c'], answer: 4, hint: 'h', steps: ['one', 'two'] };
  assert.throws(() => pair(51, 'invalid', 'math', 'counting', data, data), /invalid answer/);
});

test('released set content 1-40 is unchanged, allowing checkout line-ending normalization', () => {
  const hash = createHash('sha256');
  const paths = Array.from({ length: 40 }, (_, i) => `src/content/sets/set-${String(i + 1).padStart(2, '0')}.js`).sort();
  for (const path of paths) {
    hash.update(path);
    hash.update(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n'));
  }
  assert.equal(hash.digest('hex'), 'd07154ce93e69e56591333b441b9eab50e83c5a48330c007a54d653bde7f3ab6');
});
