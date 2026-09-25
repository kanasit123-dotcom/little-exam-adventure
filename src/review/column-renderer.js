/*
 * ตัวช่วยคิด "ตั้งเลข" ในหน้าเฉลย — หน้าตาและลำดับเหมือนเกมตั้งเลขในโลกของลิลลี่
 * (ตาราง ช่องทด ขีดฆ่าเมื่อยืม บล็อกมัดสิบ แป้นตัวเลข สรุปวิธีทำ) แต่ใช้โจทย์คงที่จากเนื้อหา
 * ขั้นตอนมาจาก column-steps.js (logic ล้วน ทดสอบแล้ว) ไฟล์นี้ทำแค่หน้าจอและเสียง
 * ใช้เฉพาะหน้าเฉลย ห้ามเปิดระหว่างทำข้อสอบ
 */
import { columnScript, COLUMN_PHRASES } from './column-steps.js';
import { esc, sleep } from '../ui.js';

export function blocksMarkup(tens, units, readyCount = 0) {
  const rods = '<div class="lx-rod"></div>'.repeat(tens);
  let cells = '';
  for (let i = 0; i < units; i++) cells += `<div class="lx-unit${i < readyCount ? ' lx-ready' : ''}"></div>`;
  const cols = Math.min(10, Math.max(units, 1));
  return `<div class="lx-rods">${rods}</div><div class="lx-units${units ? '' : ' lx-empty'}" style="grid-template-columns:repeat(${cols},auto)">${cells}</div>`;
}

/**
 * host: element ที่จะวาด, problem: { a, op, b }
 * options: { audio, signal, onFinish(result), reduced } → คืน { destroy }
 */
export function mountColumn(host, problem, { audio, signal, onFinish = () => {}, reduced = false } = {}) {
  const script = columnScript(problem);
  const L = script.layout;
  const steps = script.steps;
  const ctrl = new AbortController();
  const local = ctrl.signal;
  signal?.addEventListener('abort', () => ctrl.abort(), { once: true });
  const wait = (ms) => sleep(reduced ? Math.min(ms, 120) : ms, local);
  const say = (text) => (local.aborted ? Promise.resolve({ status: 'cancelled' }) : audio.play({ text, role: 'explanation', key: 'column' }, { signal: local }));

  let si = 0;
  let typed = '';
  let misses = 0;
  let totalMisses = 0;
  const s = {
    carries: { tens: null, units: null },
    struck: { tens: false, units: false },
    answer: { tens: null, units: null },
    activeCol: null,
    pulse: null,
    pop: null,
  };

  host.innerHTML = `
    <div class="lx-col">
      <p class="lx-col-prompt" id="lx-col-prompt" aria-live="polite"></p>
      <div class="lx-col-area">
        <div class="lx-col-sum" id="lx-col-grid"></div>
        <div class="lx-col-aid" id="lx-col-aid" hidden></div>
      </div>
      <div class="lx-col-pad" id="lx-col-pad"></div>
    </div>`;
  const $prompt = host.querySelector('#lx-col-prompt');
  const $grid = host.querySelector('#lx-col-grid');
  const $aid = host.querySelector('#lx-col-aid');
  const $pad = host.querySelector('#lx-col-pad');

  function gridHTML() {
    const on = (col) => (s.activeCol === col ? ' lx-active' : '');
    const pulsing = (col, slot) => (s.pulse && s.pulse.col === col && s.pulse.slot === slot ? ' lx-pulse' : '');
    const popping = (col, slot) => (s.pop && s.pop.col === col && s.pop.slot === slot ? ' lx-pop' : '');
    const carry = (col) => `<span class="lx-cell lx-carry${pulsing(col, 'carry')}${popping(col, 'carry')}" data-slot="carry" data-col="${col}">${s.carries[col] ?? ''}</span>`;
    const top = (col, value, show) => (show
      ? `<span class="lx-cell lx-digit${on(col)}${s.struck[col] ? ' lx-struck' : ''}${pulsing(col, 'top')}" data-slot="top" data-col="${col}">${value}</span>`
      : '<span class="lx-cell lx-blank"></span>');
    const slot = (col, show) => (show
      ? `<span class="lx-cell lx-slot${on(col)}${pulsing(col, 'answer')}${popping(col, 'answer')}${s.answer[col] != null ? ' lx-filled' : ''}" data-slot="answer" data-col="${col}">${s.answer[col] ?? ''}</span>`
      : '<span class="lx-cell lx-blank"></span>');
    return `
      <span class="lx-cell lx-spacer"></span>${carry('tens')}${carry('units')}
      <span class="lx-cell lx-spacer"></span>${top('tens', L.top.t, L.showTopTens)}${top('units', L.top.u, true)}
      <span class="lx-cell lx-op">${L.op}</span>${L.showBottomTens ? `<span class="lx-cell lx-digit${on('tens')}">${L.bottom.t}</span>` : '<span class="lx-cell lx-blank"></span>'}<span class="lx-cell lx-digit${on('units')}">${L.bottom.u}</span>
      <div class="lx-col-rule"></div>
      <span class="lx-cell lx-spacer"></span>${slot('tens', L.showAnswerTens)}${slot('units', true)}`;
  }
  const render = () => { $grid.innerHTML = gridHTML(); };

  function nudge(cell) {
    audio.tap?.(300);
    cell.classList.remove('lx-nope');
    void cell.offsetWidth;
    cell.classList.add('lx-nope');
  }

  async function showBundleAid(step) {
    const au = L.top.u;
    const bu = L.bottom.u;
    $aid.hidden = false;
    $aid.innerHTML = `
      <div class="lx-aid-title">${au} + ${bu} = ${step.sum}</div>
      <div class="lx-blocks">${blocksMarkup(0, step.sum, 10)}</div>
      <div class="lx-aid-note">ครบ 10 หน่วยแล้ว มัดเป็น 1 สิบ</div>`;
    await wait(900);
    if (local.aborted) return;
    $aid.querySelectorAll('.lx-unit.lx-ready').forEach((u) => { u.classList.remove('lx-ready'); u.classList.add('lx-bundling'); });
    await wait(480);
    if (local.aborted) return;
    $aid.querySelector('.lx-blocks').innerHTML = blocksMarkup(1, step.sum - 10);
    $aid.querySelector('.lx-rod')?.classList.add('lx-new-rod');
    $aid.querySelector('.lx-aid-note').textContent = `ได้ 1 สิบ เหลือ ${step.sum - 10} หน่วย`;
  }

  function showBorrowAid(step, done = false) {
    $aid.hidden = false;
    const tens = done ? step.to : step.from;
    const units = done ? step.units : step.u;
    $aid.innerHTML = `
      <div class="lx-aid-title">${L.a}</div>
      <div class="lx-blocks">${blocksMarkup(tens, units)}</div>
      <div class="lx-aid-note">${done ? `แกะ 1 สิบ เป็น 10 หน่วย ได้ ${step.units} หน่วย` : `หน่วยมี ${step.u} เอาออก ${step.need} ไม่พอ`}</div>`;
  }

  function renderEntry(state = '') {
    const box = $pad.querySelector('#lx-entry');
    if (box) box.innerHTML = `<span class="lx-entry-box ${state}">${typed || '?'}</span>`;
  }

  function keypad(glow = '') {
    $pad.innerHTML = `<div class="lx-entry" id="lx-entry"></div><div class="lx-keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
      .map((n) => `<button class="lx-key${glow.includes(String(n)) ? ' lx-glow' : ''}" data-k="${n}" type="button">${n}</button>`).join('')}<button class="lx-key lx-del" data-k="del" type="button" aria-label="ลบ">⌫</button></div>`;
    renderEntry();
  }

  async function onKey(k) {
    const st = steps[si];
    if (!st || st.type !== 'ask') return;
    const max = String(st.answer).length;
    if (k === 'del') { typed = typed.slice(0, -1); audio.tap?.(); renderEntry(); return; }
    if (typed.length >= max) return;
    typed += k;
    audio.tap?.();
    renderEntry();
    if (typed.length < max) return;
    if (typed !== String(st.answer)) {
      misses++;
      totalMisses++;
      renderEntry('lx-nope');
      await wait(650);
      typed = '';
      if (misses >= 2) { keypad(String(st.answer)); say(COLUMN_PHRASES.glowKey); } else { renderEntry(); say(COLUMN_PHRASES.tryAgain); }
      return;
    }
    renderEntry('lx-correct');
    si++;
    await wait(650);
    runStep();
  }

  $pad.addEventListener('click', (event) => {
    const key = event.target.closest('[data-k]');
    if (key) onKey(key.dataset.k);
  }, { signal: local });

  $grid.addEventListener('click', async (event) => {
    const cell = event.target.closest('.lx-cell');
    const st = steps[si];
    if (!cell || !st || !s.pulse) return;
    if (st.type === 'write') {
      if (cell.dataset.slot !== st.slot || cell.dataset.col !== st.col) { nudge(cell); return; }
      if (st.slot === 'answer') s.answer[st.col] = st.value; else s.carries[st.col] = st.value;
      s.pop = { col: st.col, slot: st.slot };
      s.pulse = null;
      audio.tap?.(st.slot === 'carry' ? 880 : 660);
      si++;
      render();
      await wait(450);
      runStep();
      return;
    }
    if (st.type === 'borrow') {
      if (cell.dataset.slot !== 'top' || cell.dataset.col !== 'tens') { nudge(cell); return; }
      s.carries.tens = st.to;
      s.carries.units = st.units;
      s.struck.tens = true;
      s.struck.units = true;
      s.pulse = null;
      s.pop = { col: 'units', slot: 'carry' };
      audio.tap?.(880);
      showBorrowAid(st, true);
      si++;
      render();
      $prompt.textContent = st.after;
      await say(st.after);
      if (!local.aborted) runStep();
    }
  }, { signal: local });

  async function runStep() {
    if (local.aborted) return;
    const st = steps[si];
    if (!st) { finish(); return; }
    misses = 0;
    typed = '';
    s.pop = null;
    $prompt.textContent = st.text;
    if (st.type === 'ask') {
      if (!(st.col === 'units' && steps[si - 1]?.type === 'borrow')) $aid.hidden = true;
      s.activeCol = st.col;
      s.pulse = null;
      render();
      keypad();
      say(st.speech);
      return;
    }
    $pad.innerHTML = '';
    s.activeCol = st.type === 'borrow' || st.type === 'zero' ? 'tens' : st.col;
    s.pulse = null;
    render();
    if (st.type === 'zero') {
      $aid.hidden = true;
      await say(st.speech);
      if (local.aborted) return;
      si++;
      runStep();
      return;
    }
    if (st.why === 'bundle') await showBundleAid(st);
    else if (st.type === 'borrow') showBorrowAid(st);
    else $aid.hidden = true;
    if (local.aborted) return;
    s.pulse = st.type === 'borrow' ? { col: 'tens', slot: 'top' } : { col: st.col, slot: st.slot };
    render();
    say(st.speech);
  }

  async function finish() {
    s.activeCol = null;
    s.pulse = null;
    $aid.hidden = true;
    render();
    $prompt.textContent = 'ทำเสร็จแล้ว';
    const p = script.problem;
    $pad.innerHTML = `
      <div class="lx-col-summary">
        <div class="lx-col-eq"><b>${p.a}</b><span>${p.op}</span><b>${p.b}</b><span>=</span><b class="lx-ans">${p.result}</b></div>
        <div class="lx-col-steps">${script.recap.map((line) => `<div>${esc(line)}</div>`).join('')}</div>
        <button class="lx-btn lx-btn-go" id="lx-col-done" type="button" hidden>เข้าใจแล้ว</button>
      </div>`;
    await say(script.finalSpeech);
    const done = $pad.querySelector('#lx-col-done');
    if (!done || local.aborted) return;
    done.hidden = false;
    done.addEventListener('click', () => onFinish({ completed: true, misses: totalMisses }), { once: true, signal: local });
  }

  let started = false;
  const begin = () => { if (started || local.aborted) return; started = true; runStep(); };
  render();
  $prompt.textContent = COLUMN_PHRASES.start;
  say(COLUMN_PHRASES.start).then((result) => { if (result.status !== 'cancelled') begin(); });
  // ถ้าเสียงถูกตัดหรือเล่นไม่ได้ ก็ยังเริ่มได้: แตะที่ตัวช่วยคิด
  host.addEventListener('pointerdown', begin, { signal: local });

  return { destroy() { ctrl.abort(); } };
}
