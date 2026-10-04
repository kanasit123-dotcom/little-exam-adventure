// เพื่อนที่โตสุดแล้วมีไข่และลูก: การ์ดในสมุดสติกเกอร์ และหน้ารางวัลหลังทำชุดจบ
import { test, expect } from '@playwright/test';
import { KEY, freshStart, startSet, answerAndSubmitBlock, noHorizontalOverflow } from './helpers.js';

async function seedFriends(page, friends) {
  await page.evaluate(([key, value]) => {
    const s = JSON.parse(localStorage.getItem(key));
    s.rewards.friends = value;
    s.rewards.stars = Object.values(value).reduce((a, b) => a + b, 0);
    localStorage.setItem(key, JSON.stringify(s));
  }, [KEY, friends]);
  await page.reload();
}

/** ทำชุด 1 จนถึงหน้ารางวัล */
async function reachReward(page) {
  await startSet(page);
  for (let block = 1; block <= 3; block++) {
    await answerAndSubmitBlock(page, () => 0);
    await page.locator('#lx-rdone').click();
    if (block < 3) await page.locator('#lx-continue').click();
  }
  await expect(page.locator('.lx-reward')).toBeVisible();
}

const card = (page, name) => page.locator('.lx-fcard', { hasText: name });

test('สมุดสติกเกอร์: โตสุดแล้วมีไข่ ลูกตัวจิ๋ว ลูกโต และครอบครัวครบ พร้อมป้ายบอกขั้น', async ({ page }) => {
  await freshStart(page);
  await seedFriends(page, { turtle: 4, rabbit: 5, penguin: 6, seal: 7, fox: 9, cat: 10 });
  await page.locator('#lx-album').click();
  await expect(page.locator('.lx-fcard')).toHaveCount(11);

  // โตสุดแล้วแต่ยังไม่มีลูก: ไม่มีไข่
  await expect(card(page, 'เต่า')).toContainText('ขนาดใหญ่มาก');
  await expect(card(page, 'เต่า').locator('.lx-kid')).toHaveCount(0);

  // ไข่ 1 ใบ
  await expect(card(page, 'กระต่าย')).toContainText('มีไข่');
  await expect(card(page, 'กระต่าย').locator('.lx-egg')).toHaveCount(1);
  await expect(card(page, 'กระต่าย').locator('.lx-kid')).toHaveCount(1);

  // ลูกตัวจิ๋ว / ลูกโต
  await expect(card(page, 'เพนกวิน')).toContainText('ลูกจิ๋ว 1');
  await expect(card(page, 'เพนกวิน').locator('.lx-kid-s2')).toHaveCount(1);
  await expect(card(page, 'แมวน้ำ')).toContainText('มีลูก 1 ตัว');
  await expect(card(page, 'แมวน้ำ').locator('.lx-kid-s3')).toHaveCount(1);

  // ลูกคนแรกโตเต็มที่ + ลูกคนที่สองกำลังฟัก
  await expect(card(page, 'จิ้งจอก').locator('.lx-kid')).toHaveCount(2);
  await expect(card(page, 'จิ้งจอก').locator('.lx-kid-s3')).toHaveCount(1);
  await expect(card(page, 'จิ้งจอก').locator('.lx-kid-s2')).toHaveCount(1);

  // ครอบครัวครบ: ลูกโต 2 ตัว
  await expect(card(page, 'แมว').first()).toContainText('ครอบครัวครบ');
  await expect(card(page, 'แมว').first().locator('.lx-kid-s3')).toHaveCount(2);

  // ตัวแม่ย่อลงเมื่อมีลูก และลูกอยู่ในกรอบการ์ด ไม่ล้นออกมา
  const geometry = await page.evaluate(() => {
    const find = (name) => [...document.querySelectorAll('.lx-fcard')].find((c) => c.querySelector('.lx-fcard-name').textContent === name);
    const box = (el) => el.getBoundingClientRect();
    const turtle = find('เต่า');
    const cat = find('แมว');
    const kids = [...cat.querySelectorAll('.lx-kid')].map(box);
    const frame = box(cat.querySelector('.lx-fcard-box'));
    return {
      turtleW: box(turtle.querySelector('.lx-fcard-img')).width,
      catW: box(cat.querySelector('.lx-fcard-img')).width,
      kidsInside: kids.every((k) => k.left >= frame.left - 1 && k.right <= frame.right + 1 && k.top >= frame.top - 1 && k.bottom <= frame.bottom + 1),
      kidsApart: kids.length === 2 && kids[0].bottom <= kids[1].top + 1 || kids[1].bottom <= kids[0].top + 1,
      parentLeftOfKids: box(cat.querySelector('.lx-fcard-img')).right <= kids[0].left + frame.width * 0.08,
    };
  });
  expect(geometry.catW).toBeLessThan(geometry.turtleW);
  expect(geometry.kidsInside).toBe(true);
  expect(geometry.kidsApart).toBe(true);
  expect(geometry.parentLeftOfKids).toBe(true);
  expect(await noHorizontalOverflow(page)).toBe(true);
});

test('จบชุดแล้วเลือกเต่าที่โตสุด: ได้ไข่ แล้วครั้งถัดไปไข่ฟักเป็นลูก', async ({ page }) => {
  await freshStart(page);
  await seedFriends(page, { turtle: 4 });
  await reachReward(page);
  await page.locator('[data-friend="turtle"]').click();
  await expect(page.locator('.lx-lead')).toContainText('เต่ามีไข่แล้ว');
  await expect(page.locator('.lx-reward-friend .lx-egg')).toHaveCount(1);
  await expect(page.locator('.lx-reward-friend')).toContainText('มีไข่');
  let stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY);
  expect(stored.rewards.friends.turtle).toBe(5);
  expect(stored.rewards.stars).toBe(5);
  expect(await noHorizontalOverflow(page)).toBe(true);

  // ชุดถัดไป เลือกเต่าอีก: ไข่ฟัก
  await page.locator('#lx-home').click();
  await reachReward(page);
  await page.locator('[data-friend="turtle"]').click();
  await expect(page.locator('.lx-lead')).toContainText('ไข่ของเต่าฟักแล้ว');
  await expect(page.locator('.lx-reward-friend .lx-kid-s2')).toHaveCount(1);
  await expect(page.locator('.lx-reward-friend .lx-egg')).toHaveCount(0);
  stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY);
  expect(stored.rewards.friends.turtle).toBe(6);
});

test('เพื่อนที่ครอบครัวครบแล้วเลือกไม่ได้ (ดาวไม่หาย) ส่วนตัวอื่นเลือกได้', async ({ page }) => {
  await freshStart(page);
  await seedFriends(page, { cat: 10, turtle: 10 });
  await reachReward(page);
  const before = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).rewards, KEY);
  await expect(page.locator('[data-friend="cat"]')).toHaveAttribute('aria-disabled', 'true');
  await expect(page.locator('[data-friend="rabbit"]')).not.toHaveAttribute('aria-disabled', 'true');

  // aria-disabled ทำให้ Playwright เห็นว่ากดไม่ได้ แต่เด็กแตะได้จริง จึงบังคับกดเหมือนนิ้ว
  await page.locator('[data-friend="cat"]').click({ force: true });
  await expect(page.locator('#lx-full-note')).toContainText('แมวมีครอบครัวครบแล้ว');
  // ยังอยู่หน้าเลือก ยังไม่ได้รับรางวัล
  await expect(page.locator('[data-friend="rabbit"]')).toBeVisible();
  const same = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).rewards, KEY);
  expect(same).toEqual(before);

  await page.locator('[data-friend="rabbit"]').click();
  await expect(page.locator('.lx-lead')).toContainText('ได้กระต่ายตัวใหม่แล้ว');
  const after = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).rewards, KEY);
  expect(after.stars).toBe(before.stars + 1);
  expect(after.friends).toEqual({ cat: 10, turtle: 10, rabbit: 1 });
});

test('ทุกตัวครบครอบครัวแล้ว เลือกได้ทุกตัวและไม่เกิน 10', async ({ page }) => {
  await freshStart(page);
  const everyone = Object.fromEntries(['cat', 'rabbit', 'seal', 'penguin', 'turtle', 'unicorn', 'butterfly', 'dolphin', 'fox', 'octopus', 'squirrel'].map((id) => [id, 10]));
  await seedFriends(page, everyone);
  await reachReward(page);
  await expect(page.locator('.lx-fcard-full')).toHaveCount(0);
  await page.locator('[data-friend="seal"]').click();
  await expect(page.locator('.lx-lead')).toContainText('ครอบครัวแมวน้ำครบแล้ว');
  const stored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY);
  expect(stored.rewards.friends.seal).toBe(10);
  expect(stored.rewards.stars).toBe(111);
});
