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
import { mountHome, mountBuddy, mountAlbum, sessionUsable } from './screens/home.js';
import { mountParent } from './screens/parent.js';

const root = document.querySelector('#app');
const store = createStore(window.localStorage);
const audio = createAudio({ base: import.meta.env.BASE_URL });

const VIEWS = { home: mountHome, buddy: mountBuddy, album: mountAlbum, parent: mountParent };
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
window.addEventListener('pointerdown', () => audio.unlock(), { capture: true });
window.addEventListener('keydown', () => audio.unlock(), { capture: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) audio.stop(); });

document.body.style.setProperty('--lx-scene', `url("${asset('background-classroom').src}")`);
applySettings();
mount();

// ให้ test อ่านสถานะได้ (ไม่มีเฉลยในนี้ — เฉลยอยู่ในไฟล์เนื้อหาที่เว็บ static ดาวน์โหลดอยู่แล้ว)
window.__lx = { get view() { return view; }, get phase() { return store.state.session?.phase ?? null; }, get speaking() { return audio.playing?.text ?? null; } };
