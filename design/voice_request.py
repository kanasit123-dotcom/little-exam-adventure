"""เตรียมคำขอให้ AI ตัวอื่น (GPT / Gemini) อัดเสียงประโยคที่ยังไม่มีคลิป และนำไฟล์ที่ได้กลับเข้าเกม

ใช้:
    python design/voice_request.py request     # เขียน design/VOICE-REQUEST.md + design/voice-request.csv (เฉพาะประโยคที่ยังไม่มีเสียง)
    python design/voice_request.py import      # นำไฟล์จาก design/incoming-voice/ เข้า public/voice/th/ แล้วอัปเดต manifest

ชื่อไฟล์ที่ AI ต้องตั้ง: <speed>-<hash>.mp3 (หรือ .wav) เช่น normal-3eda5d9a9291.mp3 / slow-3eda5d9a9291.mp3
ไฟล์ .wav จะถูกแปลงเป็น .mp3 ด้วย ffmpeg จาก imageio-ffmpeg (pip install imageio-ffmpeg)
ไฟล์ที่ edge-tts อัดไว้แล้วจะไม่ถูกทับ (เก็บเสียง Premwadee ไว้ก่อน เสียงทั้งเกมจะได้เหมือนกัน)
"""
import csv
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'voice' / 'th'
INCOMING = ROOT / 'design' / 'incoming-voice'
SPEEDS = ('normal', 'slow')


def phrases():
    texts = json.loads((ROOT / 'design' / 'voice-texts.json').read_text(encoding='utf-8'))
    return {text: hashlib.md5(text.encode('utf-8')).hexdigest()[:12] for text in texts}


def manifest():
    return json.loads((OUT / 'manifest.json').read_text(encoding='utf-8'))


def missing():
    # ขอเฉพาะไฟล์ที่ยังไม่มีในเครื่อง (edge-tts อาจกำลังอัดอยู่ รายการจะสั้นลงเรื่อยๆ)
    rows = []
    for text, h in phrases().items():
        for speed in SPEEDS:
            if not (OUT / speed / f'{h}.mp3').exists():
                rows.append((f'{speed}-{h}.mp3', speed, text))
    return rows


def request():
    rows = missing()
    with open(ROOT / 'design' / 'voice-request.csv', 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow(['file', 'speed', 'text'])
        w.writerows(rows)
    table = '\n'.join(f'| `{name}` | {speed} | {text} |' for name, speed, text in rows)
    md = (ROOT / 'design' / 'VOICE-REQUEST.template.md').read_text(encoding='utf-8')
    md = md.replace('{{COUNT}}', str(len(rows))).replace('{{TABLE}}', table)
    (ROOT / 'design' / 'VOICE-REQUEST.md').write_text(md, encoding='utf-8')
    print(f'{len(rows)} files requested -> design/VOICE-REQUEST.md, design/voice-request.csv')


def to_mp3(src, dst):
    if src.suffix.lower() == '.mp3':
        dst.write_bytes(src.read_bytes())
        return
    import imageio_ffmpeg
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([ffmpeg, '-y', '-loglevel', 'error', '-i', str(src), '-ac', '1', '-ar', '24000', '-b:a', '48k', str(dst)], check=True)


def do_import():
    by_hash = {h: text for text, h in phrases().items()}
    files = [p for p in INCOMING.rglob('*') if p.suffix.lower() in ('.mp3', '.wav', '.m4a', '.ogg')]
    m = manifest()
    imported = set(m.get('imported', []))
    added = skipped = unknown = 0
    for src in files:
        speed, _, h = src.stem.partition('-')
        if speed not in SPEEDS or h not in by_hash:
            unknown += 1
            print('  ชื่อไฟล์ไม่ตรงรายการ ข้าม:', src.name)
            continue
        dst = OUT / speed / f'{h}.mp3'
        if dst.exists():
            skipped += 1          # มีเสียง Premwadee (หรือนำเข้าไปแล้ว) ไม่ทับ
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        to_mp3(src, dst)
        imported.add(f'{speed}/{h}')
        added += 1
    # ประโยคที่มีไฟล์ครบทั้งสองความเร็ว เข้า manifest ได้
    for h, text in by_hash.items():
        if all((OUT / s / f'{h}.mp3').exists() for s in SPEEDS):
            m['clips'][text] = h
    m['clips'] = dict(sorted(m['clips'].items()))
    m['imported'] = sorted(imported)
    if imported:
        m['importedNote'] = 'ไฟล์ใน imported อัดโดย AI ตัวอื่น (ไม่ใช่เสียง Premwadee) ผ่าน design/voice_request.py'
    (OUT / 'manifest.json').write_text(json.dumps(m, ensure_ascii=False, indent=0) + '\n', encoding='utf-8')
    print(f'นำเข้า {added} ไฟล์, มีเสียงเดิมอยู่แล้ว {skipped}, ชื่อไม่ตรง {unknown}; ยังขาด {len(missing())} ไฟล์')


if __name__ == '__main__':
    {'request': request, 'import': do_import}[sys.argv[1] if len(sys.argv) > 1 else 'request']()
