// รูปที่วาดด้วยโค้ดสำหรับโจทย์เชาวน์: ตารางภาพที่มีช่องหาย, รูปเรขาคณิต, ตัวเลือกนับรูป, แผนภาพดาว
import test from 'node:test';
import assert from 'node:assert/strict';
import { validFigure, validateVisual, validateItem } from '../src/core/content-validator.js';
import { renderOptionSvg, renderVisual } from '../src/visuals/visuals.js';
import { toExamQuestion } from '../src/core/exam-question.js';
import { SETS } from '../src/content/sets/index.js';
import { ASSETS } from '../src/core/assets.js';

const IDS = new Set(Object.keys(ASSETS));

test('figures: accepted and rejected shapes', () => {
  for (const ok of [{ half: 'tl' }, { half: 'br' }, { shape: 'circle' }, { shape: 'hexagon', fill: 'dots' }, { wheel: 7 }, { arrow: 'left' }, { dots: 9 }]) assert.equal(validFigure(ok), true, JSON.stringify(ok));
  for (const bad of [null, {}, { half: 'zz' }, { shape: 'star' }, { shape: 'circle', fill: 'red' }, { shape: 'circle', extra: 1 }, { wheel: 8 }, { dots: 0 }, { half: 'tl', wheel: 1 }]) assert.equal(validFigure(bad), false, JSON.stringify(bad));
});

test('figure-grid needs 2-3 equal rows and exactly one blank', () => {
  const c = { half: 'tl' };
  assert.deepEqual(validateVisual({ type: 'figure-grid', rows: [[c, c], [c, '?']] }, IDS), []);
  assert.deepEqual(validateVisual({ type: 'figure-grid', rows: [[c, c, c], [c, c, c], [c, c, '?']] }, IDS), []);
  assert.notDeepEqual(validateVisual({ type: 'figure-grid', rows: [[c, '?'], [c, '?']] }, IDS), [], 'two blanks');
  assert.notDeepEqual(validateVisual({ type: 'figure-grid', rows: [[c, c], [c, c]] }, IDS), [], 'no blank');
  assert.notDeepEqual(validateVisual({ type: 'figure-grid', rows: [[c, c, c], [c, '?']] }, IDS), [], 'ragged');
  assert.notDeepEqual(validateVisual({ type: 'figure-grid', rows: [[c, { half: 'nope' }], [c, '?']] }, IDS), [], 'unknown figure');
});

test('count and venn options are checked and drawn', () => {
  const base = { id: 'x', type: 'main', subject: 'math', skillIds: ['s'], familyId: 'f', difficulty: 1, sourceId: 'src', provenance: 'original', rights: 'r', reviewStatus: 'draft', narration: 'n', prompt: { text: 'q' }, correctOptionId: 'a', review: { summary: 's', hints: [], steps: ['1', '2'] } };
  const good = { ...base, options: [{ id: 'a', svg: { count: { asset: 'pic-mango', n: 5 } } }, { id: 'b', svg: { venn: 'both' } }, { id: 'c', svg: { venn: 'none' } }] };
  assert.deepEqual(validateItem(good, { assetIds: IDS }), []);
  for (const svg of [{ count: { asset: 'pic-nothing', n: 3 } }, { count: { asset: 'pic-mango', n: 0 } }, { count: { asset: 'pic-mango', n: 11 } }, { venn: 'left' }]) {
    const bad = { ...base, options: [{ id: 'a', svg }, { id: 'b', text: 'y' }] };
    assert.notDeepEqual(validateItem(bad, { assetIds: IDS }), [], JSON.stringify(svg));
  }
  assert.equal((renderOptionSvg({ count: { asset: 'pic-mango', n: 7 } }).match(/<img/g) || []).length, 7);
  assert.match(renderOptionSvg({ venn: 'both' }), /<svg/);
  assert.match(renderVisual({ type: 'figure-grid', rows: [[{ half: 'tl' }, { half: 'tr' }], [{ half: 'br' }, '?']] }), /lx-figgrid-blank/);
});

test('exam projection keeps only known drawing fields', () => {
  const set = SETS.find((s) => s.items.some((i) => i.options.some((o) => o.svg?.count)));
  const item = set.items.find((i) => i.options.some((o) => o.svg?.count));
  const q = toExamQuestion(set, item);
  for (const option of q.options) assert.deepEqual(Object.keys(option.svg), ['count']);
  const leaky = structuredClone(item);
  leaky.options[0].svg.answer = 'yes';
  assert.equal(JSON.stringify(toExamQuestion(set, leaky)).includes('answer'), false);
});

test('count-option questions use one kind of picture and every option has a different count', () => {
  for (const set of SETS) {
    for (const item of set.items.filter((i) => i.options.some((o) => o.svg?.count))) {
      const counts = item.options.map((o) => o.svg.count.n);
      assert.equal(new Set(counts).size, counts.length, item.id);
      assert.equal(new Set(item.options.map((o) => o.svg.count.asset)).size, 1, `${item.id}: one kind of picture`);
    }
  }
});
