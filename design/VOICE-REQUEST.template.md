# ขอให้ AI ตัวอื่นอัดเสียงอ่าน (GPT / Gemini)

> ไฟล์นี้สร้างอัตโนมัติด้วย `python design/voice_request.py request` — มีเฉพาะประโยคที่เกมยังไม่มีเสียง ({{COUNT}} ไฟล์)

## วิธีใช้

1. เปิด GPT หรือ Gemini ตัวที่**สร้างไฟล์เสียงได้** (ต้องรันโค้ดหรือเรียกเครื่องมืออ่านออกเสียงได้ หน้าแชทธรรมดามักทำไม่ได้)
2. แนบไฟล์ `design/voice-request.csv` (มีคอลัมน์ file, speed, text ครบทุกบรรทัด)
3. วาง prompt ด้านล่าง
4. ดาวน์โหลดไฟล์ที่ได้ (zip) แล้ว**แตกไฟล์ลงโฟลเดอร์นี้**:

   **`C:\Users\KANASIT\Documents\Codex\little-exam-adventure\design\incoming-voice\`**

   ไฟล์อยู่ในโฟลเดอร์ย่อยก็ได้ ขอแค่ชื่อไฟล์ตรงกับคอลัมน์ file เช่น `normal-3eda5d9a9291.mp3` (เป็น .wav ก็ได้ ผมแปลงให้)
   โฟลเดอร์นี้ไม่ขึ้น GitHub
5. บอกผมว่าวางไฟล์แล้ว ผมจะรัน `python design/voice_request.py import` ตรวจ แล้วขึ้นเว็บ

**ข้อควรรู้:** เสียงจาก GPT/Gemini จะเป็นคนละเสียงกับชุด 1–2 (Premwadee) ไฟล์ที่ edge-tts อัดเสร็จแล้วจะไม่ถูกทับ

## Prompt (คัดลอกทั้งกล่อง)

```text
You are a Thai text-to-speech producer for a children's learning game. I attached a CSV file with the columns file, speed and text.
For EVERY row, create one audio file that speaks the Thai text in the "text" column exactly as written: no extra words, no greeting, no English, no music, no sound effects.
Voice: one warm, clear, young adult FEMALE Thai voice, like a kind kindergarten teacher, standard Central Thai accent. Use the SAME voice for every file.
Speed: if speed is "normal", speak calmly and about 20% slower than normal conversation, so a 5-year-old can follow. If speed is "slow", speak about 35% slower than normal conversation, still natural and not robotic.
Read digits as Thai number words (8 = แปด, 15 = สิบห้า, 27 = ยี่สิบเจ็ด). Read "+" as บวก, "−" as ลบ, "=" as เท่ากับ. Pause briefly at spaces between phrases.
Leave no long silence at the start or end of a file.
Save each file as MP3 (WAV is also fine) and name it EXACTLY as the "file" column, for example normal-3eda5d9a9291.mp3. Do not rename, number or translate the file names.
Put all the files into one ZIP file for me to download.
If you cannot actually create audio files, tell me so clearly instead of creating something else. If you can only do part of the list, do as many rows as you can in order and tell me which row you stopped at.
```

## รายการประโยค ({{COUNT}} ไฟล์)

| file | speed | text |
| --- | --- | --- |
{{TABLE}}
