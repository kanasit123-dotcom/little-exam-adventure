// ลูกบาศก์ (ชุด 35): เฉลยต้องตรงกับภาพที่คำนวณจากกองลูกบาศก์ และตัวเลือกผิดต้องต่างจากภาพจริง
import test from 'node:test';
import assert from 'node:assert/strict';
import { SETS, stimulusOf } from '../src/content/sets/index.js';
import { validateVisual, validateItem } from '../src/core/content-validator.js';
import { copyVisual } from '../src/core/exam-question.js';
import { renderVisual, renderOptionSvg, frontView, topView, cubeCount } from '../src/visuals/visuals.js';

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const cubeItems = [];
for (const set of SETS) {
  for (const item of set.items) {
    const visual = item.visual?.type === 'cubes' ? item.visual : stimulusOf(set, item)?.visual;
    if (visual?.type === 'cubes') cubeItems.push({ item, visual });
  }
}

test('front and top view questions: the answer is the real view and every other option differs', () => {
  let checked = 0;
  for (const { item, visual } of cubeItems) {
    const kind = /มองจากด้านหน้า/.test(item.prompt.text) ? 'front' : /มองจากด้านบน/.test(item.prompt.text) ? 'top' : null;
    if (!kind) continue;
    const real = kind === 'front' ? frontView(visual.rows) : topView(visual.rows);
    const correct = item.options.find((o) => o.id === item.correctOptionId);
    assert.ok(same(correct.svg[kind], real), `${item.id}: answer is not the ${kind} view`);
    for (const o of item.options.filter((x) => x !== correct)) assert.ok(!same(o.svg[kind], real), `${item.id}: option ${o.id} is also the ${kind} view`);
    checked++;
  }
  assert.ok(checked >= 8, `only ${checked} view questions`);
});

test('"how many cubes altogether" answers equal the number of cubes in the picture', () => {
  let checked = 0;
  for (const { item, visual } of cubeItems.filter(({ item }) => /ทั้งหมดกี่ก้อน/.test(item.prompt.text))) {
    const text = item.options.find((o) => o.id === item.correctOptionId).text;
    assert.equal(Number(text.match(/\d+/)[0]), cubeCount(visual.rows), item.id);
    checked++;
  }
  assert.ok(checked >= 4);
});

test('cube validator, copy and rendering', () => {
  assert.deepEqual(validateVisual({ type: 'cubes', rows: [[2, 2, 1], [1, 0, 1]] }, new Set()), []);
  assert.ok(validateVisual({ type: 'cubes', rows: [[1, 1], [2, 0]] }, new Set()).length, 'front taller than back');
  assert.ok(validateVisual({ type: 'cubes', rows: [[1, 0], [1, 0]] }, new Set()).length, 'empty column');
  assert.ok(validateVisual({ type: 'cubes', rows: [[4]] }, new Set()).length, 'too tall');
  assert.deepEqual(frontView([[2, 2, 1], [1, 0, 1]]), [2, 2, 1]);
  assert.deepEqual(topView([[2, 2, 1], [1, 0, 1]]), [[1, 1, 1], [1, 0, 1]]);
  assert.equal(cubeCount([[2, 2, 1], [1, 0, 1]]), 7);
  const copied = copyVisual({ type: 'cubes', rows: [[1, 2]], answer: 'leak' });
  assert.equal('answer' in copied, false);
  assert.equal((renderVisual(copied).match(/<rect /g) || []).length, 3, 'one front face per cube');
  assert.equal((renderOptionSvg({ front: [2, 1] }).match(/<rect /g) || []).length, 3);
  assert.equal((renderOptionSvg({ top: [[1, 0], [1, 1]] }).match(/<rect /g) || []).length, 3);
  const base = { id: 'x', type: 'main', subject: 'spatial', skillIds: ['s'], familyId: 'f', difficulty: 1, sourceId: 'src', provenance: 'original', rights: 'r', reviewStatus: 'draft', narration: 'n', prompt: { text: 'q' }, review: { summary: 's', hints: [], steps: ['1', '2'] }, correctOptionId: 'a' };
  assert.deepEqual(validateItem({ ...base, options: [{ id: 'a', svg: { front: [1, 2] } }, { id: 'b', svg: { top: [[1, 1]] } }, { id: 'c', svg: { front: [2] } }] }), []);
  assert.ok(validateItem({ ...base, options: [{ id: 'a', svg: { front: [0, 0] } }, { id: 'b', svg: { top: [[2]] } }, { id: 'c', svg: { front: [2] } }] }).length);
});
