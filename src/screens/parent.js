/* หน้าผู้ปกครอง: ตั้งค่า + สรุปผลแบบย่อ (แยกก่อนสอน/หลังสอน ฟังซ้ำ คำใบ้) — ไม่จัดอันดับ ไม่ส่งข้อมูลออก */
import { SETS, getSet } from '../content/sets/index.js';
import { summarize, weakSpots, frequentMistakes } from '../core/summary.js';
import { $, esc, on, confirmBox } from '../ui.js';
import { SAY } from '../content/copy.js';
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

const clip = (text, max = 70) => (text.length > max ? `${text.slice(0, max)}…` : text);
const LOW = 0.6;      // ต่ำกว่านี้ (และมีข้อมูลพอ) = ควรฝึกเพิ่ม
const ENOUGH = 4;     // ข้อน้อยกว่านี้ในหมวด ยังไม่ตัดสิน

/** จุดอ่อน: ความแม่นคำตอบแรกแยกหมวด + ข้อที่ยังพลาดบ่อย (คำนวณจากประวัติ ไม่ต้องเก็บข้อมูลเพิ่ม) */
function weakReport(state) {
  const { sessions, questions, subjects } = weakSpots(state, sessionUsable);
  if (!questions) return '<p class="lx-small">ยังไม่มีคำตอบที่ส่งแล้ว ทำข้อสอบสักชุด รายงานจะขึ้นที่นี่</p>';
  const low = subjects.filter((s) => s.n >= ENOUGH && s.ok / s.n < LOW);
  const mistakes = frequentMistakes(state);
  return `
    <p class="lx-small">นับ "คำตอบแรก" ก่อนได้เห็นเฉลย จากที่ส่งแล้ว ${questions} ข้อ ใน ${sessions} ชุดล่าสุด (ไม่นับชุดทบทวน)${questions < 12 ? ' · ข้อมูลยังน้อย ทำอีกสองสามชุดแล้วจะแม่นขึ้น' : ''}</p>
    <p class="lx-lead">${low.length ? `ควรฝึกเพิ่ม: <b>${low.map((s) => esc(s.name)).join(', ')}</b>` : 'ตอนนี้ยังไม่พบหมวดที่ตอบผิดมาก'}</p>
    <ul class="lx-weak">${subjects.map((s) => {
      const pct = Math.round((s.ok / s.n) * 100);
      const flagged = s.n >= ENOUGH && s.ok / s.n < LOW;
      return `<li class="lx-weak-row${flagged ? ' lx-weak-low' : ''}">
        <span class="lx-weak-name">${esc(s.name)}</span>
        <span class="lx-wbar" role="img" aria-label="${esc(s.name)} ถูก ${s.ok} จาก ${s.n} ข้อ"><i style="width:${pct}%"></i></span>
        <span class="lx-weak-num">${s.ok}/${s.n} · ${pct}%</span>
        ${flagged ? '<span class="lx-weak-flag">ควรฝึกเพิ่ม</span>' : ''}
      </li>`;
    }).join('')}</ul>
    ${mistakes.length ? `<h3 class="lx-h3">ข้อที่ยังพลาดบ่อย</h3>
      <ul class="lx-history lx-mistakes">${mistakes.map((m) => `<li><b>${esc(m.setTitle)}</b> · ${esc(m.subjectName)} · “${esc(clip(m.prompt))}” <small>พลาด ${m.misses} ครั้ง</small></li>`).join('')}</ul>
      <p class="lx-small">ฝึกซ้ำได้ที่หน้าเลือกชุด → "ทบทวนข้อที่เคยตอบผิด" (ตอบถูกแล้วข้อนั้นจะหายจากรายการ)</p>` : ''}`;
}

export function mountParent(root, ctx) {
  const { store, audio, signal } = ctx;
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
            <div class="lx-field"><label>การฟังโจทย์ในข้อสอบ</label>
              <div class="lx-seg" data-key="listen"><button data-v="free" type="button">ฟังซ้ำได้</button><button data-v="twice" type="button">แบบสอบจริง 2 รอบ</button></div></div>
            <div class="lx-field"><label>หน้าจอ</label>
              <div class="lx-seg" data-key="mode"><button data-v="buddy" type="button">มีเพื่อนและฉาก</button><button data-v="plain" type="button">เรียบง่าย</button></div></div>
          </section>
          <div class="lx-row lx-row-left"><button class="lx-btn lx-btn-soft" id="lx-audiotest" type="button">🔊 ทดสอบเสียงของเครื่องนี้</button></div>
          <p class="lx-small lx-pre" id="lx-audioresult" aria-live="polite"></p>
          <p class="lx-small">แบบสอบจริง 2 รอบ: เหมือนห้องสอบที่ครูอ่านโจทย์ให้ฟังแค่ 2 รอบ — เกมอ่านโจทย์พร้อมตัวเลือกให้ฟัง 2 รอบเอง (เรื่องที่ใช้ร่วมกันอ่าน 2 รอบก่อนข้อแรก) แล้วฟังซ้ำไม่ได้ ต้องอ่านตัวหนังสือในโจทย์ช่วย ส่วนหน้าเฉลยฟังซ้ำได้ตามปกติ</p>
          <div class="lx-row"><button class="lx-btn lx-btn-soft" id="lx-answers" type="button">📋 ตรวจเฉลยทุกข้อของแต่ละชุด</button></div>
          <h2 class="lx-h2">จุดที่ควรฝึกเพิ่ม</h2>
          ${weakReport(state)}
          <h2 class="lx-h2">ผลล่าสุด ${latest ? `· ${esc(getSet(latest.setId)?.title || latest.setId)} · เริ่ม ${date(latest.startedAt)}${latest.abandoned ? ' (เลิกกลางคัน)' : latest.phase === 'done' ? ' (ทำครบ)' : ' (กำลังทำ)'}` : ''}</h2>
          ${latest ? sessionReport(latest) : '<p class="lx-small">ยังไม่มีผล</p>'}
          <h2 class="lx-h2">ผลรายชุด</h2>
          <p class="lx-small">ข้อที่ควรทบทวน (เคยตอบผิดหรือยังไม่แน่ใจ): ${Object.keys(state.mistakes || {}).length} ข้อ</p>
          <div class="lx-table-wrap"><table class="lx-table lx-table-sets">
            <thead><tr><th>ชุด</th><th>ทำครบ</th><th>ครั้งล่าสุด ตอบถูก</th><th>ดีที่สุด</th></tr></thead>
            <tbody>${[...SETS, getSet('mock')].map((set) => {
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
    if (event.target.closest('#lx-answers')) { ctx.go('answers'); return; }
    if (event.target.closest('#lx-audiotest')) {
      const out = $(root, '#lx-audioresult');
      if (!store.state.settings.sound) { out.textContent = 'เสียงอ่านปิดอยู่ในการตั้งค่า (เปิดที่ "เสียงอ่าน" ด้านบนก่อน)'; return; }
      audio.unlock();
      out.textContent = 'กำลังเล่นเสียงทดสอบ…';
      const result = await audio.play({ text: SAY.welcome, role: 'ui' });
      const d = audio.diagnose();
      const detail = `ผลทดสอบ: ${result.status}${result.via ? ` · ${result.via}` : ''} · ctx ${d.context} · ${d.sampleRate ?? '-'} Hz · session ${d.audioSession} · ctx#${d.contexts}${d.lastError ? ` · ${d.lastError}` : ''}`;
      const advice = result.status === 'done' && result.via === 'clip'
        ? 'เล่นเสียงที่อัดไว้แล้ว ถ้าได้ยิน ถือว่าปกติ ถ้าไม่ได้ยินเลย ให้เปิดเสียงเครื่อง (ปุ่มด้านข้าง หรือปุ่มกระดิ่งในศูนย์ควบคุม) แล้วเพิ่มระดับเสียง จากนั้นกดทดสอบใหม่'
        : result.status === 'done'
          ? 'เล่นด้วยเสียงของเครื่อง (ไม่ใช่เสียงที่อัดไว้) เสียงอาจต่างจากปกติ'
          : 'เล่นเสียงไม่ได้ — ส่งบรรทัดผลทดสอบด้านล่างให้ผู้ช่วยดู';
      out.textContent = `${advice}\n${detail}`;
      return;
    }
    if (event.target.closest('#lx-abandon')) {
      const ok = await confirmBox(root, { text: 'เลิกชุดที่ทำค้างใช่ไหม ผลที่ส่งแล้วจะเก็บไว้ในประวัติ', yes: 'เลิกชุดนี้', no: 'ไม่ใช่' }, signal);
      if (ok) { store.dispatch({ type: 'abandon', now: Date.now() }); render(); }
    }
  }, signal);
}
