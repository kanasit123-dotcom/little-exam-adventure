/*
 * สถานะทั้งเกมเป็นข้อมูลล้วน เปลี่ยนผ่าน reduce(state, action) เท่านั้น
 * action ที่ผิดเงื่อนไข (เช่น แก้คำตอบที่ส่งแล้ว เปิดเฉลยช่วงที่ยังไม่ส่ง) คืน state เดิม (อ้างอิงเดิม) ไม่เปลี่ยนอะไร
 * ทุก action ที่ผ่านจะถูกบันทึกทั้งก้อนครั้งเดียว (storage.js) — คำตอบกับตำแหน่งข้อจึงไม่หลุดจากกัน
 */
export const STATE_VERSION = 1;
export const HISTORY_LIMIT = 10;
export const UNSURE = 'unsure';
export const REPLAY_ROLES = ['prompt', 'option', 'hint', 'explanation', 'transfer'];

export function initialState() {
  return {
    version: STATE_VERSION,
    settings: { sound: true, rate: 'normal', buddy: null, mode: 'buddy' },
    session: null,
    rewards: { stars: 0, stickers: [], claimed: {} },
    history: [],
  };
}

const SETTINGS = {
  sound: (v) => typeof v === 'boolean',
  rate: (v) => v === 'normal' || v === 'slow',
  buddy: (v) => v === null || typeof v === 'string',
  mode: (v) => v === 'buddy' || v === 'plain',
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
      return withSession(state, {
        submitted: [...s.submitted, { block: s.block, answers, at: action.now ?? Date.now() }],
        exposure,
        taughtSkills,
        phase: 'review',
        review: { ...s.review, block: s.block, cursor: 0 },
      });
    }

    case 'reviewGoto': {
      if (s?.phase !== 'review') return state;
      const ids = s.blocks[s.review.block];
      if (!submittedBlock(s, s.review.block) || !Number.isInteger(action.cursor) || action.cursor < 0 || action.cursor >= ids.length) return state;
      return withSession(state, { review: { ...s.review, cursor: action.cursor } });
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
      return {
        ...state,
        session: done,
        rewards: { stars: state.rewards.stars + 1, stickers, claimed: { ...state.rewards.claimed, [s.id]: { sticker, at } } },
        history: keepHistory(state.history, done),
      };
    }

    default:
      return state;
  }
}

function keepHistory(history, session) {
  return [session, ...history.filter((entry) => entry.id !== session.id)].slice(0, HISTORY_LIMIT);
}
