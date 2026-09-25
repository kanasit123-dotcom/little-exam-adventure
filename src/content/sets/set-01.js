/*
 * ชุดที่ 1 — 12 ข้อหลัก (หมวดละ 2) + โจทย์ลองใหม่ 12 ข้อ
 * แต่งใหม่ทั้งหมด "ตามแนวข้อสอบเก่า": รูปแบบ (หัวข้อตอน, เรื่องที่ใช้ร่วมหลายข้อ, ตัวเลือก 1 2 3) และประเภทโจทย์
 * จำลองจากชุดแนวข้อสอบที่บันทึกไว้ใน docs/RESEARCH.md (sourceId) — ไม่ได้คัดลอกข้อความ ตัวเลข หรือภาพ
 *
 * เพิ่มชุดใหม่: คัดลอกไฟล์นี้เป็น set-02.js แก้ id/title/stimuli/items/order แล้วเพิ่มใน sets/index.js
 * รูปแบบข้อมูลดู docs/CONTENT-SPEC.md และ src/core/content-validator.js
 *
 * stimuli = เรื่อง/แผนภูมิ/แผนที่ที่ใช้ร่วมกันหลายข้อ (ข้อที่ใช้ร่วมกันต้องอยู่ติดกันใน order และไม่ถูกแบ่งคนละช่วง)
 * section = หัวข้อตอนแบบในข้อสอบ (ไม่ใส่ = "ตอบคำถามต่อไปนี้ให้ถูกต้อง")
 */
const R = { provenance: 'original', rights: 'แต่งใหม่ทั้งหมด (ข้อความ ตัวเลข ภาพ) เผยแพร่ใน repo นี้ได้', reviewStatus: 'draft' };
const SRC = 'src-a24-compilation';

export default {
  id: 'set-01',
  version: 1,
  title: 'ชุดที่ 1',
  // ลำดับข้อหลัก (คงที่เพื่อ QA) — แบ่งเป็นช่วงละไม่เกิน 5 ข้อ โดยไม่แยกข้อที่ใช้เรื่องเดียวกัน: 5 + 5 + 2
  order: [
    'th-pets-most', 'sc-pets-egg', 'r-pictograph-most', 'sp-map-market', 'th-riddle-orange',
    'r-dice-back', 'sc-tadpole', 'sp-count-sides', 'g-broken-glass', 'g-songkran-date',
    'm-shells-add', 'm-money-sub',
  ],
  stimuli: {
    pets: {
      section: 'ฟังเรื่องแล้วตอบคำถามให้ถูกต้อง',
      text: 'ลิลลี่เลี้ยงสัตว์ไว้ที่บ้าน มีแมว 2 ตัว ปลา 3 ตัว และแม่ไก่ 1 ตัว ทุกเช้าลิลลี่ให้อาหารปลาก่อนไปโรงเรียน วันนี้แม่ไก่ออกไข่ 2 ฟอง ลิลลี่ดีใจมาก',
    },
    oranges: {
      section: 'ดูแผนภูมิแล้วตอบคำถามให้ถูกต้อง',
      text: 'แผนภูมินี้บอกว่าเพื่อนแต่ละคนเก็บส้มได้เท่าไร',
      visual: {
        type: 'pictograph', icon: 'pic-orange', unit: 2, unitWord: 'ผล',
        rows: [{ asset: 'friend-cat', label: 'แมว', count: 3 }, { asset: 'friend-rabbit', label: 'กระต่าย', count: 5 }, { asset: 'friend-seal', label: 'แมวน้ำ', count: 4 }],
      },
    },
    map1: {
      section: 'ดูแผนที่และทิศ แล้วตอบคำถามให้ถูกต้อง',
      text: 'ดูแผนที่ บ้านอยู่ตรงกลาง มีสถานที่อยู่รอบบ้าน',
      visual: { type: 'compass-map', center: 'บ้าน', places: { north: 'โรงเรียน', east: 'ตลาด', south: 'วัด', west: 'สวน' } },
    },
  },
  items: [
    // ---------------------------------------------------------------- ช่วงที่ 1
    {
      id: 'th-pets-most', type: 'main', subject: 'thai', skillIds: ['listening-comprehension'], familyId: 'listen-story', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'pets',
      prompt: { text: 'ลิลลี่เลี้ยงสัตว์ชนิดใดมากที่สุด' },
      options: [{ id: 'a', text: 'แมว' }, { id: 'b', text: 'ปลา' }, { id: 'c', text: 'ไก่' }],
      correctOptionId: 'b',
      narration: 'ฟังเรื่องและตัวเลือกได้ วัดการฟังและจำรายละเอียด (ไม่ได้วัดการอ่านเอง)',
      review: {
        summary: 'ลิลลี่เลี้ยงปลามากที่สุด',
        hints: ['ฟังว่าสัตว์แต่ละชนิดมีกี่ตัว'],
        steps: ['ในเรื่องมีแมว 2 ตัว ปลา 3 ตัว และแม่ไก่ 1 ตัว', 'ปลามี 3 ตัว มากที่สุด ตอบข้อ 2'],
        transferIds: ['th-garden-most-t'],
      },
    },
    {
      id: 'sc-pets-egg', type: 'main', subject: 'science', skillIds: ['animal-babies'], familyId: 'animal-babies', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'pets',
      prompt: { text: 'ไข่ของแม่ไก่ ถ้าฟักออกมาจะเป็นอะไร' },
      options: [{ id: 'a', text: 'ลูกไก่' }, { id: 'b', text: 'ลูกเป็ด' }, { id: 'c', text: 'ลูกปลา' }],
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องสัตว์ออกลูก',
      review: {
        summary: 'ไข่ของแม่ไก่ฟักออกมาเป็นลูกไก่',
        hints: ['สัตว์ออกลูกเป็นสัตว์ชนิดเดียวกับแม่'],
        steps: ['แม่ไก่ออกไข่ แล้วนั่งกกไข่ให้อุ่น', 'ไข่ของไก่ฟักออกมาเป็นลูกไก่ เหมือนแม่ ตอบข้อ 1'],
        transferIds: ['sc-duck-egg-t'],
      },
    },
    {
      id: 'r-pictograph-most', type: 'main', subject: 'reasoning', skillIds: ['read-pictograph'], familyId: 'pictograph', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'oranges',
      prompt: { text: 'ใครเก็บส้มได้มากที่สุด' },
      options: [
        { id: 'a', image: 'friend-cat', text: 'แมว' },
        { id: 'b', image: 'friend-rabbit', text: 'กระต่าย' },
        { id: 'c', image: 'friend-seal', text: 'แมวน้ำ' },
      ],
      correctOptionId: 'b',
      narration: 'อ่านชื่อตัวเลือกได้ เสียงอ่านเรื่องไม่บอกจำนวนในแผนภูมิ เด็กต้องดูแผนภูมิเอง',
      review: {
        summary: 'กระต่ายเก็บส้มได้มากที่สุด',
        hints: ['นับรูปส้มในแต่ละแถว'],
        steps: ['แมวมีส้ม 3 รูป กระต่ายมี 5 รูป แมวน้ำมี 4 รูป', 'กระต่ายมีรูปส้มมากที่สุด จึงเก็บได้มากที่สุด ตอบข้อ 2'],
        transferIds: ['r-pictograph-eggs-t'],
      },
    },
    {
      id: 'sp-map-market', type: 'main', subject: 'spatial', skillIds: ['compass-direction'], familyId: 'compass-map', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'map1',
      prompt: { text: 'ตลาดอยู่ทางทิศใดของบ้าน' },
      options: [{ id: 'a', text: 'ทิศเหนือ' }, { id: 'b', text: 'ทิศใต้' }, { id: 'c', text: 'ทิศตะวันออก' }],
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ เสียงไม่บอกตำแหน่งบนแผนที่ เด็กต้องดูทิศเอง',
      review: {
        summary: 'ตลาดอยู่ทางทิศตะวันออกของบ้าน',
        hints: ['ดูลูกศรบอกทิศที่มุมแผนที่'],
        steps: ['ลูกศรบอกทิศ ข้างบนคือทิศเหนือ ข้างขวาคือทิศตะวันออก', 'ตลาดอยู่ข้างขวาของบ้าน จึงอยู่ทางทิศตะวันออก ตอบข้อ 3'],
        transferIds: ['sp-map-school-t'],
      },
    },
    {
      id: 'th-riddle-orange', type: 'main', subject: 'thai', skillIds: ['riddle'], familyId: 'riddle', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ปริศนาคำทาย ฉันคืออะไร\nลูกกลมกลมสีส้ม\nปอกเปลือกแล้วหอมชื่นใจ\nข้างในแบ่งเป็นกลีบ' },
      options: [
        { id: 'a', image: 'pic-egg', speech: 'ไข่' },
        { id: 'b', image: 'pic-umbrella', speech: 'ร่ม' },
        { id: 'c', image: 'pic-orange', speech: 'ส้ม' },
      ],
      correctOptionId: 'c',
      narration: 'ฟังคำทายและชื่อภาพได้ วัดการฟังและจับใจความ',
      review: {
        summary: 'คำตอบคือ ส้ม',
        hints: ['ของอะไรสีส้มและมีกลีบข้างใน'],
        steps: ['คำทายบอกว่า กลม สีส้ม ต้องปอกเปลือก', 'ข้างในเป็นกลีบ คือผลส้ม ตอบข้อ 3'],
        transferIds: ['th-riddle-umbrella-t'],
      },
    },

    // ---------------------------------------------------------------- ช่วงที่ 2
    {
      id: 'r-dice-back', type: 'main', subject: 'reasoning', skillIds: ['dice-opposite'], familyId: 'dice', difficulty: 2,
      sourceId: SRC, ...R, section: 'ดูรูปภาพแล้วตอบคำถามให้ถูกต้อง',
      prompt: { text: 'ลูกเต๋ามีด้านที่อยู่ตรงข้ามกัน รวมกันได้ 7 จุดเสมอ ถ้าด้านหน้ามี 2 จุด ด้านหลังจะมีกี่จุด' },
      visual: { type: 'dice', face: 2 },
      options: [{ id: 'a', text: '4 จุด' }, { id: 'b', text: '5 จุด' }, { id: 'c', text: '6 จุด' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการใช้กฎที่ให้มา',
      review: {
        summary: '2 กับ 5 รวมกันได้ 7 ด้านหลังจึงมี 5 จุด',
        hints: ['2 ต้องเพิ่มอีกเท่าไรจึงเป็น 7'],
        steps: ['ด้านหน้ากับด้านหลังรวมกันต้องได้ 7', 'นับต่อจาก 2 คือ 3 4 5 6 7 นับได้ 5 ครั้ง ด้านหลังจึงมี 5 จุด ตอบข้อ 2'],
        transferIds: ['r-dice-six-t'],
      },
    },
    {
      id: 'sc-tadpole', type: 'main', subject: 'science', skillIds: ['animal-lifecycle'], familyId: 'lifecycle', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'ลูกของกบที่มีหาง และว่ายอยู่ในน้ำ เรียกว่าอะไร' },
      options: [{ id: 'a', text: 'ลูกอ๊อด' }, { id: 'b', text: 'ลูกปลา' }, { id: 'c', text: 'หนอน' }],
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดความรู้วงจรชีวิตสัตว์',
      review: {
        summary: 'ลูกของกบเรียกว่า ลูกอ๊อด',
        hints: ['กบวางไข่ในน้ำ'],
        steps: ['กบวางไข่ในน้ำ ไข่ฟักออกมาเป็นลูกอ๊อดที่มีหาง', 'ลูกอ๊อดค่อยๆ มีขา หางหดหาย แล้วโตเป็นกบ ตอบข้อ 1'],
        transferIds: ['sc-tadpole-grows-t'],
      },
    },
    {
      id: 'sp-count-sides', type: 'main', subject: 'spatial', skillIds: ['count-sides'], familyId: 'polygon', difficulty: 2,
      sourceId: SRC, ...R, section: 'ดูรูปภาพแล้วตอบคำถามให้ถูกต้อง',
      prompt: { text: 'รูปนี้มีกี่เหลี่ยม' },
      visual: { type: 'polygon', sides: 5 },
      options: [{ id: 'a', text: '4 เหลี่ยม' }, { id: 'b', text: '6 เหลี่ยม' }, { id: 'c', text: '5 เหลี่ยม' }],
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ เสียงไม่บอกจำนวนมุม เด็กต้องนับจากรูปเอง',
      review: {
        summary: 'รูปนี้มี 5 มุม จึงเป็น 5 เหลี่ยม',
        hints: ['แตะนับมุมทีละมุม'],
        steps: ['นับมุมของรูป หนึ่ง สอง สาม สี่ ห้า', 'มี 5 มุม เรียกว่า 5 เหลี่ยม ตอบข้อ 3'],
        transferIds: ['sp-count-sides-t'],
      },
    },
    {
      id: 'g-broken-glass', type: 'main', subject: 'general', skillIds: ['honest-behaviour'], familyId: 'manners', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ถ้าน้องทำแก้วน้ำตกแตก หนูควรทำอย่างไร' },
      options: [{ id: 'a', text: 'รีบบอกคุณแม่' }, { id: 'b', text: 'ช่วยน้องซ่อนเศษแก้ว' }, { id: 'c', text: 'ทำเป็นไม่เห็น' }],
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดการเลือกพฤติกรรมที่เหมาะสม',
      review: {
        summary: 'ควรรีบบอกคุณแม่',
        hints: ['เศษแก้วมีคม ใครควรเป็นคนเก็บ'],
        steps: ['เศษแก้วคมมาก อาจบาดมือได้', 'ต้องบอกผู้ใหญ่ให้ช่วยเก็บ และไม่ปิดบังความผิด ตอบข้อ 1'],
        transferIds: ['g-broken-toy-t'],
      },
    },
    {
      id: 'g-songkran-date', type: 'main', subject: 'general', skillIds: ['important-days'], familyId: 'important-days', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'วันสงกรานต์ตรงกับวันที่เท่าไร' },
      options: [{ id: 'a', text: '1 มกราคม' }, { id: 'b', text: '12 สิงหาคม' }, { id: 'c', text: '13 เมษายน' }],
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องวันสำคัญ',
      review: {
        summary: 'วันสงกรานต์คือวันที่ 13 เมษายน',
        hints: ['วันสงกรานต์อยู่ในหน้าร้อน เราเล่นสาดน้ำกัน'],
        steps: ['1 มกราคม คือวันขึ้นปีใหม่ 12 สิงหาคม คือวันแม่', 'วันสงกรานต์คือวันที่ 13 เมษายน วันขึ้นปีใหม่ไทย ตอบข้อ 3'],
        transferIds: ['g-mothers-day-t'],
      },
    },

    // ---------------------------------------------------------------- ช่วงที่ 3
    {
      id: 'm-shells-add', type: 'main', subject: 'math', skillIds: ['word-problem-add'], familyId: 'add-within-20', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'พี่เก็บเปลือกหอยได้ 8 ชิ้น น้องเก็บได้ 7 ชิ้น สองคนเก็บเปลือกหอยได้รวมกันกี่ชิ้น' },
      options: [{ id: 'a', text: '14 ชิ้น' }, { id: 'b', text: '15 ชิ้น' }, { id: 'c', text: '16 ชิ้น' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการบวก',
      review: {
        summary: '8 บวก 7 เท่ากับ 15 ชิ้น',
        hints: ['รวมกัน แปลว่าต้องบวก'],
        steps: [
          'รวมเปลือกหอยของพี่และน้อง จึงใช้การบวก 8 บวก 7',
          'หลักหน่วย 8 บวก 7 ได้ 15 เขียน 5 ทด 1 ไว้ที่หลักสิบ',
          'หลักสิบมีตัวทด 1 จึงได้ 15 ชิ้น ตอบข้อ 2',
        ],
        column: { a: 8, op: '+', b: 7 },
        transferIds: ['m-add-pencils-t'],
      },
    },
    {
      id: 'm-money-sub', type: 'main', subject: 'math', skillIds: ['word-problem-sub'], familyId: 'sub-within-20', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'ลิลลี่มีเงิน 12 บาท ซื้อขนมไป 5 บาท ลิลลี่เหลือเงินกี่บาท' },
      options: [{ id: 'a', text: '7 บาท' }, { id: 'b', text: '8 บาท' }, { id: 'c', text: '9 บาท' }],
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดการลบ',
      review: {
        summary: '12 ลบ 5 เท่ากับ 7 บาท',
        hints: ['จ่ายเงินไป แปลว่าเงินน้อยลง ต้องลบ'],
        steps: [
          'ลิลลี่มีเงิน 12 บาท จ่ายไป 5 บาท เงินน้อยลง จึงใช้การลบ',
          'หลักหน่วย 2 ลบ 5 ไม่พอ ต้องยืม 1 สิบ มาเป็น 12 หน่วย',
          '12 ลบ 5 เท่ากับ 7 หลักสิบเหลือศูนย์ไม่ต้องเขียน ตอบข้อ 1',
        ],
        column: { a: 12, op: '-', b: 5 },
        transferIds: ['m-sub-candies-t'],
      },
    },

    // ---------------------------------------------------------------- โจทย์ลองใหม่ (เปิดในหน้าเฉลย ไม่นับเป็นข้อสอบ)
    {
      id: 'th-garden-most-t', type: 'transfer', subject: 'thai', skillIds: ['listening-comprehension'], familyId: 'listen-story', difficulty: 1,
      sourceId: SRC, ...R, section: 'ฟังเรื่องแล้วตอบคำถามให้ถูกต้อง',
      prompt: { text: 'คุณตาปลูกผักในสวน มีผักบุ้ง 4 แปลง คะน้า 2 แปลง และกะเพรา 1 แปลง คุณตาปลูกผักชนิดใดมากที่สุด' },
      options: [{ id: 'a', text: 'ผักบุ้ง' }, { id: 'b', text: 'คะน้า' }, { id: 'c', text: 'กะเพรา' }],
      correctOptionId: 'a',
      narration: 'ฟังเรื่องได้',
      review: { summary: 'คุณตาปลูกผักบุ้งมากที่สุด', hints: [], steps: ['ผักบุ้ง 4 แปลง คะน้า 2 แปลง กะเพรา 1 แปลง', 'ผักบุ้งมีมากที่สุด'] },
    },
    {
      id: 'sc-duck-egg-t', type: 'transfer', subject: 'science', skillIds: ['animal-babies'], familyId: 'animal-babies', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ไข่ของเป็ด ถ้าฟักออกมาจะเป็นอะไร' },
      options: [{ id: 'a', text: 'ลูกไก่' }, { id: 'b', text: 'ลูกเป็ด' }, { id: 'c', text: 'ลูกปลา' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ไข่ของเป็ดฟักออกมาเป็นลูกเป็ด', hints: [], steps: ['สัตว์ออกลูกเป็นสัตว์ชนิดเดียวกับแม่', 'ไข่ของเป็ดจึงฟักออกมาเป็นลูกเป็ด'] },
    },
    {
      id: 'r-pictograph-eggs-t', type: 'transfer', subject: 'reasoning', skillIds: ['read-pictograph'], familyId: 'pictograph', difficulty: 2,
      sourceId: SRC, ...R, section: 'ดูแผนภูมิแล้วตอบคำถามให้ถูกต้อง',
      prompt: { text: 'หนึ่งรูปแทนไข่ 2 ฟอง ใครเก็บไข่ได้ 6 ฟอง' },
      visual: {
        type: 'pictograph', icon: 'pic-egg', unit: 2, unitWord: 'ฟอง',
        rows: [{ asset: 'friend-cat', label: 'แมว', count: 2 }, { asset: 'friend-rabbit', label: 'กระต่าย', count: 4 }, { asset: 'friend-seal', label: 'แมวน้ำ', count: 3 }],
      },
      options: [
        { id: 'a', image: 'friend-cat', text: 'แมว' },
        { id: 'b', image: 'friend-rabbit', text: 'กระต่าย' },
        { id: 'c', image: 'friend-seal', text: 'แมวน้ำ' },
      ],
      correctOptionId: 'c',
      narration: 'อ่านชื่อตัวเลือกได้',
      review: { summary: 'แมวน้ำมีไข่ 3 รูป เท่ากับ 6 ฟอง', hints: [], steps: ['หนึ่งรูปคือ 2 ฟอง 6 ฟองจึงต้องมี 3 รูป', 'แถวที่มี 3 รูปคือแมวน้ำ'] },
    },
    {
      id: 'sp-map-school-t', type: 'transfer', subject: 'spatial', skillIds: ['compass-direction'], familyId: 'compass-map', difficulty: 2,
      sourceId: SRC, ...R, section: 'ดูแผนที่และทิศ แล้วตอบคำถามให้ถูกต้อง',
      prompt: { text: 'โรงเรียนอยู่ทางทิศใดของบ้าน' },
      visual: { type: 'compass-map', center: 'บ้าน', places: { north: 'สวน', east: 'วัด', south: 'โรงเรียน', west: 'ตลาด' } },
      options: [{ id: 'a', text: 'ทิศเหนือ' }, { id: 'b', text: 'ทิศใต้' }, { id: 'c', text: 'ทิศตะวันตก' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'โรงเรียนอยู่ทางทิศใต้ของบ้าน', hints: [], steps: ['ข้างล่างของแผนที่คือทิศใต้', 'โรงเรียนอยู่ข้างล่างบ้าน จึงอยู่ทางทิศใต้'] },
    },
    {
      id: 'th-riddle-umbrella-t', type: 'transfer', subject: 'thai', skillIds: ['riddle'], familyId: 'riddle', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ปริศนาคำทาย ฉันคืออะไร\nมีด้ามยาวให้จับถือ\nกางออกเมื่อฝนตก\nช่วยไม่ให้ตัวเปียก' },
      options: [
        { id: 'a', image: 'pic-umbrella', speech: 'ร่ม' },
        { id: 'b', image: 'pic-spoon', speech: 'ช้อน' },
        { id: 'c', image: 'pic-chair', speech: 'เก้าอี้' },
      ],
      correctOptionId: 'a',
      narration: 'ฟังคำทายและชื่อภาพได้',
      review: { summary: 'คำตอบคือ ร่ม', hints: [], steps: ['คำทายบอกว่า กางออกเมื่อฝนตก', 'ของที่ช่วยกันฝนคือร่ม'] },
    },
    {
      id: 'r-dice-six-t', type: 'transfer', subject: 'reasoning', skillIds: ['dice-opposite'], familyId: 'dice', difficulty: 2,
      sourceId: SRC, ...R, section: 'ดูรูปภาพแล้วตอบคำถามให้ถูกต้อง',
      prompt: { text: 'ด้านตรงข้ามของลูกเต๋ารวมกันได้ 7 จุด ถ้าด้านหน้ามี 6 จุด ด้านหลังจะมีกี่จุด' },
      visual: { type: 'dice', face: 6 },
      options: [{ id: 'a', text: '1 จุด' }, { id: 'b', text: '2 จุด' }, { id: 'c', text: '3 จุด' }],
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: '6 กับ 1 รวมกันได้ 7 ด้านหลังจึงมี 1 จุด', hints: [], steps: ['ด้านหน้ากับด้านหลังรวมกันได้ 7', 'นับต่อจาก 6 อีกหนึ่งได้ 7 ด้านหลังจึงมี 1 จุด'] },
    },
    {
      id: 'sc-tadpole-grows-t', type: 'transfer', subject: 'science', skillIds: ['animal-lifecycle'], familyId: 'lifecycle', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ลูกอ๊อดโตขึ้นจะกลายเป็นสัตว์ในข้อใด' },
      options: [
        { id: 'a', image: 'pic-fish', speech: 'ปลา' },
        { id: 'b', image: 'pic-frog', speech: 'กบ' },
        { id: 'c', image: 'pic-crab', speech: 'ปู' },
      ],
      correctOptionId: 'b',
      narration: 'อ่านชื่อสัตว์ได้',
      review: { summary: 'ลูกอ๊อดโตขึ้นเป็นกบ', hints: [], steps: ['ลูกอ๊อดคือลูกของกบ', 'เมื่อโตขึ้นหางหดหาย มีขา กลายเป็นกบ'] },
    },
    {
      id: 'sp-count-sides-t', type: 'transfer', subject: 'spatial', skillIds: ['count-sides'], familyId: 'polygon', difficulty: 2,
      sourceId: SRC, ...R, section: 'ดูรูปภาพแล้วตอบคำถามให้ถูกต้อง',
      prompt: { text: 'รูปนี้มีกี่เหลี่ยม' },
      visual: { type: 'polygon', sides: 6 },
      options: [{ id: 'a', text: '5 เหลี่ยม' }, { id: 'b', text: '6 เหลี่ยม' }, { id: 'c', text: '7 เหลี่ยม' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'รูปนี้มี 6 มุม จึงเป็น 6 เหลี่ยม', hints: [], steps: ['นับมุมทีละมุม ได้ 6 มุม', 'มี 6 มุม เรียกว่า 6 เหลี่ยม'] },
    },
    {
      id: 'g-broken-toy-t', type: 'transfer', subject: 'general', skillIds: ['honest-behaviour'], familyId: 'manners', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ถ้าหนูทำของเล่นของเพื่อนพัง หนูควรทำอย่างไร' },
      options: [{ id: 'a', text: 'แอบเอาไปคืน' }, { id: 'b', text: 'ขอโทษเพื่อนและบอกครู' }, { id: 'c', text: 'โทษว่าคนอื่นทำ' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ขอโทษเพื่อนและบอกครู', hints: [], steps: ['เมื่อทำผิดต้องยอมรับ ไม่ปิดบัง', 'ขอโทษเพื่อนและบอกผู้ใหญ่ให้ช่วย'] },
    },
    {
      id: 'g-mothers-day-t', type: 'transfer', subject: 'general', skillIds: ['important-days'], familyId: 'important-days', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'วันแม่แห่งชาติตรงกับวันที่เท่าไร' },
      options: [{ id: 'a', text: '13 เมษายน' }, { id: 'b', text: '5 ธันวาคม' }, { id: 'c', text: '12 สิงหาคม' }],
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'วันแม่แห่งชาติคือวันที่ 12 สิงหาคม', hints: [], steps: ['วันแม่แห่งชาติตรงกับวันที่ 12 สิงหาคม', 'เราไหว้และมอบดอกมะลิให้คุณแม่'] },
    },
    {
      id: 'm-add-pencils-t', type: 'transfer', subject: 'math', skillIds: ['word-problem-add'], familyId: 'add-within-20', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'หนูมีดินสอ 9 แท่ง เพื่อนให้อีก 4 แท่ง หนูมีดินสอทั้งหมดกี่แท่ง' },
      options: [{ id: 'a', text: '12 แท่ง' }, { id: 'b', text: '13 แท่ง' }, { id: 'c', text: '14 แท่ง' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: '9 บวก 4 เท่ากับ 13 แท่ง', hints: [], steps: ['ได้เพิ่มต้องบวก 9 บวก 4', '9 บวก 4 เท่ากับ 13 แท่ง'], column: { a: 9, op: '+', b: 4 } },
    },
    {
      id: 'm-sub-candies-t', type: 'transfer', subject: 'math', skillIds: ['word-problem-sub'], familyId: 'sub-within-20', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'มีลูกอม 11 เม็ด กินไป 3 เม็ด เหลือลูกอมกี่เม็ด' },
      options: [{ id: 'a', text: '7 เม็ด' }, { id: 'b', text: '8 เม็ด' }, { id: 'c', text: '9 เม็ด' }],
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: '11 ลบ 3 เท่ากับ 8 เม็ด', hints: [], steps: ['กินไปแล้วของน้อยลงต้องลบ 11 ลบ 3', '11 ลบ 3 เท่ากับ 8 เม็ด'], column: { a: 11, op: '-', b: 3 } },
    },
  ],
};
