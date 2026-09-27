# Prompt ชุดที่ 5 — รูปประกอบโจทย์แผ่น E (ใช้กับข้อสอบชุดที่ 10 ขึ้นไป)

> **สถานะ: ทำแล้ว (2026-09-27)** — ตัดเป็น `public/assets/pictures/` 16 ชิ้น ใช้ในชุดที่ 10

**รวม 1 รูป**: แผ่นรูปประกอบโจทย์ 4×4 (16 ชิ้น)
ถ้าเลือกความละเอียดได้ ขอ **2K**

| ไฟล์ที่ต้องเซฟ | มีอะไร |
|---|---|
| `sheet-pictures-e.jpg` | สถานที่ในชุมชน 4 ภาพ, เครื่องใช้ไฟฟ้า 4 ชิ้น, ของใช้ทำความสะอาด 4 ชิ้น, เครื่องเขียน 4 ชิ้น |

**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`
(โฟลเดอร์นี้ไม่ขึ้น GitHub — ผมจะตัดรูปแล้วย้ายเข้าเกมเอง)

**วิธีทำ:** แนบรูป `design/incoming/sheet-pictures-d.jpg` (แผ่นล่าสุด) เป็นตัวอย่างสไตล์ แล้ววาง prompt ด้านล่าง

## กติกาของแผ่นนี้

- สไตล์เดียวกับแผ่น A ถึง D: ภาพหนังสือเด็ก สีพาสเทล ลายดินสอสี ไม่ใช่ 3D
- **แถวบน (สถานที่ 4 ภาพ) เป็นภาพฉากในกรอบสี่เหลี่ยมมุมมน** กรอบเส้นบางสีอ่อน ขนาดเท่ากันทุกช่อง (ผมต้องใช้กรอบนี้ตัดรูป เหมือนภาพฤดูในแผ่น C)
- ชิ้นอื่นอยู่บนพื้นขาว ไม่มีกรอบ ชิ้นห่างกันชัดเจน ไม่ทับกัน
- **ไม่มีตัวหนังสือ ตัวเลข ป้าย หรือโลโก้** (ไม้บรรทัดมีขีดได้แต่ไม่มีตัวเลข ป้ายโรงเรียนไม่มีชื่อ)
- ถ้าได้รูปที่มีตัวหนังสือ ขอให้ Gemini แก้ "remove all text, numbers and logos" ก่อนเซฟ

## E — `sheet-pictures-e.jpg`

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic. Draw every object plainly, so a young child recognises each one instantly in an exam picture.
Create ONE square sheet containing exactly 16 separate items arranged in a neat 4x4 grid, in exactly this reading order (left to right, then top to bottom). Every item is fully separated from the others by wide clear white space, none touching or overlapping, all the same size, each well inside its own invisible cell with a generous empty margin. Background pure flat white. No labels, no numbers, no letters, no text, no logos, no signs with writing, no shadows on the ground.
Items 1 to 4 are small SCENES of places in a Thai town, each drawn inside its own rounded-rectangle panel with a thin soft grey-blue border line, all panels exactly the same size, no people:
1) a school: a two-storey cream school building with many windows, a flagpole with the Thai flag in front, a small green field
2) a Buddhist temple: a Thai temple hall with a tall layered orange-and-green roof with golden curved roof ends, white walls, steps at the front
3) a fresh market: a few open market stalls under striped awnings, with piles of fruit and vegetables in baskets
4) a playground: a slide, a swing and a small sandbox on green grass with a tree
Items 5 to 16 are single objects on plain white with no border:
5) a white electric stand fan
6) a tall refrigerator with two doors, closed
7) a television on a small stand, the screen plain dark grey and switched off
8) an electric rice cooker with its lid closed
9) a long-handled straw broom (Thai style)
10) a plastic dustpan
11) a bar of pink soap with a few bubbles
12) a folded blue bath towel
13) a yellow pencil, sharpened
14) a pink eraser
15) a wooden ruler with tick marks only, no numbers
16) a pair of children's scissors with round tips and red handles
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-school pic-temple pic-market pic-playground pic-fan pic-fridge pic-tv pic-ricecooker pic-broom pic-dustpan pic-soap pic-towel pic-pencil pic-eraser pic-ruler pic-scissors`

## ใช้ในโจทย์ชุดที่ 10 ขึ้นไป (ร่าง)

| รูป | โจทย์ |
|---|---|
| โรงเรียน วัด ตลาด สนามเด็กเล่น | ถ้าอยากซื้อผัก/ไปทำบุญ/ไปเรียนหนังสือ ควรไปที่ใด / ฟังเรื่องแล้วตอบว่าไปที่ไหนก่อนหลัง |
| พัดลม ตู้เย็น โทรทัศน์ หม้อหุงข้าว | สิ่งใดใช้ไฟฟ้า / สิ่งใดทำให้อาหารเย็น / ประหยัดไฟ (ปิดเมื่อไม่ใช้) |
| ไม้กวาด ที่ตักผง สบู่ ผ้าเช็ดตัว | สิ่งใดใช้คู่กัน / ของใช้ในห้องน้ำ / ช่วยทำงานบ้าน |
| ดินสอ ยางลบ ไม้บรรทัด กรรไกร | เขียนผิดใช้อะไรลบ / วัดความยาวด้วยอะไร / ใช้กรรไกรอย่างปลอดภัย / เรียงสั้นยาว |
| ร่วมกับรูปเดิม | ภาพใดไม่เข้าพวก (เครื่องใช้ไฟฟ้า vs ไม้กวาด) / ตารางภาพ 3x3 ชุดใหม่ |
