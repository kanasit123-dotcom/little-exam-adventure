import test from 'node:test';
import assert from 'node:assert/strict';
import { getSet } from '../src/content/sets/index.js';
import { createSession } from '../src/core/session.js';
import { initialState, reduce } from '../src/core/state.js';
import { load, save, STORAGE_KEY, BACKUP_KEY } from '../src/core/storage.js';
import { createStore } from '../src/core/store.js';

function memory(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: (k) => data.delete(k),
  };
}

test('uses its own key and never touches other games', () => {
  assert.equal(STORAGE_KEY, 'little-exam-adventure-v1');
  const store = memory({ 'lilly-world-v1': '{"keep":true}', 'happy-little-kitchen-v1': 'x' });
  save(store, initialState());
  assert.equal(store.data.get('lilly-world-v1'), '{"keep":true}');
  assert.equal(store.data.get('happy-little-kitchen-v1'), 'x');
  assert.ok(store.data.has(STORAGE_KEY));
});

test('round trip keeps session, drafts and cursor', () => {
  const store = memory();
  let s = reduce(initialState(), { type: 'start', session: createSession(getSet('set-01'), { now: 1 }) });
  const qid = s.session.blocks[0][2];
  s = reduce(s, { type: 'goto', cursor: 2 });
  s = reduce(s, { type: 'select', qid, answer: 'b' });
  save(store, s);
  const back = load(store);
  assert.equal(back.problem, null);
  assert.equal(back.state.session.cursor, 2);
  assert.equal(back.state.session.drafts[qid], 'b');
  assert.deepEqual(back.state.session.optionOrder, s.session.optionOrder);
});

test('unreadable save is backed up, not deleted, and the app starts fresh', () => {
  const store = memory({ [STORAGE_KEY]: '{broken', 'lilly-world-v1': 'keep' });
  const result = load(store);
  assert.equal(result.problem, 'unreadable');
  assert.equal(result.state.session, null);
  assert.equal(store.data.get(BACKUP_KEY), '{broken');
  assert.equal(store.data.get('lilly-world-v1'), 'keep');
});

test('a broken session is dropped but rewards and settings survive', () => {
  const good = initialState();
  const raw = { ...good, settings: { ...good.settings, rate: 'slow' }, rewards: { stars: 3, stickers: ['sticker-bow'], claimed: {} }, session: { id: 42 } };
  const store = memory({ [STORAGE_KEY]: JSON.stringify(raw) });
  const result = load(store);
  assert.equal(result.problem, 'session');
  assert.equal(result.state.session, null);
  assert.equal(result.state.rewards.stars, 3);
  assert.equal(result.state.settings.rate, 'slow');
});

test('per-set progress survives reload; broken entries are dropped', () => {
  const raw = { ...initialState(), progress: { 'set-01': { completed: 2, last: { correct: 8, total: 12 } }, bad: { completed: 'x' }, worse: null } };
  const result = load(memory({ [STORAGE_KEY]: JSON.stringify(raw) }));
  assert.deepEqual(Object.keys(result.state.progress), ['set-01']);
  assert.equal(result.state.progress['set-01'].completed, 2);
  // บันทึกเก่าที่ยังไม่มี progress ก็โหลดได้
  const old = { ...initialState() };
  delete old.progress;
  assert.deepEqual(load(memory({ [STORAGE_KEY]: JSON.stringify(old) })).state.progress, {});
});

test('storage failures are reported instead of throwing', () => {
  const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('full'); } };
  assert.equal(load(broken).problem, 'storage');
  assert.equal(save(broken, initialState()), false);
  const store = createStore(broken);
  assert.equal(store.saveOk, false);
  assert.equal(store.dispatch({ type: 'settings', patch: { sound: false } }), true);
  assert.equal(store.state.settings.sound, false);
});

test('store saves once per accepted action and ignores rejected ones', () => {
  let writes = 0;
  const mem = memory();
  const counting = { getItem: mem.getItem, setItem: (k, v) => { writes++; mem.setItem(k, v); } };
  const store = createStore(counting);
  assert.equal(store.dispatch({ type: 'settings', patch: { rate: 'nope' } }), false);
  assert.equal(writes, 0);
  store.dispatch({ type: 'settings', patch: { rate: 'slow' } });
  assert.equal(writes, 1);
});
