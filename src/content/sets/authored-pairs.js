// Content-only helpers for sets 41 onward; the engine still receives the existing schema.
export const words = (...texts) => texts.map((text, index) => ({ id: 'abcd'[index], text }));
export const figures = (...values) => values.map((figure, index) => ({ id: 'abcd'[index], svg: { figure }, speech: '' }));
export const image = (asset) => ({ type: 'image', asset: `pic-${asset}` });
export const row = (...assets) => ({ type: 'row', items: assets.map((asset) => `pic-${asset}`) });
export const sequence = (kind, steps) => ({ type: 'row', labels: true, items: steps.map((n) => `pic-seq-${kind}-${n}`) });
export const labels = (...texts) => texts.map((text, index) => ({ id: 'abc'[index], text, speech: text.replace(/[กขคง]/g, (c) => ({ ก: 'กอ', ข: 'ขอ', ค: 'คอ', ง: 'งอ' })[c]) }));

export function pair(setNumber, key, subject, skill, main, transfer) {
  const id = `s${setNumber}-${key}`;
  return [main, transfer].map((data, index) => {
    const options = data.options || words(...data.choices);
    const answer = options[data.answer - 1];
    if (!answer || data.steps.length < 2) throw new Error(`${id}: invalid answer or explanation`);
    return {
      id: index ? `${id}-t` : id,
      type: index ? 'transfer' : 'main',
      subject, skillIds: [skill], familyId: skill, difficulty: data.difficulty || 2,
      sourceId: 'src-a24-compilation', provenance: 'original',
      rights: 'แต่งข้อความ ตัวเลข และตัวเลือกใหม่ ใช้รูปของโปรเจกต์ ไม่คัดลอกข้อสอบ',
      reviewStatus: 'draft',
      narration: data.narration || (options.every((option) => option.svg || option.image)
        ? 'อ่านเฉพาะหมายเลขตัวเลือก ไม่บอกลักษณะภาพหรือเฉลย'
        : 'อ่านโจทย์และตัวเลือกได้ ไม่อ่านคำใบ้หรือวิธีคิดระหว่างสอบ'),
      ...(data.stimulus ? { stimulus: data.stimulus } : {}),
      ...(data.visual ? { visual: data.visual } : {}),
      ...(data.compact ? { compact: true } : {}),
      // The existing picture layout reserves space above the figure for its listen button.
      ...(data.scene || options.every((option) => option.svg) ? { scene: true } : {}),
      prompt: { text: data.prompt, ...(data.speech ? { speech: data.speech } : {}) },
      options, correctOptionId: answer.id,
      review: {
        summary: data.steps[0], hints: [data.hint],
        steps: [...data.steps, `ตอบข้อ ${data.answer}`],
        ...(data.column ? { column: data.column } : {}),
        ...(!index ? { transferIds: [`${id}-t`] } : {}),
      },
    };
  });
}

export function defineSet(number, note, stimuli, pairs) {
  return {
    id: `set-${number}`, version: 1, title: `ชุดที่ ${number}`, note, stimuli,
    order: pairs.map(([main]) => main.id), items: pairs.flat(),
  };
}
