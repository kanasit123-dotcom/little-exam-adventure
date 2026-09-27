/*
 * ชุดพิเศษที่ประกอบจากคลังโจทย์ทุกชุด (ไม่ต้องเขียนเนื้อหาใหม่)
 * - mock: ชุดจำลองสอบจริง 30 ข้อ สุ่มจากทุกชุด หมวดละประมาณเท่าๆ กัน ข้อที่ใช้เรื่องเดียวกันมาด้วยกันเสมอ
 * - practice: ทบทวนข้อที่เคยตอบผิดหรือยังไม่แน่ใจ (จาก state.mistakes) ตอบถูกแล้วข้อนั้นออกจากรายการ
 * ข้อที่เลือกถูกบันทึกลง session ตอนเริ่ม จึงทำต่อหลังรีโหลดได้โดยข้อไม่เปลี่ยน
 */
import { getSet } from './sets/index.js';

export const MOCK_SIZE = 30;
export const PRACTICE_SIZE = 10;
export const SUBJECT_CAP = 6;   // ชุดจำลอง: หมวดละไม่เกิน 6 ข้อ (6 หมวด x 5 = 30)

function shuffle(list, random) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** หน่วยที่ต้องอยู่ด้วยกัน: ข้อเดี่ยว หรือกลุ่มข้อที่ใช้เรื่อง/แผนภูมิเดียวกัน */
function units(set) {
  const groups = new Map();
  for (const item of set.items) {
    if (item.type !== 'main') continue;
    const key = item.stimulus || item.id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.values()];
}

export function mainCount() {
  return getSet('mock').items.filter((item) => item.type === 'main').length;
}

/** เลือกข้อสำหรับชุดจำลองสอบจริง */
export function pickMock(random = Math.random, size = MOCK_SIZE) {
  const all = shuffle(units(getSet('mock')), random);
  const picked = [];
  const perSubject = {};
  let count = 0;   // จำนวนข้อ (หนึ่งกลุ่มอาจมีหลายข้อ)
  const fits = (unit, cap) => count + unit.length <= size
    && unit.every((item) => (perSubject[item.subject] || 0) + unit.filter((u) => u.subject === item.subject).length <= cap);
  const take = (unit) => {
    picked.push(unit);
    count += unit.length;
    for (const item of unit) perSubject[item.subject] = (perSubject[item.subject] || 0) + 1;
  };
  // เติมทีละรอบ: หมวดละ 5 ก่อน (30 ข้อ / 6 หมวด) แล้วค่อยผ่อนเป็น 6 ถ้าเรื่องที่ใช้ร่วมทำให้ไม่ลงตัว
  // สุดท้าย (คลังเล็กมาก) เติมโดยไม่จำกัดหมวด
  for (const cap of [SUBJECT_CAP - 1, SUBJECT_CAP, Infinity]) {
    for (const unit of all) if (!picked.includes(unit) && fits(unit, cap)) take(unit);
  }
  return picked.flat().map((item) => item.id);
}

/** ข้อที่ควรทบทวน เรียงจากที่ผิดล่าสุด (เฉพาะข้อที่ยังมีในคลัง) */
export function practiceIds(state, size = PRACTICE_SIZE) {
  const set = getSet('practice');
  const known = new Set(set.items.filter((item) => item.type === 'main').map((item) => item.id));
  return Object.entries(state.mistakes || {})
    .filter(([id]) => known.has(id))
    .sort((a, b) => (b[1].at || 0) - (a[1].at || 0))
    .slice(0, size)
    .map(([id]) => id);
}
