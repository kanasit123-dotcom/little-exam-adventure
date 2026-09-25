/*
 * รายการประโยคทั้งหมดที่เกมอาจพูด — ใช้ทั้งตอนสร้างเสียง (scripts/voice-texts.mjs) และใน test ความครบของเสียง
 * ถ้าเพิ่มชุดใหม่ใน sets/index.js ประโยคของชุดนั้นจะถูกรวมเองอัตโนมัติ
 */
import { SETS, promptSpeech, optionSpeech, stimulusSpeech, sectionOf } from './sets/index.js';
import { copySpeeches } from './copy.js';
import { columnSpeeches } from '../review/column-steps.js';

export function itemSpeeches(set, item) {
  const out = [sectionOf(set, item), promptSpeech(item), ...item.options.map((option, index) => optionSpeech(option, index))];
  const review = item.review;
  out.push(review.summary, ...review.hints, ...review.steps);
  if (review.column) out.push(...columnSpeeches(review.column));
  return out;
}

export function allSpeeches() {
  const texts = new Set(copySpeeches());
  for (const set of SETS) {
    for (const stimulus of Object.values(set.stimuli || {})) texts.add(stimulusSpeech(stimulus));
    for (const item of set.items) for (const text of itemSpeeches(set, item)) texts.add(text);
  }
  return [...texts].sort();
}
