/* ที่เก็บ state กลาง: dispatch → reduce → บันทึกทั้งก้อนครั้งเดียว → แจ้งหน้าจอ */
import { reduce } from './state.js';
import { load, save } from './storage.js';

export function createStore(storage) {
  const loaded = load(storage);
  let state = loaded.state;
  let saveOk = loaded.problem !== 'storage';
  const subs = new Set();
  return {
    get state() { return state; },
    get saveOk() { return saveOk; },
    loadProblem: loaded.problem,
    /** คืน true ถ้า action ผ่านเงื่อนไขและเปลี่ยน state */
    dispatch(action) {
      const next = reduce(state, action);
      if (next === state) return false;
      const prev = state;
      state = next;
      saveOk = save(storage, state);
      for (const fn of subs) fn(state, prev, action);
      return true;
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
}
