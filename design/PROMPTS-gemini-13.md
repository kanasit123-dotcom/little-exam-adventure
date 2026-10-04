# Prompt ชุดที่ 13 — รูปลูกของเพื่อน 11 ตัว (ใช้กับระบบ "เพื่อนมีลูก" ในหน้ารางวัลและสมุดสติกเกอร์)

> **สถานะ: ยังไม่ได้สร้างรูป — เกมใช้ได้แล้วโดยยังไม่มีรูปนี้ (ลูกคือรูปแม่ย่อเล็กพร้อมหัวใจ 💗 ไข่วาดด้วยโค้ด) พอได้รูปแล้วบอกผม ผมตัดและใส่ให้ แทนที่รูปแม่ย่อเล็กอัตโนมัติ**

| ไฟล์ที่ต้องเซฟ | มีอะไร | ใช้ทำ |
|---|---|---|
| `sheet-babies.jpg` | ลูกของเพื่อน 11 ตัว วางเป็นตาราง 4 คอลัมน์ x 3 แถว (ช่องสุดท้ายว่าง) พื้นขาว | ระบบเพื่อนมีลูก |

ถ้าเลือกความละเอียดได้ ขอ **2K**
**เซฟไว้ที่:** `C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming\`

**วิธีทำ:** แนบ `design\friends-reference.png` (รูปเพื่อนทั้ง 11 ตัวที่มีอยู่ในเกม) เป็นตัวอย่างสไตล์และหน้าตาของตัวแม่ แล้วส่งข้อความด้านล่าง

## ทำไมต้องมีแผ่นนี้

- เพื่อนที่โตเป็น "ขนาดใหญ่มาก" แล้ว เลือกซ้ำจะมีไข่ ฟักเป็นลูก แล้วลูกโตขึ้น ทำได้ 2 รอบต่อเพื่อน 1 ตัว (รวม 110 ครั้งสำหรับ 11 ตัว)
- ตอนนี้ลูกคือรูปแม่ย่อเล็ก ซึ่งดูเหมือนแม่ตัวเล็กมากกว่าลูกจริงๆ รูปลูกที่วาดใหม่จะทำให้เห็นว่าเป็นลูกและน่ารักขึ้น
- ไข่ไม่ต้องสร้างรูป เกมวาดเองด้วยโค้ด

## กติกา

- สไตล์เดียวกับรูปเพื่อนในแนบ: ภาพหนังสือเด็ก สีพาสเทล ลายดินสอสี ขอบเส้นชัด ไม่ใช่ 3D ไม่เหมือนภาพถ่าย
- ลูกต้องดูออกว่าเป็นลูกของเพื่อนตัวนั้น: สีและลายเดียวกับแม่ ตัวกลมป้อม หัวโตเทียบกับตัว ตาโตวาว ไม่ใส่เสื้อผ้าหรือของถือแบบแม่ (ไม่มีกระเป๋า หมวก โบว์ สมุด ลูกกลมๆ ของแม่)
- ยืนหรือนั่งหันหน้าตรง ท่าสบายๆ ทั้งตัวอยู่ในภาพ ไม่ถูกตัด
- วางห่างกันมาก มีพื้นขาวคั่นชัดเจน ไม่ให้ตัวไหนแตะกัน ไม่มีเงาพื้น ไม่มีกรอบ
- ไม่มีตัวหนังสือ ตัวเลข ป้าย โลโก้ในภาพ ถ้ามีติดมา ให้สั่ง Gemini ว่า "remove all text, numbers and logos" ก่อนเซฟ

## B — `sheet-babies.jpg`

```text
Use the attached sheet only as a reference for the drawing style and for what each parent animal looks like: the same polished children's picture-book illustration, soft pastel colours, gentle colored-pencil shading, clean outlines, not 3D, not photorealistic.
Create ONE landscape sheet on a plain pure white background containing exactly 11 BABY animals, arranged in a neat grid of 4 columns x 3 rows, in exactly this reading order (left to right, then top to bottom). The last cell of row 3 (the 12th cell) stays empty. Leave a very wide white gap between every baby so that no two babies touch or overlap. No frames, no panels, no ground shadows, no scenery, no text.
Each baby is the cute CHILD of the matching parent animal in the attached sheet: same fur / skin colours and markings as the parent, but a small round chubby body, an oversized head, big shiny eyes and tiny limbs, looking very young and sweet. Facing the viewer, a relaxed happy pose, the whole body fully inside the picture. Babies wear NO clothes or accessories (no hat, no bow, no scarf, no bag, no book) and hold nothing.
Row 1:
1) baby cat (kitten): small orange-and-cream striped kitten with tiny pink nose, soft round ears, short stubby tail
2) baby rabbit (bunny): tiny white bunny with short pink-inner ears that stand up a little, a small round cotton tail, soft pink cheeks
3) baby seal (seal pup): a fluffy white seal pup lying on its belly with its head up, a few pale blue-grey spots, dark round eyes, little flippers
4) baby penguin (chick): a fluffy grey-and-white penguin chick with a rounded body, tiny orange feet and a small orange beak, soft down feathers
Row 2:
5) baby turtle (hatchling): a tiny light-green turtle hatchling with a small round green shell with simple hexagon pattern, big head, cheerful smile
6) baby unicorn (foal): a small white foal with a tiny golden horn, a soft pastel pink-and-lilac mane and tail, wobbly thin legs
7) baby butterfly: a small lilac caterpillar-like body with tiny pastel pink and mint wings that are still small, little antennae, big sparkly eyes (cute, not scary, no insect realism)
8) baby dolphin (calf): a small light-blue dolphin calf with a cream belly and a chubby round nose, small flippers, a happy open smile
Row 3:
9) baby fox (cub): a small orange fox cub with a white chest and a fluffy white-tipped tail, rounded ears with cream inside, tiny black paws
10) baby octopus: a small lilac octopus with a big round head and 8 short curly tentacles, big shiny eyes, pink cheeks
11) baby squirrel: a small brown squirrel kit with a cream tummy and a fluffy curled tail that is short and round, big eyes, tiny paws held up near the chest
12) (empty cell — leave blank white)
```

## หลังได้รูปแล้ว (ผมทำเอง)

1. `python design/blobs.py --grid 3x4 design/incoming/sheet-babies.jpg cat-baby rabbit-baby seal-baby penguin-baby turtle-baby unicorn-baby butterfly-baby dolphin-baby fox-baby octopus-baby squirrel-baby -` แล้ว `python design/cutout.py` (ตัดพื้นขาว)
2. วางเป็น `public/assets/friends/<id>-baby.png` (ขนาดเดียวกับรูปแม่ 800x800 ตัวอยู่ชิดล่างกึ่งกลาง)
3. ใส่รหัสเพื่อนใน `BABY_ART` ของ `src/core/assets.js` แล้วรัน `npm run assets`
