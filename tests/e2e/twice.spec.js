// โหมดสอบจริง (ฟัง 2 รอบ): ตั้งค่าในหน้าผู้ปกครอง ไม่มีปุ่มฟังรายตัวเลือก ป้ายรอบแทนปุ่มฟัง และข้อที่ฟังครบแล้วไม่อ่านซ้ำ
import { test, expect } from '@playwright/test';
import { freshStart, startSet, noHorizontalOverflow, KEY } from './helpers.js';
import { getSet, getItem } from '../../src/content/sets/index.js';

test.beforeEach(({}, info) => test.skip(info.project.name !== 'mobile-chrome', 'ตรวจครั้งเดียวพอ'));

test('the parent can switch to the real-exam listening mode and it persists', async ({ page }) => {
  await freshStart(page);
  await page.locator('#lx-parent').click();
  await expect(page.locator('[data-key="listen"] [data-v="free"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-key="listen"] [data-v="twice"]').click();
  await page.reload();
  await page.locator('#lx-parent').click();
  await expect(page.locator('[data-key="listen"] [data-v="twice"]')).toHaveAttribute('aria-pressed', 'true');
  expect(await noHorizontalOverflow(page)).toBe(true);
});

test('twice mode with sound: no per-option listen buttons, a round badge instead of the listen button, and the teacher starts reading', async ({ page }) => {
  await freshStart(page, { sound: true, listen: 'twice' });
  await startSet(page);
  await expect(page.locator('.lx-exam')).toHaveClass(/lx-twice/);
  await expect(page.locator('.lx-say:visible')).toHaveCount(0);
  await expect(page.locator('[data-say="prompt"]')).toBeDisabled();
  await expect(page.locator('[data-say="prompt"]')).toContainText('/2');
  await expect(page.locator('#lx-next')).toHaveAttribute('aria-disabled', 'true');
  // เด็กเลือกคำตอบได้ระหว่างฟัง และครูเริ่มอ่านจริง
  await page.locator('.lx-pick').first().click();
  await expect.poll(() => page.evaluate(() => window.__lx.speaking), { timeout: 20_000 }).not.toBeNull();
});

test('twice mode: a question already read twice is not read again and the child can move on', async ({ page }) => {
  await freshStart(page, { sound: true, listen: 'twice' });
  await startSet(page);
  const set = getSet('set-01');
  await page.evaluate(([key, stim]) => {
    const state = JSON.parse(localStorage.getItem(key));
    const first = state.session.questionIds[0];
    state.session.replays[first] = { round: 2 };
    if (stim) state.session.replays[`story:${stim}`] = { round: 2 };
    localStorage.setItem(key, JSON.stringify(state));
  }, [KEY, getItem(set, set.order[0]).stimulus || null]);
  await page.reload();
  await page.locator('#lx-resume').click();
  await expect(page.locator('[data-say="prompt"]')).toContainText('2/2');
  await expect(page.locator('#lx-next')).toHaveAttribute('aria-disabled', 'false');
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__lx.speaking)).toBeNull();
  await page.locator('.lx-pick').first().click();
  await page.locator('#lx-next').click();
  await expect(page.locator('.lx-qnum')).toHaveText('2.');
});

test('the parent page has a sound test that reports how this device played the sample', async ({ page }) => {
  await freshStart(page, { sound: true });
  await page.locator('#lx-parent').click();
  await page.locator('#lx-audiotest').click();
  await expect(page.locator('#lx-audioresult')).toContainText('ผลทดสอบ', { timeout: 15_000 });
  await expect(page.locator('#lx-audioresult')).toContainText('ctx');
  expect(await noHorizontalOverflow(page)).toBe(true);
});

test('with sound off the sound test says so instead of playing', async ({ page }) => {
  await freshStart(page);
  await page.locator('#lx-parent').click();
  await page.locator('#lx-audiotest').click();
  await expect(page.locator('#lx-audioresult')).toContainText('เสียงอ่านปิดอยู่');
});
