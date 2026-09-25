import { SUBJECTS } from '../content/sets/index.js';

const TYPES = new Set(['main', 'transfer']);
const PROVENANCE = new Set(['original', 'official', 'third-party-practice']);
const VISUALS = new Set(['image', 'pictograph', 'compass-map', 'dice', 'polygon']);
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
    if (option.svg && !validSvg(option.svg)) fail(`option ${option.id} has an unknown drawing`);
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

function validSvg(svg) {
  if (svg.swatch) return /^#[0-9a-f]{6}$/i.test(svg.swatch);
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
  return errors;
}

/** ตรวจทั้งชุด: รหัสไม่ซ้ำ ลำดับข้อหลักถูกต้อง โจทย์ลองใหม่ต่อกับข้อหลักได้ */
export function validateSet(set, options = {}) {
  const errors = [];
  if (!set?.id || !Number.isInteger(set?.version) || !set?.title) errors.push('set needs id, version and title');
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
      else if (transfer.prompt.text === item.prompt.text && JSON.stringify(transfer.visual) === JSON.stringify(item.visual)) errors.push(`${item.id}: transfer ${tid} repeats the same problem`);
      transferUse.add(tid);
    }
  }
  for (const item of items) {
    if (item.type === 'transfer' && !transferUse.has(item.id)) errors.push(`transfer ${item.id} is not linked from any main item`);
  }
  return { ok: errors.length === 0, errors };
}
