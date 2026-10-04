/* หน้าแรก เลือกชุดข้อสอบ เลือกเพื่อน และสมุดสติกเกอร์ */
import { SETS, getSet, VIRTUAL_SETS } from '../content/sets/index.js';
import { MOCK_SIZE, mainCount, pickMock, practiceIds } from '../content/library.js';
import { SAY } from '../content/copy.js';
import { FRIENDS, STICKERS } from '../core/assets.js';
import { createSession } from '../core/session.js';
import { friendIds } from '../core/friends.js';
import { friendCard } from './rest.js';
import { $, buddyId, esc, on, picture, confirmBox } from '../ui.js';

const PROBLEMS = {
  unreadable: 'ข้อมูลที่บันทึกไว้อ่านไม่ได้ จึงเริ่มใหม่ (เก็บสำเนาเดิมไว้ในเครื่องแล้ว)',
  session: 'ชุดที่ทำค้างไว้อ่านไม่ได้ จึงเริ่มใหม่ (เก็บสำเนาเดิมไว้ในเครื่องแล้ว)',
  storage: 'เครื่องนี้บันทึกข้อมูลไม่ได้ ทำต่อภายหลังอาจไม่ได้',
};

export function sessionUsable(session) {
  const set = session && getSet(session.setId);
  // ชุดพิเศษไม่มีรุ่นของตัวเอง ใช้ได้ถ้าข้อทุกข้อยังมีในคลัง
  return !!set && (set.virtual || set.version === session.setVersion) && session.questionIds.every((id) => set.items.some((item) => item.id === id));
}

export function mountHome(root, ctx) {
  const { store, audio, signal } = ctx;
  const state = store.state;
  const s = state.session;
  const active = s && s.phase !== 'done';
  const usable = active && sessionUsable(s);
  const answered = active ? s.questionIds.filter((id) => s.drafts[id] != null).length : 0;
  root.innerHTML = `
    <div class="lx-screen lx-home">
      <main class="lx-paper lx-paper-narrow lx-center">
        <p class="lx-kicker">ฝึกทำข้อสอบเข้า ป.1</p>
        <h1 class="lx-title">Lily Exam Adventure</h1>
        <div class="lx-home-buddy">${picture(`friend-${buddyId(state)}`, 'lx-home-friend')}</div>
        ${store.loadProblem && PROBLEMS[store.loadProblem] ? `<p class="lx-warn">${esc(PROBLEMS[store.loadProblem])}</p>` : ''}
        ${active && !usable ? '<p class="lx-warn">ชุดที่ทำค้างไว้เป็นเนื้อหารุ่นเก่า เริ่มชุดใหม่ได้เลย (ผลเดิมเก็บไว้ในหน้าผู้ปกครอง)</p>' : ''}
        <div class="lx-home-actions">
          ${usable ? `<button class="lx-btn lx-btn-go lx-btn-big" id="lx-resume" type="button">ทำต่อ ${esc(getSet(s.setId).title)} ▶<small>ตอบแล้ว ${answered} จาก ${s.questionIds.length} ข้อ</small></button>` : ''}
          <button class="lx-btn ${usable ? 'lx-btn-soft' : 'lx-btn-go'} lx-btn-big" id="lx-sets" type="button">เลือกชุดข้อสอบ ▶<small>มี ${SETS.length} ชุด</small></button>
        </div>
        <div class="lx-row lx-home-links">
          <button class="lx-btn lx-btn-soft" id="lx-album" type="button">⭐ ${state.rewards.stars} · สติกเกอร์ของหนู</button>
          <button class="lx-btn lx-btn-ghost" id="lx-parent" type="button">สำหรับผู้ปกครอง</button>
        </div>
      </main>
    </div>`;

  on($(root, '#lx-resume') || document.createElement('i'), 'click', () => ctx.go('play'), signal);
  on($(root, '#lx-sets'), 'click', () => ctx.go('sets'), signal);
  on($(root, '#lx-album'), 'click', () => ctx.go('album'), signal);
  on($(root, '#lx-parent'), 'click', () => ctx.go('parent'), signal);
  audio.play({ text: SAY.welcome, role: 'ui' }, { signal });
}

/** สถานะของแต่ละชุดสำหรับการ์ด: กำลังทำ / ทำครบแล้ว / ยังไม่เคยทำ และชุดที่แนะนำให้ทำต่อไป */
export function setCards(state, sets = SETS) {
  const s = state.session;
  const activeId = s && s.phase !== 'done' && sessionUsable(s) ? s.setId : null;
  const nextId = sets.find((set) => !state.progress?.[set.id] && set.id !== activeId)?.id || null;
  return sets.map((set, index) => {
    const progress = state.progress?.[set.id] || null;
    const active = set.id === activeId;
    return {
      set,
      number: index + 1,
      active,
      answered: active ? s.questionIds.filter((id) => s.drafts[id] != null).length : 0,
      progress,
      next: set.id === nextId,
    };
  });
}

/** การ์ดชุดพิเศษ: ชุดจำลองสอบจริง และทบทวนข้อที่เคยผิด */
export function specialCards(state) {
  const s = state.session;
  const activeId = s && s.phase !== 'done' && sessionUsable(s) ? s.setId : null;
  const answered = (id) => (activeId === id ? s.questionIds.filter((q) => s.drafts[q] != null).length : 0);
  const mistakes = practiceIds(state, Infinity).length;
  const cards = [];
  const mockReady = mainCount() >= MOCK_SIZE;
  const mockProgress = state.progress?.mock;
  cards.push({
    id: 'mock', ...VIRTUAL_SETS.mock, active: activeId === 'mock', progress: mockProgress, disabled: !mockReady,
    status: activeId === 'mock' ? `กำลังทำ · ตอบแล้ว ${answered('mock')}/${s.questionIds.length}`
      : !mockReady ? 'ต้องมีโจทย์ในคลังอย่างน้อย 30 ข้อ'
        : mockProgress ? `⭐ ทำแล้ว ${mockProgress.completed} ครั้ง${mockProgress.last ? ` · ครั้งล่าสุดถูก ${mockProgress.last.correct}/${mockProgress.last.total}` : ''}` : 'ยังไม่เคยทำ',
  });
  cards.push({
    id: 'practice', ...VIRTUAL_SETS.practice, active: activeId === 'practice', progress: null, disabled: !mistakes && activeId !== 'practice',
    status: activeId === 'practice' ? `กำลังทำ · ตอบแล้ว ${answered('practice')}/${s.questionIds.length}`
      : mistakes ? `มีข้อที่ควรทบทวน ${mistakes} ข้อ` : 'ยังไม่มีข้อที่ต้องทบทวน',
  });
  return cards;
}

export function mountSets(root, ctx) {
  const { store, signal } = ctx;
  const state = store.state;
  const cards = setCards(state);
  const activeCard = cards.find((c) => c.active);
  root.innerHTML = `
    <div class="lx-screen lx-sets">
      <header class="lx-bar">
        <button class="lx-btn lx-btn-small lx-btn-ghost" id="lx-back" type="button">◀ หน้าแรก</button>
        <div class="lx-bar-title">เลือกชุดข้อสอบ</div>
      </header>
      <main class="lx-paper">
        <div class="lx-set-grid lx-set-special">${specialCards(state).map((c) => `
          <button class="lx-set-card lx-set-extra${c.active ? ' lx-set-active' : ''}" data-set="${esc(c.id)}" type="button"${c.disabled ? ' disabled' : ''}>
            <b class="lx-set-title">${esc(c.title)}</b>
            <span class="lx-set-note">${esc(c.note)}</span>
            <span class="lx-set-status${c.active ? ' lx-set-doing' : c.progress ? ' lx-set-done' : ''}">${esc(c.status)}</span>
            <span class="lx-set-go">${c.disabled ? '' : c.active ? 'ทำต่อ ▶' : 'เริ่ม ▶'}</span>
          </button>`).join('')}</div>
        <h2 class="lx-h2">ชุดข้อสอบ</h2>
        <div class="lx-set-grid">${cards.map((c) => {
          const status = c.active
            ? `<span class="lx-set-status lx-set-doing">กำลังทำ · ตอบแล้ว ${c.answered}/${c.set.order.length}</span>`
            : c.progress
              ? `<span class="lx-set-status lx-set-done">⭐ ทำครบแล้ว ${c.progress.completed} ครั้ง</span>${c.progress.last ? `<span class="lx-set-score">ครั้งล่าสุดตอบถูก ${c.progress.last.correct}/${c.progress.last.total}</span>` : ''}`
              : '<span class="lx-set-status">ยังไม่เคยทำ</span>';
          return `<button class="lx-set-card${c.active ? ' lx-set-active' : ''}${c.progress ? ' lx-set-finished' : ''}${c.next ? ' lx-set-next' : ''}" data-set="${esc(c.set.id)}" type="button">
            ${c.next ? '<span class="lx-set-badge">ชุดต่อไป</span>' : ''}
            <b class="lx-set-title">${esc(c.set.title)}</b>
            <span class="lx-set-count">${c.set.order.length} ข้อ</span>
            ${c.set.note ? `<span class="lx-set-note">${esc(c.set.note)}</span>` : ''}
            ${status}
            <span class="lx-set-go">${c.active ? 'ทำต่อ ▶' : c.progress ? 'ทำอีกครั้ง ▶' : 'เริ่ม ▶'}</span>
          </button>`;
        }).join('')}</div>
      </main>
    </div>`;
  on($(root, '#lx-back'), 'click', () => ctx.go('home'), signal);
  on(root, 'click', async (event) => {
    const card = event.target.closest('[data-set]');
    if (!card) return;
    const setId = card.dataset.set;
    const s = store.state.session;
    const activeId = s && s.phase !== 'done' && sessionUsable(s) ? s.setId : null;
    if (activeId === setId) { ctx.go('play'); return; }
    if (activeId) {
      const ok = await confirmBox(root, { text: `เริ่ม${getSet(setId).title}ใช่ไหม ${getSet(activeId).title}ที่ทำค้างไว้จะเก็บผลไว้ในหน้าผู้ปกครอง`, yes: 'เริ่มชุดนี้', no: 'ไม่ใช่' }, signal);
      if (!ok) return;
    }
    // ชุดพิเศษ: เลือกข้อตอนกดเริ่ม แล้วส่งต่อไปหน้าเลือกเพื่อน
    const ids = setId === 'mock' ? pickMock() : setId === 'practice' ? practiceIds(store.state) : null;
    ctx.go('buddy', { setId, ids });
  }, signal);
}

export function mountBuddy(root, ctx) {
  const { store, audio, signal, params } = ctx;
  const set = getSet(params?.setId) || SETS[0];
  let chosen = buddyId(store.state);
  const render = () => {
    root.innerHTML = `
      <div class="lx-screen lx-buddy-pick">
        <main class="lx-paper lx-paper-narrow lx-center">
          <h1 class="lx-h1">เลือกเพื่อนมาเป็นกำลังใจ</h1>
          <p class="lx-lead">เพื่อนจะนั่งเงียบๆ อยู่ข้างๆ ระหว่างทำข้อสอบ</p>
          <div class="lx-friends">${Object.entries(FRIENDS).map(([id, name]) => `
            <button class="lx-friend${id === chosen ? ' lx-picked' : ''}" data-friend="${id}" type="button" aria-pressed="${id === chosen}">
              ${picture(`friend-${id}`)}<span>${esc(name)}</span></button>`).join('')}</div>
          <p class="lx-small">${esc(SAY.examRules)}</p>
          <div class="lx-row">
            <button class="lx-btn lx-btn-ghost" id="lx-back" type="button">◀ กลับ</button>
            <button class="lx-btn lx-btn-go lx-btn-big" id="lx-go" type="button">เริ่มทำ${esc(set.title)} ▶</button>
          </div>
        </main>
      </div>`;
  };
  render();
  audio.play({ text: SAY.pickBuddy, role: 'ui' }, { signal });
  on(root, 'click', (event) => {
    const friend = event.target.closest('[data-friend]');
    if (friend) {
      chosen = friend.dataset.friend;
      audio.tap();
      store.dispatch({ type: 'settings', patch: { buddy: chosen } });
      render();
      return;
    }
    if (event.target.closest('#lx-back')) { ctx.go('sets'); return; }
    if (event.target.closest('#lx-go')) {
      store.dispatch({ type: 'settings', patch: { buddy: chosen } });
      store.dispatch({ type: 'start', session: createSession(set, params?.ids ? { ids: params.ids } : {}) });
      ctx.go('play');
    }
  }, signal);
}

export function mountAlbum(root, ctx) {
  const { store, signal } = ctx;
  const owned = new Set(store.state.rewards.stickers);
  const friends = store.state.rewards.friends || {};
  root.innerHTML = `
    <div class="lx-screen lx-album">
      <main class="lx-paper lx-paper-narrow lx-center">
        <h1 class="lx-h1">สติกเกอร์ของหนู</h1>
        <p class="lx-lead">⭐ ดาวทั้งหมด ${store.state.rewards.stars} ดวง · ทำครบหนึ่งชุด เลือกเพื่อนได้ 1 ตัว</p>
        <p class="lx-small">เลือกเพื่อนตัวเดิมซ้ำ เพื่อนจะโตขึ้น เล็ก กลาง ใหญ่ ใหญ่มาก พอโตสุดแล้วจะมีไข่และมีลูก</p>
        <div class="lx-friend-pick">${friendIds().map((id) => friendCard(id, friends[id])).join('')}</div>
        ${owned.size ? `<h2 class="lx-h2">สติกเกอร์ที่เคยได้</h2>
        <div class="lx-sticker-pick">${Object.entries(STICKERS).filter(([id]) => owned.has(`sticker-${id}`)).map(([id, name]) => `
          <div class="lx-sticker">${picture(`sticker-${id}`)}<span>${esc(name)}</span></div>`).join('')}</div>` : ''}
        <button class="lx-btn lx-btn-go" id="lx-back" type="button">กลับหน้าแรก 🏠</button>
      </main>
    </div>`;
  on($(root, '#lx-back'), 'click', () => ctx.go('home'), signal);
}
