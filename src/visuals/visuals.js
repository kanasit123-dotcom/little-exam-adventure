/*
 * ภาพประกอบโจทย์ที่วาดด้วยโค้ด — ขนาดคงที่ตามสัดส่วน ไม่ขยับตามคำตอบ และไม่มีข้อความบอกเฉลย
 * renderVisual(visual) คืน HTML string (ใช้ทั้งหน้าข้อสอบและหน้าเฉลย)
 */
import { asset } from '../core/assets.js';

export const esc = (text) => String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const img = (id, cls = '') => {
  const a = asset(id);
  return `<img class="${cls}" src="${esc(a.src)}" alt="" draggable="false">`;
};

function pictograph(v) {
  const rows = v.rows.map((row) => `
    <div class="lx-pg-row">
      <div class="lx-pg-who">${img(row.asset, 'lx-pg-face')}<span>${esc(row.label)}</span></div>
      <div class="lx-pg-icons">${img(v.icon, 'lx-pg-icon').repeat(row.count)}</div>
    </div>`).join('');
  return `<figure class="lx-visual lx-pictograph" aria-label="แผนภูมิรูปภาพ">
    ${rows}
    <figcaption class="lx-pg-key">${img(v.icon, 'lx-pg-icon')}<span>= ${v.unit} ${esc(v.unitWord)}</span></figcaption>
  </figure>`;
}

// ลูกศรบอกทิศแบบในข้อสอบ: เหนือด้านบน ใต้ด้านล่าง ตะวันออกขวา ตะวันตกซ้าย
const ROSE = `<svg class="lx-rose" viewBox="-44 -2 288 156" aria-hidden="true">
  <g stroke="#4a3b52" stroke-width="3" fill="#4a3b52">
    <line x1="100" y1="30" x2="100" y2="120"/><line x1="40" y1="75" x2="160" y2="75"/>
    <path d="M100 22 l-7 14 h14z"/><path d="M100 128 l-7 -14 h14z"/><path d="M168 75 l-14 -7 v14z"/><path d="M32 75 l14 -7 v14z"/>
  </g>
  <g font-size="21" fill="#4a3b52" text-anchor="middle" font-family="inherit">
    <text x="100" y="16">เหนือ</text><text x="100" y="147">ใต้</text>
    <text x="192" y="106">ตะวันออก</text><text x="8" y="106">ตะวันตก</text>
  </g>
</svg>`;

function compassMap(v) {
  const place = (dir) => `<div class="lx-map-place lx-map-${dir}">${esc(v.places[dir])}</div>`;
  return `<figure class="lx-visual lx-map" aria-label="แผนที่">
    <div class="lx-map-grid">
      ${place('north')}${place('west')}
      <div class="lx-map-center">${img('pic-house', 'lx-map-house')}<span>${esc(v.center)}</span></div>
      ${place('east')}${place('south')}
    </div>
    <div class="lx-map-rose">${ROSE}</div>
  </figure>`;
}

const PIPS = {
  1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[26, 26], [50, 50], [74, 74]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[26, 26], [74, 26], [50, 50], [26, 74], [74, 74]],
  6: [[30, 24], [70, 24], [30, 50], [70, 50], [30, 76], [70, 76]],
};

function dice(v) {
  const pips = PIPS[v.face].map(([x, y]) => `<circle cx="${x + 20}" cy="${y + 30}" r="8"/>`).join('');
  return `<figure class="lx-visual lx-dice" aria-label="ลูกเต๋า">
    <svg viewBox="0 0 150 140">
      <path d="M20 30 L50 6 H146 L120 30 Z" fill="#f4eefb" stroke="#4a3b52" stroke-width="3" stroke-linejoin="round"/>
      <path d="M120 30 L146 6 V102 L120 130 Z" fill="#e6dcf3" stroke="#4a3b52" stroke-width="3" stroke-linejoin="round"/>
      <rect x="20" y="30" width="100" height="100" rx="10" fill="#fff" stroke="#4a3b52" stroke-width="3"/>
      <g fill="#4a3b52">${pips}</g>
    </svg>
    <figcaption>ด้านหน้า</figcaption>
  </figure>`;
}

// รูปหลายเหลี่ยมแบบไม่สมมาตรเกินไป (5 = รูปบ้าน, 6 = หกเหลี่ยมยาวแบบในข้อสอบ)
const POLYGONS = {
  3: '100,20 180,150 20,150',
  4: '30,40 170,40 170,140 30,140',
  5: '100,15 180,75 180,155 20,155 20,75',
  6: '55,40 185,40 215,95 185,150 55,150 25,95',
  7: '100,15 165,40 185,100 150,155 50,155 15,100 35,40',
  8: '70,20 130,20 175,60 175,120 130,160 70,160 25,120 25,60',
};

function polygon(v) {
  const wide = v.sides === 6;
  return `<figure class="lx-visual lx-polygon" aria-label="รูปเหลี่ยม">
    <svg viewBox="0 0 ${wide ? 240 : 200} 175"><polygon points="${POLYGONS[v.sides]}" fill="#fff6d8" stroke="#4a3b52" stroke-width="5" stroke-linejoin="round"/></svg>
  </figure>`;
}

export function renderVisual(visual) {
  if (!visual) return '';
  switch (visual.type) {
    case 'image': return `<figure class="lx-visual lx-image">${img(visual.asset, 'lx-image-pic')}</figure>`;
    case 'pictograph': return pictograph(visual);
    case 'compass-map': return compassMap(visual);
    case 'dice': return dice(visual);
    case 'polygon': return polygon(visual);
    default: return '';
  }
}
