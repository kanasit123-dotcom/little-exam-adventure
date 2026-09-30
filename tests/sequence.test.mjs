// โจทย์เรียงลำดับเหตุการณ์จากภาพ (แผ่น H): ข้อที่ถูกต้องต้องตรงกับลำดับจริงของภาพ ตรวจจากหมายเลขในชื่อไฟล์ภาพ
import test from 'node:test';
import assert from 'node:assert/strict';
import { SETS, stimulusOf } from '../src/content/sets/index.js';

const LABELS = ['ก', 'ข', 'ค', 'ง'];
const ORDER_TEXT = /^[กขคง]( [กขคง]){3}$/;

function panelStepsOf(set, item) {
  const visual = item.visual?.type === 'row' && item.visual.labels ? item.visual : stimulusOf(set, item)?.visual;
  if (!visual || visual.type !== 'row' || !visual.labels) return null;
  const steps = visual.items.map((id) => Number(id.match(/^pic-seq-[a-z]+-(\d)$/)?.[1]));
  return steps.every(Boolean) ? steps : null;
}

test('sequence questions: the correct order text matches the real order of the pictures', () => {
  let checked = 0;
  for (const set of SETS) {
    for (const item of set.items) {
      const steps = panelStepsOf(set, item);
      const correct = item.options.find((o) => o.id === item.correctOptionId);
      if (!steps || !ORDER_TEXT.test(correct.text || '')) continue;
      const expected = [1, 2, 3, 4].map((step) => LABELS[steps.indexOf(step)]).join(' ');
      assert.equal(correct.text, expected, item.id);
      // ตัวเลือกผิดต้องผิดชัดเจน: ขึ้นต้นด้วยภาพที่ไม่ใช่ภาพแรกของเรื่อง (เด็กตัดออกได้จากภาพแรก)
      for (const o of item.options.filter((x) => x.id !== item.correctOptionId)) {
        assert.notEqual(o.text.split(' ')[0], expected.split(' ')[0], `${item.id}: distractor "${o.text}" starts like the answer`);
      }
      checked++;
    }
  }
  assert.ok(checked >= 8, `only ${checked} ordering questions found`);
});

test('first / last / ordinal questions point at the right panel', () => {
  let checked = 0;
  for (const set of SETS) {
    for (const item of set.items) {
      const steps = panelStepsOf(set, item);
      if (!steps) continue;
      const correct = item.options.find((o) => o.id === item.correctOptionId).text || '';
      const first = LABELS[steps.indexOf(1)];
      const last = LABELS[steps.indexOf(4)];
      if (/เป็นภาพแรก/.test(item.prompt.text)) { assert.equal(correct, `ภาพ ${first}`, item.id); checked++; }
      if (/เป็นภาพสุดท้าย/.test(item.prompt.text)) { assert.equal(correct, `ภาพ ${last}`, item.id); checked++; }
      const ordinal = item.prompt.text.match(/ภาพ ([กขคง]) เป็นภาพที่เท่าไรของเรื่อง/);
      if (ordinal) { assert.equal(correct, `ภาพที่ ${steps[LABELS.indexOf(ordinal[1])]}`, item.id); checked++; }
    }
  }
  assert.ok(checked >= 6, `only ${checked} first/last/ordinal questions found`);
});
