// ปฏิทิน จิ๊กซอว์ และใกล้-ไกล (ชุด 28): ตรวจว่าเฉลยตรงกับภาพจริง ปฏิทินตรงกับวันที่จริง และตัวตรวจเนื้อหาจับข้อมูลผิดได้
import test from 'node:test';
import assert from 'node:assert/strict';
import { SETS, getSet, stimulusOf } from '../src/content/sets/index.js';
import { validateVisual, validateItem } from '../src/core/content-validator.js';
import { toExamQuestion, copyVisual } from '../src/core/exam-question.js';
import { renderVisual, renderOptionSvg } from '../src/visuals/visuals.js';

const calendars = [];
for (const set of SETS) {
  for (const item of set.items) {
    const visual = item.visual || stimulusOf(set, item)?.visual;
    if (visual?.type === 'calendar') calendars.push({ set, item, visual });
  }
}

test('calendar visuals match the real calendar (October and November 2026)', () => {
  const real = { ตุลาคม: [2026, 9], พฤศจิกายน: [2026, 10], ธันวาคม: [2026, 11] };
  assert.ok(calendars.length >= 5);
  for (const { item, visual } of calendars) {
    const [year, month] = real[visual.month];
    assert.equal(new Date(year, month, 1).getDay(), visual.start, `${item.id}: first day of ${visual.month}`);
    assert.equal(new Date(year, month + 1, 0).getDate(), visual.days, `${item.id}: days in ${visual.month}`);
  }
});

test('calendar questions have the answer the calendar gives', () => {
  const set = getSet('set-28');
  const correct = (id) => { const i = set.items.find((x) => x.id === id); return i.options.find((o) => o.id === i.correctOptionId).text; };
  // ตุลาคม 2026: 1 = พฤหัสบดี, 10 = เสาร์, วันอาทิตย์ 4 11 18 25, วันศุกร์แรก = 2, 15 + 7 = 22
  assert.equal(correct('g-cal-first'), 'วันพฤหัสบดี');
  assert.equal(correct('r-cal-tenth'), 'วันเสาร์');
  assert.equal(correct('m-cal-sundays'), '4 วัน');
  assert.equal(correct('m-cal-plus7'), 'วันที่ 22');
  assert.equal(correct('r-cal-friday'), 'วันที่ 2');
  // พฤศจิกายน 2026: 1 = อาทิตย์, 14 = เสาร์, วันอาทิตย์ 5 วัน, วันศุกร์แรก = 6, 8 + 7 = 15
  assert.equal(correct('g-cal-first-t'), 'วันอาทิตย์');
  assert.equal(correct('r-cal-tenth-t'), 'วันเสาร์');
  assert.equal(correct('m-cal-sundays-t'), '5 วัน');
  assert.equal(correct('m-cal-plus7-t'), 'วันที่ 15');
  assert.equal(correct('r-cal-friday-t'), 'วันที่ 6');
});

test('jigsaw questions: the right option is exactly the missing piece, the others differ in picture or cell', () => {
  let checked = 0;
  for (const set of SETS) {
    for (const item of set.items.filter((i) => i.visual?.type === 'jigsaw')) {
      const options = item.options.map((o) => o.svg.piece);
      const right = item.options.find((o) => o.id === item.correctOptionId).svg.piece;
      assert.deepEqual(right, { asset: item.visual.asset, cell: item.visual.missing }, item.id);
      const same = options.filter((p) => p.asset === right.asset && p.cell === right.cell);
      assert.equal(same.length, 1, `${item.id}: exactly one matching piece`);
      checked++;
    }
  }
  assert.ok(checked >= 4);
});

test('near-far questions: the answer is the smallest picture for "farthest" and the largest for "nearest"', () => {
  let checked = 0;
  for (const set of SETS) {
    for (const item of set.items.filter((i) => i.visual?.type === 'distance')) {
      const sizes = item.visual.items.map((i) => i.size);
      const wanted = /ไกล.*มากที่สุด/.test(item.prompt.text) ? Math.min(...sizes) : /ใกล้.*มากที่สุด/.test(item.prompt.text) ? Math.max(...sizes) : null;
      assert.ok(wanted !== null, `${item.id}: prompt not recognised`);
      const text = item.options.find((o) => o.id === item.correctOptionId).text;
      const number = Number(text.match(/\d+/)[0]);
      assert.equal(sizes[number - 1], wanted, item.id);
      checked++;
    }
  }
  assert.ok(checked >= 4);
});

test('validator rejects broken calendar, jigsaw, distance and piece data', () => {
  const ids = new Set(['pic-house', 'pic-mountain']);
  assert.deepEqual(validateVisual({ type: 'calendar', month: 'ตุลาคม', start: 4, days: 31, marks: [10] }, ids), []);
  assert.ok(validateVisual({ type: 'calendar', month: 'ตุลาคม', start: 5, days: 31 }, ids).length, 'six weeks do not fit the screen');
  assert.ok(validateVisual({ type: 'calendar', month: 'ตุลาคม', start: 4, days: 31, marks: [40] }, ids).length);
  assert.deepEqual(validateVisual({ type: 'jigsaw', asset: 'pic-mountain', missing: 'br' }, ids), []);
  assert.ok(validateVisual({ type: 'jigsaw', asset: 'pic-mountain', missing: 'middle' }, ids).length);
  assert.ok(validateVisual({ type: 'jigsaw', asset: 'pic-nope', missing: 'tl' }, ids).length);
  assert.deepEqual(validateVisual({ type: 'distance', items: [0.4, 1, 0.7].map((size) => ({ asset: 'pic-house', size })) }, ids), []);
  assert.ok(validateVisual({ type: 'distance', items: [0.5, 0.5, 1].map((size) => ({ asset: 'pic-house', size })) }, ids).length, 'equal sizes are ambiguous');
  const base = { id: 'x', type: 'main', subject: 'spatial', skillIds: ['s'], familyId: 'f', difficulty: 1, sourceId: 'src', provenance: 'original', rights: 'r', reviewStatus: 'draft', narration: 'n', prompt: { text: 'q' }, review: { summary: 's', hints: [], steps: ['1', '2'] } };
  const withPieces = (cells) => ({ ...base, options: cells.map((cell, i) => ({ id: 'abc'[i], svg: { piece: { asset: 'pic-mountain', cell } } })), correctOptionId: 'a' });
  assert.deepEqual(validateItem(withPieces(['tl', 'tr', 'br']), { assetIds: ids }), []);
  assert.ok(validateItem(withPieces(['tl', 'xx', 'br']), { assetIds: ids }).length);
});

test('the exam question keeps only the known fields of the new visuals and renders them', () => {
  const calendar = copyVisual({ type: 'calendar', month: 'ตุลาคม', start: 4, days: 31, marks: [10], answer: 'leak' });
  assert.equal('answer' in calendar, false);
  const html = renderVisual(calendar);
  assert.match(html, /lx-cal-cell/);
  assert.equal((html.match(/lx-cal-sun/g) || []).length, 1 + 4, 'Sunday header plus four Sundays are red');
  assert.match(renderVisual({ type: 'distance', items: [0.4, 1, 0.7].map((size) => ({ asset: 'pic-house', size })) }), /lx-dist-item/);
  assert.match(renderVisual({ type: 'jigsaw', asset: 'pic-mountain', missing: 'br' }), /lx-jig-blank/);
  assert.match(renderOptionSvg({ piece: { asset: 'pic-mountain', cell: 'br' } }), /lx-piece/);
  const set = getSet('set-28');
  const dto = toExamQuestion(set, set.items.find((i) => i.id === 'sp-jigsaw-mountain'));
  assert.equal(JSON.stringify(dto).includes('correct'), false);
  assert.ok(dto.options.every((o) => o.svg?.piece));
});

test('labelled-picture visual: validator, allow-list copy and rendering', () => {
  const ids = new Set(['pic-body-hair']);
  const good = { type: 'labeled', asset: 'pic-body-hair', marks: [{ n: 1, x: 50, y: 10 }, { n: 2, x: 30, y: 60 }] };
  assert.deepEqual(validateVisual(good, ids), []);
  assert.ok(validateVisual({ ...good, marks: [{ n: 1, x: 50, y: 10 }] }, ids).length, 'needs at least two marks');
  assert.ok(validateVisual({ ...good, marks: [{ n: 1, x: 50, y: 10 }, { n: 1, x: 30, y: 60 }] }, ids).length, 'numbers must differ');
  assert.ok(validateVisual({ ...good, marks: [{ n: 1, x: 50, y: 10 }, { n: 2, x: 130, y: 60 }] }, ids).length, 'x must stay inside the picture');
  const copied = copyVisual({ ...good, secret: 'leak' });
  assert.equal('secret' in copied, false);
  const html = renderVisual(copied);
  assert.equal((html.match(/class="lx-mark"/g) || []).length, 2);
  assert.match(html, /left:50%;top:10%/);
  // เลขที่ลากเส้นชี้: เลขอยู่ที่ lx, ly และมีเส้นไปที่ x, y
  const led = renderVisual(copyVisual({ ...good, marks: [{ n: 1, x: 40, y: 20, lx: 10, ly: 22 }, { n: 2, x: 30, y: 60 }] }));
  assert.match(led, /left:10%;top:22%/);
  assert.ok(led.includes('<line x1="40%" y1="20%" x2="10%" y2="22%"/>'));
  assert.equal((led.match(/<line /g) || []).length, 1, 'only the led mark has a line');
  assert.ok(validateVisual({ ...good, marks: [{ n: 1, x: 40, y: 20, lx: 10 }, { n: 2, x: 30, y: 60 }] }, ids).length, 'lx needs ly');
  assert.ok(validateVisual({ ...good, marks: [{ n: 1, x: 40, y: 20, lx: 110, ly: 5 }, { n: 2, x: 30, y: 60 }] }, ids).length, 'label must stay inside the picture');
});
