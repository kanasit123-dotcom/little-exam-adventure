// ทุกประโยคที่เกมพูดได้ต้องมีคลิปที่อัดไว้ทั้งความเร็วปกติและช้า (ไม่ตกไปใช้เสียงเครื่อง)
// ถ้า test นี้ล้ม: รัน npm run voice
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { allSpeeches } from '../src/content/speeches.js';

const root = new URL('../public/voice/th/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('manifest.json', root), 'utf8'));

test('every sentence the game can say has a recorded clip at both speeds', () => {
  const missing = [];
  for (const text of allSpeeches()) {
    const hash = manifest.clips[text];
    if (!hash) { missing.push(text); continue; }
    for (const speed of ['normal', 'slow']) assert.ok(existsSync(new URL(`${speed}/${hash}.mp3`, root)), `${speed}: ${text}`);
  }
  assert.deepEqual(missing, []);
});

test('no stray voice files and the voice is Premwadee', () => {
  const used = new Set(Object.values(manifest.clips).map((h) => `${h}.mp3`));
  for (const speed of ['normal', 'slow']) for (const f of readdirSync(new URL(`${speed}/`, root))) assert.ok(used.has(f), `${speed}/${f}`);
  assert.equal(manifest.voice, 'th-TH-PremwadeeNeural');
});
