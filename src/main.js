/*
 * Lily Exam Adventure — จุดเริ่มแอป: โหลด state, ตั้งเสียง, สลับหน้าจอ
 * เปลี่ยนหน้า = ยกเลิกทุกอย่างของหน้าเก่า (AbortSignal) + หยุดเสียง ก่อนวาดหน้าใหม่
 */
import './styles.css';
import { getSet } from './content/sets/index.js';
import { asset } from './core/assets.js';
import { createAudio } from './core/audio.js';
import { createStore } from './core/store.js';
import { mountExam, mountConfirm } from './screens/exam.js';
import { mountReview } from './screens/review.js';
import { mountBreak, mountReward } from './screens/rest.js';
import { mountHome, mountSets, mountBuddy, mountAlbum, sessionUsable } from './screens/home.js';
import { mountParent } from './screens/parent.js';
import { mountAnswers } from './screens/answers.js';

const root = document.querySelector('#app');
const store = createStore(window.localStorage);
const audio = createAudio({ base: import.meta.env.BASE_URL });

const VIEWS = { home: mountHome, sets: mountSets, buddy: mountBuddy, album: mountAlbum, parent: mountParent, answers: mountAnswers };
const PHASES = { exam: mountExam, confirm: mountConfirm, review: mountReview, break: mountBreak, reward: mountReward, done: mountReward };

let view = 'home';
let params = null;
let current = null;
let ctx = null;

function applySettings() {
  const { settings } = store.state;
  audio.setEnabled(settings.sound);
  audio.setRate(settings.rate);
  document.body.classList.toggle('lx-plain', settings.mode === 'plain');
}

function mount() {
  current?.abort();
  audio.stop();
  current = new AbortController();
  const session = store.state.session;
  let screen = VIEWS[view];
  if (view === 'play') {
    if (!session || !sessionUsable(session)) { view = 'home'; screen = mountHome; } else screen = PHASES[session.phase];
  }
  document.body.dataset.view = view === 'play' ? session.phase : view;
  ctx = { store, audio, set: session ? getSet(session.setId) : null, go, params, signal: current.signal, onPhase: null };
  root.innerHTML = '';
  screen(root, ctx);
  window.scrollTo?.(0, 0);
}

function go(next, nextParams = null) {
  view = next;
  params = nextParams;
  mount();
}

store.subscribe((state, prev) => {
  applySettings();
  const phase = state.session?.phase;
  const prevPhase = prev.session?.phase;
  if (view !== 'play' || state.session?.id !== prev.session?.id) return;
  if (phase !== prevPhase) {
    // รับรางวัลแล้ว (reward → done) วาดใหม่ในหน้าเดิม ไม่ตัดเสียง
    if (ctx?.onPhase && prevPhase === 'reward' && phase === 'done') ctx.onPhase();
    else mount();
  }
});

// iPad: ต้องปลดล็อกเสียงจากการแตะของผู้ใช้ และปลุกเสียงอีกครั้งหลังสลับแอป
// iOS นับเฉพาะ touchend/click (และ pointerup ของนิ้ว) เป็นการแตะที่ปลดล็อกเสียงได้ — pointerdown อย่างเดียวบน iPad อาจไม่พอ
// iPad/iPhone Safari: ล็อกจอหรือพับแอปแล้วกลับมา เสียงทั้งหน้าอาจเงียบ (ผู้ปกครองเจอ 2026-10-03: รีเฟรชแล้วมีเสียงกลับมา)
// แตะครั้งแรกหลังกลับมา: audio สร้างระบบเสียงใหม่ แล้วเช็คว่านาฬิกาเสียงเดินไหม ถ้ายังไม่เดิน รีเฟรชหน้าให้เองแล้วกลับไปข้อเดิม
// (ข้อสอบเก็บข้อที่ทำอยู่และคำตอบไว้ใน localStorage แล้ว) รีเฟรชได้ไม่เกินครั้งละ 1 นาที กันวนซ้ำ ระหว่างนั้นใช้เสียงเครื่องอ่านแทน
const RELOAD_AT = 'lx-audio-reload-at';
const RELOAD_VIEW = 'lx-audio-reload-view';
let returned = false;
let checking = false;
function afterReturnTap() {
  if (!returned || checking || !store.state.settings.sound) return;
  checking = true;
  audio.checkClock(800).then((ok) => {
    checking = false;
    returned = false;
    if (ok) return;
    let last = 0;
    try { last = Number(sessionStorage.getItem(RELOAD_AT) || 0); } catch { /* ไม่มี sessionStorage */ }
    if (Date.now() - last < 60_000) return;
    try {
      sessionStorage.setItem(RELOAD_AT, String(Date.now()));
      sessionStorage.setItem(RELOAD_VIEW, view);
    } catch { return; }
    window.location.reload();
  });
}
for (const type of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) {
  window.addEventListener(type, () => { audio.unlock(); afterReturnTap(); }, { capture: true, passive: true });
}
document.addEventListener('visibilitychange', () => { if (document.hidden) { audio.stop(); audio.markStale(); returned = true; } });
window.addEventListener('pagehide', () => audio.markStale());
// กลับมาจากการรีเฟรชเพื่อแก้เสียง: เปิดข้อสอบที่ทำค้างไว้ต่อเลย
try {
  const back = sessionStorage.getItem(RELOAD_VIEW);
  sessionStorage.removeItem(RELOAD_VIEW);
  if (back === 'play' && store.state.session && sessionUsable(store.state.session)) view = 'play';
} catch { /* ไม่มี sessionStorage */ }

// URL เต็ม: url() แบบสัมพัทธ์ในตัวแปร CSS จะอิงโฟลเดอร์ของไฟล์ CSS (บน Pages กลายเป็น assets/assets/...)
document.body.style.setProperty('--lx-scene', `url("${new URL(asset('background-classroom').src, document.baseURI).href}")`);
applySettings();
mount();

// ให้ test อ่านสถานะได้ (ไม่มีเฉลยในนี้ — เฉลยอยู่ในไฟล์เนื้อหาที่เว็บ static ดาวน์โหลดอยู่แล้ว)
window.__lx = { get view() { return view; }, get phase() { return store.state.session?.phase ?? null; }, get speaking() { return audio.playing?.text ?? null; } };
