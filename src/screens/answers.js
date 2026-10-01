/*
 * หน้าตรวจเฉลยสำหรับผู้ปกครอง — เปิดทีละชุด เห็นทุกข้อ คำตอบที่ถูก และเหตุผลในหน้าเดียว (ไม่ต้องเล่นจนจบ)
 * เป็นหน้าอ่านอย่างเดียว: ไม่มีเสียง ไม่บันทึกอะไร ไม่กระทบความคืบหน้าของเด็ก
 * ตัวเลือกวาดด้วย toExamQuestion() เหมือนหน้าข้อสอบ (ภาพจึงตรงกับที่เด็กเห็น) แล้วใส่ป้ายเฉลยทับ
 */
import { SETS, OPTION_LABELS, getItem, getSet, sectionOf, stimulusOf } from '../content/sets/index.js';
import { toExamQuestion } from '../core/exam-question.js';
import { renderVisual, renderOptionSvg } from '../visuals/visuals.js';
import { loadMarks, saveMarks, toggleMark } from '../core/review-marks.js';
import { $, $$, esc, on, picture, confirmBox } from '../ui.js';

const STATUS_NAME = { 'parent-approved': 'ผู้ปกครองตรวจแล้ว', draft: 'ยังไม่ได้ตรวจ' };
let lastSetId = null;

const correctIndex = (item) => item.options.findIndex((option) => option.id === item.correctOptionId);
const lines = (text) => esc(text).replace(/\n/g, '<br>');
const clip = (text, max = 40) => (text.length > max ? `${text.slice(0, max)}…` : text);
const allApproved = (set) => set.items.every((item) => item.type !== 'main' || item.reviewStatus === 'parent-approved');

const checkButton = (set, marks) => `<div class="lx-row lx-row-left"><button class="lx-btn lx-btn-soft lx-ak-check" data-check="${set.id}" type="button" aria-pressed="${!!marks.done[set.id]}">${marks.done[set.id] ? '✓ ตรวจชุดนี้แล้ว (แตะเพื่อยกเลิก)' : 'ตรวจชุดนี้แล้ว ✓'}</button></div>`;

/** รายการข้อที่ติดธง เรียงตามชุดและเลขข้อ — ข้อความที่ผู้ปกครองคัดลอกส่งให้ผู้ช่วยแก้ */
export function flagLines(marks) {
  const out = [];
  for (const set of SETS) {
    set.order.forEach((id, index) => {
      if (!marks.flags[id]) return;
      const item = getItem(set, id);
      out.push(`${set.title} ข้อ ${index + 1} [${id}] "${clip(item.prompt.text)}" (เฉลยในเกม: ข้อ ${OPTION_LABELS[correctIndex(item)]})`);
    });
  }
  return out;
}

function optionsHTML(q, correctIdx) {
  const pics = q.options.some((option) => option.image || option.svg);
  return `<div class="lx-options lx-ak-options${pics ? ' lx-options-pics' : ''}${q.options.length === 4 ? ' lx-options-4' : ''}${q.compact ? ' lx-options-short' : ''}">
    ${q.options.map((option, i) => `
      <div class="lx-opt">
        <div class="lx-pick lx-static${i === correctIdx ? ' lx-is-correct' : ''}">
          <span class="lx-num">${esc(option.label)}</span>
          ${option.image ? picture(option.image, 'lx-opt-pic') : ''}
          ${option.svg ? renderOptionSvg(option.svg) : ''}
          ${option.text ? `<span class="lx-opt-text">${esc(option.text)}</span>` : ''}
          ${i === correctIdx ? '<span class="lx-tag lx-tag-right">เฉลย ✓</span>' : ''}
        </div>
      </div>`).join('')}
  </div>`;
}

function storyHTML(set, item) {
  const stimulus = stimulusOf(set, item);
  if (!stimulus) return '';
  const q = toExamQuestion(set, item);
  return `<section class="lx-ak-story">
    ${stimulus.text ? `<p class="lx-ak-story-text">📖 ${lines(stimulus.text)}</p>` : ''}
    ${stimulus.textHidden ? '<p class="lx-small">ในเกม เด็กฟังเรื่องนี้ด้วยเสียงอย่างเดียว (ไม่แสดงข้อความ)</p>' : ''}
    ${q.stimulus?.visual ? `<div class="lx-ak-vis">${renderVisual(q.stimulus.visual)}</div>` : ''}
  </section>`;
}

/** เนื้อโจทย์ของหนึ่งข้อ (ภาพ โจทย์ ตัวเลือก) — ใช้ทั้งข้อหลักและข้อลองใหม่ */
function bodyHTML(set, item, number) {
  const q = toExamQuestion(set, item);
  return `
    ${q.visual ? `<div class="lx-ak-vis">${renderVisual(q.visual)}</div>` : ''}
    <p class="lx-ak-q"><span class="lx-ak-n">${number}.</span> ${lines(item.prompt.text)}</p>
    ${optionsHTML(q, correctIndex(item))}`;
}

function reasonHTML(item) {
  const review = item.review;
  const steps = (review.steps || []).map((step) => `<li>${esc(step)}</li>`).join('');
  const hints = (review.hints || []).map((hint) => `<li>${esc(hint)}</li>`).join('');
  return `
    <p class="lx-ak-why"><b>เหตุผล:</b> ${esc(review.summary)}</p>
    ${steps || hints ? `<details class="lx-ak-more"><summary>วิธีคิดทีละขั้น${hints ? ' และคำใบ้' : ''}</summary>
      ${steps ? `<ol>${steps}</ol>` : ''}${hints ? `<p class="lx-small">คำใบ้ที่เด็กเห็น:</p><ul>${hints}</ul>` : ''}</details>` : ''}`;
}

function transferHTML(set, item) {
  const transfers = (item.review.transferIds || []).map((id) => getItem(set, id)).filter(Boolean);
  return transfers.map((transfer, i) => `
    <details class="lx-ak-more lx-ak-transfer"><summary>ข้อลองใหม่${transfers.length > 1 ? ` ${i + 1}` : ''}: เฉลยข้อ ${OPTION_LABELS[correctIndex(transfer)]}</summary>
      ${storyHTML(set, transfer)}
      ${bodyHTML(set, transfer, '✏️')}
      ${reasonHTML(transfer)}
    </details>`).join('');
}

function setHTML(set, marks) {
  const mains = set.order.map((id) => getItem(set, id));
  const tally = {};
  const status = {};
  for (const item of mains) {
    const label = OPTION_LABELS[correctIndex(item)];
    tally[label] = (tally[label] || 0) + 1;
    status[item.reviewStatus] = (status[item.reviewStatus] || 0) + 1;
  }
  let prevStimulus = null;
  let prevSection = null;
  const cards = mains.map((item, index) => {
    const section = sectionOf(set, item);
    const newStory = item.stimulus && item.stimulus !== prevStimulus;
    const banner = section !== prevSection || newStory;
    const sameStory = item.stimulus && item.stimulus === prevStimulus;
    prevStimulus = item.stimulus || null;
    prevSection = section;
    return `
      ${banner ? `<div class="lx-section-banner lx-ak-banner">${esc(section)}</div>` : ''}
      ${newStory ? storyHTML(set, item) : ''}
      <article class="lx-ak-card" id="ak-${esc(item.id)}">
        <header class="lx-ak-head">
          <span class="lx-subject-chip">${esc(toExamQuestion(set, item).subjectName)}</span>
          <span class="lx-ak-ans">เฉลย: ข้อ ${OPTION_LABELS[correctIndex(item)]}</span>
          ${sameStory ? '<span class="lx-small">(ใช้เรื่องเดียวกับข้อก่อนหน้า)</span>' : ''}
          ${item.reviewStatus === 'parent-approved' ? '<span class="lx-ak-ok">✓ ตรวจแล้ว</span>' : ''}
          <button class="lx-ak-flag${marks.flags[item.id] ? ' lx-on' : ''}" data-flag="${esc(item.id)}" type="button" aria-pressed="${!!marks.flags[item.id]}">🚩 สงสัย</button>
        </header>
        ${bodyHTML(set, item, index + 1)}
        ${reasonHTML(item)}
        ${transferHTML(set, item)}
      </article>`;
  }).join('');
  const strip = mains.map((item, index) => `<button class="lx-ak-key" data-jump="ak-${esc(item.id)}" type="button" aria-label="ไปที่ข้อ ${index + 1}"><b>${index + 1}</b><span>${OPTION_LABELS[correctIndex(item)]}</span></button>`).join('');
  return `
    <h2 class="lx-h2">${esc(set.title)}</h2>
    <p class="lx-small">${esc(set.note || '')}</p>
    <p class="lx-small">${mains.length} ข้อ · ${Object.entries(status).map(([key, n]) => `${STATUS_NAME[key] || key} ${n}`).join(' · ')} · ตำแหน่งที่เฉลยอยู่: ${Object.entries(tally).sort().map(([label, n]) => `ข้อ ${label} × ${n}`).join(', ')}</p>
    ${checkButton(set, marks)}
    <h3 class="lx-h3">เฉลยย่อ (เลขใหญ่ = ข้อที่ เลขเล็ก = คำตอบที่ถูก)</h3>
    <div class="lx-ak-strip">${strip}</div>
    ${cards}
    ${checkButton(set, marks)}`;
}

export function mountAnswers(root, ctx) {
  const { signal } = ctx;
  const storage = (() => { try { return window.localStorage; } catch { return null; } })();
  let marks = loadMarks(storage);
  const startId = ctx.params?.setId || lastSetId || (SETS.find((set) => set.items.some((item) => item.reviewStatus !== 'parent-approved')) || SETS[0]).id;
  let setId = getSet(startId) ? startId : SETS[0].id;

  root.innerHTML = `
    <div class="lx-screen lx-answers">
      <main class="lx-paper">
        <h1 class="lx-h1">ตรวจเฉลยทุกข้อ (สำหรับผู้ปกครอง)</h1>
        <p class="lx-small">หน้านี้แสดงคำตอบที่ถูกของทุกข้อ ใช้ตรวจเนื้อหาก่อนให้เด็กเล่น — ไม่มีเสียง ไม่กระทบความคืบหน้าของเด็ก ข้อไหนเฉลยผิดหรือโจทย์ไม่ชัด จดเลขชุดกับเลขข้อแจ้งได้เลย</p>
        <div class="lx-ak-sets" role="group" aria-label="เลือกชุด">
          ${SETS.map((set, i) => `<button class="lx-chip" data-set="${set.id}" type="button" aria-label="${esc(set.title)}">${i + 1}</button>`).join('')}
        </div>
        <section class="lx-ak-flags">
          <p class="lx-small" id="lx-ak-flagcount"></p>
          <p class="lx-warn" id="lx-ak-warn" hidden>เครื่องนี้บันทึกเครื่องหมายไม่ได้ (เช่น โหมดส่วนตัว) เครื่องหมายจะหายเมื่อปิดหน้านี้</p>
          <div class="lx-row lx-row-left">
            <button class="lx-btn lx-btn-go" id="lx-ak-copy" type="button">📋 คัดลอกรายการที่สงสัย</button>
            <button class="lx-btn lx-btn-warn" id="lx-ak-clear" type="button">ล้างธงทั้งหมด</button>
          </div>
          <p class="lx-small" id="lx-ak-copynote" aria-live="polite"></p>
          <textarea class="lx-ak-flagtext" id="lx-ak-flagtext" rows="6" readonly hidden aria-label="รายการข้อที่สงสัย"></textarea>
        </section>
        <div id="lx-ak-body"></div>
        <div class="lx-row"><button class="lx-btn lx-btn-go" id="lx-ak-back" type="button">← กลับหน้าผู้ปกครอง</button></div>
      </main>
    </div>`;

  const body = $(root, '#lx-ak-body');
  // อัปเดตทุกจุดที่แสดงเครื่องหมาย (ธงที่ข้อ, ปุ่ม "ตรวจแล้ว", วงเขียวที่เลขชุด, จำนวนธง) โดยไม่วาดหน้าใหม่ จึงไม่เด้งกลับขึ้นบน
  const syncMarks = () => {
    const found = flagLines(marks);
    $(root, '#lx-ak-flagcount').textContent = found.length
      ? `ติดธงสงสัยไว้ ${found.length} ข้อ`
      : 'ยังไม่ได้ติดธงข้อไหน (แตะ 🚩 สงสัย ที่ข้อที่เฉลยผิดหรือโจทย์ไม่ชัด)';
    $(root, '#lx-ak-copy').hidden = !found.length;
    $(root, '#lx-ak-clear').hidden = !found.length;
    if (!found.length) { $(root, '#lx-ak-flagtext').hidden = true; $(root, '#lx-ak-copynote').textContent = ''; }
    $$(root, '[data-set]').forEach((chip) => chip.classList.toggle('lx-ak-done', allApproved(getSet(chip.dataset.set)) || !!marks.done[chip.dataset.set]));
    $$(root, '[data-flag]').forEach((button) => {
      const flagged = !!marks.flags[button.dataset.flag];
      button.classList.toggle('lx-on', flagged);
      button.setAttribute('aria-pressed', String(flagged));
    });
    $$(root, '[data-check]').forEach((button) => {
      const done = !!marks.done[button.dataset.check];
      button.setAttribute('aria-pressed', String(done));
      button.textContent = done ? '✓ ตรวจชุดนี้แล้ว (แตะเพื่อยกเลิก)' : 'ตรวจชุดนี้แล้ว ✓';
    });
  };
  const toggle = (kind, id) => {
    marks = toggleMark(marks, kind, id);
    $(root, '#lx-ak-warn').hidden = saveMarks(storage, marks);
    syncMarks();
  };
  const show = (id) => {
    setId = id;
    lastSetId = id;
    $$(root, '[data-set]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.set === id)));
    body.innerHTML = setHTML(getSet(id), marks);
    syncMarks();
    window.scrollTo?.(0, 0);
  };
  show(setId);

  on(root, 'click', async (event) => {
    const flag = event.target.closest('[data-flag]');
    if (flag) { toggle('flags', flag.dataset.flag); return; }
    const check = event.target.closest('[data-check]');
    if (check) { toggle('done', check.dataset.check); return; }
    if (event.target.closest('#lx-ak-copy')) {
      const found = flagLines(marks);
      const text = [`รายการข้อที่ผู้ปกครองสงสัย (${found.length} ข้อ)`, ...found].join('\n');
      const box = $(root, '#lx-ak-flagtext');
      box.value = text;
      box.hidden = false;
      try {
        await navigator.clipboard.writeText(text);
        $(root, '#lx-ak-copynote').textContent = 'คัดลอกแล้ว วางส่งให้ผู้ช่วยได้เลย';
      } catch {
        box.focus();
        box.select();
        $(root, '#lx-ak-copynote').textContent = 'คัดลอกอัตโนมัติไม่ได้ กดค้างที่กรอบข้อความด้านล่าง แล้วเลือกคัดลอกเอง';
      }
      return;
    }
    if (event.target.closest('#lx-ak-clear')) {
      const ok = await confirmBox(root, { text: 'ล้างธงสงสัยทั้งหมดใช่ไหม', yes: 'ล้างธง', no: 'ไม่ใช่' }, signal);
      if (ok) { marks = { ...marks, flags: {} }; $(root, '#lx-ak-warn').hidden = saveMarks(storage, marks); syncMarks(); }
      return;
    }
    const pick = event.target.closest('[data-set]');
    if (pick) { show(pick.dataset.set); return; }
    const jump = event.target.closest('[data-jump]');
    if (jump) { document.getElementById(jump.dataset.jump)?.scrollIntoView({ block: 'start' }); return; }
    if (event.target.closest('#lx-ak-back')) ctx.go('parent');
  }, signal);
}
