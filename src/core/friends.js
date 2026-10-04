/*
 * สติกเกอร์เพื่อนที่โตได้ (ลิลลี่ขอ 2026-09-27): จบชุดแล้วเลือกเพื่อน 1 ตัว
 * เลือกตัวเดิมซ้ำ เพื่อนจะโตขึ้นทีละขั้น เล็ก → กลาง → ใหญ่ → ใหญ่มาก
 * โตสุดแล้ว (ผู้ปกครองขอ 2026-10-04) เลือกซ้ำต่อไปเพื่อนจะมีลูก: ไข่ → ลูกตัวจิ๋ว → ลูกโตขึ้น แล้วมีลูกคนที่สองอีกหนึ่งรอบ
 * จำนวนครั้งที่เลือกเก็บเป็นตัวเลขตัวเดียวต่อเพื่อน (rewards.friends) ขั้นทั้งหมดคิดจากตัวเลขนี้ จึงใช้กับข้อมูลเดิมได้เลย
 */
import { FRIENDS } from './assets.js';

export const FRIEND_SIZES = ['เล็ก', 'กลาง', 'ใหญ่', 'ใหญ่มาก'];
// ขนาดภาพตามขั้น (สัดส่วนของกรอบ) — ขั้น 0 คือยังไม่มี
export const FRIEND_SCALE = [0.46, 0.55, 0.7, 0.85, 1];
// เมื่อมีลูก ตัวแม่ย่อลงให้มีที่ให้ลูกยืนข้างๆ
export const PARENT_SCALE_WITH_KIDS = 0.72;

/** ขั้นของลูก 1 = ไข่, 2 = ลูกตัวจิ๋ว (ฟักแล้ว), 3 = ลูกโตขึ้น */
export const KID_STAGES = ['ไข่', 'ลูกตัวจิ๋ว', 'ลูกโตขึ้น'];
export const KIDS_PER_FRIEND = 2;
// 4 ครั้งแรกคือโตเป็นขนาดต่างๆ แล้วลูกคนละ 3 ครั้ง: 4 + 3 + 3
export const FAMILY_MAX = FRIEND_SIZES.length + KID_STAGES.length * KIDS_PER_FRIEND;

export const friendIds = () => Object.keys(FRIENDS);
export const friendName = (id) => FRIENDS[id] || id;
/** 0 = ยังไม่มี, 1-4 = เล็ก กลาง ใหญ่ ใหญ่มาก */
export const friendLevel = (count) => Math.max(0, Math.min(count || 0, FRIEND_SIZES.length));
export const sizeName = (level) => (level ? FRIEND_SIZES[level - 1] : 'ยังไม่มี');
export const isBiggest = (count) => friendLevel(count) === FRIEND_SIZES.length;

const clamp = (n, lo, hi) => Math.max(lo, Math.min(n, hi));

/** จำนวนครั้งที่เลือก → { level: ขนาดของตัวแม่, kids: [ขั้นลูกคนที่ 1, ขั้นลูกคนที่ 2] } (0 = ยังไม่มี) */
export function familyOf(count) {
  const n = clamp(count || 0, 0, FAMILY_MAX);
  const base = FRIEND_SIZES.length;
  const step = KID_STAGES.length;
  return { level: friendLevel(n), kids: [clamp(n - base, 0, step), clamp(n - base - step, 0, step)] };
}

/** ครอบครัวครบแล้ว = เลือกต่อไปไม่เกิดอะไรเพิ่ม */
export const isFamilyComplete = (count) => (count || 0) >= FAMILY_MAX;

/** ป้ายเล็กใต้ชื่อเพื่อนในการ์ด */
export function cardLabel(count) {
  const n = clamp(count || 0, 0, FAMILY_MAX);
  if (n === 0) return 'ยังไม่มี';
  if (n <= FRIEND_SIZES.length) return `ขนาด${sizeName(n)}`;
  return ['มีไข่', 'ลูกจิ๋ว 1', 'มีลูก 1 ตัว', 'ลูก 1 + ไข่', 'ลูก 1 + จิ๋ว', 'ครอบครัวครบ'][n - FRIEND_SIZES.length - 1];
}

/** ข้อความหัวเรื่องบนหน้ารางวัล หลังเลือกเพื่อนแล้วได้จำนวนครั้งนี้ */
export function headline(id, count) {
  const name = friendName(id);
  const n = clamp(count || 0, 1, FAMILY_MAX);
  if (n === 1) return `ได้${name}ตัวใหม่แล้ว`;
  if (n <= FRIEND_SIZES.length) return `${name}โตขึ้นเป็นขนาด${sizeName(n)}แล้ว`;
  return [
    `${name}มีไข่แล้ว รอวันฟักนะ`,
    `ไข่ของ${name}ฟักแล้ว ได้ลูกน้อย`,
    `ลูกน้อยของ${name}โตขึ้นแล้ว`,
    `${name}มีไข่ใบใหม่แล้ว`,
    `ไข่ใบที่สองของ${name}ฟักแล้ว`,
    `ครอบครัว${name}ครบแล้ว เก่งมาก`,
  ][n - FRIEND_SIZES.length - 1];
}

/** คีย์ประโยคใน SAY ที่เกมพูดหลังเลือกเพื่อนแล้วได้จำนวนครั้งนี้ */
export function sayKey(count) {
  const n = clamp(count || 0, 1, FAMILY_MAX);
  if (n === 1) return 'newFriend';
  if (n <= FRIEND_SIZES.length) return 'friendGrew';
  return ['friendEgg', 'friendHatched', 'friendBabyGrew', 'friendEggAgain', 'friendHatchedAgain', 'friendFamilyDone'][n - FRIEND_SIZES.length - 1];
}

/**
 * เลือกเพื่อนตัวไหนได้บ้างตอนรับรางวัล: ตัวที่ครอบครัวครบแล้วพักไว้ก่อน
 * เพื่อให้ดาวที่ได้ไปเพิ่มให้ตัวอื่นเสมอ — ยกเว้นครบทุกตัวแล้วจึงเลือกได้ทุกตัว
 */
export function pickableFriends(counts = {}) {
  const ids = friendIds();
  const open = ids.filter((id) => !isFamilyComplete(counts[id]));
  return open.length ? open : ids;
}
