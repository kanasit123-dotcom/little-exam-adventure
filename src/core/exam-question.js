/*
 * ข้อมูลที่หน้าทำข้อสอบได้รับ — เลือกเฉพาะฟิลด์ที่อนุญาต (allow-list) ทีละฟิลด์
 * ไม่มี correctOptionId, review, เฉลย, คำใบ้ หรือโจทย์ตั้งเลข หลุดเข้าไปใน DOM / aria / data-*
 * (กันการเผลอแสดงเฉลย ไม่ใช่การเข้ารหัส: เว็บ static ดาวน์โหลดเนื้อหาทั้งหมดอยู่แล้ว)
 */
import { OPTION_LABELS, SUBJECTS, promptSpeech, optionSpeech, sectionOf, stimulusOf, stimulusSpeech } from '../content/sets/index.js';

/** คัดลอกภาพประกอบทีละชนิด (ภาพเหล่านี้ไม่มีเฉลยอยู่แล้ว แต่ไม่ส่งฟิลด์ที่ไม่รู้จักต่อ) */
export function copyVisual(visual) {
  if (!visual) return null;
  switch (visual.type) {
    case 'image': return { type: 'image', asset: visual.asset };
    case 'pictograph': return {
      type: 'pictograph', icon: visual.icon, unit: visual.unit, unitWord: visual.unitWord,
      rows: visual.rows.map((row) => ({ asset: row.asset, label: row.label, count: row.count })),
    };
    case 'compass-map': return { type: 'compass-map', center: visual.center, places: { ...visual.places } };
    case 'dice': return { type: 'dice', face: visual.face };
    case 'polygon': return { type: 'polygon', sides: visual.sides };
    case 'row': return { type: 'row', items: visual.items.slice() };
    case 'clock': return { type: 'clock', hour: visual.hour, minute: visual.minute };
    case 'table': return { type: 'table', unit: visual.unit, rows: visual.rows.map((r) => ({ name: r.name, count: r.count })) };
    case 'number-row': return { type: 'number-row', items: visual.items.slice() };
    case 'shape-count': return { type: 'shape-count', shapes: visual.shapes.slice() };
    default: return null;
  }
}

/**
 * set: ชุดข้อสอบ, item: ข้อ, order: ลำดับตัวเลือกที่บันทึกใน session (รหัสตัวเลือก)
 * key ของตัวเลือกคือรหัสตัวเลือก (a/b/c) ไว้บันทึกคำตอบ ไม่ได้บอกว่าข้อไหนถูก
 */
export function toExamQuestion(set, item, order = item.options.map((option) => option.id)) {
  const stimulus = stimulusOf(set, item);
  const options = order.map((id, index) => {
    const option = item.options.find((o) => o.id === id);
    return {
      key: id,
      label: OPTION_LABELS[index],
      text: option.text || null,
      image: option.image || null,
      svg: option.svg?.fold ? { fold: option.svg.fold } : null,
      speech: optionSpeech(option, index),
    };
  });
  return {
    id: item.id,
    subject: item.subject,
    subjectName: SUBJECTS[item.subject],
    section: sectionOf(set, item),
    stimulus: stimulus ? { id: item.stimulus, text: stimulus.text, speech: stimulusSpeech(stimulus), visual: copyVisual(stimulus.visual) } : null,
    promptText: item.prompt.text,
    promptSpeech: promptSpeech(item),
    visual: copyVisual(item.visual),
    options,
  };
}
