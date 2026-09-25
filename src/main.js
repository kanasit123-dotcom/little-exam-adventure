import { VERTICAL_SLICE_12 } from './content/vertical-slice-12.js';
import { validateQuestionSet } from './core/content-validator.js';

const report = validateQuestionSet(VERTICAL_SLICE_12);
const subjects = Object.entries(
  VERTICAL_SLICE_12.reduce((counts, item) => {
    counts[item.subject] = (counts[item.subject] || 0) + 1;
    return counts;
  }, {}),
);

document.querySelector('#app').innerHTML = `
  <section class="scaffold" aria-labelledby="page-title">
    <p class="eyebrow">Repository scaffold</p>
    <h1 id="page-title">Little Exam Adventure</h1>
    <p class="lead">โครงพร้อมสำหรับพัฒนา Vertical Slice เกมเตรียมสอบ 12 ข้อ</p>
    <dl class="summary">
      <div><dt>เนื้อหา</dt><dd>${VERTICAL_SLICE_12.length} ข้อ</dd></div>
      <div><dt>หมวด</dt><dd>${subjects.map(([name, count]) => `${name} ${count}`).join(' / ')}</dd></div>
      <div><dt>Schema</dt><dd class="${report.ok ? 'ready' : 'blocked'}">${report.ok ? 'ผ่าน' : 'ต้องแก้'}</dd></div>
    </dl>
    <div class="next-work">
      <h2>จุดเริ่มงาน</h2>
      <p>อ่าน <code>AI-HANDOFF.md</code> แล้วทำ Phase 1 ตาม <code>PROJECT-PLAN.md</code></p>
    </div>
  </section>`;

