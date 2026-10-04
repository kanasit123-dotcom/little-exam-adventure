// เพื่อนที่โตสุดแล้วมีไข่และลูก: ขั้นทั้งหมดคิดจากจำนวนครั้งที่เลือก (rewards.friends)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce } from '../src/core/state.js';
import { normalize } from '../src/core/storage.js';
import { SAY, copySpeeches } from '../src/content/copy.js';
import {
  FAMILY_MAX, FRIEND_SIZES, cardLabel, familyOf, friendIds, headline, isFamilyComplete, pickableFriends, sayKey,
} from '../src/core/friends.js';

test('ครบ 4 ขนาดแล้วจึงมีลูก: ไข่ → ลูกตัวจิ๋ว → ลูกโต แล้วลูกคนที่สองอีกรอบ รวม 10 ครั้ง', () => {
  assert.equal(FAMILY_MAX, 10);
  const expected = {
    0: [0, 0, 0], 1: [1, 0, 0], 2: [2, 0, 0], 3: [3, 0, 0], 4: [4, 0, 0],
    5: [4, 1, 0], 6: [4, 2, 0], 7: [4, 3, 0], 8: [4, 3, 1], 9: [4, 3, 2], 10: [4, 3, 3],
    11: [4, 3, 3], 99: [4, 3, 3],
  };
  for (const [count, [level, kid1, kid2]] of Object.entries(expected)) {
    const family = familyOf(Number(count));
    assert.deepEqual([family.level, ...family.kids], [level, kid1, kid2], `count ${count}`);
  }
  assert.deepEqual(familyOf(undefined), { level: 0, kids: [0, 0] });
});

test('ลูกไม่โผล่ก่อนแม่โตสุด และลูกคนที่สองไม่มาก่อนลูกคนแรกโตเต็มที่', () => {
  for (let n = 0; n <= 12; n++) {
    const { level, kids } = familyOf(n);
    if (kids[0] > 0) assert.equal(level, FRIEND_SIZES.length, `count ${n}`);
    if (kids[1] > 0) assert.equal(kids[0], 3, `count ${n}`);
  }
});

test('ป้ายบนการ์ดเดิมไม่เปลี่ยนสำหรับ 4 ครั้งแรก และแต่ละขั้นของครอบครัวมีป้ายไม่ซ้ำกัน', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(cardLabel), ['ยังไม่มี', 'ขนาดเล็ก', 'ขนาดกลาง', 'ขนาดใหญ่', 'ขนาดใหญ่มาก']);
  const labels = [5, 6, 7, 8, 9, 10].map(cardLabel);
  assert.equal(new Set(labels).size, labels.length);
  assert.equal(cardLabel(10), 'ครอบครัวครบ');
  assert.equal(cardLabel(40), 'ครอบครัวครบ');
});

test('หัวเรื่องและประโยคพูดมีครบทุกขั้น ไม่ซ้ำกัน และประโยคอยู่ในรายการที่ต้องอัดเสียง', () => {
  const heads = [];
  const keys = [];
  const spoken = new Set(copySpeeches());
  for (let n = 1; n <= FAMILY_MAX; n++) {
    const text = headline('turtle', n);
    assert.ok(text.includes('เต่า'), `หัวเรื่องขั้น ${n} ต้องมีชื่อเพื่อน: ${text}`);
    heads.push(text);
    const key = sayKey(n);
    assert.ok(SAY[key], `SAY.${key} ขาดหายไป`);
    assert.ok(spoken.has(SAY[key]), `SAY.${key} ไม่อยู่ในรายการอัดเสียง`);
    keys.push(key);
  }
  assert.equal(new Set(heads).size, heads.length);
  // ขนาดเล็ก/กลาง/ใหญ่ ใช้ประโยค "เพื่อนโตขึ้น" ร่วมกัน ที่เหลือแต่ละขั้นมีประโยคของตัวเอง
  assert.deepEqual(keys.slice(0, 4), ['newFriend', 'friendGrew', 'friendGrew', 'friendGrew']);
  assert.equal(new Set(keys.slice(4)).size, 6);
  assert.ok(spoken.has(SAY.familyFull));
  assert.equal('friendBiggest' in SAY, false, 'ประโยค "ตัวใหญ่ที่สุดแล้ว" เลิกใช้แล้ว');
});

test('ตัวที่ครอบครัวครบแล้วพักไว้ จนกว่าทุกตัวจะครบ', () => {
  assert.equal(isFamilyComplete(9), false);
  assert.equal(isFamilyComplete(10), true);
  const ids = friendIds();
  assert.equal(ids.length, 11);
  assert.deepEqual(pickableFriends({}), ids);
  const turtleDone = pickableFriends({ turtle: 10, seal: 9 });
  assert.equal(turtleDone.includes('turtle'), false);
  assert.equal(turtleDone.includes('seal'), true);
  assert.equal(turtleDone.length, ids.length - 1);
  const all = Object.fromEntries(ids.map((id) => [id, FAMILY_MAX]));
  assert.deepEqual(pickableFriends(all), ids, 'ครบทุกตัวแล้วเลือกได้ทุกตัว');
});

test('รับรางวัลซ้ำเพื่อนตัวเดิมนับต่อไปถึง 10 แล้วหยุด (ข้อมูลเดิมที่นับเกินใช้ได้ต่อ)', () => {
  const claimable = (friends) => ({
    ...initialState(),
    rewards: { stars: 3, stickers: [], friends, claimed: {} },
    session: { id: 'x', setId: 'set-01', setVersion: 1, phase: 'reward' },
  });
  assert.equal(reduce(claimable({ turtle: 4 }), { type: 'claim', friend: 'turtle', now: 1 }).rewards.friends.turtle, 5);
  assert.equal(reduce(claimable({ turtle: 9 }), { type: 'claim', friend: 'turtle', now: 1 }).rewards.friends.turtle, 10);
  assert.equal(reduce(claimable({ turtle: 10 }), { type: 'claim', friend: 'turtle', now: 1 }).rewards.friends.turtle, 10);
  // เซฟเก่าที่นับเกิน 10 ถูกจำกัดตอนโหลด ไม่พัง
  const loaded = normalize({ ...initialState(), rewards: { stars: 60, stickers: [], friends: { turtle: 57, seal: 4 }, claimed: {} } });
  assert.deepEqual(loaded.state.rewards.friends, { turtle: 10, seal: 4 });
});
