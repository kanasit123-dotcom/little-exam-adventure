/*
 * แบ่งข้อเป็นช่วงละไม่เกิน 5 ข้อ: 10 → 5+5, 12 → 5+5+2, 15 → 5+5+5
 * ข้อที่ใช้เรื่องเดียวกัน (stimulus) อยู่ช่วงเดียวกันเสมอ ถ้าใส่ไม่พอจะขึ้นช่วงใหม่
 */
export const BLOCK_SIZE = 5;

export function partition(ids, size = BLOCK_SIZE, groupOf = () => null) {
  const units = [];
  for (const id of ids) {
    const group = groupOf(id);
    const last = units[units.length - 1];
    if (group && last && last.group === group) last.ids.push(id);
    else units.push({ group, ids: [id] });
  }
  const blocks = [];
  let current = [];
  for (const unit of units) {
    if (current.length && current.length + unit.ids.length > size) {
      blocks.push(current);
      current = [];
    }
    current = current.concat(unit.ids);
  }
  if (current.length) blocks.push(current);
  return blocks;
}

export function newSessionId(now = Date.now(), random = Math.random) {
  return `s-${now.toString(36)}-${Math.floor(random() * 1e8).toString(36)}`;
}

/**
 * สร้าง session ใหม่จากชุดข้อสอบ — ใช้ลำดับที่ชุดกำหนด (คงที่เพื่อ QA) และลำดับตัวเลือกตามที่เขียนไว้
 * (เฉลยอ้างถึง "ข้อ 1/2/3" จึงไม่สลับตัวเลือก) ทั้งหมดบันทึกลง session เพื่อให้ทำต่อแล้วไม่เปลี่ยน
 */
export function createSession(set, { now = Date.now(), random = Math.random, count } = {}) {
  const ids = set.order.slice(0, count || set.order.length);
  const byId = new Map(set.items.map((item) => [item.id, item]));
  return {
    id: newSessionId(now, random),
    setId: set.id,
    setVersion: set.version,
    questionIds: ids,
    blocks: partition(ids, BLOCK_SIZE, (id) => byId.get(id).stimulus || null),
    optionOrder: Object.fromEntries(ids.map((id) => [id, byId.get(id).options.map((option) => option.id)])),
    skills: Object.fromEntries(ids.map((id) => [id, byId.get(id).skillIds.slice()])),
    phase: 'exam',
    block: 0,
    cursor: 0,
    visited: {},
    drafts: {},
    firstSelections: {},
    changes: {},
    submitted: [],
    exposure: {},
    taughtSkills: {},
    review: { block: 0, cursor: 0, steps: {}, hints: {}, helper: {} },
    transfers: {},
    replays: {},
    startedAt: now,
    finishedAt: null,
  };
}
