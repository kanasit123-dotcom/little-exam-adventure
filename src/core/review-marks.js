/*
 * เครื่องหมายของผู้ปกครองในหน้าตรวจเฉลย: ติดธง "สงสัย" ที่ข้อ และจด "ตรวจชุดนี้แล้ว"
 * เก็บใน key แยกจากข้อมูลเกม (ไม่แตะความคืบหน้าของเด็ก) ข้อมูลเสียหรือเก็บไม่ได้ = เริ่มว่าง ไม่ทำให้หน้าพัง
 */
export const MARKS_KEY = 'little-exam-adventure-review-marks-v1';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const onlyTrue = (map) => Object.fromEntries(Object.entries(isObj(map) ? map : {}).filter(([, v]) => v === true));

export const emptyMarks = () => ({ flags: {}, done: {} });

/** แปลงข้อมูลที่อ่านมาเป็นรูปที่ใช้ได้ (รหัสข้อ/ชุด -> true) */
export function normalizeMarks(raw) {
  if (!isObj(raw)) return emptyMarks();
  return { flags: onlyTrue(raw.flags), done: onlyTrue(raw.done) };
}

export function loadMarks(storage) {
  try {
    const text = storage?.getItem(MARKS_KEY);
    return text ? normalizeMarks(JSON.parse(text)) : emptyMarks();
  } catch {
    return emptyMarks();
  }
}

/** คืน true ถ้าบันทึกได้ */
export function saveMarks(storage, marks) {
  try {
    storage.setItem(MARKS_KEY, JSON.stringify(normalizeMarks(marks)));
    return true;
  } catch {
    return false;
  }
}

/** สลับค่า (คืนสำเนาใหม่ ไม่แก้ของเดิม) */
export function toggleMark(marks, kind, id) {
  const next = { flags: { ...marks.flags }, done: { ...marks.done } };
  if (next[kind][id]) delete next[kind][id];
  else next[kind][id] = true;
  return next;
}
