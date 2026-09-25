/*
 * บันทึกในเครื่องใต้ key ของเกมนี้เท่านั้น (ไม่แตะ lilly-world-v1 หรือ key ของเกมอื่น)
 * ข้อมูลเสีย → เก็บสำเนาไว้ที่ key สำรอง แล้วเริ่มใหม่ ไม่ลบ key อื่น
 */
import { initialState, STATE_VERSION, HISTORY_LIMIT } from './state.js';

export const STORAGE_KEY = 'little-exam-adventure-v1';
export const BACKUP_KEY = 'little-exam-adventure-v1-unreadable';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** ตรวจโครงหลักของ session; ไม่ผ่าน = null */
function validSession(s) {
  if (!isObj(s) || typeof s.id !== 'string' || typeof s.setId !== 'string' || !Number.isInteger(s.setVersion)) return null;
  if (!Array.isArray(s.questionIds) || !Array.isArray(s.blocks) || !s.blocks.every(Array.isArray)) return null;
  if (!['exam', 'confirm', 'review', 'break', 'reward', 'done'].includes(s.phase)) return null;
  if (!Number.isInteger(s.block) || s.block < 0 || s.block >= s.blocks.length) return null;
  const maps = ['optionOrder', 'skills', 'visited', 'drafts', 'firstSelections', 'changes', 'exposure', 'taughtSkills', 'transfers', 'replays'];
  if (!maps.every((key) => isObj(s[key])) || !Array.isArray(s.submitted) || !isObj(s.review)) return null;
  const cursor = Number.isInteger(s.cursor) && s.cursor >= 0 && s.cursor < s.blocks[s.block].length ? s.cursor : 0;
  return { ...s, cursor };
}

/** แปลงข้อมูลที่อ่านมาให้เป็น state ที่ใช้ได้ พร้อมบอกว่ามีปัญหาอะไร */
export function normalize(raw) {
  const base = initialState();
  if (!isObj(raw) || raw.version !== STATE_VERSION) return { state: base, problem: raw == null ? null : 'unreadable' };
  const settings = { ...base.settings };
  if (isObj(raw.settings)) {
    if (typeof raw.settings.sound === 'boolean') settings.sound = raw.settings.sound;
    if (['normal', 'slow'].includes(raw.settings.rate)) settings.rate = raw.settings.rate;
    if (typeof raw.settings.buddy === 'string') settings.buddy = raw.settings.buddy;
    if (['buddy', 'plain'].includes(raw.settings.mode)) settings.mode = raw.settings.mode;
  }
  const rewards = isObj(raw.rewards) && Number.isInteger(raw.rewards.stars) && Array.isArray(raw.rewards.stickers) && isObj(raw.rewards.claimed)
    ? { stars: raw.rewards.stars, stickers: raw.rewards.stickers.filter((x) => typeof x === 'string'), claimed: raw.rewards.claimed }
    : base.rewards;
  const history = Array.isArray(raw.history) ? raw.history.map(validSession).filter(Boolean).slice(0, HISTORY_LIMIT) : [];
  const session = raw.session == null ? null : validSession(raw.session);
  const problem = raw.session != null && !session ? 'session' : null;
  const progress = {};
  if (isObj(raw.progress)) {
    for (const [setId, p] of Object.entries(raw.progress)) if (isObj(p) && Number.isInteger(p.completed) && p.completed > 0) progress[setId] = p;
  }
  return { state: { version: STATE_VERSION, settings, session, rewards, history, progress }, problem };
}

export function load(storage) {
  let text = null;
  try {
    text = storage.getItem(STORAGE_KEY);
  } catch {
    return { state: initialState(), problem: 'storage' };
  }
  if (text == null) return { state: initialState(), problem: null };
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    raw = undefined;
  }
  const result = raw === undefined ? { state: initialState(), problem: 'unreadable' } : normalize(raw);
  if (result.problem === 'unreadable' || result.problem === 'session') {
    try { storage.setItem(BACKUP_KEY, text); } catch { /* เก็บสำรองไม่ได้ก็ไม่เป็นไร */ }
  }
  return result;
}

/** คืน true ถ้าบันทึกได้ — false ให้หน้าผู้ปกครองเตือนว่า "ทำต่อภายหลังอาจไม่ได้" */
export function save(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
