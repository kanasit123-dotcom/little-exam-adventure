/*
 * ตั้งบวก/ตั้งลบแนวตั้งสำหรับหน้าเฉลย — logic ล้วน ทดสอบด้วย node --test
 * normalizeProblem / layout / buildSteps คัดลอกจาก happy-little-kitchen/js/shop/column.js
 * (ซึ่งปรับจาก game-lilly/js/games/column.js ให้ใช้โจทย์คงที่และไม่มีศูนย์นำหน้า เช่น 08, 07)
 * คัดลอกมา ไม่ได้ import ข้าม repo
 */
export const MINUS = '−';

export function normalizeProblem({ a, op, b }) {
  const sign = op === '+' ? '+' : MINUS;
  const result = sign === '+' ? a + b : a - b;
  if (![a, b].every((n) => Number.isInteger(n) && n >= 0 && n <= 99) || result < 0 || result > 99) throw new Error(`unsupported problem ${a} ${op} ${b}`);
  return { a, op: sign, b, result };
}

const split = (n) => ({ t: Math.floor(n / 10), u: n % 10 });

// หน้าตาตาราง: ช่องไหนมีเลข ช่องไหนเว้นว่าง (ไม่แสดง 0 หน้าเลขหลักเดียว)
export function layout(problem) {
  const p = normalizeProblem(problem);
  return {
    ...p,
    top: split(p.a),
    bottom: split(p.b),
    showTopTens: p.a >= 10,
    showBottomTens: p.b >= 10,
    showAnswerTens: p.result >= 10,
  };
}

// ขั้นตอนทีละหลัก แบบที่สอนในโรงเรียน: หน่วยก่อน สิบทีหลัง
// ask = ถามให้กดตัวเลข, write = แตะช่องเพื่อเขียน, borrow = แตะเลขหลักสิบเพื่อยืม, zero = หลักสิบเหลือ 0 ไม่ต้องเขียน
export function buildSteps(problem) {
  const p = normalizeProblem(problem);
  const top = split(p.a);
  const bottom = split(p.b);
  const steps = [];
  if (p.op === '+') {
    const sumU = top.u + bottom.u;
    steps.push({ type: 'ask', col: 'units', terms: [top.u, bottom.u], op: '+', answer: sumU });
    const carry = sumU >= 10 ? 1 : 0;
    if (carry) {
      steps.push({ type: 'write', col: 'units', slot: 'answer', value: sumU % 10, why: 'bundle', sum: sumU });
      steps.push({ type: 'write', col: 'tens', slot: 'carry', value: 1, why: 'carry' });
    } else {
      steps.push({ type: 'write', col: 'units', slot: 'answer', value: sumU, why: 'write' });
    }
    const terms = [carry, top.t, bottom.t].filter((n) => n > 0);
    const sumT = terms.reduce((sum, n) => sum + n, 0);
    if (!sumT) return steps;
    if (terms.length === 1) {
      // มีตัวเดียวในหลักสิบ: ยกลงมาเลย (8 + 7 → ทด 1 ยกลงมาเป็น 1, ไม่ถาม 1 + 0)
      steps.push({ type: 'write', col: 'tens', slot: 'answer', value: sumT, why: carry ? 'carryDown' : 'bring' });
      return steps;
    }
    steps.push({ type: 'ask', col: 'tens', terms, op: '+', answer: sumT });
    steps.push({ type: 'write', col: 'tens', slot: 'answer', value: sumT, why: 'write' });
    return steps;
  }
  const borrow = top.u < bottom.u;
  if (borrow) steps.push({ type: 'borrow', from: top.t, to: top.t - 1, units: top.u + 10, u: top.u, need: bottom.u });
  const topU = borrow ? top.u + 10 : top.u;
  const topT = borrow ? top.t - 1 : top.t;
  steps.push({ type: 'ask', col: 'units', terms: [topU, bottom.u], op: MINUS, answer: topU - bottom.u });
  steps.push({ type: 'write', col: 'units', slot: 'answer', value: topU - bottom.u, why: 'write' });
  const diffT = topT - bottom.t;
  if (diffT === 0) {
    // 12 − 5, 20 − 13: หลักสิบเหลือ 0 → ไม่เขียน 0 ข้างหน้า
    if (p.a >= 10) steps.push({ type: 'zero', terms: [topT, bottom.t] });
    return steps;
  }
  if (bottom.t === 0) {
    steps.push({ type: 'write', col: 'tens', slot: 'answer', value: topT, why: 'bring' });
    return steps;
  }
  steps.push({ type: 'ask', col: 'tens', terms: [topT, bottom.t], op: MINUS, answer: diffT });
  steps.push({ type: 'write', col: 'tens', slot: 'answer', value: diffT, why: 'write' });
  return steps;
}

// ---------------------------------------------------------------- ข้อความและเสียงของแต่ละขั้น
// ทุกประโยคที่พูดออกมาผลิตจากฟังก์ชันนี้ที่เดียว — scripts/voice-texts.mjs ใช้ฟังก์ชันเดียวกันเพื่ออัดเสียงให้ครบ
const word = (op) => (op === '+' ? 'บวก' : 'ลบ');
const COL = { units: 'หลักหน่วย', tens: 'หลักสิบ' };

export const COLUMN_PHRASES = {
  tryAgain: 'ลองอีกทีนะ',
  glowKey: 'กดเลขที่เรืองแสงนะ',
  start: 'มาตั้งเลขกัน เริ่มจากหลักหน่วยก่อนนะ',
};

/** ข้อความบนจอ (text) และประโยคที่อ่าน (speech) ของทุกขั้น + สรุปท้ายข้อ */
export function columnScript(problem) {
  const p = normalizeProblem(problem);
  const L = layout(problem);
  const steps = buildSteps(problem).map((step) => {
    if (step.type === 'ask') {
      const shown = step.terms.join(` ${step.op} `);
      return { ...step, text: `${COL[step.col]}: ${shown} = ?`, speech: `${COL[step.col]} ${step.terms.join(` ${word(step.op)} `)} เท่ากับเท่าไร` };
    }
    if (step.type === 'borrow') {
      const text = `${step.u} ลบ ${step.need} ไม่พอ ต้องยืมหนึ่งสิบ แตะเลขหลักสิบ`;
      return { ...step, text, speech: text, after: `ยืมหนึ่งสิบ หลักหน่วยจึงเป็น ${step.units}` };
    }
    if (step.type === 'zero') {
      const text = 'หลักสิบเหลือศูนย์ ไม่ต้องเขียน';
      return { ...step, text, speech: text };
    }
    let text = `แตะช่องเขียน ${step.value}`;
    if (step.why === 'bundle') text = `ครบสิบแล้ว มัดเป็นหนึ่งสิบ แตะช่องเขียน ${step.value}`;
    else if (step.why === 'carry') text = 'แตะช่องทดข้างบน ทดหนึ่ง';
    else if (step.why === 'carryDown') text = 'ทดหนึ่ง ยกลงมาเป็นหนึ่ง แตะช่องหลักสิบ';
    else if (step.why === 'bring') text = `หลักสิบไม่มีอะไร${word(p.op)} ยก ${step.value} ลงมาเลย`;
    return { ...step, text, speech: text };
  });
  const au = L.top.u;
  const bu = L.bottom.u;
  const recap = steps.filter((st) => st.type === 'ask').map((st) => `${COL[st.col]} ${st.terms.join(` ${st.op} `)} = ${st.answer}`);
  if (p.op === '+' && au + bu >= 10) recap.splice(1, 0, `${au + bu} คือ 1 สิบ กับ ${(au + bu) % 10} หน่วย เขียน ${(au + bu) % 10} ทด 1`);
  if (p.op !== '+' && au < bu) recap.unshift(`${au} ลบ ${bu} ไม่พอ ยืม 1 สิบ มาเป็น ${au + 10}`);
  const finalSpeech = `${p.a} ${word(p.op)} ${p.b} เท่ากับ ${p.result}`;
  return { problem: p, layout: L, steps, recap, finalSpeech };
}

/** ทุกประโยคที่ตัวช่วยตั้งเลขอาจพูด (ใช้สร้างรายการอัดเสียง) */
export function columnSpeeches(problem) {
  const script = columnScript(problem);
  const out = [script.finalSpeech, ...Object.values(COLUMN_PHRASES)];
  for (const step of script.steps) {
    out.push(step.speech);
    if (step.after) out.push(step.after);
  }
  return out;
}
