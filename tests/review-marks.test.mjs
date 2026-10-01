// เครื่องหมายของผู้ปกครองในหน้าตรวจเฉลย: อ่าน/เขียนอย่างปลอดภัย และสลับค่าโดยไม่แก้ของเดิม
import test from 'node:test';
import assert from 'node:assert/strict';
import { MARKS_KEY, emptyMarks, loadMarks, normalizeMarks, saveMarks, toggleMark } from '../src/core/review-marks.js';

const memory = (initial = {}) => {
  const data = { ...initial };
  return { data, getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = v; } };
};

test('marks start empty and survive a save and load round trip', () => {
  const store = memory();
  assert.deepEqual(loadMarks(store), emptyMarks());
  let marks = toggleMark(emptyMarks(), 'flags', 'th-park-who');
  marks = toggleMark(marks, 'done', 'set-05');
  assert.equal(saveMarks(store, marks), true);
  assert.deepEqual(loadMarks(store), { flags: { 'th-park-who': true }, done: { 'set-05': true } });
});

test('toggling twice clears the mark and never changes the original object', () => {
  const base = toggleMark(emptyMarks(), 'flags', 'a');
  const frozen = JSON.stringify(base);
  const off = toggleMark(base, 'flags', 'a');
  assert.deepEqual(off.flags, {});
  assert.equal(JSON.stringify(base), frozen);
});

test('unreadable or odd saved data falls back to empty instead of breaking the page', () => {
  assert.deepEqual(loadMarks(memory({ [MARKS_KEY]: '{not json' })), emptyMarks());
  assert.deepEqual(loadMarks(null), emptyMarks());
  assert.deepEqual(normalizeMarks({ flags: { a: true, b: 'yes', c: false }, done: [1] }), { flags: { a: true }, done: {} });
  const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  assert.deepEqual(loadMarks(broken), emptyMarks());
  assert.equal(saveMarks(broken, emptyMarks()), false);
});
