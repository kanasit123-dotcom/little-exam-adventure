# Prompt ชุดที่ 7 — รูปประกอบโจทย์แผ่น G (ใช้กับข้อสอบชุดที่ 14 ขึ้นไป แบบใหม่ 15 ข้อ)

> **สถานะ: รอรูป**

**รวม 1 รูป**: แผ่นรูปประกอบโจทย์ 4×4 (16 ชิ้น)
ถ้าเลือกความละเอียดได้ ขอ **2K**

| ไฟล์ที่ต้องเซฟ | มีอะไร |
|---|---|
| `sheet-pictures-g.jpg` | สถานที่เที่ยว 4 ภาพ, คนในครอบครัว 4 คน, ต้นไม้ 4 ชนิด, ของใช้ในครัว 4 ชิ้น |

**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`
(โฟลเดอร์นี้ไม่ขึ้น GitHub — ผมจะตัดรูปแล้วย้ายเข้าเกมเอง)

**วิธีทำ:** แนบรูป `design/incoming/sheet-pictures-f.jpg` (แผ่นล่าสุด) เป็นตัวอย่างสไตล์ แล้ววาง prompt ด้านล่าง

## ทำไมต้องมีแผ่นนี้

ข้อสอบจริงชอบให้ฟังเรื่องแล้วตอบเป็นรูป 4 ตัวเลือก เช่น "ไปเที่ยวที่ไหน" (ทะเล ภูเขา น้ำตก ทุ่งนา), "ไปกับใคร" (พ่อ แม่ ตา ยาย),
"ที่นั่นมีต้นอะไรมาก" (มะพร้าว กล้วย มะม่วง ไผ่) และแผ่นรูปของใช้ที่ถามว่า "ข้อใดเป็นของมีคม / ใช้คู่กัน" (มีด ครก หม้อ จาน)

## กติกาของแผ่นนี้

- สไตล์เดียวกับแผ่น A ถึง F: ภาพหนังสือเด็ก สีพาสเทล ลายดินสอสี ไม่ใช่ 3D
- **แถวบน (สถานที่ 4 ภาพ) เป็นภาพฉากในกรอบสี่เหลี่ยมมุมมน** ขนาดเท่ากันทุกช่อง ไม่มีคนในภาพ
- **คน 4 คน: คนไทย ครึ่งตัว หน้าตรง ขนาดเท่ากัน** ปู่ย่าตายายผมสีขาว ดูออกชัดว่าใครเป็นผู้ชาย ผู้หญิง คนแก่ หรือคนหนุ่มสาว
- ต้นไม้และของใช้อยู่บนพื้นขาว ไม่มีกรอบ ชิ้นห่างกันชัดเจน
- ไม่มีตัวหนังสือ ตัวเลข ป้าย หรือโลโก้
- ถ้าได้รูปที่มีตัวหนังสือ ขอให้ Gemini แก้ "remove all text, numbers and logos" ก่อนเซฟ

## G — `sheet-pictures-g.jpg`

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic. Draw everything plainly, so a young child recognises each one instantly in an exam picture.
Create ONE square sheet containing exactly 16 separate items arranged in a neat 4x4 grid, in exactly this reading order (left to right, then top to bottom). Every item is fully separated from the others by wide clear white space, none touching or overlapping, all the same size, each well inside its own invisible cell with a generous empty margin. Background pure flat white. No labels, no numbers, no letters, no text, no logos, no shadows on the ground.
Items 1 to 4 are small landscape SCENES, each drawn inside its own rounded-rectangle panel with a thin soft grey-blue border line, all panels exactly the same size, no people:
1) a Thai beach: blue sea with small waves, white sand, two coconut palms
2) green mountains with a winding path and a few trees
3) a waterfall falling over rocks into a small pool in a forest
4) a green rice field with a small wooden hut and a scarecrow
Items 5 to 8 are friendly Thai family members, each shown from the waist up, facing forward, all the same size, on plain white with no border:
5) a grandfather with short white hair and glasses, in a plain shirt
6) a grandmother with white hair in a bun, in a plain blouse
7) a father, a young adult man with short black hair, in a plain polo shirt
8) a mother, a young adult woman with shoulder-length black hair, in a plain blouse
Items 9 to 12 are single trees on plain white with no border, each standing on a small patch of grass:
9) a tall coconut palm with coconuts
10) a banana plant with wide leaves and a bunch of green bananas
11) a mango tree with a round leafy top and a few yellow mangoes
12) a clump of tall green bamboo stems
Items 13 to 16 are single kitchen objects on plain white with no border:
13) a kitchen knife with a wooden handle
14) a Thai clay mortar with a wooden pestle
15) a silver cooking pot with two handles and a lid
16) a plain white round dinner plate
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-beach pic-mountain pic-waterfall pic-ricefield pic-grandpa pic-grandma pic-father pic-mother pic-coconut-tree pic-banana-tree pic-mango-tree pic-bamboo pic-knife pic-mortar pic-pot pic-plate`

## ใช้ในโจทย์ชุดที่ 14 ขึ้นไป (ร่าง)

| รูป | โจทย์ |
|---|---|
| ทะเล ภูเขา น้ำตก ทุ่งนา | ฟังเรื่องไปเที่ยว แล้วตอบว่าไปที่ไหน (4 ตัวเลือกภาพ) / ที่ไหนมีคลื่น |
| ปู่ ย่า พ่อ แม่ | ไปกับใคร / คุณย่าคือแม่ของใคร (ตอบเป็นรูป) |
| มะพร้าว กล้วย มะม่วง ไผ่ | ที่ชายทะเลมีต้นอะไรมาก / ต้นใดมีลำต้นเป็นปล้อง |
| มีด ครก หม้อ จาน | แผ่นรูปของใช้: ของมีคม ใช้คู่กัน (ครก-สาก) ของใช้ในครัว |
