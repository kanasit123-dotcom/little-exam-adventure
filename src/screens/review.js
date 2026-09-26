/*
 * หน้าเฉลยของช่วงที่เพิ่งส่ง — เปิดได้เฉพาะข้อที่ส่งแล้ว
 * แสดงคำตอบตอนส่งกับคำตอบที่ถูกแบบสุภาพ, คำใบ้, วิธีคิดทีละขั้น (เดินต่อเมื่อเสียงจบ), ตัวช่วยคิดตั้งเลข และโจทย์ลองใหม่
 * ทุกอย่างเลือกดูได้ ไม่บังคับ — ข้ามไปพัก/รับรางวัลได้เสมอ
 */
import { getItem, OPTION_LABELS, promptSpeech, sectionOf, stimulusOf, stimulusSpeech } from '../content/sets/index.js';
import { SAY, yourAnswer, correctIs } from '../content/copy.js';
import { toExamQuestion } from '../core/exam-question.js';
import { UNSURE, isLastBlock, submittedAnswer } from '../core/state.js';
import { answerStatus } from '../core/summary.js';
import { mountColumn } from '../review/column-renderer.js';
import { renderVisual, renderFold } from '../visuals/visuals.js';
import { $, buddyHTML, esc, on, picture, markSpeaking, sleep } from '../ui.js';

const introduced = new Set();

export function mountReview(root, ctx) {
  const { store, audio, set, signal } = ctx;
  const session = () => store.state.session;
  const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let itemCtrl = null;
  let tool = null;          // { name, destroy? }
  let filter = 'all';

  const ids = () => session().blocks[session().review.block];
  const item = (qid) => getItem(set, qid);
  const statusOf = (qid) => answerStatus(item(qid), submittedAnswer(session(), qid));
  const labelOf = (qid, optionId) => OPTION_LABELS[session().optionOrder[qid].indexOf(optionId)];

  root.innerHTML = `
    <div class="lx-screen lx-review">
      <header class="lx-bar">
        <div class="lx-bar-title">เฉลยช่วงที่ ${session().review.block + 1}</div>
        ${buddyHTML(store.state, 'cheer')}
        <div class="lx-filter" role="group" aria-label="เลือกข้อ">
          <button class="lx-chip" data-filter="all" type="button">ทั้งหมด</button>
          <button class="lx-chip" data-filter="revisit" type="button">ข้อที่ควรทบทวน</button>
        </div>
        <div class="lx-dots" id="lx-rdots"></div>
      </header>
      <main class="lx-paper" id="lx-rpaper"></main>
      <footer class="lx-nav">
        <button class="lx-btn lx-btn-ghost" id="lx-rprev" type="button">◀ ข้อก่อน</button>
        <button class="lx-btn lx-btn-ghost" id="lx-rnext" type="button">ข้อต่อไป ▶</button>
        <button class="lx-btn lx-btn-go" id="lx-rdone" type="button">${isLastBlock(session()) ? 'รับรางวัล ⭐' : 'ไปพักกัน ▶'}</button>
      </footer>
    </div>`;

  const paper = $(root, '#lx-rpaper');
  const unsubscribe = audio.onChange((request) => markSpeaking(root, request));
  signal.addEventListener('abort', () => { unsubscribe(); itemCtrl?.abort(); tool?.destroy?.(); }, { once: true });

  const visible = () => ids().map((id, i) => ({ id, i })).filter(({ id }) => filter === 'all' || statusOf(id) !== 'correct');

  function renderBar() {
    const s = session();
    root.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    const revisit = ids().filter((id) => statusOf(id) !== 'correct').length;
    root.querySelector('[data-filter="revisit"]').textContent = `ข้อที่ควรทบทวน (${revisit})`;
    $(root, '#lx-rdots').innerHTML = visible().map(({ id, i }) => {
      const st = statusOf(id);
      return `<button class="lx-dot lx-r-${st}${i === s.review.cursor ? ' lx-here' : ''}" data-go="${i}" type="button" aria-label="ข้อ ${s.questionIds.indexOf(id) + 1}">${s.questionIds.indexOf(id) + 1}${st === 'correct' ? '<i>✓</i>' : ''}</button>`;
    }).join('');
    const list = visible().map((v) => v.i);
    const pos = list.indexOf(s.review.cursor);
    $(root, '#lx-rprev').hidden = pos <= 0;
    $(root, '#lx-rnext').hidden = pos === -1 || pos >= list.length - 1;
  }

  function optionsHTML(q, qid, chosen, correctId) {
    return `<div class="lx-options lx-options-review${q.options.some((o) => o.image || o.svg) ? ' lx-options-pics' : ''}">
      ${q.options.map((option) => {
        const isCorrect = option.key === correctId;
        const isChosen = option.key === chosen;
        return `<div class="lx-opt">
          <div class="lx-pick lx-static${isCorrect ? ' lx-is-correct' : ''}${isChosen ? ' lx-is-chosen' : ''}">
            <span class="lx-num">${esc(option.label)}</span>
            ${option.image ? picture(option.image, 'lx-opt-pic') : ''}
            ${option.svg ? renderFold(option.svg.fold) : ''}
            ${option.text ? `<span class="lx-opt-text">${esc(option.text)}</span>` : ''}
            ${isChosen ? '<span class="lx-tag lx-tag-mine">หนูตอบ</span>' : ''}
            ${isCorrect ? '<span class="lx-tag lx-tag-right">คำตอบที่ถูก</span>' : ''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }

  function statusSpeech(qid) {
    const it = item(qid);
    const answer = submittedAnswer(session(), qid);
    const st = statusOf(qid);
    if (st === 'correct') return [SAY.right];
    return [answer === UNSURE ? SAY.unsureAnswer : yourAnswer(labelOf(qid, answer)), correctIs(labelOf(qid, it.correctOptionId))];
  }

  function renderItem() {
    tool?.destroy?.();
    tool = null;
    itemCtrl?.abort();
    itemCtrl = new AbortController();
    const s = session();
    const qid = ids()[s.review.cursor];
    const it = item(qid);
    const q = toExamQuestion(set, it, s.optionOrder[qid]);
    const stimulus = stimulusOf(set, it);
    const answer = submittedAnswer(s, qid);
    const st = statusOf(qid);
    const review = it.review;
    const statusText = st === 'correct'
      ? 'ถูกต้องแล้ว เก่งมาก 🌟'
      : `${answer === UNSURE ? 'หนูตอบว่า ยังไม่แน่ใจ' : `หนูตอบข้อ ${labelOf(qid, answer)}`} · คำตอบที่ถูกคือข้อ ${labelOf(qid, it.correctOptionId)}`;
    paper.innerHTML = `
      <div class="lx-section-banner">${esc(sectionOf(set, it))}</div>
      ${stimulus ? `<section class="lx-stimulus lx-stimulus-review"><p class="lx-stim-text">${esc(stimulus.text)}</p>${renderVisual(stimulus.visual)}
        <button class="lx-listen" data-say="stimulus" type="button">🔊 ฟังเรื่อง</button></section>` : ''}
      <div class="lx-question"><span class="lx-qnum">${s.questionIds.indexOf(qid) + 1}.</span><p class="lx-qtext">${esc(it.prompt.text).replace(/\n/g, '<br>')}</p></div>
      <button class="lx-listen lx-listen-main" data-say="prompt" type="button">🔊 ฟังโจทย์</button>
      ${renderVisual(it.visual)}
      ${optionsHTML(q, qid, answer, it.correctOptionId)}
      <p class="lx-status lx-status-${st}">${esc(statusText)}</p>
      <div class="lx-summary"><p>${esc(review.summary)}</p><button class="lx-say" data-say="summary" type="button" aria-label="ฟังเฉลย">🔊</button></div>
      <div class="lx-tools">
        ${review.hints.length ? '<button class="lx-btn lx-btn-tool" data-tool="hint" type="button">💡 คำใบ้</button>' : ''}
        <button class="lx-btn lx-btn-tool" data-tool="steps" type="button">👣 ดูวิธีคิดทีละขั้น</button>
        ${review.column ? '<button class="lx-btn lx-btn-tool lx-btn-column" data-tool="column" type="button">🧮 ตัวช่วยคิด ตั้งเลข</button>' : ''}
        ${(review.transferIds || []).length ? '<button class="lx-btn lx-btn-tool" data-tool="transfer" type="button">✏️ ลองข้อใหม่</button>' : ''}
      </div>
      <div class="lx-tool-panel" id="lx-tool" hidden></div>`;
    renderBar();
    const seq = [];
    const key = `${s.id}:${s.review.block}`;
    if (!introduced.has(key)) { seq.push(SAY.reviewIntro); introduced.add(key); }
    seq.push(...statusSpeech(qid), review.summary);
    playSeq(seq, 'explanation', qid, itemCtrl.signal);
  }

  async function playSeq(texts, role, qid, sig, key = 'summary') {
    for (const [i, text] of texts.entries()) {
      if (i > 0) {
        await sleep(500, sig);
        if (sig.aborted || audio.playing) return 'cancelled';
      }
      const result = await audio.play({ text, role, qid, key }, { signal: sig });
      if (result.status !== 'done' && result.status !== 'muted') return result.status;
    }
    return 'done';
  }

  function openTool(name) {
    const s = session();
    const qid = ids()[s.review.cursor];
    const it = item(qid);
    const panel = $(paper, '#lx-tool');
    tool?.destroy?.();
    const toolCtrl = new AbortController();
    itemCtrl.signal.addEventListener('abort', () => toolCtrl.abort(), { once: true });
    tool = { name, destroy: () => toolCtrl.abort() };
    panel.hidden = false;
    paper.querySelectorAll('[data-tool]').forEach((b) => b.classList.toggle('lx-on', b.dataset.tool === name));
    if (name === 'hint') {
      const used = s.review.hints[qid] || 0;
      const shown = Math.min(it.review.hints.length, used + 1);
      store.dispatch({ type: 'hint', qid });
      const hints = it.review.hints.slice(0, shown);
      panel.innerHTML = `<h3 class="lx-h3">คำใบ้</h3>${hints.map((h, i) => `<p class="lx-hint">💡 ${esc(h)} <button class="lx-say" data-say="hint-${i}" type="button" aria-label="ฟังคำใบ้">🔊</button></p>`).join('')}`;
      audio.play({ text: hints.at(-1), role: 'hint', qid, key: `hint-${shown - 1}` }, { signal: toolCtrl.signal });
    } else if (name === 'steps') {
      runSteps(panel, it, qid, toolCtrl.signal);
    } else if (name === 'column') {
      store.dispatch({ type: 'helper', qid, completed: false });
      panel.innerHTML = '<div id="lx-col-host"></div>';
      const col = mountColumn($(panel, '#lx-col-host'), it.review.column, {
        audio, signal: toolCtrl.signal, reduced,
        onFinish: () => { store.dispatch({ type: 'helper', qid, completed: true }); panel.hidden = true; panel.innerHTML = ''; tool = null; },
      });
      tool.destroy = () => { toolCtrl.abort(); col.destroy(); };
    } else if (name === 'transfer') {
      runTransfer(panel, it, qid, toolCtrl.signal);
    }
    panel.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
  }

  async function runSteps(panel, it, qid, sig) {
    const steps = it.review.steps;
    panel.innerHTML = `<h3 class="lx-h3">วิธีคิด</h3><ol class="lx-steps" id="lx-steps"></ol>`;
    const list = $(panel, '#lx-steps');
    for (let i = 0; i < steps.length; i++) {
      if (sig.aborted) return;
      const li = document.createElement('li');
      li.className = 'lx-step';
      li.innerHTML = `<span>${esc(steps[i])}</span><button class="lx-say" data-say="step-${i}" type="button" aria-label="ฟังขั้นนี้อีกครั้ง">🔊</button>`;
      list.append(li);
      store.dispatch({ type: 'reviewStep', qid, step: i });
      // ขั้นถัดไปโผล่เมื่อเสียงขั้นนี้จบ; ถ้าเสียงถูกหยุด ให้กดปุ่มไปต่อเอง
      const result = await audio.play({ text: steps[i], role: 'explanation', qid, key: `step-${i}` }, { signal: sig });
      if (sig.aborted) return;
      if (result.status !== 'done' && result.status !== 'muted' && i < steps.length - 1) {
        const more = document.createElement('li');
        more.className = 'lx-step-more';
        more.innerHTML = '<button class="lx-btn lx-btn-small" type="button">ขั้นต่อไป ▶</button>';
        list.append(more);
        await new Promise((resolve) => { more.querySelector('button').addEventListener('click', resolve, { once: true }); sig.addEventListener('abort', resolve, { once: true }); });
        more.remove();
      } else {
        await sleep(reduced ? 100 : 500, sig);
      }
    }
  }

  function runTransfer(panel, it, qid, sig) {
    const tids = it.review.transferIds;
    const t = getItem(set, tids[0]);
    const q = toExamQuestion(set, t);
    panel.innerHTML = `
      <h3 class="lx-h3">ลองข้อใหม่ที่คล้ายกัน</h3>
      <p class="lx-small">ข้อนี้ไม่เปลี่ยนคะแนนที่ส่งไปแล้ว</p>
      <div class="lx-question"><p class="lx-qtext">${esc(t.prompt.text).replace(/\n/g, '<br>')}</p></div>
      <button class="lx-listen lx-listen-main" data-say="tprompt" type="button">🔊 ฟังโจทย์</button>
      ${renderVisual(t.visual)}
      <div class="lx-options${q.options.some((o) => o.image || o.svg) ? ' lx-options-pics' : ''}" id="lx-topts">
        ${q.options.map((option, i) => `<div class="lx-opt">
          <button class="lx-pick" data-ti="${i}" type="button"><span class="lx-num">${esc(option.label)}</span>${option.image ? picture(option.image, 'lx-opt-pic') : ''}${option.svg ? renderFold(option.svg.fold) : ''}${option.text ? `<span class="lx-opt-text">${esc(option.text)}</span>` : ''}</button>
          <button class="lx-say" data-say="topt-${i}" type="button" aria-label="ฟังข้อ ${esc(option.label)}">🔊</button></div>`).join('')}
      </div>
      <div id="lx-tresult"></div>`;
    const tSpeech = { tprompt: promptSpeech(t), ...Object.fromEntries(q.options.map((o, i) => [`topt-${i}`, o.speech])) };
    tool.speech = tSpeech;
    playSeq([SAY.transferIntro, tSpeech.tprompt], 'transfer', qid, sig, 'tprompt');
    let answered = false;
    panel.addEventListener('click', async (event) => {
      const pick = event.target.closest('[data-ti]');
      if (!pick || answered) return;
      answered = true;
      const option = q.options[Number(pick.dataset.ti)];
      const correct = option.key === t.correctOptionId;
      store.dispatch({ type: 'transfer', tid: t.id, forQid: qid, answer: option.key, correct, now: Date.now() });
      panel.querySelectorAll('[data-ti]').forEach((b) => {
        const o = q.options[Number(b.dataset.ti)];
        b.disabled = true;
        b.classList.toggle('lx-is-correct', o.key === t.correctOptionId);
        b.classList.toggle('lx-is-chosen', b === pick);
      });
      const result = $(panel, '#lx-tresult');
      result.innerHTML = `<p class="lx-status lx-status-${correct ? 'correct' : 'incorrect'}">${correct ? 'ถูกต้อง เก่งมากเลย 🌟' : `ยังไม่ถูกนะ คำตอบที่ถูกคือข้อ ${OPTION_LABELS[q.options.findIndex((o) => o.key === t.correctOptionId)]}`}</p>
        <ol class="lx-steps">${t.review.steps.map((line) => `<li class="lx-step"><span>${esc(line)}</span></li>`).join('')}</ol>
        ${t.review.column ? '<button class="lx-btn lx-btn-tool lx-btn-column" id="lx-tcol" type="button">🧮 ตั้งเลขข้อนี้</button><div id="lx-tcol-host"></div>' : ''}`;
      result.querySelector('#lx-tcol')?.addEventListener('click', (e) => {
        e.currentTarget.remove();
        mountColumn($(result, '#lx-tcol-host'), t.review.column, { audio, signal: sig, reduced });
      }, { signal: sig });
      await playSeq([correct ? SAY.transferRight : SAY.transferWrong, t.review.summary], 'transfer', qid, sig, 'tresult');
    }, { signal: sig });
  }

  function speakKey(keyName) {
    const s = session();
    const qid = ids()[s.review.cursor];
    const it = item(qid);
    const sig = itemCtrl.signal;
    if (keyName === 'prompt') return audio.play({ text: promptSpeech(it), role: 'explanation', qid, key: keyName }, { signal: sig });
    if (keyName === 'stimulus') return audio.play({ text: stimulusSpeech(stimulusOf(set, it)), role: 'explanation', qid, key: keyName }, { signal: sig });
    if (keyName === 'summary') { store.dispatch({ type: 'replay', role: 'explanation', qid }); return audio.play({ text: it.review.summary, role: 'explanation', qid, key: keyName }, { signal: sig }); }
    if (keyName.startsWith('hint-')) { store.dispatch({ type: 'replay', role: 'hint', qid }); return audio.play({ text: it.review.hints[Number(keyName.slice(5))], role: 'hint', qid, key: keyName }, { signal: sig }); }
    if (keyName.startsWith('step-')) { store.dispatch({ type: 'replay', role: 'explanation', qid }); return audio.play({ text: it.review.steps[Number(keyName.slice(5))], role: 'explanation', qid, key: keyName }, { signal: sig }); }
    const text = tool?.speech?.[keyName];
    if (text) { store.dispatch({ type: 'replay', role: 'transfer', qid }); return audio.play({ text, role: 'transfer', qid, key: keyName }, { signal: sig }); }
    return null;
  }

  function goItem(cursor) {
    if (store.dispatch({ type: 'reviewGoto', cursor })) renderItem();
  }

  on(paper, 'click', (event) => {
    const say = event.target.closest('[data-say]');
    if (say) { speakKey(say.dataset.say); return; }
    const t = event.target.closest('[data-tool]');
    if (t) openTool(t.dataset.tool);
  }, signal);
  on($(root, '#lx-rdots'), 'click', (event) => {
    const dot = event.target.closest('[data-go]');
    if (dot) goItem(Number(dot.dataset.go));
  }, signal);
  on(root.querySelector('.lx-filter'), 'click', (event) => {
    const chip = event.target.closest('[data-filter]');
    if (!chip) return;
    filter = chip.dataset.filter;
    const list = visible();
    if (list.length && !list.some((v) => v.i === session().review.cursor)) goItem(list[0].i); else renderBar();
  }, signal);
  const step = (dir) => {
    const list = visible().map((v) => v.i);
    const pos = list.indexOf(session().review.cursor);
    const next = list[pos + dir];
    if (next != null) goItem(next);
  };
  on($(root, '#lx-rprev'), 'click', () => step(-1), signal);
  on($(root, '#lx-rnext'), 'click', () => step(1), signal);
  on($(root, '#lx-rdone'), 'click', () => store.dispatch({ type: 'finishReview' }), signal);

  renderItem();
}
