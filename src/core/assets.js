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
};
export const FRIENDS = { cat: 'แมว', rabbit: 'กระต่าย', seal: 'แมวน้ำ', penguin: 'เพนกวิน', turtle: 'เต่า', unicorn: 'ยูนิคอร์น' };
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
