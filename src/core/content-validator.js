const SUBJECTS = new Set(['thai', 'english', 'math']);
const KINDS = new Set(['choice', 'listen-choice', 'picture-choice', 'count-choice', 'compare-choice', 'column-choice']);

export function validateQuestion(question) {
  const errors = [];
  if (!question?.id) errors.push('missing id');
  if (!SUBJECTS.has(question?.subject)) errors.push(`${question?.id || '?'}: invalid subject`);
  if (!KINDS.has(question?.kind)) errors.push(`${question?.id || '?'}: invalid kind`);
  if (!question?.promptText || !question?.promptSpeech) errors.push(`${question?.id || '?'}: missing prompt`);
  if (!Array.isArray(question?.options) || question.options.length < 2) errors.push(`${question?.id || '?'}: needs options`);
  const optionIds = new Set((question?.options || []).map((option) => option.id));
  if (optionIds.size !== (question?.options || []).length) errors.push(`${question?.id || '?'}: duplicate option id`);
  if (!optionIds.has(question?.correctOptionId)) errors.push(`${question?.id || '?'}: correct option is absent`);
  if (!question?.review?.summary || !Array.isArray(question?.review?.steps) || question.review.steps.length < 2) {
    errors.push(`${question?.id || '?'}: review needs summary and at least two steps`);
  }
  for (const forbidden of ['hint', 'feedback', 'explanation']) {
    if (forbidden in (question || {})) errors.push(`${question?.id || '?'}: ${forbidden} must stay inside review`);
  }
  return errors;
}

export function validateQuestionSet(questions) {
  const errors = [];
  if (!Array.isArray(questions) || questions.length !== 12) errors.push('vertical slice must contain exactly 12 questions');
  const ids = new Set();
  for (const question of questions || []) {
    if (ids.has(question.id)) errors.push(`duplicate question id: ${question.id}`);
    ids.add(question.id);
    errors.push(...validateQuestion(question));
  }
  return { ok: errors.length === 0, errors };
}

