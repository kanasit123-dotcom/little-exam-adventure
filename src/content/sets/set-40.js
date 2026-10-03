/*
 * ชุดที่ 40 — ชุดรวมทุกแนว (ใช้รูปและภาพวาดที่มีอยู่แล้ว) แบบ 15 ข้อ
 * ช่วง 1 ฟังเรื่องลูกแมวหลงทาง ถาม 5 ข้อ: สีของลูกแมว เจ้าของ ขนมที่เหลือ เจอสัตว์หลงทาง ข้อคิดจากเรื่อง
 * ช่วง 2 ข้อเดี่ยวที่มีภาพ: ลูกบาศก์มองจากด้านหน้า จิ๊กซอว์วัด ปฏิทินเดือนธันวาคม 2026 (วันพ่อ) เงา นับเหรียญ
 * ช่วง 3 ข้อเดี่ยว: ประโยคขอร้อง ปลา-น้ำ นก-รัง แบบรูปทึบสลับว่าง เห็นไฟไหม้ เพิ่มทีละ 5
 * แต่งใหม่ทั้งหมด; ปฏิทินธันวาคม 2026 ตรวจกับวันที่จริงใน tests/visuals3.test.mjs
 */
const R = { provenance: 'original', rights: 'แต่งใหม่ทั้งหมด (ข้อความ ตัวเลข ภาพ) เผยแพร่ใน repo นี้ได้', reviewStatus: 'draft' };
const SRC = 'src-a24-compilation';
const STORY = 'ฟังเรื่องแล้วตอบคำถามให้ถูกต้อง';
const LOOK = 'ดูภาพแล้วตอบคำถามให้ถูกต้อง';
const WORDS = 'ตอบคำถามเกี่ยวกับคำให้ถูกต้อง';
const words = (...list) => list.map((text, i) => ({ id: 'abc'[i], text }));
const fig = (id, figure) => ({ id, svg: { figure } });
const shape = (name, fill = 'empty') => ({ shape: name, fill });
const front = (id, ...cols) => ({ id, svg: { front: cols } });
const piece = (id, asset, cell) => ({ id, svg: { piece: { asset: `pic-${asset}`, cell } } });

const STORY_TEXT = 'เช้าวันเสาร์ มีลูกแมวสีส้มตัวหนึ่งร้องอยู่หน้าบ้านของมิว มิวให้นมลูกแมวดื่ม แล้วไปถามลุงข้างบ้าน ลุงบอกว่าลูกแมวเป็นของป้าสมใจที่อยู่ซอยถัดไป มิวกับแม่พาลูกแมวไปส่ง ป้าสมใจดีใจมากและให้ขนมมิว 2 ชิ้น มิวแบ่งให้น้อง 1 ชิ้น';
// ปฏิทินจริงของเดือนธันวาคม 2026: วันที่ 1 เป็นวันอังคาร
const DEC = { type: 'calendar', month: 'ธันวาคม', start: 2, days: 31, marks: [5] };
const DEC_T = { type: 'calendar', month: 'ธันวาคม', start: 2, days: 31, marks: [25] };

export default {
  id: 'set-40',
  version: 1,
  title: 'ชุดที่ 40',
  note: 'ชุดรวม ลูกแมวหลงทาง ลูกบาศก์ จิ๊กซอว์ ปฏิทินวันพ่อ เงิน',
  order: [
    'g-kitten-color', 'g-kitten-owner', 'm-kitten-snack', 'g-lost-animal', 'th-kitten-moral',
    'sp-cube-front-40', 'sp-jigsaw-temple', 'm-cal-father', 'sc-shadow-40', 'm-coins-40',
    'th-request-sentence', 'r-bird-nest', 'sp-fill-pattern-40', 'g-fire-call', 'r-five-pattern',
  ],
  stimuli: {
    story: { section: STORY, text: STORY_TEXT },
  },
  items: [
    // ================================================================ ช่วงที่ 1: เรื่องลูกแมวหลงทาง
    {
      id: 'g-kitten-color', type: 'main', subject: 'general', skillIds: ['story-detail'], familyId: 'story-detail', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'story',
      prompt: { text: 'ลูกแมวในเรื่องมีสีอะไร' },
      options: words('สีดำ', 'สีขาว', 'สีส้ม'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดการจำรายละเอียดจากเรื่องที่ฟัง',
      review: {
        summary: 'เรื่องบอกว่า ลูกแมวสีส้มตัวหนึ่ง',
        hints: ['ฟังประโยคแรกของเรื่อง'],
        steps: ['เรื่องบอกว่า มีลูกแมวสีส้มตัวหนึ่งร้องอยู่หน้าบ้าน', 'ลูกแมวสีส้ม ตอบข้อ 3'],
        transferIds: ['g-kitten-color-t'],
      },
    },
    {
      id: 'g-kitten-owner', type: 'main', subject: 'general', skillIds: ['story-detail'], familyId: 'story-detail', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'story',
      prompt: { text: 'ลูกแมวเป็นของใคร' },
      options: words('ป้าสมใจ', 'ลุงข้างบ้าน', 'แม่ของมิว'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดการแยกตัวละครในเรื่อง',
      review: {
        summary: 'ลุงข้างบ้านบอกว่าลูกแมวเป็นของป้าสมใจ',
        hints: ['ลุงข้างบ้านเป็นคนบอก แต่ไม่ได้เป็นเจ้าของ'],
        steps: ['ลุงข้างบ้านเป็นคนบอกทาง และแม่พามิวไปส่ง', 'เจ้าของคือป้าสมใจ ตอบข้อ 1'],
        transferIds: ['g-kitten-owner-t'],
      },
    },
    {
      id: 'm-kitten-snack', type: 'main', subject: 'math', skillIds: ['word-problem-sub'], familyId: 'story-sub', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'story',
      prompt: { text: 'มิวแบ่งขนมให้น้องแล้ว มิวเหลือขนมกี่ชิ้น' },
      options: words('1 ชิ้น', '2 ชิ้น', 'ไม่เหลือเลย'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดโจทย์ลบจากเรื่อง',
      review: {
        summary: 'ได้ขนม 2 ชิ้น แบ่งให้น้อง 1 ชิ้น เหลือ 1 ชิ้น',
        hints: ['ได้มากี่ชิ้น ให้น้องไปกี่ชิ้น'],
        steps: ['ป้าสมใจให้ขนม 2 ชิ้น มิวแบ่งให้น้อง 1 ชิ้น', '2 ลบ 1 เท่ากับ 1 ตอบข้อ 1'],
        column: { a: 2, op: '-', b: 1 },
        transferIds: ['m-kitten-snack-t'],
      },
    },
    {
      id: 'g-lost-animal', type: 'main', subject: 'general', skillIds: ['safety'], familyId: 'kindness', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'story',
      prompt: { text: 'ถ้าเจอสัตว์หลงทาง ควรทำอย่างไร' },
      options: words('ไล่ให้ไปไกลๆ', 'เอาไปซ่อนไว้', 'บอกผู้ใหญ่และช่วยหาเจ้าของ'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดการทำสิ่งที่ถูกต้องและปลอดภัย',
      review: {
        summary: 'บอกผู้ใหญ่และช่วยหาเจ้าของ เหมือนที่มิวทำ',
        hints: ['ในเรื่อง มิวทำอย่างไรกับลูกแมว'],
        steps: ['ไล่สัตว์หรือเอาไปซ่อนไว้ไม่ช่วยให้สัตว์กลับบ้าน', 'บอกผู้ใหญ่และช่วยหาเจ้าของ ตอบข้อ 3'],
        transferIds: ['g-lost-animal-t'],
      },
    },
    {
      id: 'th-kitten-moral', type: 'main', subject: 'thai', skillIds: ['story-moral'], familyId: 'story-moral', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'story',
      prompt: { text: 'เรื่องนี้สอนให้รู้ว่าอย่างไร' },
      options: words('ควรเลี้ยงแมวหลายตัว', 'ควรมีน้ำใจช่วยเหลือผู้อื่น', 'ไม่ควรออกจากบ้าน'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการจับข้อคิดจากเรื่อง',
      review: {
        summary: 'มิวช่วยลูกแมวและป้าสมใจ เรื่องจึงสอนให้มีน้ำใจ',
        hints: ['มิวทำอะไรดีๆ ในเรื่องนี้'],
        steps: ['เรื่องไม่ได้สอนให้เลี้ยงแมวหลายตัว หรือห้ามออกจากบ้าน', 'มิวช่วยพาลูกแมวกลับบ้าน สอนให้มีน้ำใจช่วยเหลือผู้อื่น ตอบข้อ 2'],
        transferIds: ['th-kitten-moral-t'],
      },
    },

    // ================================================================ ช่วงที่ 2: ข้อเดี่ยวที่มีภาพ
    {
      id: 'sp-cube-front-40', type: 'main', subject: 'spatial', skillIds: ['cube-views'], familyId: 'cube-front', difficulty: 3,
      sourceId: SRC, ...R, section: 'ดูภาพลูกบาศก์แล้วตอบคำถามให้ถูกต้อง',
      prompt: { text: 'ถ้ามองจากด้านหน้า จะเห็นภาพใด' },
      visual: { type: 'cubes', rows: [[2, 1], [1, 1]] },
      options: [front('a', 1, 1), front('b', 2, 1), front('c', 1, 2), front('d', 2, 2)],
      correctOptionId: 'b',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ) วัดการนึกภาพลูกบาศก์เมื่อมองจากด้านหน้า',
      review: {
        summary: 'แนวซ้ายสูงสุด 2 ก้อน แนวขวาสูงสุด 1 ก้อน',
        hints: ['กองข้างหลังที่สูงกว่าจะโผล่ให้เห็นเหนือกองข้างหน้า'],
        steps: ['แนวซ้ายกองหลังสูง 2 ก้อน แนวขวาสูง 1 ก้อนทั้งหน้าและหลัง', 'มองจากด้านหน้าเห็นสูง 2 และ 1 ตอบข้อ 2'],
        transferIds: ['sp-cube-front-40-t'],
      },
    },
    {
      id: 'sp-jigsaw-temple', type: 'main', subject: 'spatial', skillIds: ['jigsaw'], familyId: 'jigsaw', difficulty: 3,
      sourceId: SRC, ...R, section: LOOK,
      prompt: { text: 'ภาพนี้ขาดไปหนึ่งชิ้น ชิ้นส่วนใดใส่ในช่อง ? ได้พอดี' },
      visual: { type: 'jigsaw', asset: 'pic-temple', missing: 'tl' },
      options: [piece('a', 'temple', 'tr'), piece('b', 'temple', 'tl'), piece('c', 'waterfall', 'tl'), piece('d', 'mountain', 'tl')],
      correctOptionId: 'b',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ) วัดการมองว่าชิ้นส่วนใดต่อกับภาพที่เหลือ',
      review: {
        summary: 'ชิ้นที่ถูกคือชิ้นมุมซ้ายบนของวัดภาพเดียวกัน',
        hints: ['ชิ้นนี้ต้องมาจากภาพวัด และต้องเป็นมุมซ้ายบน'],
        steps: ['ชิ้นของน้ำตกและภูเขาเป็นคนละภาพ ส่วนมุมขวาบนของวัดไม่ใช่มุมที่ขาด', 'ชิ้นมุมซ้ายบนของวัดต่อได้พอดี ตอบข้อ 2'],
        transferIds: ['sp-jigsaw-temple-t'],
      },
    },
    {
      id: 'm-cal-father', type: 'main', subject: 'math', skillIds: ['calendar'], familyId: 'date-weekday', difficulty: 2,
      sourceId: SRC, ...R, section: 'ดูปฏิทินแล้วตอบคำถามให้ถูกต้อง',
      prompt: { text: 'ปฏิทินเดือนธันวาคม วันที่ 5 ซึ่งมีวงกลมล้อมไว้ เป็นวันพ่อแห่งชาติ ตรงกับวันอะไร' },
      visual: DEC,
      options: words('วันศุกร์', 'วันเสาร์', 'วันอาทิตย์'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการอ่านปฏิทิน (ตัวย่อ ส = เสาร์)',
      review: {
        summary: 'วันที่ 5 อยู่ใต้ ส จึงเป็นวันเสาร์',
        hints: ['ดูว่าเลข 5 อยู่ใต้ตัวอักษรอะไรในแถวบนสุด'],
        steps: ['วันที่ 1 อยู่ใต้ อ คือวันอังคาร นับต่อ พุธ 2 พฤหัสบดี 3 ศุกร์ 4', 'วันที่ 5 อยู่ใต้ ส คือวันเสาร์ ตอบข้อ 2'],
        transferIds: ['m-cal-father-t'],
      },
    },
    {
      id: 'sc-shadow-40', type: 'main', subject: 'science', skillIds: ['shadow'], familyId: 'shadow', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'เงาของเราเกิดขึ้นได้เพราะอะไร' },
      options: words('ตัวเราบังแสงที่ส่องมา', 'น้ำฝนตกลงมา', 'ลมพัดแรง'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องแสงและเงา',
      review: {
        summary: 'เมื่อตัวเราบังแสง ด้านหลังจะมืดเป็นเงา',
        hints: ['ตอนกลางวันที่มีแดด เงาของเราอยู่ด้านตรงข้ามกับดวงอาทิตย์'],
        steps: ['ฝนและลมไม่ทำให้เกิดเงา', 'ตัวเราบังแสงที่ส่องมาจึงเกิดเงา ตอบข้อ 1'],
        transferIds: ['sc-shadow-40-t'],
      },
    },
    {
      id: 'm-coins-40', type: 'main', subject: 'math', skillIds: ['money-add'], familyId: 'money-add', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'มีเหรียญ 10 บาท 2 เหรียญ และเหรียญ 5 บาท 1 เหรียญ รวมเป็นเงินกี่บาท' },
      options: words('15 บาท', '20 บาท', '25 บาท'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดการรวมเงินจากเหรียญต่างชนิด',
      review: {
        summary: '10 บวก 10 บวก 5 เท่ากับ 25 บาท',
        hints: ['นับเหรียญ 10 บาทก่อน แล้วบวกเหรียญ 5 บาท'],
        steps: ['เหรียญ 10 บาท 2 เหรียญเป็น 20 บาท', '20 บวก 5 เท่ากับ 25 ตอบข้อ 3'],
        column: { a: 20, op: '+', b: 5 },
        transferIds: ['m-coins-40-t'],
      },
    },

    // ================================================================ ช่วงที่ 3: ข้อเดี่ยว
    {
      id: 'th-request-sentence', type: 'main', subject: 'thai', skillIds: ['sentence-type'], familyId: 'sentence-type', difficulty: 2,
      sourceId: SRC, ...R, section: WORDS,
      prompt: { text: 'ประโยคใดเป็นประโยคขอร้องให้ผู้อื่นทำ' },
      options: words('ฉันกินข้าวแล้ว', 'ช่วยปิดประตูให้หน่อยนะ', 'เธอไปไหนมา'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดชนิดของประโยค (บอกเล่า ขอร้อง คำถาม)',
      review: {
        summary: 'ช่วยปิดประตูให้หน่อยนะ เป็นการขอร้องให้ผู้อื่นทำ',
        hints: ['ประโยคขอร้องมักขึ้นต้นด้วย ช่วย หรือ กรุณา'],
        steps: ['ฉันกินข้าวแล้วเป็นการบอกเล่า เธอไปไหนมาเป็นการถาม', 'ช่วยปิดประตูให้หน่อยนะ เป็นการขอร้อง ตอบข้อ 2'],
        transferIds: ['th-request-sentence-t'],
      },
    },
    {
      id: 'r-bird-nest', type: 'main', subject: 'reasoning', skillIds: ['relationship'], familyId: 'analogy', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'ปลาอาศัยอยู่ในน้ำ นกสร้างรังอยู่ที่ใด' },
      options: words('ในทะเล', 'ใต้ดิน', 'บนต้นไม้'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดการหาความสัมพันธ์ระหว่างสัตว์กับที่อยู่',
      review: {
        summary: 'นกสร้างรังบนต้นไม้',
        hints: ['นกวางไข่ในรัง รังมักอยู่ที่สูง'],
        steps: ['ทะเลเป็นที่อยู่ของปลา และใต้ดินเป็นที่อยู่ของไส้เดือน', 'นกสร้างรังบนต้นไม้ ตอบข้อ 3'],
        transferIds: ['r-bird-nest-t'],
      },
    },
    {
      id: 'sp-fill-pattern-40', type: 'main', subject: 'spatial', skillIds: ['figure-sequence'], familyId: 'fill-pattern', difficulty: 1,
      sourceId: SRC, ...R, section: 'ภาพต่อเนื่อง ภาพที่หายไปควรเป็นภาพใด',
      prompt: { text: 'ภาพเรียงต่อกันเป็นรูปแบบ ช่อง ? ควรเป็นภาพใด' },
      visual: { type: 'figure-row', items: [shape('circle'), shape('circle', 'solid'), shape('circle'), shape('circle', 'solid'), '?'] },
      options: [fig('a', shape('circle', 'solid')), fig('b', shape('circle')), fig('c', shape('square')), fig('d', shape('triangle', 'solid'))],
      correctOptionId: 'b',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ) วัดการหารูปแบบที่สลับกัน',
      review: {
        summary: 'วงกลมว่างสลับกับวงกลมทึบ ต่อจากวงกลมทึบคือวงกลมว่าง',
        hints: ['ดูว่าภาพสลับกันอย่างไร'],
        steps: ['ภาพเรียง ว่าง ทึบ ว่าง ทึบ', 'ภาพถัดไปจึงเป็นวงกลมว่าง ตอบข้อ 2'],
        transferIds: ['sp-fill-pattern-40-t'],
      },
    },
    {
      id: 'g-fire-call', type: 'main', subject: 'general', skillIds: ['safety'], familyId: 'emergency', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ถ้าเห็นไฟไหม้ ควรรีบทำอย่างไร' },
      options: words('เข้าไปดูใกล้ๆ', 'ซ่อนตัวอยู่ในห้อง', 'ออกไปที่ปลอดภัยแล้วบอกผู้ใหญ่ให้แจ้งดับเพลิง'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดการปฏิบัติตนเมื่อเกิดเหตุฉุกเฉิน',
      review: {
        summary: 'ออกไปที่ปลอดภัย แล้วบอกผู้ใหญ่ให้แจ้งดับเพลิง',
        hints: ['ไฟและควันอันตราย ต้องอยู่ให้ห่าง'],
        steps: ['เข้าไปใกล้หรือซ่อนในห้องอาจโดนไฟและควัน', 'ออกไปที่ปลอดภัยแล้วบอกผู้ใหญ่ให้แจ้งดับเพลิง ตอบข้อ 3'],
        transferIds: ['g-fire-call-t'],
      },
    },
    {
      id: 'r-five-pattern', type: 'main', subject: 'reasoning', skillIds: ['pattern-continue'], familyId: 'number-pattern', difficulty: 1,
      sourceId: SRC, ...R, section: 'ตัวเลขเรียงตามแบบรูป ตัวเลขที่หายไปคือเลขใด',
      prompt: { text: 'ตัวเลขเพิ่มขึ้นทีละเท่ากัน ช่อง ? ควรเป็นเลขใด' },
      visual: { type: 'number-row', items: [5, 10, 15, '?'] },
      options: words('18', '20', '25'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดแบบรูปของจำนวนที่เพิ่มทีละ 5',
      review: {
        summary: 'เพิ่มทีละ 5 ต่อจาก 15 คือ 20',
        hints: ['ดูว่าตัวเลขเพิ่มขึ้นทีละเท่าไร'],
        steps: ['5 ไป 10 และ 10 ไป 15 เพิ่มทีละ 5', '15 บวก 5 เท่ากับ 20 ตอบข้อ 2'],
        column: { a: 15, op: '+', b: 5 },
        transferIds: ['r-five-pattern-t'],
      },
    },

    // ================================================================ โจทย์ลองใหม่ (เปิดในหน้าเฉลย ไม่นับเป็นข้อสอบ)
    {
      id: 'g-kitten-color-t', type: 'transfer', subject: 'general', skillIds: ['story-detail'], familyId: 'story-detail', difficulty: 1,
      sourceId: SRC, ...R, section: STORY,
      prompt: { text: 'สุนัขสีน้ำตาลของลุงชอบนอนใต้ต้นมะม่วง สุนัขของลุงมีสีอะไร' },
      options: words('สีน้ำตาล', 'สีดำ', 'สีขาว'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'สุนัขของลุงสีน้ำตาล', hints: [], steps: ['เรื่องบอกว่า สุนัขสีน้ำตาลของลุง', 'จึงเป็นสีน้ำตาล'] },
    },
    {
      id: 'g-kitten-owner-t', type: 'transfer', subject: 'general', skillIds: ['story-detail'], familyId: 'story-detail', difficulty: 2,
      sourceId: SRC, ...R, section: STORY,
      prompt: { text: 'ครูเก็บกระเป๋าได้ใบหนึ่ง เพื่อนบอกว่าเป็นของบีม ครูจึงนำไปคืนบีม กระเป๋าเป็นของใคร' },
      options: words('ครู', 'เพื่อน', 'บีม'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'กระเป๋าเป็นของบีม', hints: [], steps: ['ครูเป็นคนเก็บได้ เพื่อนเป็นคนบอก', 'เจ้าของคือบีม'] },
    },
    {
      id: 'm-kitten-snack-t', type: 'transfer', subject: 'math', skillIds: ['word-problem-sub'], familyId: 'story-sub', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'แม่ให้ส้ม 5 ผล หนูแบ่งให้น้อง 2 ผล หนูเหลือส้มกี่ผล' },
      options: words('2 ผล', '3 ผล', '4 ผล'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: '5 ลบ 2 เท่ากับ 3 ผล', hints: [], steps: ['ได้ส้ม 5 ผล ให้น้อง 2 ผล', '5 ลบ 2 เท่ากับ 3'], column: { a: 5, op: '-', b: 2 } },
    },
    {
      id: 'g-lost-animal-t', type: 'transfer', subject: 'general', skillIds: ['safety'], familyId: 'kindness', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ถ้าหลงทางกับพ่อแม่ในห้างสรรพสินค้า ควรทำอย่างไร' },
      options: words('เดินออกไปนอกห้างคนเดียว', 'บอกพนักงานหรือเจ้าหน้าที่ให้ช่วย', 'ไปกับคนแปลกหน้าที่ชวน'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'บอกพนักงานหรือเจ้าหน้าที่ให้ช่วยตามหาพ่อแม่', hints: [], steps: ['ออกไปคนเดียวหรือไปกับคนแปลกหน้าอันตราย', 'ควรบอกพนักงานหรือเจ้าหน้าที่ให้ช่วย'] },
    },
    {
      id: 'th-kitten-moral-t', type: 'transfer', subject: 'thai', skillIds: ['story-moral'], familyId: 'story-moral', difficulty: 2,
      sourceId: SRC, ...R, section: STORY,
      prompt: { text: 'มดตัวเล็กๆ ช่วยกันขนอาหารก้อนใหญ่กลับรังได้สำเร็จ เรื่องนี้สอนให้รู้ว่าอย่างไร' },
      options: words('ร่วมมือกันทำงานจะสำเร็จ', 'ควรกินอาหารให้มาก', 'ไม่ควรออกจากรัง'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'สามัคคีร่วมมือกันทำงานจะสำเร็จ', hints: [], steps: ['มดตัวเดียวขนไม่ไหว แต่ช่วยกันจึงสำเร็จ', 'สอนให้ร่วมมือกัน'] },
    },
    {
      id: 'sp-cube-front-40-t', type: 'transfer', subject: 'spatial', skillIds: ['cube-views'], familyId: 'cube-front', difficulty: 3,
      sourceId: SRC, ...R, section: 'ดูภาพลูกบาศก์แล้วตอบคำถามให้ถูกต้อง',
      prompt: { text: 'ถ้ามองจากด้านหน้า จะเห็นภาพใด' },
      visual: { type: 'cubes', rows: [[1, 3, 1], [1, 1, 1]] },
      options: [front('a', 1, 1, 1), front('b', 3, 1, 1), front('c', 1, 3, 1), front('d', 1, 2, 1)],
      correctOptionId: 'c',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ)',
      review: { summary: 'มองจากด้านหน้าเห็นสูง 1 3 1', hints: [], steps: ['แนวกลางกองหลังสูง 3 ก้อน', 'แนวซ้ายและขวาสูง 1 ก้อน'] },
    },
    {
      id: 'sp-jigsaw-temple-t', type: 'transfer', subject: 'spatial', skillIds: ['jigsaw'], familyId: 'jigsaw', difficulty: 3,
      sourceId: SRC, ...R, section: LOOK,
      prompt: { text: 'ภาพนี้ขาดไปหนึ่งชิ้น ชิ้นส่วนใดใส่ในช่อง ? ได้พอดี' },
      visual: { type: 'jigsaw', asset: 'pic-waterfall', missing: 'br' },
      options: [piece('a', 'waterfall', 'bl'), piece('b', 'temple', 'br'), piece('c', 'waterfall', 'br'), piece('d', 'beach', 'br')],
      correctOptionId: 'c',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ)',
      review: { summary: 'ชิ้นที่ถูกคือชิ้นมุมขวาล่างของน้ำตกภาพเดียวกัน', hints: [], steps: ['ชิ้นของวัดและทะเลเป็นคนละภาพ มุมซ้ายล่างของน้ำตกไม่ใช่มุมที่ขาด', 'ชิ้นมุมขวาล่างของน้ำตกต่อได้พอดี'] },
    },
    {
      id: 'm-cal-father-t', type: 'transfer', subject: 'math', skillIds: ['calendar'], familyId: 'date-weekday', difficulty: 2,
      sourceId: SRC, ...R, section: 'ดูปฏิทินแล้วตอบคำถามให้ถูกต้อง',
      prompt: { text: 'ปฏิทินเดือนธันวาคม วันที่ 25 ซึ่งมีวงกลมล้อมไว้ ตรงกับวันอะไร' },
      visual: DEC_T,
      options: words('วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'วันที่ 25 อยู่ใต้ ศ จึงเป็นวันศุกร์', hints: [], steps: ['วันที่ 4 เป็นวันศุกร์ บวกทีละ 7 เป็น 11 18 25', 'วันที่ 25 จึงเป็นวันศุกร์'] },
    },
    {
      id: 'sc-shadow-40-t', type: 'transfer', subject: 'science', skillIds: ['shadow'], familyId: 'shadow', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'ตอนเที่ยงวันที่ดวงอาทิตย์อยู่เหนือศีรษะ เงาของเราจะเป็นอย่างไร' },
      options: words('ยาวมาก', 'สั้นมาก', 'ไม่มีวันเปลี่ยน'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ดวงอาทิตย์อยู่สูงเหนือศีรษะ เงาจึงสั้นมาก', hints: [], steps: ['ตอนเช้าและเย็นดวงอาทิตย์อยู่ต่ำ เงาจะยาว', 'ตอนเที่ยงดวงอาทิตย์อยู่สูง เงาจึงสั้น'] },
    },
    {
      id: 'm-coins-40-t', type: 'transfer', subject: 'math', skillIds: ['money-add'], familyId: 'money-add', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'มีเหรียญ 5 บาท 3 เหรียญ และเหรียญ 1 บาท 2 เหรียญ รวมเป็นเงินกี่บาท' },
      options: words('15 บาท', '17 บาท', '20 บาท'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: '5 บวก 5 บวก 5 เท่ากับ 15 แล้วบวก 2 เป็น 17 บาท', hints: [], steps: ['เหรียญ 5 บาท 3 เหรียญเป็น 15 บาท', '15 บวก 2 เท่ากับ 17'], column: { a: 15, op: '+', b: 2 } },
    },
    {
      id: 'th-request-sentence-t', type: 'transfer', subject: 'thai', skillIds: ['sentence-type'], familyId: 'sentence-type', difficulty: 2,
      sourceId: SRC, ...R, section: WORDS,
      prompt: { text: 'ประโยคใดเป็นประโยคคำถาม' },
      options: words('วันนี้อากาศร้อน', 'กรุณาเงียบเสียง', 'น้องชอบกินอะไร'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'น้องชอบกินอะไร เป็นประโยคคำถาม', hints: [], steps: ['วันนี้อากาศร้อนเป็นการบอกเล่า กรุณาเงียบเสียงเป็นการขอร้อง', 'น้องชอบกินอะไร มีคำว่า อะไร เป็นคำถาม'] },
    },
    {
      id: 'r-bird-nest-t', type: 'transfer', subject: 'reasoning', skillIds: ['relationship'], familyId: 'analogy', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'ผึ้งอยู่ในรังผึ้ง แมงมุมอยู่ที่ใด' },
      options: words('ใยแมงมุม', 'ในน้ำ', 'ในรังนก'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'แมงมุมอยู่บนใยที่มันสร้างเอง', hints: [], steps: ['แมงมุมไม่ได้อยู่ในน้ำหรือในรังนก', 'แมงมุมชักใยแล้วอยู่บนใย'] },
    },
    {
      id: 'sp-fill-pattern-40-t', type: 'transfer', subject: 'spatial', skillIds: ['figure-sequence'], familyId: 'fill-pattern', difficulty: 1,
      sourceId: SRC, ...R, section: 'ภาพต่อเนื่อง ภาพที่หายไปควรเป็นภาพใด',
      prompt: { text: 'ภาพเรียงต่อกันเป็นรูปแบบ ช่อง ? ควรเป็นภาพใด' },
      visual: { type: 'figure-row', items: [shape('square', 'solid'), shape('square'), shape('square', 'solid'), shape('square'), '?'] },
      options: [fig('a', shape('square')), fig('b', shape('circle', 'solid')), fig('c', shape('square', 'solid')), fig('d', shape('triangle'))],
      correctOptionId: 'c',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ)',
      review: { summary: 'สี่เหลี่ยมทึบสลับกับสี่เหลี่ยมว่าง ต่อจากสี่เหลี่ยมว่างคือสี่เหลี่ยมทึบ', hints: [], steps: ['ภาพเรียง ทึบ ว่าง ทึบ ว่าง', 'ภาพถัดไปเป็นสี่เหลี่ยมทึบ'] },
    },
    {
      id: 'g-fire-call-t', type: 'transfer', subject: 'general', skillIds: ['safety'], familyId: 'emergency', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ถ้ามีคนแปลกหน้าชวนไปซื้อขนมหน้าโรงเรียน ควรทำอย่างไร' },
      options: words('ไปกับเขาทันที', 'ปฏิเสธและบอกครู', 'ขอขนมก่อนแล้วค่อยไป'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ปฏิเสธและบอกครูทันที', hints: [], steps: ['การไปกับคนแปลกหน้าอันตราย', 'ควรปฏิเสธและบอกครู'] },
    },
    {
      id: 'r-five-pattern-t', type: 'transfer', subject: 'reasoning', skillIds: ['pattern-continue'], familyId: 'number-pattern', difficulty: 1,
      sourceId: SRC, ...R, section: 'ตัวเลขเรียงตามแบบรูป ตัวเลขที่หายไปคือเลขใด',
      prompt: { text: 'ตัวเลขเพิ่มขึ้นทีละเท่ากัน ช่อง ? ควรเป็นเลขใด' },
      visual: { type: 'number-row', items: [10, 20, 30, '?'] },
      options: words('35', '40', '50'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'เพิ่มทีละ 10 ต่อจาก 30 คือ 40', hints: [], steps: ['10 ไป 20 และ 20 ไป 30 เพิ่มทีละ 10', '30 บวก 10 เท่ากับ 40'] },
    },
  ],
};
