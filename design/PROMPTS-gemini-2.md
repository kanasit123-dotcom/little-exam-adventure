# Prompt ชุดที่ 2 — รูปประกอบโจทย์แผ่น B

> **สถานะ: ยังไม่ได้ทำ (เขียน 2026-09-26)** — ใช้กับข้อสอบชุดที่ 2 และเผื่อชุดต่อไป

**รวม 1 รูป**: แผ่นรูปประกอบโจทย์ 4×4 (16 ชิ้น)
ถ้าเลือกความละเอียดได้ ขอ **2K**

| ไฟล์ที่ต้องเซฟ | มีอะไร |
|---|---|
| `sheet-pictures-b.jpg` | ต้นไม้ 3 ขั้น (เรียงลำดับเหตุการณ์), ของลอย/จมน้ำ, สัตว์และผลไม้สำหรับโจทย์ฟังเรื่องและหาภาพไม่เข้าพวก |

**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`
(โฟลเดอร์นี้ไม่ขึ้น GitHub — ผมจะตัดรูปแล้วย้ายเข้าเกมเอง)

**วิธีทำ:** แนบรูป `design/incoming/sheet-pictures-a.jpg` (แผ่นแรกที่ทำไว้) เป็นตัวอย่างสไตล์ จะได้ภาพเข้าชุดกัน แล้ววาง prompt ด้านล่าง

## กติกาของแผ่นนี้ (เหมือนแผ่นแรก)

- ภาพต้อง**ดูเป็นของจริงที่เด็กจำได้ทันที** แบบภาพในหนังสือเด็ก สัตว์เป็นสัตว์ธรรมชาติ **ไม่ใส่เสื้อผ้า ไม่ยิ้มแบบการ์ตูน** สิ่งของไม่มีหน้า ไม่มีตา
- ไม่มีตัวหนังสือ ตัวเลข หรือลวดลายตัวอักษรในรูป (เหรียญต้องเรียบ ไม่มีตัวเลข)
- ไม่มีหมี หมู ฮิปโป หมา โคอาลา ตุ๊กตาหมี
- ทุกชิ้นขนาดใกล้กัน อยู่กลางช่อง เว้นที่ว่างรอบๆ เยอะ ไม่ให้ชิ้นไหนวาดเกินช่อง
- **ต้นไม้ 3 ภาพแรกต้องใช้กระถางใบเดียวกัน** (สี ทรง ขนาดเหมือนกันทุกภาพ) ต่างกันแค่ต้นไม้ที่โตขึ้น

## B — `sheet-pictures-b.jpg`

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic. Draw every animal as a NATURAL real animal (no clothes, no accessories, no cartoon smile, no human pose) and every object plainly, so a young child recognises each one instantly in an exam picture.
Create ONE square sheet containing exactly 16 separate items arranged in a neat 4x4 grid, in exactly this reading order (left to right, then top to bottom). Every item is fully separated from the others by wide clear white space, none touching or overlapping, all drawn at a similar size, each drawn well inside its own invisible cell with a generous empty margin. Background pure flat white. No labels, no numbers, no letters, no text, no grid lines, no boxes, no shadows on the ground.
Items 1, 2 and 3 are the SAME small terracotta flower pot, identical in colour, shape and size in all three, showing a plant growing:
1) the terracotta pot filled with brown soil and one seed lying on top of the soil, no plant yet
2) the same pot with a tiny green sprout with two small leaves
3) the same pot with a grown plant with green leaves and one open pink flower
4) a fluffy yellow baby chick, standing, side view
5) a single green leaf
6) a smooth grey pebble stone
7) a colourful rubber ball
8) a plain round gold coin with no numbers, no letters and no pattern
9) a white farm duck, standing, side view
10) a small grey mouse, side view
11) a bunch of yellow bananas
12) a bunch of purple grapes
13) an orange carrot with green leaves
14) a small red car, side view, no face
15) a slice of watermelon
16) a toothbrush
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-plant-seed pic-plant-sprout pic-plant-flower pic-chick pic-leaf pic-stone pic-ball pic-coin pic-duck pic-mouse pic-banana pic-grapes pic-carrot pic-car pic-watermelon pic-toothbrush`

## ใช้ในโจทย์ชุดที่ 2 (ร่าง)

| รูป | โจทย์ |
|---|---|
| ต้นไม้ 3 ขั้น, ลูกไก่ (+ ไข่ แม่ไก่ จากแผ่นแรก) | เรียงลำดับเหตุการณ์: ภาพใดเกิดขึ้นก่อน / หลังสุด |
| ใบไม้ ก้อนหิน ลูกบอล เหรียญ (+ ช้อน จากแผ่นแรก) | สิ่งใดลอยน้ำ / สิ่งใดจมน้ำ |
| เป็ด หนู (+ ปลา จากแผ่นแรก) | ฟังเรื่องแล้วเลือกภาพที่ไม่อยู่ในเรื่อง |
| กล้วย องุ่น แครอท | ภาพที่ไม่อยู่ในเรื่อง (ข้อลองใหม่) |
| กล้วย องุ่น รถ | ภาพใดไม่เข้าพวก |
| แตงโม แปรงสีฟัน | สำรองไว้ใช้ชุดต่อไป |
