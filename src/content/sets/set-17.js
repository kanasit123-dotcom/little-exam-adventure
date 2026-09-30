/*
 * ชุดที่ 17 — เรียงลำดับเหตุการณ์ (แผ่นรูป H: design/PROMPTS-gemini-8.md) แบบใหม่ 15 ข้อ
 * ภาพเรื่องราว 4 ภาพถูกสลับที่และติดป้าย ก ข ค ง แล้วถามหลายข้อจากภาพชุดเดียว:
 * เรียงลำดับ / ภาพแรก / ภาพสุดท้าย / ภาพที่เท่าไร / ภาพตรงกับประโยคใด
 * ปลูกต้นไม้ 5 ข้อ, แปรงฟัน 5 ข้อ, ทำแซนด์วิช 2 ข้อ, ข้ามถนน 2 ข้อ, ข้อเดี่ยว 1 ข้อ
 * แต่งใหม่ทั้งหมด; ลำดับที่ถูกและป้ายภาพคำนวณจากรายการสลับที่ (shuffle) ด้วยฟังก์ชันด้านล่าง จึงไม่พลาดเมื่อเปลี่ยนการสลับ
 */
const R = { provenance: 'original', rights: 'แต่งใหม่ทั้งหมด (ข้อความ ตัวเลข ภาพ) เผยแพร่ใน repo นี้ได้', reviewStatus: 'draft' };
const SRC = 'src-a24-compilation';
const SEQ = 'เรียงลำดับเหตุการณ์ให้ถูกต้อง';

// ---------------------------------------------------------------- ตัวช่วย
const LABELS = ['ก', 'ข', 'ค', 'ง'];
const SAID = { ก: 'กอ', ข: 'ขอ', ค: 'คอ', ง: 'งอ' };
/** อ่านป้ายภาพ ก ข ค ง เป็นชื่อพยัญชนะ (เหมือนชุด 5) */
const speak = (text) => text.replace(/(^|\s)([กขคง])(?=\s|$)/g, (m, space, c) => `${space}${SAID[c]}`);
/** ภาพสี่ภาพที่สลับที่: shuffle[i] = ลำดับเหตุการณ์จริง (1-4) ของภาพที่ติดป้ายตัวที่ i */
const panels = (kind, shuffle) => ({ type: 'row', labels: true, items: shuffle.map((n) => `pic-seq-${kind}-${n}`) });
/** ป้ายของภาพที่เป็นเหตุการณ์ลำดับที่ step */
const lab = (shuffle, step) => LABELS[shuffle.indexOf(step)];
/** ป้ายเรียงตามลำดับเหตุการณ์ที่ระบุ เช่น [1,2,3,4] = ลำดับที่ถูก */
const order = (shuffle, steps = [1, 2, 3, 4]) => steps.map((step) => lab(shuffle, step)).join(' ');
const opt = (id, text) => ({ id, text, speech: speak(text) });
/** ตัวเลือกเรียงลำดับ: ข้อถูก / ย้อนกลับทั้งหมด / เอาภาพสุดท้ายขึ้นก่อน (ผิดชัดเจนทั้งสองแบบ) วางตามตำแหน่งที่ต้องการ (1-3) */
const orderOptions = (shuffle, correctPosition) => {
  const wrong = [order(shuffle, [4, 3, 2, 1]), order(shuffle, [4, 1, 2, 3])];
  const texts = [...wrong];
  texts.splice(correctPosition - 1, 0, order(shuffle));
  return texts.map((text, i) => opt('abc'[i], text));
};
const labelOptions = (labels) => labels.map((l, i) => opt('abc'[i], `ภาพ ${l}`));
const stimulusFor = (shuffle) => ({
  section: SEQ,
  textHidden: true,   // ข้อความนี้อ่านออกเสียงอย่างเดียว ไม่แสดงเป็นแถบเรื่อง (ให้ภาพใหญ่ขึ้น)
  text: 'ภาพเหตุการณ์ 4 ภาพ ติดป้ายกำกับ ก ข ค ง ดูภาพทั้งหมดแล้วตอบคำถาม',
  speech: 'ภาพเหตุการณ์ 4 ภาพ ติดป้ายกำกับ กอ ขอ คอ งอ ดูภาพทั้งหมดแล้วตอบคำถาม',
  visual: panels(shuffle.kind, shuffle.list),
});

// การสลับที่ของแต่ละเรื่อง (ข้อหลัก) และของโจทย์ลองใหม่
const SA = [3, 1, 4, 2];   // ปลูกต้นไม้: ก=รดน้ำ ข=ขุดดิน ค=ต้นอ่อน ง=ใส่เมล็ด
const SB = [4, 2, 1, 3];   // แปรงฟัน: ก=ยิ้มหน้ากระจก ข=แปรงฟัน ค=บีบยาสีฟัน ง=บ้วนปาก
const SC = [2, 4, 1, 3];   // ทำแซนด์วิช: ก=ทาแยม ข=กิน ค=ขนมปังบนจาน ง=ประกบเป็นแซนด์วิช
const SD = [3, 4, 1, 2];   // ข้ามถนน: ก=รถหยุด ข=เดินข้าม ค=รอที่ไฟแดง ง=มองซ้ายขวา

export default {
  id: 'set-17',
  version: 1,
  title: 'ชุดที่ 17',
  note: 'เรียงลำดับเหตุการณ์ ปลูกต้นไม้ แปรงฟัน แซนด์วิช ข้ามถนน',
  order: [
    'r-plant-order', 'r-seq-plant-first', 'th-plant-caption', 'sc-plant-sprout', 'm-plant-ordinal',
    'r-teeth-order', 'r-teeth-last', 'g-teeth-rinse', 'th-teeth-caption', 'm-teeth-ordinal',
    'r-sandwich-order', 'th-sandwich-caption', 'r-road-order', 'sp-road-left', 'g-walk-pavement',
  ],
  stimuli: {
    plant: stimulusFor({ kind: 'plant', list: SA }),
    teeth: stimulusFor({ kind: 'teeth', list: SB }),
    sandwich: stimulusFor({ kind: 'sandwich', list: SC }),
    road: stimulusFor({ kind: 'road', list: SD }),
  },
  items: [
    // ================================================================ ช่วงที่ 1: ปลูกต้นไม้
    {
      id: 'r-plant-order', compact: true, type: 'main', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, stimulus: 'plant',
      prompt: { text: 'ข้อใดเรียงลำดับเหตุการณ์ปลูกต้นไม้ได้ถูกต้อง' },
      options: orderOptions(SA, 2),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ (เป็นชื่อป้ายภาพ) เด็กต้องดูภาพและเรียงลำดับเอง',
      review: {
        summary: 'ขุดดิน ใส่เมล็ด รดน้ำ แล้วต้นอ่อนงอก เรียงได้ ข ง ก ค',
        hints: ['ต้องมีหลุมก่อนจึงใส่เมล็ดได้ และรดน้ำหลังใส่เมล็ด'],
        steps: ['ภาพ ข ขุดดินเป็นภาพแรก ภาพ ง ใส่เมล็ดลงไปในดิน', 'ภาพ ก รดน้ำ แล้วภาพ ค ต้นอ่อนงอกเป็นภาพสุดท้าย เรียงได้ ข ง ก ค ตอบข้อ 2'],
        transferIds: ['r-sandwich-order-t'],
      },
    },
    {
      id: 'r-seq-plant-first', compact: true, type: 'main', subject: 'reasoning', skillIds: ['sequence-first'], familyId: 'sequence-first', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'plant',
      prompt: { text: 'ภาพใดเกิดขึ้นเป็นภาพแรก', speech: 'ภาพใดเกิดขึ้นเป็นภาพแรก' },
      options: labelOptions([lab(SA, 1), lab(SA, 3), lab(SA, 4)]),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ เด็กต้องดูภาพแล้วหาภาพที่เกิดก่อน',
      review: {
        summary: 'ภาพ ข ขุดดิน เกิดก่อนภาพอื่น',
        hints: ['ภาพไหนยังไม่มีเมล็ดและยังไม่มีน้ำ'],
        steps: ['ภาพ ข เด็กหญิงขุดดิน ยังไม่มีเมล็ด เป็นภาพแรก', 'ภาพ ก ภาพ ค และภาพ ง เกิดหลังจากนั้น ตอบข้อ 1'],
        transferIds: ['r-teeth-first-t'],
      },
    },
    {
      id: 'th-plant-caption', type: 'main', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'plant',
      prompt: { text: `ภาพ ${lab(SA, 3)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab(SA, 3)} ตรงกับประโยคใด`) },
      options: [{ id: 'a', text: 'เด็กหญิงขุดดินในกระถาง' }, { id: 'b', text: 'เด็กหญิงรดน้ำต้นไม้' }, { id: 'c', text: 'เด็กหญิงใส่เมล็ดลงไปในดิน' }],
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้ วัดการจับคู่ภาพกับประโยค',
      review: {
        summary: 'ภาพ ก เด็กหญิงถือบัวรดน้ำ',
        hints: ['ดูว่าเด็กหญิงถืออะไรอยู่ในภาพ'],
        steps: ['ภาพ ก เด็กหญิงถือบัวรดน้ำ มีน้ำไหลลงดิน', 'จึงตรงกับประโยค เด็กหญิงรดน้ำต้นไม้ ตอบข้อ 2'],
        transferIds: ['th-sandwich-caption-t'],
      },
    },
    {
      id: 'sc-plant-sprout', type: 'main', subject: 'science', skillIds: ['plant-parts'], familyId: 'plant-parts', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'plant',
      prompt: { text: `ต้นไม้เล็กๆ ที่งอกจากเมล็ดในภาพ ${lab(SA, 4)} เรียกว่าอะไร`, speech: speak(`ต้นไม้เล็กๆ ที่งอกจากเมล็ดในภาพ ${lab(SA, 4)} เรียกว่าอะไร`) },
      options: [{ id: 'a', text: 'ต้นอ่อน' }, { id: 'b', text: 'ผลไม้' }, { id: 'c', text: 'ก้อนหิน' }],
      correctOptionId: 'a',
      narration: 'ฟังตัวเลือกได้ วัดความรู้เรื่องส่วนของพืช',
      review: {
        summary: 'พืชที่เพิ่งงอกจากเมล็ดเรียกว่าต้นอ่อน',
        hints: ['ต้นไม้ที่เพิ่งเริ่มโต มีใบเล็กๆ'],
        steps: ['เมล็ดที่ได้น้ำจะงอกเป็นต้นเล็กๆ มีใบอ่อน', 'เรียกว่าต้นอ่อน ตอบข้อ 1'],
        transferIds: ['sc-root-t'],
      },
    },
    {
      id: 'm-plant-ordinal', compact: true, type: 'main', subject: 'math', skillIds: ['ordinal-number'], familyId: 'sequence-ordinal', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'plant',
      prompt: { text: `ภาพ ${lab(SA, 3)} เป็นภาพที่เท่าไรของเรื่อง`, speech: speak(`ภาพ ${lab(SA, 3)} เป็นภาพที่เท่าไรของเรื่อง`) },
      options: [{ id: 'a', text: 'ภาพที่ 2' }, { id: 'b', text: 'ภาพที่ 3' }, { id: 'c', text: 'ภาพที่ 4' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดลำดับที่จากการเรียงเหตุการณ์',
      review: {
        summary: 'ภาพ ก รดน้ำ เป็นภาพที่ 3',
        hints: ['เรียงเหตุการณ์ก่อน แล้วนับว่าภาพ ก อยู่ลำดับที่เท่าไร'],
        steps: ['เรียงได้ ข ง ก ค นับ ข หนึ่ง ง สอง ก สาม ค สี่', 'ภาพ ก เป็นภาพที่ 3 ตอบข้อ 2'],
        transferIds: ['m-teeth-ordinal-t'],
      },
    },

    // ================================================================ ช่วงที่ 2: แปรงฟัน
    {
      id: 'r-teeth-order', compact: true, type: 'main', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, stimulus: 'teeth',
      prompt: { text: 'ข้อใดเรียงลำดับเหตุการณ์แปรงฟันได้ถูกต้อง' },
      options: orderOptions(SB, 3),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ (เป็นชื่อป้ายภาพ) เด็กต้องดูภาพและเรียงลำดับเอง',
      review: {
        summary: 'บีบยาสีฟัน แปรงฟัน บ้วนปาก แล้วยิ้มฟันสะอาด เรียงได้ ค ข ง ก',
        hints: ['ต้องบีบยาสีฟันก่อนแปรง และบ้วนปากหลังแปรง'],
        steps: ['ภาพ ค บีบยาสีฟันเป็นภาพแรก ภาพ ข แปรงฟัน', 'ภาพ ง บ้วนปาก แล้วภาพ ก ยิ้มให้ฟันสะอาดเป็นภาพสุดท้าย เรียงได้ ค ข ง ก ตอบข้อ 3'],
        transferIds: ['r-road-order-t'],
      },
    },
    {
      id: 'r-teeth-last', compact: true, type: 'main', subject: 'reasoning', skillIds: ['sequence-last'], familyId: 'sequence-last', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'teeth',
      prompt: { text: 'ภาพใดเกิดขึ้นเป็นภาพสุดท้าย', speech: 'ภาพใดเกิดขึ้นเป็นภาพสุดท้าย' },
      options: labelOptions([lab(SB, 2), lab(SB, 4), lab(SB, 1)]),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ เด็กต้องดูภาพแล้วหาภาพที่เกิดหลังสุด',
      review: {
        summary: 'ภาพ ก ยิ้มฟันสะอาด เกิดหลังสุด',
        hints: ['ภาพไหนแปรงฟันเสร็จแล้ว ฟันสะอาดแล้ว'],
        steps: ['ภาพ ก เด็กหญิงยิ้มหน้ากระจก ฟันสะอาดแล้ว เป็นภาพสุดท้าย', 'ภาพ ข และภาพ ค ยังไม่เสร็จ ตอบข้อ 2'],
        transferIds: ['r-plant-last-t'],
      },
    },
    {
      id: 'g-teeth-rinse', type: 'main', subject: 'general', skillIds: ['hygiene-reason'], familyId: 'hygiene-reason', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'teeth',
      prompt: { text: 'ทำไมเด็กหญิงจึงต้องบ้วนปากหลังแปรงฟัน' },
      options: [{ id: 'a', text: 'เพื่อล้างฟองยาสีฟันออกจากปาก' }, { id: 'b', text: 'เพื่อให้ฟันเปื้อน' }, { id: 'c', text: 'เพราะอยากเล่นน้ำ' }],
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องสุขอนามัยและเหตุผล',
      review: {
        summary: 'น้ำช่วยล้างฟองยาสีฟันและเศษอาหารออกไป',
        hints: ['ตอนแปรงฟันมีอะไรเต็มปาก'],
        steps: ['ตอนแปรงฟัน ในปากมีฟองยาสีฟัน ไม่ควรกลืน', 'จึงต้องบ้วนปากล้างฟองออก ตอบข้อ 1'],
        transferIds: ['g-bath-t'],
      },
    },
    {
      id: 'th-teeth-caption', type: 'main', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'teeth',
      prompt: { text: `ภาพ ${lab(SB, 1)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab(SB, 1)} ตรงกับประโยคใด`) },
      options: [{ id: 'a', text: 'เด็กหญิงบ้วนปาก' }, { id: 'b', text: 'เด็กหญิงแปรงฟัน' }, { id: 'c', text: 'เด็กหญิงบีบยาสีฟัน' }],
      correctOptionId: 'c',
      narration: 'ฟังตัวเลือกได้ วัดการจับคู่ภาพกับประโยค',
      review: {
        summary: 'ภาพ ค เด็กหญิงบีบยาสีฟันลงบนแปรง',
        hints: ['ดูว่าเด็กหญิงถืออะไรในสองมือ'],
        steps: ['ภาพ ค เด็กหญิงถือหลอดยาสีฟันและแปรง กำลังบีบยาสีฟัน', 'จึงตรงกับประโยค เด็กหญิงบีบยาสีฟัน ตอบข้อ 3'],
        transferIds: ['th-plant-caption-t'],
      },
    },
    {
      id: 'm-teeth-ordinal', compact: true, type: 'main', subject: 'math', skillIds: ['ordinal-number'], familyId: 'sequence-ordinal', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'teeth',
      prompt: { text: `ภาพ ${lab(SB, 2)} เป็นภาพที่เท่าไรของเรื่อง`, speech: speak(`ภาพ ${lab(SB, 2)} เป็นภาพที่เท่าไรของเรื่อง`) },
      options: [{ id: 'a', text: 'ภาพที่ 2' }, { id: 'b', text: 'ภาพที่ 3' }, { id: 'c', text: 'ภาพที่ 4' }],
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดลำดับที่จากการเรียงเหตุการณ์',
      review: {
        summary: 'ภาพ ข แปรงฟัน เป็นภาพที่ 2',
        hints: ['เรียงเหตุการณ์ก่อน แล้วนับว่าภาพ ข อยู่ลำดับที่เท่าไร'],
        steps: ['เรียงได้ ค ข ง ก นับ ค หนึ่ง ข สอง', 'ภาพ ข เป็นภาพที่ 2 ตอบข้อ 1'],
        transferIds: ['m-sandwich-ordinal-t'],
      },
    },

    // ================================================================ ช่วงที่ 3: ทำแซนด์วิช 2 ข้อ, ข้ามถนน 2 ข้อ, ข้อเดี่ยว 1 ข้อ
    {
      id: 'r-sandwich-order', compact: true, type: 'main', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, stimulus: 'sandwich',
      prompt: { text: 'ข้อใดเรียงลำดับเหตุการณ์ทำแซนด์วิชได้ถูกต้อง' },
      options: orderOptions(SC, 1),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ (เป็นชื่อป้ายภาพ) เด็กต้องดูภาพและเรียงลำดับเอง',
      review: {
        summary: 'วางขนมปัง ทาแยม ประกบ แล้วกิน เรียงได้ ค ก ง ข',
        hints: ['ต้องทาแยมก่อนประกบขนมปัง และกินเป็นอย่างสุดท้าย'],
        steps: ['ภาพ ค ขนมปังยังไม่ได้ทาแยมเป็นภาพแรก ภาพ ก ทาแยม', 'ภาพ ง ประกบเป็นแซนด์วิช แล้วภาพ ข กินเป็นภาพสุดท้าย เรียงได้ ค ก ง ข ตอบข้อ 1'],
        transferIds: ['r-plant-order-t'],
      },
    },
    {
      id: 'th-sandwich-caption', type: 'main', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'sandwich',
      prompt: { text: `ภาพ ${lab(SC, 4)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab(SC, 4)} ตรงกับประโยคใด`) },
      options: [{ id: 'a', text: 'เด็กหญิงทาแยม' }, { id: 'b', text: 'เด็กหญิงวางขนมปังบนจาน' }, { id: 'c', text: 'เด็กหญิงกินแซนด์วิช' }],
      correctOptionId: 'c',
      narration: 'ฟังตัวเลือกได้ วัดการจับคู่ภาพกับประโยค',
      review: {
        summary: 'ภาพ ข เด็กหญิงกัดแซนด์วิชกินอย่างมีความสุข',
        hints: ['ดูว่าเด็กหญิงถืออะไรอยู่ใกล้ปาก'],
        steps: ['ภาพ ข เด็กหญิงถือแซนด์วิชกำลังกัดกิน', 'จึงตรงกับประโยค เด็กหญิงกินแซนด์วิช ตอบข้อ 3'],
        transferIds: ['th-road-caption-t'],
      },
    },
    {
      id: 'r-road-order', compact: true, type: 'main', subject: 'general', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, stimulus: 'road',
      prompt: { text: 'ข้อใดเรียงลำดับเหตุการณ์การข้ามถนนได้ถูกต้อง' },
      options: orderOptions(SD, 2),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ (เป็นชื่อป้ายภาพ) เด็กต้องดูภาพและเรียงลำดับเอง',
      review: {
        summary: 'รอที่ไฟแดง มองซ้ายขวา รถหยุด แล้วเดินข้าม เรียงได้ ค ง ก ข',
        hints: ['เดินข้ามถนนเป็นอย่างสุดท้ายหลังรถหยุดแล้ว'],
        steps: ['ภาพ ค ยืนรอที่ไฟแดงเป็นภาพแรก ภาพ ง มองซ้ายและขวา', 'ภาพ ก รถหยุดแล้ว ภาพ ข เดินข้ามเป็นภาพสุดท้าย เรียงได้ ค ง ก ข ตอบข้อ 2'],
        transferIds: ['r-road-order-2-t'],
      },
    },
    {
      id: 'sp-road-left', type: 'main', subject: 'spatial', skillIds: ['left-right-picture'], familyId: 'left-right-picture', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'road',
      prompt: { text: `ในภาพ ${lab(SD, 4)} เด็กหญิงอยู่ทางซ้ายหรือทางขวาของผู้ใหญ่`, speech: speak(`ในภาพ ${lab(SD, 4)} เด็กหญิงอยู่ทางซ้ายหรือทางขวาของผู้ใหญ่`) },
      options: [{ id: 'a', text: 'ทางซ้ายของผู้ใหญ่' }, { id: 'b', text: 'ทางขวาของผู้ใหญ่' }, { id: 'c', text: 'ข้างหลังผู้ใหญ่' }],
      correctOptionId: 'a',
      narration: 'ฟังตัวเลือกได้ วัดการบอกซ้ายขวาจากภาพ (ซ้ายขวาตามที่เห็นในภาพ)',
      review: {
        summary: 'เด็กหญิงอยู่ด้านซ้ายของภาพ ผู้ใหญ่อยู่ด้านขวา',
        hints: ['ดูภาพที่เด็กเดินข้ามถนน ใครอยู่ด้านซ้ายมือของเรา'],
        steps: ['ภาพ ข เด็กหญิงเดินข้ามทางม้าลายกับผู้ใหญ่', 'เด็กหญิงอยู่ด้านซ้ายของภาพ ตอบข้อ 1'],
        transferIds: ['sp-road-left-t'],
      },
    },
    {
      id: 'g-walk-pavement', type: 'main', subject: 'general', skillIds: ['safety-walk'], familyId: 'safety-walk', difficulty: 1,
      sourceId: SRC, ...R, section: 'ตอบคำถามให้ถูกต้อง',
      prompt: { text: 'เมื่อเดินไปโรงเรียน เราควรเดินตรงที่ใด' },
      options: [{ id: 'a', text: 'กลางถนน' }, { id: 'b', text: 'ตรงที่มีรถวิ่งผ่าน' }, { id: 'c', text: 'บนทางเท้า' }],
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องความปลอดภัยบนถนน',
      review: {
        summary: 'ทางเท้าปลอดภัยสำหรับคนเดินเท้า',
        hints: ['ที่ไหนที่รถไม่วิ่ง'],
        steps: ['กลางถนนและที่รถวิ่งผ่านเป็นที่อันตราย', 'คนเดินเท้าควรเดินบนทางเท้า ตอบข้อ 3'],
        transferIds: ['g-walk-edge-t'],
      },
    },

    // ================================================================ โจทย์ลองใหม่ (เปิดในหน้าเฉลย ไม่นับเป็นข้อสอบ)
    {
      id: 'r-sandwich-order-t', compact: true, type: 'transfer', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพการทำแซนด์วิชถูกสลับที่ ข้อใดเรียงลำดับเหตุการณ์ได้ถูกต้อง' },
      visual: panels('sandwich', [3, 1, 4, 2]),
      options: orderOptions([3, 1, 4, 2], 3),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ขนมปังบนจาน ทาแยม ประกบ กิน เรียงได้ ${order([3, 1, 4, 2])}`, hints: [], steps: ['ภาพแรกคือขนมปังที่ยังไม่ทาแยม ต่อไปทาแยม แล้วประกบ', `ภาพสุดท้ายคือกินแซนด์วิช เรียงได้ ${order([3, 1, 4, 2])}`] },
    },
    {
      id: 'r-teeth-first-t', compact: true, type: 'transfer', subject: 'reasoning', skillIds: ['sequence-first'], familyId: 'sequence-first', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพแปรงฟันถูกสลับที่ ภาพใดเกิดขึ้นเป็นภาพแรก', speech: 'ภาพแปรงฟันถูกสลับที่ ภาพใดเกิดขึ้นเป็นภาพแรก' },
      visual: panels('teeth', [2, 4, 1, 3]),
      options: labelOptions(['ก', lab([2, 4, 1, 3], 1), 'ง']),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ภาพ ${lab([2, 4, 1, 3], 1)} บีบยาสีฟัน เกิดก่อน`, hints: [], steps: [`ภาพ ${lab([2, 4, 1, 3], 1)} เด็กหญิงบีบยาสีฟันก่อนแปรงฟัน`, 'ภาพอื่นเกิดหลังจากนั้น'] },
    },
    {
      id: 'th-sandwich-caption-t', type: 'transfer', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([3, 1, 4, 2], 2)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab([3, 1, 4, 2], 2)} ตรงกับประโยคใด`) },
      visual: panels('sandwich', [3, 1, 4, 2]),
      options: [{ id: 'a', text: 'เด็กหญิงกินแซนด์วิช' }, { id: 'b', text: 'เด็กหญิงทาแยมบนขนมปัง' }, { id: 'c', text: 'เด็กหญิงวางขนมปังบนจาน' }],
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: 'เด็กหญิงใช้มีดทาแยมสีแดงบนขนมปัง', hints: [], steps: [`ภาพ ${lab([3, 1, 4, 2], 2)} เด็กหญิงถือมีดทาแยมบนขนมปัง`, 'จึงตรงกับประโยค เด็กหญิงทาแยมบนขนมปัง'] },
    },
    {
      id: 'sc-root-t', type: 'transfer', subject: 'science', skillIds: ['plant-parts'], familyId: 'plant-parts', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ส่วนของต้นไม้ที่อยู่ใต้ดินและช่วยดูดน้ำ เรียกว่าอะไร' },
      options: [{ id: 'a', text: 'ดอก' }, { id: 'b', text: 'ราก' }, { id: 'c', text: 'ผล' }],
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: 'รากอยู่ใต้ดิน ดูดน้ำให้ต้นไม้', hints: [], steps: ['ดอกและผลอยู่เหนือดิน', 'รากอยู่ใต้ดินและดูดน้ำ'] },
    },
    {
      id: 'm-teeth-ordinal-t', compact: true, type: 'transfer', subject: 'math', skillIds: ['ordinal-number'], familyId: 'sequence-ordinal', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([2, 4, 1, 3], 3)} เป็นภาพที่เท่าไรของเรื่อง`, speech: speak(`ภาพ ${lab([2, 4, 1, 3], 3)} เป็นภาพที่เท่าไรของเรื่อง`) },
      visual: panels('teeth', [2, 4, 1, 3]),
      options: [{ id: 'a', text: 'ภาพที่ 1' }, { id: 'b', text: 'ภาพที่ 3' }, { id: 'c', text: 'ภาพที่ 4' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ภาพ ${lab([2, 4, 1, 3], 3)} บ้วนปาก เป็นภาพที่ 3`, hints: [], steps: [`เรียงได้ ${order([2, 4, 1, 3])}`, `ภาพ ${lab([2, 4, 1, 3], 3)} เป็นลำดับที่ 3`] },
    },
    {
      id: 'r-road-order-t', compact: true, type: 'transfer', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพการข้ามถนนถูกสลับที่ ข้อใดเรียงลำดับเหตุการณ์ได้ถูกต้อง' },
      visual: panels('road', [2, 4, 1, 3]),
      options: orderOptions([2, 4, 1, 3], 1),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `รอที่ไฟแดง มองซ้ายขวา รถหยุด เดินข้าม เรียงได้ ${order([2, 4, 1, 3])}`, hints: [], steps: ['ภาพแรกคือยืนรอที่ไฟแดง แล้วมองซ้ายขวา', `ต่อมารถหยุด แล้วเดินข้าม เรียงได้ ${order([2, 4, 1, 3])}`] },
    },
    {
      id: 'r-plant-last-t', compact: true, type: 'transfer', subject: 'reasoning', skillIds: ['sequence-last'], familyId: 'sequence-last', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพปลูกต้นไม้ถูกสลับที่ ภาพใดเกิดขึ้นเป็นภาพสุดท้าย', speech: 'ภาพปลูกต้นไม้ถูกสลับที่ ภาพใดเกิดขึ้นเป็นภาพสุดท้าย' },
      visual: panels('plant', [2, 4, 1, 3]),
      options: labelOptions(['ก', lab([2, 4, 1, 3], 4), 'ง']),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ภาพ ${lab([2, 4, 1, 3], 4)} ต้นอ่อนงอก เกิดหลังสุด`, hints: [], steps: [`ภาพ ${lab([2, 4, 1, 3], 4)} มีต้นอ่อนงอกขึ้นมาแล้ว`, 'ต้องปลูกและรดน้ำก่อนจึงจะงอก ภาพนี้จึงเป็นภาพสุดท้าย'] },
    },
    {
      id: 'g-bath-t', type: 'transfer', subject: 'general', skillIds: ['hygiene-reason'], familyId: 'hygiene-reason', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'ทำไมเราต้องอาบน้ำทุกวัน' },
      options: [{ id: 'a', text: 'เพื่อให้ตัวสกปรก' }, { id: 'b', text: 'เพื่อให้ร่างกายสะอาดและสบายตัว' }, { id: 'c', text: 'เพราะไม่อยากใส่เสื้อ' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'อาบน้ำล้างเหงื่อและสิ่งสกปรก ทำให้สบายตัว', hints: [], steps: ['ตัวเรามีเหงื่อและฝุ่นติดตลอดวัน', 'อาบน้ำจึงทำให้สะอาดและสบายตัว'] },
    },
    {
      id: 'th-plant-caption-t', type: 'transfer', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([2, 4, 1, 3], 4)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab([2, 4, 1, 3], 4)} ตรงกับประโยคใด`) },
      visual: panels('plant', [2, 4, 1, 3]),
      options: [{ id: 'a', text: 'ต้นไม้งอกขึ้นมาแล้ว' }, { id: 'b', text: 'เด็กหญิงขุดดิน' }, { id: 'c', text: 'เด็กหญิงกินขนม' }],
      correctOptionId: 'a',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: 'ในกระถางมีต้นอ่อนที่งอกขึ้นมาแล้ว', hints: [], steps: [`ภาพ ${lab([2, 4, 1, 3], 4)} ในกระถางมีต้นอ่อนมีใบสีเขียว`, 'จึงตรงกับประโยค ต้นไม้งอกขึ้นมาแล้ว'] },
    },
    {
      id: 'm-sandwich-ordinal-t', compact: true, type: 'transfer', subject: 'math', skillIds: ['ordinal-number'], familyId: 'sequence-ordinal', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([3, 1, 4, 2], 4)} เป็นภาพที่เท่าไรของเรื่อง`, speech: speak(`ภาพ ${lab([3, 1, 4, 2], 4)} เป็นภาพที่เท่าไรของเรื่อง`) },
      visual: panels('sandwich', [3, 1, 4, 2]),
      options: [{ id: 'a', text: 'ภาพที่ 2' }, { id: 'b', text: 'ภาพที่ 3' }, { id: 'c', text: 'ภาพที่ 4' }],
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ภาพ ${lab([3, 1, 4, 2], 4)} กินแซนด์วิช เป็นภาพที่ 4`, hints: [], steps: [`เรียงได้ ${order([3, 1, 4, 2])}`, `ภาพ ${lab([3, 1, 4, 2], 4)} เป็นลำดับสุดท้าย คือภาพที่ 4`] },
    },
    {
      id: 'r-plant-order-t', compact: true, type: 'transfer', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพปลูกต้นไม้ถูกสลับที่ ข้อใดเรียงลำดับเหตุการณ์ได้ถูกต้อง' },
      visual: panels('plant', [4, 3, 1, 2]),
      options: orderOptions([4, 3, 1, 2], 2),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ขุดดิน ใส่เมล็ด รดน้ำ ต้นอ่อนงอก เรียงได้ ${order([4, 3, 1, 2])}`, hints: [], steps: ['ภาพแรกคือขุดดิน แล้วใส่เมล็ด และรดน้ำ', `ภาพสุดท้ายคือต้นอ่อนงอก เรียงได้ ${order([4, 3, 1, 2])}`] },
    },
    {
      id: 'th-road-caption-t', type: 'transfer', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([2, 4, 1, 3], 4)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab([2, 4, 1, 3], 4)} ตรงกับประโยคใด`) },
      visual: panels('road', [2, 4, 1, 3]),
      options: [{ id: 'a', text: 'เด็กหญิงวิ่งข้ามถนน' }, { id: 'b', text: 'เด็กหญิงเดินข้ามถนนกับผู้ใหญ่' }, { id: 'c', text: 'เด็กหญิงนั่งเล่นกลางถนน' }],
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: 'เด็กหญิงจูงมือผู้ใหญ่เดินข้ามทางม้าลาย', hints: [], steps: [`ภาพ ${lab([2, 4, 1, 3], 4)} เด็กหญิงเดินข้ามทางม้าลายพร้อมผู้ใหญ่`, 'จึงตรงกับประโยค เด็กหญิงเดินข้ามถนนกับผู้ใหญ่'] },
    },
    {
      id: 'r-road-order-2-t', compact: true, type: 'transfer', subject: 'general', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพแปรงฟันถูกสลับที่ ข้อใดเรียงลำดับเหตุการณ์ได้ถูกต้อง' },
      visual: panels('teeth', [3, 1, 4, 2]),
      options: orderOptions([3, 1, 4, 2], 1),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `บีบยาสีฟัน แปรง บ้วนปาก ยิ้ม เรียงได้ ${order([3, 1, 4, 2])}`, hints: [], steps: ['ภาพแรกคือบีบยาสีฟัน แล้วแปรงฟัน และบ้วนปาก', `ภาพสุดท้ายคือยิ้มฟันสะอาด เรียงได้ ${order([3, 1, 4, 2])}`] },
    },
    {
      id: 'sp-road-left-t', type: 'transfer', subject: 'spatial', skillIds: ['left-right-picture'], familyId: 'left-right-picture', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ในภาพ ${lab([2, 4, 1, 3], 4)} ผู้ใหญ่อยู่ทางซ้ายหรือทางขวาของเด็กหญิง`, speech: speak(`ในภาพ ${lab([2, 4, 1, 3], 4)} ผู้ใหญ่อยู่ทางซ้ายหรือทางขวาของเด็กหญิง`) },
      visual: panels('road', [2, 4, 1, 3]),
      options: [{ id: 'a', text: 'ทางซ้ายของเด็กหญิง' }, { id: 'b', text: 'ทางขวาของเด็กหญิง' }, { id: 'c', text: 'ข้างหลังเด็กหญิง' }],
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: 'ผู้ใหญ่อยู่ด้านขวาของภาพ ข้างเด็กหญิง', hints: [], steps: [`ภาพ ${lab([2, 4, 1, 3], 4)} เด็กหญิงอยู่ด้านซ้าย`, 'ผู้ใหญ่จึงอยู่ทางขวาของเด็กหญิง'] },
    },
    {
      id: 'g-walk-edge-t', type: 'transfer', subject: 'general', skillIds: ['safety-walk'], familyId: 'safety-walk', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ถ้าถนนไม่มีทางเท้า เราควรเดินอย่างไร' },
      options: [{ id: 'a', text: 'เดินกลางถนน' }, { id: 'b', text: 'เดินชิดริมถนน และระวังรถ' }, { id: 'c', text: 'วิ่งตัดหน้ารถ' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'เดินชิดริมถนนและมองรถเสมอ', hints: [], steps: ['กลางถนนและการวิ่งตัดหน้ารถอันตราย', 'ต้องเดินชิดริมถนน และระวังรถ'] },
    },
  ],
};
