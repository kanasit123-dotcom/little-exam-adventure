import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { SETS, SUBJECTS, getSet, OPTION_LABELS } from '../src/content/sets/index.js';
import { validateSet, validateItem } from '../src/core/content-validator.js';
import { ASSETS } from '../src/core/assets.js';
import { createSession } from '../src/core/session.js';

const assetIds = new Set(Object.keys(ASSETS));

test('every registered set validates (references, provenance, review, transfers, stimuli)', () => {
  assert.ok(SETS.length >= 1);
  const ids = new Set();
  for (const set of SETS) {
    assert.ok(!ids.has(set.id), `duplicate set id ${set.id}`);
    ids.add(set.id);
    const report = validateSet(set, { assetIds });
    assert.deepEqual(report.errors, [], set.id);
  }
});

test('every set file in the folder is registered in sets/index.js', () => {
  const files = readdirSync(new URL('../src/content/sets/', import.meta.url)).filter((f) => /^set-\d+\.js$/.test(f));
  assert.deepEqual(files.map((f) => f.replace('.js', '')).sort(), SETS.map((s) => s.id).sort());
});

test('set 1 is the QA slice: 12 main items, two per subject, six subjects, no English', () => {
  const set = getSet('set-01');
  assert.equal(set.order.length, 12);
  const counts = {};
  for (const id of set.order) {
    const item = set.items.find((i) => i.id === id);
    counts[item.subject] = (counts[item.subject] || 0) + 1;
  }
  assert.deepEqual(Object.keys(counts).sort(), Object.keys(SUBJECTS).sort());
  for (const n of Object.values(counts)) assert.equal(n, 2);
  assert.equal(set.items.some((i) => i.subject === 'english'), false);
});

test('set 1 splits into 5 + 5 + 2 without breaking a shared story', () => {
  const set = getSet('set-01');
  const session = createSession(set, { now: 1, random: () => 0.5 });
  assert.deepEqual(session.blocks.map((b) => b.length), [5, 5, 2]);
  for (const block of session.blocks) {
    for (const id of block) {
      const stim = set.items.find((i) => i.id === id).stimulus;
      if (!stim) continue;
      const all = set.order.filter((o) => set.items.find((i) => i.id === o).stimulus === stim);
      assert.ok(all.every((o) => block.includes(o)), `stimulus ${stim} split across blocks`);
    }
  }
});

test('options use exam labels 1 2 3 and each main item has three options', () => {
  assert.deepEqual(OPTION_LABELS.slice(0, 3), ['1', '2', '3']);
  for (const set of SETS) for (const item of set.items) assert.equal(item.options.length, 3, item.id);
});

test('every set: answers are spread over positions, blocks of at most five, all six subjects', () => {
  for (const set of SETS) {
    const positions = set.order.map((id) => {
      const item = set.items.find((i) => i.id === id);
      return item.options.findIndex((o) => o.id === item.correctOptionId);
    });
    for (const p of [0, 1, 2]) assert.ok(positions.filter((x) => x === p).length >= 3, `${set.id} position ${p + 1}`);
    const session = createSession(set, { now: 1, random: () => 0.5 });
    assert.ok(session.blocks.every((b) => b.length <= 5), set.id);
    const subjects = new Set(set.order.map((id) => set.items.find((i) => i.id === id).subject));
    assert.equal(subjects.size, 6, set.id);
  }
});

test('set 2 has 12 questions in 5 + 5 + 2 and its arithmetic answers match the column problems', () => {
  const set = getSet('set-02');
  assert.deepEqual(createSession(set, { now: 1 }).blocks.map((b) => b.length), [5, 5, 2]);
  for (const item of set.items.filter((i) => i.review.column)) {
    const { a, op, b } = item.review.column;
    const result = op === '+' ? a + b : a - b;
    assert.match(item.options.find((o) => o.id === item.correctOptionId).text, new RegExp(`^${result} `), item.id);
  }
});

test('explanation steps that name the answer point at the correct option number', () => {
  for (const set of SETS) {
    for (const item of set.items) {
      const label = OPTION_LABELS[item.options.findIndex((o) => o.id === item.correctOptionId)];
      for (const step of item.review.steps) {
        const match = step.match(/ตอบข้อ (\d)/);
        if (match) assert.equal(match[1], label, `${item.id}: "${step}"`);
      }
    }
  }
});

test('arithmetic fixtures 8 + 7 and 12 - 5 are in the review content with matching answers', () => {
  const set = getSet('set-01');
  const columns = set.items.filter((i) => i.review.column);
  const find = (a, op, b) => columns.find((i) => i.review.column.a === a && i.review.column.op === op && i.review.column.b === b);
  const add = find(8, '+', 7);
  const sub = find(12, '-', 5);
  assert.ok(add && sub);
  assert.match(add.options.find((o) => o.id === add.correctOptionId).text, /^15 /);
  assert.match(sub.options.find((o) => o.id === sub.correctOptionId).text, /^7 /);
});

test('validator rejects hints outside review, unknown assets and future-review leaks', () => {
  const base = getSet('set-01').items[0];
  assert.ok(validateItem({ ...base, hint: 'x' }).some((e) => e.includes('hint must stay inside review')));
  assert.ok(validateItem({ ...base, options: [{ id: 'a', image: 'pic-nope' }, ...base.options.slice(1)] }, { assetIds }).some((e) => e.includes('unknown asset')));
  assert.ok(validateItem({ ...base, correctOptionId: 'z' }).some((e) => e.includes('correct option is absent')));
  assert.ok(validateItem({ ...base, subject: 'english' }).some((e) => e.includes('invalid subject')));
});

test('no source file imports from the original game repositories', () => {
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(new URL(`${d.name}/`, dir)) : [new URL(d.name, dir)]));
  for (const file of walk(new URL('../src/', import.meta.url))) {
    // ตัดคอมเมนต์ออกก่อน (คอมเมนต์อ้างถึงที่มาของโค้ดได้) แล้วตรวจเฉพาะโค้ดจริง
    const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert.equal(/from ['"][^'"]*(game-lilly|happy-little-kitchen)/.test(text), false, file.pathname);
    assert.equal(/lilly-world-v1|happy-little-kitchen-v1/.test(text), false, file.pathname);
  }
});
