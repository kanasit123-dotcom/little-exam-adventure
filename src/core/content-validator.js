import { SUBJECTS } from '../content/sets/index.js';

const TYPES = new Set(['main', 'transfer']);
const PROVENANCE = new Set(['original', 'official', 'third-party-practice']);
const VISUALS = new Set(['image', 'pictograph', 'compass-map', 'dice', 'polygon', 'row', 'clock', 'table', 'number-row', 'shape-count', 'equivalence', 'scatter', 'stack', 'grid', 'board', 'figure-row', 'figure-grid', 'jigsaw', 'calendar', 'distance', 'labeled', 'cubes']);
export const PIECE_CELLS = new Set(['tl', 'tr', 'bl', 'br']);
export const ARROWS = new Set(['up', 'right', 'down', 'left']);
export const HALVES = new Set(['tl', 'tr', 'br', 'bl']);
export const SHAPES = new Set(['circle', 'square', 'triangle', 'hexagon', 'diamond']);
export const FILLS = new Set(['empty', 'dots', 'solid']);
export const VENNS = new Set(['both', 'circle', 'square', 'none']);
export const CAKE_CUTS = new Set(['halves', 'uneven-halves', 'quarters', 'uneven-quarters', 'eighths', 'uneven-eighths']);
export const FOLD_SHAPES = new Set(['heart', 'crescent', 'lshape', 'star', 'circle', 'flag']);
const COUNT_SHAPES = new Set(['triangle', 'circle', 'square']);
const DIRECTIONS = ['north', 'east', 'south', 'west'];
const EXAM_FORBIDDEN = ['hint', 'hints', 'feedback', 'explanation', 'answer', 'solution'];

/**
 * ตรวจหนึ่งข้อ (รูปแบบการเขียนใน src/content/sets/set-XX.js)
 * assetIds: Set ของรหัสรูปที่มีจริง (ไม่ส่งมา = ไม่ตรวจ)
 */
export function validateItem(item, { assetIds } = {}) {
  const errors = [];
  const id = item?.id || '?';
  const fail = (message) => errors.push(`${id}: ${message}`);
  if (!item?.id) errors.push('missing id');
  if (!TYPES.has(item?.type)) fail('type must be main or transfer');
  if (!(item?.subject in SUBJECTS)) fail(`invalid subject ${item?.subject}`);
  if (!Array.isArray(item?.skillIds) || !item.skillIds.length) fail('needs skillIds');
  if (!item?.familyId) fail('needs familyId');
  if (![1, 2, 3].includes(item?.difficulty)) fail('difficulty must be 1-3');
  if (!item?.sourceId) fail('needs sourceId');
  if (!PROVENANCE.has(item?.provenance)) fail('invalid provenance');
  if (!item?.rights) fail('needs rights note');
  if (!item?.reviewStatus) fail('needs reviewStatus');
  if (!item?.narration) fail('needs narration policy');
  if (!item?.prompt?.text) fail('missing prompt text');
  for (const key of EXAM_FORBIDDEN) if (item && key in item) fail(`${key} must stay inside review`);

  const options = item?.options || [];
  if (options.length < 2 || options.length > 4) fail('needs 2-4 options');
  const optionIds = new Set(options.map((option) => option.id));
  if (optionIds.size !== options.length) fail('duplicate option id');
  if (!optionIds.has(item?.correctOptionId)) fail('correct option is absent');
  const looks = options.map((option) => JSON.stringify([option.text, option.image, option.svg]));
  if (new Set(looks).size !== looks.length) fail('options look the same');
  for (const option of options) {
    if (!option.text && !option.image && !option.svg) fail(`option ${option.id} shows nothing`);
    if (option.image && assetIds && !assetIds.has(option.image)) fail(`unknown asset ${option.image}`);
    if (option.svg && !validSvg(option.svg, assetIds)) fail(`option ${option.id} has an unknown drawing`);
  }

  if (item?.visual) errors.push(...validateVisual(item.visual, assetIds).map((message) => `${id}: ${message}`));

  const review = item?.review;
  if (!review?.summary) fail('review needs a summary');
  if (!Array.isArray(review?.steps) || review.steps.length < 2) fail('review needs at least two steps');
  if (!Array.isArray(review?.hints)) fail('review needs a hints array');
  if (review?.column) {
    const { a, op, b } = review.column;
    const ok = [a, b].every((n) => Number.isInteger(n) && n >= 0 && n <= 99) && ['+', '-'].includes(op) && (op === '+' ? a + b <= 99 : a >= b);
    if (!ok) fail('column problem must be + or - within 0-99');
  }
  return errors;
}

function validSvg(svg, assetIds) {
  if (svg.count) return validCount(svg.count, assetIds);
  if (svg.venn) return VENNS.has(svg.venn);
  if (svg.swatch) return /^#[0-9a-f]{6}$/i.test(svg.swatch);
  if (svg.fold) return FOLD_SHAPES.has(svg.fold);
  if (svg.cut) return CAKE_CUTS.has(svg.cut);
  if (svg.figure) return validFigure(svg.figure);
  if (svg.piece) return !!svg.piece && typeof svg.piece.asset === 'string' && (!assetIds || assetIds.has(svg.piece.asset)) && PIECE_CELLS.has(svg.piece.cell);
  if (svg.front) return Array.isArray(svg.front) && svg.front.length >= 1 && svg.front.length <= 4 && svg.front.every((n) => Number.isInteger(n) && n >= 0 && n <= 4) && svg.front.some((n) => n > 0);
  if (svg.top) return validTopGrid(svg.top);
  return false;
}

/** ภาพมองจากด้านบน: 1-3 แถว แถวละ 1-4 ช่อง ค่า 0/1 มีอย่างน้อยหนึ่งช่อง */
function validTopGrid(grid) {
  return Array.isArray(grid) && grid.length >= 1 && grid.length <= 3 && grid.every((r) => Array.isArray(r) && r.length === grid[0].length && r.length >= 1 && r.length <= 4 && r.every((x) => x === 0 || x === 1)) && grid.flat().includes(1);
}

/** ตัวเลือกแบบ "กี่ชิ้น": รูปเดียวกันซ้ำ n ชิ้น (n = 1-10) ให้เด็กนับเอง */
function validCount(c, assetIds) {
  return !!c && typeof c.asset === 'string' && (!assetIds || assetIds.has(c.asset)) && Number.isInteger(c.n) && c.n >= 1 && c.n <= 10;
}

/** รูปเรขาคณิตที่วาดด้วยโค้ด (โจทย์ภาพต่อเนื่อง): วงแปดช่องระบาย 1 ช่อง, ลูกศร, จุด */
export function validFigure(f) {
  if (!f || typeof f !== 'object') return false;
  const keys = Object.keys(f);
  if ('shape' in f) return SHAPES.has(f.shape) && keys.every((k) => k === 'shape' || k === 'fill') && (f.fill === undefined || FILLS.has(f.fill));
  if (keys.length !== 1) return false;
  if ('half' in f) return HALVES.has(f.half);
  if ('wheel' in f) return Number.isInteger(f.wheel) && f.wheel >= 0 && f.wheel <= 7;
  if ('arrow' in f) return ARROWS.has(f.arrow);
  if ('dots' in f) return Number.isInteger(f.dots) && f.dots >= 1 && f.dots <= 9;
  return false;
}

/** ภาพประกอบโจทย์ที่วาดด้วยโค้ด (src/visuals/svg.js) หรือรูปจากทะเบียน */
export function validateVisual(visual, assetIds) {
  const errors = [];
  const known = (asset) => !assetIds || assetIds.has(asset);
  if (!VISUALS.has(visual.type)) return [`unknown visual ${visual.type}`];
  if (visual.type === 'image' && !known(visual.asset)) errors.push(`unknown asset ${visual.asset}`);
  if (visual.type === 'pictograph') {
    if (!known(visual.icon) || !Number.isInteger(visual.unit) || !visual.unitWord) errors.push('pictograph needs icon, unit and unitWord');
    if (!visual.rows?.length || !visual.rows.every((row) => row.label && known(row.asset) && Number.isInteger(row.count) && row.count > 0 && row.count <= 8)) errors.push('pictograph rows need label, asset and count 1-8');
  }
  if (visual.type === 'compass-map' && (!visual.center || !DIRECTIONS.every((d) => visual.places?.[d]))) errors.push('compass-map needs center and 4 places');
  if (visual.type === 'dice' && !(Number.isInteger(visual.face) && visual.face >= 1 && visual.face <= 6)) errors.push('dice face must be 1-6');
  if (visual.type === 'polygon' && !(Number.isInteger(visual.sides) && visual.sides >= 3 && visual.sides <= 8)) errors.push('polygon sides must be 3-8');
  if (visual.type === 'row' && !(Array.isArray(visual.items) && visual.items.length >= 2 && visual.items.length <= 6 && visual.items.filter((x) => x === '?').length <= 1 && visual.items.every((x) => x === '?' || known(x)) && ['labels', 'sides'].every((k) => visual[k] === undefined || typeof visual[k] === 'boolean'))) errors.push('row needs 2-6 known pictures (at most one ?)');
  if (visual.type === 'grid' && !(Array.isArray(visual.rows) && visual.rows.length >= 2 && visual.rows.length <= 3 && visual.rows.every((r) => Array.isArray(r) && r.length === visual.rows[0].length && r.length >= 2 && r.length <= 3 && r.every(known)))) errors.push('grid needs 2-3 rows of 2-3 known pictures');
  if (visual.type === 'board' && !(Array.isArray(visual.items) && visual.items.length >= 6 && visual.items.length <= 12 && new Set(visual.items).size === visual.items.length && visual.items.every(known))) errors.push('board needs 6-12 different known pictures');
  if (visual.type === 'figure-row' && !(Array.isArray(visual.items) && visual.items.length >= 3 && visual.items.length <= 5 && visual.items.filter((x) => x === '?').length === 1 && visual.items.every((x) => x === '?' || validFigure(x)))) errors.push('figure-row needs 3-5 figures with exactly one ?');
  if (visual.type === 'figure-grid' && !(Array.isArray(visual.rows) && visual.rows.length >= 2 && visual.rows.length <= 3 && visual.rows.every((r) => Array.isArray(r) && r.length === visual.rows[0].length && r.length >= 2 && r.length <= 3) && visual.rows.flat().filter((x) => x === '?').length === 1 && visual.rows.flat().every((x) => x === '?' || validFigure(x)))) errors.push('figure-grid needs 2-3 rows of 2-3 figures with exactly one ?');
  if (visual.type === 'jigsaw' && !(known(visual.asset) && PIECE_CELLS.has(visual.missing))) errors.push('jigsaw needs a known picture and a missing cell tl, tr, bl or br');
  if (visual.type === 'calendar' && !(visual.month && Number.isInteger(visual.start) && visual.start >= 0 && visual.start <= 6 && Number.isInteger(visual.days) && visual.days >= 28 && visual.days <= 31
    && Math.ceil((visual.start + visual.days) / 7) <= 5 && (visual.marks || []).every((d) => Number.isInteger(d) && d >= 1 && d <= visual.days))) errors.push('calendar needs month, start 0-6, days 28-31, at most 5 weeks and marks inside the month');
  // ลูกบาศก์: แถวจากหลังไปหน้า 1-3 แถว แถวละ 1-4 กอง สูง 0-3 ก้อน; กองแถวหลังต้องไม่เตี้ยกว่าแถวหน้า (ไม่มีก้อนถูกบังจนมองไม่เห็นทั้งก้อน)
  // และไม่มีคอลัมน์หรือแถวที่ว่างทั้งเส้น (ภาพมองจากด้านหน้า/บนจะได้ไม่มีช่องว่างหลอกตา)
  if (visual.type === 'cubes') {
    const rows = visual.rows;
    const shape = Array.isArray(rows) && rows.length >= 1 && rows.length <= 3 && rows.every((r) => Array.isArray(r) && r.length === rows[0].length && r.length >= 1 && r.length <= 4 && r.every((n) => Number.isInteger(n) && n >= 0 && n <= 3));
    if (!shape) errors.push('cubes needs 1-3 rows of 1-4 stacks, each 0-3 cubes high');
    else {
      if (rows.some((r, i) => i > 0 && r.some((n, c) => n > rows[i - 1][c]))) errors.push('cubes: a stack in a front row may not be taller than the stack behind it');
      if (rows[0].some((_, c) => rows.every((r) => r[c] === 0)) || rows.some((r) => r.every((n) => n === 0))) errors.push('cubes: no empty column or row');
    }
  }
  if (visual.type === 'labeled' && !(known(visual.asset) && Array.isArray(visual.marks) && visual.marks.length >= 2 && visual.marks.length <= 8
    && visual.marks.every((m) => Number.isInteger(m.n) && m.n >= 1 && m.n <= 9 && typeof m.x === 'number' && m.x >= 0 && m.x <= 100 && typeof m.y === 'number' && m.y >= 0 && m.y <= 100
      && (m.lx === undefined ? m.ly === undefined : typeof m.lx === 'number' && m.lx >= 0 && m.lx <= 100 && typeof m.ly === 'number' && m.ly >= 0 && m.ly <= 100))
    && new Set(visual.marks.map((m) => m.n)).size === visual.marks.length)) errors.push('labeled needs a known picture and 2-8 marks with different numbers 1-9, x, y (and optional lx, ly together) in 0-100');
  if (visual.type === 'distance' && !(Array.isArray(visual.items) && visual.items.length >= 3 && visual.items.length <= 4 && visual.items.every((i) => known(i.asset) && typeof i.size === 'number' && i.size >= 0.2 && i.size <= 1)
    && new Set(visual.items.map((i) => i.size)).size === visual.items.length)) errors.push('distance needs 3-4 items with a known picture and different sizes 0.2-1');
  if (visual.type === 'clock' && !(Number.isInteger(visual.hour) && visual.hour >= 1 && visual.hour <= 12 && [0, 30].includes(visual.minute))) errors.push('clock needs hour 1-12 and minute 0 or 30');
  if (visual.type === 'table' && !(visual.unit && Array.isArray(visual.rows) && visual.rows.length >= 2 && visual.rows.length <= 5 && visual.rows.every((r) => r.name && Number.isInteger(r.count) && r.count >= 0 && r.count <= 99))) errors.push('table needs a unit and 2-5 rows of name and count 0-99');
  if (visual.type === 'number-row' && !(Array.isArray(visual.items) && visual.items.length >= 3 && visual.items.length <= 7 && visual.items.filter((x) => x === '?').length === 1 && visual.items.every((x) => x === '?' || Number.isInteger(x)))) errors.push('number-row needs 3-7 numbers with exactly one ?');
  if (visual.type === 'shape-count' && !(Array.isArray(visual.shapes) && visual.shapes.length >= 3 && visual.shapes.length <= 9 && visual.shapes.every((s) => COUNT_SHAPES.has(s)))) errors.push('shape-count needs 3-9 triangle/circle/square');
  if (visual.type === 'equivalence' && !(Array.isArray(visual.rows) && visual.rows.length >= 1 && visual.rows.length <= 3 && visual.rows.every((r) => known(r.left) && known(r.right) && Number.isInteger(r.count) && r.count >= 1 && r.count <= 6))) errors.push('equivalence rows need left, right and count 1-6');
  if (visual.type === 'scatter' && !(Array.isArray(visual.items) && visual.items.length >= 2 && visual.items.length <= 4 && visual.items.every((i) => known(i.asset) && Number.isInteger(i.count) && i.count >= 1) && visual.items.reduce((n, i) => n + i.count, 0) <= 16)) errors.push('scatter needs 2-4 kinds and at most 16 pictures');
  if (visual.type === 'stack' && !(Array.isArray(visual.columns) && visual.columns.length >= 1 && visual.columns.length <= 5 && visual.columns.every((n) => Number.isInteger(n) && n >= 1 && n <= 5))) errors.push('stack needs 1-5 columns of 1-5 boxes');
  return errors;
}

/** ตรวจทั้งชุด: รหัสไม่ซ้ำ ลำดับข้อหลักถูกต้อง โจทย์ลองใหม่ต่อกับข้อหลักได้ */
export function validateSet(set, options = {}) {
  const errors = [];
  if (!set?.id || !Number.isInteger(set?.version) || !set?.title) errors.push('set needs id, version and title');
  if (set?.note != null && (typeof set.note !== 'string' || set.note.length > 60)) errors.push('set note must be a short text');
  const items = set?.items || [];
  const byId = new Map();
  for (const item of items) {
    if (byId.has(item.id)) errors.push(`duplicate item id: ${item.id}`);
    byId.set(item.id, item);
    errors.push(...validateItem(item, options));
  }
  for (const [sid, stimulus] of Object.entries(set?.stimuli || {})) {
    if (!stimulus.section || !stimulus.text) errors.push(`stimulus ${sid} needs section and text`);
    if (stimulus.visual) errors.push(...validateVisual(stimulus.visual, options.assetIds).map((message) => `stimulus ${sid}: ${message}`));
  }
  for (const item of items) {
    if (item.stimulus && !set.stimuli?.[item.stimulus]) errors.push(`${item.id}: stimulus ${item.stimulus} is missing`);
    if (item.stimulus && item.type !== 'main') errors.push(`${item.id}: only main items share a stimulus`);
  }
  const order = set?.order || [];
  if (!order.length) errors.push('set order is empty');
  // ข้อที่ใช้เรื่องเดียวกันต้องอยู่ติดกัน
  const seenGroups = new Set();
  order.forEach((id, index) => {
    const group = byId.get(id)?.stimulus;
    if (!group) return;
    if (seenGroups.has(group) && byId.get(order[index - 1])?.stimulus !== group) errors.push(`items of stimulus ${group} are not next to each other`);
    seenGroups.add(group);
  });
  if (new Set(order).size !== order.length) errors.push('set order repeats an item');
  for (const id of order) {
    const item = byId.get(id);
    if (!item) errors.push(`order refers to missing item ${id}`);
    else if (item.type !== 'main') errors.push(`order item ${id} is not a main item`);
  }
  const transferUse = new Set();
  for (const item of items) {
    for (const tid of item.review?.transferIds || []) {
      const transfer = byId.get(tid);
      if (!transfer) errors.push(`${item.id}: transfer ${tid} is missing`);
      else if (transfer.type !== 'transfer') errors.push(`${item.id}: ${tid} is not a transfer item`);
      else if (!transfer.skillIds.some((skill) => item.skillIds.includes(skill))) errors.push(`${item.id}: transfer ${tid} teaches a different skill`);
      else if (transfer.prompt.text === item.prompt.text && JSON.stringify(transfer.visual) === JSON.stringify(item.visual) && JSON.stringify(transfer.options) === JSON.stringify(item.options)) errors.push(`${item.id}: transfer ${tid} repeats the same problem`);
      transferUse.add(tid);
    }
  }
  for (const item of items) {
    if (item.type === 'transfer' && !transferUse.has(item.id)) errors.push(`transfer ${item.id} is not linked from any main item`);
  }
  return { ok: errors.length === 0, errors };
}
