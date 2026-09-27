# Prompt ชุดที่ 6 — รูปประกอบโจทย์แผ่น F (ใช้กับข้อสอบชุดที่ 11 ขึ้นไป)

> **สถานะ: รอรูป**

**รวม 1 รูป**: แผ่นรูปประกอบโจทย์ 4×4 (16 ชิ้น)
ถ้าเลือกความละเอียดได้ ขอ **2K**

| ไฟล์ที่ต้องเซฟ | มีอะไร |
|---|---|
| `sheet-pictures-f.jpg` | ท้องฟ้าและอากาศ 4 ภาพ, เสื้อผ้า 3 ชิ้น, อาหาร 3 อย่าง, ผลไม้ไทย 3 ชนิด, สัตว์ตัวเล็ก 3 ชนิด |

**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`
(โฟลเดอร์นี้ไม่ขึ้น GitHub — ผมจะตัดรูปแล้วย้ายเข้าเกมเอง)

**วิธีทำ:** แนบรูป `design/incoming/sheet-pictures-e.jpg` (แผ่นล่าสุด) เป็นตัวอย่างสไตล์ แล้ววาง prompt ด้านล่าง

## กติกาของแผ่นนี้

- สไตล์เดียวกับแผ่น A ถึง E: ภาพหนังสือเด็ก สีพาสเทล ลายดินสอสี ไม่ใช่ 3D
- **ชิ้นที่ 2 (พระจันทร์กับดาว) อยู่ในกรอบสี่เหลี่ยมมุมมน พื้นในกรอบเป็นท้องฟ้ากลางคืนสีน้ำเงินเข้ม** (ไม่งั้นดาวสีขาวจะหายตอนตัดพื้นขาว)
- ชิ้นอื่นอยู่บนพื้นขาว ไม่มีกรอบ ชิ้นห่างกันชัดเจน ไม่ทับกัน
- สัตว์เป็นสัตว์ธรรมชาติ ไม่ใส่เสื้อผ้า ไม่มีหน้ายิ้มแบบการ์ตูน **เห็นขาชัดเจนนับได้** (ผึ้ง 6 ขา แมงมุม 8 ขา) แมงมุมต้องดูน่ารัก ไม่น่ากลัว
- ไม่มีตัวหนังสือ ตัวเลข ป้าย หรือโลโก้
- ถ้าได้รูปที่มีตัวหนังสือ ขอให้ Gemini แก้ "remove all text, numbers and logos" ก่อนเซฟ

## F — `sheet-pictures-f.jpg`

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic. Draw every animal as a NATURAL real animal (no clothes, no cartoon smile, no human pose) and every object plainly, so a young child recognises each one instantly in an exam picture.
Create ONE square sheet containing exactly 16 separate items arranged in a neat 4x4 grid, in exactly this reading order (left to right, then top to bottom). Every item is fully separated from the others by wide clear white space, none touching or overlapping, all the same size, each well inside its own invisible cell with a generous empty margin. Background pure flat white. No labels, no numbers, no letters, no text, no logos, no shadows on the ground.
Item 2 is a small SCENE inside a rounded-rectangle panel with a thin soft grey-blue border line, filled with a dark blue night sky. All other items are single objects or animals on plain white with no border.
1) a bright yellow sun with short rays
2) (panel) a pale yellow crescent moon and a few small twinkling stars in a dark blue night sky
3) a grey rain cloud with blue raindrops falling below it
4) a rainbow arc with soft white clouds at both ends
5) a yellow hooded raincoat, shown flat, front view
6) a thick knitted wool sweater, shown flat, front view
7) a pair of white sneakers, side by side
8) a bowl of steamed white rice
9) a glass of milk
10) a fried egg on a small white plate
11) a ripe yellow mango
12) a green spiky durian
13) a small bunch of red hairy rambutans
14) a honeybee, top view, its six legs clearly visible
15) a garden snail with a brown spiral shell, side view
16) a small friendly-looking brown garden spider, top view, its eight legs clearly visible, not scary
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-sun pic-night pic-rain-cloud pic-rainbow pic-raincoat pic-sweater pic-sneakers pic-rice pic-milk pic-fried-egg pic-mango pic-durian pic-rambutan pic-bee pic-snail pic-spider`

## ใช้ในโจทย์ชุดที่ 11 ขึ้นไป (ร่าง)

| รูป | โจทย์ |
|---|---|
| ดวงอาทิตย์ กลางคืน เมฆฝน รุ้ง | เห็นสิ่งใดบนท้องฟ้าตอนกลางคืน / รุ้งเกิดหลังฝนตก / ฝนตกมาจากอะไร |
| เสื้อกันฝน เสื้อกันหนาว รองเท้า | ฤดูฝนควรใส่อะไร / ฤดูหนาวควรใส่อะไร (ต่อกับภาพฤดูแผ่น C) |
| ข้าว นม ไข่ดาว | อาหารหลัก / นมช่วยให้กระดูกแข็งแรง / มื้อเช้า |
| มะม่วง ทุเรียน เงาะ | ผลไม้ใดมีหนาม / ไม่เข้าพวก (ร่วมกับผักจากแผ่น B) / นับผลไม้ |
| ผึ้ง หอยทาก แมงมุม | นับขา (ผึ้ง 6 แมงมุม 8) / สัตว์ใดเดินช้าที่สุด / ผึ้งให้อะไรกับเรา |
