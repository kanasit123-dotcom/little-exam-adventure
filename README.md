# Lily Exam Adventure

แผนเกมเตรียมความพร้อมเข้า ป.1 สำหรับเด็ก 5-6 ปี แยก Repository จากเกมลิลลี่เดิม

## ส่งต่อให้ AI

เริ่มอ่าน [AI-HANDOFF.md](AI-HANDOFF.md) แล้วทำตาม [PROJECT-PLAN.md](PROJECT-PLAN.md)

แผนล่าสุด: 6 หมวด เล่นครั้งละ 12 ข้อ แบ่ง 5+5+2 มีฟังโจทย์/ตัวเลือกซ้ำ ช่วงสอบไม่มีตัวช่วย เฉลยทีละขั้น เพื่อนเชียร์แบบสงบ พัก และรางวัลจากการทำครบ

## สถานะจริง

มี runnable Vite scaffold และภาพบางส่วน แต่ยังไม่มีเกมข้อสอบครบตามแผนล่าสุด โค้ดและข้อสอบตัวอย่างเดิมยังเป็นแผนรุ่นก่อนที่มีภาษาอังกฤษ ต้องปรับเมื่อเริ่มพัฒนา ไม่ใช่ผลิตภัณฑ์พร้อมใช้งาน

รอบปรับแผนนี้แก้เฉพาะ Markdown ไม่แก้เกมเดิมหรือโค้ด scaffold

Local Git อยู่บน main ยังไม่มี commit หรือ remote ณ วันที่ 2026-09-25 จึงยังไม่ได้สร้าง/เผยแพร่ GitHub repository ชื่อโฟลเดอร์และ package ยังคง little-exam-adventure

## เอกสาร

- [แผนหลัก](PROJECT-PLAN.md)
- [งานสำหรับ AI ถัดไป](AI-HANDOFF.md)
- [ผลสำรวจเกมเดิม](AUDIT-GAME-LILLY.md)
- [สถาปัตยกรรม](docs/ARCHITECTURE.md)
- [ข้อกำหนดเนื้อหา](docs/CONTENT-SPEC.md)
- [ภาพและเสียง](docs/ASSET-MIGRATION.md)
- [แผนทดสอบ](docs/TEST-PLAN.md)
- [ข้อตกลงล่าสุด](docs/DECISIONS.md)

## คำสั่งสำหรับผู้พัฒนา

~~~bash
npm ci
npm run check
npm run test:e2e
npm run dev
~~~

ตรวจ URL/port จาก Vite config และ output เมื่อรันจริง ผล test ของ scaffold ไม่ใช่หลักฐานว่าระบบข้อสอบหรือเสียงบน iPad ผ่านแล้ว

ห้ามแก้เกมเดิม ห้ามแชร์ runtime/storage/cache ระหว่างสองเกม และห้ามอ้างโจทย์จำลองว่าเป็นข้อสอบจริงของโรงเรียน
