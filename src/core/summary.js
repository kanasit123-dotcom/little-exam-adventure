/*
 * สรุปผลสำหรับผู้ปกครอง — แยกคำตอบครั้งแรก (ก่อนสอน) กับผลหลังเรียน (โจทย์ลองใหม่)
 * ไม่ตีความจำนวนการฟังซ้ำว่าเข้าใจหรือไม่เข้าใจ แค่รายงานตัวเลข
 */
import { getItem, OPTION_LABELS, SUBJECTS } from '../content/sets/index.js';
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
