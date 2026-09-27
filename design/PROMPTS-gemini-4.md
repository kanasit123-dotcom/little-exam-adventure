# Prompt ชุดที่ 4 — รูปประกอบโจทย์แผ่น D (ใช้กับข้อสอบชุดที่ 8 ขึ้นไป)

> **สถานะ: รอรูป**

**รวม 1 รูป**: แผ่นรูปประกอบโจทย์ 4×4 (16 ชิ้น)
ถ้าเลือกความละเอียดได้ ขอ **2K**

| ไฟล์ที่ต้องเซฟ | มีอะไร |
|---|---|
| `sheet-pictures-d.jpg` | อาชีพ 6 คน, เครื่องมือของอาชีพ 4 ชิ้น, ยานพาหนะ 6 ชนิด |

**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`
(โฟลเดอร์นี้ไม่ขึ้น GitHub — ผมจะตัดรูปแล้วย้ายเข้าเกมเอง)

**วิธีทำ:** แนบรูป `design/incoming/sheet-pictures-a.jpg` (แผ่นแรก) เป็นตัวอย่างสไตล์ แล้ววาง prompt ด้านล่าง

## กติกาของแผ่นนี้

- สไตล์เดียวกับแผ่น A B C: ภาพหนังสือเด็ก สีพาสเทล ลายดินสอสี ไม่ใช่ 3D
- คนเป็นผู้ใหญ่คนไทย ยืนเต็มตัว หน้าตรง ขนาดเท่ากันทุกคน ถือหรือใส่ของที่บอกอาชีพชัดๆ
- **ไม่มีตัวหนังสือ ตัวเลข ป้าย หรือตราสัญลักษณ์** (รวมถึงบนรถและเครื่องแบบ)
- ทุกชิ้นอยู่บนพื้นขาว ไม่มีกรอบ ชิ้นห่างกันชัดเจน ไม่ทับกัน
- ถ้าได้รูปที่มีตัวหนังสือบนรถ ขอให้ Gemini แก้ "remove all text and symbols" ก่อนเซฟ

## D — `sheet-pictures-d.jpg`

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic. Draw every person as a friendly Thai adult, standing, full body, facing forward, all people the same height, and every object and vehicle plainly, so a young child recognises each one instantly in an exam picture.
Create ONE square sheet containing exactly 16 separate items arranged in a neat 4x4 grid, in exactly this reading order (left to right, then top to bottom). Every item is fully separated from the others by wide clear white space, none touching or overlapping, all the same size, each well inside its own invisible cell with a generous empty margin. Background pure flat white. No labels, no numbers, no letters, no text, no logos, no badges with symbols, no shadows on the ground.
1) a doctor: a woman in a white coat with a stethoscope around her neck
2) a police officer in a plain brown Thai police uniform and cap, no badge symbols
3) a firefighter in a yellow protective suit and red helmet
4) a rice farmer in a wide straw hat and simple blue farm clothes, holding a hoe
5) a teacher: a woman holding a book and pointing with her other hand, no blackboard
6) a cook in a white chef hat and white apron, holding a wooden spoon
7) a stethoscope on its own
8) a garden hoe on its own
9) a cooking pot (wok) with a ladle
10) a red fire extinguisher
11) a red fire truck with a ladder on top, side view, no writing
12) a white ambulance with a red stripe and a blue light on the roof, side view, no writing, no cross symbol
13) a small wooden boat on a little patch of blue water, side view
14) a white passenger airplane flying, side view, no writing
15) a yellow school bus, side view, no writing
16) a short passenger train with two carriages, side view, no writing
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-doctor pic-police pic-firefighter pic-farmer pic-teacher pic-cook pic-stethoscope pic-hoe pic-wok pic-extinguisher pic-firetruck pic-ambulance pic-boat pic-airplane pic-bus pic-train`

## ใช้ในโจทย์ชุดที่ 8 ขึ้นไป (ร่าง)

| รูป | โจทย์ |
|---|---|
| อาชีพ + เครื่องมือ | อาชีพนี้ใช้เครื่องมือใด / ใครใช้สิ่งนี้ทำงาน |
| นักดับเพลิง ตำรวจ หมอ | เกิดไฟไหม้/หลงทาง/ไม่สบาย ควรขอความช่วยเหลือจากใคร |
| ยานพาหนะ 6 ชนิด | ยานพาหนะใดไปทางน้ำ/อากาศ/ราง / ข้อใดไม่เข้าพวก |
| รถดับเพลิง รถพยาบาล | รถนี้ช่วยเหลือเรื่องใด |
| ชาวนา + จอบ | ข้าวที่เรากินมาจากใคร |
