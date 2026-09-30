/*
 * ทะเบียนรูป — เนื้อหาอ้างรูปด้วยรหัส (เช่น pic-fish) ไม่อ้าง path ตรงๆ
 * path เป็นแบบสัมพัทธ์กับ BASE_URL ของ Vite จึงใช้ได้ทั้งตอน dev และบน GitHub Pages (/little-exam-adventure/)
 * alt ของรูปในตัวเลือกเป็นคำกลางๆ ไม่บอกเฉลย; หน้าเล่นใช้ alt = "" แล้วให้ชื่อข้อ (ก ข ค) เป็นป้ายแทน
 */
const BASE = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || './';

const PICTURES = {
  fish: 'ปลา', crab: 'ปู', chicken: 'ไก่', horse: 'ม้า', cat: 'แมว', owl: 'นกฮูก', butterfly: 'ผีเสื้อ', frog: 'กบ',
  elephant: 'ช้าง', umbrella: 'ร่ม', orange: 'ส้ม', spoon: 'ช้อน', chair: 'เก้าอี้', egg: 'ไข่', bicycle: 'จักรยาน', house: 'บ้าน',
  // แผ่น B (design/PROMPTS-gemini-2.md) — ต้นไม้ 3 ขั้นใช้กรอบเดียวกัน กระถางจึงขนาดเท่ากัน
  'plant-seed': 'กระถางมีเมล็ด', 'plant-sprout': 'ต้นอ่อน', 'plant-flower': 'ต้นไม้มีดอก', chick: 'ลูกเจี๊ยบ', leaf: 'ใบไม้', stone: 'ก้อนหิน',
  ball: 'ลูกบอล', coin: 'เหรียญ', duck: 'เป็ด', mouse: 'หนู', banana: 'กล้วย', grapes: 'องุ่น', carrot: 'แครอท', car: 'รถ',
  watermelon: 'แตงโม', toothbrush: 'แปรงสีฟัน',
  // แผ่น C (design/PROMPTS-gemini-3.md) — ภาพล้างมือและภาพฤดูอยู่ในกรอบ ไม่ตัดพื้นในกรอบ
  'wash-1': 'ภาพที่ 1', 'wash-2': 'ภาพที่ 2', 'wash-3': 'ภาพที่ 3', 'wash-4': 'ภาพที่ 4',
  'bfly-egg': 'ไข่ผีเสื้อ', caterpillar: 'หนอน', chrysalis: 'ดักแด้', 'bfly-adult': 'ผีเสื้อ',
  'season-rain': 'ภาพทุ่งนา', 'season-hot': 'ภาพทุ่งนา', 'season-cool': 'ภาพทุ่งนา',
  ant: 'มด', jug: 'เหยือก', bottle: 'ขวด', glass: 'แก้ว', bat: 'ค้างคาว',
  // แผ่น D (design/PROMPTS-gemini-4.md) — อาชีพ เครื่องมือ ยานพาหนะ
  doctor: 'หมอ', police: 'ตำรวจ', firefighter: 'นักดับเพลิง', farmer: 'ชาวนา', teacher: 'ครู', cook: 'แม่ครัว',
  stethoscope: 'หูฟัง', hoe: 'จอบ', wok: 'กระทะ', extinguisher: 'ถังดับเพลิง',
  firetruck: 'รถดับเพลิง', ambulance: 'รถพยาบาล', boat: 'เรือ', airplane: 'เครื่องบิน', bus: 'รถโดยสาร', train: 'รถไฟ',
  // แผ่น E (design/PROMPTS-gemini-5.md) — สถานที่ 4 ภาพอยู่ในกรอบ, เครื่องใช้ไฟฟ้า ของใช้ เครื่องเขียน
  school: 'โรงเรียน', temple: 'วัด', market: 'ตลาด', playground: 'สนามเด็กเล่น',
  fan: 'พัดลม', fridge: 'ตู้เย็น', tv: 'โทรทัศน์', ricecooker: 'หม้อหุงข้าว',
  broom: 'ไม้กวาด', dustpan: 'ที่ตักผง', soap: 'สบู่', towel: 'ผ้าเช็ดตัว',
  pencil: 'ดินสอ', eraser: 'ยางลบ', ruler: 'ไม้บรรทัด', scissors: 'กรรไกร',
  // แผ่น F (design/PROMPTS-gemini-6.md) — ท้องฟ้ากลางคืนอยู่ในกรอบ
  sun: 'ดวงอาทิตย์', night: 'ท้องฟ้ากลางคืน', 'rain-cloud': 'เมฆฝน', rainbow: 'รุ้ง',
  raincoat: 'เสื้อกันฝน', sweater: 'เสื้อกันหนาว', sneakers: 'รองเท้าผ้าใบ', rice: 'ข้าว', milk: 'นม', 'fried-egg': 'ไข่ดาว',
  mango: 'มะม่วง', durian: 'ทุเรียน', rambutan: 'เงาะ', bee: 'ผึ้ง', snail: 'หอยทาก', spider: 'แมงมุม',
  // แผ่น G (design/PROMPTS-gemini-7.md) — สถานที่ 4 ภาพอยู่ในกรอบ; คนสูงอายุใช้ได้ทั้ง ปู่ย่า และ ตายาย (เนื้อเรื่องเรียกเอง)
  beach: 'ทะเล', mountain: 'ภูเขา', waterfall: 'น้ำตก', ricefield: 'ทุ่งนา',
  grandpa: 'ผู้ชายสูงอายุ', grandma: 'ผู้หญิงสูงอายุ', father: 'ผู้ชาย', mother: 'ผู้หญิง',
  'coconut-tree': 'ต้นมะพร้าว', 'banana-tree': 'ต้นกล้วย', 'mango-tree': 'ต้นมะม่วง', bamboo: 'ต้นไผ่',
  knife: 'มีด', mortar: 'ครกกับสาก', pot: 'หม้อ', plate: 'จาน',
  // แผ่น H (design/PROMPTS-gemini-8.md) — ภาพเรื่องราว 4 ภาพ x 4 เรื่อง อยู่ในกรอบมุมมน (ชื่อกลางๆ ไม่บอกลำดับ)
  'seq-plant-1': 'ภาพเหตุการณ์',
  'seq-plant-2': 'ภาพเหตุการณ์',
  'seq-plant-3': 'ภาพเหตุการณ์',
  'seq-plant-4': 'ภาพเหตุการณ์',
  'seq-teeth-1': 'ภาพเหตุการณ์',
  'seq-teeth-2': 'ภาพเหตุการณ์',
  'seq-teeth-3': 'ภาพเหตุการณ์',
  'seq-teeth-4': 'ภาพเหตุการณ์',
  'seq-sandwich-1': 'ภาพเหตุการณ์',
  'seq-sandwich-2': 'ภาพเหตุการณ์',
  'seq-sandwich-3': 'ภาพเหตุการณ์',
  'seq-sandwich-4': 'ภาพเหตุการณ์',
  'seq-road-1': 'ภาพเหตุการณ์',
  'seq-road-2': 'ภาพเหตุการณ์',
  'seq-road-3': 'ภาพเหตุการณ์',
  'seq-road-4': 'ภาพเหตุการณ์',
};
export const FRIENDS = {
  cat: 'แมว', rabbit: 'กระต่าย', seal: 'แมวน้ำ', penguin: 'เพนกวิน', turtle: 'เต่า', unicorn: 'ยูนิคอร์น',
  butterfly: 'ผีเสื้อ', dolphin: 'โลมา', fox: 'จิ้งจอก', octopus: 'ปลาหมึก', squirrel: 'กระรอก',
};
export const STICKERS = {
  star: 'ดาว', rainbow: 'สายรุ้ง', balloon: 'ลูกโป่ง', blossom: 'ดอกไม้', bow: 'โบว์',
  fish: 'ปลาน้อย', icecream: 'ไอศกรีม', lollipop: 'อมยิ้ม', strawberry: 'สตรอว์เบอร์รี', sunflower: 'ทานตะวัน',
};

export const ASSETS = Object.freeze({
  ...Object.fromEntries(Object.entries(PICTURES).map(([id, alt]) => [`pic-${id}`, { file: `pictures/${id}.png`, alt }])),
  ...Object.fromEntries(Object.entries(FRIENDS).map(([id, alt]) => [`friend-${id}`, { file: `friends/${id}.png`, alt }])),
  ...Object.fromEntries(Object.entries(STICKERS).map(([id, alt]) => [`sticker-${id}`, { file: `stickers/${id}.png`, alt }])),
  'background-classroom': { file: 'backgrounds/classroom.jpg', alt: '', decorative: true },
  'background-rainbow': { file: 'backgrounds/rainbow.jpg', alt: '', decorative: true },
});

export function asset(id) {
  const entry = ASSETS[id];
  if (!entry) throw new Error(`Unknown asset: ${id}`);
  return { ...entry, src: `${BASE}assets/${entry.file}` };
}
