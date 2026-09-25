import test from 'node:test';
import assert from 'node:assert/strict';
import { getSet } from '../src/content/sets/index.js';
import { createSession, partition } from '../src/core/session.js';
import { initialState, reduce, UNSURE, HISTORY_LIMIT, submittedAnswer } from '../src/core/state.js';
import { summarize } from '../src/core/summary.js';

const set = getSet('set-01');
const correctOf = (id) => set.items.find((i) => i.id === id).correctOptionId;
const wrongOf = (id) => set.items.find((i) => i.id === id).options.find((o) => o.id !== correctOf(id)).id;

function started(now = 1000) {
  return reduce(initialState(), { type: 'start', session: createSession(set, { now, random: () => 0.25 }) });
}
function answerBlock(state, pick = correctOf) {
  for (const id of state.session.blocks[state.session.block]) state = reduce(state, { type: 'select', qid: id, answer: pick(id) });
  return state;
}
function submitBlock(state, pick) {
  state = answerBlock(state, pick);
  state = reduce(state, { type: 'confirm' });
  return reduce(state, { type: 'submit', now: 5 });
}

test('partition: 10 -> 5+5, 12 -> 5+5+2, 15 -> 5+5+5, groups stay together', () => {
  const ids = (n) => Array.from({ length: n }, (_, i) => `q${i}`);
  assert.deepEqual(partition(ids(10)).map((b) => b.length), [5, 5]);
  assert.deepEqual(partition(ids(12)).map((b) => b.length), [5, 5, 2]);
  assert.deepEqual(partition(ids(15)).map((b) => b.length), [5, 5, 5]);
  const group = (id) => (['q4', 'q5'].includes(id) ? 'story' : null);
  assert.deepEqual(partition(ids(12), 5, group).map((b) => b.length), [4, 5, 3]);
});

test('session keeps question and option order', () => {
  const a = createSession(set, { now: 1, random: () => 0.1 });
  assert.deepEqual(a.questionIds, set.order);
  assert.deepEqual(a.optionOrder[set.order[0]], ['a', 'b', 'c']);
  assert.notEqual(a.id, createSession(set, { now: 2, random: () => 0.1 }).id);
});

test('selection only works in the current block and records first selection separately', () => {
  let s = started();
  const [first] = s.session.blocks[0];
  const future = s.session.blocks[1][0];
  assert.equal(reduce(s, { type: 'select', qid: future, answer: 'a' }), s, 'future block rejected');
  assert.equal(reduce(s, { type: 'select', qid: first, answer: 'zzz' }), s, 'unknown option rejected');
  s = reduce(s, { type: 'select', qid: first, answer: 'a' });
  s = reduce(s, { type: 'select', qid: first, answer: 'b' });
  assert.equal(s.session.drafts[first], 'b');
  assert.equal(s.session.firstSelections[first], 'a');
  assert.equal(s.session.changes[first], 1);
  s = reduce(s, { type: 'select', qid: first, answer: UNSURE });
  assert.equal(s.session.drafts[first], UNSURE);
});

test('cannot confirm or submit until every item in the block is answered or marked not sure', () => {
  let s = started();
  const ids = s.session.blocks[0];
  s = reduce(s, { type: 'select', qid: ids[0], answer: 'a' });
  assert.equal(reduce(s, { type: 'confirm' }), s);
  assert.equal(reduce(s, { type: 'submit' }), s, 'no submit without confirm');
  for (const id of ids.slice(1)) s = reduce(s, { type: 'select', qid: id, answer: UNSURE });
  s = reduce(s, { type: 'confirm' });
  assert.equal(s.session.phase, 'confirm');
  s = reduce(s, { type: 'cancelConfirm', cursor: 3 });
  assert.equal(s.session.phase, 'exam');
  assert.equal(s.session.cursor, 3);
});

test('submitted answers are frozen: later selections cannot change them', () => {
  let s = submitBlock(started(), wrongOf);
  const qid = s.session.blocks[0][0];
  assert.equal(s.session.phase, 'review');
  const before = submittedAnswer(s.session, qid);
  assert.equal(reduce(s, { type: 'select', qid, answer: correctOf(qid) }), s);
  s = reduce(s, { type: 'transfer', tid: 'th-garden-most-t', forQid: qid, answer: 'a', correct: true });
  assert.equal(submittedAnswer(s.session, qid), before, 'transfer does not overwrite the first answer');
  assert.equal(s.session.transfers['th-garden-most-t'].attempts.length, 1);
});

test('review cannot open unsubmitted or future blocks', () => {
  let s = started();
  assert.equal(reduce(s, { type: 'reviewGoto', cursor: 0 }), s, 'no review during exam');
  const future = s.session.blocks[1][0];
  assert.equal(reduce(s, { type: 'hint', qid: future }), s);
  assert.equal(reduce(s, { type: 'reviewStep', qid: future, step: 0 }), s);
  assert.equal(reduce(s, { type: 'transfer', tid: 'x', forQid: future, answer: 'a', correct: true }), s);
  s = submitBlock(s);
  assert.equal(reduce(s, { type: 'reviewGoto', cursor: 9 }), s, 'cursor must be inside the submitted block');
  assert.equal(reduce(s, { type: 'reviewGoto', cursor: 4 }).session.review.cursor, 4);
});

test('full 5+5+2 loop: review -> break -> next block, last review -> reward', () => {
  let s = started();
  for (let block = 0; block < 3; block++) {
    assert.equal(s.session.phase, 'exam');
    assert.equal(s.session.block, block);
    s = submitBlock(s);
    s = reduce(s, { type: 'finishReview' });
    if (block < 2) {
      assert.equal(s.session.phase, 'break');
      s = reduce(s, { type: 'endBreak' });
    }
  }
  assert.equal(s.session.phase, 'reward');
});

test('reward is granted once per session regardless of score, even when claimed twice', () => {
  let s = started();
  for (let block = 0; block < 3; block++) {
    s = submitBlock(s, wrongOf);
    s = reduce(s, { type: 'finishReview' });
    if (block < 2) s = reduce(s, { type: 'endBreak' });
  }
  const claimed = reduce(s, { type: 'claim', sticker: 'sticker-star', now: 9 });
  assert.equal(claimed.rewards.stars, 1);
  assert.deepEqual(claimed.rewards.stickers, ['sticker-star']);
  assert.equal(claimed.session.phase, 'done');
  // กดซ้ำ / รีโหลดแล้วกลับมาที่หน้ารางวัล
  const again = reduce({ ...claimed, session: { ...claimed.session, phase: 'reward' } }, { type: 'claim', sticker: 'sticker-bow', now: 10 });
  assert.equal(again.rewards.stars, 1);
  assert.deepEqual(again.rewards.stickers, ['sticker-star']);
  assert.equal(claimed.history[0].id, s.session.id);
});

test('finishing a set records per-set progress (completions, last and best first-answer score)', () => {
  const finish = (state, correct) => {
    let s = reduce(state, { type: 'start', session: createSession(set, { now: correct + 10, random: () => correct / 100 }) });
    for (let block = 0; block < 3; block++) {
      s = submitBlock(s);
      s = reduce(s, { type: 'finishReview' });
      if (block < 2) s = reduce(s, { type: 'endBreak' });
    }
    return reduce(s, { type: 'claim', sticker: null, result: { correct, total: 12 }, now: 99 });
  };
  let s = finish(initialState(), 9);
  assert.deepEqual(s.progress['set-01'], { completed: 1, last: { correct: 9, total: 12 }, best: { correct: 9, total: 12 }, version: 1, at: 99 });
  s = finish(s, 6);
  assert.equal(s.progress['set-01'].completed, 2);
  assert.deepEqual(s.progress['set-01'].last, { correct: 6, total: 12 });
  assert.deepEqual(s.progress['set-01'].best, { correct: 9, total: 12 });
  // ข้อมูลผลเสียไม่ทำให้พัง แค่ไม่บันทึกคะแนน
  const odd = finish(initialState(), 20);
  assert.equal(odd.progress['set-01'].last, null);
  assert.equal(odd.progress['set-01'].completed, 1);
});

test('set cards: next set, in-progress set and finished set', async () => {
  const { setCards } = await import('../src/screens/home.js');
  const sets = [{ id: 'a', order: ['x'] }, { id: 'b', order: ['y'] }, { id: 'c', order: ['z'] }];
  const state = { ...initialState(), progress: { a: { completed: 2, last: { correct: 1, total: 1 } } } };
  const cards = setCards(state, sets);
  assert.deepEqual(cards.map((c) => [c.set.id, !!c.progress, c.next, c.active]), [['a', true, false, false], ['b', false, true, false], ['c', false, false, false]]);
});

test('exposure: a later item with a skill already taught is flagged and left out of the baseline', () => {
  let s = started();
  const skill = s.session.skills[s.session.blocks[1][0]][0];
  s = { ...s, session: { ...s.session, skills: { ...s.session.skills, [s.session.blocks[0][0]]: [skill] } } };
  s = submitBlock(s);
  s = reduce(s, { type: 'finishReview' });
  s = reduce(s, { type: 'endBreak' });
  s = submitBlock(s);
  assert.equal(s.session.exposure[s.session.blocks[1][0]], true);
  assert.equal(s.session.exposure[s.session.blocks[1][1]], undefined);
  const sum = summarize(s.session, set);
  assert.equal(sum.totals.baselineTotal, 11);
});

test('replay counts by role, ignores unknown roles; history stays bounded', () => {
  let s = started();
  const qid = s.session.questionIds[0];
  s = reduce(s, { type: 'replay', role: 'prompt', qid });
  s = reduce(s, { type: 'replay', role: 'option', qid });
  s = reduce(s, { type: 'replay', role: 'option', qid });
  assert.deepEqual(s.session.replays[qid], { prompt: 1, option: 2 });
  assert.equal(reduce(s, { type: 'replay', role: 'weird', qid }), s);
  let h = initialState();
  for (let i = 0; i < HISTORY_LIMIT + 4; i++) h = reduce(h, { type: 'start', session: createSession(set, { now: i + 1, random: () => i / 100 }) });
  assert.equal(h.history.length, HISTORY_LIMIT);
  assert.ok(h.history.every((x) => x.abandoned));
});

test('settings accept only known values', () => {
  const s = initialState();
  assert.equal(reduce(s, { type: 'settings', patch: { rate: 'fast' } }), s);
  assert.equal(reduce(s, { type: 'settings', patch: { mode: 'plain', rate: 'slow' } }).settings.rate, 'slow');
});

test('summary separates correct / incorrect / not sure', () => {
  let s = started();
  const ids = s.session.blocks[0];
  s = reduce(s, { type: 'select', qid: ids[0], answer: correctOf(ids[0]) });
  s = reduce(s, { type: 'select', qid: ids[1], answer: wrongOf(ids[1]) });
  for (const id of ids.slice(2)) s = reduce(s, { type: 'select', qid: id, answer: UNSURE });
  s = reduce(reduce(s, { type: 'confirm' }), { type: 'submit' });
  const t = summarize(s.session, set).totals;
  assert.deepEqual([t.correct, t.incorrect, t.unsure, t.submitted], [1, 1, 3, 5]);
});
