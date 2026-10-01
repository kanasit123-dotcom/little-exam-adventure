/*
 * สรุปผลสำหรับผู้ปกครอง — แยกคำตอบครั้งแรก (ก่อนสอน) กับผลหลังเรียน (โจทย์ลองใหม่)
 * ไม่ตีความจำนวนการฟังซ้ำว่าเข้าใจหรือไม่เข้าใจ แค่รายงานตัวเลข
 */
import { SETS, getItem, getSet, OPTION_LABELS, SUBJECTS } from '../content/sets/index.js';
import { UNSURE, submittedAnswer } from './state.js';

export function answerStatus(item, answer) {
  if (answer === undefined || answer === null) return 'none';
  if (answer === UNSURE) return 'unsure';
  return answer === item.correctOptionId ? 'correct' : 'incorrect';
}

export const labelOf = (session, qid, optionId) => {
  const index = session.optionOrder[qid]?.indexOf(optionId);
  return index >= 0 ? OPTION_LABELS[index] : null;
};

export function summarize(session, set) {
  const rows = session.questionIds.map((qid, index) => {
    const item = getItem(set, qid);
    const answer = submittedAnswer(session, qid);
    const replays = session.replays[qid] || {};
    const transfers = (item?.review.transferIds || []).map((tid) => {
      const record = session.transfers[tid];
      const last = record?.attempts.at(-1);
      return { id: tid, attempts: record?.attempts.length || 0, firstCorrect: record ? record.attempts[0].correct : null, lastCorrect: last ? last.correct : null };
    });
    return {
      number: index + 1,
      id: qid,
      subject: item?.subject,
      subjectName: SUBJECTS[item?.subject] || '',
      status: item ? answerStatus(item, answer) : 'none',
      answerLabel: answer && answer !== UNSURE ? labelOf(session, qid, answer) : null,
      correctLabel: item ? labelOf(session, qid, item.correctOptionId) : null,
      changed: session.changes[qid] || 0,
      exposed: !!session.exposure[qid],
      promptReplays: replays.prompt || 0,
      optionReplays: replays.option || 0,
      hints: session.review.hints[qid] || 0,
      stepsSeen: (session.review.steps[qid] ?? -1) + 1,
      helper: session.review.helper[qid] || null,
      transfers,
    };
  });
  const bySubject = {};
  for (const row of rows) {
    const s = (bySubject[row.subject] ||= { name: row.subjectName, total: 0, correct: 0, incorrect: 0, unsure: 0, none: 0, exposed: 0 });
    s.total++;
    s[row.status]++;
    if (row.exposed) s.exposed++;
  }
  const count = (status) => rows.filter((row) => row.status === status).length;
  return {
    rows,
    bySubject,
    totals: {
      questions: rows.length,
      submitted: rows.filter((row) => row.status !== 'none').length,
      correct: count('correct'),
      incorrect: count('incorrect'),
      unsure: count('unsure'),
      // คะแนนก่อนสอน: ไม่นับข้อที่ได้เรียนทักษะนั้นในเฉลยช่วงก่อนแล้ว
      baselineCorrect: rows.filter((row) => row.status === 'correct' && !row.exposed).length,
      baselineTotal: rows.filter((row) => !row.exposed).length,
    },
  };
}

/**
 * รายงานจุดอ่อนสำหรับผู้ปกครอง: ความแม่นของ "คำตอบครั้งแรก" แยกตามหมวด รวมจากชุดที่ทำล่าสุด (ประวัติเก็บ 10 ครั้ง + ชุดที่กำลังทำ)
 * ไม่นับชุดทบทวน (ข้อเดิมซ้ำ) ไม่นับข้อที่ยังไม่ได้ส่ง และไม่นับข้อที่เคยได้เรียนทักษะเดียวกันในเฉลยช่วงก่อนของชุดเดียวกัน
 * usable(session) = session นี้ยังตรงกับเนื้อหาปัจจุบันไหม (ส่งมาจากหน้าจอ เพื่อไม่ให้ core อ้างถึง screens)
 */
export function weakSpots(state, usable = () => true) {
  const sessions = [];
  const seen = new Set();
  for (const session of [state.session, ...(state.history || [])]) {
    if (!session || seen.has(session.id)) continue;
    seen.add(session.id);
    sessions.push(session);
  }
  const bySubject = {};
  let used = 0;
  for (const session of sessions) {
    if (session.setId === 'practice') continue;
    const set = getSet(session.setId);
    if (!set || !usable(session)) continue;
    let counted = 0;
    for (const row of summarize(session, set).rows) {
      if (row.status === 'none' || row.exposed) continue;
      const entry = (bySubject[row.subject] ||= { id: row.subject, name: row.subjectName, n: 0, ok: 0 });
      entry.n++;
      if (row.status === 'correct') entry.ok++;
      counted++;
    }
    if (counted) used++;
  }
  const subjects = Object.values(bySubject).sort((a, b) => a.ok / a.n - b.ok / b.n || b.n - a.n);
  return { sessions: used, questions: subjects.reduce((sum, s) => sum + s.n, 0), subjects };
}

/** ข้อที่เคยตอบผิด/ไม่แน่ใจและยังไม่ตอบถูกในชุดทบทวน เรียงจากพลาดบ่อยสุด (เท่ากัน = พลาดล่าสุดก่อน) */
export function frequentMistakes(state, limit = 8) {
  const practice = getSet('practice');
  return Object.entries(state.mistakes || {})
    .map(([id, m]) => ({ id, misses: m.misses, at: m.at, item: getItem(practice, id) }))
    .filter((entry) => entry.item?.type === 'main')
    .sort((a, b) => b.misses - a.misses || b.at - a.at)
    .slice(0, limit)
    .map(({ id, misses, item }) => ({
      id,
      misses,
      subjectName: SUBJECTS[item.subject] || '',
      setTitle: SETS.find((set) => set.items.some((x) => x.id === id))?.title || '',
      prompt: item.prompt.text.replace(/\s*\n\s*/g, ' '),
    }));
}
