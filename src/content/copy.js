/*
 * ประโยคที่เกมพูดออกเสียง (นอกเหนือจากโจทย์และเฉลยในชุดข้อสอบ)
 * scripts/voice-texts.mjs อ่านไฟล์นี้เพื่ออัดเสียงให้ครบ — เพิ่มประโยคใหม่ตรงนี้แล้วรัน npm run voice
 */
import { OPTION_LABELS } from './sets/index.js';

export const SAY = {
  welcome: 'สวัสดีจ้ะ มาฝึกทำข้อสอบกันนะ',
  pickBuddy: 'เลือกเพื่อนที่จะมานั่งเป็นกำลังใจกันนะ',
  examRules: 'ฟังโจทย์ให้ดี แล้วเลือกคำตอบ ถ้ายังไม่แน่ใจก็กดยังไม่แน่ใจได้นะ',
  confirm: 'ทำครบทุกข้อในช่วงนี้แล้ว จะส่งคำตอบเลยไหม',
  reviewIntro: 'มาดูเฉลยกันนะ ข้อไหนยังไม่ถูกไม่เป็นไรเลย มาเรียนไปด้วยกัน',
  unsureAnswer: 'หนูตอบว่ายังไม่แน่ใจ',
  right: 'ถูกต้องแล้ว เก่งมาก',
  transferIntro: 'ลองทำข้อใหม่ที่คล้ายกันดูนะ',
  transferRight: 'ถูกต้อง เก่งมากเลย',
  transferWrong: 'ยังไม่ถูกนะ ไม่เป็นไร ดูวิธีคิดอีกครั้งกัน',
  breakTime: 'พักสักครู่นะ ยืดแขนขึ้นสูงๆ แล้วหายใจลึกๆ',
  breakDone: 'ค่อยๆ คิดได้นะ ไม่ต้องรีบ',
  reward: 'ทำครบทุกข้อแล้ว เก่งมาก ได้ดาวหนึ่งดวง เลือกสติกเกอร์ได้หนึ่งชิ้นเลย',
  thanks: 'ขอบคุณที่ตั้งใจทำนะ',
};

export const yourAnswer = (label) => `หนูตอบข้อ ${label}`;
export const correctIs = (label) => `คำตอบที่ถูกคือข้อ ${label}`;
export const blockStart = (n) => `เริ่มช่วงที่ ${n}`;
export const MAX_BLOCKS = 3;

/** ประโยคทั้งหมดในไฟล์นี้ (ใช้สร้างรายการอัดเสียง) */
export function copySpeeches() {
  const out = Object.values(SAY);
  for (const label of OPTION_LABELS.slice(0, 3)) out.push(yourAnswer(label), correctIs(label));
  for (let n = 1; n <= MAX_BLOCKS; n++) out.push(blockStart(n));
  return out;
}
