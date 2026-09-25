# Prompt ชุดที่ 1 — รูปประกอบโจทย์ + ฉากห้องเรียน

> **สถานะ: ทำแล้ว (2026-09-26)** — ตัดเป็น `public/assets/pictures/` 16 ชิ้น และ `public/assets/backgrounds/classroom.jpg` ใช้ในชุดที่ 1 (ส้ม ไข่ ร่ม ช้อน เก้าอี้ ปลา กบ ปู บ้าน) ชิ้นที่เหลือเผื่อชุดต่อไป

**รวม 2 รูป**: แผ่นรูปประกอบโจทย์ 4×4 (16 ชิ้น) · ฉากห้องเรียน 1 รูป
ถ้าเลือกความละเอียดได้ ขอ **2K**

| ไฟล์ที่ต้องเซฟ | มีอะไร |
|---|---|
| `sheet-pictures-a.jpg` | สัตว์และสิ่งของ 16 ชิ้น สำหรับโจทย์ภาษาไทย (เสียงต้นคำ) วิทยาศาสตร์ และความรู้รอบตัว |
| `classroom.jpg` | ฉากห้องเรียนสงบๆ อยู่รอบกระดาษข้อสอบ (แนวนอน 3:2) |

**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`
(โฟลเดอร์นี้ไม่ขึ้น GitHub — ผมจะตัดรูปแล้วย้ายเข้าเกมเอง)

วิธีทำ: แนบรูปเพื่อน 3 ตัวจาก `public/assets/friends/` (cat, seal, rabbit) เป็นตัวอย่างสไตล์ → วาง prompt ของแต่ละรูป

## กติกาของชุดนี้

- รูปประกอบโจทย์ต้อง**ดูเป็นของจริงที่เด็กจำได้ทันที** แบบภาพในหนังสือเด็ก: สัตว์เป็นสัตว์ธรรมชาติ **ไม่ใส่เสื้อผ้า ไม่ยิ้มแบบการ์ตูน** สิ่งของไม่มีหน้า ไม่มีตา
- ไม่มีตัวหนังสือ ตัวเลข หรือป้ายในรูป
- ไม่มีหมี หมู ฮิปโป หมา โคอาลา ตุ๊กตาหมี
- ทุกชิ้นขนาดใกล้กัน อยู่กลางช่อง **เว้นที่ว่างรอบๆ เยอะ** (ครั้งก่อนๆ บางชิ้นวาดเกินช่อง)

## A — `sheet-pictures-a.jpg`

```text
Use the attached three characters only as a reference for the drawing style: polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic. But draw every animal as a NATURAL real animal (no clothes, no accessories, no cartoon smile, no human pose) and every object plainly, so a young child recognises each one instantly in an exam picture.
Create ONE square sheet containing exactly 16 separate items arranged in a neat 4x4 grid, in exactly this reading order (left to right, then top to bottom). Every item is fully separated from the others by wide clear white space, none touching or overlapping, all drawn at a similar size, each drawn well inside its own invisible cell with a generous empty margin. Background pure flat white. No labels, no numbers, no letters, no text, no grid lines, no boxes, no shadows on the ground.
1) a fish, side view
2) a crab, top-down three-quarter view
3) a hen (chicken), side view, standing
4) a horse, side view, standing
5) a cat, sitting, side view
6) an owl perched on a short branch, front view
7) a butterfly with open wings, top view
8) a green frog, sitting
9) an elephant, side view
10) an open umbrella
11) an orange (the fruit) with one leaf
12) a spoon
13) a simple wooden chair
14) a whole egg
15) a child's bicycle, side view
16) a small house with a roof and a door
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-fish pic-crab pic-chicken pic-horse pic-cat pic-owl pic-butterfly pic-frog pic-elephant pic-umbrella pic-orange pic-spoon pic-chair pic-egg pic-bicycle pic-house`

## B — `classroom.jpg` (ไม่ต้องใช้พื้นขาว)

```text
Use the attached characters only as a style reference: polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, not 3D, not photorealistic.
Draw a landscape 3:2 background of a calm, tidy, sunny kindergarten classroom. Keep the whole CENTRE of the picture very plain and quiet (a soft cream wall with nothing on it), because a white question paper will be placed on top of the centre. Put the few details only near the edges: a window with soft daylight and a plant on the left, a low bookshelf with a few closed books and a small potted plant on the right, a light wooden floor at the bottom. Muted, calm colours, low contrast, nothing busy or flashing. No people, no animals, no characters, no text, no letters, no numbers, no alphabet posters, no charts, no clock face numbers, no logo.
```
