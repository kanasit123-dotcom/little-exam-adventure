// รายงานจุดอ่อนในหน้าผู้ปกครอง: ความแม่นแยกหมวดจากคำตอบแรก และข้อที่ยังพลาดบ่อย
import test from 'node:test';
import assert from 'node:assert/strict';
import { getSet } from '../src/content/sets/index.js';
import { createSession } from '../src/core/session.js';
import { initialState, reduce, UNSURE } from '../src/core/state.js';
import { answerStatus, frequentMistakes, weakSpots } from '../src/core/summary.js';

const correctOf = (set, id) => set.items.find((i) => i.id === id).correctOptionId;
const wrongOf = (set, id) => set.items.find((i) => i.id === id).options.find((o) => o.id !== correctOf(set, id)).id;

/** ทำช่วงแรกของชุดตามที่สั่ง: pick(index) = 'ok' | 'bad' | 'unsure' แล้วส่งคำตอบ */
function playFirstBlock(state, set, pick, now = 1) {
  let s = state;
  const ids = s.session.blocks[0];
  ids.forEach((id, i) => {
    const how = pick(i);
    const answer = how === 'ok' ? correctOf(set, id) : how === 'bad' ? wrongOf(set, id) : UNSURE;
    s = reduce(s, { type: 'select', qid: id, answer });
  });
  const results = Object.fromEntries(ids.map((id) => [id, answerStatus(set.items.find((i) => i.id === id), s.session.drafts[id])]));
  return reduce(reduce(s, { type: 'confirm' }), { type: 'submit', results, now });
}

test('weak spots count first answers by subject, from the session in progress', () => {
  const set = getSet('set-01');
  let s = reduce(initialState(), { type: 'start', session: createSession(set, { now: 1 }) });
  assert.deepEqual(weakSpots(s), { sessions: 0, questions: 0, subjects: [] }, 'nothing submitted yet');
  s = playFirstBlock(s, set, (i) => (i < 2 ? 'ok' : i === 2 ? 'bad' : i === 3 ? 'unsure' : 'ok'));
  const report = weakSpots(s);
  assert.equal(report.sessions, 1);
  assert.equal(report.questions, 5, 'only the submitted block counts');
  assert.equal(report.subjects.reduce((n, x) => n + x.ok, 0), 3);
  assert.ok(report.subjects.every((x) => x.name && x.n >= 1 && x.ok <= x.n));
  // เรียงจากแม่นน้อยไปมาก
  const rates = report.subjects.map((x) => x.ok / x.n);
  assert.deepEqual(rates, rates.slice().sort((a, b) => a - b));
});

test('weak spots skip the review set and sessions that no longer match the content', () => {
  const set = getSet('set-01');
  let s = reduce(initialState(), { type: 'start', session: createSession(set, { now: 1 }) });
  s = playFirstBlock(s, set, () => 'bad');
  const mistakeIds = Object.keys(s.mistakes);
  const practice = getSet('practice');
  const old = s.session;
  s = reduce(s, { type: 'start', session: createSession(practice, { ids: mistakeIds, now: 5 }) });
  s = playFirstBlock(s, practice, () => 'bad', 6);
  const report = weakSpots(s);
  assert.equal(report.questions, 5, 'review answers are repeats, not first answers');
  assert.equal(report.subjects.reduce((n, x) => n + x.ok, 0), 0);
  assert.equal(weakSpots(s, (session) => session.id !== old.id).questions, 0, 'a session the screen calls unusable is ignored');
});

test('answers after the skill was already taught in the same session are not counted', () => {
  const set = getSet('set-01');
  let s = reduce(initialState(), { type: 'start', session: createSession(set, { now: 1 }) });
  s = playFirstBlock(s, set, () => 'ok');
  assert.equal(weakSpots(s).questions, 5);
  const [first] = s.session.blocks[0];
  s = { ...s, session: { ...s.session, exposure: { ...s.session.exposure, [first]: true } } };
  const report = weakSpots(s);
  assert.equal(report.questions, 4, 'an exposed answer is left out');
  assert.equal(report.subjects.reduce((n, x) => n + x.ok, 0), 4);
});

test('frequent mistakes list the most-missed questions first, with set, subject and prompt', () => {
  const set = getSet('set-01');
  let s = reduce(initialState(), { type: 'start', session: createSession(set, { now: 1 }) });
  s = playFirstBlock(s, set, (i) => (i < 3 ? 'bad' : 'ok'), 10);
  const first = frequentMistakes(s);
  assert.equal(first.length, 3);
  assert.ok(first.every((m) => m.misses === 1 && m.setTitle === 'ชุดที่ 1' && m.subjectName && m.prompt));
  // ข้อแรกที่พลาดซ้ำในชุดทบทวนต้องขึ้นก่อน
  const practice = getSet('practice');
  const ids = Object.keys(s.mistakes);
  s = reduce(s, { type: 'start', session: createSession(practice, { ids, now: 20 }) });
  s = playFirstBlock(s, practice, (i) => (i === 1 ? 'bad' : 'ok'), 30);
  const second = frequentMistakes(s);
  assert.equal(second.length, 1);
  assert.equal(second[0].misses, 2);
  assert.deepEqual(frequentMistakes(s, 0), []);
});
