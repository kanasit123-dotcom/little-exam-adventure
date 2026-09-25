/* หน้าผู้ปกครอง: ตั้งค่า + สรุปผลแบบย่อ (แยกก่อนสอน/หลังสอน ฟังซ้ำ คำใบ้) — ไม่จัดอันดับ ไม่ส่งข้อมูลออก */
import { SETS, getSet } from '../content/sets/index.js';
import { summarize } from '../core/summary.js';
import { $, esc, on, confirmBox } from '../ui.js';
import { sessionUsable } from './home.js';

const STATUS = { correct: 'ถูก', incorrect: 'ยังไม่ถูก', unsure: 'ยังไม่แน่ใจ', none: 'ยังไม่ส่ง' };
const date = (ms) => (ms ? new Date(ms).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '-');

function sessionReport(session) {
  const set = getSet(session.setId);
  if (!set || !sessionUsable(session)) return '<p class="lx-small">ชุดนี้เป็นเนื้อหารุ่นเก่า แสดงสรุปไม่ได้</p>';
  const sum = summarize(session, set);
  const t = sum.totals;
  return `
    <p class="lx-lead">ส่งแล้ว ${t.submitted}/${t.questions} ข้อ · ถูก ${t.correct} · ยังไม่ถูก ${t.incorrect} · ยังไม่แน่ใจ ${t.unsure}</p>
    <p class="lx-small">คะแนนก่อนได้เรียนเฉลย: ${t.baselineCorrect}/${t.baselineTotal} (ไม่นับข้อที่ได้เรียนทักษะเดียวกันในเฉลยช่วงก่อน)</p>
    <div class="lx-table-wrap"><table class="lx-table lx-table-questions">
      <thead><tr><th>ข้อ</th><th>หมวด</th><th>ตอบครั้งแรก</th><th>ฟังโจทย์ซ้ำ</th><th>ฟังตัวเลือก</th><th>ดูเฉลย</th><th>ลองข้อใหม่</th></tr></thead>
      <tbody>${sum.rows.map((row) => `
        <tr class="lx-row-${row.status}">
          <td>${row.number}</td>
          <td>${esc(row.subjectName)}</td>
          <td>${STATUS[row.status]}${row.answerLabel ? ` (ข้อ ${row.answerLabel})` : ''}${row.exposed ? ' <em title="เคยได้เรียนทักษะนี้ในเฉลยช่วงก่อน">*เคยเรียน</em>' : ''}</td>
          <td>${row.promptReplays}</td>
          <td>${row.optionReplays}</td>
          <td>${[row.hints ? `คำใบ้ ${row.hints}` : '', row.stepsSeen ? `วิธีคิด ${row.stepsSeen} ขั้น` : '', row.helper ? `ตั้งเลข${row.helper.completed ? 'ครบ' : ''}` : ''].filter(Boolean).join(' · ') || '-'}</td>
          <td>${row.transfers.map((tr) => (tr.attempts ? (tr.firstCorrect ? 'ถูก' : 'ยังไม่ถูก') : '-')).join(', ') || '-'}</td>
        </tr>`).join('')}</tbody>
    </table></div>
    <div class="lx-subjects">${Object.values(sum.bySubject).map((s) => `<span class="lx-subject-chip">${esc(s.name)} ${s.correct}/${s.total}</span>`).join('')}</div>`;
}

export function mountParent(root, ctx) {
  const { store, signal } = ctx;
  const render = () => {
    const state = store.state;
    const st = state.settings;
    const current = state.session;
    const latest = current || state.history[0] || null;
    root.innerHTML = `
      <div class="lx-screen lx-parent">
        <main class="lx-paper">
          <h1 class="lx-h1">สำหรับผู้ปกครอง</h1>
          ${store.saveOk ? '' : '<p class="lx-warn">เครื่องนี้บันทึกข้อมูลไม่ได้ (เช่น โหมดส่วนตัว) ปิดแอปแล้วอาจทำต่อไม่ได้</p>'}
          <section class="lx-settings">
            <div class="lx-field"><label>เสียงอ่าน</label>
              <div class="lx-seg" data-key="sound"><button data-v="true" type="button">เปิด</button><button data-v="false" type="button">ปิด</button></div></div>
            <div class="lx-field"><label>ความเร็วเสียง</label>
              <div class="lx-seg" data-key="rate"><button data-v="normal" type="button">ปกติ</button><button data-v="slow" type="button">ช้าลง</button></div></div>
            <div class="lx-field"><label>หน้าจอ</label>
              <div class="lx-seg" data-key="mode"><button data-v="buddy" type="button">มีเพื่อนและฉาก</button><button data-v="plain" type="button">เรียบง่าย</button></div></div>
          </section>
          <h2 class="lx-h2">ผลล่าสุด ${latest ? `· ${esc(getSet(latest.setId)?.title || latest.setId)} · เริ่ม ${date(latest.startedAt)}${latest.abandoned ? ' (เลิกกลางคัน)' : latest.phase === 'done' ? ' (ทำครบ)' : ' (กำลังทำ)'}` : ''}</h2>
          ${latest ? sessionReport(latest) : '<p class="lx-small">ยังไม่มีผล</p>'}
          <h2 class="lx-h2">ผลรายชุด</h2>
          <div class="lx-table-wrap"><table class="lx-table lx-table-sets">
            <thead><tr><th>ชุด</th><th>ทำครบ</th><th>ครั้งล่าสุด ตอบถูก</th><th>ดีที่สุด</th></tr></thead>
            <tbody>${SETS.map((set) => {
              const p = state.progress?.[set.id];
              const score = (r) => (r ? `${r.correct}/${r.total}` : '-');
              return `<tr><td>${esc(set.title)}</td><td>${p ? `${p.completed} ครั้ง` : 'ยังไม่เคย'}</td><td>${score(p?.last)}${p ? ` <small>(${date(p.at)})</small>` : ''}</td><td>${score(p?.best)}</td></tr>`;
            }).join('')}</tbody>
          </table></div>
          ${state.history.length ? `<h2 class="lx-h2">ประวัติ</h2><ul class="lx-history">${state.history.map((h) => {
            const set = getSet(h.setId);
            const ok = set && sessionUsable(h) ? summarize(h, set).totals : null;
            return `<li>${date(h.startedAt)} · ${esc(set?.title || h.setId)} · ${h.abandoned ? 'เลิกกลางคัน' : 'ทำครบ'}${ok ? ` · ก่อนสอน ${ok.baselineCorrect}/${ok.baselineTotal}` : ''}</li>`;
          }).join('')}</ul>` : ''}
          <section class="lx-note-box">
            <p><b>เกี่ยวกับเนื้อหา:</b> โจทย์แต่งใหม่ตามแนวข้อสอบเก่าที่รวบรวมโดยสถาบันกวดวิชา ไม่ใช่ข้อสอบจริงของโรงเรียน และไม่รับรองผลสอบ</p>
            <p><b>เกี่ยวกับเสียง:</b> เสียงอ่านเป็นเสียงสังเคราะห์ (Microsoft Premwadee) ผู้ปกครองควรฟังตรวจก่อนให้เด็กใช้ ข้อมูลทั้งหมดเก็บในเครื่องนี้เท่านั้น</p>
          </section>
          <div class="lx-row">
            ${current && current.phase !== 'done' ? '<button class="lx-btn lx-btn-warn" id="lx-abandon" type="button">เลิกชุดที่ทำค้าง</button>' : ''}
            <button class="lx-btn lx-btn-go" id="lx-back" type="button">กลับหน้าแรก 🏠</button>
          </div>
        </main>
      </div>`;
    root.querySelectorAll('.lx-seg').forEach((seg) => {
      const value = String(st[seg.dataset.key]);
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === value)));
    });
  };
  render();
  on(root, 'click', async (event) => {
    const button = event.target.closest('.lx-seg button');
    if (button) {
      const key = button.parentElement.dataset.key;
      const raw = button.dataset.v;
      const value = key === 'sound' ? raw === 'true' : raw;
      store.dispatch({ type: 'settings', patch: { [key]: value } });
      render();
      return;
    }
    if (event.target.closest('#lx-back')) { ctx.go('home'); return; }
    if (event.target.closest('#lx-abandon')) {
      const ok = await confirmBox(root, { text: 'เลิกชุดที่ทำค้างใช่ไหม ผลที่ส่งแล้วจะเก็บไว้ในประวัติ', yes: 'เลิกชุดนี้', no: 'ไม่ใช่' }, signal);
      if (ok) { store.dispatch({ type: 'abandon', now: Date.now() }); render(); }
    }
  }, signal);
}
