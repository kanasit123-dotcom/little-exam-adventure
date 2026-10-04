"""สร้างไฟล์เสียงพูดภาษาไทยล่วงหน้า (Microsoft Neural: th-TH-PremwadeeNeural ผ่าน edge-tts)
แนวทางเดียวกับ happy-little-kitchen/design/voice.py (คัดลอกแล้วปรับ ไม่ได้ import ข้าม repo)

ใช้:  pip install edge-tts   แล้ว   npm run voice
      (= node scripts/voice-texts.mjs แล้ว python design/voice.py)
อ่านรายการประโยคจาก design/voice-texts.json อัด 2 ความเร็ว:
    public/voice/th/normal/<hash>.mp3   ปกติ
    public/voice/th/slow/<hash>.mp3     ช้าลง (ผู้ปกครองเลือกในหน้าผู้ปกครอง)
    public/voice/th/manifest.json       ข้อความ -> hash
อัดเฉพาะที่ยังไม่มีไฟล์ ไฟล์ที่ไม่ใช้แล้วจะถูกลบ ประโยคที่ TTS ไม่ยอมอ่านจะถูกข้าม (test ความครบของเสียงจะฟ้อง)
"""
import asyncio
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'voice' / 'th'
STATE = ROOT / 'design' / '.voice-state'
VOICE = 'th-TH-PremwadeeNeural'
PITCH = '+10Hz'
# ผู้ปกครองขอให้อ่านช้าลง (2026-09-26): ปกติ -10% -> -20%, ช้าลง -30% -> -35%
RATES = {'normal': '-20%', 'slow': '-35%'}
# ผู้ปกครองขอให้เว้นวรรคตอนนานขึ้น (2026-09-27): ช่องว่างระหว่างวลีเงียบแค่ ~0.05 วิ
# ใส่จุลภาคแทนช่องว่างตอนส่งให้ TTS -> เว้น ~0.3 วิ (ลองขึ้นบรรทัดใหม่แล้วเว้น ~1.4 วิ นานไป)
# เปลี่ยน STYLE -> อัดใหม่เฉพาะประโยคที่มีจุดเว้น และแอปโหลดไฟล์ใหม่แทนแคชเก่า
STYLE = 'pause-1'
MATH = {'บวก', 'ลบ', 'เท่ากับ'}


def spoken(text):
    """ข้อความที่ส่งให้ TTS: ตัดอีโมจิ/สัญลักษณ์ และเปลี่ยนเครื่องหมายคณิตเป็นคำ"""
    text = text.replace('−', ' ลบ ').replace('+', ' บวก ').replace('=', ' เท่ากับ ')
    chars = [' ' if (0x1F000 <= ord(c) <= 0x1FFFF or 0x2600 <= ord(c) <= 0x27BF or c in '️·') else c for c in text]
    return paced(re.sub(r'\s+', ' ', ''.join(chars)).strip())


def paced(text):
    """เว้นจังหวะระหว่างวลี แต่ไม่เว้นระหว่างตัวเลขกับคำที่ตามมา ("2 ตัว", "8 ลบ 5", "ตอบข้อ 3")
    ยกเว้นหลัง "ข้อ 1" ของตัวเลือก ("ข้อ 1, ส้ม"); คำซ้ำ "เท่าๆ กัน" ไม่เว้น"""
    words = text.split(' ')
    num = lambda w: re.fullmatch(r'\d+', w) is not None
    tight_word = lambda w: num(w) or len(w) == 1 or w in MATH or w.endswith('ๆ') or w[-1] in '?!:;.,)"'
    out = words[:1]
    for i in range(1, len(words)):
        a, b = words[i - 1], words[i]
        after_choice = num(a) and i >= 2 and words[i - 2] == 'ข้อ'
        tight = num(b) or len(b) == 1 or b in MATH or (tight_word(a) and not after_choice)
        out.append((' ' if tight else ', ') + b)
    return ''.join(out)


async def main():
    import edge_tts
    texts = json.loads((ROOT / 'design' / 'voice-texts.json').read_text(encoding='utf-8'))
    clips = {text: hashlib.md5(text.encode('utf-8')).hexdigest()[:12] for text in texts}
    # เปลี่ยนความเร็ว -> อัดใหม่ทั้งความเร็วนั้น (ไฟล์ตั้งชื่อตามข้อความ ไม่ได้ตามความเร็ว)
    # งานอัดใหม่จดไว้ใน design/.voice-state/ ทีละไฟล์ (ไม่ขึ้น git) จะได้หยุดกลางคันแล้วรันต่อได้
    old_manifest = json.loads((OUT / 'manifest.json').read_text(encoding='utf-8')) if (OUT / 'manifest.json').exists() else {}
    old, old_style = old_manifest.get('rates', {}), old_manifest.get('style')
    STATE.mkdir(parents=True, exist_ok=True)
    fresh = {}
    for speed, rate in RATES.items():
        mark = STATE / f'rate-{speed}.txt'
        sig = f'{rate}|{STYLE}'
        done_rate = mark.read_text(encoding='utf-8').strip() if mark.exists() else f"{old.get(speed)}|{old_style}"
        if done_rate != sig:
            (STATE / f'redo-{speed}.txt').write_text(rate, encoding='utf-8')
        redo = (STATE / f'redo-{speed}.txt')
        progress = STATE / f'redone-{speed}.txt'
        if redo.exists():
            fresh[speed] = set(progress.read_text(encoding='utf-8').split()) if progress.exists() else set()
        mark.write_text(sig, encoding='utf-8')
    def needed(text, h, speed):
        clip = OUT / speed / f'{h}.mp3'
        # ไฟล์ว่าง/เล็กผิดปกติ (TTS ตอบกลับมาแต่ไม่มีเสียง) นับว่ายังไม่ได้อัด — เคยหลุดขึ้นเว็บจริง 3 ไฟล์ (2026-10-04)
        if not clip.exists() or clip.stat().st_size < 1500:
            return True
        # อัดใหม่ทั้งความเร็ว — ยกเว้นประโยคที่เสียงไม่เปลี่ยน (ไม่มีจุดเว้น) ถ้าความเร็วเท่าเดิม
        if speed in fresh and h not in fresh[speed]:
            return ',' in spoken(text) or old.get(speed) != RATES[speed]
        return False
    todo = [(text, h, speed) for speed in RATES for text, h in clips.items() if needed(text, h, speed)]
    print(f'{len(clips)} phrases x {len(RATES)} speeds, {len(todo)} files to generate')
    failed = set()
    for text, h, speed in todo:
        path = OUT / speed / f'{h}.mp3'
        path.parent.mkdir(parents=True, exist_ok=True)
        await asyncio.sleep(0.4)   # ไม่ยิงถี่เกินไป
        # เน็ตสะดุด/บริการจำกัดความถี่ -> ลองใหม่สูงสุด 6 ครั้ง เว้นนานขึ้นเรื่อยๆ; ข้อความที่ TTS ไม่ยอมอ่านเลย -> ตัดออกจาก manifest
        for attempt in range(6):
            try:
                await edge_tts.Communicate(spoken(text), VOICE, rate=RATES[speed], pitch=PITCH).save(str(path))
                print(' ', speed, h, text[:40], flush=True)
                if speed in fresh:
                    with open(STATE / f'redone-{speed}.txt', 'a', encoding='utf-8') as f:
                        f.write(h + chr(10))
                break
            except Exception as error:
                print('  retry', speed, h, type(error).__name__, flush=True)
                await asyncio.sleep(3 + attempt * 5)
        else:
            path.unlink(missing_ok=True)
            failed.add(text)
            print('  no audio, skipped:', text)
    for text in failed:
        clips.pop(text, None)
    manifest = {
        'voice': VOICE,
        'rates': RATES,
        'style': STYLE,
        'reviewStatus': 'ผู้ปกครองต้องฟังตรวจก่อนให้เด็กใช้ (ดู docs/VOICE-REVIEW.md)',
        'clips': dict(sorted(clips.items())),
    }
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=0) + '\n', encoding='utf-8')
    keep = {f'{h}.mp3' for h in clips.values()}
    for speed in RATES:
        for f in (OUT / speed).iterdir():
            if f.name not in keep:
                f.unlink()
                print('  removed', speed, f.name)
    for speed in fresh:
        done_now = set((STATE / f'redone-{speed}.txt').read_text(encoding='utf-8').split() if (STATE / f'redone-{speed}.txt').exists() else [])
        left = [h for t, h in clips.items() if h not in done_now and needed(t, h, speed)]
        if not left:
            (STATE / f'redo-{speed}.txt').unlink(missing_ok=True)
            (STATE / f'redone-{speed}.txt').unlink(missing_ok=True)
        else:
            print('  still to re-record at the new speed:', speed, len(left))
    print('done', len(clips), 'phrases')


asyncio.run(main())
