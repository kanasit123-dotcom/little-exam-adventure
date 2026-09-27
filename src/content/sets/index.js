/*
 * ทะเบียนชุดข้อสอบ — เพิ่มชุดใหม่: สร้าง set-XX.js (คัดลอกจาก set-01.js) แล้ว import มาใส่ใน SETS
 * ตัวเกม หน้าเฉลย เสียง และ test อ่านจากที่นี่ทั้งหมด ไม่ต้องแก้โค้ดส่วนอื่น
 */
import set01 from './set-01.js';
import set02 from './set-02.js';
import set03 from './set-03.js';
import set04 from './set-04.js';
import set05 from './set-05.js';

export const SETS = [set01, set02, set03, set04, set05];

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

/*
 * ชุดพิเศษ (src/content/library.js) ใช้โจทย์รวมจากทุกชุด: ชื่อเรื่องที่ใช้ร่วม (stimulus) ขึ้นต้นด้วยรหัสชุด
 * เพราะชุดต่างกันอาจตั้งชื่อเรื่องซ้ำกัน — รหัสข้อไม่ซ้ำกันข้ามชุด (มี test ตรวจ)
 */
export const VIRTUAL_SETS = {
  mock: { title: 'ชุดจำลองสอบจริง', note: '30 ข้อ สุ่มจากทุกชุด หมวดละเท่าๆ กัน' },
  practice: { title: 'ทบทวนข้อที่เคยตอบผิด', note: 'ข้อที่เคยตอบผิดหรือยังไม่แน่ใจ ตอบถูกแล้วจะหายจากรายการ' },
};
const virtualCache = {};
function virtualSet(id) {
  if (!virtualCache[id]) {
    const stimuli = {};
    const items = [];
    for (const set of SETS) {
      for (const [key, stimulus] of Object.entries(set.stimuli || {})) stimuli[`${set.id}/${key}`] = stimulus;
      for (const item of set.items) items.push(item.stimulus ? { ...item, stimulus: `${set.id}/${item.stimulus}` } : item);
    }
    virtualCache[id] = { id, version: 1, virtual: true, ...VIRTUAL_SETS[id], order: [], stimuli, items };
  }
  return virtualCache[id];
}

export function getSet(id) {
  return SETS.find((set) => set.id === id) || (VIRTUAL_SETS[id] ? virtualSet(id) : null);
}

export function getItem(set, id) {
  return set?.items.find((item) => item.id === id) || null;
}

export const stimulusOf = (set, item) => (item?.stimulus ? set.stimuli?.[item.stimulus] || null : null);

/** หัวข้อตอนของข้อนี้ (จากเรื่องที่ใช้ร่วม หรือของข้อเอง) */
export const sectionOf = (set, item) => stimulusOf(set, item)?.section || item.section || DEFAULT_SECTION;

const flat = (text) => text.replace(/\s*\n\s*/g, ' ').trim();

/** ข้อความที่อ่านออกเสียงของโจทย์ (บรรทัดใหม่ในคำทายอ่านต่อกัน) */
/** เสียงอ่านโจทย์: ถ้าโจทย์มีตารางของตัวเอง อ่านข้อมูลในตารางก่อนคำถาม */
export function promptSpeech(item) {
  if (item.prompt.speech) return item.prompt.speech;
  const table = item.visual?.type === 'table' ? `${tableSpeech(item.visual)} ` : '';
  return `${table}${flat(item.prompt.text)}`;
}
/** อ่านตารางออกเสียงทีละแถว เช่น "ปอ 8 ผล เปา 5 ผล ปิ่น 6 ผล" (ผู้ปกครองขอ 2026-09-26: ตารางต้องมีเสียงอ่าน) */
export const tableSpeech = (visual) => visual.rows.map((row) => `${row.name} ${row.count} ${visual.unit}`).join(' ');

/** เสียงอ่านเรื่อง: ถ้าเรื่องมีตาราง อ่านข้อมูลในตารางต่อท้ายด้วย */
export function stimulusSpeech(stimulus) {
  if (stimulus.speech) return stimulus.speech;
  const table = stimulus.visual?.type === 'table' ? ` ${tableSpeech(stimulus.visual)}` : '';
  return `${flat(stimulus.text)}${table}`;
}

/** ข้อความที่อ่านเมื่อกดฟังตัวเลือก เช่น "ข้อ 1 14 ชิ้น" — ข้อที่ไม่ควรบอกชื่อรูปจะอ่านแค่ "ข้อ 1" */
export function optionSpeech(option, index) {
  const words = option.speech ?? option.text ?? '';
  return `ข้อ ${OPTION_LABELS[index]}${words ? ` ${words}` : ''}`;
}
