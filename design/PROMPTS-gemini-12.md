# Prompt ชุดที่ 12 — รูปประกอบโจทย์แผ่น O, P, Q: วันสำคัญ ลูกสัตว์ ความปลอดภัยบนถนน (ใช้กับข้อสอบชุดที่ 32 ขึ้นไป)

> **สถานะ: รูปมาแล้วและใช้ทำชุด 32-34 แล้ว (2026-10-03)**

| ไฟล์ที่ต้องเซฟ | มีอะไร | ใช้ทำชุด |
|---|---|---|
| `sheet-pictures-o.jpg` | วันสำคัญของไทย 8 วัน (สงกรานต์ ลอยกระทง วันแม่ วันเด็ก ปีใหม่ วันไหว้ครู เข้าพรรษา วันพ่อ) ภาพในกรอบ | ชุดที่ 32 |
| `sheet-pictures-p.jpg` | สัตว์โตเต็มวัยกับลูกสัตว์ 6 คู่ (วัว สุนัข แมว เป็ด หมู แกะ) 12 ภาพ ตัดพื้น | ชุดที่ 33 |
| `sheet-pictures-q.jpg` | ความปลอดภัยบนถนน 8 ภาพ (ไฟแดง เหลือง เขียว ทางม้าลาย สะพานลอย หมวกกันน็อก เข็มขัดนิรภัย วิ่งตามลูกบอลออกถนน) ภาพในกรอบ | ชุดที่ 34 |

ถ้าเลือกความละเอียดได้ ขอ **2K**
**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`

**วิธีทำ:** แผ่น O และ Q แนบ `sheet-pictures-n.jpg` (ภาพในกรอบมุมมนที่เพิ่งทำ) เป็นตัวอย่างสไตล์ / แผ่น P แนบ `sheet-pictures-a.jpg` (สัตว์เดี่ยวบนพื้นขาว) เป็นตัวอย่างสไตล์ แล้ววาง prompt ของแต่ละแผ่น

## ทำไมต้องมีแผ่นเหล่านี้

- **O:** ข้อสอบจริงถามวันสำคัญ (วันแม่ ลอยกระทง สงกรานต์ ปีใหม่) ตอนนี้ถามเป็นตัวหนังสือล้วน เด็กหลายคนจำได้จากภาพมากกว่าชื่อ
- **P:** "ลูกของสัตว์ชนิดนี้คืออะไร" "ภาพใดเป็นแม่ลูกกัน" เป็นโจทย์ที่เจอบ่อย ตอนนี้มีแต่ไก่กับลูกไก่
- **Q:** ความปลอดภัยบนถนนเป็นหัวข้อประจำของข้อสอบ ตอนนี้ถามเป็นตัวหนังสือล้วน ยังไม่มีภาพไฟจราจรและทางข้าม

## กติกาทุกแผ่น

- สไตล์เดียวกับแผ่นก่อนหน้า: ภาพหนังสือเด็ก สีพาสเทล ลายดินสอสี ไม่ใช่ 3D
- ไม่มีตัวหนังสือ ตัวเลข ป้าย ลูกศร โลโก้ในภาพ ถ้ามีติดมา ให้สั่ง Gemini ว่า "remove all text, numbers and logos" ก่อนเซฟ
- ไม่มีรูปเหมือนบุคคลจริง ไม่มีพระบรมฉายาลักษณ์หรือภาพบุคคลติดผนังในทุกภาพ (แผ่น O)
- ภาพไหนต้องแยกเป็นชิ้น (แผ่น P) ต้องมีที่ว่างสีขาวคั่นชัดเจน ไม่ให้ตัวสัตว์แตะกันหรือเงาติดกัน

## O — `sheet-pictures-o.jpg` (วันสำคัญของไทย 8 วัน)

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic.
Create ONE landscape sheet containing exactly 8 small scenes arranged in a neat 4 columns x 2 rows grid, in exactly this reading order (left to right, then top to bottom). Every scene is drawn inside its own rounded-rectangle panel with a thin soft grey-blue border line, all 8 panels exactly the same size, separated by clear white space. Background outside the panels is pure flat white. No labels, no numbers, no letters, no text, no signs with writing, no logos, no portraits or framed pictures of any real person on any wall. Each scene shows ONE Thai festival or special day with a few clear clues so a six-year-old can tell which day it is. Smiling Thai people, families and children.
Row 1:
1) Songkran (Thai New Year water festival), a sunny hot day: three smiling children and a grandmother in colourful flowered shirts gently pour water from small silver bowls and splash each other with water guns, drops of water in the air
2) Loy Krathong, at night: a river with a bright full moon; a child and a mother kneel at the water's edge and gently float a krathong (a round floating basket made of banana leaf with flowers, one candle and incense sticks); other small krathongs with tiny flames float on the water
3) Mother's Day: a small girl offers a garland of white jasmine flowers to her smiling mother, who bends down to receive it; a bunch of white jasmine flowers is on the table beside them
4) Children's Day: a bright sunny fairground with a big colourful balloon arch; a group of smiling children hold balloons and toys and a toy drum, a prize gift box is on a table
Row 2:
5) New Year's Eve: a night sky filled with colourful fireworks over a city; a family of four stands together on a balcony, looking up, smiling, wearing warm clothes, a small wrapped gift box in the mother's hands
6) Teachers' Day (Wai Khru): a classroom; three students in school uniform kneel and bow politely holding a tray of flowers, a candle and incense (phan wai khru), in front of a smiling woman teacher
7) Buddhist Lent (Khao Phansa): a temple courtyard with a golden temple roof; a family respectfully offers a very large tall decorated wax candle to a smiling monk in orange robes
8) Father's Day: a small boy gives a bunch of orange-yellow canna lily flowers to his smiling father, who kneels and hugs him; more canna flowers grow in a garden behind them
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-day-songkran pic-day-loy pic-day-mother pic-day-children pic-day-newyear pic-day-teacher pic-day-lent pic-day-father`

## P — `sheet-pictures-p.jpg` (สัตว์โตเต็มวัยกับลูกสัตว์ 6 คู่)

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic.
Create ONE landscape sheet containing exactly 12 separate animals arranged in a neat 4 columns x 3 rows grid on a pure flat white background, in exactly this reading order (left to right, then top to bottom). Every animal is drawn on its own, standing on nothing: no ground, no grass, no shadow, no frame, no border, no other objects, no text, no numbers. Leave a wide empty white gap between neighbouring animals so that no two animals touch each other. Every animal is shown in a clear side view, full body from nose to tail and from ears to feet, looking friendly, with a simple cute face. The six adults are about the same size on the sheet; each baby is clearly smaller than its adult (about half the size), has the same colours and markings as its parent, looks young and cute (bigger head and eyes), and stands right next to its parent's position in the grid.
Row 1: 1) a brown-and-white cow, 2) a calf (baby cow) with the same brown-and-white colours, 3) a golden-brown dog, 4) a puppy (baby dog) with the same golden-brown colour
Row 2: 5) a grey striped cat, 6) a kitten (baby cat) with the same grey stripes, 7) a white duck with an orange beak, 8) a fluffy yellow duckling (baby duck)
Row 3: 9) a pink pig, 10) a piglet (baby pig) in the same pink, 11) a white fluffy sheep, 12) a lamb (baby sheep) also white and fluffy but smaller
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-animal-cow pic-animal-calf pic-animal-dog pic-animal-puppy pic-animal-cat pic-animal-kitten pic-animal-duck pic-animal-duckling pic-animal-pig pic-animal-piglet pic-animal-sheep pic-animal-lamb`

## Q — `sheet-pictures-q.jpg` (ความปลอดภัยบนถนน 8 ภาพ)

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic.
Create ONE landscape sheet containing exactly 8 small scenes arranged in a neat 4 columns x 2 rows grid, in exactly this reading order (left to right, then top to bottom). Every scene is drawn inside its own rounded-rectangle panel with a thin soft grey-blue border line, all 8 panels exactly the same size, separated by clear white space. Background outside the panels is pure flat white. No labels, no numbers, no letters, no text, no road signs with writing, no logos, no number plates with writing, nothing frightening, no accident and no injured person. Smiling Thai children and adults.
Row 1 (the first three scenes use the same street corner and the same camera angle; a tall traffic light pole for cars stands in the middle with three round lamps one above the other, red on top, yellow in the middle, green at the bottom; only ONE lamp is lit in each scene and the other two are dark grey):
1) the RED lamp is lit; a car waits stopped at a white line, and two children with an adult stand safely on the pavement
2) the YELLOW lamp is lit; a car is slowing down near the white line
3) the GREEN lamp is lit; a car is driving forward along the road
4) a zebra crossing (white stripes on the road): a smiling girl holds her mother's hand and walks across it, a car waits patiently before the stripes
Row 2:
5) a pedestrian overpass (a covered walking bridge with stairs) over a busy road; a father and a child climb the stairs while cars drive on the road below
6) a father drives a motorbike with a small child sitting in front of him; both of them wear safety helmets with chin straps, smiling
7) a child sits buckled in the back seat of a car wearing a seat belt, smiling, the mother drives in the front seat
8) a boy is about to run off the pavement into the road to chase a rolling red ball, his mother reaches out her hand to stop him, a car is far away down the road (a gentle warning scene, nobody is hurt)
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-road-red pic-road-yellow pic-road-green pic-road-zebra pic-road-bridge pic-road-helmet pic-road-belt pic-road-ball`

## ใช้ในโจทย์ชุดที่ 32–34 (ร่าง)

- **ชุด 32 (วันสำคัญ):** วันนี้คือวันอะไร (ตอบเป็นชื่อหรือเป็นภาพ), เดือนไหนมีวันนี้, ของที่ใช้ในวันนั้น (กระทง ดอกมะลิ ดอกไม้ไหว้ครู เทียนพรรษา), ทำอะไรในวันนั้น, วันไหนอยู่ก่อน/หลังกัน, นับเด็กและของในภาพ
- **ชุด 33 (ลูกสัตว์):** ลูกของสัตว์นี้คือภาพใด, ภาพใดเป็นแม่ลูกกัน, ลูกสัตว์เรียกว่าอะไร (ลูกวัว ลูกสุนัข ลูกเป็ด), สัตว์ที่ให้นม/ออกไข่, อาหารของสัตว์, นับคู่ ขา และหู, เสียงร้องของสัตว์
- **ชุด 34 (ถนน):** ไฟสีไหนต้องหยุด/เตรียมตัว/ไป (ตอบเป็นภาพ), ข้ามถนนตรงไหน, ภาพไหนปลอดภัย/ไม่ปลอดภัย, ใส่หมวกกันน็อก/คาดเข็มขัดเพื่ออะไร, เรียงลำดับไฟจราจร, ซ้าย-ขวาของรถในภาพ
