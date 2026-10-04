// กระดาษทด: กติกาว่าข้อไหนมีปุ่ม + ที่เก็บเส้นที่เขียน (ไม่ต้องใช้เบราว์เซอร์)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SETS } from '../src/content/sets/index.js';
import { toExamQuestion } from '../src/core/exam-question.js';
import { MAX_POINTS, MAX_STROKES, createScratchStore, needsScratch } from '../src/core/scratch-store.js';
import { paintStrokes } from '../src/core/scratch-paint.js';

const allItems = SETS.flatMap((set) => set.items.map((item) => ({ set, item })));

test('ข้อคณิตศาสตร์และข้อที่มีวิธีตั้งหลักบวก/ลบ ได้ปุ่มกระดาษทด', () => {
  for (const { item } of allItems) {
    if (item.subject === 'math' || item.review?.column) assert.equal(needsScratch(item), true, item.id);
  }
});

test('ข้อภาษาไทย/มิติสัมพันธ์/วิทย์/รอบตัวที่ไม่มีตั้งหลัก ไม่มีปุ่ม (ไม่เปลืองที่บนจอ)', () => {
  for (const { item } of allItems) {
    if (item.subject !== 'math' && !item.review?.column) assert.equal(needsScratch(item), false, item.id);
  }
});

test('item.scratch (true/false) สั่งทับกติกาเป็นรายข้อได้', () => {
  assert.equal(needsScratch({ subject: 'thai', scratch: true }), true);
  assert.equal(needsScratch({ subject: 'math', scratch: false }), false);
  assert.equal(needsScratch({ subject: 'math', review: { column: { a: 1, op: '+', b: 2 } } }), true);
});

test('มีข้อที่ต้องทดเลขจำนวนมากพอ และไม่ใช่ทุกข้อ', () => {
  const n = allItems.filter(({ item }) => needsScratch(item)).length;
  assert.ok(n > 200 && n < allItems.length * 0.5, `ทดเลข ${n} จาก ${allItems.length} ข้อ`);
});

test('ธง scratch ในข้อสอบเป็น boolean ล้วน ไม่พาข้อมูลเฉลยไปด้วย', () => {
  for (const { set, item } of allItems) {
    const q = toExamQuestion(set, item);
    assert.equal(typeof q.scratch, 'boolean', item.id);
  }
});

test('ที่เก็บเส้น: เริ่ม ต่อจุด ย้อน ล้าง และแยกกระดาษตามข้อ', () => {
  const store = createScratchStore();
  const pen = { color: '#000', width: 4 };
  const stroke = store.begin('s1:q1', pen, 0.2, 0.3);
  store.extend(stroke, 0.4, 0.5);
  assert.deepEqual(stroke.points, [[0.2, 0.3], [0.4, 0.5]]);
  store.begin('s1:q1', pen, 0.9, 0.9);
  store.begin('s1:q2', pen, 0.1, 0.1);
  assert.equal(store.count('s1:q1'), 2);
  assert.equal(store.count('s1:q2'), 1);
  assert.equal(store.count('s1:q3'), 0);
  assert.equal(store.undo('s1:q1').points[0][0], 0.9);
  assert.equal(store.count('s1:q1'), 1);
  assert.equal(store.undo('s1:never'), null);
  store.clear('s1:q1');
  assert.equal(store.count('s1:q1'), 0);
  assert.equal(store.count('s1:q2'), 1);
});

test('จุดที่หลุดขอบกระดาษถูกดึงกลับมาในกรอบ 0..1', () => {
  const store = createScratchStore();
  const stroke = store.begin('k', { color: '#000', width: 4 }, -0.5, 1.7);
  store.extend(stroke, 3, -2);
  assert.deepEqual(stroke.points, [[0, 1], [1, 0]]);
});

test('จำกัดจำนวนเส้นและจุด กันหน่วยความจำบวม', () => {
  const store = createScratchStore();
  for (let i = 0; i < MAX_STROKES + 25; i++) store.begin('k', { color: '#000', width: 4 }, 0, 0);
  assert.equal(store.count('k'), MAX_STROKES);
  const stroke = store.begin('k', { color: '#000', width: 4 }, 0, 0);
  let accepted = 0;
  for (let i = 0; i < MAX_POINTS + 50; i++) if (store.extend(stroke, 0.5, 0.5)) accepted++;
  assert.equal(stroke.points.length, MAX_POINTS);
  assert.equal(accepted, MAX_POINTS - 1);
});

test('keepOnly ทิ้งกระดาษของการสอบเก่า เก็บของการสอบนี้', () => {
  const store = createScratchStore();
  const pen = { color: '#000', width: 4 };
  store.begin('old:q1', pen, 0, 0);
  store.begin('now:q1', pen, 0, 0);
  store.begin('now:q2', pen, 0, 0);
  store.keepOnly('now:');
  assert.equal(store.size(), 2);
  assert.equal(store.count('old:q1'), 0);
});

test('วาดเส้น: จุดเดียวเป็นจุดกลม, ยางลบใช้ destination-out, เส้นยาวเป็นเส้นโค้ง', () => {
  const calls = [];
  const ctx = new Proxy({}, {
    get: (target, name) => (name in target ? target[name] : (...args) => calls.push([name, ...args])),
    set: (target, name, value) => { target[name] = value; if (name === 'globalCompositeOperation') calls.push(['op', value]); return true; },
  });
  paintStrokes(ctx, [
    { color: '#111', width: 4, erase: false, points: [[0.5, 0.5]] },
    { color: '#111', width: 4, erase: false, points: [[0, 0], [0.5, 0.5], [1, 1]] },
    { color: '#000', width: 26, erase: true, points: [[0.1, 0.1], [0.2, 0.2]] },
  ], 200, 100);
  const names = calls.map((c) => c[0]);
  assert.ok(names.includes('arc'), 'จุดเดียวต้องเห็นเป็นจุด');
  assert.ok(names.includes('quadraticCurveTo'));
  assert.ok(calls.some((c) => c[0] === 'op' && c[1] === 'destination-out'));
  assert.equal(calls.at(-1)[1], 'source-over', 'คืนโหมดวาดปกติเมื่อจบ');
  const arc = calls.find((c) => c[0] === 'arc');
  assert.deepEqual([arc[1], arc[2]], [100, 50], 'พิกัดสัดส่วนถูกแปลงเป็นพิกเซลตามขนาดผ้าใบ');
});
