// โหมดฟังโจทย์แบบสอบจริง (2 รอบ): ค่าตั้งและการนับรอบใน session
import test from 'node:test';
import assert from 'node:assert/strict';
import { getSet } from '../src/content/sets/index.js';
import { createSession } from '../src/core/session.js';
import { initialState, reduce } from '../src/core/state.js';
import { normalize } from '../src/core/storage.js';
import { summarize } from '../src/core/summary.js';

test('the listening mode setting defaults to free and accepts only free or twice', () => {
  const s0 = initialState();
  assert.equal(s0.settings.listen, 'free');
  const twice = reduce(s0, { type: 'settings', patch: { listen: 'twice' } });
  assert.equal(twice.settings.listen, 'twice');
  assert.equal(reduce(twice, { type: 'settings', patch: { listen: 'three-times' } }), twice, 'unknown value changes nothing');
});

test('a saved listening mode survives loading; an odd value or an old save falls back to free', () => {
  const saved = { ...initialState(), settings: { ...initialState().settings, listen: 'twice' } };
  assert.equal(normalize(JSON.parse(JSON.stringify(saved))).state.settings.listen, 'twice');
  const odd = JSON.parse(JSON.stringify(saved));
  odd.settings.listen = 'forever';
  assert.equal(normalize(odd).state.settings.listen, 'free');
  const old = JSON.parse(JSON.stringify(initialState()));
  delete old.settings.listen;
  assert.equal(normalize(old).state.settings.listen, 'free');
});

test('read-aloud rounds are counted per question and per story without touching the replay report', () => {
  const set = getSet('set-01');
  let s = reduce(initialState(), { type: 'start', session: createSession(set, { now: 1 }) });
  const [first, second] = s.session.questionIds;
  s = reduce(s, { type: 'replay', role: 'round', qid: first });
  s = reduce(s, { type: 'replay', role: 'round', qid: first });
  s = reduce(s, { type: 'replay', role: 'round', qid: 'story:pets' });
  s = reduce(s, { type: 'replay', role: 'round', qid: second });
  assert.equal(s.session.replays[first].round, 2);
  assert.equal(s.session.replays['story:pets'].round, 1);
  assert.equal(s.session.replays[second].round, 1);
  const row = summarize(s.session, set).rows[0];
  assert.equal(row.promptReplays, 0, 'rounds are not "listen again" presses');
  assert.equal(row.optionReplays, 0);
});
