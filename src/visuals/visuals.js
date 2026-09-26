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

// ภาพเรียงแถวจากซ้ายไปขวา (โจทย์ซ้าย-ขวา) มีป้ายบอกฝั่งซ้าย/ขวาใต้แถว
function row(v) {
  return `<figure class="lx-visual lx-row-visual" aria-label="ภาพเรียงจากซ้ายไปขวา">
    <div class="lx-row-items">${v.items.map((id) => img(id, 'lx-row-pic')).join('')}</div>
    <figcaption class="lx-row-sides"><span>◀ ซ้าย</span><span>ขวา ▶</span></figcaption>
  </figure>`;
}

// นาฬิกาเข็ม: ตัวเลข 1-12 เข็มสั้นหนา เข็มยาวบาง (เข็มสั้นเลื่อนตามนาทีแบบนาฬิกาจริง)
function clock(v) {
  const rad = (deg) => ((deg - 90) * Math.PI) / 180;
  const hand = (deg, len) => `${(100 + len * Math.cos(rad(deg))).toFixed(1)},${(100 + len * Math.sin(rad(deg))).toFixed(1)}`;
  const numbers = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    return `<text x="${(100 + 74 * Math.cos(rad(n * 30))).toFixed(1)}" y="${(100 + 74 * Math.sin(rad(n * 30)) + 7).toFixed(1)}">${n}</text>`;
  }).join('');
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const long = i % 5 === 0;
    const a = rad(i * 6);
    const r1 = long ? 86 : 89;
    return `<line x1="${(100 + r1 * Math.cos(a)).toFixed(1)}" y1="${(100 + r1 * Math.sin(a)).toFixed(1)}" x2="${(100 + 93 * Math.cos(a)).toFixed(1)}" y2="${(100 + 93 * Math.sin(a)).toFixed(1)}" stroke-width="${long ? 3 : 1.5}"/>`;
  }).join('');
  const hourDeg = (v.hour % 12) * 30 + v.minute * 0.5;
  const minuteDeg = v.minute * 6;
  return `<figure class="lx-visual lx-clock" aria-label="นาฬิกา">
    <svg viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="96" fill="#fff" stroke="#4a3b52" stroke-width="5"/>
      <g stroke="#4a3b52">${ticks}</g>
      <g font-size="20" text-anchor="middle" fill="#4a3b52" font-family="inherit" font-weight="700">${numbers}</g>
      <line x1="100" y1="100" x2="${hand(minuteDeg, 60).split(',')[0]}" y2="${hand(minuteDeg, 60).split(',')[1]}" stroke="#2f96de" stroke-width="5" stroke-linecap="round"/>
      <line x1="100" y1="100" x2="${hand(hourDeg, 40).split(',')[0]}" y2="${hand(hourDeg, 40).split(',')[1]}" stroke="#d9598f" stroke-width="9" stroke-linecap="round"/>
      <circle cx="100" cy="100" r="7" fill="#4a3b52"/>
    </svg>
  </figure>`;
}

function table(v) {
  return `<figure class="lx-visual lx-table-visual" aria-label="ตาราง">
    <table class="lx-data-table"><thead><tr><th>ชื่อ</th><th>จำนวน (${esc(v.unit)})</th></tr></thead>
      <tbody>${v.rows.map((r) => `<tr><td>${esc(r.name)}</td><td>${r.count}</td></tr>`).join('')}</tbody></table>
  </figure>`;
}

function numberRow(v) {
  return `<figure class="lx-visual lx-numrow" aria-label="แถวตัวเลข">
    <div class="lx-numrow-items">${v.items.map((x) => `<span class="lx-num-box${x === '?' ? ' lx-num-ask' : ''}">${x === '?' ? '?' : x}</span>`).join('')}</div>
  </figure>`;
}

// รูปทรงกระจายในกรอบ ตำแหน่ง/ขนาด/การหมุนคงที่ตามลำดับ (ไม่สุ่ม) ทุกเครื่องเห็นเหมือนกัน
const SCENE_SLOTS = [[60, 60, 34, 0], [165, 70, 30, 0], [275, 55, 32, 15], [80, 160, 28, -12], [185, 165, 36, 0], [295, 155, 30, 0], [120, 245, 30, 20], [240, 245, 28, 0], [330, 240, 24, -8]];
function shapeSvg(kind, x, y, r, rot) {
  const style = 'fill="#fff6d8" stroke="#4a3b52" stroke-width="4" stroke-linejoin="round"';
  if (kind === 'circle') return `<circle cx="${x}" cy="${y}" r="${r}" ${style}/>`;
  if (kind === 'square') return `<rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" transform="rotate(${rot} ${x} ${y})" ${style}/>`;
  const h = r * 1.15;
  return `<polygon points="${x},${y - h} ${x + r * 1.1},${y + h * 0.7} ${x - r * 1.1},${y + h * 0.7}" transform="rotate(${rot} ${x} ${y})" ${style}/>`;
}
function shapeCount(v) {
  return `<figure class="lx-visual lx-shapes" aria-label="ภาพรูปทรง">
    <svg viewBox="0 0 380 300"><rect x="4" y="4" width="372" height="292" rx="18" fill="#fff" stroke="#f0e2ec" stroke-width="4"/>
      ${v.shapes.map((kind, i) => shapeSvg(kind, ...SCENE_SLOTS[i])).join('')}</svg>
  </figure>`;
}

// รูปสำหรับโจทย์พับครึ่ง: มีเส้นประแนวตั้งกลางรูปเสมอ
const FOLDS = {
  heart: '<path d="M50 84 C20 62 12 44 20 30 C28 16 44 18 50 32 C56 18 72 16 80 30 C88 44 80 62 50 84 Z"/>',
  crescent: '<path d="M62 15 A36 36 0 1 0 62 85 A26 36 0 0 1 62 15 Z"/>',
  lshape: '<path d="M26 16 H48 V64 H78 V86 H26 Z"/>',
  star: '<polygon points="50,10 61,38 90,38 66,56 75,86 50,68 25,86 34,56 10,38 39,38"/>',
  circle: '<circle cx="50" cy="50" r="36"/>',
  flag: '<path d="M40 10 V92" stroke-width="6"/><path d="M43 12 L90 31 L43 50 Z"/>',
};
export function renderFold(fold) {
  return `<svg class="lx-fold" viewBox="0 0 100 100" aria-hidden="true">
    <g fill="#ffd9e8" stroke="#4a3b52" stroke-width="4" stroke-linejoin="round">${FOLDS[fold] || ''}</g>
    <line x1="50" y1="4" x2="50" y2="96" stroke="#2f96de" stroke-width="3" stroke-dasharray="6 5"/>
  </svg>`;
}

export function renderVisual(visual) {
  if (!visual) return '';
  switch (visual.type) {
    case 'image': return `<figure class="lx-visual lx-image">${img(visual.asset, 'lx-image-pic')}</figure>`;
    case 'pictograph': return pictograph(visual);
    case 'compass-map': return compassMap(visual);
    case 'dice': return dice(visual);
    case 'polygon': return polygon(visual);
    case 'row': return row(visual);
    case 'clock': return clock(visual);
    case 'table': return table(visual);
    case 'number-row': return numberRow(visual);
    case 'shape-count': return shapeCount(visual);
    default: return '';
  }
}
