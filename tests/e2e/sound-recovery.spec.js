// iPad Safari: ล็อกจอแล้วกลับมา เสียงอาจเงียบทั้งหน้า (ผู้ปกครองเจอ 2026-10-03) — จำลองนาฬิกาเสียงค้างแล้วดูว่าหน้ารีเฟรชเองและกลับไปข้อเดิม
import { test, expect } from '@playwright/test';
import { freshStart, startSet } from './helpers.js';

test.beforeEach(({}, info) => test.skip(info.project.name !== 'mobile-chrome', 'ทดสอบครั้งเดียวพอ'));

async function lockAndReturn(page) {
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

test.beforeEach(async ({ page }) => {
  // ห่อ AudioContext ให้ทำนาฬิกาค้างได้เหมือน iPad หลังล็อกจอ
  await page.addInitScript(() => {
    const Real = window.AudioContext;
    window.AudioContext = class extends Real {
      get currentTime() { return window.__freezeAudio ? 0 : super.currentTime; }
    };
  });
});

test('sound that still works after returning does not reload the page', async ({ page }) => {
  await freshStart(page, { sound: true });
  await startSet(page, 'set-12');
  await page.evaluate(() => { window.__notReloaded = true; });
  await lockAndReturn(page);
  await page.locator('.lx-qnum').click();
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__notReloaded)).toBe(true);
});

test('a silent audio clock after returning reloads the page once and goes back to the same question', async ({ page }) => {
  await freshStart(page, { sound: true });
  await startSet(page, 'set-12');
  await page.locator('.lx-pick').first().click();
  await page.locator('#lx-next').click();
  const qn = await page.locator('.lx-qnum').textContent();
  await page.evaluate(() => { window.__freezeAudio = true; });
  await lockAndReturn(page);
  const reloaded = page.waitForEvent('load', { timeout: 5000 });
  await page.locator('.lx-qnum').click();
  await reloaded;
  await page.locator('.lx-pick').first().waitFor();
  expect(await page.evaluate(() => window.__lx.view)).toBe('play');
  await expect(page.locator('.lx-qnum')).toHaveText(qn);
  // ภายใน 1 นาทีจะไม่รีเฟรชซ้ำแม้ยังเงียบ (กันวนซ้ำ) — ใช้เสียงเครื่องแทน
  await page.evaluate(() => { window.__freezeAudio = true; window.__notReloaded = true; });
  await lockAndReturn(page);
  await page.locator('.lx-qnum').click();
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.__notReloaded)).toBe(true);
});
