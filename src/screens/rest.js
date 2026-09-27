/* พักระหว่างช่วง (ข้ามได้) และรับรางวัลเมื่อจบชุด (ให้จากการทำครบ ไม่ขึ้นกับคะแนน) */
import { SAY } from '../content/copy.js';
import { summarize } from '../core/summary.js';
import { FRIEND_SCALE, friendIds, friendLevel, friendName, isBiggest, sizeName } from '../core/friends.js';
import { $, buddyHTML, esc, on, picture } from '../ui.js';

/** รูปเพื่อนในกรอบขนาดคงที่ ภาพใหญ่ขึ้นตามขั้น + ป้ายขนาดตัวเล็กๆ */
export function friendCard(id, count, { tag = 'div', extra = '' } = {}) {
  const level = friendLevel(count);
  return `<${tag} class="lx-fcard${level ? '' : ' lx-fcard-none'}" ${extra}>
    <span class="lx-fcard-box">${picture(`friend-${id}`, 'lx-fcard-img').replace('<img ', `<img style="width:${FRIEND_SCALE[level] * 100}%" `)}</span>
    <span class="lx-fcard-name">${esc(friendName(id))}</span>
    <small class="lx-fcard-size">${level ? `ขนาด${sizeName(level)}` : 'ยังไม่มี'}</small>
  </${tag}>`;
}

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
        <button class="lx-btn lx-btn-soft" id="lx-see-review" type="button">📖 ดูเฉลยอีกครั้ง</button>
      </main>
    </div>`;
  audio.play({ text: SAY.breakTime, role: 'encouragement' }, { signal });
  on($(root, '#lx-continue'), 'click', () => store.dispatch({ type: 'endBreak' }), signal);
  on($(root, '#lx-see-review'), 'click', () => store.dispatch({ type: 'openReview' }), signal);
}

export function mountReward(root, ctx) {
  const { store, audio, signal } = ctx;
  const render = () => {
    const state = store.state;
    const s = state.session;
    const claimed = state.rewards.claimed[s.id];
    const friends = state.rewards.friends || {};
    let body;
    if (claimed?.friend) {
      const count = friends[claimed.friend] || 0;
      const level = friendLevel(count);
      const headline = count === 1 ? `ได้${friendName(claimed.friend)}ตัวใหม่แล้ว` : `${friendName(claimed.friend)}โตขึ้นเป็นขนาด${sizeName(level)}แล้ว`;
      body = `<p class="lx-lead">${esc(headline)}</p>
        <div class="lx-reward-friend">${friendCard(claimed.friend, count)}</div>
        <button class="lx-btn lx-btn-go lx-btn-big" id="lx-home" type="button">กลับหน้าแรก 🏠</button>`;
    } else if (claimed) {
      body = `<p class="lx-lead">รับรางวัลแล้ว</p>
        <button class="lx-btn lx-btn-go lx-btn-big" id="lx-home" type="button">กลับหน้าแรก 🏠</button>`;
    } else {
      body = `<p class="lx-lead">ได้ดาว 1 ดวง เลือกสติกเกอร์เพื่อนได้ 1 ตัว</p>
        <p class="lx-small">ถ้าเลือกตัวเดิม เพื่อนจะโตขึ้น เล็ก กลาง ใหญ่ ใหญ่มาก</p>
        <div class="lx-friend-pick">${friendIds().map((id) => friendCard(id, friends[id], { tag: 'button', extra: `type="button" data-friend="${esc(id)}" aria-label="${esc(friendName(id))}"` })).join('')}</div>`;
    }
    root.innerHTML = `
      <div class="lx-screen lx-reward">
        <main class="lx-paper lx-paper-narrow lx-center">
          <div class="lx-big-star" aria-hidden="true">⭐</div>
          <h1 class="lx-h1">ทำครบทุกข้อแล้ว เก่งมาก</h1>
          ${body}
          <button class="lx-btn lx-btn-soft" id="lx-see-review" type="button">📖 ดูเฉลยทั้งหมด</button>
        </main>
      </div>`;
  };
  render();
  const already = !!store.state.rewards.claimed[store.state.session.id];
  audio.play({ text: already ? SAY.thanks : SAY.reward, role: 'encouragement' }, { signal });
  on(root, 'click', (event) => {
    const pick = event.target.closest('[data-friend]');
    if (pick) {
      audio.tap(880);
      const id = pick.dataset.friend;
      const before = store.state.rewards.friends?.[id] || 0;
      const t = summarize(store.state.session, ctx.set).totals;
      store.dispatch({ type: 'claim', friend: id, result: { correct: t.correct, total: t.questions }, now: Date.now() });
      audio.play({ text: before === 0 ? SAY.newFriend : isBiggest(before) ? SAY.friendBiggest : SAY.friendGrew, role: 'encouragement' }, { signal });
      return;
    }
    if (event.target.closest('#lx-home')) ctx.go('home');
    if (event.target.closest('#lx-see-review')) store.dispatch({ type: 'openReview' });
  }, signal);
  // phase เปลี่ยนเป็น done หลังรับรางวัล → วาดใหม่ในหน้านี้ (ไม่ต้องเปลี่ยนหน้า)
  ctx.onPhase = () => render();
}
