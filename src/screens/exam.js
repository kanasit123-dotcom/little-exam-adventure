/*
 * หน้าทำข้อสอบ — ห้ามมีคำใบ้ เฉลย สัญญาณถูกผิด หรือเวลา
 * ได้รับเฉพาะข้อมูลจาก toExamQuestion() (ไม่มีรหัสคำตอบที่ถูก)
 * เลือกคำตอบไม่เลื่อนข้อเอง; ปุ่ม "ข้อต่อไป" กดได้เมื่อเสียงอ่านโจทย์จบ (หรือเด็กกดฟัง/เลือกเอง)
 */
import { getItem, sectionOf } from '../content/sets/index.js';
import { SAY, blockStart } from '../content/copy.js';
import { toExamQuestion } from '../core/exam-question.js';
import { UNSURE, blockComplete, currentBlockIds } from '../core/state.js';
import { renderVisual } from '../visuals/visuals.js';
import { $, $$, buddyHTML, esc, on, picture, markSpeaking } from '../ui.js';

// จำว่าได้ยินอะไรไปแล้วในการเปิดแอปครั้งนี้ (หัวข้อตอน/เรื่อง) จะได้ไม่อ่านซ้ำทุกข้อ
const heard = new Set();

export function mountExam(root, ctx) {
  const { store, audio, set, signal } = ctx;
  const session = () => store.state.session;
  let qCtrl = null;
  let nextReady = false;
  let shownQid = null;

  root.innerHTML = `
    <div class="lx-screen lx-exam">
      <header class="lx-bar">
        <button class="lx-btn lx-btn-small lx-btn-ghost" id="lx-pause" type="button">⏸ พัก</button>
        <div class="lx-bar-title" id="lx-block-title"></div>
        ${buddyHTML(store.state)}
        <div class="lx-dots" id="lx-dots"></div>
      </header>
      <main class="lx-paper" id="lx-paper"></main>
      <footer class="lx-nav">
        <button class="lx-btn lx-btn-ghost" id="lx-prev" type="button">◀ ข้อก่อน</button>
        <p class="lx-nav-note" id="lx-note" aria-live="polite"></p>
        <button class="lx-btn lx-btn-go" id="lx-next" type="button">ข้อต่อไป ▶</button>
      </footer>
    </div>`;

  const paper = $(root, '#lx-paper');
  const unsubscribeSpeaking = audio.onChange((request) => markSpeaking(root, request));
  signal.addEventListener('abort', () => { unsubscribeSpeaking(); qCtrl?.abort(); }, { once: true });

  function question() {
    const s = session();
    const qid = currentBlockIds(s)[s.cursor];
    return toExamQuestion(set, getItem(set, qid), s.optionOrder[qid]);
  }

  function renderBar() {
    const s = session();
    const ids = currentBlockIds(s);
    $(root, '#lx-block-title').textContent = `ช่วงที่ ${s.block + 1} จาก ${s.blocks.length}`;
    $(root, '#lx-dots').innerHTML = ids.map((id, i) => {
      const n = s.questionIds.indexOf(id) + 1;
      const done = s.drafts[id] != null;
      return `<button class="lx-dot${i === s.cursor ? ' lx-here' : ''}${done ? ' lx-done' : ''}" data-go="${i}" type="button" aria-label="ข้อ ${n}${done ? ' ตอบแล้ว' : ''}">${n}</button>`;
    }).join('');
    $(root, '#lx-prev').hidden = s.cursor === 0;
    const last = s.cursor === ids.length - 1;
    const next = $(root, '#lx-next');
    next.textContent = last ? 'ส่งคำตอบช่วงนี้ ✓' : 'ข้อต่อไป ▶';
    next.classList.toggle('lx-btn-send', last);
    next.classList.toggle('lx-wait', !nextReady);
    next.setAttribute('aria-disabled', String(!nextReady));
  }

  function renderSelection() {
    const s = session();
    const q = question();
    const chosen = s.drafts[q.id];
    $$(paper, '.lx-pick').forEach((button) => {
      const picked = q.options[Number(button.dataset.i)].key === chosen;
      button.setAttribute('aria-pressed', String(picked));
      button.classList.toggle('lx-picked', picked);
    });
    const unsure = $(paper, '#lx-unsure');
    unsure.setAttribute('aria-pressed', String(chosen === UNSURE));
    unsure.classList.toggle('lx-picked', chosen === UNSURE);
    renderBar();
  }

  function renderQuestion() {
    const s = session();
    const q = question();
    shownQid = q.id;
    const number = s.questionIds.indexOf(q.id) + 1;
    const hasImages = q.options.some((option) => option.image);
    paper.innerHTML = `
      <div class="lx-section-banner">${esc(q.section)}</div>
      ${q.stimulus ? `
        <section class="lx-stimulus" aria-label="เรื่อง">
          <p class="lx-stim-text">${esc(q.stimulus.text)}</p>
          ${renderVisual(q.stimulus.visual)}
          <button class="lx-listen" data-say="stimulus" type="button">🔊 ฟังเรื่องอีกครั้ง</button>
        </section>` : ''}
      <div class="lx-question">
        <span class="lx-qnum">${number}.</span>
        <p class="lx-qtext">${esc(q.promptText).replace(/\n/g, '<br>')}</p>
      </div>
      <button class="lx-listen lx-listen-main" data-say="prompt" type="button">🔊 ฟังโจทย์อีกครั้ง</button>
      ${renderVisual(q.visual)}
      <div class="lx-options${hasImages ? ' lx-options-pics' : ''}" role="group" aria-label="ตัวเลือก">
        ${q.options.map((option, i) => `
          <div class="lx-opt">
            <button class="lx-pick" data-i="${i}" type="button" aria-pressed="false">
              <span class="lx-num">${esc(option.label)}</span>
              ${option.image ? picture(option.image, 'lx-opt-pic') : ''}
              ${option.text ? `<span class="lx-opt-text">${esc(option.text)}</span>` : ''}
            </button>
            <button class="lx-say" data-say="opt-${i}" data-i="${i}" type="button" aria-label="ฟังข้อ ${esc(option.label)}">🔊</button>
          </div>`).join('')}
      </div>
      <button class="lx-unsure" id="lx-unsure" type="button" aria-pressed="false">ยังไม่แน่ใจ</button>`;
    $(root, '#lx-note').textContent = '';
    paper.scrollTop = 0;
    window.scrollTo?.(0, 0);
    renderSelection();
    autoplay(q);
  }

  async function autoplay(q) {
    qCtrl?.abort();
    qCtrl = new AbortController();
    const qSignal = qCtrl.signal;
    nextReady = !store.state.settings.sound;
    renderBar();
    const s = session();
    const seq = [];
    const blockKey = `${s.id}:block:${s.block}`;
    if (!heard.has(blockKey)) { seq.push(blockStart(s.block + 1)); heard.add(blockKey); }
    // อ่านหัวข้อตอนเมื่อขึ้นตอนใหม่ (หรือข้อแรกของช่วง) เหมือนผู้คุมสอบอ่านคำสั่ง
    const index = s.questionIds.indexOf(q.id);
    const prev = index > 0 ? getItem(set, s.questionIds[index - 1]) : null;
    const newSection = s.cursor === 0 || !prev || sectionOf(set, prev) !== q.section || (q.stimulus && prev.stimulus !== q.stimulus.id);
    const sectionKey = `${s.id}:section:${q.id}`;
    if (newSection && !heard.has(sectionKey)) { seq.push(q.section); heard.add(sectionKey); }
    if (q.stimulus && !heard.has(`${s.id}:stim:${q.stimulus.id}`)) { seq.push(q.stimulus.speech); heard.add(`${s.id}:stim:${q.stimulus.id}`); }
    seq.push(q.promptSpeech);
    for (const text of seq) {
      const result = await audio.play({ text, role: 'prompt', qid: q.id, key: text === q.promptSpeech ? 'prompt' : text === q.stimulus?.speech ? 'stimulus' : 'intro' }, { signal: qSignal });
      if (result.status === 'cancelled' || result.status === 'error') {
        if (result.status === 'error' && !qSignal.aborted) $(root, '#lx-note').textContent = 'เปิดเสียงไม่ได้ แตะ 🔊 เพื่อลองอีกครั้ง';
        break;
      }
    }
    if (qSignal.aborted && shownQid !== q.id) return;
    nextReady = true;
    renderBar();
  }

  function listen(key) {
    const q = question();
    nextReady = true;
    renderBar();
    if (key === 'prompt' || key === 'stimulus') {
      store.dispatch({ type: 'replay', role: 'prompt', qid: q.id });
      audio.play({ text: key === 'prompt' ? q.promptSpeech : q.stimulus.speech, role: 'prompt', qid: q.id, key }, { signal: qCtrl?.signal });
      return;
    }
    const i = Number(key.slice(4));
    store.dispatch({ type: 'replay', role: 'option', qid: q.id });
    audio.play({ text: q.options[i].speech, role: 'option', qid: q.id, key }, { signal: qCtrl?.signal });
  }

  function go(cursor) {
    if (store.dispatch({ type: 'goto', cursor })) renderQuestion();
  }

  on(paper, 'click', (event) => {
    const say = event.target.closest('[data-say]');
    if (say) { listen(say.dataset.say); return; }
    const pick = event.target.closest('.lx-pick');
    const q = question();
    if (pick) {
      audio.tap();
      store.dispatch({ type: 'select', qid: q.id, answer: q.options[Number(pick.dataset.i)].key });
      renderSelection();
      return;
    }
    if (event.target.closest('#lx-unsure')) {
      audio.tap(520);
      store.dispatch({ type: 'select', qid: q.id, answer: UNSURE });
      renderSelection();
    }
  }, signal);

  on($(root, '#lx-dots'), 'click', (event) => {
    const dot = event.target.closest('[data-go]');
    if (dot) go(Number(dot.dataset.go));
  }, signal);
  on($(root, '#lx-prev'), 'click', () => go(session().cursor - 1), signal);
  on($(root, '#lx-next'), 'click', () => {
    if (!nextReady) { $(root, '#lx-note').textContent = 'ฟังโจทย์ให้จบก่อนนะ'; return; }
    const s = session();
    const ids = currentBlockIds(s);
    if (s.cursor < ids.length - 1) { go(s.cursor + 1); return; }
    if (!blockComplete(s)) {
      const missing = ids.filter((id) => s.drafts[id] == null).map((id) => s.questionIds.indexOf(id) + 1);
      $(root, '#lx-note').textContent = `ยังไม่ได้ตอบข้อ ${missing.join(', ')} (เลือก "ยังไม่แน่ใจ" ได้)`;
      return;
    }
    store.dispatch({ type: 'confirm' });
  }, signal);
  on($(root, '#lx-pause'), 'click', () => ctx.go('home'), signal);

  // เข้าหน้านี้ครั้งแรก: นับว่าได้เปิดข้อนี้แล้ว
  store.dispatch({ type: 'goto', cursor: session().cursor });
  renderQuestion();
}

/** หน้ายืนยันก่อนส่งคำตอบทั้งช่วง */
export function mountConfirm(root, ctx) {
  const { store, audio, signal } = ctx;
  const s = store.state.session;
  const ids = currentBlockIds(s);
  root.innerHTML = `
    <div class="lx-screen lx-confirm">
      <main class="lx-paper lx-paper-narrow">
        ${buddyHTML(store.state)}
        <h1 class="lx-h1">ส่งคำตอบช่วงที่ ${s.block + 1}</h1>
        <p class="lx-lead">${esc(SAY.confirm)}</p>
        <ul class="lx-check-list">
          ${ids.map((id, i) => {
            const answer = s.drafts[id];
            const index = s.optionOrder[id].indexOf(answer);
            const text = answer === UNSURE ? 'ยังไม่แน่ใจ' : `ตอบข้อ ${index + 1}`;
            return `<li><button class="lx-check" data-i="${i}" type="button"><b>ข้อ ${s.questionIds.indexOf(id) + 1}</b><span>${text}</span><em>แก้</em></button></li>`;
          }).join('')}
        </ul>
        <p class="lx-small">ส่งแล้วจะแก้คำตอบไม่ได้ แล้วเราจะไปดูเฉลยกัน</p>
        <div class="lx-row">
          <button class="lx-btn lx-btn-ghost" id="lx-back" type="button">กลับไปดูอีกครั้ง</button>
          <button class="lx-btn lx-btn-send" id="lx-send" type="button">ส่งคำตอบ ✓</button>
        </div>
      </main>
    </div>`;
  audio.play({ text: SAY.confirm, role: 'ui' }, { signal });
  const back = (cursor) => store.dispatch({ type: 'cancelConfirm', cursor });
  on($(root, '#lx-back'), 'click', () => back(null), signal);
  on(root, 'click', (event) => {
    const item = event.target.closest('.lx-check');
    if (item) back(Number(item.dataset.i));
  }, signal);
  on($(root, '#lx-send'), 'click', () => store.dispatch({ type: 'submit', now: Date.now() }), signal);
}
