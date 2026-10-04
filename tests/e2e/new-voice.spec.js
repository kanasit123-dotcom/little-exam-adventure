// Opt-in decoding checks: run VOICE_DECODE=1 after the sequential recording job finishes.
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { SETS, stimulusSpeech } from '../../src/content/sets/index.js';
import { itemSpeeches } from '../../src/content/speeches.js';

const seen = new Set();
for (const set of SETS.filter((s) => Number(s.id.slice(4)) >= 41 && Number(s.id.slice(4)) <= 50)) {
  const texts = [...Object.values(set.stimuli).map(stimulusSpeech), ...set.items.flatMap((item) => itemSpeeches(set, item))]
    .filter((text) => { if (seen.has(text)) return false; seen.add(text); return true; });
  test(`${set.id}: recorded Thai clips decode and contain audio at both speeds`, async ({ page }, info) => {
    test.skip(process.env.VOICE_DECODE !== '1' || info.project.name !== 'mobile-chrome', 'opt-in recorded-audio QA');
    test.setTimeout(180_000);
    const manifest = JSON.parse(fs.readFileSync('public/voice/th/manifest.json', 'utf8'));
    await page.goto('about:blank');
    let decoded = 0;
    // Small batches avoid thousands of dev-server requests while retaining browser MP3 decoding.
    for (let start = 0; start < texts.length; start += 16) {
      const clips = texts.slice(start, start + 16).flatMap((text) => {
        const hash = manifest.clips[text];
        expect(hash, `missing recording: ${text}`).toBeTruthy();
        return ['normal', 'slow'].map((speed) => ({
          name: `${speed}/${hash}`,
          bytes: fs.readFileSync(`public/voice/th/${speed}/${hash}.mp3`).toString('base64'),
        }));
      });
      const result = await page.evaluate(async (clips) => {
        const context = new AudioContext();
        const errors = [];
        let decoded = 0;
        try {
          for (const clip of clips) {
            try {
              const bytes = Uint8Array.from(atob(clip.bytes), (character) => character.charCodeAt(0));
              const buffer = await context.decodeAudioData(bytes.buffer);
              if (buffer.duration < 0.15 || buffer.duration > 180) throw new Error(`unexpected duration ${buffer.duration}`);
              if (!buffer.getChannelData(0).some((sample) => Math.abs(sample) > 0.0001)) throw new Error('silent clip');
              decoded++;
            } catch (error) { errors.push(`${clip.name}: ${error.message}`); }
          }
        } finally { await context.close(); }
        return { errors, decoded };
      }, clips);
      expect(result.errors).toEqual([]);
      decoded += result.decoded;
    }
    expect(decoded).toBe(texts.length * 2);
  });
}
