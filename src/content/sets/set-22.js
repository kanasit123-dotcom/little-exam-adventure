/*
 * ชุดที่ 22 — เรียงลำดับเหตุการณ์เรื่องใหม่ (แผ่นรูป I: design/PROMPTS-gemini-9.md) แบบ 15 ข้อ
 * ภาพเรื่องราว 4 ภาพถูกสลับที่และติดป้าย ก ข ค ง แล้วถามหลายข้อจากภาพชุดเดียว (เหมือนชุด 17):
 * จัดกระเป๋า 5 ข้อ, วันฝนตก 5 ข้อ, กิจวัตรตอนเช้า 2 ข้อ, วาดรูป 2 ข้อ, ข้อเดี่ยว 1 ข้อ
 * แต่งใหม่ทั้งหมด; ลำดับที่ถูกและป้ายภาพคำนวณจากรายการสลับที่ (shuffle) ด้วยฟังก์ชันด้านล่าง จึงไม่ผิดพลาดเวลาเปลี่ยนการสลับ
 * (tests/sequence.test.mjs ตรวจเทียบกับลำดับจริงของไฟล์ภาพ pic-seq-<เรื่อง>-<ลำดับ>)
 */
const R = { provenance: 'original', rights: 'แต่งใหม่ทั้งหมด (ข้อความ ตัวเลข ภาพ) เผยแพร่ใน repo นี้ได้', reviewStatus: 'draft' };
const SRC = 'src-a24-compilation';
const SEQ = 'เรียงลำดับเหตุการณ์ให้ถูกต้อง';

// ---------------------------------------------------------------- ตัวช่วย (เหมือนชุด 17)
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
const stimulusFor = (kind, list) => ({
  section: SEQ,
  textHidden: true,   // ข้อความนี้อ่านออกเสียงอย่างเดียว ไม่แสดงเป็นแถบเรื่อง (ให้ภาพใหญ่ขึ้น)
  text: 'ภาพเหตุการณ์ 4 ภาพ ติดป้ายกำกับ ก ข ค ง ดูภาพทั้งหมดแล้วตอบคำถาม',
  speech: 'ภาพเหตุการณ์ 4 ภาพ ติดป้ายกำกับ กอ ขอ คอ งอ ดูภาพทั้งหมดแล้วตอบคำถาม',
  visual: panels(kind, list),
});
const fig = (id, figure) => ({ id, svg: { figure } });
const arrow = (direction) => ({ arrow: direction });

// การสลับที่ของแต่ละเรื่อง (ข้อหลัก) — เลขในวงเล็บคือลำดับเหตุการณ์จริงของภาพที่ติดป้าย ก ข ค ง
const SA = [2, 4, 1, 3];   // จัดกระเป๋า: ก=ใส่หนังสือ ข=สะพายกระเป๋า ค=ของวางบนโต๊ะ ง=ใส่ของที่เหลือ
const SB = [4, 1, 3, 2];   // วันฝนตก: ก=รุ้ง ข=ฟ้าใส ค=กางร่มเดิน ง=ฝนตกหนัก
const SC = [3, 1, 4, 2];   // ตอนเช้า: ก=กินอาหารเช้า ข=นอนหลับ ค=ใส่รองเท้า ง=ตื่นยืดแขน
const SD = [2, 4, 1, 3];   // วาดรูป: ก=ร่างเส้น ข=ชูภาพให้ผู้ใหญ่ ค=กระดาษเปล่า ง=ระบายสี

export default {
  id: 'set-22',
  version: 1,
  title: 'ชุดที่ 22',
  note: 'เรียงลำดับเหตุการณ์ จัดกระเป๋า วันฝนตก ตอนเช้า วาดรูป',
  order: [
    'r-bag-order', 'r-bag-last', 'th-bag-caption', 'm-bag-ordinal', 'g-bag-need',
    'r-rain-order', 'th-rain-caption', 'sc-rain-rainbow', 'g-rain-umbrella', 'm-rain-ordinal',
    'g-morning-order', 'th-morning-caption', 'sc-draw-color', 'sp-draw-right', 'sp-arrow-cycle',
  ],
  stimuli: {
    bag: stimulusFor('bag', SA),
    rain: stimulusFor('rain', SB),
    morning: stimulusFor('morning', SC),
    draw: stimulusFor('draw', SD),
  },
  items: [
    // ================================================================ ช่วงที่ 1: จัดกระเป๋า
    {
      id: 'r-bag-order', compact: true, type: 'main', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, stimulus: 'bag',
      prompt: { text: 'ข้อใดเรียงลำดับเหตุการณ์การจัดกระเป๋าไปโรงเรียนได้ถูกต้อง' },
      options: orderOptions(SA, 2),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ (เป็นชื่อป้ายภาพ) เด็กต้องดูภาพและเรียงลำดับเอง',
      review: {
        summary: `ของวางบนโต๊ะ ใส่หนังสือ ใส่ของที่เหลือ แล้วสะพายกระเป๋า เรียงได้ ${order(SA)}`,
        hints: ['ภาพแรกคือของทุกอย่างยังวางอยู่บนโต๊ะ ส่วนภาพสุดท้ายคือสะพายกระเป๋าแล้ว'],
        steps: [`ภาพ ${lab(SA, 1)} ของยังอยู่บนโต๊ะทั้งหมด เป็นภาพแรก ภาพ ${lab(SA, 2)} ใส่หนังสือลงกระเป๋า`, `ภาพ ${lab(SA, 3)} ใส่ของที่เหลือ แล้วภาพ ${lab(SA, 4)} สะพายกระเป๋าเป็นภาพสุดท้าย ตอบข้อ 2`],
        transferIds: ['r-draw-order-t'],
      },
    },
    {
      id: 'r-bag-last', compact: true, type: 'main', subject: 'reasoning', skillIds: ['sequence-last'], familyId: 'sequence-last', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'bag',
      prompt: { text: 'ภาพใดเกิดขึ้นเป็นภาพสุดท้าย', speech: 'ภาพใดเกิดขึ้นเป็นภาพสุดท้าย' },
      options: labelOptions([lab(SA, 1), lab(SA, 2), lab(SA, 4)]),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ เด็กต้องดูภาพแล้วหาภาพที่เกิดหลังสุด',
      review: {
        summary: `ภาพ ${lab(SA, 4)} สะพายกระเป๋า เกิดหลังสุด`,
        hints: ['ภาพไหนที่เด็กหญิงจัดกระเป๋าเสร็จแล้ว พร้อมไปโรงเรียน'],
        steps: [`ภาพ ${lab(SA, 4)} เด็กหญิงสะพายกระเป๋าที่ปิดแล้ว จัดเสร็จแล้ว`, `ภาพ ${lab(SA, 1)} และภาพ ${lab(SA, 2)} ยังจัดไม่เสร็จ ตอบข้อ 3`],
        transferIds: ['r-rain-last-t'],
      },
    },
    {
      id: 'th-bag-caption', type: 'main', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'bag',
      prompt: { text: `ภาพ ${lab(SA, 2)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab(SA, 2)} ตรงกับประโยคใด`) },
      options: [{ id: 'a', text: 'เด็กหญิงใส่หนังสือลงในกระเป๋า' }, { id: 'b', text: 'เด็กหญิงสะพายกระเป๋า' }, { id: 'c', text: 'เด็กหญิงเล่นตุ๊กตาบนโต๊ะ' }],
      correctOptionId: 'a',
      narration: 'ฟังตัวเลือกได้ วัดการจับคู่ภาพกับประโยค',
      review: {
        summary: `ภาพ ${lab(SA, 2)} เด็กหญิงกำลังใส่หนังสือลงกระเป๋า`,
        hints: ['ดูว่าเด็กหญิงถืออะไรอยู่ในมือ'],
        steps: [`ภาพ ${lab(SA, 2)} เด็กหญิงถือหนังสือวางลงในกระเป๋าที่เปิดอยู่`, 'จึงตรงกับประโยค เด็กหญิงใส่หนังสือลงในกระเป๋า ตอบข้อ 1'],
        transferIds: ['th-morning-caption-t'],
      },
    },
    {
      id: 'm-bag-ordinal', compact: true, type: 'main', subject: 'math', skillIds: ['ordinal-number'], familyId: 'sequence-ordinal', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'bag',
      prompt: { text: `ภาพ ${lab(SA, 3)} เป็นภาพที่เท่าไรของเรื่อง`, speech: speak(`ภาพ ${lab(SA, 3)} เป็นภาพที่เท่าไรของเรื่อง`) },
      options: [{ id: 'a', text: 'ภาพที่ 2' }, { id: 'b', text: 'ภาพที่ 3' }, { id: 'c', text: 'ภาพที่ 4' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดลำดับที่จากการเรียงเหตุการณ์',
      review: {
        summary: `ภาพ ${lab(SA, 3)} ใส่ของที่เหลือ เป็นภาพที่ 3`,
        hints: ['เรียงเหตุการณ์ก่อน แล้วนับว่าภาพนี้อยู่ลำดับที่เท่าไร'],
        steps: [`เรียงได้ ${order(SA)} นับ ${lab(SA, 1)} หนึ่ง ${lab(SA, 2)} สอง ${lab(SA, 3)} สาม ${lab(SA, 4)} สี่`, `ภาพ ${lab(SA, 3)} เป็นภาพที่ 3 ตอบข้อ 2`],
        transferIds: ['m-draw-ordinal-t'],
      },
    },
    {
      id: 'g-bag-need', type: 'main', subject: 'general', skillIds: ['school-things'], familyId: 'school-things', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'bag',
      prompt: { text: 'ข้อใดควรเก็บใส่กระเป๋าไปโรงเรียน' },
      options: [{ id: 'a', text: 'ตุ๊กตาตัวใหญ่ๆ หลายตัว' }, { id: 'b', text: 'ของเล่นทั้งหมดที่บ้าน' }, { id: 'c', text: 'หนังสือและกล่องดินสอ' }],
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องของที่ใช้เรียน',
      review: {
        summary: 'ไปเรียนต้องมีหนังสือและกล่องดินสอ',
        hints: ['ที่โรงเรียนเราใช้อะไรเรียนและเขียน'],
        steps: ['ตุ๊กตาและของเล่นไม่ใช่ของที่ใช้เรียน และทำให้กระเป๋าหนัก', 'หนังสือและกล่องดินสอใช้เรียนที่โรงเรียน ตอบข้อ 3'],
        transferIds: ['g-bag-sport-t'],
      },
    },

    // ================================================================ ช่วงที่ 2: วันฝนตก
    {
      id: 'r-rain-order', compact: true, type: 'main', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, stimulus: 'rain',
      prompt: { text: 'ข้อใดเรียงลำดับเหตุการณ์วันฝนตกได้ถูกต้อง' },
      options: orderOptions(SB, 1),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ (เป็นชื่อป้ายภาพ) เด็กต้องดูภาพและเรียงลำดับเอง',
      review: {
        summary: `ฟ้าใส ฝนตกหนัก กางร่มเดิน แล้วรุ้งขึ้น เรียงได้ ${order(SB)}`,
        hints: ['ฝนตกต้องมาหลังฟ้าใส และรุ้งมักขึ้นหลังฝนหยุด'],
        steps: [`ภาพ ${lab(SB, 1)} ฟ้าใส เป็นภาพแรก ภาพ ${lab(SB, 2)} ฝนตกหนัก`, `ภาพ ${lab(SB, 3)} กางร่มเดินท่ามกลางฝน และภาพ ${lab(SB, 4)} ฝนหยุดมีรุ้ง เป็นภาพสุดท้าย ตอบข้อ 1`],
        transferIds: ['r-bag-order-t'],
      },
    },
    {
      id: 'th-rain-caption', type: 'main', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'rain',
      prompt: { text: `ภาพ ${lab(SB, 3)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab(SB, 3)} ตรงกับประโยคใด`) },
      options: [{ id: 'a', text: 'เด็กหญิงยืนอยู่หน้าบ้านตอนฟ้าใส' }, { id: 'b', text: 'เด็กหญิงกางร่มเดินท่ามกลางฝน' }, { id: 'c', text: 'เด็กหญิงดูรุ้งหลังฝนหยุด' }],
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้ วัดการจับคู่ภาพกับประโยค',
      review: {
        summary: `ภาพ ${lab(SB, 3)} เด็กหญิงถือร่มสีแดงเดินกลางฝน`,
        hints: ['ดูว่าเด็กหญิงถืออะไร และท้องฟ้าเป็นอย่างไร'],
        steps: [`ภาพ ${lab(SB, 3)} เด็กหญิงถือร่มสีแดงและมีฝนตกลงมาโดยรอบ`, 'จึงตรงกับประโยค เด็กหญิงกางร่มเดินท่ามกลางฝน ตอบข้อ 2'],
        transferIds: ['th-draw-caption-t'],
      },
    },
    {
      id: 'sc-rain-rainbow', type: 'main', subject: 'science', skillIds: ['weather'], familyId: 'weather', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'rain',
      prompt: { text: `รุ้งในภาพ ${lab(SB, 4)} มักเกิดขึ้นเมื่อใด`, speech: speak(`รุ้งในภาพ ${lab(SB, 4)} มักเกิดขึ้นเมื่อใด`) },
      options: [{ id: 'a', text: 'ตอนที่หิมะตก' }, { id: 'b', text: 'ตอนกลางคืนมืดสนิท' }, { id: 'c', text: 'หลังฝนตกขณะที่มีแสงแดด' }],
      correctOptionId: 'c',
      narration: 'ฟังตัวเลือกได้ วัดความรู้เรื่องปรากฏการณ์ในท้องฟ้า',
      review: {
        summary: 'รุ้งเกิดเมื่อมีแสงแดดส่องผ่านละอองฝน',
        hints: ['ในภาพที่มีรุ้ง ฝนหยุดแล้วและมีแสงแดด'],
        steps: ['เมืองไทยไม่มีหิมะ และตอนกลางคืนไม่มีแสงแดดทำให้เกิดรุ้ง', 'รุ้งเกิดหลังฝนตกขณะที่มีแสงแดดส่อง ตอบข้อ 3'],
        transferIds: ['sc-cloud-t'],
      },
    },
    {
      id: 'g-rain-umbrella', type: 'main', subject: 'general', skillIds: ['safety'], familyId: 'safety-rain', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'rain',
      prompt: { text: 'ถ้าฝนตกขณะที่หนูต้องเดินไปโรงเรียน ควรทำอย่างไร' },
      options: [{ id: 'a', text: 'กางร่มหรือสวมเสื้อกันฝน' }, { id: 'b', text: 'วิ่งเล่นกลางฝนให้เปียก' }, { id: 'c', text: 'ยืนตากฝนนานๆ' }],
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องการดูแลตัวเองเมื่อฝนตก',
      review: {
        summary: 'กางร่มหรือใส่เสื้อกันฝน จะได้ไม่เปียกและไม่ป่วย',
        hints: ['ทำอย่างไรไม่ให้ตัวเปียกฝน'],
        steps: ['ตากฝนหรือวิ่งเล่นกลางฝนทำให้เปียกและป่วยได้', 'ควรกางร่มหรือสวมเสื้อกันฝน ตอบข้อ 1'],
        transferIds: ['g-thunder-t'],
      },
    },
    {
      id: 'm-rain-ordinal', compact: true, type: 'main', subject: 'math', skillIds: ['ordinal-number'], familyId: 'sequence-ordinal', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'rain',
      prompt: { text: `ภาพ ${lab(SB, 2)} เป็นภาพที่เท่าไรของเรื่อง`, speech: speak(`ภาพ ${lab(SB, 2)} เป็นภาพที่เท่าไรของเรื่อง`) },
      options: [{ id: 'a', text: 'ภาพที่ 2' }, { id: 'b', text: 'ภาพที่ 3' }, { id: 'c', text: 'ภาพที่ 4' }],
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดลำดับที่จากการเรียงเหตุการณ์',
      review: {
        summary: `ภาพ ${lab(SB, 2)} ฝนตกหนัก เป็นภาพที่ 2`,
        hints: ['เรียงเหตุการณ์ก่อน แล้วนับว่าภาพนี้อยู่ลำดับที่เท่าไร'],
        steps: [`เรียงได้ ${order(SB)} นับ ${lab(SB, 1)} หนึ่ง ${lab(SB, 2)} สอง ${lab(SB, 3)} สาม ${lab(SB, 4)} สี่`, `ภาพ ${lab(SB, 2)} เป็นภาพที่ 2 ตอบข้อ 1`],
        transferIds: ['m-rain-ordinal-t'],
      },
    },

    // ================================================================ ช่วงที่ 3: ตอนเช้า วาดรูป และข้อเดี่ยว
    {
      id: 'g-morning-order', compact: true, type: 'main', subject: 'general', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, stimulus: 'morning',
      prompt: { text: 'ข้อใดเรียงลำดับกิจวัตรตอนเช้าได้ถูกต้อง' },
      options: orderOptions(SC, 2),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ (เป็นชื่อป้ายภาพ) เด็กต้องดูภาพและเรียงลำดับเอง',
      review: {
        summary: `นอนหลับ ตื่นยืดแขน กินอาหารเช้า แล้วใส่รองเท้า เรียงได้ ${order(SC)}`,
        hints: ['ต้องตื่นนอนก่อน แล้วกินอาหารเช้า ก่อนออกจากบ้าน'],
        steps: [`ภาพ ${lab(SC, 1)} นอนหลับ เป็นภาพแรก ภาพ ${lab(SC, 2)} ตื่นนอนยืดแขน`, `ภาพ ${lab(SC, 3)} กินอาหารเช้า แล้วภาพ ${lab(SC, 4)} ใส่รองเท้าจะไปโรงเรียน เป็นภาพสุดท้าย ตอบข้อ 2`],
        transferIds: ['g-sandwich-order-t'],
      },
    },
    {
      id: 'th-morning-caption', type: 'main', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'morning',
      prompt: { text: `ภาพ ${lab(SC, 3)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab(SC, 3)} ตรงกับประโยคใด`) },
      options: [{ id: 'a', text: 'เด็กหญิงนอนหลับอยู่บนเตียง' }, { id: 'b', text: 'เด็กหญิงยืดแขนหลังตื่นนอน' }, { id: 'c', text: 'เด็กหญิงนั่งกินอาหารเช้า' }],
      correctOptionId: 'c',
      narration: 'ฟังตัวเลือกได้ วัดการจับคู่ภาพกับประโยค',
      review: {
        summary: `ภาพ ${lab(SC, 3)} เด็กหญิงนั่งที่โต๊ะ มีชามข้าวต้มอยู่ตรงหน้า`,
        hints: ['ดูว่าเด็กหญิงถืออะไรอยู่ และมีอะไรวางตรงหน้า'],
        steps: [`ภาพ ${lab(SC, 3)} เด็กหญิงถือช้อนและมีชามอาหารกับแก้วน้ำวางอยู่`, 'จึงตรงกับประโยค เด็กหญิงนั่งกินอาหารเช้า ตอบข้อ 3'],
        transferIds: ['th-seedling-caption-t'],
      },
    },
    {
      id: 'sc-draw-color', type: 'main', subject: 'science', skillIds: ['color-mixing'], familyId: 'color-mixing', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'draw',
      prompt: { text: 'ถ้านำสีเทียนสีแดงกับสีเหลืองมาผสมกัน จะได้สีอะไร' },
      options: [{ id: 'a', text: 'สีเขียว' }, { id: 'b', text: 'สีส้ม' }, { id: 'c', text: 'สีม่วง' }],
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้ วัดความรู้เรื่องการผสมสี',
      review: {
        summary: 'สีแดงผสมกับสีเหลืองได้สีส้ม',
        hints: ['นึกถึงสีของส้ม ซึ่งอยู่ระหว่างสีแดงกับสีเหลือง'],
        steps: ['สีเขียวได้จากสีเหลืองผสมสีน้ำเงิน และสีม่วงได้จากสีแดงผสมสีน้ำเงิน', 'สีแดงผสมสีเหลืองได้สีส้ม ตอบข้อ 2'],
        transferIds: ['sc-color-blue-t'],
      },
    },
    {
      id: 'sp-draw-right', type: 'main', subject: 'spatial', skillIds: ['left-right-picture'], familyId: 'left-right-picture', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'draw',
      prompt: { text: `ในภาพ ${lab(SD, 4)} ใครอยู่ทางขวามือของภาพ`, speech: speak(`ในภาพ ${lab(SD, 4)} ใครอยู่ทางขวามือของภาพ`) },
      options: [{ id: 'a', text: 'เด็กหญิง' }, { id: 'b', text: 'ไม่มีใคร' }, { id: 'c', text: 'ผู้ใหญ่' }],
      correctOptionId: 'c',
      narration: 'ฟังตัวเลือกได้ วัดการบอกตำแหน่งซ้ายขวาในภาพ (ซ้ายขวาของภาพ ไม่ใช่ของตัวคนในภาพ)',
      review: {
        summary: `ในภาพ ${lab(SD, 4)} ผู้ใหญ่ยืนอยู่ทางขวาของภาพ`,
        hints: ['มองภาพ แล้วดูว่าใครอยู่ทางด้านขวามือของเรา'],
        steps: [`ในภาพ ${lab(SD, 4)} เด็กหญิงอยู่ทางซ้ายของภาพ`, 'ผู้ใหญ่อยู่ทางขวาของภาพ ตอบข้อ 3'],
        transferIds: ['sp-draw-left-t'],
      },
    },
    {
      id: 'sp-arrow-cycle', type: 'main', subject: 'spatial', skillIds: ['figure-sequence'], familyId: 'arrow-sequence', difficulty: 2,
      sourceId: SRC, ...R, section: 'ภาพต่อเนื่อง ภาพที่หายไปควรเป็นภาพใด',
      prompt: { text: 'ลูกศรหมุนตามเข็มนาฬิกาไปทีละหนึ่งในสี่ของรอบ ช่อง ? ควรเป็นภาพใด' },
      visual: { type: 'figure-row', items: [arrow('up'), arrow('right'), arrow('down'), arrow('left'), '?'] },
      options: [fig('a', arrow('up')), fig('b', arrow('right')), fig('c', arrow('left')), fig('d', arrow('down'))],
      correctOptionId: 'a',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ) วัดการต่อภาพที่หมุนเป็นรอบ',
      review: {
        summary: 'ลูกศรหมุนครบหนึ่งรอบแล้วกลับมาชี้ขึ้น',
        hints: ['ลูกศรชี้ ขึ้น ขวา ลง ซ้าย แล้วจะเป็นอย่างไรต่อ'],
        steps: ['ลูกศรหมุนไปทีละหนึ่งในสี่ของรอบ จาก ขึ้น ขวา ลง ซ้าย', 'ต่อจากชี้ซ้ายคือกลับมาชี้ขึ้น ตอบข้อ 1'],
        transferIds: ['sp-arrow-cycle-t'],
      },
    },

    // ================================================================ โจทย์ลองใหม่ (เปิดในหน้าเฉลย ไม่นับเป็นข้อสอบ)
    {
      id: 'r-draw-order-t', compact: true, type: 'transfer', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพการวาดรูปถูกสลับที่ ข้อใดเรียงลำดับเหตุการณ์ได้ถูกต้อง' },
      visual: panels('draw', [3, 1, 4, 2]),
      options: orderOptions([3, 1, 4, 2], 3),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `กระดาษเปล่า ร่างเส้น ระบายสี ชูภาพให้ดู เรียงได้ ${order([3, 1, 4, 2])}`, hints: [], steps: ['ภาพแรกคือกระดาษยังว่างเปล่า แล้วจึงร่างเส้น', 'ต่อด้วยระบายสี และชูภาพให้ผู้ใหญ่ดูเป็นภาพสุดท้าย'] },
    },
    {
      id: 'r-rain-last-t', compact: true, type: 'transfer', subject: 'reasoning', skillIds: ['sequence-last'], familyId: 'sequence-last', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพวันฝนตกถูกสลับที่ ภาพใดเกิดขึ้นเป็นภาพสุดท้าย', speech: 'ภาพวันฝนตกถูกสลับที่ ภาพใดเกิดขึ้นเป็นภาพสุดท้าย' },
      visual: panels('rain', [2, 4, 1, 3]),
      options: labelOptions(['ก', 'ค', lab([2, 4, 1, 3], 4)]),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ภาพ ${lab([2, 4, 1, 3], 4)} รุ้งขึ้นหลังฝนหยุด เกิดหลังสุด`, hints: [], steps: [`ภาพ ${lab([2, 4, 1, 3], 4)} ฝนหยุดแล้วมีรุ้ง`, 'ภาพอื่นยังฟ้าใสหรือฝนยังตก ตอบข้อ 3'] },
    },
    {
      id: 'th-morning-caption-t', type: 'transfer', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([4, 2, 1, 3], 4)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab([4, 2, 1, 3], 4)} ตรงกับประโยคใด`) },
      visual: panels('morning', [4, 2, 1, 3]),
      options: [{ id: 'a', text: 'เด็กหญิงยืนใส่รองเท้าที่หน้าประตู' }, { id: 'b', text: 'เด็กหญิงนอนหลับสนิท' }, { id: 'c', text: 'เด็กหญิงกินข้าวที่โต๊ะ' }],
      correctOptionId: 'a',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: `ภาพ ${lab([4, 2, 1, 3], 4)} เด็กหญิงใส่รองเท้าที่หน้าประตู`, hints: [], steps: [`ภาพ ${lab([4, 2, 1, 3], 4)} เด็กหญิงอยู่ที่ประตู มีกระเป๋าวางข้างเท้า`, 'ถือรองเท้าจะใส่ จึงตรงกับประโยคข้อ 1'] },
    },
    {
      id: 'm-draw-ordinal-t', compact: true, type: 'transfer', subject: 'math', skillIds: ['ordinal-number'], familyId: 'sequence-ordinal', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([3, 4, 1, 2], 4)} เป็นภาพที่เท่าไรของเรื่อง`, speech: speak(`ภาพ ${lab([3, 4, 1, 2], 4)} เป็นภาพที่เท่าไรของเรื่อง`) },
      visual: panels('draw', [3, 4, 1, 2]),
      options: [{ id: 'a', text: 'ภาพที่ 1' }, { id: 'b', text: 'ภาพที่ 4' }, { id: 'c', text: 'ภาพที่ 3' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ภาพ ${lab([3, 4, 1, 2], 4)} ชูภาพให้ผู้ใหญ่ดู เป็นภาพที่ 4`, hints: [], steps: [`เรียงได้ ${order([3, 4, 1, 2])}`, `ภาพ ${lab([3, 4, 1, 2], 4)} อยู่ลำดับที่ 4`] },
    },
    {
      id: 'g-bag-sport-t', type: 'transfer', subject: 'general', skillIds: ['school-things'], familyId: 'school-things', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'พรุ่งนี้โรงเรียนมีเรียนพละ ควรนำอะไรไปโรงเรียนด้วย' },
      options: [{ id: 'a', text: 'ชุดกีฬา' }, { id: 'b', text: 'ชุดนอน' }, { id: 'c', text: 'ผ้าห่ม' }],
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'เรียนพละต้องใส่ชุดกีฬา', hints: [], steps: ['ชุดนอนและผ้าห่มใช้ตอนนอน', 'เรียนพละต้องใช้ชุดกีฬา'] },
    },
    {
      id: 'r-bag-order-t', compact: true, type: 'transfer', subject: 'reasoning', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพการจัดกระเป๋าถูกสลับที่ ข้อใดเรียงลำดับเหตุการณ์ได้ถูกต้อง' },
      visual: panels('bag', [4, 3, 1, 2]),
      options: orderOptions([4, 3, 1, 2], 1),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ของบนโต๊ะ ใส่หนังสือ ใส่ของที่เหลือ สะพายกระเป๋า เรียงได้ ${order([4, 3, 1, 2])}`, hints: [], steps: ['ภาพแรกคือของทุกอย่างยังวางอยู่บนโต๊ะ', 'ภาพสุดท้ายคือสะพายกระเป๋าที่จัดเสร็จแล้ว'] },
    },
    {
      id: 'th-draw-caption-t', type: 'transfer', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([4, 3, 1, 2], 2)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab([4, 3, 1, 2], 2)} ตรงกับประโยคใด`) },
      visual: panels('draw', [4, 3, 1, 2]),
      options: [{ id: 'a', text: 'เด็กหญิงชูภาพให้ผู้ใหญ่ดู' }, { id: 'b', text: 'เด็กหญิงระบายสีรูปบ้าน' }, { id: 'c', text: 'เด็กหญิงวางดินสอบนกระดาษเปล่า' }],
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: `ภาพ ${lab([4, 3, 1, 2], 2)} เด็กหญิงใช้สีเทียนระบายรูปบ้าน`, hints: [], steps: [`ภาพ ${lab([4, 3, 1, 2], 2)} มีรูปบ้านและดวงอาทิตย์ที่กำลังถูกระบายสี`, 'จึงตรงกับประโยค เด็กหญิงระบายสีรูปบ้าน'] },
    },
    {
      id: 'sc-cloud-t', type: 'transfer', subject: 'science', skillIds: ['weather'], familyId: 'weather', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'ฝนตกลงมาจากอะไร' },
      options: [{ id: 'a', text: 'ก้อนหิน' }, { id: 'b', text: 'เมฆ' }, { id: 'c', text: 'ต้นไม้' }],
      correctOptionId: 'b',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: 'ฝนตกลงมาจากเมฆ', hints: [], steps: ['ก้อนหินและต้นไม้ไม่ทำให้เกิดฝน', 'ไอน้ำรวมกันเป็นเมฆแล้วตกลงมาเป็นฝน'] },
    },
    {
      id: 'g-thunder-t', type: 'transfer', subject: 'general', skillIds: ['safety'], familyId: 'safety-rain', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ถ้าได้ยินเสียงฟ้าร้องดังมาก ควรทำอย่างไร' },
      options: [{ id: 'a', text: 'ยืนใต้ต้นไม้สูง' }, { id: 'b', text: 'เข้าไปอยู่ในอาคาร' }, { id: 'c', text: 'วิ่งเล่นกลางสนาม' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ฟ้าร้องฟ้าผ่า ควรเข้าไปอยู่ในอาคาร', hints: [], steps: ['ที่โล่งและต้นไม้สูงเสี่ยงฟ้าผ่า', 'อยู่ในอาคารปลอดภัยกว่า'] },
    },
    {
      id: 'm-rain-ordinal-t', compact: true, type: 'transfer', subject: 'math', skillIds: ['ordinal-number'], familyId: 'sequence-ordinal', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([2, 1, 4, 3], 3)} เป็นภาพที่เท่าไรของเรื่อง`, speech: speak(`ภาพ ${lab([2, 1, 4, 3], 3)} เป็นภาพที่เท่าไรของเรื่อง`) },
      visual: panels('rain', [2, 1, 4, 3]),
      options: [{ id: 'a', text: 'ภาพที่ 2' }, { id: 'b', text: 'ภาพที่ 4' }, { id: 'c', text: 'ภาพที่ 3' }],
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ภาพ ${lab([2, 1, 4, 3], 3)} กางร่มเดินท่ามกลางฝน เป็นภาพที่ 3`, hints: [], steps: [`เรียงได้ ${order([2, 1, 4, 3])}`, `ภาพ ${lab([2, 1, 4, 3], 3)} อยู่ลำดับที่ 3`] },
    },
    {
      id: 'g-sandwich-order-t', compact: true, type: 'transfer', subject: 'general', skillIds: ['sequence-events'], familyId: 'sequence-order', difficulty: 3,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ภาพการทำแซนด์วิชถูกสลับที่ ข้อใดเรียงลำดับเหตุการณ์ได้ถูกต้อง' },
      visual: panels('sandwich', [4, 2, 1, 3]),
      options: orderOptions([4, 2, 1, 3], 1),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: `ขนมปังบนจาน ทาแยม ประกบ กิน เรียงได้ ${order([4, 2, 1, 3])}`, hints: [], steps: ['ภาพแรกคือขนมปังที่ยังไม่ทา', 'แล้วทาแยม ประกบเป็นแซนด์วิช และกินเป็นภาพสุดท้าย'] },
    },
    {
      id: 'th-seedling-caption-t', type: 'transfer', subject: 'thai', skillIds: ['picture-caption'], familyId: 'picture-caption', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: `ภาพ ${lab([2, 4, 1, 3], 4)} ตรงกับประโยคใด`, speech: speak(`ภาพ ${lab([2, 4, 1, 3], 4)} ตรงกับประโยคใด`) },
      visual: panels('plant', [2, 4, 1, 3]),
      options: [{ id: 'a', text: 'เด็กหญิงดีใจที่ต้นอ่อนงอกแล้ว' }, { id: 'b', text: 'เด็กหญิงขุดดินในกระถาง' }, { id: 'c', text: 'เด็กหญิงใส่เมล็ดลงในหลุม' }],
      correctOptionId: 'a',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: `ภาพ ${lab([2, 4, 1, 3], 4)} ต้นอ่อนงอกในกระถางและเด็กหญิงยิ้ม`, hints: [], steps: [`ภาพ ${lab([2, 4, 1, 3], 4)} มีต้นอ่อนสีเขียวสองใบในกระถาง`, 'เด็กหญิงยิ้มดีใจ จึงตรงกับประโยคข้อ 1'] },
    },
    {
      id: 'sc-color-blue-t', type: 'transfer', subject: 'science', skillIds: ['color-mixing'], familyId: 'color-mixing', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'ถ้านำสีน้ำเงินกับสีเหลืองมาผสมกัน จะได้สีอะไร' },
      options: [{ id: 'a', text: 'สีเขียว' }, { id: 'b', text: 'สีส้ม' }, { id: 'c', text: 'สีแดง' }],
      correctOptionId: 'a',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: 'สีน้ำเงินผสมสีเหลืองได้สีเขียว', hints: [], steps: ['สีส้มได้จากสีแดงผสมสีเหลือง และสีแดงเป็นสีหลัก', 'สีน้ำเงินผสมสีเหลืองได้สีเขียว'] },
    },
    {
      id: 'sp-draw-left-t', type: 'transfer', subject: 'spatial', skillIds: ['left-right-picture'], familyId: 'left-right-picture', difficulty: 2,
      sourceId: SRC, ...R, section: SEQ,
      prompt: { text: 'ในภาพ ใครอยู่ทางซ้ายมือของภาพ' },
      visual: { type: 'image', asset: 'pic-seq-draw-4' },
      options: [{ id: 'a', text: 'ผู้ใหญ่' }, { id: 'b', text: 'ไม่มีใคร' }, { id: 'c', text: 'เด็กหญิง' }],
      correctOptionId: 'c',
      narration: 'ฟังตัวเลือกได้',
      review: { summary: 'เด็กหญิงอยู่ทางซ้ายของภาพ', hints: [], steps: ['มองภาพ เด็กหญิงอยู่ทางซ้ายมือของเรา', 'ผู้ใหญ่อยู่ทางขวา จึงตอบเด็กหญิง'] },
    },
    {
      id: 'sp-arrow-cycle-t', type: 'transfer', subject: 'spatial', skillIds: ['figure-sequence'], familyId: 'arrow-sequence', difficulty: 2,
      sourceId: SRC, ...R, section: 'ภาพต่อเนื่อง ภาพที่หายไปควรเป็นภาพใด',
      prompt: { text: 'ลูกศรหมุนตามเข็มนาฬิกาไปทีละหนึ่งในสี่ของรอบ ช่อง ? ควรเป็นภาพใด' },
      visual: { type: 'figure-row', items: [arrow('right'), arrow('down'), arrow('left'), arrow('up'), '?'] },
      options: [fig('a', arrow('left')), fig('b', arrow('right')), fig('c', arrow('down')), fig('d', arrow('up'))],
      correctOptionId: 'b',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ)',
      review: { summary: 'ลูกศรหมุนครบรอบแล้วกลับมาชี้ขวา', hints: [], steps: ['ลูกศรชี้ ขวา ลง ซ้าย ขึ้น ตามเข็มนาฬิกา', 'ต่อจากชี้ขึ้นคือกลับมาชี้ขวา'] },
    },
  ],
};
