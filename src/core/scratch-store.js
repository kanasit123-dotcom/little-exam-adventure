/*
 * กระดาษทด — เก็บเส้นที่เด็กเขียนไว้ในหน่วยความจำเท่านั้น (ไม่บันทึกลงเครื่อง ไม่ส่งออก)
 * แต่ละข้อมีกระดาษของตัวเอง กลับมาที่ข้อเดิมในการสอบครั้งเดียวกันแล้วเห็นของเดิม
 * พิกัดเก็บเป็นสัดส่วน 0..1 ของกระดาษ จึงวาดซ้ำได้ถูกที่เมื่อหมุนจอหรือย่อขยาย
 */

export const MAX_STROKES = 400;
export const MAX_POINTS = 2000;
export const PEN_COLORS = { black: '#2b2233', blue: '#1f6feb', red: '#d62839' };

/** ข้อที่ต้องทดเลข = วิชาคณิตศาสตร์ หรือข้อที่มีวิธีตั้งหลักบวก/ลบ (ผู้ปกครองสั่งเพิ่ม item.scratch = true/false ได้เป็นรายข้อ) */
export function needsScratch(item) {
  if (typeof item.scratch === 'boolean') return item.scratch;
  return item.subject === 'math' || !!item.review?.column;
}

const clamp01 = (n) => Math.min(1, Math.max(0, n));

export function createScratchStore() {
  const papers = new Map();
  const paperOf = (key) => {
    if (!papers.has(key)) papers.set(key, []);
    return papers.get(key);
  };
  return {
    strokes: (key) => paperOf(key),
    count: (key) => papers.get(key)?.length || 0,
    /** เริ่มเส้นใหม่ คืนเส้นนั้นให้เพิ่มจุดต่อได้ */
    begin(key, { color, width, erase = false }, x, y) {
      const list = paperOf(key);
      const stroke = { color, width, erase: !!erase, points: [[clamp01(x), clamp01(y)]] };
      list.push(stroke);
      if (list.length > MAX_STROKES) list.shift();
      return stroke;
    },
    extend(stroke, x, y) {
      if (stroke.points.length >= MAX_POINTS) return false;
      stroke.points.push([clamp01(x), clamp01(y)]);
      return true;
    },
    undo(key) { return paperOf(key).pop() || null; },
    clear(key) { papers.delete(key); },
    /** ทิ้งกระดาษของข้อที่ไม่ได้อยู่ในการสอบครั้งนี้ (คีย์ขึ้นต้นด้วยรหัสการสอบ) */
    keepOnly(prefix) { for (const key of [...papers.keys()]) if (!key.startsWith(prefix)) papers.delete(key); },
    size: () => papers.size,
  };
}

/** กระดาษเดียวกันทั้งแอป (หน้าสอบเปิดใหม่ตอนไปข้อถัดไป แต่เส้นที่เขียนไม่หาย) */
export const scratchStore = createScratchStore();
