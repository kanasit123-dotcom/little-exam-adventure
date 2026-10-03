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
  audioSession = globalThis.navigator?.audioSession,
  now = () => (globalThis.performance?.now ? globalThis.performance.now() : Date.now()),
} = {}) {
  let ctx = null;
  let contexts = 0;     // สร้าง AudioContext ไปแล้วกี่ตัว (ไว้ดูในปุ่มทดสอบเสียง)
  let stale = false;    // แอปเคยถูกพับไปพื้นหลัง: แตะครั้งถัดไปให้สร้าง AudioContext ใหม่
  let clock = null;     // { time, at } เวลาเสียงตอนแตะครั้งล่าสุด ไว้ดูว่านาฬิกาเสียงเดินจริงไหม
  let manifest = null;
  let manifestPromise = null;
  let enabled = true;
  let rate = 'normal';
  let generation = 0;
  let current = null;   // { gen, source, finish, request }
  let last = null;      // คำขอล่าสุด ไว้กดฟังซ้ำ
  let lastError = '';   // เหตุที่เล่นไม่ได้ครั้งล่าสุด (ไว้ให้ปุ่ม "ทดสอบเสียง" ในหน้าผู้ปกครองรายงาน)
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
    if (!hash) return null;
    // ต่อท้ายด้วยความเร็วและรุ่นการเว้นจังหวะที่อัด: อัดใหม่แล้วเครื่องจะไม่ใช้ไฟล์เก่าที่แคชไว้
    const version = m.rates?.[rate] ? `?r=${encodeURIComponent(m.rates[rate])}${m.style ? `&s=${encodeURIComponent(m.style)}` : ''}` : '';
    return `${base}voice/th/${rate}/${hash}.mp3${version}`;
  }

  /**
   * iPhone/iPad: ปุ่มปิดเสียงด้านข้าง / ปุ่มปิดเสียงในศูนย์ควบคุมทำให้ Web Audio เงียบสนิท (วิดีโอยังมีเสียง) —
   * ตั้ง audio session เป็น playback เพื่อให้เสียงอ่านดังแม้ปิดเสียงเรียกเข้า (Safari 16.4 ขึ้นไป; รุ่นเก่าไม่มีก็ข้ามไป)
   */
  function playbackSession() {
    try { if (audioSession && audioSession.type !== 'playback') audioSession.type = 'playback'; } catch { /* ไม่รองรับ */ }
  }

  /** resume() บน iOS อาจค้างไม่จบถ้าไม่ได้เรียกจากการแตะ — รอได้แค่นี้ แล้วถือว่าเล่นไม่ได้ (ไม่ปล่อยให้ข้อสอบค้างรอเสียง) */
  const RESUME_WAIT_MS = 1500;
  function resumeBounded() {
    return Promise.race([
      Promise.resolve(ctx.resume?.()).catch(() => {}),
      new Promise((resolve) => timers.setTimeout(resolve, RESUME_WAIT_MS)),
    ]);
  }

  /**
   * iPad/iPhone ที่เปิดเกมจากไอคอนบนหน้าจอโฮม (iOS 18-26): พับแอปแล้วกลับมา AudioContext ยังบอกว่า running
   * แต่ไม่มีเสียงและนาฬิกาเสียงไม่เดิน resume() ก็ไม่ช่วย (WebKit bug 291892, 263627) — ทางแก้คือทิ้งตัวเก่าแล้วสร้างใหม่ตอนแตะ
   */
  function clockStuck() {
    if (!ctx || ctx.state !== 'running' || !clock) return false;
    return now() - clock.at > 400 && ctx.currentTime - clock.time < 0.05;
  }
  function freshContext() {
    const old = ctx;
    ctx = createContext();
    contexts++;
    stale = false;
    clock = null;
    if (old) { try { old.close?.(); } catch { /* ปิดไปแล้ว */ } }
  }

  /** เรียกจาก event ที่ผู้ใช้แตะ (pointerdown/touchend/click) — iPad ต้องปลดล็อกเสียงจาก gesture */
  function unlock() {
    playbackSession();
    try {
      if (!ctx || stale || ctx.state === 'closed' || ctx.state === 'interrupted' || clockStuck()) freshContext();
      if (ctx.state !== 'running') ctx.resume?.();
      const silent = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = silent;
      src.connect(ctx.destination);
      src.start(0);
      clock = { time: ctx.currentTime, at: now() };
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
      // เสียงอ่านของเครื่อง: ใช้เมื่อไม่มีคลิป หรือคลิปเล่นแล้วเงียบ
      const speakDevice = () => {
        if (!(speech && Utterance)) {
          lastError = lastError || 'no clip and no device speech';
          return finish('error');
        }
        via = 'tts';
        const utterance = new Utterance(request.text);
        utterance.lang = 'th-TH';
        // iPhone/iPad ไม่สนใจ lang ถ้าไม่ตั้ง voice เอง (ข้อความไทยถูกอ่านด้วยเสียงอังกฤษแล้วเงียบ) และถ้าเครื่องไม่มีเสียงไทยเลยให้บอกว่าเล่นไม่ได้
        const voices = (() => { try { return speech.getVoices?.() || []; } catch { return []; } })();
        const thai = voices.find((v) => /^th/i.test(v.lang));
        if (voices.length && !thai) { lastError = 'no Thai voice'; return finish('error'); }
        if (thai) utterance.voice = thai;
        utterance.rate = rate === 'slow' ? 0.65 : 0.8;
        utterance.onend = () => { if (generation === gen) finish('done'); };
        utterance.onerror = () => { if (generation === gen) finish('error'); };
        try { speech.speak(utterance); } catch { return finish('error'); }
        if (watchdog) timers.clearTimeout(watchdog);
        watchdog = timers.setTimeout(() => { if (generation === gen) finish('done'); }, 4000 + request.text.length * 220);
        return undefined;
      };
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
            if (ctx.state !== 'running') await resumeBounded();
            if (generation !== gen) return finish('cancelled');
            if (ctx.state !== 'running') throw new Error(`audio context ${ctx.state}`);
            const { offset, duration } = trimRange(buffer);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.onended = () => { if (generation === gen) finish('done'); };
            current.source = source;
            via = 'clip';
            lastError = '';   // เล่นคลิปสำเร็จ: ล้างเหตุขัดข้องเก่า (เช่น ครั้งแรกบนหน้าแรกที่ยังไม่ได้แตะ)
            const playCtx = ctx;   // ถ้าแตะระหว่างเล่นจะได้ context ใหม่ — วัดนาฬิกาของตัวที่เล่นอยู่
            const startedAt = playCtx.currentTime;
            source.start(0, offset, duration);
            // บางครั้ง iOS ไม่ยิง onended — กันปุ่มค้าง
            watchdog = timers.setTimeout(() => { if (generation === gen) finish('done'); }, (duration + 1.5) * 1000);
            // นาฬิกาเสียงไม่เดิน = iOS เงียบทั้งที่บอกว่า running: หยุดคลิป อ่านด้วยเสียงเครื่องแทน และแตะครั้งถัดไปสร้าง AudioContext ใหม่
            timers.setTimeout(() => {
              if (generation !== gen || current?.source !== source || playCtx.currentTime - startedAt >= 0.05) return;
              stale = true;
              lastError = 'audio clock stuck';
              source.onended = null;
              try { source.stop(); } catch { /* หยุดไปแล้ว */ }
              current.source = null;
              speakDevice();
            }, 700);
            return undefined;
          } catch (error) {
            if (generation !== gen) return finish('cancelled');
            lastError = String(error?.message || error).slice(0, 80);
            // โหลดคลิปไม่ได้ → ลองเสียงเครื่องด้านล่าง
          }
        }
        return speakDevice();
      });
    });
  }

  return {
    unlock,
    play,
    stop,
    replayLast: (options) => (last ? play(last, options) : Promise.resolve({ status: 'error', via: null })),
    /** แอปถูกพับไปพื้นหลัง: แตะครั้งถัดไปจะสร้าง AudioContext ใหม่ (iOS ทำให้ตัวเก่าเงียบ) */
    markStale() { stale = true; },
    /** รอ ms แล้วดูว่านาฬิกาเสียงเดินจริงไหม (ใช้หลังกลับจากล็อกจอ) — true = เสียงใช้ได้ */
    checkClock(ms = 800) {
      const c = ctx;
      const start = c ? c.currentTime : 0;
      return new Promise((resolve) => timers.setTimeout(() => {
        if (!ctx) return resolve(false);
        const from = ctx === c ? start : 0;
        resolve(ctx.state === 'running' && ctx.currentTime - from > ms / 4000);
      }, ms));
    },
    setEnabled(value) { enabled = !!value; if (!enabled) stop(); },
    setRate(value) { rate = value === 'slow' ? 'slow' : 'normal'; },
    get playing() { return current ? current.request : null; },
    get unlocked() { return !!ctx && ctx.state === 'running'; },
    /** สถานะเสียงของเครื่องนี้ (แสดงในปุ่มทดสอบเสียงของหน้าผู้ปกครอง) */
    diagnose() {
      let voices = [];
      try { voices = speech?.getVoices?.() || []; } catch { /* ไม่มี */ }
      return {
        context: ctx ? ctx.state : 'none',
        contexts,
        stale,
        sampleRate: ctx?.sampleRate ?? null,
        audioSession: audioSession ? audioSession.type : 'n/a',
        deviceSpeech: !!speech,
        thaiVoice: voices.some((v) => /^th/i.test(v.lang)),
        lastError,
      };
    },
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
