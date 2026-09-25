// เสียง: ผู้เล่นชุดเดียว เสียงใหม่ตัดเสียงเก่า คลิปไม่ต้องพึ่ง speechSynthesis — ทดสอบด้วยของปลอม (ไม่ได้พิสูจน์ว่าได้ยินจริงบน iPad)
import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudio, trimRange } from '../src/core/audio.js';

function fakeContext() {
  const sources = [];
  const ctx = {
    state: 'running',
    currentTime: 0,
    destination: {},
    resume: async () => { ctx.state = 'running'; },
    createBuffer: () => ({ getChannelData: () => new Float32Array(1), sampleRate: 22050 }),
    createBufferSource() {
      const src = { started: false, stopped: false, connect() {}, start() { src.started = true; }, stop() { src.stopped = true; }, onended: null };
      sources.push(src);
      return src;
    },
    decodeAudioData: (data, ok) => {
      const buffer = { sampleRate: 1000, getChannelData: () => new Float32Array([0, 0, 0.5, 0.5, 0.5, 0]) };
      ok?.(buffer);
      return Promise.resolve(buffer);
    },
  };
  return { ctx, sources };
}

const manifest = { clips: { 'สวัสดี': 'aaa', 'ลาก่อน': 'bbb' } };
const timers = { setTimeout: () => 0, clearTimeout: () => {} };
const tick = () => new Promise((r) => setTimeout(r, 0));

function setup({ speech = undefined, Utterance = undefined } = {}) {
  const { ctx, sources } = fakeContext();
  const fetched = [];
  const audio = createAudio({
    base: '/x/',
    loadManifest: async () => manifest,
    fetchArrayBuffer: async (url) => { fetched.push(url); return new ArrayBuffer(8); },
    createContext: () => ctx,
    speech,
    Utterance,
    timers,
  });
  audio.unlock();
  return { audio, ctx, sources, fetched };
}

async function waitForSource(sources, n) {
  for (let i = 0; i < 50 && sources.filter((s) => s.started).length < n; i++) await tick();
}

test('recorded clip plays through Web Audio without speechSynthesis and reports done', async () => {
  const { audio, sources, fetched } = setup();
  const done = audio.play({ text: 'สวัสดี', role: 'prompt' });
  await waitForSource(sources, 2);   // 1 = เสียงเงียบตอนปลดล็อก
  assert.equal(fetched[0], '/x/voice/th/normal/aaa.mp3');
  sources.at(-1).onended();
  assert.deepEqual(await done, { status: 'done', via: 'clip' });
});

test('slow speed uses the slow recordings', async () => {
  const { audio, sources, fetched } = setup();
  audio.setRate('slow');
  const done = audio.play({ text: 'สวัสดี', role: 'prompt' });
  await waitForSource(sources, 2);
  assert.equal(fetched[0], '/x/voice/th/slow/aaa.mp3');
  sources.at(-1).onended();
  await done;
});

test('a new request cancels the previous one globally; stale onended cannot finish the new one', async () => {
  const { audio, sources } = setup();
  const first = audio.play({ text: 'สวัสดี', role: 'prompt' });
  await waitForSource(sources, 2);
  const firstSource = sources.at(-1);
  const second = audio.play({ text: 'ลาก่อน', role: 'option' });
  assert.deepEqual(await first, { status: 'cancelled', via: 'clip' });
  assert.equal(firstSource.stopped, true);
  firstSource.onended?.();   // callback เก่ามาช้า
  await waitForSource(sources, 3);
  assert.equal(audio.playing.text, 'ลาก่อน', 'second is still playing');
  sources.at(-1).onended();
  assert.equal((await second).status, 'done');
});

test('abort signal (leaving the screen) cancels playback', async () => {
  const { audio, sources } = setup();
  const ctrl = new AbortController();
  const p = audio.play({ text: 'สวัสดี', role: 'prompt' }, { signal: ctrl.signal });
  await waitForSource(sources, 2);
  ctrl.abort();
  assert.equal((await p).status, 'cancelled');
  assert.equal(audio.playing, null);
});

test('missing clip falls back to device speech and says so; without it, reports error (never silently done)', async () => {
  const spoken = [];
  class Utterance { constructor(text) { this.text = text; } }
  const speech = { speak(u) { spoken.push(u); }, cancel() {} };
  const { audio } = setup({ speech, Utterance });
  const p = audio.play({ text: 'ไม่มีคลิป', role: 'prompt' });
  for (let i = 0; i < 20 && !spoken.length; i++) await tick();
  assert.equal(spoken[0].lang, 'th-TH');
  spoken[0].onend();
  assert.deepEqual(await p, { status: 'done', via: 'tts' });

  const plain = setup();
  assert.equal((await plain.audio.play({ text: 'ไม่มีคลิป', role: 'prompt' })).status, 'error');
});

test('muted audio resolves immediately as muted', async () => {
  const { audio } = setup();
  audio.setEnabled(false);
  assert.deepEqual(await audio.play({ text: 'สวัสดี', role: 'prompt' }), { status: 'muted', via: null });
});

test('silence trimming keeps a little padding around the sound', () => {
  const data = new Float32Array(1000);
  for (let i = 400; i < 600; i++) data[i] = 0.3;
  const { offset, duration } = trimRange({ sampleRate: 1000, getChannelData: () => data });
  assert.ok(offset > 0.3 && offset < 0.4);
  assert.ok(duration > 0.2 && duration < 0.35);
});
