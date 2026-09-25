/* พักระหว่างช่วง (ข้ามได้) และรับรางวัลเมื่อจบชุด (ให้จากการทำครบ ไม่ขึ้นกับคะแนน) */
import { SAY } from '../content/copy.js';
import { STICKERS } from '../core/assets.js';
import { $, buddyHTML, esc, on, picture } from '../ui.js';

export function mountBreak(root, ctx) {
  const { store, audio, signal } = ctx;
  const s = store.state.session;
  root.innerHTML = `
    <div class="lx-screen lx-break">
      <main class="lx-paper lx-paper-narrow lx-center">
        <h1 class="lx-h1">พักสักครู่นะ</h1>
        <p class="lx-lead">ส่งช่วงที่ ${s.block + 1} แล้ว เหลืออีก ${s.blocks.length - s.block - 1} ช่วง</p>
        <div class="lx-stretch">${buddyHTML(store.state, 'stretch')}</div>
        <ol class="lx-break-list">
          <li>ยืดแขนขึ้นสูงๆ 🙆</li>
          <li>หายใจเข้าลึกๆ แล้วหายใจออก 🌬️</li>
          <li>ดื่มน้ำสักอึก 💧</li>
        </ol>
        <button class="lx-btn lx-btn-go lx-btn-big" id="lx-continue" type="button">พักเสร็จแล้ว ไปต่อ ▶</button>
      </main>
    </div>`;
  audio.play({ text: SAY.breakTime, role: 'encouragement' }, { signal });
  on($(root, '#lx-continue'), 'click', () => store.dispatch({ type: 'endBreak' }), signal);
}

export function mountReward(root, ctx) {
  const { store, audio, signal } = ctx;
  const render = () => {
    const state = store.state;
    const s = state.session;
    const claimed = state.rewards.claimed[s.id];
    const owned = new Set(state.rewards.stickers);
    root.innerHTML = `
      <div class="lx-screen lx-reward">
        <main class="lx-paper lx-paper-narrow lx-center">
          <div class="lx-big-star" aria-hidden="true">⭐</div>
          <div class="lx-stretch">${buddyHTML(state, 'cheer')}</div>
          <h1 class="lx-h1">ทำครบทุกข้อแล้ว เก่งมาก</h1>
          ${claimed
            ? `<p class="lx-lead">ได้สติกเกอร์${claimed.sticker ? ` ${esc(STICKERS[claimed.sticker.replace('sticker-', '')] || '')}` : ''} แล้ว</p>
               ${claimed.sticker ? picture(claimed.sticker, 'lx-reward-sticker') : ''}
               <button class="lx-btn lx-btn-go lx-btn-big" id="lx-home" type="button">กลับหน้าแรก 🏠</button>`
            : `<p class="lx-lead">ได้ดาว 1 ดวง เลือกสติกเกอร์ได้ 1 ชิ้น</p>
               <div class="lx-sticker-pick">${Object.keys(STICKERS).map((id) => `
                 <button class="lx-sticker${owned.has(`sticker-${id}`) ? ' lx-owned' : ''}" data-sticker="sticker-${id}" type="button" aria-label="${esc(STICKERS[id])}">
                   ${picture(`sticker-${id}`)}${owned.has(`sticker-${id}`) ? '<i>มีแล้ว</i>' : ''}
                 </button>`).join('')}</div>`}
        </main>
      </div>`;
  };
  render();
  const already = !!store.state.rewards.claimed[store.state.session.id];
  audio.play({ text: already ? SAY.thanks : SAY.reward, role: 'encouragement' }, { signal });
  on(root, 'click', (event) => {
    const pick = event.target.closest('[data-sticker]');
    if (pick) {
      audio.tap(880);
      store.dispatch({ type: 'claim', sticker: pick.dataset.sticker, now: Date.now() });
      return;
    }
    if (event.target.closest('#lx-home')) ctx.go('home');
  }, signal);
  // phase เปลี่ยนเป็น done หลังรับรางวัล → วาดใหม่ในหน้านี้ (ไม่ต้องเปลี่ยนหน้า)
  ctx.onPhase = () => render();
}
