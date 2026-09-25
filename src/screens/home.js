/* หน้าแรก เลือกเพื่อน และสมุดสติกเกอร์ */
import { SETS, getSet } from '../content/sets/index.js';
import { SAY } from '../content/copy.js';
import { FRIENDS, STICKERS } from '../core/assets.js';
import { createSession } from '../core/session.js';
import { $, buddyId, esc, on, picture, confirmBox } from '../ui.js';

const PROBLEMS = {
  unreadable: 'ข้อมูลที่บันทึกไว้อ่านไม่ได้ จึงเริ่มใหม่ (เก็บสำเนาเดิมไว้ในเครื่องแล้ว)',
  session: 'ชุดที่ทำค้างไว้อ่านไม่ได้ จึงเริ่มใหม่ (เก็บสำเนาเดิมไว้ในเครื่องแล้ว)',
  storage: 'เครื่องนี้บันทึกข้อมูลไม่ได้ ทำต่อภายหลังอาจไม่ได้',
};

export function sessionUsable(session) {
  const set = session && getSet(session.setId);
  return !!set && set.version === session.setVersion && session.questionIds.every((id) => set.items.some((item) => item.id === id));
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
          ${SETS.map((set) => `<button class="lx-btn ${usable ? 'lx-btn-soft' : 'lx-btn-go'} lx-btn-big" data-start="${esc(set.id)}" type="button">เริ่ม${esc(set.title)} <small>${set.order.length} ข้อ</small></button>`).join('')}
        </div>
        <div class="lx-row lx-home-links">
          <button class="lx-btn lx-btn-soft" id="lx-album" type="button">⭐ ${state.rewards.stars} · สติกเกอร์ของหนู</button>
          <button class="lx-btn lx-btn-ghost" id="lx-parent" type="button">สำหรับผู้ปกครอง</button>
        </div>
      </main>
    </div>`;

  on($(root, '#lx-resume') || document.createElement('i'), 'click', () => ctx.go('play'), signal);
  on(root, 'click', async (event) => {
    const start = event.target.closest('[data-start]');
    if (!start) return;
    if (active && usable) {
      const ok = await confirmBox(root, { text: 'เริ่มชุดใหม่ใช่ไหม ชุดที่ทำค้างไว้จะเก็บผลไว้ในหน้าผู้ปกครอง', yes: 'เริ่มใหม่', no: 'ไม่ใช่' }, signal);
      if (!ok) return;
    }
    ctx.go('buddy', { setId: start.dataset.start });
  }, signal);
  on($(root, '#lx-album'), 'click', () => ctx.go('album'), signal);
  on($(root, '#lx-parent'), 'click', () => ctx.go('parent'), signal);
  audio.play({ text: SAY.welcome, role: 'ui' }, { signal });
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
    if (event.target.closest('#lx-back')) { ctx.go('home'); return; }
    if (event.target.closest('#lx-go')) {
      store.dispatch({ type: 'settings', patch: { buddy: chosen } });
      store.dispatch({ type: 'start', session: createSession(set) });
      ctx.go('play');
    }
  }, signal);
}

export function mountAlbum(root, ctx) {
  const { store, signal } = ctx;
  const owned = new Set(store.state.rewards.stickers);
  root.innerHTML = `
    <div class="lx-screen lx-album">
      <main class="lx-paper lx-paper-narrow lx-center">
        <h1 class="lx-h1">สติกเกอร์ของหนู</h1>
        <p class="lx-lead">⭐ ดาวทั้งหมด ${store.state.rewards.stars} ดวง · ทำครบหนึ่งชุด ได้สติกเกอร์ 1 ชิ้น</p>
        <div class="lx-sticker-pick">${Object.entries(STICKERS).map(([id, name]) => `
          <div class="lx-sticker${owned.has(`sticker-${id}`) ? '' : ' lx-locked'}">${picture(`sticker-${id}`)}<span>${esc(name)}</span></div>`).join('')}</div>
        <button class="lx-btn lx-btn-go" id="lx-back" type="button">กลับหน้าแรก 🏠</button>
      </main>
    </div>`;
  on($(root, '#lx-back'), 'click', () => ctx.go('home'), signal);
}
