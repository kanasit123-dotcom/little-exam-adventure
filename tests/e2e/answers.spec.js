// หน้าตรวจเฉลยของผู้ปกครอง: ทุกชุดแสดงครบทุกข้อ ทุกข้อมีเฉลยเดียวและตรงกับข้อมูล รูปโหลดครบ ไม่ล้นจอ ปุ่มกดได้
import { test, expect } from '@playwright/test';
import { freshStart, startSet, answerAndSubmitBlock, noHorizontalOverflow } from './helpers.js';
import { SETS, OPTION_LABELS } from '../../src/content/sets/index.js';

test.beforeEach(({}, info) => test.skip(info.project.name !== 'mobile-chrome', 'ตรวจครั้งเดียวพอ'));

async function openAnswers(page) {
  await freshStart(page);
  await page.locator('#lx-parent').click();
  await page.locator('#lx-answers').click();
  await page.locator('.lx-ak-card').first().waitFor();
}

test('answer key: every set lists all questions with the right answer marked', async ({ page }) => {
  test.setTimeout(120_000);
  await openAnswers(page);
  for (const set of SETS) {
    await page.locator(`[data-set="${set.id}"]`).click();
    await expect(page.locator('.lx-ak-card'), set.id).toHaveCount(set.order.length);
    const shown = await page.evaluate(() => ({
      answers: [...document.querySelectorAll('.lx-ak-card .lx-ak-ans')].map((el) => el.textContent.trim()),
      marks: [...document.querySelectorAll('.lx-ak-options')].map((group) => group.querySelectorAll('.lx-is-correct').length),
      keyStrip: [...document.querySelectorAll('.lx-ak-key')].map((el) => el.querySelector('span').textContent.trim()),
    }));
    const expected = set.order.map((id) => {
      const item = set.items.find((x) => x.id === id);
      return OPTION_LABELS[item.options.findIndex((o) => o.id === item.correctOptionId)];
    });
    expect(shown.answers, `${set.id} answer badges`).toEqual(expected.map((label) => `เฉลย: ข้อ ${label}`));
    expect(shown.keyStrip, `${set.id} quick key`).toEqual(expected);
    expect(shown.marks.every((n) => n === 1), `${set.id} exactly one marked option per question (incl. practice questions)`).toBe(true);
    const transfers = set.items.filter((x) => x.type === 'transfer').length;
    expect(shown.marks.length, `${set.id} option groups`).toBe(set.order.length + transfers);
    await page.waitForTimeout(150);
    const broken = await page.evaluate(() => [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src));
    expect(broken, `${set.id} broken images`).toEqual([]);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 700 });
      expect(await noHorizontalOverflow(page), `${set.id} overflows at ${width}`).toBe(true);
    }
  }
});

test('answer key: reachable from the parent page, jump keys work, back returns', async ({ page }) => {
  await openAnswers(page);
  const small = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.offsetParent && (b.offsetHeight < 44 || b.offsetWidth < 44)).map((b) => b.textContent.trim().slice(0, 20)));
  expect(small, 'small buttons').toEqual([]);
  // เปิดที่ชุดแรกที่ผู้ปกครองยังไม่ได้ตรวจ (ชุด 1 ตรวจแล้ว)
  await expect(page.locator('#lx-ak-body h2')).toHaveText('ชุดที่ 2');
  await page.locator('[data-jump]').nth(5).click();
  const top = await page.evaluate(() => document.querySelectorAll('.lx-ak-card')[5].getBoundingClientRect().top);
  expect(Math.abs(top)).toBeLessThan(40);
  await page.locator('#lx-ak-back').click();
  await expect(page.locator('#lx-answers')).toBeVisible();
});

test('weak-spot report: after a submitted block the parent page shows per-subject accuracy and missed questions', async ({ page }) => {
  await freshStart(page);
  await page.locator('#lx-parent').click();
  await expect(page.locator('.lx-parent')).toContainText('ยังไม่มีคำตอบที่ส่งแล้ว');
  await page.locator('#lx-back').click();
  await startSet(page);
  await answerAndSubmitBlock(page, () => 'unsure');
  await page.reload();
  await page.locator('#lx-parent').click();
  const rows = await page.locator('.lx-weak-row').count();
  expect(rows).toBeGreaterThan(0);
  await expect(page.locator('.lx-parent')).toContainText('ข้อที่ยังพลาดบ่อย');
  expect(await page.locator('.lx-mistakes li').count()).toBe(5);
  expect(await noHorizontalOverflow(page)).toBe(true);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 700 });
    expect(await noHorizontalOverflow(page), `parent page overflows at ${width}`).toBe(true);
  }
});
