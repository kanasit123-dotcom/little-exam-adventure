import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { SETS, stimulusOf } from '../src/content/sets/index.js';
import { createSession } from '../src/core/session.js';
import { toExamQuestion } from '../src/core/exam-question.js';

const added = SETS.filter((s) => Number(s.id.slice(4)) >= 51 && Number(s.id.slice(4)) <= 60);
const find = (id) => added.flatMap((s) => s.items).find((i) => i.id === id);
const right = (item) => item.options.find((o) => o.id === item.correctOptionId);

test('sets 51-60 supply 150 main and 150 changed transfer items without exam helpers', () => {
  assert.equal(added.length, 10);
  for (const set of added) {
    assert.equal(set.order.length, 15);
    assert.equal(set.items.length, 30);
    assert.deepEqual(createSession(set, { now: 1 }).blocks.map((b) => b.length), [5, 5, 5]);
    const counts = {};
    for (const id of set.order) {
      const item = find(id);
      counts[item.subject] = (counts[item.subject] || 0) + 1;
      const transfer = find(item.review.transferIds[0]);
      assert.deepEqual(item.skillIds, transfer.skillIds);
      assert.notEqual(item.prompt.text + JSON.stringify(item.visual), transfer.prompt.text + JSON.stringify(transfer.visual), id);
      for (const key of ['review', 'correctOptionId', 'hints', 'column']) assert.equal(key in toExamQuestion(set, item), false, id);
    }
    assert.equal(Object.keys(counts).length, 6);
    assert.ok(Object.values(counts).every((n) => n >= 2 && n <= 4));
  }
});

test('new arithmetic answers match the existing column board, including carry and borrow', () => {
  let count = 0, carry = 0, borrow = 0;
  for (const set of added) for (const item of set.items) {
    if (!item.review.column) continue;
    const { a, op, b } = item.review.column;
    assert.equal(parseInt(right(item).text, 10), op === '+' ? a + b : a - b, item.id);
    carry += op === '+' && a % 10 + b % 10 >= 10;
    borrow += op === '-' && a % 10 < b % 10;
    count++;
  }
  assert.ok(count >= 50);
  assert.ok(carry > 10 && borrow > 10);
});

test('cube totals, front heights and top footprints agree with the actual rendered model', () => {
  const set = added.find((s) => s.id === 'set-56');
  for (const suffix of ['', '-t']) {
    const count = find(`s56-count${suffix}`);
    const rows = (count.visual || stimulusOf(set, count).visual).rows;
    assert.equal(parseInt(right(count).text, 10), rows.flat().reduce((a, b) => a + b, 0));
    assert.deepEqual(right(find(`s56-front${suffix}`)).svg.front, rows[0].map((_, c) => Math.max(...rows.map((r) => r[c]))));
    assert.deepEqual(right(find(`s56-top${suffix}`)).svg.top, rows.map((r) => r.map((n) => n > 0 ? 1 : 0)));
    assert.equal(parseInt(right(find(`s56-tallest${suffix}`)).text, 10), Math.max(...rows.flat()));
  }
});

test('new calendar dates and marked-day answers match November and December 2026', () => {
  const set = added.find((s) => s.id === 'set-54');
  for (const suffix of ['', '-t']) {
    const item = find(`s54-marked-count${suffix}`);
    const v = item.visual || stimulusOf(set, item).visual;
    const month = suffix ? 10 : 11;
    assert.equal(new Date(2026, month, 1).getDay(), v.start);
    assert.equal(new Date(2026, month + 1, 0).getDate(), v.days);
    assert.equal(parseInt(right(item).text, 10), v.marks.length);
  }
  assert.equal(right(find('s54-weekday')).text, 'วันพุธ');
  assert.equal(right(find('s54-weekday-t')).text, 'วันอาทิตย์');
});

test('queue questions exclude the named child and both endpoints', () => {
  const expected = { before: 3, 'before-t': 5, between: 2, 'between-t': 4, after: 5, 'after-t': 4 };
  for (const [key, value] of Object.entries(expected)) assert.equal(parseInt(right(find(`s57-${key}`)).text, 10), value);
});

test('written-word and matrix choices withhold pronunciation and the rule until review', () => {
  for (const id of ['s59-written-word', 's59-written-word-t', 's60-dot-matrix', 's60-dot-matrix-t']) {
    const item = find(id);
    assert.ok(item.options.every((o) => o.speech === ''), id);
    const set = added.find((s) => s.items.some((i) => i.id === id));
    assert.ok(toExamQuestion(set, item).options.every((o) => /^ข้อ [1-3]$/.test(o.speech)), id);
  }
  assert.equal(right(find('s59-written-word')).text, 'เสื่อ');
  assert.equal(right(find('s59-written-word-t')).text, 'เสื้อ');
  for (const suffix of ['', '-t']) {
    const item = find(`s60-dot-matrix${suffix}`);
    assert.equal(item.prompt.text, 'ภาพในช่อง ? ควรเป็นภาพใด');
    assert.equal(item.visual.rows[0].length, 3);
    assert.deepEqual(right(item).svg.figure, { dots: 8 });
  }
});

test('changing-quantity stories make the counted moment explicit', () => {
  assert.match(find('s58-ice-total').prompt.text, /^ก่อนเริ่มทดลอง/);
  assert.equal(right(find('s58-ice-total')).text, '12 ก้อน');
  assert.match(added.find((s) => s.id === 'set-53').stimuli.story.text, /นับเด็กบนรถให้ครบก่อนออกเดินทางกลับ/);
  assert.equal(right(find('s53-reason')).text, 'เด็กขึ้นรถครบหรือไม่');
});

test('new answer positions are balanced and do not repeat a three-choice cycle', () => {
  for (const set of added) {
    const key = set.order.map((id) => find(id).options.findIndex((o) => o.id === find(id).correctOptionId));
    const counts = [0, 1, 2].map((n) => key.filter((value) => value === n).length);
    assert.ok(Math.max(...counts) - Math.min(...counts) <= 2, set.id);
    assert.equal(key.every((value, index) => value === key[index % 3]), false, set.id);
  }
});

test('released sets 1-50 retain their exact normalized contents (hash updated 2026-10-04 after review fixes in sets 43, 44, 49)', () => {
  const hash = createHash('sha256');
  const paths = Array.from({ length: 50 }, (_, i) => `src/content/sets/set-${String(i + 1).padStart(2, '0')}.js`).sort();
  for (const path of paths) { hash.update(path); hash.update(readFileSync(path, 'utf8').replace(/\r\n/g, '\n')); }
  assert.equal(hash.digest('hex'), 'e9574647f9d7414fe3f092f295a00f1fa86030f1156c5f0599ef5200c0c6a8b1');
});
