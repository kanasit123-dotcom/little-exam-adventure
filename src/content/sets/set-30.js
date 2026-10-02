/*
 * ชุดที่ 30 — เรียงลำดับเหตุการณ์ 4 เรื่องใหม่ (แผ่นรูป M: design/PROMPTS-gemini-11.md) แบบ 15 ข้อ
 * ภาพเรื่องราว 4 ภาพถูกสลับที่และติดป้าย ก ข ค ง แล้วถามหลายข้อจากภาพชุดเดียว (เหมือนชุด 17 และ 22):
 * แต่งตัว 4 ข้อ, ให้อาหารปลา 4 ข้อ, ปลูกต้นไม้ 4 ข้อ, ทำไข่ทอด 3 ข้อ
 * แต่งใหม่ทั้งหมด; ลำดับที่ถูกและป้ายภาพคำนวณจากรายการสลับที่ (shuffle) ด้วยฟังก์ชันด้านล่าง จึงไม่ผิดพลาดเวลาเปลี่ยนการสลับ
 * (tests/sequence.test.mjs ตรวจเทียบกับลำดับจริงของไฟล์ภาพ pic-seq-<เรื่อง>-<ลำดับ>)
 */
const R = { provenance: 'original', rights: 'แต่งใหม่ทั้งหมด (ข้อความ ตัวเลข ภาพ) เผยแพร่ใน repo นี้ได้', reviewStatus: 'draft' };
const SRC = 'src-a24-compilation';
const SEQ = 'เรียงลำดับเหตุการณ์ให้ถูกต้อง';

// ---------------------------------------------------------------- ตัวช่วย (เหมือนชุด 17 และ 22)
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
/** ตัวเลือกเรียงลำดับ: ข้อถูก / ย้อนกลับทั้งหมด / เอาภาพสุดท้ายขึ้นก่อน (ผิดชัดเจนทั้งสองแบบ) วางข้อถูกไว้ตำแหน่ง correctPosition (1-3) */
const orderOptions = (shuffle, correctPosition) => {
  const wrong = [order(shuffle, [4, 3, 2, 1]), order(shuffle, [4, 1, 2, 3])];
  const texts = [...wrong];
  texts.splice(correctPosition - 1, 0, order(shuffle));
  return texts.map((text, i) => opt('abc'[i], text));
};
const labelOptions = (labels) => labels.map((l, i) => opt('abc'[i], `ภาพ ${l}`));
const words = (...list) => list.map((text, i) => ({ id: 'abc'[i], text }));
const stimulusFor = (kind, list) => ({
  section: SEQ,
  textHidden: true,   // ข้อความนี้อ่านออกเสียงอย่างเดียว ไม่แสดงเป็นแถบเรื่อง (ให้ภาพใหญ่ขึ้น)
  text: 'ภาพเหตุการณ์ 4 ภาพ ติดป้ายกำกับ ก ข ค ง ดูภาพทั้งหมดแล้วตอบคำถาม',
  speech: 'ภาพเหตุการณ์ 4 ภาพ ติดป้ายกำกับ กอ ขอ คอ งอ ดูภาพทั้งหมดแล้วตอบคำถาม',
  visual: panels(kind, list),
});

// การสลับที่ของแต่ละเรื่อง (ข้อหลัก) — เลขในวงเล็บคือลำดับเหตุการณ์จริงของภาพที่ติดป้าย ก ข ค ง
const SD = [3, 1, 4, 2];   // แต่งตัว: ก=ใส่เสื้อและกางเกงแล้ว ข=ยืนข้างเตียงใส่เสื้อกล้าม ค=แต่งตัวเสร็จ ง=กำลังสวมเสื้อ
const SF = [2, 4, 1, 3];   // ให้อาหารปลา: ก=เทอาหารจากกล่อง ข=ปลากินอาหารเด็กยิ้ม ค=โหลว่างกับกล่องอาหาร ง=โรยอาหารปลามากิน
const ST = [4, 2, 1, 3];   // ปลูกต้นไม้: ก=ต้นไม้ใหญ่มีผลแอปเปิ้ล ข=รดน้ำต้นอ่อน ค=ขุดดิน ง=ต้นไม้โตมีใบ
const SE = [3, 1, 4, 2];   // ทอดไข่: ก=ไข่ทอดสุกในกระทะ ข=กระทะว่างไข่อยู่ในชาม ค=กินไข่ทอดกับข้าว ง=แม่ตอกไข่ลงกระทะ

export default {
  id: 'set-30',
  version: 1,
  title: 'ชุดที่ 30',
  note: 'เรียงลำดับเหตุการณ์ แต่งตัว ให้อาหารปลา ปลูกต้นไม้ ทอดไข่',
  order: [
    'g-dress-order', 'th-dress-caption', 'sp-dress-left', 'm-dress-ordinal',
    'r-fish-order', 'r-fish-first', 'm-fish-count', 'g-fish-care',
    'r-tree-order', 'th-tree-caption', 'sc-tree-water', 'm-tree-ordinal',
    'g-egg-order', 'r-egg-final', 'th-egg-caption',
  ],
  stimuli: {
    dress: stimulusFor('dress', SD),
    fish: stimulusFor('fish', SF),
    tree: stimulusFor('tree', ST),
    egg: stimulusFor('egg', SE),
  },
  items: [
    // ================================================================ แต่งตัว
    {
      id: 'g-dress-order', compact: true, type: 'main', subject: 'general', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, stimulus: 'dress',
      prompt: { text: 'ข้อใดเรียงลำดับเหตุการณ์การแต่งตัวได้ถูกต้อง' },
      options: orderOptions(SD, 2),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ (เป็นชื่อป้ายภาพ) เด็กต้องดูภาพและเรียงลำดับเอง',
      review: {
        summary: `ยืนข้างเตียง สวมเสื้อ ใส่กางเกงแล้วจัดเสื้อ แต่งตัวเสร็จ เรียงได้ ${order(SD)}`,
        hints: ['ภาพแรกคือเสื้อกับกางเกงยังวางอยู่บนเตียง ภาพสุดท้ายคือแต่งตัวเสร็จแล้ว'],
        steps: [`ภาพ ${lab(SD, 1)} เสื้อกับกางเกงยังวางบนเตียง เป็นภาพแรก ภาพ ${lab(SD, 2)} สวมเสื้อ`, `ภาพ ${lab(SD, 3)} ใส่กางเกงแล้วจัดเสื้อ ภาพ ${lab(SD, 4)} แต่งตัวเสร็จ เป็นภาพสุดท้าย ตอบข้อ 2`],
        transferIds: ['g-dress-order-t'],
      },
    },
    {
      id: 'th-dress-caption', type: 'main', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'dress',
      prompt: { text: `ภาพ ${lab(SD, 2)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab(SD, 2)} ตรงกับประโยคใด`) },
      options: words('เด็กหญิงกำลังสวมเสื้อยืดสีฟ้า', 'เด็กหญิงกำลังอาบน้ำ', 'เด็กหญิงแต่งตัวเสร็จแล้ว'),
      correctOptionId: 'a',
      narration: 'ฟังตัวเลือกได้ วัดการจับคู่ภาพกับประโยค',
      review: {
        summary: `ภาพ ${lab(SD, 2)} เด็กหญิงกำลังสวมเสื้อยืดสีฟ้าผ่านศีรษะ`,
        hints: ['ดูว่าเด็กหญิงกำลังทำอะไรกับเสื้อ'],
        steps: [`ภาพ ${lab(SD, 2)} เด็กหญิงใช้มือจับเสื้อยืดสีฟ้าสวมผ่านศีรษะ`, 'จึงตรงกับประโยค เด็กหญิงกำลังสวมเสื้อยืดสีฟ้า ตอบข้อ 1'],
        transferIds: ['th-dress-caption-t'],
      },
    },
    {
      id: 'sp-dress-left', type: 'main', subject: 'spatial', skillIds: ['left-right-picture'], familyId: 'left-right-picture', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'dress',
      prompt: { text: `ในภาพ ${lab(SD, 1)} ใครหรืออะไรอยู่ทางซ้ายมือของภาพ`, speech: speak(`ในภาพ ${lab(SD, 1)} ใครหรืออะไรอยู่ทางซ้ายมือของภาพ`) },
      options: words('เด็กหญิง', 'เสื้อและกางเกงที่วางบนเตียง', 'ไม่มีอะไรเลย'),
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้ วัดการบอกตำแหน่งซ้ายขวาในภาพ (ซ้ายขวาของภาพ ไม่ใช่ของตัวคนในภาพ)',
      review: {
        summary: `ในภาพ ${lab(SD, 1)} เสื้อและกางเกงวางอยู่ทางซ้ายของภาพ`,
        hints: ['มองภาพ แล้วดูว่าอะไรอยู่ทางด้านซ้ายมือของเรา'],
        steps: [`ในภาพ ${lab(SD, 1)} เด็กหญิงยืนอยู่ทางขวาของภาพ`, 'เสื้อและกางเกงที่วางบนเตียงอยู่ทางซ้ายของภาพ ตอบข้อ 2'],
        transferIds: ['sp-dress-left-t'],
      },
    },
    {
      id: 'm-dress-ordinal', compact: true, type: 'main', subject: 'math', skillIds: ['ordinal-number'], familyId: 'sequence-ordinal', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'dress',
      prompt: { text: `ภาพ ${lab(SD, 3)} เป็นภาพที่เท่าไรของเรื่อง`, speech: speak(`ภาพ ${lab(SD, 3)} เป็นภาพที่เท่าไรของเรื่อง`) },
      options: words('ภาพที่ 2', 'ภาพที่ 3', 'ภาพที่ 4'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดลำดับที่จากการเรียงเหตุการณ์',
      review: {
        summary: `ภาพ ${lab(SD, 3)} ใส่กางเกงแล้วจัดเสื้อ เป็นภาพที่ 3`,
        hints: ['เรียงเหตุการณ์ก่อน แล้วนับว่าภาพนี้อยู่ลำดับที่เท่าไร'],
        steps: [`เรียงได้ ${order(SD)} นับ ${lab(SD, 1)} หนึ่ง ${lab(SD, 2)} สอง ${lab(SD, 3)} สาม ${lab(SD, 4)} สี่`, `ภาพ ${lab(SD, 3)} เป็นภาพที่ 3 ตอบข้อ 2`],
        transferIds: ['m-dress-ordinal-t'],
      },
    },

    // ================================================================ ให้อาหารปลา
    {
      id: 'r-fish-order', compact: true, type: 'main', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, stimulus: 'fish',
      prompt: { text: 'ข้อใดเรียงลำดับเหตุการณ์การให้อาหารปลาได้ถูกต้อง' },
      options: orderOptions(SF, 1),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ (เป็นชื่อป้ายภาพ) เด็กต้องดูภาพและเรียงลำดับเอง',
      review: {
        summary: `มีโหลกับกล่องอาหาร เทอาหารปลา โรยอาหารให้ปลามากิน ปลากินและเด็กหญิงยิ้ม เรียงได้ ${order(SF)}`,
        hints: ['ภาพแรกคือยังไม่ได้ให้อาหาร ภาพสุดท้ายคือปลากินอาหารแล้ว'],
        steps: [`ภาพ ${lab(SF, 1)} มีโหลกับกล่องอาหารปลา เป็นภาพแรก ภาพ ${lab(SF, 2)} เทอาหารปลาจากกล่อง`, `ภาพ ${lab(SF, 3)} โรยอาหารให้ปลามากิน ภาพ ${lab(SF, 4)} ปลากินอาหารและเด็กหญิงยิ้ม เป็นภาพสุดท้าย ตอบข้อ 1`],
        transferIds: ['r-fish-order-t'],
      },
    },
    {
      id: 'r-fish-first', compact: true, type: 'main', subject: 'reasoning', skillIds: ['sequence-first'], familyId: 'sequence-first', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'fish',
      prompt: { text: 'ภาพใดเกิดขึ้นเป็นภาพแรก', speech: 'ภาพใดเกิดขึ้นเป็นภาพแรก' },
      options: labelOptions([lab(SF, 2), lab(SF, 1), lab(SF, 4)]),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ เด็กต้องดูภาพแล้วหาภาพที่เกิดก่อนสุด',
      review: {
        summary: `ภาพ ${lab(SF, 1)} มีโหลกับกล่องอาหารปลา ยังไม่ได้ให้อาหาร เป็นภาพแรก`,
        hints: ['ภาพไหนที่ยังไม่ได้เทอาหารปลาเลย'],
        steps: [`ภาพ ${lab(SF, 1)} กล่องอาหารยังปิดอยู่ข้างโหล ยังไม่ได้ให้อาหาร`, `ภาพ ${lab(SF, 2)} กำลังเทอาหาร และภาพ ${lab(SF, 4)} ปลากินอาหารแล้ว ตอบข้อ 2`],
        transferIds: ['r-fish-first-t'],
      },
    },
    {
      id: 'm-fish-count', type: 'main', subject: 'math', skillIds: ['story-count'], familyId: 'picture-count', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'fish',
      prompt: { text: `ในภาพ ${lab(SF, 4)} มีปลากี่ตัว`, speech: speak(`ในภาพ ${lab(SF, 4)} มีปลากี่ตัว`) },
      options: words('1 ตัว', '2 ตัว', '3 ตัว'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการนับสิ่งของในภาพ',
      review: {
        summary: `ภาพ ${lab(SF, 4)} มีปลาสีส้ม 2 ตัว`,
        hints: ['นับปลาในโหลทีละตัว'],
        steps: [`ในภาพ ${lab(SF, 4)} ปลาตัวหนึ่งอยู่ซ้าย อีกตัวหนึ่งอยู่ขวา`, 'นับได้ 2 ตัว ตอบข้อ 2'],
        transferIds: ['m-fish-count-t'],
      },
    },
    {
      id: 'g-fish-care', type: 'main', subject: 'general', skillIds: ['animal-care'], familyId: 'animal-care', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'fish',
      prompt: { text: 'ถ้าเราเลี้ยงปลา ควรให้อาหารปลาอย่างไร' },
      options: words('ให้พอดีวันละครั้งสองครั้ง', 'เทให้เยอะมากๆ ครั้งเดียว', 'ไม่ต้องให้อาหารเลย'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องการดูแลสัตว์เลี้ยง',
      review: {
        summary: 'ให้อาหารปลาพอดี วันละครั้งสองครั้ง',
        hints: ['ปลาต้องกินอาหาร แต่ถ้าให้มากเกินไปน้ำจะเสีย'],
        steps: ['ถ้าไม่ให้อาหารเลย ปลาจะหิว และถ้าเทเยอะเกินไป อาหารที่เหลือทำให้น้ำเสีย', 'ควรให้พอดีวันละครั้งสองครั้ง ตอบข้อ 1'],
        transferIds: ['g-fish-care-t'],
      },
    },

    // ================================================================ ปลูกต้นไม้
    {
      id: 'r-tree-order', compact: true, type: 'main', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, stimulus: 'tree',
      prompt: { text: 'ข้อใดเรียงลำดับเหตุการณ์การปลูกต้นไม้ได้ถูกต้อง' },
      options: orderOptions(ST, 3),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ (เป็นชื่อป้ายภาพ) เด็กต้องดูภาพและเรียงลำดับเอง',
      review: {
        summary: `ขุดดิน รดน้ำต้นอ่อน ต้นไม้โตมีใบ ต้นไม้ใหญ่มีผล เรียงได้ ${order(ST)}`,
        hints: ['ต้องขุดดินปลูกก่อน แล้วต้นไม้จึงค่อยๆ โตขึ้น'],
        steps: [`ภาพ ${lab(ST, 1)} ขุดดินปลูก เป็นภาพแรก ภาพ ${lab(ST, 2)} รดน้ำต้นอ่อน`, `ภาพ ${lab(ST, 3)} ต้นไม้โตมีใบ ภาพ ${lab(ST, 4)} ต้นไม้ใหญ่มีผล เป็นภาพสุดท้าย ตอบข้อ 3`],
        transferIds: ['r-tree-order-t'],
      },
    },
    {
      id: 'th-tree-caption', type: 'main', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'tree',
      prompt: { text: `ภาพ ${lab(ST, 1)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab(ST, 1)} ตรงกับประโยคใด`) },
      options: words('เด็กหญิงรดน้ำต้นไม้', 'เด็กหญิงเก็บผลแอปเปิ้ล', 'เด็กหญิงขุดดินเพื่อปลูกต้นไม้'),
      correctOptionId: 'c',
      narration: 'ฟังตัวเลือกได้ วัดการจับคู่ภาพกับประโยค',
      review: {
        summary: `ภาพ ${lab(ST, 1)} เด็กหญิงใช้เสียมขุดดินเพื่อปลูกต้นไม้`,
        hints: ['ดูว่าเด็กหญิงถืออะไรอยู่ และกำลังทำอะไรกับดิน'],
        steps: [`ภาพ ${lab(ST, 1)} เด็กหญิงนั่งใช้เสียมขุดดินเป็นหลุม`, 'จึงตรงกับประโยค เด็กหญิงขุดดินเพื่อปลูกต้นไม้ ตอบข้อ 3'],
        transferIds: ['th-tree-caption-t'],
      },
    },
    {
      id: 'sc-tree-water', type: 'main', subject: 'science', skillIds: ['plants'], familyId: 'plants', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'tree',
      prompt: { text: 'ต้นไม้ต้องการอะไรเพื่อเจริญเติบโต' },
      options: words('น้ำและแสงแดด', 'ขนมและนม', 'ผ้าห่มอุ่นๆ'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องสิ่งที่พืชต้องการ',
      review: {
        summary: 'ต้นไม้ต้องการน้ำและแสงแดด',
        hints: ['ในภาพ เด็กหญิงรดอะไรให้ต้นอ่อน'],
        steps: ['ต้นไม้ไม่กินขนมและนม และไม่ต้องใช้ผ้าห่ม', 'ต้นไม้ต้องการน้ำและแสงแดด ตอบข้อ 1'],
        transferIds: ['sc-tree-water-t'],
      },
    },
    {
      id: 'm-tree-ordinal', compact: true, type: 'main', subject: 'math', skillIds: ['ordinal-number'], familyId: 'sequence-ordinal', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'tree',
      prompt: { text: `ภาพ ${lab(ST, 2)} เป็นภาพที่เท่าไรของเรื่อง`, speech: speak(`ภาพ ${lab(ST, 2)} เป็นภาพที่เท่าไรของเรื่อง`) },
      options: words('ภาพที่ 3', 'ภาพที่ 4', 'ภาพที่ 2'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดลำดับที่จากการเรียงเหตุการณ์',
      review: {
        summary: `ภาพ ${lab(ST, 2)} รดน้ำต้นอ่อน เป็นภาพที่ 2`,
        hints: ['เรียงเหตุการณ์ก่อน แล้วนับว่าภาพนี้อยู่ลำดับที่เท่าไร'],
        steps: [`เรียงได้ ${order(ST)} นับ ${lab(ST, 1)} หนึ่ง ${lab(ST, 2)} สอง ${lab(ST, 3)} สาม ${lab(ST, 4)} สี่`, `ภาพ ${lab(ST, 2)} เป็นภาพที่ 2 ตอบข้อ 3`],
        transferIds: ['m-tree-ordinal-t'],
      },
    },

    // ================================================================ ทอดไข่
    {
      id: 'g-egg-order', compact: true, type: 'main', subject: 'general', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, stimulus: 'egg',
      prompt: { text: 'ข้อใดเรียงลำดับเหตุการณ์การทำไข่ทอดได้ถูกต้อง' },
      options: orderOptions(SE, 1),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ (เป็นชื่อป้ายภาพ) เด็กต้องดูภาพและเรียงลำดับเอง',
      review: {
        summary: `เตรียมกระทะกับไข่ ตอกไข่ลงกระทะ ไข่ทอดสุก กินไข่ทอด เรียงได้ ${order(SE)}`,
        hints: ['ต้องตอกไข่ลงกระทะก่อน ไข่จึงสุก แล้วจึงกินได้'],
        steps: [`ภาพ ${lab(SE, 1)} กระทะยังว่างและไข่อยู่ในชาม เป็นภาพแรก ภาพ ${lab(SE, 2)} แม่ตอกไข่ลงกระทะ`, `ภาพ ${lab(SE, 3)} ไข่ทอดสุกแล้ว ภาพ ${lab(SE, 4)} กินไข่ทอดกับข้าว เป็นภาพสุดท้าย ตอบข้อ 1`],
        transferIds: ['g-egg-order-t'],
      },
    },
    {
      id: 'r-egg-final', compact: true, type: 'main', subject: 'reasoning', skillIds: ['sequence-last'], familyId: 'sequence-last', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'egg',
      prompt: { text: 'ภาพใดเกิดขึ้นเป็นภาพสุดท้าย', speech: 'ภาพใดเกิดขึ้นเป็นภาพสุดท้าย' },
      options: labelOptions([lab(SE, 1), lab(SE, 2), lab(SE, 4)]),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ เด็กต้องดูภาพแล้วหาภาพที่เกิดหลังสุด',
      review: {
        summary: `ภาพ ${lab(SE, 4)} เด็กหญิงกินไข่ทอดกับข้าว เกิดหลังสุด`,
        hints: ['ภาพไหนที่ไข่ทอดเสร็จแล้วและได้กิน'],
        steps: [`ภาพ ${lab(SE, 4)} เด็กหญิงถือช้อนกินไข่ทอดกับข้าว ทำเสร็จแล้ว`, `ภาพ ${lab(SE, 1)} และภาพ ${lab(SE, 2)} ยังทำไม่เสร็จ ตอบข้อ 3`],
        transferIds: ['r-egg-final-t'],
      },
    },
    {
      id: 'th-egg-caption', type: 'main', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'egg',
      prompt: { text: `ภาพ ${lab(SE, 2)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab(SE, 2)} ตรงกับประโยคใด`) },
      options: words('เด็กหญิงกำลังกินข้าว', 'แม่ตอกไข่ลงในกระทะ', 'เด็กหญิงล้างจาน'),
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้ วัดการจับคู่ภาพกับประโยค',
      review: {
        summary: `ภาพ ${lab(SE, 2)} แม่ตอกไข่ลงในกระทะ`,
        hints: ['ดูว่าแม่ถืออะไรอยู่ และไข่ไปอยู่ที่ไหน'],
        steps: [`ภาพ ${lab(SE, 2)} แม่ใช้มือตอกไข่ให้ไข่ไหลลงในกระทะบนเตา`, 'จึงตรงกับประโยค แม่ตอกไข่ลงในกระทะ ตอบข้อ 2'],
        transferIds: ['th-egg-caption-t'],
      },
    },

    // ================================================================ โจทย์ลองใหม่ (เปิดในหน้าเฉลย ไม่นับเป็นข้อสอบ)
    {
      id: 'g-dress-order-t', compact: true, type: 'transfer', subject: 'general', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพการปลูกต้นไม้ถูกสลับที่ ข้อใดเรียงลำดับเหตุการณ์ได้ถูกต้อง' },
      visual: panels('tree', [3, 1, 4, 2]),
      options: orderOptions([3, 1, 4, 2], 3),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ขุดดิน รดน้ำต้นอ่อน ต้นไม้โตมีใบ ต้นไม้ใหญ่มีผล เรียงได้ ${order([3, 1, 4, 2])}`, hints: [], steps: ['ภาพแรกคือขุดดินปลูก แล้วรดน้ำต้นอ่อน', 'ต่อด้วยต้นไม้โตมีใบ และต้นไม้ใหญ่มีผลเป็นภาพสุดท้าย'] },
    },
    {
      id: 'th-dress-caption-t', type: 'transfer', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([4, 2, 1, 3], 3)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab([4, 2, 1, 3], 3)} ตรงกับประโยคใด`) },
      visual: panels('egg', [4, 2, 1, 3]),
      options: words('แม่กำลังตอกไข่', 'เด็กหญิงกำลังกินข้าว', 'ไข่ทอดในกระทะสุกแล้ว'),
      correctOptionId: 'c',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: `ภาพ ${lab([4, 2, 1, 3], 3)} ไข่ทอดในกระทะสุกแล้ว มีควันลอยขึ้น`, hints: [], steps: [`ภาพ ${lab([4, 2, 1, 3], 3)} มีไข่ทอดสีเหลืองในกระทะและมีควันลอย`, 'จึงตรงกับประโยคข้อ 3'] },
    },
    {
      id: 'sp-dress-left-t', type: 'transfer', subject: 'spatial', skillIds: ['left-right-picture'], familyId: 'left-right-picture', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ในภาพ ${lab([2, 4, 1, 3], 2)} ใครอยู่ทางขวามือของภาพ`, speech: speak(`ในภาพ ${lab([2, 4, 1, 3], 2)} ใครอยู่ทางขวามือของภาพ`) },
      visual: panels('egg', [2, 4, 1, 3]),
      options: words('แม่', 'เด็กหญิง', 'ไม่มีใคร'),
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: `ในภาพ ${lab([2, 4, 1, 3], 2)} แม่อยู่ทางซ้ายของภาพ และเด็กหญิงอยู่ทางขวาของภาพ`, hints: [], steps: [`ในภาพ ${lab([2, 4, 1, 3], 2)} แม่ยืนตอกไข่อยู่ทางซ้ายของภาพ`, 'เด็กหญิงอยู่ทางขวาของภาพ'] },
    },
    {
      id: 'm-dress-ordinal-t', compact: true, type: 'transfer', subject: 'math', skillIds: ['ordinal-number'], familyId: 'sequence-ordinal', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([3, 4, 2, 1], 2)} เป็นภาพที่เท่าไรของเรื่อง`, speech: speak(`ภาพ ${lab([3, 4, 2, 1], 2)} เป็นภาพที่เท่าไรของเรื่อง`) },
      visual: panels('fish', [3, 4, 2, 1]),
      options: words('ภาพที่ 1', 'ภาพที่ 3', 'ภาพที่ 2'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ภาพ ${lab([3, 4, 2, 1], 2)} เทอาหารปลาจากกล่อง เป็นภาพที่ 2`, hints: [], steps: [`เรียงได้ ${order([3, 4, 2, 1])}`, `ภาพ ${lab([3, 4, 2, 1], 2)} อยู่ลำดับที่ 2`] },
    },
    {
      id: 'r-fish-order-t', compact: true, type: 'transfer', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพการทำไข่ทอดถูกสลับที่ ข้อใดเรียงลำดับเหตุการณ์ได้ถูกต้อง' },
      visual: panels('egg', [2, 4, 1, 3]),
      options: orderOptions([2, 4, 1, 3], 2),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `กระทะว่าง ตอกไข่ลงกระทะ ไข่ทอดสุก กินไข่ทอด เรียงได้ ${order([2, 4, 1, 3])}`, hints: [], steps: ['ภาพแรกคือกระทะยังว่างและไข่อยู่ในชาม', 'ต่อด้วยตอกไข่ลงกระทะ ไข่ทอดสุก และกินไข่ทอดเป็นภาพสุดท้าย'] },
    },
    {
      id: 'r-fish-first-t', compact: true, type: 'transfer', subject: 'reasoning', skillIds: ['sequence-first'], familyId: 'sequence-first', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพการแต่งตัวถูกสลับที่ ภาพใดเกิดขึ้นเป็นภาพแรก', speech: 'ภาพการแต่งตัวถูกสลับที่ ภาพใดเกิดขึ้นเป็นภาพแรก' },
      visual: panels('dress', [4, 2, 3, 1]),
      options: labelOptions([lab([4, 2, 3, 1], 4), lab([4, 2, 3, 1], 2), lab([4, 2, 3, 1], 1)]),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ภาพ ${lab([4, 2, 3, 1], 1)} ยังไม่ได้สวมเสื้อ เป็นภาพแรก`, hints: [], steps: [`ภาพ ${lab([4, 2, 3, 1], 1)} เด็กหญิงใส่เสื้อกล้าม เสื้อยืดยังวางบนเตียง`, 'ภาพอื่นสวมเสื้อแล้วหรือแต่งตัวเสร็จแล้ว'] },
    },
    {
      id: 'm-fish-count-t', type: 'transfer', subject: 'math', skillIds: ['story-count'], familyId: 'picture-count', difficulty: 1,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ในภาพ ${lab([3, 1, 4, 2], 1)} มีคนกี่คน`, speech: speak(`ในภาพ ${lab([3, 1, 4, 2], 1)} มีคนกี่คน`) },
      visual: panels('egg', [3, 1, 4, 2]),
      options: words('1 คน', '2 คน', '3 คน'),
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: `ภาพ ${lab([3, 1, 4, 2], 1)} มีแม่และเด็กหญิง 2 คน`, hints: [], steps: [`ในภาพ ${lab([3, 1, 4, 2], 1)} เด็กหญิงอยู่ทางซ้าย แม่อยู่ทางขวา`, 'นับได้ 2 คน'] },
    },
    {
      id: 'g-fish-care-t', type: 'transfer', subject: 'general', skillIds: ['animal-care'], familyId: 'animal-care', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'ถ้าเราปลูกต้นไม้ ควรทำอย่างไรให้ต้นไม้เจริญเติบโตดี' },
      options: words('วางไว้ในที่มืดสนิท', 'รดน้ำและให้ได้รับแสงแดด', 'เหยียบดินให้แน่นมากๆ'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ต้องรดน้ำและให้ต้นไม้ได้รับแสงแดด', hints: [], steps: ['ที่มืดสนิทไม่มีแสงแดด และเหยียบดินแน่นทำให้รากโตยาก', 'รดน้ำและให้ได้รับแสงแดดทำให้ต้นไม้โตดี'] },
    },
    {
      id: 'r-tree-order-t', compact: true, type: 'transfer', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพการแต่งตัวถูกสลับที่ ข้อใดเรียงลำดับเหตุการณ์ได้ถูกต้อง' },
      visual: panels('dress', [2, 4, 3, 1]),
      options: orderOptions([2, 4, 3, 1], 1),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ยืนข้างเตียง สวมเสื้อ ใส่กางเกง แต่งตัวเสร็จ เรียงได้ ${order([2, 4, 3, 1])}`, hints: [], steps: ['ภาพแรกคือเสื้อกับกางเกงยังวางบนเตียง', 'ต่อด้วยสวมเสื้อ ใส่กางเกง และแต่งตัวเสร็จเป็นภาพสุดท้าย'] },
    },
    {
      id: 'th-tree-caption-t', type: 'transfer', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([3, 1, 4, 2], 2)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab([3, 1, 4, 2], 2)} ตรงกับประโยคใด`) },
      visual: panels('fish', [3, 1, 4, 2]),
      options: words('เด็กหญิงกำลังจับปลา', 'เด็กหญิงเทอาหารปลาลงในโหล', 'เด็กหญิงล้างโหลปลา'),
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: `ภาพ ${lab([3, 1, 4, 2], 2)} เด็กหญิงเทอาหารปลาลงในโหล`, hints: [], steps: [`ภาพ ${lab([3, 1, 4, 2], 2)} เด็กหญิงถือกล่องเทอาหารปลาลงในโหล`, 'จึงตรงกับประโยคข้อ 2'] },
    },
    {
      id: 'sc-tree-water-t', type: 'transfer', subject: 'science', skillIds: ['plants'], familyId: 'plants', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ถ้าไม่รดน้ำต้นไม้เป็นเวลานาน ต้นไม้จะเป็นอย่างไร' },
      options: words('โตเร็วขึ้น', 'เหี่ยวเฉา', 'มีดอกมากขึ้น'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ต้นไม้ขาดน้ำจะเหี่ยวเฉา', hints: [], steps: ['ต้นไม้ต้องการน้ำเพื่อเจริญเติบโต', 'ถ้าไม่รดน้ำนานๆ ต้นไม้จะเหี่ยวเฉา'] },
    },
    {
      id: 'm-tree-ordinal-t', compact: true, type: 'transfer', subject: 'math', skillIds: ['ordinal-number'], familyId: 'sequence-ordinal', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([2, 1, 4, 3], 4)} เป็นภาพที่เท่าไรของเรื่อง`, speech: speak(`ภาพ ${lab([2, 1, 4, 3], 4)} เป็นภาพที่เท่าไรของเรื่อง`) },
      visual: panels('dress', [2, 1, 4, 3]),
      options: words('ภาพที่ 3', 'ภาพที่ 1', 'ภาพที่ 4'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ภาพ ${lab([2, 1, 4, 3], 4)} แต่งตัวเสร็จ เป็นภาพที่ 4`, hints: [], steps: [`เรียงได้ ${order([2, 1, 4, 3])}`, `ภาพ ${lab([2, 1, 4, 3], 4)} อยู่ลำดับที่ 4`] },
    },
    {
      id: 'g-egg-order-t', compact: true, type: 'transfer', subject: 'general', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพการให้อาหารปลาถูกสลับที่ ข้อใดเรียงลำดับเหตุการณ์ได้ถูกต้อง' },
      visual: panels('fish', [4, 1, 3, 2]),
      options: orderOptions([4, 1, 3, 2], 1),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `มีโหลกับกล่องอาหาร เทอาหาร โรยอาหารให้ปลามากิน ปลากินและเด็กหญิงยิ้ม เรียงได้ ${order([4, 1, 3, 2])}`, hints: [], steps: ['ภาพแรกคือมีโหลกับกล่องอาหารปลา ยังไม่ได้ให้อาหาร', 'ต่อด้วยเทอาหาร โรยอาหารให้ปลามากิน และปลากินอาหารเป็นภาพสุดท้าย'] },
    },
    {
      id: 'r-egg-final-t', compact: true, type: 'transfer', subject: 'reasoning', skillIds: ['sequence-last'], familyId: 'sequence-last', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพการปลูกต้นไม้ถูกสลับที่ ภาพใดเกิดขึ้นเป็นภาพสุดท้าย', speech: 'ภาพการปลูกต้นไม้ถูกสลับที่ ภาพใดเกิดขึ้นเป็นภาพสุดท้าย' },
      visual: panels('tree', [2, 4, 1, 3]),
      options: labelOptions([lab([2, 4, 1, 3], 1), lab([2, 4, 1, 3], 3), lab([2, 4, 1, 3], 4)]),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ภาพ ${lab([2, 4, 1, 3], 4)} ต้นไม้ใหญ่มีผลแอปเปิ้ล เกิดหลังสุด`, hints: [], steps: [`ภาพ ${lab([2, 4, 1, 3], 4)} ต้นไม้โตเต็มที่และมีผลสีแดง`, 'ภาพอื่นเป็นตอนขุดดิน หรือต้นไม้ยังเล็กอยู่ ตอบข้อ 3'] },
    },
    {
      id: 'th-egg-caption-t', type: 'transfer', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([2, 4, 3, 1], 4)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab([2, 4, 3, 1], 4)} ตรงกับประโยคใด`) },
      visual: panels('dress', [2, 4, 3, 1]),
      options: words('เด็กหญิงกำลังนอนหลับ', 'เด็กหญิงแต่งตัวเสร็จแล้วยืนยิ้ม', 'เด็กหญิงกำลังสวมเสื้อ'),
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: `ภาพ ${lab([2, 4, 3, 1], 4)} เด็กหญิงแต่งตัวเสร็จแล้วยืนยิ้ม`, hints: [], steps: [`ภาพ ${lab([2, 4, 3, 1], 4)} เด็กหญิงสวมเสื้อและกางเกงครบแล้ว ยืนยิ้ม`, 'จึงตรงกับประโยคข้อ 2'] },
    },
  ],
};
