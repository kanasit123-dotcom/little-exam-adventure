# Prompt ชุดที่ 9 — รูปประกอบโจทย์แผ่น I และ J: เรียงลำดับเหตุการณ์เรื่องใหม่ และภาพมารยาท (ใช้กับข้อสอบชุดที่ 22 ขึ้นไป)

> **สถานะ: รอผู้ปกครองสร้างรูป (เขียน prompt 2026-10-02)** — ทำแผ่นไหนก่อนก็ได้ ไม่ต้องทำสองแผ่นพร้อมกัน

**รวม 2 รูป**
ถ้าเลือกความละเอียดได้ ขอ **2K**

| ไฟล์ที่ต้องเซฟ | มีอะไร | ใช้ทำชุด |
|---|---|---|
| `sheet-pictures-i.jpg` | เรียงลำดับเหตุการณ์ 4 เรื่อง เรื่องละ 4 ภาพ (จัดกระเป๋า ตอนเช้า วันฝนตก วาดรูป) | ชุดที่ 22 |
| `sheet-pictures-j.jpg` | ภาพมารยาท 12 ภาพ (ทำถูก 6 ภาพ ทำไม่ถูก 6 ภาพ) | ชุดที่ 23 |

**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`
(โฟลเดอร์นี้ไม่ขึ้น GitHub — ผมจะตัดรูปแล้วย้ายเข้าเกมเอง)

**วิธีทำ:** แนบรูป `design/incoming/sheet-pictures-h.jpg` (แผ่นเรียงลำดับเหตุการณ์ที่ทำไว้แล้ว) เป็นตัวอย่างสไตล์และตัวเด็กหญิง แล้ววาง prompt ด้านล่าง

## ทำไมต้องมีแผ่นนี้

- **แผ่น I:** "เรียงลำดับเหตุการณ์จากภาพ 4 ภาพ" เป็นโจทย์ที่เจอบ่อยในข้อสอบเก่า ชุดที่ 17 ใช้เรื่องปลูกต้นไม้ แปรงฟัน แซนด์วิช ข้ามถนนไปแล้ว แผ่นนี้เพิ่มเรื่องใหม่ 4 เรื่องที่เด็กรู้จัก
- **แผ่น J:** ข้อสอบเก่ามีโจทย์มารยาท ("ภาพใดเป็นการกระทำที่ถูกต้อง" "ถ้าเป็นหนูควรทำอย่างไร") ตอนนี้เกมมีโจทย์มารยาทเป็นตัวหนังสืออย่างเดียว แผ่นนี้ให้โจทย์แบบดูภาพ

## กติกาของทั้งสองแผ่น

- สไตล์เดียวกับแผ่น A ถึง H: ภาพหนังสือเด็ก สีพาสเทล ลายดินสอสี ไม่ใช่ 3D
- **ทุกภาพเป็นฉากในกรอบสี่เหลี่ยมมุมมน เส้นกรอบบางสีเทาอมฟ้า ขนาดเท่ากันทุกช่อง** (ผมต้องใช้กรอบนี้ตัดรูป)
- ไม่มีตัวหนังสือ ตัวเลข ป้าย หรือโลโก้ในภาพ (ถ้าได้รูปที่มีตัวหนังสือ ขอให้ Gemini แก้ "remove all text, numbers and logos" ก่อนเซฟ)
- **ภาพที่อยู่ติดกันในเรื่องเดียวกันต้องต่างกันให้เห็นชัด** (บทเรียนจากแผ่น H: ภาพข้ามถนนภาพที่ 2 กับ 3 ต่างกันน้อยเกินไป จึงใช้ไม่ได้)
- ท่าทางและสีหน้าสุภาพ ไม่ใช้ความรุนแรงจริงจัง (ภาพ "ทำไม่ถูก" ให้ดูออกง่ายแต่ไม่น่ากลัว)

## I — `sheet-pictures-i.jpg` (ใช้ทำชุดที่ 22)

```text
Use the attached sheet only as a reference for the drawing style and for the little girl: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic.
Create ONE square sheet containing exactly 16 small scenes arranged in a neat 4x4 grid, in exactly this reading order (left to right, then top to bottom). Every scene is drawn inside its own rounded-rectangle panel with a thin soft grey-blue border line, all 16 panels exactly the same size, separated by clear white space. Background outside the panels is pure flat white. No labels, no numbers, no letters, no text, no logos, no arrows.
The same little Thai girl appears in all scenes: about six years old, black hair in two pigtails, light pink shirt, yellow skirt (in the morning-routine row she may wear light blue pyjamas in the first two panels, then the pink shirt and yellow skirt). Keep her face and size identical in every panel. Each ROW of four panels is one short story; the four panels of a row use the SAME room or background and the SAME camera angle, and only the action changes. Neighbouring panels in a row must look clearly different from each other.
Row 1 (packing a school bag, in a bedroom with a desk):
1) an empty open school bag lies on the desk; textbooks, a pencil case and a water bottle are spread out on the desk; the girl stands looking at them
2) the girl puts the textbooks into the bag; the pencil case and the bottle are still on the desk
3) the pencil case and the water bottle are now also inside the bag, the desk is empty; the girl is closing the zip
4) the girl wears the closed school bag on her back and smiles, ready to go
Row 2 (a morning routine, in the girl's home):
5) the girl is asleep in her bed with her blanket pulled up, morning sunlight comes through the window
6) the girl is standing by the bed, stretching her arms up, awake
7) the girl sits at a small table and eats breakfast, a bowl of rice porridge and a glass of milk in front of her, now dressed in the pink shirt and yellow skirt
8) the girl stands at the front door putting on her shoes, with a school bag by her feet
Row 3 (a rainy day, in a street in front of a house, same camera angle):
9) the sky is bright blue with a few white clouds and the girl stands at the door of her house
10) the sky is full of dark grey clouds and heavy rain is falling; the girl stands under the roof looking up
11) the girl walks along the street holding a red umbrella, with rain falling around her
12) the rain has stopped, the clouds are gone, a rainbow shines in the sky and the girl closes her umbrella and smiles
Row 4 (drawing a picture, at a table with paper and crayons):
13) a blank white sheet of paper lies on the table, a pencil and a box of crayons next to it; the girl sits holding the pencil
14) the girl has drawn the outline of a house and a sun in pencil on the paper
15) the girl colours the drawing with crayons; the house is red, the sun is yellow, the picture is now fully coloured
16) the girl proudly holds up the finished coloured picture towards a smiling adult standing beside her
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-seq-bag-1 pic-seq-bag-2 pic-seq-bag-3 pic-seq-bag-4 pic-seq-morning-1 pic-seq-morning-2 pic-seq-morning-3 pic-seq-morning-4 pic-seq-rain-1 pic-seq-rain-2 pic-seq-rain-3 pic-seq-rain-4 pic-seq-draw-1 pic-seq-draw-2 pic-seq-draw-3 pic-seq-draw-4`

## J — `sheet-pictures-j.jpg` (ใช้ทำชุดที่ 23)

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic.
Create ONE square sheet containing exactly 12 small scenes arranged in a neat 4 columns x 3 rows grid, in exactly this reading order (left to right, then top to bottom). Every scene is drawn inside its own rounded-rectangle panel with a thin soft grey-blue border line, all 12 panels exactly the same size, separated by clear white space. Background outside the panels is pure flat white. No labels, no numbers, no letters, no text, no logos, no arrows, no ticks or crosses. The scenes are independent single moments (not a story). The same little Thai girl (about six years old, black hair in two pigtails, light pink shirt, yellow skirt) is the main child in every scene; other children and adults are friendly cartoon people. The expressions are clear: happy faces for good behaviour, and for the not-good behaviour the child looks careless or the other people look upset, but nothing is violent or scary.
Row 1 - good behaviour:
1) the girl puts her palms together and bows in a traditional Thai wai greeting to a smiling female teacher in a school corridor
2) four children stand in a neat single-file queue at a school food stall, waiting calmly, the girl is third in line
3) on a bus, the girl stands up from her seat and offers it to a smiling elderly woman with a walking stick
4) the girl drops a piece of paper into a green rubbish bin in a park
Row 2 - good behaviour (first two) then not-good behaviour (last two):
5) the girl helps an elderly man carry a heavy bag of vegetables along the pavement
6) the girl shares her snack by handing half a biscuit to a smiling friend on a bench
7) the girl throws a snack wrapper on the ground of a park, while a green rubbish bin stands right next to her
8) the girl pushes into the front of a queue at the school food stall, past two waiting children who look upset
Row 3 - not-good behaviour:
9) in a quiet library, the girl shouts loudly with her hands cupped around her mouth, while other children cover their ears and a librarian holds a finger to her lips
10) the girl pulls a toy out of another child's hands, the other child looks sad
11) the girl walks away from a bathroom sink where the water tap is left running and water is overflowing
12) the girl sneezes loudly without covering her mouth right next to a friend, who turns away and frowns
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-manner-wai pic-manner-queue pic-manner-seat pic-manner-bin pic-manner-help pic-manner-share pic-manner-litter pic-manner-cut pic-manner-shout pic-manner-grab pic-manner-tap pic-manner-sneeze`

## ใช้ในโจทย์ชุดที่ 22 และ 23 (ร่าง)

| รูป | โจทย์ |
|---|---|
| จัดกระเป๋า ตอนเช้า วันฝนตก วาดรูป (สลับที่ ก ข ค ง) | เรียงลำดับเหตุการณ์ (4 ตัวเลือกเป็นลำดับ) / ภาพใดเกิดก่อน-หลังสุด / ภาพที่เท่าไร / ภาพใดตรงกับประโยค |
| ภาพมารยาท 12 ภาพ (แผ่นภาพ `board`) | ภาพใดเป็นการกระทำที่ถูกต้อง / มีภาพที่ทำถูกกี่ภาพ / ภาพใดไม่ควรทำที่ห้องสมุด / ถ้าเป็นหนูควรทำอย่างไร |
