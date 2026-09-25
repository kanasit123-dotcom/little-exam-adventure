/*
 * Provisional content for the first vertical slice.
 * Exam UI may read prompt/visual/options only. It must not expose review or correctOptionId
 * until the attempt has entered the review phase.
 */
export const VERTICAL_SLICE_12 = [
  {
    id: 'th-01-initial-consonant', subject: 'thai', skill: 'พยัญชนะต้น', kind: 'choice',
    promptText: 'คำว่า กา เริ่มด้วยพยัญชนะอะไร', promptSpeech: 'คำว่า กา เริ่มด้วยพยัญชนะอะไร',
    options: [{ id: 'ko-kai', label: 'ก' }, { id: 'kho-khai', label: 'ข' }, { id: 'ngo-ngu', label: 'ง' }],
    correctOptionId: 'ko-kai',
    review: { summary: 'กา เริ่มด้วย ก ไก่', speech: 'คำว่า กา เริ่มด้วย ก ไก่', steps: ['ฟังเสียงแรกของคำว่า กา', 'เสียงแรกคือ ก จึงเลือก ก ไก่'] },
  },
  {
    id: 'th-02-vowel-aa', subject: 'thai', skill: 'สระอา', kind: 'choice',
    promptText: 'คำใดมีสระ -า', promptSpeech: 'คำใดมีสระ อา',
    options: [{ id: 'kaa', label: 'กา' }, { id: 'ki', label: 'กิ' }, { id: 'ku', label: 'กุ' }],
    correctOptionId: 'kaa',
    review: { summary: 'กา มีสระ -า', speech: 'กอ อา กา', steps: ['มองหารูปสระ า หลังพยัญชนะ', 'ก กับ า อ่านว่า กา'] },
  },
  {
    id: 'th-03-fill-vowel', subject: 'thai', skill: 'เติมสระ', kind: 'choice',
    promptText: 'เติมสระให้เป็นคำว่า กา: ก-', promptSpeech: 'เติมสระให้เป็นคำว่า กา',
    options: [{ id: 'aa', label: 'า' }, { id: 'i', label: 'ิ' }, { id: 'u', label: 'ุ' }],
    correctOptionId: 'aa',
    review: { summary: 'ก + า = กา', speech: 'กอ บวก สระอา อ่านว่า กา', steps: ['คำเป้าหมายออกเสียงยาวว่า กา', 'วางสระ า หลัง ก แล้วเครื่องหมายขีดหายไป'] },
  },
  {
    id: 'th-04-final-consonant', subject: 'thai', skill: 'ตัวสะกด', kind: 'choice',
    promptText: 'คำใดลงท้ายด้วย น', promptSpeech: 'คำใดลงท้ายด้วย น หนู',
    options: [{ id: 'kin', label: 'กิน' }, { id: 'kaa', label: 'กา' }, { id: 'duu', label: 'ดู' }],
    correctOptionId: 'kin',
    review: { summary: 'กิน ลงท้ายด้วย น', speech: 'คำว่า กิน ลงท้ายด้วย น หนู', steps: ['ออกเสียงคำว่า กิน ช้า ๆ', 'เสียงท้าย น มาจาก น หนู'] },
  },
  {
    id: 'en-01-upper-lower', subject: 'english', skill: 'ตัวพิมพ์ใหญ่และพิมพ์เล็ก', kind: 'choice',
    promptText: 'ตัวพิมพ์เล็กของ A คือตัวใด', promptSpeech: 'Which lowercase letter matches capital A?',
    options: [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }, { id: 'd', label: 'd' }],
    correctOptionId: 'a',
    review: { summary: 'A และ a เป็นตัวอักษรเดียวกัน', speech: 'Capital A matches lowercase a', steps: ['A เป็นตัวพิมพ์ใหญ่', 'a เป็นตัวพิมพ์เล็กที่ตรงกัน'] },
  },
  {
    id: 'en-02-initial-sound', subject: 'english', skill: 'เสียงต้นคำ', kind: 'listen-choice',
    promptText: 'cat เริ่มด้วยตัวอักษรใด', promptSpeech: 'Cat. Which letter does cat begin with?',
    options: [{ id: 'c', label: 'C' }, { id: 'b', label: 'B' }, { id: 't', label: 'T' }],
    correctOptionId: 'c',
    review: { summary: 'cat เริ่มด้วย C', speech: 'Cat begins with C', steps: ['ฟังเสียงต้นของ cat', 'เสียง k ในคำนี้เขียนด้วย C'] },
  },
  {
    id: 'en-03-listen-word', subject: 'english', skill: 'ฟังและเลือกคำ', kind: 'listen-choice',
    promptText: 'ฟังแล้วเลือกคำที่ได้ยิน', promptSpeech: 'Red',
    options: [{ id: 'red', label: 'red' }, { id: 'bed', label: 'bed' }, { id: 'sun', label: 'sun' }],
    correctOptionId: 'red',
    review: { summary: 'คำที่ได้ยินคือ red', speech: 'The word is red', steps: ['ฟังเสียง r ที่ต้นคำ', 'คำว่า red สะกด r e d'] },
  },
  {
    id: 'en-04-word-picture', subject: 'english', skill: 'คำกับภาพ', kind: 'picture-choice',
    promptText: 'คำว่า cat ตรงกับภาพใด', promptSpeech: 'Which picture shows a cat?',
    options: [{ id: 'cat', label: 'cat', assetId: 'friend-cat' }, { id: 'seal', label: 'seal', assetId: 'friend-seal' }, { id: 'rabbit', label: 'rabbit', assetId: 'friend-rabbit' }],
    correctOptionId: 'cat',
    review: { summary: 'cat แปลว่าแมว', speech: 'Cat means แมว', steps: ['อ่านคำว่า cat', 'เลือกภาพแมว'] },
  },
  {
    id: 'ma-01-count-seven', subject: 'math', skill: 'นับจำนวน', kind: 'count-choice',
    promptText: 'นับดาวทั้งหมด มีกี่ดวง', promptSpeech: 'นับดาวทั้งหมด มีกี่ดวง', visual: { type: 'repeat', assetId: 'sticker-star', count: 7 },
    options: [{ id: '6', label: '6' }, { id: '7', label: '7' }, { id: '8', label: '8' }],
    correctOptionId: '7',
    review: { summary: 'มีดาว 7 ดวง', speech: 'นับหนึ่ง สอง สาม สี่ ห้า หก เจ็ด มีดาวเจ็ดดวง', steps: ['แตะหรือนับดาวทีละดวงจากซ้ายไปขวา', 'จำนวนสุดท้ายคือ 7'] },
  },
  {
    id: 'ma-02-compare', subject: 'math', skill: 'เปรียบเทียบจำนวน', kind: 'compare-choice',
    promptText: 'จำนวนใดมากกว่า', promptSpeech: 'จำนวนใดมากกว่า แปด หรือ ห้า', visual: { type: 'compare', left: 8, right: 5 },
    options: [{ id: '8', label: '8' }, { id: '5', label: '5' }],
    correctOptionId: '8',
    review: { summary: '8 มากกว่า 5', speech: 'แปดมากกว่าห้า', steps: ['วางของ 8 ชิ้นเทียบกับ 5 ชิ้น', 'ฝั่ง 8 มีของเหลือมากกว่า จึงเลือก 8'] },
  },
  {
    id: 'ma-03-add-carry', subject: 'math', skill: 'ตั้งบวกมีตัวทด', kind: 'column-choice',
    promptText: '8 + 7 เท่ากับเท่าไร', promptSpeech: 'แปด บวก เจ็ด เท่ากับเท่าไร', problem: { op: '+', a: 8, b: 7, result: 15 },
    options: [{ id: '14', label: '14' }, { id: '15', label: '15' }, { id: '16', label: '16' }],
    correctOptionId: '15',
    review: { summary: '8 + 7 = 15', speech: 'แปดบวกเจ็ดเท่ากับสิบห้า', steps: ['หลักหน่วย 8 + 7 ได้ 15', 'เขียน 5 ที่หลักหน่วย และทด 1 ไปหลักสิบ', 'หลักสิบได้ 1 คำตอบคือ 15'] },
  },
  {
    id: 'ma-04-sub-borrow', subject: 'math', skill: 'ตั้งลบมีการยืม', kind: 'column-choice',
    promptText: '12 - 5 เท่ากับเท่าไร', promptSpeech: 'สิบสอง ลบ ห้า เท่ากับเท่าไร', problem: { op: '-', a: 12, b: 5, result: 7 },
    options: [{ id: '6', label: '6' }, { id: '7', label: '7' }, { id: '8', label: '8' }],
    correctOptionId: '7',
    review: { summary: '12 - 5 = 7', speech: 'สิบสองลบห้าเท่ากับเจ็ด', steps: ['2 ลบ 5 ไม่พอ จึงยืม 1 สิบ', '12 หน่วยลบ 5 หน่วย เหลือ 7 หน่วย', 'หลักสิบเหลือ 0 ไม่ต้องเขียน คำตอบคือ 7'] },
  },
];

