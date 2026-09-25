# Audit: game-lilly

วันที่ตรวจ: 2026-09-25  
Source: `C:\Users\KANASIT\Documents\Codex\game-lilly`  
Source commit: `61c97c1a8b0519a17849fccf985a706a6bd36a26`

การตรวจนี้เป็น read-only ไม่มีการแก้ไฟล์ใน `game-lilly`

## สรุป

โปรเจกต์เดิมมีระบบที่ผ่านการใช้งานจริงและนำแนวทางมาใช้ต่อได้มาก แต่ไม่ควร import ไฟล์ข้าม Repository ตอน runtime เพราะจะผูกการ deploy, storage, cache และ release ของสองเกมเข้าด้วยกัน แนวทางที่ปลอดภัยคือคัดลอกเฉพาะโมดูลที่เลือกแล้วปรับ API ให้เหมาะกับข้อสอบ พร้อมบันทึก source commit และเพิ่ม test ใน repo ใหม่

| ส่วน | สถานะ | แนวทางใน repo ใหม่ |
| --- | --- | --- |
| Artwork | พร้อมใช้บางส่วน | คัดลอกเฉพาะภาพที่อนุมัติและทำ asset registry ใหม่ |
| เสียง | โครงดีและรองรับ iOS | ย้ายแนวคิด queue/cancel/replay; สร้างคลิปเฉพาะประโยคข้อสอบ |
| ตั้งบวก/ตั้งลบ | ครบตัวทดและตัวยืม | แยก pure step builder และใช้เฉพาะช่วงเฉลย |
| Router/lifecycle | เรียบง่ายและใช้ได้ | ทำ state machine สำหรับ exam/review โดยเฉพาะ |
| State | ไม่ควรคัดลอกตรง ๆ | ใช้ key และ schema ใหม่ มี resume กลางข้อสอบ |
| Reward | มีดาว/สติกเกอร์/เพื่อน | ใช้ภาพและจังหวะฉลองได้ แต่รางวัลเกมใหม่ต้องไม่ขึ้นกับคะแนน |
| Tests | ครอบคลุม regression สูง | นำรูปแบบ unit + Playwright + offline matrix มาใช้ |

## Artwork

### ของที่พบ

- `assets/friends`: ภาพตัวละครพื้นโปร่งใส 11 ไฟล์
- `assets/stickers`: สติกเกอร์ 10 ไฟล์
- `assets/worlds`: ฉาก 7 ไฟล์
- `assets/items`: ของแต่งตัว 14 ไฟล์
- `design/ART-PROMPT.md`: prompt ต้นทางของตัวละครชุดแรก
- `design/cutout.py`, `split.py`, `verify.cjs`: pipeline เตรียมและตรวจภาพ
- `js/assets.js`: registry สำหรับชื่อสัตว์, alt text และ fallback

### จุดแข็ง

- ตัวละครมี silhouette ชัด สีและสีหน้าสุภาพ เหมาะกับเด็ก 4–6 ปี
- PNG ตัวละครมีพื้นโปร่งใสและมี E2E ตรวจ alpha channel
- asset ID แยกจากข้อความแสดงผลแล้ว จึงนำแนวคิด registry ไปใช้ได้
- มีแนวทางชัดว่าไม่แสดงหน้าผิดหวังเมื่อตอบผิด

### ข้อควรระวัง

- ไม่พบ license รวมสำหรับ artwork ใน root; ถือเป็นงานของเจ้าของโปรเจกต์และเก็บ repo ใหม่เป็น private จนยืนยันสิทธิ์เผยแพร่
- ห้ามใช้ชื่อไฟล์เป็น alt text โดยตรง ต้องมีชื่อไทย/อังกฤษใน registry
- ไม่คัดลอกไอคอน PWA เดิม เพราะมี branding ของเกมเดิม
- Lucide มี license แยกใน `vendor/lucide-LICENSE.txt`; ถ้านำ library ไปใช้ต้องนำ license ไปด้วย

### ชุดเริ่มต้นที่อนุมัติสำหรับ scaffold

- ตัวละคร: cat, seal, rabbit
- รางวัล: star, rainbow
- ฉาก: rainbow

รายละเอียด source/destination อยู่ใน `docs/ASSET-MIGRATION.md`

## ระบบเสียง

ไฟล์หลัก: `game-lilly/js/audio.js`

### ความสามารถที่ใช้ต่อได้

- `unlockAudio()` รองรับ `AudioContext`/`webkitAudioContext` และ resume หลัง iOS พักเสียง
- คลังเสียงอัดล่วงหน้าไทย/อังกฤษ มี 1,964 ไฟล์ รวมประมาณ 26.5 MB
- manifest จับข้อความกับไฟล์เสียง และประกอบประโยคจากคลิปย่อยแบบ longest match
- ตัดความเงียบหัวท้ายคลิปก่อนต่อประโยค
- `speak()` คืน Promise เมื่อเสียงจบ พร้อม guard timeout สำหรับ iOS
- `speakPrompt()` + `replay()` รองรับปุ่มอ่านโจทย์ซ้ำ
- `stopSpeech()` ยกเลิกทั้ง Web Audio source และ SpeechSynthesis
- แปลงสัญลักษณ์คณิตศาสตร์เป็นคำพูดก่อนอ่าน

### สิ่งที่ต้องแก้ก่อนย้าย

1. `speak()` เดิมคืนทันทีหากไม่มี `speechSynthesis` แม้จะมีไฟล์เสียงอัด จึงควรแยก gate ของ recorded clips ออกจาก TTS fallback
2. การเรียก `speak()` ใหม่ยกเลิกเสียงเดิม เหมาะกับปุ่มอ่านซ้ำ แต่ flow อัตโนมัติต้องมี queue/session token เพื่อไม่ตัดคำอธิบายกลางทาง
3. คลัง 26.5 MB ใหญ่เกิน Vertical Slice ห้ามคัดลอกทั้งหมด ให้สร้าง manifest จากข้อความของ 12 ข้อและขั้นเฉลยเท่านั้น
4. Unit test ตรวจว่าคลิปประกอบประโยคได้ แต่ยังต้องตรวจฟังจริงบน iPad ว่าเสียงออกหลังล็อกจอ/สลับแอปและไม่มีประโยคซ้อน

## ระบบตั้งบวกและตั้งลบ

ไฟล์หลัก: `game-lilly/js/games/column.js`

### ความสามารถที่พบ

- สร้างโจทย์บวก/ลบหลักเดียวและสองหลัก
- บวกมีตัวทดและลบมีการยืม
- วางเลขหลักเดียวชิดหลักหน่วย ไม่เติมศูนย์นำหน้า
- ทำทีละหลัก: ถาม, เขียนคำตอบ, ทด, ยืม, และข้ามศูนย์หลักสิบ
- มีภาพมัดสิบและ blocks ช่วยอธิบาย
- มี recap หลังจบโจทย์และรอเสียงสรุปก่อนแสดงปุ่มถัดไป
- รองรับ AbortSignal/lifecycle จากหน้าจอเกม

### วิธีใช้ในเกมสอบ

- ช่วงสอบ: แสดงเฉพาะโจทย์และตัวเลือก ห้าม mount guided column engine
- ช่วงเฉลย: ใช้ fixed problem จาก content เช่น `8 + 7` และ `12 - 5`
- แยก `buildSteps(problem)` เป็น pure function ที่ export และ unit test ได้
- renderer ช่วงเฉลยเดินทีละ step ด้วยปุ่ม “ขั้นต่อไป” และปุ่มอ่านซ้ำ
- ห้าม confetti หรือบอกถูกผิดระหว่างขั้นเฉลย; ฉลองหลังจบ review ทั้งชุด
- ไม่คัดลอก random generator เข้ามาใน Vertical Slice

## โครงสร้างโปรเจกต์เดิม

- Static HTML/CSS/ES Modules ไม่มี framework
- `js/router.js` จัด cleanup, หยุดเสียง และ reset replay เมื่อเปลี่ยนหน้า
- `js/screens/game.js` เป็น host ของ game engine และปุ่มอ่านซ้ำ
- `js/state.js` ใช้ localStorage key `lilly-world-v1` และบันทึกประวัติสูงสุด 400 ครั้ง
- `js/rewards.js` + `screens/result.js` จัดดาว รางวัล และฉลอง
- `sw.js` precache แอปและเสียงเพื่อ offline
- `tests/game.cjs` ตรวจ 92 ด่านเดิม + 32 ด่านใหม่, state migration, responsive, artwork, voice composition และ offline

## สิ่งที่ห้ามนำข้ามมาตรง ๆ

- storage key `lilly-world-v1`
- level IDs, progress และ reward thresholds ของเกมเดิม
- Service Worker cache/scope เดิม
- branding “โลกของลิลลี่” และชื่อเฉพาะบุคคล
- logic ให้ดาวจาก first try เพราะข้อสอบใหม่ต้องไม่กดดันเด็ก
- hint/retry behavior ของเกมฝึกในช่วง exam

## Baseline verification

- Git worktree เดิมสะอาดก่อนตรวจ
- Source revision ถูกบันทึกไว้ด้านบน
- Regression command: `node tests/game.cjs` บน `http://127.0.0.1:5173`
- ผล 2026-09-25: PASS ทั้ง 32 บทเรียนใหม่, 92 ด่านเดิม, สระไทย, มินิเกม 16 เมนู, responsive, state reload, offline, artwork และ voice coverage

## สถานะแผนล่าสุด

ไม่พบ `Lily_Exam_Game_Work_Handoff.md` ณ วันที่สำรวจ แต่ผู้ใช้ส่ง specification ใหม่และอนุมัติแผนแล้ว ให้ยึด [PROJECT-PLAN.md](PROJECT-PLAN.md) และ [docs/DECISIONS.md](docs/DECISIONS.md) ไม่ต้องรอไฟล์แนบเก่า แผนปัจจุบันคือ 6 หมวดและวงจร 5+5+2 ผลตรวจระบบเดิมด้านบนเป็น baseline ณ source revision ที่ระบุ ไม่ใช่หลักฐานว่าระบบเกมใหม่ทำเสร็จแล้ว
