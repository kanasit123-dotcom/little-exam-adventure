/*
 * สติกเกอร์เพื่อนที่โตได้ (ลิลลี่ขอ 2026-09-27): จบชุดแล้วเลือกเพื่อน 1 ตัว
 * เลือกตัวเดิมซ้ำ เพื่อนจะโตขึ้นทีละขั้น เล็ก → กลาง → ใหญ่ → ใหญ่มาก (ขั้นสุดท้ายแล้วนับต่อแต่ไม่โตอีก)
 */
import { FRIENDS } from './assets.js';

export const FRIEND_SIZES = ['เล็ก', 'กลาง', 'ใหญ่', 'ใหญ่มาก'];
// ขนาดภาพตามขั้น (สัดส่วนของกรอบ) — ขั้น 0 คือยังไม่มี
export const FRIEND_SCALE = [0.46, 0.55, 0.7, 0.85, 1];

export const friendIds = () => Object.keys(FRIENDS);
export const friendName = (id) => FRIENDS[id] || id;
/** 0 = ยังไม่มี, 1-4 = เล็ก กลาง ใหญ่ ใหญ่มาก */
export const friendLevel = (count) => Math.max(0, Math.min(count || 0, FRIEND_SIZES.length));
export const sizeName = (level) => (level ? FRIEND_SIZES[level - 1] : 'ยังไม่มี');
export const isBiggest = (count) => friendLevel(count) === FRIEND_SIZES.length;
