# Prompt ชุดที่ 11 — รูปประกอบโจทย์แผ่น L, M, N: รูปคนทั้งตัว เรียงลำดับเหตุการณ์เพิ่ม สถานที่ในชุมชนเพิ่ม (ใช้กับข้อสอบชุดที่ 29 ขึ้นไป)

> **สถานะ: รอผู้ปกครองสร้างรูป (เขียน prompt 2026-10-03)** — ทำแผ่นไหนก่อนก็ได้ ไม่ต้องทำพร้อมกัน

| ไฟล์ที่ต้องเซฟ | มีอะไร | ใช้ทำชุด |
|---|---|---|
| `sheet-pictures-l.jpg` | เด็กหญิงและเด็กชายยืนทั้งตัวด้านหน้า (ผมจะวางเลขชี้ส่วนของร่างกายเองด้วยโค้ด) | ชุดที่ 29 |
| `sheet-pictures-m.jpg` | เรียงลำดับเหตุการณ์ 4 เรื่องใหม่ เรื่องละ 4 ภาพ (แต่งตัว ให้อาหารปลา ต้นไม้โต ทอดไข่ดาว) | ชุดที่ 30 |
| `sheet-pictures-n.jpg` | สถานที่ในชุมชน 12 แห่ง (โรงพยาบาล สถานีตำรวจ ฯลฯ) | ชุดที่ 31 |

ถ้าเลือกความละเอียดได้ ขอ **2K**
**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`

**วิธีทำ:** แผ่น L แนบ `sheet-pictures-k.jpg` เป็นตัวอย่างสไตล์ (ผิวและเส้น) / แผ่น M และ N แนบ `sheet-pictures-i.jpg` (ภาพในกรอบมุมมน) เป็นตัวอย่างสไตล์ แล้ววาง prompt ของแต่ละแผ่น

## ทำไมต้องมีแผ่นเหล่านี้

- **L:** ข้อสอบจริงมีโจทย์ "ดูรูปเด็ก ตัวเลขชี้ส่วนของร่างกายส่วนใด" เกมจะวางเลข 1 2 3 ... บนรูปเอง จึงต้องการรูปคนทั้งตัวที่เห็นส่วนต่างๆ ชัด
- **M:** เรียงลำดับเหตุการณ์เป็นโจทย์ที่เจอบ่อย ตอนนี้มี 8 เรื่องแล้ว (แผ่น H, I)
- **N:** โจทย์ "สถานที่ในชุมชนทำอะไร ใครทำงานที่ไหน" ตอนนี้มีโรงเรียน วัด ตลาด สนามเด็กเล่น เท่านั้น

## กติกาทุกแผ่น

- สไตล์เดียวกับแผ่นก่อนหน้า: ภาพหนังสือเด็ก สีพาสเทล ลายดินสอสี ไม่ใช่ 3D
- ไม่มีตัวหนังสือ ตัวเลข ป้าย ลูกศร โลโก้ในภาพ (สัญลักษณ์กากบาทของโรงพยาบาล/ร้านขายยาเป็นรูปได้ ไม่ใช่ตัวอักษร) ถ้ามีติดมา ให้สั่ง Gemini ว่า "remove all text, numbers and logos" ก่อนเซฟ
- ภาพติดกันในเรื่องเดียวกัน (แผ่น M) ต้องต่างกันให้เห็นชัด

## L — `sheet-pictures-l.jpg` (รูปคนทั้งตัว)

```text
Use the attached sheet only as a reference for the drawing style (skin tone, clean outline, soft colored-pencil shading): the same polished children's picture-book illustration, soft pastel colours, not 3D, not photorealistic.
Create ONE landscape sheet with exactly TWO full-body standing children side by side on a pure flat white background, no frame, no border, no ground shadow, no text, no numbers, no arrows, no labels: on the left a Thai girl about six years old (black hair in two pigtails), on the right a Thai boy about six years old (short black hair).
Both children stand facing the viewer straight on (front view), full body from the top of the head to the bare feet, perfectly upright and symmetrical, both arms held slightly away from the body with open hands and visible fingers, legs slightly apart, bare feet with visible toes. They wear very simple clothes that leave the shoulders, upper arms, elbows, knees, lower legs and feet clearly visible: a light-pink short-sleeved T-shirt and light-blue knee-length shorts. Smiling friendly faces with clearly visible eyes, nose, mouth and ears. Each child is large, fills most of the height of the sheet, and the two children do not overlap or touch.
```

ชื่อชิ้นตอนตัด: `pic-child-girl pic-child-boy`

## M — `sheet-pictures-m.jpg` (เรียงลำดับเหตุการณ์ 4 เรื่อง)

```text
Use the attached sheet only as a reference for the drawing style and for the little girl: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic.
Create ONE square sheet containing exactly 16 small scenes arranged in a neat 4x4 grid, in exactly this reading order (left to right, then top to bottom). Every scene is drawn inside its own rounded-rectangle panel with a thin soft grey-blue border line, all 16 panels exactly the same size, separated by clear white space. Background outside the panels is pure flat white. No labels, no numbers, no letters, no text, no logos, no arrows.
The same little Thai girl appears in all scenes: about six years old, black hair in two pigtails (in the dressing row she wears a light-blue T-shirt and brown shorts at the end). Keep her face and size identical in every panel. Each ROW of four panels is one short story; the four panels of a row use the SAME room or background and the SAME camera angle, and only the action changes. Neighbouring panels in a row must look clearly different from each other.
Row 1 (getting dressed, in a bedroom with a bed):
1) the girl stands in white undershirt and shorts next to her bed; a light-blue T-shirt and brown shorts lie folded on the bed
2) the girl pulls the light-blue T-shirt over her head (her head and arms are going through the shirt)
3) the girl is wearing the light-blue T-shirt and is stepping into the brown shorts
4) the girl stands smiling, fully dressed in the light-blue T-shirt and brown shorts
Row 2 (feeding pet fish, on a small table with a round fish bowl with two orange goldfish):
5) a small box of fish food stands closed next to the empty-looking fish bowl; the girl stands looking at it
6) the girl holds the opened food box in her hand above the fish bowl
7) the girl sprinkles tiny flakes of food onto the water; the flakes float on the surface
8) the two goldfish swim up to the surface and eat the flakes while the girl watches happily
Row 3 (a tree growing, in a garden, same spot and same camera angle every time, the girl stands beside it):
9) the girl plants a small seed in a little hole in the soil with a shovel; there is no plant yet
10) a tiny green sprout with two leaves has grown from the soil; the girl waters it with a small watering can
11) a young tree about as tall as the girl stands in the same spot; the girl smiles next to it
12) a big tall tree much taller than the girl, with red fruits hanging on it; the girl picks a fruit and smiles
Row 4 (frying an egg with her mother, in a kitchen at a stove):
13) an egg in a bowl and an empty frying pan on the stove; a smiling mother and the girl stand beside the stove
14) the mother cracks the egg over the frying pan while the girl watches
15) the egg is frying in the pan with a white and a yellow yolk, a little steam rises
16) a fried egg lies on a plate of rice on the table and the girl eats it happily with a spoon
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-seq-dress-1 pic-seq-dress-2 pic-seq-dress-3 pic-seq-dress-4 pic-seq-fish-1 pic-seq-fish-2 pic-seq-fish-3 pic-seq-fish-4 pic-seq-tree-1 pic-seq-tree-2 pic-seq-tree-3 pic-seq-tree-4 pic-seq-egg-1 pic-seq-egg-2 pic-seq-egg-3 pic-seq-egg-4`

## N — `sheet-pictures-n.jpg` (สถานที่ในชุมชน 12 แห่ง)

```text
Use the attached sheet only as a reference for the drawing style: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic.
Create ONE sheet containing exactly 12 small scenes arranged in a neat 4 columns x 3 rows grid, in exactly this reading order (left to right, then top to bottom). Every scene is drawn inside its own rounded-rectangle panel with a thin soft grey-blue border line, all 12 panels exactly the same size, separated by clear white space. Background outside the panels is pure flat white. No labels, no numbers, no letters, no text, no signs with writing, no logos. Each scene shows ONE building or place from the outside in a sunny street, with a few small clues so a six-year-old can tell what it is, and a few smiling people.
Row 1:
1) a hospital: a white building with a big red cross symbol on the front and an ambulance parked in front, a nurse and a doctor at the door
2) a police station: a building with a blue roof and a police car parked in front, a smiling police officer standing at the door
3) a fire station: a building with a large open garage door and a red fire truck inside, a firefighter in a helmet standing beside it
4) a post office: a small building with a red mailbox in front, a postman with a bag of letters on a bicycle
Row 2:
5) a library: a building with large windows showing shelves full of books, children carrying books at the entrance
6) a supermarket: a wide shop with a glass front, shopping carts in front and a lady pushing a cart with vegetables
7) a bus station: a covered bus stop with a bench and a bus arriving, passengers waiting
8) a bank: a solid building with columns and a big coin symbol (a circle with no letters) above the door, a security guard at the door
Row 3:
9) a bakery: a small shop with a striped awning, a window full of bread and cakes, a baker in a white hat holding a tray of bread
10) a petrol station: a gas pump with a hose and a car being filled, an attendant in uniform
11) a park: green trees, a pond, a bench, and children flying a kite
12) a pharmacy: a small shop with a green cross symbol (no letters) on the front, a pharmacist in a white coat handing medicine to a customer
```

ชื่อชิ้นตอนตัด (ตามลำดับ):
`pic-place-hospital pic-place-police pic-place-fire pic-place-post pic-place-library pic-place-supermarket pic-place-bus pic-place-bank pic-place-bakery pic-place-gas pic-place-park pic-place-pharmacy`

## ใช้ในโจทย์ชุดที่ 29–31 (ร่าง)

| รูป | โจทย์ |
|---|---|
| L เด็กทั้งตัว + เลขชี้ | เลขตัวใดชี้ที่ศอก/เข่า/ไหล่/ข้อมือ / ส่วนใดอยู่เหนือสุด / ส่วนที่เป็นคู่ในรูป |
| M แต่งตัว ให้อาหารปลา ต้นไม้โต ทอดไข่ | เรียงลำดับ / ภาพแรก-สุดท้าย / ภาพที่เท่าไร / ภาพตรงกับประโยค / ต้นไม้โตขึ้นตามเวลา |
| N สถานที่ 12 แห่ง (แผ่นภาพ `board`) | ถ้าป่วยไปที่ไหน / ถ้าเกิดไฟไหม้แจ้งที่ไหน / ส่งจดหมายที่ไหน / ยืมหนังสือที่ไหน / ซื้อขนมปังที่ไหน |
