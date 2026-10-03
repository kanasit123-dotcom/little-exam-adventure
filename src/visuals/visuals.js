/*
 * ภาพประกอบโจทย์ที่วาดด้วยโค้ด — ขนาดคงที่ตามสัดส่วน ไม่ขยับตามคำตอบ และไม่มีข้อความบอกเฉลย
 * renderVisual(visual) คืน HTML string (ใช้ทั้งหน้าข้อสอบและหน้าเฉลย)
 */
import { asset } from '../core/assets.js';

const asset_src = (id) => asset(id).src;

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
  const max = Math.max(...v.rows.map((row) => row.count));
  return `<figure class="lx-visual lx-pictograph" aria-label="แผนภูมิรูปภาพ" style="--pg-max:${max}">
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
const ROW_LABELS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ'];
function row(v) {
  return `<figure class="lx-visual lx-row-visual" aria-label="ภาพเรียงจากซ้ายไปขวา">
    <div class="lx-row-items${v.labels ? ' lx-row-labeled' : ''}">${v.items.map((id, i) => {
      const pic = id === '?' ? '<span class="lx-row-pic lx-row-blank" aria-label="ช่องว่าง">?</span>' : img(id, 'lx-row-pic');
      return v.labels ? `<span class="lx-row-cell">${pic}<b class="lx-row-label">${ROW_LABELS[i]}</b></span>` : pic;
    }).join('')}</div>
    ${v.sides ? '<figcaption class="lx-row-sides"><span>◀ ซ้าย</span><span>ขวา ▶</span></figcaption>' : ''}
  </figure>`;
}

// ตารางภาพ (บน ล่าง ระหว่าง) — ไม่อ่านออกเสียงตำแหน่ง เพราะเป็นสิ่งที่โจทย์ถาม
function grid(v) {
  return `<figure class="lx-visual lx-grid-visual" aria-label="ตารางภาพ ${v.rows.length} แถว">
    <div class="lx-grid" style="--cols:${v.rows[0].length}">${v.rows.flat().map((id) => `<span class="lx-grid-cell">${img(id, 'lx-grid-pic')}</span>`).join('')}</div>
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

// เทียบปริมาตร: [ภาพซ้าย] = [ภาพขวา x จำนวน] ทีละแถว
function equivalence(v) {
  return `<figure class="lx-visual lx-equiv" aria-label="ภาพเทียบปริมาณ">
    ${v.rows.map((row) => `<div class="lx-equiv-row">${img(row.left, 'lx-equiv-pic lx-equiv-left')}<span class="lx-equiv-eq">=</span><span class="lx-equiv-right">${img(row.right, 'lx-equiv-pic').repeat(row.count)}</span></div>`).join('')}
  </figure>`;
}

// ของหลายชนิดวางปนกันให้นับ: ตำแหน่งคงที่จากลำดับ (สลับชนิดแบบกำหนดตายตัว ไม่สุ่ม)
const SCATTER_SLOTS = [
  [13, 14], [35, 11], [59, 15], [84, 12], [22, 37], [46, 33], [69, 39], [87, 35],
  [12, 62], [35, 58], [58, 64], [81, 60], [20, 85], [44, 84], [66, 87], [87, 84],
];
const SCATTER_TURN = [-12, 8, 0, 15, -6, 10, -15, 4, 12, -8, 6, -10, 0, 14, -4, 9];
function scatter(v) {
  // แจกของทีละชนิดสลับกันไป เพื่อไม่ให้ของชนิดเดียวกันจับกลุ่มอยู่มุมเดียว
  const queue = v.items.map((item) => ({ asset: item.asset, left: item.count }));
  const order = [];
  while (queue.some((q) => q.left > 0)) for (const q of queue) if (q.left > 0) { order.push(q.asset); q.left--; }
  const place = [0, 5, 10, 15, 2, 7, 8, 13, 1, 4, 11, 14, 3, 6, 9, 12];
  return `<figure class="lx-visual lx-scatter" aria-label="ภาพสิ่งของหลายชนิด">
    <div class="lx-scatter-box">${order.map((asset, i) => {
      const [x, y] = SCATTER_SLOTS[place[i]];
      return `<img class="lx-scatter-pic" src="${esc(asset_src(asset))}" alt="" draggable="false" style="left:${x}%;top:${y}%;transform:translate(-50%,-50%) rotate(${SCATTER_TURN[i]}deg)">`;
    }).join('')}</div>
  </figure>`;
}

// เค้กตัดแบ่ง (ตัวเลือกโจทย์แบ่งเท่าๆ กัน): มองจากด้านบน มีรอยตัด
const CUTS = {
  halves: '<line x1="50" y1="12" x2="50" y2="88"/>',
  'uneven-halves': '<line x1="30" y1="15" x2="30" y2="85"/>',
  quarters: '<line x1="50" y1="12" x2="50" y2="88"/><line x1="12" y1="50" x2="88" y2="50"/>',
  'uneven-quarters': '<line x1="36" y1="13" x2="36" y2="87"/><line x1="36" y1="64" x2="87" y2="64"/><line x1="36" y1="34" x2="84" y2="34"/>',
  // 8 ชิ้น (แบ่งให้เพื่อน 8 คน): เท่ากันทุกชิ้น / ชิ้นเล็กใหญ่ต่างกัน (มุมที่ตัดต่างกันตั้งแต่ 29 ถึง 57 องศา)
  eighths: '<line x1="50" y1="12" x2="50" y2="88"/><line x1="12" y1="50" x2="88" y2="50"/><line x1="23" y1="23" x2="77" y2="77"/><line x1="77" y1="23" x2="23" y2="77"/>',
  'uneven-eighths': '<line x1="50" y1="50" x2="88" y2="50"/><line x1="50" y1="50" x2="75" y2="78"/><line x1="50" y1="50" x2="49" y2="88"/><line x1="50" y1="50" x2="27" y2="80"/><line x1="50" y1="50" x2="12" y2="49"/><line x1="50" y1="50" x2="30" y2="18"/><line x1="50" y1="50" x2="59" y2="13"/><line x1="50" y1="50" x2="83" y2="32"/>',
};
export function renderCake(cut) {
  return `<svg class="lx-cake" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="38" fill="#ffe3b3" stroke="#4a3b52" stroke-width="4"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="#f2a7c3" stroke-width="3" stroke-dasharray="4 5"/>
    <g stroke="#4a3b52" stroke-width="3.5" stroke-linecap="round">${CUTS[cut] || ''}</g>
  </svg>`;
}

// รูปเรขาคณิตสำหรับโจทย์ภาพต่อเนื่อง (แนวข้อสอบเชาวน์): วงแปดเหลี่ยมแบ่ง 8 ช่องระบาย 1 ช่อง (0 = ด้านบน, 2 = ขวา, 4 = ล่าง, 6 = ซ้าย เวียนตามเข็มนาฬิกา), ลูกศร, จุด
const OCT = Array.from({ length: 8 }, (_, i) => {
  const a = ((i * 45 - 90 - 22.5) * Math.PI) / 180;
  return [50 + 40 * Math.cos(a), 50 + 40 * Math.sin(a)];
});
const ARROW_TURN = { up: 0, right: 90, down: 180, left: 270 };
const DOT_SPOTS = [[50, 50], [30, 30], [70, 70], [70, 30], [30, 70], [30, 50], [70, 50], [50, 30], [50, 70]];
const DOT_SETS = { 1: [0], 2: [1, 2], 3: [1, 0, 2], 4: [1, 3, 4, 2], 5: [1, 3, 0, 4, 2], 6: [1, 3, 5, 6, 4, 2], 7: [1, 3, 5, 0, 6, 4, 2], 8: [1, 3, 5, 6, 4, 2, 7, 8], 9: [0, 1, 2, 3, 4, 5, 6, 7, 8] };
const HALF_POINTS = { tl: '14,14 86,14 14,86', tr: '14,14 86,14 86,86', br: '86,14 86,86 14,86', bl: '14,14 14,86 86,86' };
const SHAPE_DRAW = {
  circle: (a) => `<circle cx="50" cy="50" r="31" ${a}/>`,
  square: (a) => `<rect x="20" y="20" width="60" height="60" ${a}/>`,
  triangle: (a) => `<polygon points="50,16 84,80 16,80" ${a}/>`,
  hexagon: (a) => `<polygon points="50,14 82,32 82,68 50,86 18,68 18,32" ${a}/>`,
  diamond: (a) => `<polygon points="50,12 86,50 50,88 14,50" ${a}/>`,
};
export function renderFigure(f) {
  let body = '';
  if (f && 'half' in f) {
    body = `<rect x="14" y="14" width="72" height="72" fill="#fff" stroke="#4a3b52" stroke-width="3"/><polygon points="${HALF_POINTS[f.half]}" fill="#4a3b52" stroke="#4a3b52" stroke-width="3" stroke-linejoin="round"/>`;
  } else if (f && 'shape' in f) {
    const fill = f.fill === 'solid' ? '#4a3b52' : f.fill === 'dots' ? 'url(#lx-dotfill)' : '#fff';
    const defs = f.fill === 'dots' ? '<defs><pattern id="lx-dotfill" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#fff"/><circle cx="5" cy="5" r="2.2" fill="#4a3b52"/></pattern></defs>' : '';
    body = `${defs}${(SHAPE_DRAW[f.shape] || (() => ''))(`fill="${fill}" stroke="#4a3b52" stroke-width="4" stroke-linejoin="round"`)}`;
  } else if (f && 'wheel' in f) {
    const pt = (p) => p.map((n) => n.toFixed(1)).join(',');
    const slices = OCT.map((p, i) => `<polygon points="50,50 ${pt(p)} ${pt(OCT[(i + 1) % 8])}" fill="${i === f.wheel ? '#4a3b52' : '#fff'}"/>`).join('');
    body = `<g stroke="#4a3b52" stroke-width="2.5" stroke-linejoin="round">${slices}<polygon points="${OCT.map(pt).join(' ')}" fill="none"/></g>`;
  } else if (f && 'arrow' in f) {
    body = `<g transform="rotate(${ARROW_TURN[f.arrow]} 50 50)"><path d="M50 12 L78 44 H60 V86 H40 V44 H22 Z" fill="#ffd9e8" stroke="#4a3b52" stroke-width="4" stroke-linejoin="round"/></g>`;
  } else if (f && 'dots' in f) {
    body = (DOT_SETS[f.dots] || []).map((k) => `<circle cx="${DOT_SPOTS[k][0]}" cy="${DOT_SPOTS[k][1]}" r="8" fill="#4a3b52"/>`).join('')
      + '<rect x="12" y="12" width="76" height="76" rx="10" fill="none" stroke="#4a3b52" stroke-width="3"/>';
  }
  return `<svg class="lx-figure" viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
}

// ตัวเลือก "กี่ชิ้น": รูปเดียวกันซ้ำ n ชิ้น จัดเป็นแถวให้นับง่าย
export function renderCount({ asset, n }) {
  const cols = n <= 3 ? n : n === 4 ? 2 : n <= 6 ? 3 : n <= 8 ? 4 : 5;
  return `<span class="lx-count" style="--cols:${cols}" aria-hidden="true">${Array.from({ length: n }, () => img(asset, 'lx-count-pic')).join('')}</span>`;
}

// แผนภาพเวนน์แบบเด็ก: วงกลมซ้อนสี่เหลี่ยม ดาวอยู่ในบริเวณใดบริเวณหนึ่ง
function starPoints(cx, cy, outer, inner) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = ((i * 36 - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}
const VENN_STAR = { both: [52, 52], circle: [22, 52], square: [77, 52], none: [18, 16] };
export function renderVenn(where) {
  const [x, y] = VENN_STAR[where] || VENN_STAR.none;
  return `<svg class="lx-venn" viewBox="4 4 88 78" aria-hidden="true">
    <rect x="42" y="26" width="46" height="52" rx="3" fill="#bfe0ff" fill-opacity=".75" stroke="#2f96de" stroke-width="3"/>
    <circle cx="38" cy="52" r="27" fill="#ffc2dc" fill-opacity=".75" stroke="#d9598f" stroke-width="3"/>
    <polygon points="${starPoints(x, y, 9, 4)}" fill="#ffc94d" stroke="#d99d1c" stroke-width="2" stroke-linejoin="round"/>
  </svg>`;
}

// ตารางภาพ 2x2 หรือ 3x3 มีช่อง ? หนึ่งช่อง (ภาพที่หายไป)
function figureGrid(v) {
  const cols = v.rows[0].length;
  return `<figure class="lx-visual lx-figgrid" aria-label="ภาพตาราง มีช่องที่หายไปหนึ่งช่อง">
    <div class="lx-figgrid-cells" style="--cols:${cols}">${v.rows.flat().map((x) => (x === '?' ? '<span class="lx-figgrid-cell lx-figgrid-blank">?</span>' : `<span class="lx-figgrid-cell">${renderFigure(x)}</span>`)).join('')}</div>
  </figure>`;
}

// ภาพต่อเนื่อง มีช่อง ? หนึ่งช่อง (ภาพที่หายไปควรเป็นภาพใด)
function figureRow(v) {
  return `<figure class="lx-visual lx-figrow" aria-label="ภาพต่อเนื่อง">
    <div class="lx-figrow-items">${v.items.map((x) => (x === '?' ? '<span class="lx-figrow-cell lx-figrow-blank">?</span>' : `<span class="lx-figrow-cell">${renderFigure(x)}</span>`)).join('')}</div>
  </figure>`;
}

// แผ่นรูปของหลายอย่าง (ใช้ถามหลายข้อต่อกัน) — ไม่มีป้ายชื่อ เนื้อเรื่องอ่านชื่อให้ฟัง
function board(v) {
  return `<figure class="lx-visual lx-board" aria-label="ภาพของ ${v.items.length} อย่าง">
    <div class="lx-board-items">${v.items.map((id) => `<span class="lx-board-cell">${img(id, 'lx-board-pic')}</span>`).join('')}</div>
  </figure>`;
}

// ชิ้นส่วนของภาพ 2x2 (จิ๊กซอว์): ครอปจากรูปที่มีอยู่ด้วย CSS ไม่ต้องสร้างรูปใหม่
const PIECE_POS = { tl: '0% 0%', tr: '100% 0%', bl: '0% 100%', br: '100% 100%' };
const pieceStyle = (asset, cell) => `background-image:url('${esc(asset_src(asset))}');background-position:${PIECE_POS[cell]}`;

/** ตัวเลือกชิ้นส่วนภาพ: เด็กต้องดูว่าชิ้นไหนเป็นของภาพที่ขาดไป */
export function renderPiece({ asset, cell }) {
  return `<span class="lx-figure lx-piece" style="${pieceStyle(asset, cell)}" role="img" aria-label="ชิ้นส่วนของภาพ"></span>`;
}

// จิ๊กซอว์: ภาพ 2x2 ขาดหนึ่งช่อง ให้หาชิ้นที่ใส่ได้
function jigsaw(v) {
  const cell = (c) => (c === v.missing
    ? '<span class="lx-jig-cell lx-jig-blank">?</span>'
    : `<span class="lx-jig-cell lx-piece" style="${pieceStyle(v.asset, c)}"></span>`);
  return `<figure class="lx-visual lx-jigsaw" aria-label="ภาพที่ขาดไปหนึ่งชิ้น">
    <div class="lx-jig-grid">${['tl', 'tr', 'bl', 'br'].map(cell).join('')}</div>
  </figure>`;
}

// รูปมีเลขชี้ (ส่วนของร่างกาย ฯลฯ): จุดชี้อยู่ที่ x, y เป็น % ของรูป — เด็กตอบว่าเลขนี้ชี้ส่วนใด
// ถ้าใส่ lx, ly เลขจะอยู่ที่ตำแหน่งนั้น (ขอบรูป) แล้วลากเส้นไปที่จุดชี้ ไม่บังส่วนเล็กๆ เช่น หู; ไม่ใส่ เลขวางทับที่จุดชี้เลย
function labeled(v) {
  const led = v.marks.filter((m) => m.lx !== undefined);
  const lines = led.map((m) => `<line x1="${m.x}%" y1="${m.y}%" x2="${m.lx}%" y2="${m.ly}%"/><circle cx="${m.x}%" cy="${m.y}%" r="3.5"/>`).join('');
  return `<figure class="lx-visual lx-labeled" aria-label="รูปที่มีเลขชี้">
    <div class="lx-labeled-box">${img(v.asset, 'lx-labeled-pic')}${lines ? `<svg class="lx-labeled-lines" aria-hidden="true">${lines}</svg>` : ''}${v.marks.map((m) => `<b class="lx-mark" style="left:${m.lx ?? m.x}%;top:${m.ly ?? m.y}%">${m.n}</b>`).join('')}</div>
  </figure>`;
}

// ปฏิทินหนึ่งเดือน: start = วันของวันที่ 1 (0 = อาทิตย์ ... 6 = เสาร์) อาทิตย์เป็นตัวเลขสีแดงเหมือนปฏิทินจริง
const WEEKDAY_ABBR = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
function calendar(v) {
  const marks = new Set(v.marks || []);
  const blanks = Array.from({ length: v.start }, () => '<span class="lx-cal-cell lx-cal-empty"></span>').join('');
  const days = Array.from({ length: v.days }, (_, i) => {
    const sunday = (v.start + i) % 7 === 0;
    return `<span class="lx-cal-cell${sunday ? ' lx-cal-sun' : ''}${marks.has(i + 1) ? ' lx-cal-mark' : ''}">${i + 1}</span>`;
  }).join('');
  const head = WEEKDAY_ABBR.map((d, i) => `<b class="lx-cal-head${i === 0 ? ' lx-cal-sun' : ''}">${d}</b>`).join('');
  return `<figure class="lx-visual lx-calendar" aria-label="ปฏิทินเดือน${esc(v.month)}">
    <div class="lx-cal-title">เดือน${esc(v.month)}</div>
    <div class="lx-cal-grid">${head}${blanks}${days}</div>
  </figure>`;
}

// ใกล้-ไกล: รูปเดียวกันหลายรูป ยิ่งไกลยิ่งเล็กและอยู่สูงขึ้นใกล้ขอบฟ้า (size 0.2-1, 1 = ใกล้สุด) มีเลขกำกับด้านล่าง
function distance(v) {
  const n = v.items.length;
  const at = (i) => ((i + 0.5) / n) * 100;
  return `<figure class="lx-visual lx-distance" aria-label="รูปที่อยู่ใกล้และไกลต่างกัน">
    <div class="lx-dist-scene">${v.items.map((item, i) => {
      const height = 20 + item.size * 40;
      const bottom = 6 + (1 - item.size) * 30;
      return `<span class="lx-dist-item" style="left:${at(i)}%;bottom:${bottom}%;height:${height}%">${img(item.asset, 'lx-dist-pic')}</span>`;
    }).join('')}</div>
    <div class="lx-dist-nums">${v.items.map((_, i) => `<b style="left:${at(i)}%">${i + 1}</b>`).join('')}</div>
  </figure>`;
}

/** ตัวเลือกที่วาดด้วยโค้ด (รูปพับครึ่ง เค้กตัดแบ่ง รูปเรขาคณิต หรือชิ้นส่วนภาพ) */
// ---------------------------------------------------------------- ลูกบาศก์ (ชุด 35)
// rows = แถวจากหลังไปหน้า แต่ละแถวคือความสูง (จำนวนก้อน) ของกองจากซ้ายไปขวา
// วาดแบบเฉียง: หน้าลูกบาศก์เป็นสี่เหลี่ยมจัตุรัสจริง เห็นด้านบนและด้านขวา แถวหลังเลื่อนขึ้นไปทางขวา
const CUBE_FILL = { front: '#ffd27a', top: '#ffeec4', side: '#e9b04f' };
export const frontView = (rows) => rows[0].map((_, c) => Math.max(...rows.map((r) => r[c])));
export const topView = (rows) => rows.map((r) => r.map((h) => (h > 0 ? 1 : 0)));
export const cubeCount = (rows) => rows.flat().reduce((a, b) => a + b, 0);

function cubes(v) {
  const S = 34;
  const D = 15;
  const rows = v.rows;
  const R = rows.length;
  const C = rows[0].length;
  const H = Math.max(...rows.flat());
  const w = C * S + R * D + 8;
  const h = H * S + R * D + 8;
  const base = h - 4;
  const parts = [];
  for (let i = 0; i < R; i++) {          // แถวหลังก่อน (ถูกแถวหน้าทับ)
    const k = R - 1 - i;                 // ระยะลึก: แถวหน้า = 0
    for (let c = 0; c < C; c++) {
      for (let z = 0; z < rows[i][c]; z++) {
        const x = 4 + c * S + k * D;
        const y = base - (z + 1) * S - k * D;
        parts.push(`<path d="M${x} ${y}h${S}l${D} ${-D}h${-S}z" fill="${CUBE_FILL.top}"/>`
          + `<path d="M${x + S} ${y}l${D} ${-D}v${S}l${-D} ${D}z" fill="${CUBE_FILL.side}"/>`
          + `<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${CUBE_FILL.front}"/>`);
      }
    }
  }
  return `<figure class="lx-visual lx-cubes" aria-label="ลูกบาศก์วางซ้อนกัน">
    <svg viewBox="0 0 ${w} ${h}" stroke="#4a3b52" stroke-width="2" stroke-linejoin="round">${parts.join('')}</svg>
  </figure>`;
}

/** ตัวเลือก: ภาพที่เห็นเมื่อมองจากด้านหน้า (ความสูงแต่ละกองจากซ้ายไปขวา) */
function renderFront(cols) {
  const H = Math.max(...cols, 1);
  const cell = Math.min(84 / cols.length, 84 / H);
  const left = 50 - (cols.length * cell) / 2;
  const bottom = 50 + (H * cell) / 2;
  const squares = cols.flatMap((n, c) => Array.from({ length: n }, (_, z) => `<rect x="${left + c * cell}" y="${bottom - (z + 1) * cell}" width="${cell}" height="${cell}"/>`));
  return `<svg class="lx-figure lx-cubeview" viewBox="0 0 100 100" aria-hidden="true"><g fill="${CUBE_FILL.front}" stroke="#4a3b52" stroke-width="2.5">${squares.join('')}</g></svg>`;
}

/** ตัวเลือก: ภาพที่เห็นเมื่อมองจากด้านบน (แถวหลังอยู่บน แถวหน้าอยู่ล่าง) */
function renderTop(grid) {
  const R = grid.length;
  const C = grid[0].length;
  const cell = Math.min(84 / C, 84 / R);
  const left = 50 - (C * cell) / 2;
  const top = 50 - (R * cell) / 2;
  const squares = grid.flatMap((row, r) => row.map((on, c) => (on ? `<rect x="${left + c * cell}" y="${top + r * cell}" width="${cell}" height="${cell}"/>` : '')));
  return `<svg class="lx-figure lx-cubeview" viewBox="0 0 100 100" aria-hidden="true"><g fill="${CUBE_FILL.top}" stroke="#4a3b52" stroke-width="2.5">${squares.join('')}</g></svg>`;
}

export function renderOptionSvg(svg) {
  if (!svg) return '';
  if (svg.front) return renderFront(svg.front);
  if (svg.top) return renderTop(svg.top);
  if (svg.piece) return renderPiece(svg.piece);
  if (svg.fold) return renderFold(svg.fold);
  if (svg.cut) return renderCake(svg.cut);
  if (svg.figure) return renderFigure(svg.figure);
  if (svg.count) return renderCount(svg.count);
  if (svg.venn) return renderVenn(svg.venn);
  return '';
}

// กล่องซ้อน: แต่ละแถวตั้งวางจากพื้นขึ้นไป (นับกล่อง / มิติสัมพันธ์)
function stack(v) {
  const size = 44;
  const gap = 4;
  const height = Math.max(...v.columns) * size;
  const width = v.columns.length * (size + gap);
  const boxes = v.columns.flatMap((n, col) => Array.from({ length: n }, (_, row) => {
    const x = col * (size + gap) + 10;
    const y = height - (row + 1) * size + 10;
    return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="4" fill="#ffe3b3" stroke="#4a3b52" stroke-width="3"/>`
      + `<path d="M${x + 8} ${y + 10} h${size - 16}" stroke="#d9a860" stroke-width="3" stroke-linecap="round"/>`;
  })).join('');
  return `<figure class="lx-visual lx-stack" aria-label="กล่องซ้อนกัน">
    <svg viewBox="0 0 ${width + 16} ${height + 24}"><line x1="2" y1="${height + 11.5}" x2="${width + 14}" y2="${height + 11.5}" stroke="#4a3b52" stroke-width="3"/>${boxes}</svg>
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
    case 'row': return row(visual);
    case 'grid': return grid(visual);
    case 'board': return board(visual);
    case 'figure-row': return figureRow(visual);
    case 'figure-grid': return figureGrid(visual);
    case 'clock': return clock(visual);
    case 'table': return table(visual);
    case 'number-row': return numberRow(visual);
    case 'shape-count': return shapeCount(visual);
    case 'equivalence': return equivalence(visual);
    case 'scatter': return scatter(visual);
    case 'stack': return stack(visual);
    case 'jigsaw': return jigsaw(visual);
    case 'calendar': return calendar(visual);
    case 'distance': return distance(visual);
    case 'cubes': return cubes(visual);
    case 'labeled': return labeled(visual);
    default: return '';
  }
}
