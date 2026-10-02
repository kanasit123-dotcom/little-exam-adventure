# Prompt ชุดที่ 10 — รูปประกอบโจทย์แผ่น K: ส่วนของร่างกาย (ใช้กับข้อสอบชุดที่ 25 ขึ้นไป)

> **สถานะ: ทำแล้ว (2026-10-02)** — ตัดด้วย `blobs.py --grow 8` + `cutout.py` เป็น `public/assets/pictures/body-*.png` 12 ชิ้น ใช้ในชุดที่ 25

**รวม 1 รูป**
ถ้าเลือกความละเอียดได้ ขอ **2K**

| ไฟล์ที่ต้องเซฟ | มีอะไร |
|---|---|
| `sheet-pictures-k.jpg` | ส่วนของร่างกาย 12 ภาพ (ตา หู จมูก ปาก มือ เท้า ฟัน ผม เข่า ศอก ลิ้น และมือข้างเดียวเห็นนิ้ว 5 นิ้ว) |

**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`
(โฟลเดอร์นี้ไม่ขึ้น GitHub — ผมจะตัดรูปแล้วย้ายเข้าเกมเอง)

**วิธีทำ:** แนบรูป `design/incoming/sheet-pictures-e.jpg` (แผ่นของใช้ที่เป็นภาพแยกชิ้นบนพื้นขาว) เป็นตัวอย่างสไตล์ แล้ววาง prompt ด้านล่าง

## ทำไมต้องมีแผ่นนี้

ข้อสอบจริง (ชุดที่เรียงลำดับที่ 21 ในไฟล์สแกน) มีโจทย์ "ดูรูปส่วนประกอบของร่างกายที่เป็นคู่ แล้วเขียนชื่อ" และเรื่องอวัยวะรับความรู้สึก ตอนนี้เกมมีโจทย์อวัยวะเป็นตัวหนังสืออย่างเดียว แผ่นนี้ให้ทำโจทย์แบบดูภาพ เช่น อวัยวะที่เป็นคู่ ใช้ดม/ดู/ฟัง/ชิม นับนิ้ว

## กติกาของแผ่นนี้

- สไตล์เดียวกับแผ่น A ถึง J: ภาพหนังสือเด็ก สีพาสเทล ลายดินสอสี ไม่ใช่ 3D
- **แต่ละภาพเป็นชิ้นเดียวลอยบนพื้นขาวล้วน ไม่มีกรอบ ไม่มีเงาพื้น** แยกห่างกันชัดเจน ไม่ซ้อนกัน (เหมือนแผ่น D, E)
- ขนาดของแต่ละชิ้นใกล้เคียงกัน ไม่ใช่ภาพทั้งตัวคน ให้วาดเฉพาะส่วนนั้นๆ ผิวสีแบบเด็กไทย (เบจอมชมพู)
- ไม่มีตัวหนังสือ ตัวเลข ป้าย ลูกศร (ถ้าได้รูปที่มีตัวหนังสือ ขอให้ Gemini แก้ "remove all text, numbers and arrows" ก่อนเซฟ)
- **ภาพที่เป็นคู่ให้วาดเป็นคู่จริง** (ตา 2 ข้าง หู 2 ข้าง มือ 2 ข้าง เท้า 2 ข้าง) ภาพที่ไม่เป็นคู่ให้วาดอย่างละหนึ่ง (จมูก ปาก ลิ้น)

## K — `sheet-pictures-k.jpg`

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic.
Create ONE square sheet containing exactly 12 separate body-part illustrations arranged in a neat 4 columns x 3 rows grid, in exactly this reading order (left to right, then top to bottom). Every illustration floats alone on a pure flat white background with generous white space around it, no frame, no border, no shadow, no overlap between items. All 12 items have a similar visual size. Skin colour is a light warm beige-pink typical of a young Thai child. No text, no numbers, no letters, no arrows, no labels.
Row 1:
1) a pair of open eyes side by side, with eyebrows (cut at the forehead and nose bridge, just the two eyes and brows)
2) a pair of ears seen from the side, drawn as two separate ears side by side
3) one nose seen from the front, with two nostrils
4) one smiling mouth with lips only (closed, small smile)
Row 2:
5) two hands side by side, both open with fingers together, palms facing the viewer
6) two bare feet side by side, seen from the front, with five toes each
7) a set of clean white teeth in a wide smile, upper and lower rows, with pink gums
8) a tongue sticking out of an open mouth (mouth and tongue only)
Row 3:
9) one open hand with the five fingers clearly spread apart so that exactly five fingers can be counted, palm facing the viewer
10) one bent knee: a leg bent at the knee, seen from the side, with the knee clearly visible
11) one bent elbow: an arm bent at the elbow, seen from the side, with the elbow clearly visible
12) a head of black hair seen from behind: just the hair of a child with two pigtails, no face
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-body-eyes pic-body-ears pic-body-nose pic-body-mouth pic-body-hands pic-body-feet pic-body-teeth pic-body-tongue pic-body-hand5 pic-body-knee pic-body-elbow pic-body-hair`

## ใช้ในโจทย์ชุดที่ 25 ขึ้นไป (ร่าง)

| รูป | โจทย์ |
|---|---|
| ทั้ง 12 ภาพ (แผ่นภาพ `board`) | อวัยวะที่เป็นคู่ / ใช้ดมกลิ่น ดู ฟัง ชิมรส / นับอวัยวะที่มีเป็นคู่ / ถ้ามี 2 มือ มีนิ้วกี่นิ้ว / อวัยวะที่ช่วยเคี้ยวอาหาร |
