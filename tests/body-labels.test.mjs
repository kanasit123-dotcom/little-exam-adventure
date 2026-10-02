// รูปเด็กทั้งตัวที่มีเลขชี้ (ชุด 29): เลขต้องชี้ถูกส่วนที่เฉลยบอก และเลขในรูปเดียวกันต้องไม่ซ้อนกัน
import test from 'node:test';
import assert from 'node:assert/strict';
import { SETS, stimulusOf } from '../src/content/sets/index.js';

// ขอบเขตของแต่ละส่วนในรูป pic-child-girl และ pic-child-boy (% ของรูป วัดจากรูปจริง) — ซ้ายและขวาของรูป
const REGIONS = {
  ผม: [[30, 70, 3, 12]],
  หู: [[34, 42, 16, 25], [58, 66, 16, 25]],
  แก้ม: [[40, 47, 20, 26], [53, 60, 20, 26]],
  แขน: [[30, 39, 36, 57], [61, 70, 36, 57]],
  มือ: [[29, 38, 54, 64], [62, 71, 54, 64]],
  เข่า: [[39, 48, 72, 81], [52, 61, 72, 81]],
  ขา: [[38, 48, 72, 92], [52, 62, 72, 92]],
  เท้า: [[35, 48, 88, 98], [52, 65, 88, 98]],
};
const USES = { 'หยิบจับสิ่งของ': 'มือ', 'ฟังเสียง': 'หู', 'ยืนและเดิน': 'เท้า', 'เดินและวิ่ง': 'ขา' };
const inside = (part, m) => REGIONS[part].some(([x0, x1, y0, y1]) => m.x >= x0 && m.x <= x1 && m.y >= y0 && m.y <= y1);

const labelled = [];
for (const set of SETS) {
  for (const item of set.items) {
    const visual = item.visual?.type === 'labeled' ? item.visual : stimulusOf(set, item)?.visual;
    if (visual?.type === 'labeled') labelled.push({ item, visual });
  }
}
const correctText = (item) => item.options.find((o) => o.id === item.correctOptionId).text;
const markOf = (visual, n) => visual.marks.find((m) => m.n === n);

test('numbers in one labelled picture never overlap each other', () => {
  assert.ok(labelled.length >= 18);
  for (const { item, visual } of labelled) {
    const spots = visual.marks.map((m) => [m.lx ?? m.x, m.ly ?? m.y]);
    for (let i = 0; i < spots.length; i++) {
      for (let j = i + 1; j < spots.length; j++) {
        const gap = Math.hypot(spots[i][0] - spots[j][0], spots[i][1] - spots[j][1]);
        assert.ok(gap >= 12, `${item.id}: numbers ${visual.marks[i].n} and ${visual.marks[j].n} are only ${gap.toFixed(1)}% apart`);
      }
    }
  }
});

test('the number each body-part question points at lies on the part the answer names', () => {
  let checked = 0;
  for (const { item, visual } of labelled) {
    const text = item.prompt.text;
    let m;
    if ((m = text.match(/^หมายเลข (\d) คือส่วนใดของร่างกาย$/))) {
      const part = correctText(item);
      assert.ok(REGIONS[part], `${item.id}: unknown part ${part}`);
      assert.ok(inside(part, markOf(visual, Number(m[1]))), `${item.id}: mark ${m[1]} is not on ${part}`);
      checked++;
    } else if ((m = text.match(/^หมายเลข (\d) ใช้ทำอะไรได้$/))) {
      const part = USES[correctText(item)];
      assert.ok(part, `${item.id}: unknown use`);
      assert.ok(inside(part, markOf(visual, Number(m[1]))), `${item.id}: mark ${m[1]} is not on ${part}`);
      checked++;
    } else if ((m = text.match(/^ส่วนของร่างกายที่ใช้(.+) คือหมายเลขใด$/))) {
      const part = USES[m[1]];
      assert.ok(part, `${item.id}: unknown use ${m[1]}`);
      const n = Number(correctText(item).match(/\d/)[0]);
      assert.ok(inside(part, markOf(visual, n)), `${item.id}: mark ${n} is not on ${part}`);
      // เลขอื่นต้องไม่อยู่บนส่วนเดียวกัน ไม่งั้นมีสองคำตอบ
      for (const other of visual.marks.filter((x) => x.n !== n)) assert.ok(!inside(part, other), `${item.id}: mark ${other.n} is also on ${part}`);
      checked++;
    } else if ((m = text.match(/^หมายเลขใดอยู่(สูง|ต่ำ)ที่สุดของร่างกาย$/))) {
      const n = Number(correctText(item).match(/\d/)[0]);
      const ys = visual.marks.map((x) => x.y);
      assert.equal(markOf(visual, n).y, m[1] === 'สูง' ? Math.min(...ys) : Math.max(...ys), item.id);
      checked++;
    } else if ((m = text.match(/^หมายเลข (\d) และหมายเลข (\d) อยู่ที่ส่วนใดของร่างกายเหมือนกัน$/))) {
      const region = { ศีรษะ: (mk) => mk.y <= 30, ขา: (mk) => mk.y >= 72 && mk.y <= 92 }[correctText(item)];
      assert.ok(region, `${item.id}: unknown region`);
      assert.ok(region(markOf(visual, Number(m[1]))) && region(markOf(visual, Number(m[2]))), item.id);
      checked++;
    }
  }
  assert.ok(checked >= 18, `only ${checked} labelled questions checked`);
});
