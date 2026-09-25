/* ตัวช่วยเล็กๆ ของหน้าจอ */
import { asset, FRIENDS } from './core/assets.js';
import { esc } from './visuals/visuals.js';

export { esc };

export const $ = (root, selector) => root.querySelector(selector);
export const $$ = (root, selector) => [...root.querySelectorAll(selector)];

export function buddyId(state) {
  const id = state.settings.buddy;
  return id && FRIENDS[id] ? id : 'cat';
}

/** เพื่อนนั่งนิ่งๆ ที่มุมจอ (ระหว่างทำข้อสอบไม่ขยับ ไม่มีเสียง) */
export function buddyHTML(state, mood = 'still') {
  if (state.settings.mode === 'plain') return '';
  const a = asset(`friend-${buddyId(state)}`);
  return `<div class="lx-buddy lx-buddy-${mood}" aria-hidden="true"><img src="${esc(a.src)}" alt="" draggable="false"></div>`;
}

export function picture(id, cls = '') {
  const a = asset(id);
  return `<img class="${cls}" src="${esc(a.src)}" alt="" draggable="false">`;
}

/** ผูก event แบบยกเลิกได้เมื่อเปลี่ยนหน้า */
export function on(target, type, fn, signal) {
  target.addEventListener(type, fn, { signal });
}

/** แสดงสถานะกำลังพูดบนปุ่มฟัง */
export function markSpeaking(root, request) {
  for (const button of root.querySelectorAll('[data-say]')) {
    button.classList.toggle('lx-speaking', !!request && button.dataset.say === request.key);
  }
}

export const sleep = (ms, signal) => new Promise((resolve) => {
  const t = setTimeout(resolve, ms);
  signal?.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
});

export function confirmBox(root, { text, yes, no }, signal) {
  return new Promise((resolve) => {
    const box = document.createElement('div');
    box.className = 'lx-modal';
    box.innerHTML = `<div class="lx-modal-card" role="dialog" aria-modal="true"><p>${esc(text)}</p>
      <div class="lx-row"><button class="lx-btn lx-btn-ghost" data-v="no">${esc(no)}</button><button class="lx-btn lx-btn-warn" data-v="yes">${esc(yes)}</button></div></div>`;
    root.append(box);
    const done = (value) => { box.remove(); resolve(value); };
    box.addEventListener('click', (event) => {
      const v = event.target.closest('[data-v]')?.dataset.v;
      if (v) done(v === 'yes');
    });
    signal?.addEventListener('abort', () => done(false), { once: true });
  });
}
