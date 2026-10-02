/*
 * ชุดที่ 29 — ส่วนของร่างกายจากรูปเด็กทั้งตัวที่มีเลขชี้ (แผ่นรูป L: design/PROMPTS-gemini-11.md, visual `labeled`) แบบ 15 ข้อ
 * ช่วง 1 เด็กหญิง เลข 1-5 ชี้ ผม หู มือ เข่า เท้า ถาม 5 ข้อ: ชื่อส่วน หน้าที่ ตำแหน่งต่ำสุด
 * ช่วง 2 เด็กชาย เลข 1-4 ชี้ แขน แก้ม ขา หู ถาม 5 ข้อ: ชื่อส่วน ส่วนที่ใช้เดิน ส่วนที่อยู่ศีรษะเหมือนกัน นับหู
 * ช่วง 3 ข้อเดี่ยว: ผิวหนัง ตัดเล็บ นับจุกผม คำว่าศีรษะ จับคู่ของใช้กับส่วนของร่างกาย
 * ตำแหน่งจุดชี้ (x, y เป็น % ของรูป) วัดจากรูปจริงใน GIRL และ BOY; เลขวางที่ขอบรูปแล้วลากเส้นไปจุดชี้
 * (tests/visuals3.test.mjs ตรวจว่าเลขในรูปเดียวกันไม่ซ้อนกัน) แต่งใหม่ทั้งหมด
 */
const R = { provenance: 'original', rights: 'แต่งใหม่ทั้งหมด (ข้อความ ตัวเลข ภาพ) เผยแพร่ใน repo นี้ได้', reviewStatus: 'draft' };
const SRC = 'src-a24-compilation';
const LOOK = 'ดูรูปเด็กแล้วตอบคำถามให้ถูกต้อง';
const WORDS = 'ตอบคำถามเกี่ยวกับคำให้ถูกต้อง';

// จุดชี้ของแต่ละส่วนในรูป pic-child-girl และ pic-child-boy (ลงท้าย R = ด้านขวาของรูป เลขจะวางที่ขอบขวา)
const GIRL = {
  hair: [43, 8], ear: [37.5, 20.5], earR: [62, 20.5], cheek: [43, 23], arm: [34.5, 50], armR: [65.5, 50], hand: [33, 59.5], handR: [66, 59.5],
  knee: [43.5, 77], kneeR: [56.5, 77], shin: [42, 86], shinR: [58, 86], foot: [41, 93], footR: [59, 93.5],
};
const BOY = {
  hair: [43, 8], ear: [39, 20], earR: [61, 20], cheek: [43, 23], arm: [35.5, 50], armR: [64.5, 50], hand: [33, 59], handR: [66.5, 59],
  knee: [42.5, 76.5], kneeR: [57.5, 76.5], shin: [42, 86], shinR: [58, 86], foot: [41.5, 93], footR: [57.5, 93.5],
};
const SPOTS = { girl: GIRL, boy: BOY };
/** รูปเด็กที่มีเลขชี้: kid('girl', [1, 'hair'], [2, 'ear']) */
const kid = (who, ...specs) => ({
  type: 'labeled',
  asset: `pic-child-${who}`,
  marks: specs.map(([n, part]) => { const [x, y] = SPOTS[who][part]; return { n, x, y, lx: part.endsWith('R') ? 88 : 12, ly: y }; }),
});
const numbers = (...list) => list.map((n, i) => ({ id: 'abc'[i], text: `หมายเลข ${n}` }));
const words = (...list) => list.map((text, i) => ({ id: 'abc'[i], text }));

export default {
  id: 'set-29',
  version: 1,
  title: 'ชุดที่ 29',
  note: 'ส่วนของร่างกายจากรูปเด็กที่มีเลขชี้ ผิวหนัง ตัดเล็บ',
  order: [
    'sc-girl-hair', 'sc-girl-ear', 'g-girl-hand', 'sc-girl-knee', 'sp-girl-lowest',
    'sc-boy-arm', 'sc-boy-cheek', 'g-boy-leg', 'r-boy-head', 'm-boy-ears',
    'sc-skin-hot', 'g-nails-short', 'm-pigtails', 'th-head-word', 'g-wear-pair',
  ],
  stimuli: {
    girl: {
      section: LOOK,
      textHidden: true,   // อ่านออกเสียงอย่างเดียว ไม่แสดงเป็นแถบเรื่อง (ให้รูปใหญ่ขึ้น)
      text: 'ภาพเด็กหญิง มีหมายเลข 1 ถึง 5 ชี้ส่วนต่างๆ ของร่างกาย ดูภาพแล้วตอบคำถาม',
      visual: kid('girl', [1, 'hair'], [2, 'ear'], [3, 'hand'], [4, 'knee'], [5, 'foot']),
    },
    boy: {
      section: LOOK,
      textHidden: true,
      text: 'ภาพเด็กชาย มีหมายเลข 1 ถึง 4 ชี้ส่วนต่างๆ ของร่างกาย ดูภาพแล้วตอบคำถาม',
      visual: kid('boy', [1, 'armR'], [2, 'cheek'], [3, 'shinR'], [4, 'earR']),
    },
  },
  items: [
    // ================================================================ ช่วงที่ 1: เด็กหญิง เลข 1-5
    {
      id: 'sc-girl-hair', type: 'main', subject: 'science', skillIds: ['body-parts'], familyId: 'body-label', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'girl',
      prompt: { text: 'หมายเลข 1 คือส่วนใดของร่างกาย' },
      options: words('ผม', 'มือ', 'เท้า'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดการอ่านเลขที่ชี้ส่วนของร่างกาย',
      review: {
        summary: 'หมายเลข 1 ชี้ที่ผมบนศีรษะ',
        hints: ['ดูว่าเส้นจากเลข 1 ไปชี้ที่ส่วนบนสุดของเด็กหญิง'],
        steps: ['เส้นจากหมายเลข 1 ไปชี้ที่ส่วนบนสุดของศีรษะ ซึ่งเป็นผมสีดำ', 'มือและเท้าอยู่ต่ำลงไป ตอบข้อ 1'],
        transferIds: ['sc-girl-hair-t'],
      },
    },
    {
      id: 'sc-girl-ear', type: 'main', subject: 'science', skillIds: ['body-parts'], familyId: 'body-use', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'girl',
      prompt: { text: 'ส่วนของร่างกายที่ใช้ฟังเสียง คือหมายเลขใด' },
      options: numbers(3, 2, 5),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องหน้าที่ของหู',
      review: {
        summary: 'หมายเลข 2 ชี้ที่หู ใช้ฟังเสียง',
        hints: ['เราใช้อะไรฟังเสียง แล้วดูว่าเลขไหนชี้ที่ส่วนนั้น'],
        steps: ['หมายเลข 3 ชี้ที่มือ และหมายเลข 5 ชี้ที่เท้า ไม่ได้ใช้ฟังเสียง', 'หมายเลข 2 ชี้ที่หู ใช้ฟังเสียง ตอบข้อ 2'],
        transferIds: ['sc-girl-ear-t'],
      },
    },
    {
      id: 'g-girl-hand', type: 'main', subject: 'general', skillIds: ['body-parts'], familyId: 'body-use', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'girl',
      prompt: { text: 'หมายเลข 3 ใช้ทำอะไรได้' },
      options: words('ฟังเสียง', 'หยิบจับสิ่งของ', 'ดมกลิ่น'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการบอกชื่อส่วนจากเลขแล้วบอกหน้าที่ (สองขั้น)',
      review: {
        summary: 'หมายเลข 3 ชี้ที่มือ ใช้หยิบจับสิ่งของ',
        hints: ['ดูก่อนว่าเลข 3 ชี้ที่ส่วนใด แล้วนึกว่าส่วนนั้นใช้ทำอะไร'],
        steps: ['เส้นจากหมายเลข 3 ชี้ที่มือ', 'มือใช้หยิบจับสิ่งของ ตอบข้อ 2'],
        transferIds: ['g-girl-hand-t'],
      },
    },
    {
      id: 'sc-girl-knee', type: 'main', subject: 'science', skillIds: ['body-parts'], familyId: 'body-label', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'girl',
      prompt: { text: 'หมายเลข 4 คือส่วนใดของร่างกาย' },
      options: words('ไหล่', 'ศอก', 'เข่า'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดการจำชื่อส่วนของร่างกาย (เข่า)',
      review: {
        summary: 'หมายเลข 4 ชี้ที่เข่า ตรงกลางขา งอได้',
        hints: ['ดูว่าเส้นชี้ที่ตรงกลางของขา'],
        steps: ['ไหล่อยู่ใกล้คอ และศอกอยู่ตรงกลางแขน', 'หมายเลข 4 ชี้ที่ตรงกลางขา คือเข่า ตอบข้อ 3'],
        transferIds: ['sc-girl-knee-t'],
      },
    },
    {
      id: 'sp-girl-lowest', type: 'main', subject: 'spatial', skillIds: ['order-position'], familyId: 'body-position', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'girl',
      prompt: { text: 'หมายเลขใดอยู่ต่ำที่สุดของร่างกาย' },
      options: numbers(5, 1, 3),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดการดูตำแหน่งสูงต่ำในภาพ',
      review: {
        summary: 'หมายเลข 5 ชี้ที่เท้า อยู่ต่ำที่สุด',
        hints: ['ต่ำที่สุดคืออยู่ใกล้พื้นที่สุด'],
        steps: ['หมายเลข 1 ชี้ที่ผมอยู่สูง และหมายเลข 3 ชี้ที่มืออยู่กลางตัว', 'หมายเลข 5 ชี้ที่เท้า อยู่ใกล้พื้นที่สุด ตอบข้อ 1'],
        transferIds: ['sp-girl-lowest-t'],
      },
    },

    // ================================================================ ช่วงที่ 2: เด็กชาย เลข 1-4
    {
      id: 'sc-boy-arm', type: 'main', subject: 'science', skillIds: ['body-parts'], familyId: 'body-label', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'boy',
      prompt: { text: 'หมายเลข 1 คือส่วนใดของร่างกาย' },
      options: words('ขา', 'แขน', 'หู'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการอ่านเลขที่ชี้ส่วนของร่างกาย',
      review: {
        summary: 'หมายเลข 1 ชี้ที่แขน',
        hints: ['ดูว่าเส้นชี้ที่ส่วนข้างลำตัวที่ต่อกับมือ'],
        steps: ['เส้นจากหมายเลข 1 ไปชี้ที่ส่วนข้างลำตัวที่ต่อกับมือ ไม่ใช่ขาและไม่ใช่หู', 'ส่วนนี้คือแขน ตอบข้อ 2'],
        transferIds: ['sc-boy-arm-t'],
      },
    },
    {
      id: 'sc-boy-cheek', type: 'main', subject: 'science', skillIds: ['body-parts'], familyId: 'body-label', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'boy',
      prompt: { text: 'หมายเลข 2 คือส่วนใดของร่างกาย' },
      options: words('แก้ม', 'ตา', 'ปาก'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดการจำชื่อส่วนบนใบหน้า (แก้ม)',
      review: {
        summary: 'หมายเลข 2 ชี้ที่แก้มสีชมพูข้างหน้า',
        hints: ['ดูว่าเส้นชี้ที่ตรงไหนบนใบหน้า ข้างตาและข้างปาก'],
        steps: ['ตาและปากอยู่ตรงกลางใบหน้า ส่วนเส้นนี้ชี้ไปด้านข้างที่มีสีชมพู', 'ส่วนนี้คือแก้ม ตอบข้อ 1'],
        transferIds: ['sc-boy-cheek-t'],
      },
    },
    {
      id: 'g-boy-leg', type: 'main', subject: 'general', skillIds: ['body-parts'], familyId: 'body-use', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'boy',
      prompt: { text: 'ส่วนของร่างกายที่ใช้เดินและวิ่ง คือหมายเลขใด' },
      options: numbers(1, 4, 3),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องหน้าที่ของขา',
      review: {
        summary: 'หมายเลข 3 ชี้ที่ขา ใช้เดินและวิ่ง',
        hints: ['เราใช้อะไรเดินและวิ่ง'],
        steps: ['หมายเลข 1 ชี้ที่แขน และหมายเลข 4 ชี้ที่หู ไม่ได้ใช้เดิน', 'หมายเลข 3 ชี้ที่ขา ใช้เดินและวิ่ง ตอบข้อ 3'],
        transferIds: ['g-boy-leg-t'],
      },
    },
    {
      id: 'r-boy-head', type: 'main', subject: 'reasoning', skillIds: ['body-parts'], familyId: 'body-same-region', difficulty: 2,
      sourceId: SRC, ...R, stimulus: 'boy',
      prompt: { text: 'หมายเลข 2 และหมายเลข 4 อยู่ที่ส่วนใดของร่างกายเหมือนกัน' },
      options: words('แขน', 'ขา', 'ศีรษะ'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้ วัดการรวมสองส่วนเป็นหมวดเดียวกัน (แก้มและหูอยู่ที่ศีรษะ)',
      review: {
        summary: 'หมายเลข 2 คือแก้ม และหมายเลข 4 คือหู ทั้งสองอยู่ที่ศีรษะ',
        hints: ['หาก่อนว่าเลข 2 กับเลข 4 ชี้ที่ส่วนใด แล้วดูว่าอยู่ตรงไหนของตัว'],
        steps: ['หมายเลข 2 ชี้ที่แก้ม และหมายเลข 4 ชี้ที่หู', 'แก้มและหูอยู่ที่ศีรษะทั้งคู่ ตอบข้อ 3'],
        transferIds: ['r-boy-head-t'],
      },
    },
    {
      id: 'm-boy-ears', type: 'main', subject: 'math', skillIds: ['count-legs'], familyId: 'count-pairs', difficulty: 1,
      sourceId: SRC, ...R, stimulus: 'boy',
      prompt: { text: 'เด็กชายคนนี้มีหูกี่ข้าง' },
      options: words('1 ข้าง', '2 ข้าง', '3 ข้าง'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการนับอวัยวะที่เป็นคู่',
      review: {
        summary: 'คนเรามีหู 2 ข้าง ข้างซ้ายและข้างขวา',
        hints: ['ดูที่ศีรษะของเด็กชาย มีหูทางซ้ายและทางขวา'],
        steps: ['หูข้างหนึ่งอยู่ทางซ้ายของศีรษะ อีกข้างอยู่ทางขวา', 'จึงมีหู 2 ข้าง ตอบข้อ 2'],
        transferIds: ['m-boy-ears-t'],
      },
    },

    // ================================================================ ช่วงที่ 3: ข้อเดี่ยว
    {
      id: 'sc-skin-hot', type: 'main', subject: 'science', skillIds: ['senses'], familyId: 'senses-touch', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'เราใช้ส่วนใดของร่างกายรับรู้ว่าอากาศร้อนหรือเย็น' },
      options: words('ฟัน', 'ผิวหนัง', 'ผม'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดความรู้เรื่องการสัมผัส',
      review: {
        summary: 'ผิวหนังรับรู้ความร้อน ความเย็น และการสัมผัส',
        hints: ['ส่วนที่ห่อหุ้มร่างกายของเราไว้ทั้งตัว'],
        steps: ['ฟันใช้เคี้ยวอาหาร และผมเป็นเส้นบนศีรษะ ไม่ได้ใช้รับรู้ความร้อนเย็น', 'ผิวหนังห่อหุ้มร่างกายและรับรู้ร้อนเย็นได้ ตอบข้อ 2'],
        transferIds: ['sc-skin-hot-t'],
      },
    },
    {
      id: 'g-nails-short', type: 'main', subject: 'general', skillIds: ['hygiene-reason'], familyId: 'hygiene-reason', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'ทำไมเราควรตัดเล็บให้สั้นอยู่เสมอ' },
      options: words('เพื่อให้สะอาด ไม่มีสิ่งสกปรกซ่อนใต้เล็บ', 'เพื่อให้เล็บยาวเร็วขึ้น', 'เพื่อให้มือใหญ่ขึ้น'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้ วัดความเข้าใจเหตุผลของการดูแลความสะอาด',
      review: {
        summary: 'เล็บสั้นช่วยให้สะอาด ไม่มีสิ่งสกปรกและเชื้อโรคซ่อนอยู่',
        hints: ['เล็บยาวมีที่ว่างให้สิ่งสกปรกเข้าไปซ่อน'],
        steps: ['การตัดเล็บไม่ได้ทำให้เล็บยาวเร็วขึ้น และไม่ได้ทำให้มือใหญ่ขึ้น', 'เล็บสั้นสะอาดง่าย ไม่มีสิ่งสกปรกซ่อนใต้เล็บ ตอบข้อ 1'],
        transferIds: ['g-nails-short-t'],
      },
    },
    {
      id: 'm-pigtails', type: 'main', subject: 'math', skillIds: ['repeated-addition'], familyId: 'repeated-addition', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'เด็กหญิง 1 คนมัดผม 2 จุก ถ้ามีเด็กหญิง 4 คนมัดผมแบบเดียวกัน จะมีจุกผมรวมกันกี่จุก' },
      options: words('6 จุก', '8 จุก', '10 จุก'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการบวกซ้ำ 2 สี่ครั้ง',
      review: {
        summary: 'เด็กหญิงแต่ละคนมี 2 จุก 4 คนจึงมี 2 บวก 2 บวก 2 บวก 2 เท่ากับ 8 จุก',
        hints: ['นับทีละคน เด็กหญิงคนละ 2 จุก แล้วบวกต่อไปทีละคน'],
        steps: ['คนที่ 1 มี 2 จุก คนที่ 2 มีอีก 2 จุก รวมเป็น 4 จุก', 'คนที่ 3 บวกอีก 2 เป็น 6 จุก คนที่ 4 บวกอีก 2 เป็น 8 จุก ตอบข้อ 2'],
        transferIds: ['m-pigtails-t'],
      },
    },
    {
      id: 'th-head-word', type: 'main', subject: 'thai', skillIds: ['word-meaning'], familyId: 'word-meaning', difficulty: 2,
      sourceId: SRC, ...R, section: WORDS,
      prompt: { text: 'คำว่า ศีรษะ มีความหมายตรงกับคำใด' },
      options: words('แขน', 'หัว', 'เท้า'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดความหมายของคำ (ศีรษะ = หัว)',
      review: {
        summary: 'ศีรษะ คือส่วนที่เรียกว่า หัว',
        hints: ['ส่วนบนสุดของร่างกายที่มีผม ตา หู จมูก ปาก'],
        steps: ['แขนและเท้าเป็นส่วนอื่นของร่างกาย', 'ศีรษะมีความหมายเดียวกับ หัว ตอบข้อ 2'],
        transferIds: ['th-head-word-t'],
      },
    },
    {
      id: 'g-wear-pair', type: 'main', subject: 'general', skillIds: ['pair-words'], familyId: 'wear-pair', difficulty: 1,
      sourceId: SRC, ...R, section: WORDS,
      prompt: { text: 'ข้อใดจับคู่ของใช้กับส่วนของร่างกายที่ใช้สวมใส่ได้ถูกต้อง' },
      options: words('รองเท้าสวมที่มือ', 'หมวกสวมที่ศีรษะ', 'ถุงมือใส่ที่หู'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้ วัดการจับคู่ของใช้กับส่วนของร่างกาย',
      review: {
        summary: 'หมวกสวมที่ศีรษะ',
        hints: ['นึกว่าเราสวมของแต่ละอย่างที่ส่วนไหนของตัว'],
        steps: ['รองเท้าสวมที่เท้า ไม่ใช่มือ และถุงมือใส่ที่มือ ไม่ใช่หู', 'หมวกสวมที่ศีรษะ ถูกต้อง ตอบข้อ 2'],
        transferIds: ['g-wear-pair-t'],
      },
    },

    // ================================================================ โจทย์ลองใหม่ (เปิดในหน้าเฉลย ไม่นับเป็นข้อสอบ)
    {
      id: 'sc-girl-hair-t', type: 'transfer', subject: 'science', skillIds: ['body-parts'], familyId: 'body-label', difficulty: 1,
      sourceId: SRC, ...R, section: LOOK,
      prompt: { text: 'หมายเลข 3 คือส่วนใดของร่างกาย' },
      visual: kid('boy', [1, 'hair'], [2, 'handR'], [3, 'footR']),
      options: words('เท้า', 'เข่า', 'มือ'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'หมายเลข 3 ชี้ที่เท้า', hints: [], steps: ['เส้นจากหมายเลข 3 ชี้ที่ส่วนล่างสุดของตัว', 'ส่วนนั้นคือเท้า'] },
    },
    {
      id: 'sc-girl-ear-t', type: 'transfer', subject: 'science', skillIds: ['body-parts'], familyId: 'body-use', difficulty: 1,
      sourceId: SRC, ...R, section: LOOK,
      prompt: { text: 'ส่วนของร่างกายที่ใช้ฟังเสียง คือหมายเลขใด' },
      visual: kid('girl', [1, 'earR'], [2, 'kneeR'], [3, 'hand']),
      options: numbers(1, 3, 2),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'หมายเลข 1 ชี้ที่หู ใช้ฟังเสียง', hints: [], steps: ['หมายเลข 2 ชี้ที่เข่า และหมายเลข 3 ชี้ที่มือ', 'หมายเลข 1 ชี้ที่หู ใช้ฟังเสียง'] },
    },
    {
      id: 'g-girl-hand-t', type: 'transfer', subject: 'general', skillIds: ['body-parts'], familyId: 'body-use', difficulty: 1,
      sourceId: SRC, ...R, section: LOOK,
      prompt: { text: 'หมายเลข 2 ใช้ทำอะไรได้' },
      visual: kid('boy', [1, 'earR'], [2, 'foot'], [3, 'hair']),
      options: words('หยิบจับสิ่งของ', 'ฟังเสียง', 'ยืนและเดิน'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'หมายเลข 2 ชี้ที่เท้า ใช้ยืนและเดิน', hints: [], steps: ['เส้นจากหมายเลข 2 ชี้ที่เท้า', 'เท้าใช้ยืนและเดิน'] },
    },
    {
      id: 'sc-girl-knee-t', type: 'transfer', subject: 'science', skillIds: ['body-parts'], familyId: 'body-label', difficulty: 2,
      sourceId: SRC, ...R, section: LOOK,
      prompt: { text: 'หมายเลข 1 คือส่วนใดของร่างกาย' },
      visual: kid('boy', [1, 'armR'], [2, 'kneeR'], [3, 'earR']),
      options: words('แขน', 'ขา', 'คอ'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'หมายเลข 1 ชี้ที่แขน', hints: [], steps: ['เส้นจากหมายเลข 1 ชี้ที่ส่วนข้างลำตัวที่ต่อกับมือ', 'ส่วนนั้นคือแขน'] },
    },
    {
      id: 'sp-girl-lowest-t', type: 'transfer', subject: 'spatial', skillIds: ['order-position'], familyId: 'body-position', difficulty: 1,
      sourceId: SRC, ...R, section: LOOK,
      prompt: { text: 'หมายเลขใดอยู่สูงที่สุดของร่างกาย' },
      visual: kid('boy', [1, 'footR'], [2, 'hair'], [3, 'handR']),
      options: numbers(1, 2, 3),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'หมายเลข 2 ชี้ที่ผม อยู่สูงที่สุด', hints: [], steps: ['หมายเลข 1 ชี้ที่เท้า อยู่ต่ำสุด และหมายเลข 3 ชี้ที่มืออยู่กลางตัว', 'หมายเลข 2 ชี้ที่ผมบนศีรษะ อยู่สูงที่สุด'] },
    },
    {
      id: 'sc-boy-arm-t', type: 'transfer', subject: 'science', skillIds: ['body-parts'], familyId: 'body-label', difficulty: 1,
      sourceId: SRC, ...R, section: LOOK,
      prompt: { text: 'หมายเลข 1 คือส่วนใดของร่างกาย' },
      visual: kid('girl', [1, 'shinR'], [2, 'cheek'], [3, 'handR']),
      options: words('ขา', 'แขน', 'เท้า'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'หมายเลข 1 ชี้ที่ขา', hints: [], steps: ['เส้นจากหมายเลข 1 ชี้ที่ส่วนใต้เข่าลงมา', 'ส่วนนั้นคือขา'] },
    },
    {
      id: 'sc-boy-cheek-t', type: 'transfer', subject: 'science', skillIds: ['body-parts'], familyId: 'body-label', difficulty: 1,
      sourceId: SRC, ...R, section: LOOK,
      prompt: { text: 'หมายเลข 3 คือส่วนใดของร่างกาย' },
      visual: kid('girl', [1, 'handR'], [2, 'earR'], [3, 'hair']),
      options: words('ผม', 'หู', 'ตา'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'หมายเลข 3 ชี้ที่ผม', hints: [], steps: ['เส้นจากหมายเลข 3 ชี้ที่ส่วนบนสุดของศีรษะ', 'ส่วนนั้นคือผม'] },
    },
    {
      id: 'g-boy-leg-t', type: 'transfer', subject: 'general', skillIds: ['body-parts'], familyId: 'body-use', difficulty: 1,
      sourceId: SRC, ...R, section: LOOK,
      prompt: { text: 'ส่วนของร่างกายที่ใช้เดินและวิ่ง คือหมายเลขใด' },
      visual: kid('girl', [1, 'shin'], [2, 'handR'], [3, 'hair']),
      options: numbers(3, 2, 1),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'หมายเลข 1 ชี้ที่ขา ใช้เดินและวิ่ง', hints: [], steps: ['หมายเลข 2 ชี้ที่มือ และหมายเลข 3 ชี้ที่ผม', 'หมายเลข 1 ชี้ที่ขา ใช้เดินและวิ่ง'] },
    },
    {
      id: 'r-boy-head-t', type: 'transfer', subject: 'reasoning', skillIds: ['body-parts'], familyId: 'body-same-region', difficulty: 2,
      sourceId: SRC, ...R, section: LOOK,
      prompt: { text: 'หมายเลข 1 และหมายเลข 3 อยู่ที่ส่วนใดของร่างกายเหมือนกัน' },
      visual: kid('girl', [1, 'kneeR'], [2, 'hair'], [3, 'shin']),
      options: words('ศีรษะ', 'แขน', 'ขา'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'หมายเลข 1 คือเข่า และหมายเลข 3 อยู่ใต้เข่า ทั้งสองอยู่ที่ขา', hints: [], steps: ['หมายเลข 1 ชี้ที่เข่า และหมายเลข 3 ชี้ที่ส่วนใต้เข่า', 'ทั้งสองอยู่ที่ขา'] },
    },
    {
      id: 'm-boy-ears-t', type: 'transfer', subject: 'math', skillIds: ['count-legs'], familyId: 'count-pairs', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'เด็กหญิงคนหนึ่งมีตากี่ข้าง' },
      options: words('3 ข้าง', '1 ข้าง', '2 ข้าง'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'คนเรามีตา 2 ข้าง', hints: [], steps: ['ตาอยู่ทางซ้ายข้างหนึ่งและทางขวาข้างหนึ่ง', 'จึงมีตา 2 ข้าง'] },
    },
    {
      id: 'sc-skin-hot-t', type: 'transfer', subject: 'science', skillIds: ['senses'], familyId: 'senses-touch', difficulty: 1,
      sourceId: SRC, ...R,
      prompt: { text: 'เมื่อเราจับน้ำแข็ง เรารู้ว่าเย็นได้ด้วยส่วนใดของร่างกาย' },
      options: words('ผิวหนัง', 'ฟัน', 'ผม'),
      correctOptionId: 'a',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ผิวหนังที่มือรับรู้ความเย็น', hints: [], steps: ['ฟันและผมไม่ได้ใช้รับรู้ความเย็น', 'ผิวหนังที่มือรับรู้ได้ว่าน้ำแข็งเย็น'] },
    },
    {
      id: 'g-nails-short-t', type: 'transfer', subject: 'general', skillIds: ['hygiene-reason'], familyId: 'hygiene-reason', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'ทำไมเราควรล้างมือก่อนกินอาหาร' },
      options: words('เพื่อให้มือเปียกตลอดเวลา', 'เพื่อให้นิ้วมือยาวขึ้น', 'เพื่อล้างสิ่งสกปรกและเชื้อโรคออกจากมือ'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ล้างมือให้สะอาด ไม่ให้เชื้อโรคเข้าปากไปกับอาหาร', hints: [], steps: ['มือที่ไม่สะอาดมีเชื้อโรคติดอยู่', 'ล้างมือก่อนกินจะได้ไม่ป่วย'] },
    },
    {
      id: 'm-pigtails-t', type: 'transfer', subject: 'math', skillIds: ['repeated-addition'], familyId: 'repeated-addition', difficulty: 2,
      sourceId: SRC, ...R,
      prompt: { text: 'เด็กหญิง 1 คนมัดผม 2 จุก ถ้ามีเด็กหญิง 3 คนมัดผมแบบเดียวกัน จะมีจุกผมรวมกันกี่จุก' },
      options: words('5 จุก', '6 จุก', '7 จุก'),
      correctOptionId: 'b',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: '2 บวก 2 บวก 2 เท่ากับ 6 จุก', hints: [], steps: ['คนที่ 1 มี 2 จุก คนที่ 2 มีอีก 2 จุก รวมเป็น 4 จุก', 'คนที่ 3 บวกอีก 2 เป็น 6 จุก'] },
    },
    {
      id: 'th-head-word-t', type: 'transfer', subject: 'thai', skillIds: ['word-meaning'], familyId: 'word-meaning', difficulty: 2,
      sourceId: SRC, ...R, section: WORDS,
      prompt: { text: 'ส่วนของร่างกายที่เชื่อมระหว่างศีรษะกับลำตัว เรียกว่าอะไร' },
      options: words('เข่า', 'ศอก', 'คอ'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ส่วนที่เชื่อมศีรษะกับลำตัวคือคอ', hints: [], steps: ['เข่าอยู่ที่ขา และศอกอยู่ที่แขน', 'ส่วนที่อยู่ระหว่างศีรษะกับลำตัวคือคอ'] },
    },
    {
      id: 'g-wear-pair-t', type: 'transfer', subject: 'general', skillIds: ['pair-words'], familyId: 'wear-pair', difficulty: 1,
      sourceId: SRC, ...R, section: WORDS,
      prompt: { text: 'ข้อใดจับคู่ของใช้กับส่วนของร่างกายที่ใช้สวมใส่ได้ถูกต้อง' },
      options: words('ถุงเท้าสวมที่ศีรษะ', 'ถุงมือใส่ที่ขา', 'ถุงเท้าสวมที่เท้า'),
      correctOptionId: 'c',
      narration: 'อ่านตัวเลือกได้',
      review: { summary: 'ถุงเท้าสวมที่เท้า', hints: [], steps: ['ถุงมือใส่ที่มือ ไม่ใช่ขา และถุงเท้าไม่ได้สวมที่ศีรษะ', 'ถุงเท้าสวมที่เท้า ถูกต้อง'] },
    },
  ],
};
