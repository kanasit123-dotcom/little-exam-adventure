"""วาด icon ของเกม (กระดาษข้อสอบ 1 2 3 + ดาว บนพื้นฟ้า) ด้วยโค้ด — ไม่ต้องใช้รูปจากที่อื่น
ใช้: python design/make_icon.py  -> public/icons/icon-{32,180,192,512}.png, icon-maskable-512.png
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / 'public' / 'icons'
S = 1024
INK = (74, 59, 82)
PURPLE = (126, 87, 224)
YELLOW = (255, 201, 77)


def gradient(size, top, bottom):
    img = Image.new('RGB', (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        d.line([(0, y), (size, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bottom)))
    return img


def star(d, cx, cy, r, fill, outline=None, width=0):
    import math
    pts = []
    for i in range(10):
        rad = r if i % 2 == 0 else r * 0.45
        ang = -math.pi / 2 + i * math.pi / 5
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    d.polygon(pts, fill=fill, outline=outline, width=width)


def draw(scale_content=1.0):
    img = gradient(S, (110, 198, 255), (126, 217, 176)).convert('RGBA')
    layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    c = S / 2
    k = scale_content
    w, h = 560 * k, 660 * k
    x0, y0 = c - w / 2, c - h / 2 + 30 * k
    # เงากระดาษ
    shadow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([x0 + 18 * k, y0 + 24 * k, x0 + w + 18 * k, y0 + h + 24 * k], radius=48 * k, fill=(40, 70, 90, 90))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(18 * k)))
    # กระดาษ
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], radius=48 * k, fill=(255, 254, 251), outline=INK, width=int(14 * k))
    # หัวกระดาษ
    d.rounded_rectangle([x0 + 70 * k, y0 + 70 * k, x0 + w - 70 * k, y0 + 120 * k], radius=25 * k, fill=INK)
    # ช่องคำตอบ 3 แถว: วงกลม + เส้น (แถวกลางถูกเลือก)
    for i in range(3):
        cy = y0 + (230 + i * 140) * k
        cx = x0 + 120 * k
        r = 42 * k
        chosen = i == 1
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=PURPLE if chosen else (255, 255, 255), outline=INK, width=int(12 * k))
        if chosen:
            d.line([(cx - 20 * k, cy + 2 * k), (cx - 4 * k, cy + 20 * k), (cx + 24 * k, cy - 18 * k)], fill=(255, 255, 255), width=int(14 * k), joint='curve')
        d.rounded_rectangle([cx + 80 * k, cy - 14 * k, x0 + w - 80 * k, cy + 14 * k], radius=14 * k, fill=(214, 204, 224) if not chosen else (190, 170, 236))
    img.alpha_composite(layer)
    # ดาวรางวัลมุมขวาบน
    top = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    star(ImageDraw.Draw(top), x0 + w - 20 * k, y0 + 10 * k, 150 * k, fill=YELLOW, outline=INK, width=int(12 * k))
    img.alpha_composite(top)
    return img


def save(img, size, name):
    img.resize((size, size), Image.LANCZOS).convert('RGB').save(OUT / name, optimize=True)
    print(name, (OUT / name).stat().st_size // 1024, 'KB')


OUT.mkdir(parents=True, exist_ok=True)
full = draw(1.0)
for size in (32, 180, 192, 512):
    save(full, size, f'icon-{size}.png')
# maskable: เนื้อหาต้องอยู่ในวงกลมกลาง 80% (Android อาจตัดขอบเป็นวงกลม)
save(draw(0.78), 512, 'icon-maskable-512.png')
