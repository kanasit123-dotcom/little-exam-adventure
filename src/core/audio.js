/*
 * เสียงพูดภาษาไทย — มีผู้เล่นเสียงชุดเดียวทั้งเกม (โจทย์ ตัวเลือก คำใบ้ เฉลย กำลังใจ)
 * - เล่นเสียงใหม่ = หยุดเสียงเก่าทุกประเภททันที
 * - play() คืน { status: 'done' | 'cancelled' | 'error' | 'muted', via } แยกได้ว่าจบจริงหรือถูกยกเลิก
 * - เลขรุ่น (generation) กัน callback ของเสียงเก่ามาเลื่อนหน้าใหม่; AbortSignal ใช้ตอนเปลี่ยนหน้า
 * - คลิปที่อัดไว้เล่นผ่าน Web Audio (ไม่ใช้ <audio> บน iOS) ไม่ต้องมี speechSynthesis
 * - ไม่มีคลิป → ใช้เสียงเครื่อง (speechSynthesis) ถ้ามี และบอกว่า via: 'tts'
 */

const SILENCE = 0.012;   // ตัดความเงียบหัว/ท้ายคลิป (edge-tts มีเงียบยาว ทำให้ปุ่มดูค้าง)

export function trimRange(buffer, threshold = SILENCE) {
  const data = buffer.getChannelData(0);
  let start = 0;
  let end = data.length - 1;
  while (start < end && Math.abs(data[start]) < threshold) start++;
  while (end > start && Math.abs(data[end]) < threshold) end--;
  const pad = Math.floor(buffer.sampleRate * 0.06);
  start = Math.max(0, start - pad);
  end = Math.min(data.length - 1, end + pad);
  return { offset: start / buffer.sampleRate, duration: Math.max(0.05, (end - start) / buffer.sampleRate) };
}

export function createAudio({
  base = './',
  loadManifest,
  fetchArrayBuffer = (url) => fetch(url).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer(); }),
  createContext = () => new (globalThis.AudioContext || globalThis.webkitAudioContext)(),
  speech = globalThis.speechSynthesis,
  Utterance = globalThis.SpeechSynthesisUtterance,
  timers = globalThis,
} = {}) {
  let ctx = null;
  let manifest = null;
  let manifestPromise = null;
  let enabled = true;
  let rate = 'normal';
  let generation = 0;
  let current = null;   // { gen, source, finish, request }
  let last = null;      // คำขอล่าสุด ไว้กดฟังซ้ำ
  const buffers = new Map();
  const listeners = new Set();

  const emit = () => { for (const fn of listeners) fn(current ? current.request : null); };

  function getManifest() {
    if (manifest) return Promise.resolve(manifest);
    if (!manifestPromise) {
      manifestPromise = (loadManifest ? loadManifest() : fetch(`${base}voice/th/manifest.json`).then((r) => r.json()))
        .then((m) => { manifest = m; return m; })
        .catch(() => { manifestPromise = null; return null; });
    }
    return manifestPromise;
  }

  function clipUrl(m, text) {
    const hash = m?.clips?.[text];
    return hash ? `${base}voice/th/${rate}/${hash}.mp3` : null;
  }

  /** เรียกจาก event ที่ผู้ใช้แตะ (pointerdown/click) — iPad ต้องปลดล็อกเสียงจาก gesture */
  function unlock() {
    try {
      if (!ctx) ctx = createContext();
      if (ctx.state !== 'running') ctx.resume?.();
      const silent = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = silent;
      src.connect(ctx.destination);
      src.start(0);
    } catch { /* ไม่มี Web Audio: จะใช้เสียงเครื่องแทน */ }
    getManifest();
  }

  function decode(url) {
    if (!buffers.has(url)) {
      const promise = fetchArrayBuffer(url)
        .then((data) => new Promise((resolve, reject) => {
          // Safari รุ่นเก่ารับเฉพาะแบบ callback
          const result = ctx.decodeAudioData(data, resolve, reject);
          if (result?.then) result.then(resolve, reject);
        }))
        .catch((error) => { buffers.delete(url); throw error; });
      buffers.set(url, promise);
    }
    return buffers.get(url);
  }

  function stop() {
    generation++;
    const playing = current;
    current = null;
    if (playing) {
      try { playing.source?.stop(); } catch { /* หยุดไปแล้ว */ }
      playing.finish('cancelled');
    }
    try { speech?.cancel(); } catch { /* ไม่มีเสียงเครื่อง */ }
    emit();
  }

  /**
   * request: { text, role, qid }  options: { signal }
   * role: prompt | option | hint | explanation | encouragement | transfer | ui
   */
  function play(request, { signal } = {}) {
    stop();
    last = request;
    const gen = generation;
    if (!enabled || !request?.text) return Promise.resolve({ status: 'muted', via: null });
    if (signal?.aborted) return Promise.resolve({ status: 'cancelled', via: null });

    return new Promise((resolve) => {
      let settled = false;
      let via = null;
      let watchdog = null;
      const finish = (status) => {
        if (settled) return;
        settled = true;
        if (watchdog) timers.clearTimeout(watchdog);
        signal?.removeEventListener?.('abort', onAbort);
        if (current && current.gen === gen) { current = null; emit(); }
        resolve({ status, via });
      };
      const onAbort = () => { if (generation === gen) stop(); else finish('cancelled'); };
      signal?.addEventListener?.('abort', onAbort, { once: true });
      current = { gen, source: null, finish, request };
      emit();

      getManifest().then(async (m) => {
        if (generation !== gen) return finish('cancelled');
        const url = clipUrl(m, request.text);
        if (url && ctx) {
          try {
            const buffer = await decode(url);
            if (generation !== gen) return finish('cancelled');
            if (ctx.state !== 'running') await ctx.resume?.();
            if (generation !== gen) return finish('cancelled');
            const { offset, duration } = trimRange(buffer);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.onended = () => { if (generation === gen) finish('done'); };
            current.source = source;
            via = 'clip';
            source.start(0, offset, duration);
            // บางครั้ง iOS ไม่ยิง onended — กันปุ่มค้าง
            watchdog = timers.setTimeout(() => { if (generation === gen) finish('done'); }, (duration + 1.5) * 1000);
            return undefined;
          } catch {
            if (generation !== gen) return finish('cancelled');
            // โหลดคลิปไม่ได้ → ลองเสียงเครื่องด้านล่าง
          }
        }
        if (speech && Utterance) {
          via = 'tts';
          const utterance = new Utterance(request.text);
          utterance.lang = 'th-TH';
          utterance.rate = rate === 'slow' ? 0.65 : 0.8;
          utterance.onend = () => { if (generation === gen) finish('done'); };
          utterance.onerror = () => { if (generation === gen) finish('error'); };
          try { speech.speak(utterance); } catch { return finish('error'); }
          watchdog = timers.setTimeout(() => { if (generation === gen) finish('done'); }, 4000 + request.text.length * 220);
          return undefined;
        }
        return finish('error');
      });
    });
  }

  return {
    unlock,
    play,
    stop,
    replayLast: (options) => (last ? play(last, options) : Promise.resolve({ status: 'error', via: null })),
    setEnabled(value) { enabled = !!value; if (!enabled) stop(); },
    setRate(value) { rate = value === 'slow' ? 'slow' : 'normal'; },
    get playing() { return current ? current.request : null; },
    get unlocked() { return !!ctx && ctx.state === 'running'; },
    hasClip: async (text) => !!clipUrl(await getManifest(), text),
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    /** เสียงสั้นตอนแตะ — เหมือนกันทุกตัวเลือก ไม่บอกถูกผิด */
    tap(freq = 660) {
      if (!enabled || !ctx || ctx.state !== 'running') return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.13);
      } catch { /* ไม่มีเสียงก็ไม่เป็นไร */ }
    },
  };
}
