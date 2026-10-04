/*
 * สถานะทั้งเกมเป็นข้อมูลล้วน เปลี่ยนผ่าน reduce(state, action) เท่านั้น
 * action ที่ผิดเงื่อนไข (เช่น แก้คำตอบที่ส่งแล้ว เปิดเฉลยช่วงที่ยังไม่ส่ง) คืน state เดิม (อ้างอิงเดิม) ไม่เปลี่ยนอะไร
 * ทุก action ที่ผ่านจะถูกบันทึกทั้งก้อนครั้งเดียว (storage.js) — คำตอบกับตำแหน่งข้อจึงไม่หลุดจากกัน
 */
import { FAMILY_MAX } from './friends.js';

export const STATE_VERSION = 1;
export const HISTORY_LIMIT = 10;
export const UNSURE = 'unsure';
// round = ครบหนึ่งรอบที่ "ครู" อ่านโจทย์ในโหมดสอบจริง (ฟัง 2 รอบ) นับรายข้อ และรายเรื่อง (qid = story:<รหัสเรื่อง>)
export const REPLAY_ROLES = ['prompt', 'option', 'hint', 'explanation', 'transfer', 'round'];

export function initialState() {
  return {
    version: STATE_VERSION,
    settings: { sound: true, rate: 'normal', buddy: null, mode: 'buddy', listen: 'free' },
    session: null,
    // friends: รหัสเพื่อน -> จำนวนครั้งที่เลือก (ใช้คิดขนาด เล็ก กลาง ใหญ่ ใหญ่มาก)
    rewards: { stars: 0, stickers: [], friends: {}, claimed: {} },
    history: [],
    // ผลรายชุด (ไม่จำกัดจำนวนชุด ต่างจาก history ที่เก็บแค่ 10 ครั้งล่าสุด)
    progress: {},
    // ข้อที่ตอบผิด/ยังไม่แน่ใจตอนส่ง (รหัสข้อ -> { misses, at }) ตอบถูกภายหลังจะถูกลบ
    mistakes: {},
  };
}

export const MISTAKES_LIMIT = 200;

const SETTINGS = {
  sound: (v) => typeof v === 'boolean',
  rate: (v) => v === 'normal' || v === 'slow',
  buddy: (v) => v === null || typeof v === 'string',
  mode: (v) => v === 'buddy' || v === 'plain',
  // free = ฟังโจทย์ซ้ำได้ไม่จำกัด (ฝึก) · twice = แบบสอบจริง ครูอ่านโจทย์และตัวเลือก 2 รอบแล้วฟังซ้ำไม่ได้
  listen: (v) => v === 'free' || v === 'twice',
};

export const currentBlockIds = (session) => session?.blocks[session.block] || [];
export const isLastBlock = (session) => session.block === session.blocks.length - 1;
export const submittedBlock = (session, index) => session?.submitted.find((entry) => entry.block === index) || null;
export const submittedAnswer = (session, qid) => {
  for (const entry of session?.submitted || []) if (qid in entry.answers) return entry.answers[qid];
  return undefined;
};
export const blockComplete = (session) => currentBlockIds(session).every((id) => session.drafts[id] != null);

function withSession(state, patch) {
  return { ...state, session: { ...state.session, ...patch } };
}

export function reduce(state, action) {
  const s = state.session;
  switch (action.type) {
    case 'settings': {
      const patch = {};
      for (const [key, value] of Object.entries(action.patch || {})) {
        if (!SETTINGS[key]?.(value)) return state;
        patch[key] = value;
      }
      return { ...state, settings: { ...state.settings, ...patch } };
    }

    case 'start': {
      if (!action.session) return state;
      const history = s && s.phase !== 'done' ? keepHistory(state.history, { ...s, abandoned: true, finishedAt: action.session.startedAt }) : state.history;
      return { ...state, history, session: action.session };
    }

    case 'abandon': {
      if (!s) return state;
      const history = s.phase === 'done' ? state.history : keepHistory(state.history, { ...s, abandoned: true, finishedAt: action.now ?? Date.now() });
      return { ...state, history, session: null };
    }

    case 'goto': {
      if (s?.phase !== 'exam') return state;
      const ids = currentBlockIds(s);
      if (!Number.isInteger(action.cursor) || action.cursor < 0 || action.cursor >= ids.length) return state;
      return withSession(state, { cursor: action.cursor, visited: { ...s.visited, [ids[action.cursor]]: true } });
    }

    case 'select': {
      if (s?.phase !== 'exam') return state;
      const { qid, answer } = action;
      if (!currentBlockIds(s).includes(qid) || submittedAnswer(s, qid) !== undefined) return state;
      if (answer !== UNSURE && !s.optionOrder[qid]?.includes(answer)) return state;
      const previous = s.drafts[qid];
      if (previous === answer) return state;
      return withSession(state, {
        drafts: { ...s.drafts, [qid]: answer },
        firstSelections: qid in s.firstSelections ? s.firstSelections : { ...s.firstSelections, [qid]: answer },
        changes: previous == null ? s.changes : { ...s.changes, [qid]: (s.changes[qid] || 0) + 1 },
        visited: { ...s.visited, [qid]: true },
      });
    }

    case 'confirm': {
      if (s?.phase !== 'exam' || !blockComplete(s)) return state;
      return withSession(state, { phase: 'confirm' });
    }

    case 'cancelConfirm': {
      // กลับไปแก้ก่อนส่ง (เลือกข้อที่จะกลับไปได้)
      if (s?.phase !== 'confirm') return state;
      const ids = currentBlockIds(s);
      const cursor = Number.isInteger(action.cursor) && action.cursor >= 0 && action.cursor < ids.length ? action.cursor : s.cursor;
      return withSession(state, { phase: 'exam', cursor });
    }

    case 'submit': {
      if (s?.phase !== 'confirm' || !blockComplete(s)) return state;
      const ids = currentBlockIds(s);
      const answers = Object.fromEntries(ids.map((id) => [id, s.drafts[id]]));
      // ข้อที่มีทักษะที่เคยได้เรียนในเฉลยช่วงก่อน → ไม่นับเป็นคะแนนก่อนสอน
      const exposure = { ...s.exposure };
      for (const id of ids) if (s.skills[id]?.some((skill) => skill in s.taughtSkills)) exposure[id] = true;
      const taughtSkills = { ...s.taughtSkills };
      for (const id of ids) for (const skill of s.skills[id] || []) if (!(skill in taughtSkills)) taughtSkills[skill] = s.block;
      // ผู้ส่ง (หน้าจอ) ตัดสินถูกผิดจากเนื้อหาแล้วส่งมาใน results; reducer แค่จดข้อที่ควรทบทวน
      const at = action.now ?? Date.now();
      let mistakes = state.mistakes || {};
      if (action.results) {
        mistakes = { ...mistakes };
        for (const id of ids) {
          const result = action.results[id];
          if (result === 'correct') delete mistakes[id];
          else if (result === 'incorrect' || result === 'unsure') mistakes[id] = { misses: (mistakes[id]?.misses || 0) + 1, at };
        }
        const keep = Object.entries(mistakes).sort((a, b) => b[1].at - a[1].at).slice(0, MISTAKES_LIMIT);
        mistakes = Object.fromEntries(keep);
      }
      return {
        ...state,
        mistakes,
        session: {
          ...s,
          submitted: [...s.submitted, { block: s.block, answers, at }],
          exposure,
          taughtSkills,
          phase: 'review',
          review: { ...s.review, block: s.block, cursor: 0 },
        },
      };
    }

    case 'reviewGoto': {
      // ไปข้อไหนก็ได้ในทุกช่วงที่ส่งแล้ว (กดเลขข้อ)
      if (s?.phase !== 'review') return state;
      const block = Number.isInteger(action.block) ? action.block : s.review.block;
      const ids = s.blocks[block];
      if (!ids || !submittedBlock(s, block) || !Number.isInteger(action.cursor) || action.cursor < 0 || action.cursor >= ids.length) return state;
      return withSession(state, { review: { ...s.review, block, cursor: action.cursor } });
    }

    case 'openReview': {
      // กลับมาดูเฉลยจากหน้าพัก หน้ารางวัล หรือระหว่างทำช่วงถัดไป แล้วกด "กลับ" ไปที่เดิม
      if (!s || !s.submitted.length || !['exam', 'break', 'reward', 'done'].includes(s.phase)) return state;
      const last = s.submitted[s.submitted.length - 1].block;
      const block = Number.isInteger(action.block) && submittedBlock(s, action.block) ? action.block : last;
      return withSession(state, { phase: 'review', resume: s.phase, review: { ...s.review, block, cursor: 0 } });
    }

    case 'reviewStep': {
      const { qid, step } = action;
      if (!s || submittedAnswer(s, qid) === undefined || !Number.isInteger(step) || step < 0) return state;
      if ((s.review.steps[qid] ?? -1) >= step) return state;
      return withSession(state, { review: { ...s.review, steps: { ...s.review.steps, [qid]: step } } });
    }

    case 'hint': {
      const { qid } = action;
      if (!s || submittedAnswer(s, qid) === undefined) return state;
      return withSession(state, { review: { ...s.review, hints: { ...s.review.hints, [qid]: (s.review.hints[qid] || 0) + 1 } } });
    }

    case 'helper': {
      const { qid, completed } = action;
      if (!s || submittedAnswer(s, qid) === undefined) return state;
      const prev = s.review.helper[qid] || { opened: 0, completed: false };
      return withSession(state, { review: { ...s.review, helper: { ...s.review.helper, [qid]: { opened: prev.opened + (completed ? 0 : 1), completed: prev.completed || !!completed } } } });
    }

    case 'transfer': {
      // ผลโจทย์ลองใหม่เก็บแยก ไม่แตะคำตอบที่ส่งแล้ว
      const { tid, forQid, answer, correct } = action;
      if (!s || submittedAnswer(s, forQid) === undefined || !tid || typeof correct !== 'boolean') return state;
      const prev = s.transfers[tid] || { forQid, attempts: [] };
      if (prev.forQid !== forQid) return state;
      return withSession(state, { transfers: { ...s.transfers, [tid]: { forQid, attempts: [...prev.attempts, { answer, correct, at: action.now ?? Date.now() }] } } });
    }

    case 'replay': {
      if (!s || !REPLAY_ROLES.includes(action.role)) return state;
      const key = action.qid || '_';
      const row = s.replays[key] || {};
      return withSession(state, { replays: { ...s.replays, [key]: { ...row, [action.role]: (row[action.role] || 0) + 1 } } });
    }

    case 'finishReview': {
      if (s?.phase !== 'review') return state;
      if (s.resume) return withSession(state, { phase: s.resume, resume: null });
      return withSession(state, { phase: isLastBlock(s) ? 'reward' : 'break' });
    }

    case 'endBreak': {
      if (s?.phase !== 'break') return state;
      return withSession(state, { phase: 'exam', block: s.block + 1, cursor: 0 });
    }

    case 'claim': {
      // รางวัลจากการทำครบ ไม่ขึ้นกับคะแนน ให้ครั้งเดียวต่อ session (กดซ้ำ/รีโหลดไม่ได้เพิ่ม)
      if (s?.phase !== 'reward') return state;
      const at = action.now ?? Date.now();
      const done = { ...s, phase: 'done', finishedAt: at };
      if (state.rewards.claimed[s.id]) return { ...state, session: done };
      const sticker = typeof action.sticker === 'string' ? action.sticker : null;
      const stickers = sticker && !state.rewards.stickers.includes(sticker) ? [...state.rewards.stickers, sticker] : state.rewards.stickers;
      // สติกเกอร์เพื่อน: เลือกตัวเดิมซ้ำ = โตขึ้นหนึ่งขั้น
      const friend = typeof action.friend === 'string' ? action.friend : null;
      const friends = { ...(state.rewards.friends || {}) };
      // นับต่อได้ถึงครอบครัวครบ (โตครบ 4 ขนาด แล้วไข่/ลูกอีก 2 รอบ) หลังจากนั้นไม่นับเพิ่ม
      if (friend) friends[friend] = Math.min((friends[friend] || 0) + 1, FAMILY_MAX);
      return {
        ...state,
        session: done,
        rewards: { stars: state.rewards.stars + 1, stickers, friends, claimed: { ...state.rewards.claimed, [s.id]: { sticker, friend, at } } },
        history: keepHistory(state.history, done),
        progress: { ...state.progress, [s.setId]: nextProgress(state.progress?.[s.setId], action.result, s.setVersion, at) },
      };
    }

    default:
      return state;
  }
}

/** ผลรายชุดหลังทำครบ: result = { correct, total } คำตอบครั้งแรกที่ถูก (ผู้เรียกคำนวณจากเนื้อหา) */
function nextProgress(prev, result, version, at) {
  const ok = result && Number.isInteger(result.correct) && Number.isInteger(result.total) && result.correct >= 0 && result.correct <= result.total;
  const last = ok ? { correct: result.correct, total: result.total } : null;
  const best = last && (!prev?.best || last.correct / last.total > prev.best.correct / prev.best.total) ? last : prev?.best || null;
  return { completed: (prev?.completed || 0) + 1, last, best, version, at };
}

function keepHistory(history, session) {
  return [session, ...history.filter((entry) => entry.id !== session.id)].slice(0, HISTORY_LIMIT);
}
