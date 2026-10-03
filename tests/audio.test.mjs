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

test('clip URLs carry the recorded rate so a re-recorded speed is not served from cache', async () => {
  const { ctx, sources } = fakeContext();
  const fetched = [];
  const audio = createAudio({
    base: '/x/', loadManifest: async () => ({ rates: { normal: '-20%', slow: '-35%' }, clips: { 'สวัสดี': 'aaa' } }),
    fetchArrayBuffer: async (url) => { fetched.push(url); return new ArrayBuffer(8); }, createContext: () => ctx, timers,
  });
  audio.unlock();
  const done = audio.play({ text: 'สวัสดี', role: 'prompt' });
  await waitForSource(sources, 2);
  assert.equal(fetched[0], '/x/voice/th/normal/aaa.mp3?r=-20%25');
  sources.at(-1).onended();
  await done;
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

test('clip URLs also carry the pause style so re-recorded pacing is not served from cache', async () => {
  const { ctx, sources } = fakeContext();
  const fetched = [];
  const audio = createAudio({
    base: '/x/', loadManifest: async () => ({ rates: { normal: '-20%' }, style: 'pause-1', clips: { 'สวัสดี': 'aaa' } }),
    fetchArrayBuffer: async (url) => { fetched.push(url); return new ArrayBuffer(8); }, createContext: () => ctx, timers,
  });
  audio.unlock();
  const done = audio.play({ text: 'สวัสดี', role: 'prompt' });
  await waitForSource(sources, 2);
  assert.equal(fetched[0], '/x/voice/th/normal/aaa.mp3?r=-20%25&s=pause-1');
  sources.at(-1).onended();
  await done;
});

test('iPad: a context that never resumes does not hang the question — play() gives up with an error and says why', async () => {
  const { ctx } = fakeContext();
  ctx.state = 'suspended';
  ctx.resume = () => new Promise(() => {});   // iOS บางครั้งไม่ตอบเมื่อไม่ได้เรียกจากการแตะ
  const audio = createAudio({
    base: '/x/',
    loadManifest: async () => manifest,
    fetchArrayBuffer: async () => new ArrayBuffer(8),
    createContext: () => ctx,
    timers: { setTimeout: (fn) => globalThis.setTimeout(fn, 5), clearTimeout: globalThis.clearTimeout },
  });
  audio.unlock();
  const result = await audio.play({ text: 'สวัสดี', role: 'prompt' });
  assert.equal(result.status, 'error');
  assert.match(audio.diagnose().lastError, /audio context suspended/);
  assert.equal(audio.diagnose().context, 'suspended');
});

test('unlocking asks iOS to play sound even when the ringer is muted (audio session = playback)', () => {
  const session = { type: 'auto' };
  const { ctx } = fakeContext();
  const audio = createAudio({ loadManifest: async () => manifest, createContext: () => ctx, audioSession: session, timers });
  audio.unlock();
  assert.equal(session.type, 'playback');
  assert.equal(audio.diagnose().audioSession, 'playback');
  // เครื่องที่ไม่มี audioSession (รุ่นเก่า) ต้องไม่พัง
  const old = createAudio({ loadManifest: async () => manifest, createContext: () => fakeContext().ctx, audioSession: undefined, timers });
  assert.doesNotThrow(() => old.unlock());
});

test('device speech picks a Thai voice explicitly, and reports an error when the device has no Thai voice', async () => {
  class Utt { constructor(text) { this.text = text; } }
  const spoken = [];
  const withVoices = (voices) => ({
    getVoices: () => voices,
    speak: (u) => { spoken.push(u); u.onend(); },
    cancel: () => {},
  });
  const thai = { lang: 'th-TH', name: 'Kanya' };
  const a = setup({ speech: withVoices([{ lang: 'en-US', name: 'Alex' }, thai]), Utterance: Utt });
  assert.deepEqual(await a.audio.play({ text: 'ไม่มีคลิปนี้', role: 'prompt' }), { status: 'done', via: 'tts' });
  assert.equal(spoken[0].voice, thai);
  const b = setup({ speech: withVoices([{ lang: 'en-US', name: 'Alex' }]), Utterance: Utt });
  assert.equal((await b.audio.play({ text: 'ไม่มีคลิปนี้', role: 'prompt' })).status, 'error');
  assert.equal(b.audio.diagnose().lastError, 'no Thai voice');
});

test('iPad home-screen app: a context whose clock stopped is replaced on the next tap, and the stuck clip falls back to device speech', async () => {
  const contexts = [];
  const make = () => { const f = fakeContext(); f.ctx.closed = false; f.ctx.close = () => { f.ctx.closed = true; }; contexts.push(f); return f.ctx; };
  let clockNow = 0;
  const pending = [];
  const fakeTimers = { setTimeout: (fn, ms) => { pending.push({ fn, ms }); return pending.length; }, clearTimeout: () => {} };
  class Utt { constructor(text) { this.text = text; } }
  const spoken = [];
  const speech = { getVoices: () => [{ lang: 'th-TH' }], speak: (u) => spoken.push(u), cancel: () => {} };
  const audio = createAudio({ loadManifest: async () => manifest, fetchArrayBuffer: async () => new ArrayBuffer(8), createContext: make, timers: fakeTimers, now: () => clockNow, speech, Utterance: Utt });
  audio.unlock();
  assert.equal(contexts.length, 1);
  // เล่นคลิป แต่นาฬิกาเสียงไม่เดิน (currentTime ค้างที่ 0) → ตัวตรวจ 700 ms หยุดคลิปแล้วอ่านด้วยเสียงเครื่อง
  const p = audio.play({ text: 'สวัสดี', role: 'prompt' });
  for (let i = 0; i < 50 && !pending.some((t) => t.ms === 700); i++) await tick();
  pending.find((t) => t.ms === 700).fn();
  assert.equal(spoken.length, 1, 'device speech takes over');
  assert.equal(contexts[0].sources.at(-1).stopped, true, 'the silent clip is stopped');
  spoken[0].onend();
  assert.deepEqual(await p, { status: 'done', via: 'tts' });
  assert.equal(audio.diagnose().lastError, 'audio clock stuck');
  // แตะครั้งถัดไป: ทิ้งตัวเก่า สร้างตัวใหม่
  clockNow = 1000;
  audio.unlock();
  assert.equal(contexts.length, 2);
  assert.equal(contexts[0].ctx.closed, true);
  // แตะต่อโดยนาฬิกาเดินปกติ: ไม่สร้างใหม่
  contexts[1].ctx.currentTime = 1;
  clockNow = 2000;
  audio.unlock();
  assert.equal(contexts.length, 2);
  // พับแอปแล้วกลับมา: แตะครั้งถัดไปสร้างใหม่
  audio.markStale();
  audio.unlock();
  assert.equal(contexts.length, 3);
  assert.equal(audio.diagnose().contexts, 3);
});

test('after returning from the lock screen the page can check whether the audio clock really moves', async () => {
  const { ctx } = fakeContext();
  const audio = createAudio({ loadManifest: async () => manifest, createContext: () => ctx, timers: { setTimeout: (fn) => globalThis.setTimeout(fn, 1), clearTimeout: globalThis.clearTimeout } });
  audio.unlock();
  const moving = audio.checkClock(800);
  ctx.currentTime = 0.7;   // นาฬิกาเดินระหว่างรอ
  assert.equal(await moving, true);
  const stuck = audio.checkClock(800);   // นาฬิกาค้างที่ 0.7
  assert.equal(await stuck, false);
  ctx.state = 'suspended';
  ctx.currentTime = 5;
  assert.equal(await audio.checkClock(800), false, 'a suspended context is not working sound');
});
