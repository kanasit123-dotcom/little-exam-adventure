// ตั้งบวก/ตั้งลบของหน้าเฉลย — โจทย์บังคับตามแผน + ตรวจทุกโจทย์ 0–99 (คัดลอกแนวทดสอบจาก happy-little-kitchen)
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSteps, layout, normalizeProblem, columnScript, columnSpeeches, MINUS } from '../src/review/column-steps.js';

// เล่นขั้นตอนตามจริง แล้วอ่านคำตอบจากช่องที่เขียน
function play(problem) {
  const answer = { tens: null, units: null };
  let carry = null;
  for (const step of buildSteps(problem)) {
    if (step.type === 'write' && step.slot === 'answer') answer[step.col] = step.value;
    if (step.type === 'write' && step.slot === 'carry') carry = step.value;
    if (step.type === 'borrow') carry = step.to;
  }
  return { answer, carry, text: `${answer.tens ?? ''}${answer.units ?? ''}` };
}

test('8 + 7 = 15: write five, carry one ten, no 08 and no 1 + 0 question', () => {
  const steps = buildSteps({ a: 8, op: '+', b: 7 });
  const L = layout({ a: 8, op: '+', b: 7 });
  assert.equal(L.showTopTens, false, 'top is 8 not 08');
  assert.equal(L.showBottomTens, false);
  assert.equal(L.showAnswerTens, true);
  assert.deepEqual(steps.map((s) => s.type), ['ask', 'write', 'write', 'write']);
  assert.equal(steps[0].answer, 15);
  assert.deepEqual(steps[1], { type: 'write', col: 'units', slot: 'answer', value: 5, why: 'bundle', sum: 15 });
  assert.deepEqual(steps[2], { type: 'write', col: 'tens', slot: 'carry', value: 1, why: 'carry' });
  assert.equal(steps[3].why, 'carryDown');
  assert.equal(play({ a: 8, op: '+', b: 7 }).text, '15');
});

test('12 - 5 = 7: borrow one ten into twelve ones, no leading zero', () => {
  const steps = buildSteps({ a: 12, op: '-', b: 5 });
  assert.deepEqual(steps.map((s) => s.type), ['borrow', 'ask', 'write', 'zero']);
  assert.equal(steps[0].units, 12);
  assert.equal(steps[0].to, 0);
  assert.equal(steps[1].answer, 7);
  assert.equal(layout({ a: 12, op: '-', b: 5 }).showAnswerTens, false);
  assert.equal(play({ a: 12, op: '-', b: 5 }).text, '7');
});

test('Thai script for the fixtures teaches the right steps', () => {
  const add = columnScript({ a: 8, op: '+', b: 7 });
  assert.equal(add.steps[0].speech, 'หลักหน่วย 8 บวก 7 เท่ากับเท่าไร');
  assert.match(add.steps[1].speech, /มัดเป็นหนึ่งสิบ แตะช่องเขียน 5$/);
  assert.equal(add.finalSpeech, '8 บวก 7 เท่ากับ 15');
  assert.ok(add.recap.some((line) => line.includes('เขียน 5 ทด 1')));
  const sub = columnScript({ a: 12, op: '-', b: 5 });
  assert.equal(sub.steps[0].speech, '2 ลบ 5 ไม่พอ ต้องยืมหนึ่งสิบ แตะเลขหลักสิบ');
  assert.equal(sub.steps[0].after, 'ยืมหนึ่งสิบ หลักหน่วยจึงเป็น 12');
  assert.equal(sub.steps[1].speech, 'หลักหน่วย 12 ลบ 5 เท่ากับเท่าไร');
  assert.equal(sub.steps.at(-1).speech, 'หลักสิบเหลือศูนย์ ไม่ต้องเขียน');
  assert.equal(sub.finalSpeech, '12 ลบ 5 เท่ากับ 7');
  assert.ok(columnSpeeches({ a: 12, op: '-', b: 5 }).includes(sub.steps[0].after));
});

test('20 - 13 = 7 borrows from the tens and shows no leading zero', () => {
  const steps = buildSteps({ a: 20, op: '−', b: 13 });
  assert.deepEqual(steps.map((s) => s.type), ['borrow', 'ask', 'write', 'zero']);
  assert.equal(play({ a: 20, op: '−', b: 13 }).text, '7');
});

test('minus signs are normalized and unsupported problems are refused', () => {
  assert.equal(normalizeProblem({ a: 9, op: '-', b: 3 }).op, MINUS);
  assert.throws(() => normalizeProblem({ a: 3, op: '-', b: 9 }), /unsupported/);
  assert.throws(() => normalizeProblem({ a: 60, op: '+', b: 50 }), /unsupported/);
});

test('every problem up to 99 gives the right answer with no leading zero', () => {
  for (let a = 0; a <= 99; a++) {
    for (let b = 0; b <= 99; b++) {
      if (a + b <= 99 && a + b > 0) assert.equal(play({ a, op: '+', b }).text, String(a + b), `${a} + ${b}`);
      if (a - b > 0) assert.equal(play({ a, op: '-', b }).text, String(a - b), `${a} - ${b}`);
    }
  }
});

test('asks never add a zero term and borrowing only happens when the ones are too small', () => {
  for (let a = 0; a <= 99; a++) {
    for (let b = 0; b <= 99; b++) {
      if (a + b <= 99) for (const s of buildSteps({ a, op: '+', b })) if (s.type === 'ask' && s.col === 'tens') assert.ok(s.terms.every((t) => t > 0), `${a} + ${b}`);
      if (a >= b) {
        const borrowed = buildSteps({ a, op: '-', b }).some((s) => s.type === 'borrow');
        assert.equal(borrowed, a % 10 < b % 10, `${a} - ${b}`);
      }
    }
  }
});
