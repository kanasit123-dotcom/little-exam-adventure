# Prompt ชุดที่ 8 — รูปประกอบโจทย์แผ่น H: เรียงลำดับเหตุการณ์ (ใช้กับข้อสอบชุดที่ 17 ขึ้นไป)

> **สถานะ: รอรูป**

**รวม 1 รูป**: แผ่นภาพเรื่องราว 4×4 (16 ช่อง = เรื่อง 4 เรื่อง เรื่องละ 4 ภาพ)
ถ้าเลือกความละเอียดได้ ขอ **2K**

| ไฟล์ที่ต้องเซฟ | มีอะไร |
|---|---|
| `sheet-pictures-h.jpg` | ปลูกต้นไม้ 4 ภาพ, แปรงฟัน 4 ภาพ, ทำแซนด์วิช 4 ภาพ, ข้ามถนน 4 ภาพ |

**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`
(โฟลเดอร์นี้ไม่ขึ้น GitHub — ผมจะตัดรูปแล้วย้ายเข้าเกมเอง)

**วิธีทำ:** แนบรูป `design/incoming/sheet-pictures-c.jpg` (แผ่นที่มีภาพล้างมือ 4 ช่อง) เป็นตัวอย่างสไตล์ แล้ววาง prompt ด้านล่าง

## ทำไมต้องมีแผ่นนี้

ข้อสอบจริงมีโจทย์ "เรียงลำดับเหตุการณ์ให้ถูกต้อง" หลายข้อ: ให้ภาพเรื่องราว 4 ภาพที่สลับที่กัน (ก ข ค ง) แล้วให้เลือกหรือเขียนลำดับที่ถูก
ตอนนี้เรามีแค่ภาพล้างมือกับวงจรผีเสื้อ (ใช้ไปแล้วในชุดที่ 5) แผ่นนี้เพิ่มเรื่องใหม่ 4 เรื่องที่เด็กรู้จักจากชีวิตประจำวัน

## กติกาของแผ่นนี้

- สไตล์เดียวกับแผ่น A ถึง G: ภาพหนังสือเด็ก สีพาสเทล ลายดินสอสี ไม่ใช่ 3D
- **ทุกภาพเป็นฉากในกรอบสี่เหลี่ยมมุมมน เส้นกรอบบางสีเทาอมฟ้า ขนาดเท่ากันทุกช่อง** (ผมต้องใช้กรอบนี้ตัดรูป)
- **ทุกเรื่องใช้เด็กหญิงคนเดียวกัน** ผมดำผูกเปีย 2 ข้าง อายุประมาณ 6 ปี ใส่เสื้อสีชมพูอ่อนกับกระโปรงสีเหลือง (เรื่องข้ามถนนมีมือผู้ใหญ่จูงเด็กหรือผู้ใหญ่ยืนข้างๆ ได้)
- **เรื่องเดียวกันต้องใช้ฉากและมุมกล้องเดียวกันทั้ง 4 ภาพ** เปลี่ยนแค่สิ่งที่เกิดขึ้น เพื่อให้เด็กดูแล้วรู้ลำดับเอง
- ภาพต้องบอกลำดับได้ชัดด้วยสิ่งที่เปลี่ยนไป ไม่ใช้ตัวเลข ลูกศร หรือตัวหนังสือ
- ไม่มีตัวหนังสือ ตัวเลข ป้าย หรือโลโก้ (ป้ายไฟคนข้ามถนนเป็นรูปคนสีเขียว/แดง ไม่มีตัวอักษร)
- ถ้าได้รูปที่มีตัวหนังสือ ขอให้ Gemini แก้ "remove all text, numbers and logos" ก่อนเซฟ

## H — `sheet-pictures-h.jpg`

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic.
Create ONE square sheet containing exactly 16 small scenes arranged in a neat 4x4 grid, in exactly this reading order (left to right, then top to bottom). Every scene is drawn inside its own rounded-rectangle panel with a thin soft grey-blue border line, all 16 panels exactly the same size, separated by clear white space. Background outside the panels is pure flat white. No labels, no numbers, no letters, no text, no logos, no arrows.
The same little Thai girl appears in all scenes: about six years old, black hair in two pigtails, light pink shirt, yellow skirt. Keep her face, clothes and size identical in every panel. Each ROW of four panels is one short story; the four panels of a row use the SAME background and the SAME camera angle, and only the action changes, so a child can tell the order from what has changed.
Row 1 (planting a seed, in a garden next to a small clay flower pot):
1) the girl kneels and digs a small hole in the soil of the pot with a little shovel
2) the girl puts one seed into the hole
3) the girl waters the soil with a small watering can
4) a small green sprout with two leaves has grown in the pot and the girl smiles at it
Row 2 (brushing teeth, in a small bathroom with a sink and a mirror):
5) the girl squeezes white toothpaste onto her toothbrush
6) the girl brushes her teeth, with white foam around her mouth
7) the girl rinses her mouth with water from a small cup, leaning over the sink
8) the girl smiles widely in the mirror showing clean white teeth
Row 3 (making a jam sandwich, at a kitchen table):
9) two slices of bread lie on a plate, next to a jar of red jam and a butter knife
10) the girl spreads red jam on one slice of bread
11) the girl puts the second slice on top to make a sandwich
12) the girl happily eats the sandwich
Row 4 (crossing the road safely, at a zebra crossing with a traffic light showing a green walking person and a red standing person, both as simple pictures without text):
13) the girl stands on the pavement at the edge of the zebra crossing holding an adult's hand; the pedestrian light shows the red standing person; cars are driving past
14) the girl and the adult look to the left and right; cars are still driving
15) the cars have stopped and the pedestrian light shows the green walking person
16) the girl and the adult walk across the zebra crossing
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-seq-plant-1 pic-seq-plant-2 pic-seq-plant-3 pic-seq-plant-4 pic-seq-teeth-1 pic-seq-teeth-2 pic-seq-teeth-3 pic-seq-teeth-4 pic-seq-sandwich-1 pic-seq-sandwich-2 pic-seq-sandwich-3 pic-seq-sandwich-4 pic-seq-road-1 pic-seq-road-2 pic-seq-road-3 pic-seq-road-4`

## ใช้ในโจทย์ชุดที่ 17 ขึ้นไป (ร่าง)

| รูป | โจทย์ |
|---|---|
| ปลูกต้นไม้ 4 ภาพ (สลับที่ ก ข ค ง) | เรียงลำดับเหตุการณ์ให้ถูกต้อง (4 ตัวเลือกเป็นลำดับ) / ภาพใดเกิดขึ้นก่อน/หลังสุด |
| แปรงฟัน 4 ภาพ | เรียงลำดับ / ทำไมต้องบ้วนปากหลังแปรง |
| ทำแซนด์วิช 4 ภาพ | เรียงลำดับ / ภาพใดเป็นภาพที่สาม |
| ข้ามถนน 4 ภาพ | เรียงลำดับ / ความปลอดภัย: ก่อนข้ามต้องทำอะไรก่อน |
