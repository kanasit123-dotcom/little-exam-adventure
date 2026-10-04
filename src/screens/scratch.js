/*
 * กระดาษทด — แผ่นเขียนอิสระ (นิ้ว / Apple Pencil / เมาส์) เปิดทับหน้าข้อสอบ
 * ไม่รับเฉลยหรือข้อมูลคำตอบเลย รู้แค่เลขข้อ ข้อความโจทย์ (ที่เด็กเห็นอยู่แล้ว) และกุญแจกระดาษ
 */
import { PEN_COLORS, scratchStore } from '../core/scratch-store.js';
import { paintStrokes } from '../core/scratch-paint.js';
import { $, $$, esc, on } from '../ui.js';

const PEN_WIDTH = 4;     // px บนกระดาษ
const ERASER_WIDTH = 26;

/**
 * root: ที่วางแผ่น (เป็นพี่น้องของหน้าสอบ), screenEl: หน้าสอบที่จะถูกล็อกไว้ระหว่างเขียน
 * open({ key, number, text, story }) เปิดแผ่น; onChange(key) ถูกเรียกทุกครั้งที่เส้นเปลี่ยน
 */
export function mountScratch(root, { screenEl, signal, onChange = () => {} }) {
  let sheet = null;
  let cleanup = null;

  function close() {
    cleanup?.();
  }

  function open({ key, number, text, story = '', visuals = '' }) {
    if (sheet) return;
    const opener = document.activeElement;
    sheet = document.createElement('div');
    sheet.className = 'lx-scratch lx-compact';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', `กระดาษทด ข้อ ${number}`);
    sheet.innerHTML = `
      <div class="lx-scratch-top">
        <span class="lx-scratch-title">✏️ กระดาษทด · ข้อ ${esc(String(number))}</span>
        <button class="lx-btn lx-btn-go lx-scratch-done" id="lx-scratch-done" type="button">เสร็จ ✓</button>
      </div>
      <div class="lx-scratch-q">
        <p class="lx-scratch-text"><b>${esc(String(number))}.</b> ${esc(text).replace(/\n/g, '<br>')}</p>
        ${story ? `<p class="lx-scratch-story">${esc(story)}</p>` : ''}
        ${visuals ? `<div class="lx-scratch-vis">${visuals}</div>` : ''}
      </div>
      <div class="lx-scratch-board"><canvas class="lx-scratch-canvas" aria-label="พื้นที่เขียน"></canvas></div>
      <div class="lx-scratch-tools" role="toolbar" aria-label="เครื่องมือกระดาษทด">
        <button class="lx-scratch-tool lx-pen" data-tool="black" type="button" aria-label="ปากกาดำ" aria-pressed="true"><i style="background:${PEN_COLORS.black}"></i></button>
        <button class="lx-scratch-tool lx-pen" data-tool="blue" type="button" aria-label="ปากกาน้ำเงิน" aria-pressed="false"><i style="background:${PEN_COLORS.blue}"></i></button>
        <button class="lx-scratch-tool lx-pen" data-tool="red" type="button" aria-label="ปากกาแดง" aria-pressed="false"><i style="background:${PEN_COLORS.red}"></i></button>
        <button class="lx-scratch-tool" data-tool="eraser" type="button" aria-label="ยางลบ" aria-pressed="false">🧽</button>
        <span class="lx-scratch-gap"></span>
        <button class="lx-scratch-tool" id="lx-scratch-undo" type="button" aria-label="ย้อนเส้นล่าสุด">↩️</button>
        <button class="lx-scratch-tool" id="lx-scratch-clear" type="button" aria-label="ล้างกระดาษ">🗑️</button>
      </div>`;
    root.append(sheet);
    screenEl.inert = true;
    screenEl.setAttribute('aria-hidden', 'true');

    const canvas = $(sheet, '.lx-scratch-canvas');
    const ctx = canvas.getContext('2d');
    let cssW = 1;
    let cssH = 1;
    let tool = 'black';
    let drawing = null;       // { id, stroke }
    let penSeen = false;      // เจอ Apple Pencil แล้ว: ไม่รับนิ้ว (กันฝ่ามือแตะโดน)
    let armedClear = 0;

    const redraw = () => paintStrokes(ctx, scratchStore.strokes(key), cssW, cssH);
    function fit() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    }
    const resizer = new ResizeObserver(fit);
    resizer.observe(canvas);
    fit();

    const spot = (event) => {
      const rect = canvas.getBoundingClientRect();
      return [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height];
    };
    const penOf = () => (tool === 'eraser' ? { color: '#000', width: ERASER_WIDTH, erase: true } : { color: PEN_COLORS[tool], width: PEN_WIDTH, erase: false });

    const ac = new AbortController();
    const local = ac.signal;
    on(canvas, 'pointerdown', (event) => {
      if (event.pointerType === 'pen') penSeen = true;
      else if (event.pointerType === 'touch' && penSeen) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (drawing) return;
      event.preventDefault();
      canvas.setPointerCapture?.(event.pointerId);
      const [x, y] = spot(event);
      drawing = { id: event.pointerId, stroke: scratchStore.begin(key, penOf(), x, y) };
      redraw();
    }, local);
    on(canvas, 'pointermove', (event) => {
      if (!drawing || event.pointerId !== drawing.id) return;
      event.preventDefault();
      const events = event.getCoalescedEvents?.();
      for (const e of events?.length ? events : [event]) scratchStore.extend(drawing.stroke, ...spot(e));
      redraw();
    }, local);
    const finish = (event) => {
      if (!drawing || event.pointerId !== drawing.id) return;
      drawing = null;
      onChange(key);
    };
    on(canvas, 'pointerup', finish, local);
    on(canvas, 'pointercancel', finish, local);
    on(canvas, 'contextmenu', (event) => event.preventDefault(), local);

    const tools = $(sheet, '.lx-scratch-tools');
    const resetClear = () => {
      clearTimeout(armedClear);
      armedClear = 0;
      const button = $(sheet, '#lx-scratch-clear');
      button.textContent = '🗑️';
      button.classList.remove('lx-armed');
    };
    on(tools, 'click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.tool) {
        tool = button.dataset.tool;
        $$(tools, '[data-tool]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
        resetClear();
      } else if (button.id === 'lx-scratch-undo') {
        scratchStore.undo(key);
        redraw();
        onChange(key);
        resetClear();
      } else if (button.id === 'lx-scratch-clear') {
        if (!scratchStore.count(key)) return;
        if (!armedClear) {
          // กันเผลอล้างทั้งแผ่น: แตะครั้งแรกถามย้ำ แตะซ้ำภายใน 3 วินาทีจึงล้างจริง
          armedClear = setTimeout(resetClear, 3000);
          button.textContent = 'ล้างเลย?';
          button.classList.add('lx-armed');
          return;
        }
        scratchStore.clear(key);
        redraw();
        onChange(key);
        resetClear();
      }
    }, local);

    const done = $(sheet, '#lx-scratch-done');
    on(done, 'click', close, local);
    on(sheet, 'keydown', (event) => { if (event.key === 'Escape') close(); }, local);
    on(window, 'orientationchange', () => setTimeout(fit, 250), local);
    done.focus({ preventScroll: true });

    cleanup = () => {
      cleanup = null;
      clearTimeout(armedClear);
      ac.abort();
      resizer.disconnect();
      sheet.remove();
      sheet = null;
      screenEl.inert = false;
      screenEl.removeAttribute('aria-hidden');
      opener?.focus?.({ preventScroll: true });
    };
  }

  signal.addEventListener('abort', close, { once: true });
  return { open, close, isOpen: () => !!sheet };
}
