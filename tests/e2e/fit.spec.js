// โจทย์ + ตัวเลือกต้องจบในหน้าเดียว ไม่ต้องเลื่อน (ผู้ปกครองขอ 2026-09-30: เด็กงงเมื่อต้องเลื่อนขึ้นลง)
// วัดทุกข้อของทุกชุดที่ขนาดจอที่เห็นจริงใน Safari: iPhone 390x664, iPad แนวตั้ง 768x954, iPad แนวนอน 1024x700
// iPhone SE (375x553) ยังเลื่อนได้บางข้อ จึงไม่อยู่ในเงื่อนไข (ดู docs/ADDING-A-SET.md)
import { test, expect } from '@playwright/test';
import { freshStart } from './helpers.js';
import { SETS } from '../../src/content/sets/index.js';

const VIEWS = [[390, 664], [768, 954], [1024, 700]];

test.beforeEach(({}, info) => test.skip(info.project.name !== 'mobile-chrome', 'วัดครั้งเดียวพอ'));

for (const set of SETS) {
  test(`${set.id}: every question fits one screen on iPhone and iPad`, async ({ page }) => {
    test.setTimeout(120_000);
    await freshStart(page);
    await page.locator('#lx-sets').click();
    await page.locator(`[data-set="${set.id}"]`).click();
    await page.locator('#lx-go').click();
    await page.locator('.lx-pick').first().waitFor();
    const tooLong = [];
    for (let block = 0; block < 8; block++) {
      for (let guard = 0; guard < 6; guard++) {
        const qn = (await page.locator('.lx-qnum').textContent()).replace('.', '');
        for (const [w, h] of VIEWS) {
          await page.setViewportSize({ width: w, height: h });
          const over = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
          if (over > 1) tooLong.push(`ข้อ ${qn} @${w}x${h} เกิน ${over}px`);
        }
        await page.setViewportSize({ width: 390, height: 664 });
        await page.locator('.lx-pick').first().click();
        await page.locator('#lx-next').click();
        if (await page.locator('#lx-send').isVisible().catch(() => false)) break;
      }
      await page.locator('#lx-send').click();
      await page.locator('.lx-review').waitFor();
      await page.locator('#lx-rdone').click();
      if (await page.locator('#lx-continue').isVisible().catch(() => false)) { await page.locator('#lx-continue').click(); await page.locator('.lx-pick').first().waitFor(); continue; }
      break;
    }
    expect(tooLong, tooLong.join('; ')).toEqual([]);
  });
}
