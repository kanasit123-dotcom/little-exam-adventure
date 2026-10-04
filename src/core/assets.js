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
  // แผ่น I (design/PROMPTS-gemini-9.md) — เรียงลำดับเหตุการณ์ใหม่ 4 เรื่อง (จัดกระเป๋า ตอนเช้า วันฝนตก วาดรูป) ชื่อกลางๆ
  'seq-bag-1': 'ภาพเหตุการณ์',
  'seq-bag-2': 'ภาพเหตุการณ์',
  'seq-bag-3': 'ภาพเหตุการณ์',
  'seq-bag-4': 'ภาพเหตุการณ์',
  'seq-morning-1': 'ภาพเหตุการณ์',
  'seq-morning-2': 'ภาพเหตุการณ์',
  'seq-morning-3': 'ภาพเหตุการณ์',
  'seq-morning-4': 'ภาพเหตุการณ์',
  'seq-rain-1': 'ภาพเหตุการณ์',
  'seq-rain-2': 'ภาพเหตุการณ์',
  'seq-rain-3': 'ภาพเหตุการณ์',
  'seq-rain-4': 'ภาพเหตุการณ์',
  'seq-draw-1': 'ภาพเหตุการณ์',
  'seq-draw-2': 'ภาพเหตุการณ์',
  'seq-draw-3': 'ภาพเหตุการณ์',
  'seq-draw-4': 'ภาพเหตุการณ์',
  // แผ่น J — ภาพมารยาท 12 ภาพ (ทำถูก 6 / ทำไม่ถูก 6) alt เป็นคำกลางๆ ไม่บอกว่าถูกหรือผิด
  'manner-wai': 'เด็กกับคุณครู',
  'manner-queue': 'เด็กที่แผงขายขนม',
  'manner-seat': 'เด็กบนรถโดยสาร',
  'manner-bin': 'เด็กในสวน',
  'manner-help': 'เด็กกับคุณลุง',
  'manner-share': 'เด็กบนม้านั่ง',
  'manner-litter': 'เด็กในสวน',
  'manner-cut': 'เด็กที่แผงขายขนม',
  'manner-shout': 'เด็กในห้องสมุด',
  'manner-grab': 'เด็กสองคน',
  'manner-tap': 'เด็กที่อ่างล้างหน้า',
  'manner-sneeze': 'เด็กสองคน',
  // แผ่น K (design/PROMPTS-gemini-10.md) — ส่วนของร่างกาย 12 ภาพ (ตา หู มือ เท้า วาดเป็นคู่ จมูก ปาก ลิ้น อย่างละหนึ่ง มือข้างเดียวเห็นนิ้ว 5 นิ้ว)
  'body-eyes': 'ตา',
  'body-ears': 'หู',
  'body-nose': 'จมูก',
  'body-mouth': 'ปาก',
  'body-hands': 'มือ',
  'body-feet': 'เท้า',
  'body-teeth': 'ฟัน',
  'body-tongue': 'ลิ้น',
  'body-hand5': 'มือข้างเดียว',
  'body-knee': 'เข่า',
  'body-elbow': 'ศอก',
  'body-hair': 'ผม',
  // แผ่น O P Q (design/PROMPTS-gemini-12.md) — วันสำคัญ 8 วัน (ในกรอบ), สัตว์กับลูกสัตว์ 6 คู่ (ตัดพื้น), ความปลอดภัยบนถนน 8 ภาพ (ในกรอบ)
  'day-songkran': 'ภาพวันสำคัญ', 'day-loy': 'ภาพวันสำคัญ', 'day-mother': 'ภาพวันสำคัญ', 'day-children': 'ภาพวันสำคัญ', 'day-newyear': 'ภาพวันสำคัญ', 'day-teacher': 'ภาพวันสำคัญ', 'day-lent': 'ภาพวันสำคัญ', 'day-father': 'ภาพวันสำคัญ',
  'animal-cow': 'ภาพสัตว์', 'animal-calf': 'ภาพสัตว์', 'animal-dog': 'ภาพสัตว์', 'animal-puppy': 'ภาพสัตว์', 'animal-cat': 'ภาพสัตว์', 'animal-kitten': 'ภาพสัตว์', 'animal-duck': 'ภาพสัตว์', 'animal-duckling': 'ภาพสัตว์', 'animal-pig': 'ภาพสัตว์', 'animal-piglet': 'ภาพสัตว์', 'animal-sheep': 'ภาพสัตว์', 'animal-lamb': 'ภาพสัตว์',
  'road-red': 'ภาพบนถนน', 'road-yellow': 'ภาพบนถนน', 'road-green': 'ภาพบนถนน', 'road-zebra': 'ภาพบนถนน', 'road-bridge': 'ภาพบนถนน', 'road-helmet': 'ภาพบนถนน', 'road-belt': 'ภาพบนถนน', 'road-ball': 'ภาพบนถนน',
  // แผ่น L M N (design/PROMPTS-gemini-11.md) — เด็กทั้งตัว (ตัดพื้น), ภาพเรียงลำดับ 4 เรื่อง และสถานที่ในชุมชน 12 แห่ง (อยู่ในกรอบ)
  'child-girl': 'เด็กหญิง', 'child-boy': 'เด็กชาย',
  'seq-dress-1': 'ภาพเหตุการณ์', 'seq-dress-2': 'ภาพเหตุการณ์', 'seq-dress-3': 'ภาพเหตุการณ์', 'seq-dress-4': 'ภาพเหตุการณ์',
  'seq-fish-1': 'ภาพเหตุการณ์', 'seq-fish-2': 'ภาพเหตุการณ์', 'seq-fish-3': 'ภาพเหตุการณ์', 'seq-fish-4': 'ภาพเหตุการณ์',
  'seq-tree-1': 'ภาพเหตุการณ์', 'seq-tree-2': 'ภาพเหตุการณ์', 'seq-tree-3': 'ภาพเหตุการณ์', 'seq-tree-4': 'ภาพเหตุการณ์',
  'seq-egg-1': 'ภาพเหตุการณ์', 'seq-egg-2': 'ภาพเหตุการณ์', 'seq-egg-3': 'ภาพเหตุการณ์', 'seq-egg-4': 'ภาพเหตุการณ์',
  'place-hospital': 'ภาพสถานที่', 'place-police': 'ภาพสถานที่', 'place-fire': 'ภาพสถานที่', 'place-post': 'ภาพสถานที่', 'place-library': 'ภาพสถานที่', 'place-supermarket': 'ภาพสถานที่', 'place-bus': 'ภาพสถานที่', 'place-bank': 'ภาพสถานที่', 'place-bakery': 'ภาพสถานที่', 'place-gas': 'ภาพสถานที่', 'place-park': 'ภาพสถานที่', 'place-pharmacy': 'ภาพสถานที่',
};
export const FRIENDS = {
  cat: 'แมว', rabbit: 'กระต่าย', seal: 'แมวน้ำ', penguin: 'เพนกวิน', turtle: 'เต่า', unicorn: 'ยูนิคอร์น',
  butterfly: 'ผีเสื้อ', dolphin: 'โลมา', fox: 'จิ้งจอก', octopus: 'ปลาหมึก', squirrel: 'กระรอก',
};
// ลูกของเพื่อน (design/PROMPTS-gemini-13.md): ใส่รหัสเพื่อนที่มีไฟล์ friends/<id>-baby.png แล้ว
// ตัวที่ยังไม่มีรูปลูก เกมใช้รูปแม่ย่อเล็กพร้อมหัวใจแทน
export const BABY_ART = ['cat', 'rabbit', 'seal', 'penguin', 'turtle', 'unicorn', 'butterfly', 'dolphin', 'fox', 'octopus', 'squirrel'];
export const hasBabyArt = (id) => BABY_ART.includes(id);
export const STICKERS = {
  star: 'ดาว', rainbow: 'สายรุ้ง', balloon: 'ลูกโป่ง', blossom: 'ดอกไม้', bow: 'โบว์',
  fish: 'ปลาน้อย', icecream: 'ไอศกรีม', lollipop: 'อมยิ้ม', strawberry: 'สตรอว์เบอร์รี', sunflower: 'ทานตะวัน',
};

export const ASSETS = Object.freeze({
  ...Object.fromEntries(Object.entries(PICTURES).map(([id, alt]) => [`pic-${id}`, { file: `pictures/${id}.png`, alt }])),
  ...Object.fromEntries(Object.entries(FRIENDS).map(([id, alt]) => [`friend-${id}`, { file: `friends/${id}.png`, alt }])),
  ...Object.fromEntries(BABY_ART.map((id) => [`friend-baby-${id}`, { file: `friends/${id}-baby.png`, alt: `ลูก${FRIENDS[id]}` }])),
  ...Object.fromEntries(Object.entries(STICKERS).map(([id, alt]) => [`sticker-${id}`, { file: `stickers/${id}.png`, alt }])),
  'background-classroom': { file: 'backgrounds/classroom.jpg', alt: '', decorative: true },
  'background-rainbow': { file: 'backgrounds/rainbow.jpg', alt: '', decorative: true },
});

export function asset(id) {
  const entry = ASSETS[id];
  if (!entry) throw new Error(`Unknown asset: ${id}`);
  return { ...entry, src: `${BASE}assets/${entry.file}` };
}
