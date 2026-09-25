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
VOICE = 'th-TH-PremwadeeNeural'
PITCH = '+10Hz'
RATES = {'normal': '-10%', 'slow': '-30%'}


def spoken(text):
    """ข้อความที่ส่งให้ TTS: ตัดอีโมจิ/สัญลักษณ์ และเปลี่ยนเครื่องหมายคณิตเป็นคำ"""
    text = text.replace('−', ' ลบ ').replace('+', ' บวก ').replace('=', ' เท่ากับ ')
    chars = [' ' if (0x1F000 <= ord(c) <= 0x1FFFF or 0x2600 <= ord(c) <= 0x27BF or c in '️·') else c for c in text]
    return re.sub(r'\s+', ' ', ''.join(chars)).strip()


async def main():
    import edge_tts
    texts = json.loads((ROOT / 'design' / 'voice-texts.json').read_text(encoding='utf-8'))
    clips = {text: hashlib.md5(text.encode('utf-8')).hexdigest()[:12] for text in texts}
    todo = [(text, h, speed) for speed in RATES for text, h in clips.items() if not (OUT / speed / f'{h}.mp3').exists()]
    print(f'{len(clips)} phrases x {len(RATES)} speeds, {len(todo)} files to generate')
    failed = set()
    for text, h, speed in todo:
        path = OUT / speed / f'{h}.mp3'
        path.parent.mkdir(parents=True, exist_ok=True)
        # เน็ตสะดุด -> ลองใหม่ 3 ครั้ง; ข้อความที่ TTS ไม่ยอมอ่านเลย -> ตัดออกจาก manifest
        for _ in range(3):
            try:
                await edge_tts.Communicate(spoken(text), VOICE, rate=RATES[speed], pitch=PITCH).save(str(path))
                print(' ', speed, h, text[:40])
                break
            except Exception as error:
                print('  retry', speed, h, type(error).__name__)
                await asyncio.sleep(2)
        else:
            path.unlink(missing_ok=True)
            failed.add(text)
            print('  no audio, skipped:', text)
    for text in failed:
        clips.pop(text, None)
    manifest = {
        'voice': VOICE,
        'rates': RATES,
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
    print('done', len(clips), 'phrases')


asyncio.run(main())
