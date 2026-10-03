/*
 * ชุดที่ 38 — เที่ยวทะเล (ชุดผสม ใช้รูปที่มีอยู่แล้ว) แบบ 15 ข้อ
 * ช่วง 1 ฟังเรื่องครอบครัวน้ำหวานไปทะเล ถาม 5 ข้อ: พาหนะ (ตอบเป็นภาพ) เปลือกหอยรวม/ต่างกัน ครีมกันแดด เก็บขยะ
 * ช่วง 2 แผ่นภาพสัตว์ 12 ชนิด ถาม 5 ข้อ: สัตว์ทะเล นับแมลง สัตว์สะเทินน้ำสะเทินบก สัตว์สี่ขา นับขา
 * ช่วง 3 ข้อเดี่ยว: ตารางรูปทรง คำตรงข้าม ลึก เล่นน้ำปลอดภัย เข็มนาฬิกา อีก 2 วัน
 * แต่งใหม่ทั้งหมด
 */
const R = { provenance: 'original', rights: 'แต่งใหม่ทั้งหมด (ข้อความ ตัวเลข ภาพ) เผยแพร่ใน repo นี้ได้', reviewStatus: 'draft' };
const SRC = 'src-a24-compilation';
const STORY = 'ฟังเรื่องแล้วตอบคำถามให้ถูกต้อง';
const ANIMALS = 'ดูภาพสัตว์แล้วตอบคำถามให้ถูกต้อง';
const WORDS = 'ตอบคำถามเกี่ยวกับคำให้ถูกต้อง';
const words = (...list) => list.map((text, i) => ({ id: 'abc'[i], text }));
const pics = (...list) => list.map((name, i) => ({ id: 'abcd'[i], image: `pic-${name}` }));
const fig = (id, figure) => ({ id, svg: { figure } });
const shape = (name, fill = 'empty') => ({ shape: name, fill });

const STORY_TEXT = 'ปิดเทอม ครอบครัวของน้ำหวานนั่งรถไฟไปเที่ยวทะเล น้ำหวานเก็บเปลือกหอยได้ 6 ชิ้น น้องชายเก็บได้ 4 ชิ้น พ่อทาครีมกันแดดให้ทุกคนก่อนลงเล่นน้ำ ตอนเย็นทุกคนช่วยกันเก็บขยะบนชายหาดก่อนกลับบ้าน';
const BOARD = { type: 'board', items: ['fish', 'crab', 'frog', 'duck', 'chicken', 'elephant', 'horse', 'cat', 'bee', 'butterfly', 'snail', 'ant'].map((n) => `pic-${n}`) };
const BOARD_TEXT = 'ในภาพมีสัตว์ 12 ชนิด คือ ปลา ปู กบ เป็ด ไก่ ช้าง ม้า แมว ผึ้ง ผีเสื้อ หอยทาก และมด ดูภาพแล้วตอบคำถาม';

export default {
  id: 'set-38',
  version: 1,
  title: 'ชุดที่ 38',
  note: 'เที่ยวทะเล สัตว์บก สัตว์น้ำ แมลง คำตรงข้าม นาฬิกา',
  order: [
    'g-sea-vehicle', 'm-shell-sum', 'm-shell-diff', 'sc-sunscreen', 'g-beach-trash',
    'sc-board-sea', 'm-board-insects', 'sc-board-amphibian', 'r-board-four-legs', 'm-board-legs',
    'sp-shape-grid-38', 'th-opposite-deep', 'g-swim-safe', 'sp-clock-train', 'r-day-plus2',
  ],
  stimuli: {
    story: { section: STORY, text: STORY_TEXT },
    board: { section: ANIMALS, text: BOARD_TEXT, visual: BOARD },
  },
  items: [
    // ================================================================ ช่วงที่ 1: เรื่องเที่ยวทะเล
    {
      id: 'g-sea-vehicle', type: 'main', subject: 'general', skillIds: ['story-detail'], familyId: 'story-detail', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'story',
      prompt: { text: 'ครอบครัวของน้ำหวานไปทะเลด้วยพาหนะใด' },
      options: pics('airplane', 'train', 'boat'),
      correctOptionId: 'b',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ) วัดการจำรายละเอียดจากเรื่องที่ฟัง',
      review: {
        summary: 'ครอบครัวของน้ำหวานนั่งรถไฟไปเที่ยวทะเล',
        hints: ['ฟังประโยคแรกของเรื่อง พาหนะที่วิ่งบนราง'],
        steps: ['เรื่องบอกว่า ครอบครัวของน้ำหวานนั่งรถไฟไปเที่ยวทะเล', 'ภาพรถไฟคือข้อ 2 ตอบข้อ 2'],
        transferIds: ['g-sea-vehicle-t'],
      },
    },
    {
      id: 'm-shell-sum', type: 'main', subject: 'math', skillIds: ['word-problem-add'], familyId: 'story-add', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'story',
      prompt: { text: 'น้ำหวานกับน้องชายเก็บเปลือกหอยได้รวมกันกี่ชิ้น' },
      options: words('10 ชิ้น', '8 ชิ้น', '12 ชิ้น'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดการบวกจากเรื่องที่ฟัง',
      review: {
        summary: 'น้ำหวาน 6 ชิ้น น้องชาย 4 ชิ้น รวม 10 ชิ้น',
        hints: ['รวมกัน ใช้การบวก'],
        steps: ['น้ำหวานเก็บได้ 6 ชิ้น น้องชายเก็บได้ 4 ชิ้น', '6 บวก 4 เท่ากับ 10 ตอบข้อ 1'],
        column: { a: 6, op: '+', b: 4 },
        transferIds: ['m-shell-sum-t'],
      },
    },
    {
      id: 'm-shell-diff', type: 'main', subject: 'math', skillIds: ['word-problem-sub'], familyId: 'story-compare', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'story',
      prompt: { text: 'น้ำหวานเก็บเปลือกหอยได้มากกว่าน้องชายกี่ชิ้น' },
      options: words('1 ชิ้น', '2 ชิ้น', '3 ชิ้น'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการเปรียบเทียบด้วยการลบ',
      review: {
        summary: '6 ลบ 4 เท่ากับ 2 ชิ้น',
        hints: ['มากกว่ากี่ชิ้น ใช้การลบ'],
        steps: ['น้ำหวานมี 6 ชิ้น น้องชายมี 4 ชิ้น', '6 ลบ 4 เท่ากับ 2 ตอบข้อ 2'],
        column: { a: 6, op: '-', b: 4 },
        transferIds: ['m-shell-diff-t'],
      },
    },
    {
      id: 'sc-sunscreen', type: 'main', subject: 'science', skillIds: ['health'], familyId: 'sun-safety', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'story',
      prompt: { text: 'ทำไมพ่อจึงทาครีมกันแดดให้ทุกคนก่อนลงเล่นน้ำ' },
      options: words('เพื่อให้ว่ายน้ำได้เร็วขึ้น', 'เพื่อให้ตัวหอม', 'เพื่อไม่ให้ผิวไหม้จากแดด'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องดูแลผิวจากแดด',
      review: {
        summary: 'ครีมกันแดดช่วยไม่ให้ผิวไหม้จากแสงแดดที่ทะเล',
        hints: ['ที่ทะเลแดดแรงมาก ผิวจะเป็นอย่างไรถ้าไม่ป้องกัน'],
        steps: ['ครีมกันแดดไม่ได้ทำให้ว่ายน้ำเร็วขึ้น และไม่ได้มีไว้ให้ตัวหอม', 'ครีมกันแดดช่วยไม่ให้ผิวไหม้ ตอบข้อ 3'],
        transferIds: ['sc-sunscreen-t'],
      },
    },
    {
      id: 'g-beach-trash', type: 'main', subject: 'general', skillIds: ['environment'], familyId: 'environment', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'story',
      prompt: { text: 'ทำไมทุกคนจึงช่วยกันเก็บขยะบนชายหาดก่อนกลับบ้าน' },
      options: words('เพื่อนำขยะกลับไปเล่น', 'เพื่อให้ชายหาดสะอาดและสัตว์ทะเลปลอดภัย', 'เพราะไม่มีอะไรทำ'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องการรักษาสิ่งแวดล้อม',
      review: {
        summary: 'เก็บขยะทำให้ชายหาดสะอาด และสัตว์ทะเลไม่กินขยะเข้าไป',
        hints: ['ถ้าทิ้งขยะไว้บนชายหาด จะเกิดอะไรกับทะเลและสัตว์'],
        steps: ['ขยะไม่ใช่ของเล่น และการเก็บขยะไม่ใช่เพราะไม่มีอะไรทำ', 'เก็บขยะเพื่อให้ชายหาดสะอาดและสัตว์ทะเลปลอดภัย ตอบข้อ 2'],
        transferIds: ['g-beach-trash-t'],
      },
    },

    // ================================================================ ช่วงที่ 2: แผ่นภาพสัตว์
    {
      id: 'sc-board-sea', type: 'main', subject: 'science', skillIds: ['animal-habitat'], familyId: 'animal-habitat', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'board',
      prompt: { text: 'ภาพใดเป็นสัตว์ที่อาศัยอยู่ในทะเล' },
      options: pics('frog', 'crab', 'elephant', 'snail'),
      correctOptionId: 'b',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ) วัดความรู้เรื่องที่อยู่ของสัตว์',
      review: {
        summary: 'ปูอาศัยอยู่ในทะเลและชายหาด',
        hints: ['สัตว์ที่เดินข้างๆ บนชายหาดและมีก้ามหนีบ'],
        steps: ['กบอยู่ในสระน้ำจืด ช้างอยู่ในป่า หอยทากอยู่ในสวนที่ชื้น', 'ปูอาศัยอยู่ในทะเล ตอบข้อ 2'],
        transferIds: ['sc-board-sea-t'],
      },
    },
    {
      id: 'm-board-insects', type: 'main', subject: 'math', skillIds: ['classify-count'], familyId: 'board-count', difficulty: 3,
      sourceId: SRC, ...R, stimulus: 'board',
      prompt: { text: 'ในภาพมีแมลงกี่ชนิด' },
      options: words('2 ชนิด', '4 ชนิด', '3 ชนิด'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดการจัดกลุ่มแมลง (มี 6 ขา) แล้วนับ',
      review: {
        summary: 'แมลงในภาพคือ ผึ้ง ผีเสื้อ และมด รวม 3 ชนิด',
        hints: ['แมลงมี 6 ขา หอยทากไม่มีขา จึงไม่ใช่แมลง'],
        steps: ['ผึ้ง ผีเสื้อ และมด มี 6 ขา เป็นแมลง ส่วนหอยทากไม่มีขา', 'นับแมลงได้ 3 ชนิด ตอบข้อ 3'],
        transferIds: ['m-board-insects-t'],
      },
    },
    {
      id: 'sc-board-amphibian', type: 'main', subject: 'science', skillIds: ['animal-habitat'], familyId: 'animal-habitat', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'board',
      prompt: { text: 'ภาพใดเป็นสัตว์ที่อยู่ได้ทั้งบนบกและในน้ำ' },
      options: pics('frog', 'cat', 'bee', 'horse'),
      correctOptionId: 'a',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ) วัดความรู้เรื่องสัตว์ครึ่งบกครึ่งน้ำ',
      review: {
        summary: 'กบอยู่ได้ทั้งบนบกและในน้ำ',
        hints: ['สัตว์ที่ตอนเล็กเป็นลูกอ๊อดว่ายในน้ำ'],
        steps: ['แมว ผึ้ง และม้าอยู่บนบก', 'กบอยู่ได้ทั้งบนบกและในน้ำ ตอบข้อ 1'],
        transferIds: ['sc-board-amphibian-t'],
      },
    },
    {
      id: 'r-board-four-legs', type: 'main', subject: 'reasoning', skillIds: ['classify'], familyId: 'classify-legs', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'board',
      prompt: { text: 'ข้อใดเป็นสัตว์ที่มี 4 ขาทั้งหมด' },
      options: words('ช้าง เป็ด แมว', 'ช้าง ม้า แมว', 'ม้า ผึ้ง แมว'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการจัดกลุ่มสัตว์ตามจำนวนขา',
      review: {
        summary: 'ช้าง ม้า แมว มี 4 ขาทั้งหมด',
        hints: ['หาข้อที่ไม่มีสัตว์ 2 ขาหรือ 6 ขาปนอยู่'],
        steps: ['เป็ดมี 2 ขา และผึ้งมี 6 ขา', 'ช้าง ม้า แมว มี 4 ขาทุกตัว ตอบข้อ 2'],
        transferIds: ['r-board-four-legs-t'],
      },
    },
    {
      id: 'm-board-legs', type: 'main', subject: 'math', skillIds: ['count-legs'], familyId: 'count-legs', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'board',
      prompt: { text: 'ไก่ 2 ตัว และแมว 1 ตัว มีขารวมกันกี่ขา' },
      options: words('6 ขา', '8 ขา', '10 ขา'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการนับขาสองชนิด',
      review: {
        summary: 'ไก่ 2 ตัวมี 4 ขา แมว 1 ตัวมี 4 ขา รวม 8 ขา',
        hints: ['ไก่มี 2 ขา แมวมี 4 ขา'],
        steps: ['ไก่ 2 ตัว ตัวละ 2 ขา เป็น 4 ขา แมว 1 ตัวมี 4 ขา', '4 บวก 4 เท่ากับ 8 ตอบข้อ 2'],
        column: { a: 4, op: '+', b: 4 },
        transferIds: ['m-board-legs-t'],
      },
    },

    // ================================================================ ช่วงที่ 3: ข้อเดี่ยว
    {
      id: 'sp-shape-grid-38', type: 'main', subject: 'spatial', skillIds: ['grid-missing'], familyId: 'shape-grid', difficulty: 3,
      sourceId: SRC, ...R, section: 'ตารางภาพ ช่องที่หายไปควรเป็นภาพใด',
      prompt: { text: 'ทุกแถวและทุกหลักมีวงกลม สี่เหลี่ยม และสามเหลี่ยมอย่างละ 1 รูป ช่อง ? ควรเป็นภาพใด' },
      visual: {
        type: 'figure-grid',
        rows: [
          [shape('circle'), shape('square'), shape('triangle')],
          [shape('triangle'), shape('circle'), shape('square')],
          [shape('square'), shape('triangle'), '?'],
        ],
      },
      options: [fig('a', shape('square')), fig('b', shape('circle')), fig('c', shape('triangle')), fig('d', shape('circle', 'solid'))],
      correctOptionId: 'b',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ) วัดการหาสิ่งที่ขาดในตาราง 3x3',
      review: {
        summary: 'แถวล่างมีสี่เหลี่ยมและสามเหลี่ยมแล้ว จึงขาดวงกลมว่าง',
        hints: ['ดูแถวล่างว่ามีรูปอะไรแล้ว รูปอะไรยังไม่มี'],
        steps: ['แถวล่างมีสี่เหลี่ยมกับสามเหลี่ยม ยังขาดวงกลม หลักขวาสุดก็ยังไม่มีวงกลม', 'ทุกรูปในตารางเป็นรูปว่าง ไม่ใช่รูปทึบ จึงเป็นวงกลมว่าง ตอบข้อ 2'],
        transferIds: ['sp-shape-grid-38-t'],
      },
    },
    {
      id: 'th-opposite-deep', type: 'main', subject: 'thai', skillIds: ['opposite-words'], familyId: 'opposite-words', difficulty: 1,
      sourceId: SRC, ...R, section: WORDS,
      prompt: { text: 'คำว่า ลึก มีความหมายตรงข้ามกับคำใด' },
      options: words('ตื้น', 'ยาว', 'กว้าง'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดคำตรงข้าม',
      review: {
        summary: 'ลึก ตรงข้ามกับ ตื้น',
        hints: ['น้ำทะเลที่เดินได้ถึงแค่เข่า เรียกว่าน้ำอะไร'],
        steps: ['ยาวตรงข้ามกับสั้น และกว้างตรงข้ามกับแคบ', 'ลึกตรงข้ามกับตื้น ตอบข้อ 1'],
        transferIds: ['th-opposite-deep-t'],
      },
    },
    {
      id: 'g-swim-safe', type: 'main', subject: 'general', skillIds: ['safety'], familyId: 'water-safety', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'เมื่อเล่นน้ำทะเล ควรทำอย่างไรจึงปลอดภัย' },
      options: words('ว่ายออกไปไกลคนเดียว', 'เล่นตอนที่คลื่นแรง', 'เล่นในที่น้ำตื้นใกล้ผู้ใหญ่'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องความปลอดภัยทางน้ำ',
      review: {
        summary: 'เล่นในที่น้ำตื้นใกล้ผู้ใหญ่จึงปลอดภัย',
        hints: ['ถ้าเกิดอันตรายในน้ำ ใครจะช่วยเราได้'],
        steps: ['ว่ายไกลคนเดียวและเล่นตอนคลื่นแรงอาจจมน้ำได้', 'เล่นในที่น้ำตื้นใกล้ผู้ใหญ่ ตอบข้อ 3'],
        transferIds: ['g-swim-safe-t'],
      },
    },
    {
      id: 'sp-clock-train', type: 'main', subject: 'spatial', skillIds: ['read-clock-hands'], familyId: 'clock', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'นาฬิกาบอกเวลาที่รถไฟออก เข็มสั้นชี้ที่เลขใด' },
      visual: { type: 'clock', hour: 9, minute: 0 },
      options: words('เลข 12', 'เลข 9', 'เลข 3'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการดูเข็มสั้นของนาฬิกา',
      review: {
        summary: 'เข็มสั้นชี้ที่เลข 9 เข็มยาวชี้ที่เลข 12',
        hints: ['เข็มสั้นคือเข็มที่สั้นกว่า บอกชั่วโมง'],
        steps: ['เข็มยาวชี้ที่เลข 12', 'เข็มสั้นชี้ที่เลข 9 ตอบข้อ 2'],
        transferIds: ['sp-clock-train-t'],
      },
    },
    {
      id: 'r-day-plus2', type: 'main', subject: 'reasoning', skillIds: ['days-of-week'], familyId: 'day-plus', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'วันนี้เป็นวันศุกร์ อีก 2 วันจะเป็นวันอะไร' },
      options: words('วันเสาร์', 'วันจันทร์', 'วันอาทิตย์'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดการนับวันต่อไปข้างหน้า',
      review: {
        summary: 'ศุกร์ ต่อไปเสาร์ แล้วอาทิตย์',
        hints: ['นับวันต่อไปทีละวัน 2 ครั้ง'],
        steps: ['อีก 1 วันจากวันศุกร์คือวันเสาร์', 'อีก 2 วันคือวันอาทิตย์ ตอบข้อ 3'],
        transferIds: ['r-day-plus2-t'],
      },
    },

    // ================================================================ โจทย์ลองใหม่ (เปิดในหน้าเฉลย ไม่นับเป็นข้อสอบ)
    {
      id: 'g-sea-vehicle-t', type: 'transfer', subject: 'general', skillIds: ['story-detail'], familyId: 'story-detail', difficulty: 1,
      sourceId: SRC, ...R, section: STORY,
      prompt: { text: 'คุณตานั่งเรือข้ามแม่น้ำไปตลาด คุณตาไปตลาดด้วยพาหนะใด' },
      options: pics('bus', 'bicycle', 'boat'),
      correctOptionId: 'c',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ)',
      review: { summary: 'คุณตานั่งเรือข้ามแม่น้ำ', hints: [], steps: ['เรื่องบอกว่า คุณตานั่งเรือข้ามแม่น้ำ', 'ภาพเรือคือคำตอบ'] },
    },
    {
      id: 'm-shell-sum-t', type: 'transfer', subject: 'math', skillIds: ['word-problem-add'], familyId: 'story-add', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'แม่เก็บไข่ไก่ได้ 7 ฟอง พ่อเก็บได้ 5 ฟอง รวมกันกี่ฟอง' },
      options: words('11 ฟอง', '12 ฟอง', '13 ฟอง'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: '7 บวก 5 เท่ากับ 12 ฟอง', hints: [], steps: ['แม่ 7 ฟอง พ่อ 5 ฟอง', '7 บวก 5 เท่ากับ 12'], column: { a: 7, op: '+', b: 5 } },
    },
    {
      id: 'm-shell-diff-t', type: 'transfer', subject: 'math', skillIds: ['word-problem-sub'], familyId: 'story-compare', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'พี่มีลูกแก้ว 9 ลูก น้องมี 5 ลูก พี่มีมากกว่าน้องกี่ลูก' },
      options: words('3 ลูก', '4 ลูก', '5 ลูก'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: '9 ลบ 5 เท่ากับ 4 ลูก', hints: [], steps: ['พี่ 9 ลูก น้อง 5 ลูก', '9 ลบ 5 เท่ากับ 4'], column: { a: 9, op: '-', b: 5 } },
    },
    {
      id: 'sc-sunscreen-t', type: 'transfer', subject: 'science', skillIds: ['health'], familyId: 'sun-safety', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'เมื่อต้องออกไปกลางแดดจัด ควรทำอย่างไร' },
      options: words('สวมหมวกและดื่มน้ำบ่อยๆ', 'ใส่เสื้อหนาๆ หลายตัว', 'ไม่ดื่มน้ำเลย'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'สวมหมวกกันแดดและดื่มน้ำบ่อยๆ', hints: [], steps: ['เสื้อหนาๆ ทำให้ร้อนมาก และไม่ดื่มน้ำทำให้ร่างกายขาดน้ำ', 'สวมหมวกและดื่มน้ำบ่อยๆ ช่วยได้'] },
    },
    {
      id: 'g-beach-trash-t', type: 'transfer', subject: 'general', skillIds: ['environment'], familyId: 'environment', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'กินขนมเสร็จแล้วมีถุงขนมเหลือ ควรทำอย่างไร' },
      options: words('ทิ้งลงถังขยะ', 'ทิ้งไว้ข้างทาง', 'โยนลงแม่น้ำ'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ทิ้งถุงขนมลงถังขยะ', hints: [], steps: ['ทิ้งข้างทางหรือโยนลงแม่น้ำทำให้สกปรกและสัตว์เป็นอันตราย', 'ควรทิ้งลงถังขยะ'] },
    },
    {
      id: 'sc-board-sea-t', type: 'transfer', subject: 'science', skillIds: ['animal-habitat'], familyId: 'animal-habitat', difficulty: 1,
      sourceId: SRC, ...R, section: ANIMALS,
      prompt: { text: 'ภาพใดเป็นสัตว์ที่อาศัยอยู่ในน้ำ หายใจด้วยเหงือก' },
      options: pics('horse', 'fish', 'chicken'),
      correctOptionId: 'b',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ)',
      review: { summary: 'ปลาอาศัยอยู่ในน้ำ', hints: [], steps: ['ม้าและไก่อยู่บนบก', 'ปลาอยู่ในน้ำและหายใจด้วยเหงือก'] },
    },
    {
      id: 'm-board-insects-t', type: 'transfer', subject: 'math', skillIds: ['classify-count'], familyId: 'board-count', difficulty: 3,
      sourceId: SRC, ...R, section: ANIMALS,
      prompt: { text: 'ในภาพมีสัตว์ที่มี 2 ขากี่ชนิด' },
      visual: BOARD,
      options: words('2 ชนิด', '3 ชนิด', '4 ชนิด'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'สัตว์ 2 ขาคือ เป็ดและไก่ รวม 2 ชนิด', hints: [], steps: ['เป็ดและไก่มี 2 ขา', 'นับได้ 2 ชนิด'] },
    },
    {
      id: 'sc-board-amphibian-t', type: 'transfer', subject: 'science', skillIds: ['animal-habitat'], familyId: 'animal-habitat', difficulty: 2,
      sourceId: SRC, ...R, section: ANIMALS,
      prompt: { text: 'ภาพใดเป็นสัตว์ที่บินได้และเก็บน้ำหวานจากดอกไม้' },
      options: pics('ant', 'snail', 'bee'),
      correctOptionId: 'c',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ)',
      review: { summary: 'ผึ้งบินได้และเก็บน้ำหวานจากดอกไม้', hints: [], steps: ['มดและหอยทากบินไม่ได้', 'ผึ้งบินไปเก็บน้ำหวานจากดอกไม้'] },
    },
    {
      id: 'r-board-four-legs-t', type: 'transfer', subject: 'reasoning', skillIds: ['classify'], familyId: 'classify-legs', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'ข้อใดเป็นสัตว์ที่มี 2 ขาทั้งหมด' },
      options: words('ไก่ เป็ด นก', 'ไก่ แมว นก', 'เป็ด ม้า ไก่'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ไก่ เป็ด นก มี 2 ขาทั้งหมด', hints: [], steps: ['แมวและม้ามี 4 ขา', 'ไก่ เป็ด นก มี 2 ขาทุกตัว'] },
    },
    {
      id: 'm-board-legs-t', type: 'transfer', subject: 'math', skillIds: ['count-legs'], familyId: 'count-legs', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'เป็ด 3 ตัว และม้า 1 ตัว มีขารวมกันกี่ขา' },
      options: words('8 ขา', '10 ขา', '12 ขา'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'เป็ด 3 ตัวมี 6 ขา ม้ามี 4 ขา รวม 10 ขา', hints: [], steps: ['เป็ด 3 ตัว ตัวละ 2 ขา เป็น 6 ขา ม้า 1 ตัวมี 4 ขา', '6 บวก 4 เท่ากับ 10'], column: { a: 6, op: '+', b: 4 } },
    },
    {
      id: 'sp-shape-grid-38-t', type: 'transfer', subject: 'spatial', skillIds: ['grid-missing'], familyId: 'shape-grid', difficulty: 3,
      sourceId: SRC, ...R, section: 'ตารางภาพ ช่องที่หายไปควรเป็นภาพใด',
      prompt: { text: 'ทุกแถวและทุกหลักมีรูปแต่ละแบบอย่างละ 1 รูป ช่อง ? ควรเป็นภาพใด' },
      visual: {
        type: 'figure-grid',
        rows: [
          [shape('square', 'solid'), shape('triangle'), shape('circle')],
          [shape('circle'), shape('square', 'solid'), shape('triangle')],
          ['?', shape('circle'), shape('square', 'solid')],
        ],
      },
      options: [fig('a', shape('triangle')), fig('b', shape('circle')), fig('c', shape('square', 'solid')), fig('d', shape('triangle', 'solid'))],
      correctOptionId: 'a',
      narration: 'ไม่อ่านตัวเลือก (เป็นภาพ)',
      review: { summary: 'แถวล่างขาดสามเหลี่ยมว่าง', hints: [], steps: ['แถวล่างมีวงกลมว่างกับสี่เหลี่ยมทึบแล้ว', 'จึงขาดสามเหลี่ยมว่าง'] },
    },
    {
      id: 'th-opposite-deep-t', type: 'transfer', subject: 'thai', skillIds: ['opposite-words'], familyId: 'opposite-words', difficulty: 1,
      sourceId: SRC, ...R, section: WORDS,
      prompt: { text: 'คำว่า กว้าง มีความหมายตรงข้ามกับคำใด' },
      options: words('แคบ', 'สูง', 'หนัก'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'กว้าง ตรงข้ามกับ แคบ', hints: [], steps: ['สูงตรงข้ามกับเตี้ย และหนักตรงข้ามกับเบา', 'กว้างตรงข้ามกับแคบ'] },
    },
    {
      id: 'g-swim-safe-t', type: 'transfer', subject: 'general', skillIds: ['safety'], familyId: 'water-safety', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'ถ้าเห็นเพื่อนตกน้ำ ควรทำอย่างไร' },
      options: words('กระโดดลงไปช่วยเอง', 'ตะโกนเรียกผู้ใหญ่ให้มาช่วย', 'วิ่งหนีกลับบ้าน'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ตะโกนเรียกผู้ใหญ่ให้มาช่วย', hints: [], steps: ['เด็กกระโดดลงไปช่วยเองอาจจมน้ำไปด้วย และวิ่งหนีไม่ช่วยเพื่อน', 'ควรเรียกผู้ใหญ่มาช่วยทันที'] },
    },
    {
      id: 'sp-clock-train-t', type: 'transfer', subject: 'spatial', skillIds: ['read-clock-hands'], familyId: 'clock', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'นาฬิกาบอกเวลาเข้าเรียน เข็มสั้นชี้ที่เลขใด' },
      visual: { type: 'clock', hour: 8, minute: 0 },
      options: words('เลข 8', 'เลข 12', 'เลข 4'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'เข็มสั้นชี้ที่เลข 8', hints: [], steps: ['เข็มยาวชี้ที่เลข 12', 'เข็มสั้นชี้ที่เลข 8'] },
    },
    {
      id: 'r-day-plus2-t', type: 'transfer', subject: 'reasoning', skillIds: ['days-of-week'], familyId: 'day-plus', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'วันนี้เป็นวันจันทร์ อีก 3 วันจะเป็นวันอะไร' },
      options: words('วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'จันทร์ อังคาร พุธ พฤหัสบดี', hints: [], steps: ['นับต่อจากวันจันทร์ อังคาร 1 พุธ 2 พฤหัสบดี 3', 'อีก 3 วันคือวันพฤหัสบดี'] },
    },
  ],
};
