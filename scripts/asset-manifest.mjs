// อัปเดต public/assets/asset-manifest.json: SHA-256 ของทุกรูป + ที่มา (ต้องระบุที่มาใน SOURCES ก่อน ไม่งั้นหยุด)
// รัน: node scripts/asset-manifest.mjs
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../public/assets/', import.meta.url);
const LILLY = 'game-lilly@61c97c1a8b0519a17849fccf985a706a6bd36a26 (ภาพจาก Gemini ที่ผู้ปกครองสร้างให้เกมลิลลี่ คัดลอกมา ไม่แก้ไข)';
const GEMINI_1 = 'Gemini โดยผู้ปกครอง 2026-09-26 ตาม design/PROMPTS-gemini-1.md แล้วตัดพื้นด้วย design/blobs.py + cutout.py';
const SOURCES = [
  [/^pictures\//, GEMINI_1],
  [/^backgrounds\/classroom\.jpg$/, GEMINI_1],
  [/^(friends|stickers)\//, LILLY],
  [/^backgrounds\/rainbow\.jpg$/, LILLY],
];

const files = {};
const provenance = {};
for (const folder of readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
  for (const name of readdirSync(new URL(`${folder}/`, root)).sort()) {
    const rel = `${folder}/${name}`;
    const source = SOURCES.find(([pattern]) => pattern.test(rel))?.[1];
    if (!source) throw new Error(`ยังไม่ได้ระบุที่มาของ ${rel} ใน scripts/asset-manifest.mjs`);
    files[rel] = createHash('sha256').update(readFileSync(new URL(rel, root))).digest('hex');
    provenance[rel] = source;
  }
}
const manifest = {
  note: 'รูปทั้งหมดในโฟลเดอร์นี้ คัดลอกเข้ามาใน repo นี้ ห้ามโหลดจาก repo อื่นตอนเล่น',
  rights: 'ผู้ปกครองเป็นผู้สร้างภาพด้วย Gemini สำหรับเกมในครอบครัว และอนุญาตให้เผยแพร่บน GitHub Pages แบบ public (2026-09-26)',
  files,
  provenance,
};
writeFileSync(new URL('asset-manifest.json', root), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`${Object.keys(files).length} assets hashed`);
