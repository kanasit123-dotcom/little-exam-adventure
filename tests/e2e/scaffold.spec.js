import { test, expect } from '@playwright/test';

test('scaffold loads at mobile and iPad sizes without horizontal overflow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Little Exam Adventure' })).toBeVisible();
  await expect(page.getByText('12 ข้อ', { exact: true })).toBeVisible();
  await expect(page.getByText('ผ่าน', { exact: true })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
