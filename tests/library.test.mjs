// ชุดพิเศษ: ชุดจำลองสอบจริง 30 ข้อ และทบทวนข้อที่เคยผิด
import test from 'node:test';
import assert from 'node:assert/strict';
import { SETS, getSet } from '../src/content/sets/index.js';
import { MOCK_SIZE, mainCount, pickMock, practiceIds } from '../src/content/library.js';
import { createSession, BLOCK_SIZE } from '../src/core/session.js';
import { initialState, reduce, UNSURE } from '../src/core/state.js';
import { answerStatus } from '../src/core/summary.js';

// สุ่มแบบกำหนดค่าได้ (ผลเดิมทุกครั้ง)
const seeded = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

test('item ids are unique across sets (the mock set mixes them)', () => {
  const ids = SETS.flatMap((s) => s.items.map((i) => i.id));
  assert.equal(new Set(ids).size, ids.length);
});

test('virtual sets contain every item and keep shared stories apart by set', () => {
  const mock = getSet('mock');
  assert.equal(mock.items.length, SETS.reduce((n, s) => n + s.items.length, 0));
  for (const item of mock.items) if (item.stimulus) assert.ok(mock.stimuli[item.stimulus], item.id);
  assert.ok(mock.stimuli['set-01/oranges'] && mock.stimuli['set-03/oranges']);
  assert.notEqual(mock.stimuli['set-01/oranges'].text, mock.stimuli['set-03/oranges'].text);
});

test('mock exam: 30 main questions, balanced subjects, shared stories stay together, blocks of at most 5', () => {
  assert.ok(mainCount() >= MOCK_SIZE);
  for (let seed = 1; seed <= 25; seed++) {
    const ids = pickMock(seeded(seed));
    assert.equal(ids.length, MOCK_SIZE, `seed ${seed}`);
    assert.equal(new Set(ids).size, ids.length);
    const mock = getSet('mock');
    const items = ids.map((id) => mock.items.find((i) => i.id === id));
    assert.ok(items.every((i) => i.type === 'main'));
    const perSubject = {};
    for (const i of items) perSubject[i.subject] = (perSubject[i.subject] || 0) + 1;
    assert.equal(Object.keys(perSubject).length, 6, `seed ${seed}`);
    assert.ok(Object.values(perSubject).every((n) => n >= 3 && n <= 6), JSON.stringify(perSubject));
    // ข้อที่ใช้เรื่องเดียวกันต้องมาครบและติดกัน
    for (const [index, item] of items.entries()) {
      if (!item.stimulus) continue;
      const group = mock.items.filter((i) => i.type === 'main' && i.stimulus === item.stimulus).map((i) => i.id);
      assert.ok(group.every((g) => ids.includes(g)), item.stimulus);
      const positions = group.map((g) => ids.indexOf(g)).sort((a, b) => a - b);
      assert.equal(positions.at(-1) - positions[0], group.length - 1, `${item.stimulus} at ${index}`);
    }
    const session = createSession(mock, { ids, now: 1 });
    assert.ok(session.blocks.every((b) => b.length <= BLOCK_SIZE));
    assert.ok(session.blocks.length <= 7);
  }
  assert.notDeepEqual(pickMock(seeded(1)), pickMock(seeded(2)), 'different draws differ');
});

test('submitting records wrong/unsure answers as mistakes and clears them once answered correctly', () => {
  const set = getSet('set-01');
  let s = reduce(initialState(), { type: 'start', session: createSession(set, { now: 1 }) });
  const ids = s.session.blocks[0];
  const correct = (id) => set.items.find((i) => i.id === id).correctOptionId;
  const wrong = (id) => set.items.find((i) => i.id === id).options.find((o) => o.id !== correct(id)).id;
  s = reduce(s, { type: 'select', qid: ids[0], answer: correct(ids[0]) });
  s = reduce(s, { type: 'select', qid: ids[1], answer: wrong(ids[1]) });
  for (const id of ids.slice(2)) s = reduce(s, { type: 'select', qid: id, answer: UNSURE });
  const results = Object.fromEntries(ids.map((id) => [id, answerStatus(set.items.find((i) => i.id === id), s.session.drafts[id])]));
  s = reduce(reduce(s, { type: 'confirm' }), { type: 'submit', results, now: 50 });
  assert.deepEqual(Object.keys(s.mistakes).sort(), ids.slice(1).sort());
  assert.deepEqual(practiceIds(s).sort(), ids.slice(1).sort());

  // ทบทวน: ตอบถูกแล้วข้อนั้นหายจากรายการ ตอบผิดซ้ำนับเพิ่ม
  const practice = getSet('practice');
  const pids = practiceIds(s);
  s = reduce(s, { type: 'start', session: createSession(practice, { ids: pids, now: 60 }) });
  const [first, second, ...rest] = s.session.blocks[0];
  s = reduce(s, { type: 'select', qid: first, answer: correct(first) });
  s = reduce(s, { type: 'select', qid: second, answer: wrong(second) });
  for (const id of rest) s = reduce(s, { type: 'select', qid: id, answer: correct(id) });
  const results2 = Object.fromEntries(s.session.blocks[0].map((id) => [id, answerStatus(practice.items.find((i) => i.id === id), s.session.drafts[id])]));
  s = reduce(reduce(s, { type: 'confirm' }), { type: 'submit', results: results2, now: 70 });
  assert.deepEqual(Object.keys(s.mistakes), [second]);
  assert.equal(s.mistakes[second].misses, 2);
});
