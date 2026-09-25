import { test, expect } from '@playwright/test';
import { getSet } from '../../src/content/sets/index.js';
import { KEY, freshStart, startSet, answerAndSubmitBlock, noHorizontalOverflow } from './helpers.js';

const set = getSet('set-01');
const secrets = set.items.flatMap((item) => [item.review.summary, ...item.review.hints, ...item.review.steps])
  .filter((text) => !set.items.some((item) => item.options.some((o) => o.text === text)));

test('full session 5 + 5 + 2: review each block, skip break, reward once, other game data untouched', async ({ page }) => {
  const missing = [];
  page.on('response', (r) => { if (r.status() >= 400) missing.push(`${r.status()} ${r.url()}`); });
  await freshStart(page, { others: { 'lilly-world-v1': '{"stars":7}' } });
  await startSet(page);
  for (let block = 1; block <= 3; block++) {
    await expect(page.locator('#lx-block-title')).toHaveText(`ช่วงที่ ${block} จาก 3`);
    await answerAndSubmitBlock(page, (n) => (n === 3 ? 'unsure' : n % 3));
    await expect(page.locator('.lx-bar-title').first()).toHaveText(`เฉลยช่วงที่ ${block}`);
    // ทุกข้อในช่วงที่ส่งแล้วเปิดดูได้ รวมข้อที่ตอบถูก
    const dots = page.locator('#lx-rdots .lx-dot');
    expect(await dots.count()).toBe(block === 3 ? 2 : 5);
    await page.locator('#lx-rdone').click();
    if (block < 3) {
      await expect(page.locator('#lx-continue')).toBeVisible();
      await page.locator('#lx-continue').click();
    }
  }
  await expect(page.locator('.lx-reward')).toBeVisible();
  await page.locator('[data-sticker="sticker-bow"]').click();
  await expect(page.locator('#lx-home')).toBeVisible();
  await page.reload();
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY);
  expect(stored.rewards.stars).toBe(1);
  expect(stored.rewards.stickers).toEqual(['sticker-bow']);
  expect(stored.history).toHaveLength(1);
  expect(await page.evaluate(() => localStorage.getItem('lilly-world-v1'))).toBe('{"stars":7}');
  expect(missing).toEqual([]);
  // หน้าเลือกชุดจำผลของชุดนี้ไว้
  await page.goto('/');
  await page.locator('#lx-sets').click();
  const card = page.locator('[data-set="set-01"]');
  await expect(card).toContainText('ทำครบแล้ว 1 ครั้ง');
  await expect(card).toContainText(`ครั้งล่าสุดตอบถูก ${stored.progress['set-01'].last.correct}/12`);
  await expect(card).toContainText('ทำอีกครั้ง');
});

test('set picker: a set in progress shows its answered count and resumes where it stopped', async ({ page }) => {
  await freshStart(page);
  await startSet(page);
  await page.locator('.lx-pick').first().click();
  await page.locator('#lx-next').click();
  await page.goto('/');
  await page.locator('#lx-sets').click();
  const card = page.locator('[data-set="set-01"]');
  await expect(card).toContainText('กำลังทำ · ตอบแล้ว 1/12');
  await card.click();
  await expect(page.locator('.lx-qnum')).toHaveText('2.');
});

test('exam view has no answer, hint or review data in DOM, aria or data attributes', async ({ page }) => {
  await freshStart(page);
  await startSet(page);
  for (let i = 0; i < 5; i++) {
    // ตรวจเฉพาะส่วนแอป (โหมด dev ของ Vite ใส่ CSS ทั้งไฟล์ไว้ใน <style> ซึ่งมีชื่อ class ของหน้าเฉลย)
    const html = await page.locator('#app').innerHTML();
    for (const text of secrets) expect(html.includes(text), text).toBe(false);
    expect(html).not.toMatch(/correct|lx-is-correct|คำตอบที่ถูก|คำใบ้|วิธีคิด|ตัวช่วยคิด/);
    const dataAttrs = await page.evaluate(() => [...new Set([...document.querySelectorAll('#app *')].flatMap((el) => el.getAttributeNames().filter((n) => n.startsWith('data-') || n.startsWith('aria-'))))]);
    expect(dataAttrs.every((a) => ['data-go', 'data-i', 'data-say', 'aria-pressed', 'aria-label', 'aria-disabled', 'aria-hidden', 'aria-live'].includes(a)), dataAttrs.join()).toBe(true);
    const labels = await page.evaluate(() => [...document.querySelectorAll('#app [aria-label]')].map((el) => el.getAttribute('aria-label')).join('|'));
    expect(labels).not.toMatch(/ถูก|ผิด|correct/);
    await page.locator('.lx-pick').first().click();
    if (i < 4) await page.locator('#lx-next').click();
  }
});

test('choosing gives no feedback and does not move on; listening to an option never selects it', async ({ page }) => {
  await freshStart(page);
  await startSet(page);
  const before = await page.locator('.lx-paper').innerHTML();
  await page.locator('.lx-say').nth(1).click();
  await expect(page.locator('.lx-pick[aria-pressed="true"]')).toHaveCount(0);
  await page.locator('.lx-pick').nth(2).click();
  await expect(page.locator('.lx-pick').nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.lx-qnum')).toHaveText('1.');
  const after = await page.locator('.lx-paper').innerHTML();
  // สิ่งที่เปลี่ยนมีแค่สถานะ "เลือกแล้ว" ของกล่องที่แตะ
  expect(after.replace(/ lx-picked|aria-pressed="(true|false)"/g, '')).toBe(before.replace(/ lx-picked|aria-pressed="(true|false)"/g, ''));
  await page.locator('#lx-unsure').click();
  await expect(page.locator('#lx-unsure')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.lx-pick[aria-pressed="true"]')).toHaveCount(0);
});

test('cannot submit a block with unanswered questions; review is closed until submission', async ({ page }) => {
  await freshStart(page);
  await startSet(page);
  for (let i = 0; i < 4; i++) await page.locator('#lx-next').click();
  await expect(page.locator('#lx-next')).toHaveText(/ส่งคำตอบ/);
  await page.locator('#lx-next').click();
  await expect(page.locator('#lx-note')).toContainText('ยังไม่ได้ตอบข้อ 1, 2, 3, 4, 5');
  await expect(page.locator('.lx-review')).toHaveCount(0);
  await expect(page.locator('#lx-send')).toHaveCount(0);
});

test('resume after reload keeps question, selection and order; submitted answers stay frozen', async ({ page }) => {
  await freshStart(page);
  await startSet(page);
  await page.locator('.lx-pick').nth(1).click();
  await page.locator('#lx-next').click();
  await page.locator('.lx-pick').nth(2).click();
  await page.reload();
  await page.locator('#lx-resume').click();
  await expect(page.locator('.lx-qnum')).toHaveText('2.');
  await expect(page.locator('.lx-pick').nth(2)).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#lx-prev').click();
  await expect(page.locator('.lx-pick').nth(1)).toHaveAttribute('aria-pressed', 'true');
  await answerAndSubmitBlock(page, () => 0);
  // หลังส่ง กลับหน้าแรกแล้วทำต่อ → ยังอยู่หน้าเฉลย แก้คำตอบไม่ได้
  await page.reload();
  await page.locator('#lx-resume').click();
  await expect(page.locator('.lx-review')).toBeVisible();
  await expect(page.locator('.lx-review .lx-pick:not(.lx-static)')).toHaveCount(0);
});

test('review shows your answer, the correct answer, steps, the column helper and a separate try-again question', async ({ page }) => {
  await freshStart(page);
  await startSet(page);
  for (let block = 1; block <= 2; block++) {
    await answerAndSubmitBlock(page, () => 0);
    await page.locator('#lx-rdone').click();
    await page.locator('#lx-continue').click();
  }
  await answerAndSubmitBlock(page, () => 0);   // ข้อ 11 ตอบ 14 (ไม่ถูก), ข้อ 12 ตอบ 7 (ถูก)
  await expect(page.locator('.lx-status')).toContainText('หนูตอบข้อ 1 · คำตอบที่ถูกคือข้อ 2');
  await expect(page.locator('.lx-is-correct')).toContainText('15 ชิ้น');
  await page.locator('[data-tool="steps"]').click();
  await expect(page.locator('.lx-step')).toHaveCount(3);
  await page.locator('[data-tool="column"]').click();
  const col = page.locator('.lx-col');
  await expect(col.locator('.lx-cell.lx-digit')).toHaveText(['8', '7']);   // ไม่มี 08 / 07
  await col.locator('.lx-key[data-k="1"]').click();
  await col.locator('.lx-key[data-k="5"]').click();
  await expect(col.locator('.lx-aid-title')).toHaveText('8 + 7 = 15');
  await col.locator('.lx-cell.lx-slot.lx-pulse').click();                   // เขียน 5
  await col.locator('.lx-cell.lx-carry.lx-pulse').click();                  // ทด 1
  await col.locator('.lx-cell.lx-slot.lx-pulse').click();                   // ยกลงมา 1
  await expect(col.locator('.lx-col-eq')).toContainText('15');
  await page.locator('[data-tool="transfer"]').click();
  await page.locator('[data-ti="1"]').click();                              // 9 + 4 = 13 → ข้อ 2
  await expect(page.locator('#lx-tresult .lx-status')).toContainText('ถูกต้อง');
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY);
  const s = stored.session;
  expect(s.submitted[2].answers['m-shells-add']).toBe('a');                // คำตอบแรกไม่เปลี่ยน
  expect(s.transfers['m-add-pencils-t'].attempts[0].correct).toBe(true);
  expect(s.review.helper['m-shells-add'].opened).toBe(1);
  // borrow: ข้อ 12 (12 − 5)
  await page.locator('#lx-rdots [data-go="1"]').click();
  await page.locator('[data-tool="column"]').click();
  await expect(page.locator('.lx-col .lx-cell.lx-digit.lx-pulse')).toHaveText('1');
  await page.locator('.lx-col .lx-cell.lx-digit.lx-pulse').click();
  await expect(page.locator('.lx-col .lx-cell.lx-carry').nth(1)).toHaveText('12');
});

test('with sound on, "next" waits for the question to be read (or the child to use a listen button)', async ({ page }) => {
  await freshStart(page, { sound: true });
  await startSet(page);
  await expect(page.locator('#lx-next')).toHaveAttribute('aria-disabled', 'true');
  await page.locator('#lx-next').click({ force: true });   // เด็กกดขณะยังอ่านไม่จบ
  await expect(page.locator('.lx-qnum')).toHaveText('1.');
  await expect(page.locator('#lx-note')).toContainText('ฟังโจทย์ให้จบก่อน');
  await page.locator('[data-say="prompt"]').click();
  await expect(page.locator('#lx-next')).toHaveAttribute('aria-disabled', 'false');
});

test('parent page shows first-answer results and settings persist', async ({ page }) => {
  await freshStart(page);
  await startSet(page);
  await answerAndSubmitBlock(page, (n) => (n === 2 ? 'unsure' : 1));
  await page.goto('/');
  await page.locator('#lx-parent').click();
  await expect(page.locator('.lx-table-questions tbody tr')).toHaveCount(12);
  await expect(page.locator('.lx-table-questions')).toContainText('ยังไม่แน่ใจ');
  await page.locator('[data-key="rate"] [data-v="slow"]').click();
  await page.locator('[data-key="mode"] [data-v="plain"]').click();
  await page.reload();
  await page.locator('#lx-parent').click();
  await expect(page.locator('[data-key="rate"] [data-v="slow"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('body')).toHaveClass(/lx-plain/);
  expect(await noHorizontalOverflow(page)).toBe(true);
});

test('corrupt save shows a notice and keeps other keys', async ({ page }) => {
  await page.goto('/');
  await page.evaluate((key) => { localStorage.setItem(key, '{oops'); localStorage.setItem('lilly-world-v1', 'keep'); }, KEY);
  await page.reload();
  await expect(page.locator('.lx-warn')).toContainText('อ่านไม่ได้');
  expect(await page.evaluate(() => localStorage.getItem('lilly-world-v1'))).toBe('keep');
});
