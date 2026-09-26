# Prompt ชุดที่ 3 — รูปประกอบโจทย์แผ่น C (ใช้กับข้อสอบชุดที่ 5)

> **สถานะ: ทำแล้ว (2026-09-27)** — ตัดเป็น `public/assets/pictures/` 16 ชิ้น ใช้ในชุดที่ 5

**รวม 1 รูป**: แผ่นรูปประกอบโจทย์ 4×4 (16 ชิ้น)
ถ้าเลือกความละเอียดได้ ขอ **2K**

| ไฟล์ที่ต้องเซฟ | มีอะไร |
|---|---|
| `sheet-pictures-c.jpg` | ภาพเรียงลำดับล้างมือ 4 ช่อง, วงจรชีวิตผีเสื้อ 4 ขั้น, ฤดู 3 ภาพ, มด, เหยือก ขวด แก้ว, ค้างคาว |

**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`
(โฟลเดอร์นี้ไม่ขึ้น GitHub — ผมจะตัดรูปแล้วย้ายเข้าเกมเอง)

**วิธีทำ:** แนบรูป `design/incoming/sheet-pictures-a.jpg` (แผ่นแรก) เป็นตัวอย่างสไตล์ แล้ววาง prompt ด้านล่าง

## กติกาของแผ่นนี้

- สไตล์เดียวกับแผ่น A และ B: ภาพหนังสือเด็ก สีพาสเทล ลายดินสอสี ไม่ใช่ 3D
- สัตว์เป็นสัตว์ธรรมชาติ ไม่ใส่เสื้อผ้า ไม่ยิ้มแบบการ์ตูน สิ่งของไม่มีหน้า
- ไม่มีตัวหนังสือ ตัวเลข หรือป้าย
- **แถว 1 (ล้างมือ) และแถว 3 (ฤดู) เป็นภาพฉากในกรอบสี่เหลี่ยมมุมมน** กรอบเส้นบางสีอ่อน ขนาดเท่ากันทุกช่อง (ผมต้องใช้กรอบนี้ตัดรูป ถ้าไม่มีกรอบ หมอกหรือฟองสบู่สีขาวจะหายไปตอนตัดพื้นขาว)
- ภาพล้างมือ 4 ช่อง: **เห็นแค่มือเด็กคู่เดียวกันทุกช่อง ไม่มีหน้า** มุมกล้องเดียวกัน อ่างล้างมือกับก๊อกน้ำเดียวกัน
- ชิ้นอื่นอยู่บนพื้นขาว ไม่มีกรอบ ชิ้นห่างกันชัดเจน ไม่ทับกัน

## C — `sheet-pictures-c.jpg`

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic. Draw every animal as a NATURAL real animal (no clothes, no cartoon smile, no human pose) and every object plainly, so a young child recognises each one instantly in an exam picture.
Create ONE square sheet containing exactly 16 separate items arranged in a neat 4x4 grid, in exactly this reading order (left to right, then top to bottom). Every item is fully separated from the others by wide clear white space, none touching or overlapping, all the same size, each well inside its own invisible cell with a generous empty margin. Background pure flat white. No labels, no numbers, no letters, no text, no shadows on the ground.
Items 1 to 4 and items 9 to 11 are small SCENES, each drawn inside its own rounded-rectangle panel with a thin soft grey-blue border line, all panels exactly the same size. All other items are single objects or animals on plain white with no border.
Items 1 to 4 are one hand-washing story. Every panel shows ONLY a young child's two hands (no face, no body) at the SAME small white sink with the SAME silver tap, seen from the same angle:
1) the child's hands dirty with brown mud, held above the sink, tap turned off
2) the same hands being wet under running water from the tap, still a little muddy
3) the same hands covered in white soap bubbles, rubbing together, tap off
4) the same clean hands being dried with a small green towel
Items 5 to 8 are the life cycle of a butterfly, each on plain white:
5) a few tiny round pale eggs on one green leaf
6) a green caterpillar on one green leaf
7) a green chrysalis hanging from a small twig
8) an orange butterfly with open wings, top view
Items 9 to 11 are seasons in Thailand, each a small landscape scene inside a panel with the same simple field, one tree and a small house:
9) rainy season: dark rain clouds, falling rain, puddles on the ground
10) hot season: bright strong sun, clear blue sky, dry yellow grass, the tree giving shade
11) cool season: soft morning mist and fog over the field, pale sky, the tree with fewer leaves
12) a small black ant, side view
13) a round glass water jug (pitcher) with a handle, full of water
14) a clear plastic water bottle with a blue cap, full of water
15) a plain clear drinking glass, full of water
16) a brown bat flying with open wings, front view
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-wash-1 pic-wash-2 pic-wash-3 pic-wash-4 pic-bfly-egg pic-caterpillar pic-chrysalis pic-bfly-adult pic-season-rain pic-season-hot pic-season-cool pic-ant pic-jug pic-bottle pic-glass pic-bat`

## ใช้ในโจทย์ชุดที่ 5 (ร่าง)

| รูป | โจทย์ |
|---|---|
| ล้างมือ 4 ช่อง | เรียงลำดับเหตุการณ์ (ภาพสลับที่ มีป้าย ก ข ค ง ให้เลือกลำดับที่ถูก) / ภาพใดเกิดขึ้นหลังสุด |
| วงจรผีเสื้อ 4 ขั้น | วงจรชีวิต: ต่อจากหนอนคืออะไร / ขั้นแรกคืออะไร |
| ฤดู 3 ภาพ | ภาพใดเป็นฤดูฝน / ฤดูร้อน |
| มด | นับขาสัตว์ (มดมี 6 ขา) |
| เหยือก ขวด แก้ว | เทียบปริมาตร (เหยือก 1 ใบเท่ากับแก้ว 4 ใบ ขวด 1 ขวดเท่ากับแก้ว 2 ใบ) |
| ค้างคาว | สัตว์ที่ออกหากินกลางคืน |

ข้ออื่นในชุด 5 ใช้รูปเดิมหรือวาดด้วยโค้ด: นับของในภาพรวม, แบ่งขนมเท่าๆ กัน, บวกลบพร้อมตัวช่วยตั้งเลข
