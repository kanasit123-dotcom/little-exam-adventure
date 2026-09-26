/*
 * ทะเบียนชุดข้อสอบ — เพิ่มชุดใหม่: สร้าง set-XX.js (คัดลอกจาก set-01.js) แล้ว import มาใส่ใน SETS
 * ตัวเกม หน้าเฉลย เสียง และ test อ่านจากที่นี่ทั้งหมด ไม่ต้องแก้โค้ดส่วนอื่น
 */
import set01 from './set-01.js';
import set02 from './set-02.js';
import set03 from './set-03.js';

export const SETS = [set01, set02, set03];

// ตัวเลือกในข้อสอบจริงใช้หมายเลข 1 2 3 (ไม่ใช่ ก ข ค)
export const OPTION_LABELS = ['1', '2', '3', '4'];
export const DEFAULT_SECTION = 'ตอบคำถามต่อไปนี้ให้ถูกต้อง';

export const SUBJECTS = {
  math: 'คณิตศาสตร์',
  thai: 'ภาษาไทย',
  reasoning: 'เชาวน์ปัญญา',
  spatial: 'มิติสัมพันธ์',
  science: 'วิทยาศาสตร์',
  general: 'ความรู้รอบตัว',
};

export function getSet(id) {
  return SETS.find((set) => set.id === id) || null;
}

export function getItem(set, id) {
  return set?.items.find((item) => item.id === id) || null;
}

export const stimulusOf = (set, item) => (item?.stimulus ? set.stimuli?.[item.stimulus] || null : null);

/** หัวข้อตอนของข้อนี้ (จากเรื่องที่ใช้ร่วม หรือของข้อเอง) */
export const sectionOf = (set, item) => stimulusOf(set, item)?.section || item.section || DEFAULT_SECTION;

const flat = (text) => text.replace(/\s*\n\s*/g, ' ').trim();

/** ข้อความที่อ่านออกเสียงของโจทย์ (บรรทัดใหม่ในคำทายอ่านต่อกัน) */
export const promptSpeech = (item) => item.prompt.speech || flat(item.prompt.text);
export const stimulusSpeech = (stimulus) => stimulus.speech || flat(stimulus.text);

/** ข้อความที่อ่านเมื่อกดฟังตัวเลือก เช่น "ข้อ 1 14 ชิ้น" — ข้อที่ไม่ควรบอกชื่อรูปจะอ่านแค่ "ข้อ 1" */
export function optionSpeech(option, index) {
  const words = option.speech ?? option.text ?? '';
  return `ข้อ ${OPTION_LABELS[index]}${words ? ` ${words}` : ''}`;
}
