/* พักระหว่างช่วง (ข้ามได้) และรับรางวัลเมื่อจบชุด (ให้จากการทำครบ ไม่ขึ้นกับคะแนน) */
import { SAY } from '../content/copy.js';
import { summarize } from '../core/summary.js';
import { FRIEND_SCALE, PARENT_SCALE_WITH_KIDS, cardLabel, familyOf, friendIds, friendName, headline, isFamilyComplete, pickableFriends, sayKey } from '../core/friends.js';
import { hasBabyArt } from '../core/assets.js';
import { $, buddyHTML, esc, on, picture } from '../ui.js';

/** ไข่วาดด้วยโค้ด สีพาสเทลต่างกันตามเพื่อน (ไม่ต้องใช้รูป) */
function eggHTML(id) {
  const hue = (friendIds().indexOf(id) * 47 + 20) % 360;
  return `<svg class="lx-egg" viewBox="0 0 40 50" aria-hidden="true" style="--egg:hsl(${hue} 85% 92%);--egg-dot:hsl(${hue} 65% 68%)"><path d="M20 3C11 3 4 19 4 31c0 10 7 17 16 17s16-7 16-17C36 19 29 3 20 3z"/><circle cx="14" cy="26" r="2.6"/><circle cx="25" cy="21" r="2.2"/><circle cx="22" cy="35" r="3"/><circle cx="12" cy="38" r="1.8"/></svg>`;
}

/** ลูกของเพื่อน: ขั้น 1 = ไข่, 2 = ลูกตัวจิ๋ว, 3 = ลูกโตขึ้น (ยังไม่มีรูปลูกใช้รูปแม่ย่อเล็ก) */
function kidHTML(id, stage) {
  if (stage === 1) return `<span class="lx-kid lx-kid-egg">${eggHTML(id)}</span>`;
  const art = hasBabyArt(id) ? `friend-baby-${id}` : `friend-${id}`;
  return `<span class="lx-kid lx-kid-s${stage}">${picture(art, 'lx-kid-img')}<i class="lx-kid-heart" aria-hidden="true">💗</i></span>`;
}

/** รูปเพื่อนในกรอบขนาดคงที่ ภาพใหญ่ขึ้นตามขั้น (โตสุดแล้วมีไข่และลูกยืนข้างๆ) + ป้ายตัวเล็กๆ */
export function friendCard(id, count, { tag = 'div', extra = '', full = false } = {}) {
  const { level, kids } = familyOf(count);
  const family = kids[0] > 0;
  const width = (family ? PARENT_SCALE_WITH_KIDS : FRIEND_SCALE[level]) * 100;
  const kidsHTML = family ? `<span class="lx-kids">${kids.map((stage) => (stage ? kidHTML(id, stage) : '')).join('')}</span>` : '';
  return `<${tag} class="lx-fcard${level ? '' : ' lx-fcard-none'}${family ? ' lx-fcard-family' : ''}${full ? ' lx-fcard-full' : ''}" ${extra}>
    <span class="lx-fcard-box">${picture(`friend-${id}`, 'lx-fcard-img').replace('<img ', `<img style="width:${width}%" `)}${kidsHTML}</span>
    <span class="lx-fcard-name">${esc(friendName(id))}</span>
    <small class="lx-fcard-size">${esc(cardLabel(count))}</small>
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
      body = `<p class="lx-lead">${esc(headline(claimed.friend, count))}</p>
        <div class="lx-reward-friend">${friendCard(claimed.friend, count)}</div>
        <button class="lx-btn lx-btn-go lx-btn-big" id="lx-home" type="button">กลับหน้าแรก 🏠</button>`;
    } else if (claimed) {
      body = `<p class="lx-lead">รับรางวัลแล้ว</p>
        <button class="lx-btn lx-btn-go lx-btn-big" id="lx-home" type="button">กลับหน้าแรก 🏠</button>`;
    } else {
      const open = new Set(pickableFriends(friends));
      body = `<p class="lx-lead">ได้ดาว 1 ดวง เลือกสติกเกอร์เพื่อนได้ 1 ตัว</p>
        <p class="lx-small">ถ้าเลือกตัวเดิม เพื่อนจะโตขึ้น พอโตสุดแล้วจะมีไข่และมีลูก</p>
        <p class="lx-nav-note lx-full-note" id="lx-full-note" aria-live="polite"></p>
        <div class="lx-friend-pick">${friendIds().map((id) => friendCard(id, friends[id], { tag: 'button', full: !open.has(id), extra: `type="button" data-friend="${esc(id)}" aria-label="${esc(friendName(id))}${open.has(id) ? '' : ' ครอบครัวครบแล้ว'}"${open.has(id) ? '' : ' aria-disabled="true"'}` })).join('')}</div>`;
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
      const id = pick.dataset.friend;
      // ครอบครัวนี้ครบแล้ว (ยังมีตัวอื่นให้เลือก): ไม่รับรางวัล แจ้งให้เลือกตัวอื่น
      if (!pickableFriends(store.state.rewards.friends).includes(id)) {
        audio.tap(300);
        $(root, '#lx-full-note').textContent = `${friendName(id)}มีครอบครัวครบแล้ว เลือกเพื่อนตัวอื่นนะ`;
        audio.play({ text: SAY.familyFull, role: 'encouragement' }, { signal });
        return;
      }
      audio.tap(880);
      const t = summarize(store.state.session, ctx.set).totals;
      store.dispatch({ type: 'claim', friend: id, result: { correct: t.correct, total: t.questions }, now: Date.now() });
      audio.play({ text: SAY[sayKey(store.state.rewards.friends?.[id] || 1)], role: 'encouragement' }, { signal });
      return;
    }
    if (event.target.closest('#lx-home')) ctx.go('home');
    if (event.target.closest('#lx-see-review')) store.dispatch({ type: 'openReview' });
  }, signal);
  // phase เปลี่ยนเป็น done หลังรับรางวัล → วาดใหม่ในหน้านี้ (ไม่ต้องเปลี่ยนหน้า)
  ctx.onPhase = () => render();
}
