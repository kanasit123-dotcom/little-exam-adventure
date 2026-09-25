// รวมทุกประโยคที่เกมพูดได้ → design/voice-texts.json ให้ design/voice.py อัดเสียง
// รัน: node scripts/voice-texts.mjs   (npm run voice จะรันตัวนี้แล้วตามด้วย voice.py)
import { writeFileSync } from 'node:fs';
import { allSpeeches } from '../src/content/speeches.js';

const texts = allSpeeches();
writeFileSync(new URL('../design/voice-texts.json', import.meta.url), `${JSON.stringify(texts, null, 1)}\n`, 'utf8');
console.log(`${texts.length} phrases -> design/voice-texts.json`);
