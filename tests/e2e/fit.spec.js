// โจทย์ + ตัวเลือกต้องจบในหน้าเดียว ไม่ต้องเลื่อน (ผู้ปกครองขอ 2026-09-30: เด็กงงเมื่อต้องเลื่อนขึ้นลง)
// วัดทุกข้อของทุกชุดที่ขนาดจอที่เห็นจริงใน Safari: iPhone 390x664, iPad แนวตั้ง 768x954, iPad แนวนอน 1024x700
// iPhone SE (375x553) ยังเลื่อนได้บางข้อ จึงไม่อยู่ในเงื่อนไข (ดู docs/ADDING-A-SET.md)
import { test, expect } from '@playwright/test';
import { freshStart, KEY } from './helpers.js';
import { SETS } from '../../src/content/sets/index.js';

const VIEWS = [[390, 664], [768, 954], [1024, 700]];
// FIT_TWICE=1: วัดซ้ำในโหมดสอบจริง (ป้ายรอบแทนปุ่มฟัง) โดยตั้งให้ทุกข้อ "ฟังครบ 2 รอบแล้ว" จะได้ไม่ต้องรอเสียง
const TWICE = process.env.FIT_TWICE === '1';

test.beforeEach(({}, info) => test.skip(info.project.name !== 'mobile-chrome', 'วัดครั้งเดียวพอ'));

for (const set of SETS) {
  test(`${set.id}: every question fits one screen on iPhone and iPad`, async ({ page }) => {
    test.setTimeout(120_000);
    await freshStart(page, TWICE ? { sound: true, listen: 'twice' } : {});
    await page.locator('#lx-sets').click();
    await page.locator(`[data-set="${set.id}"]`).click();
    await page.locator('#lx-go').click();
    await page.locator('.lx-pick').first().waitFor();
    if (TWICE) {
      const stimulusOf = Object.fromEntries(set.order.map((id) => [id, set.items.find((i) => i.id === id).stimulus || null]));
      await page.evaluate(([key, stim]) => {
        const state = JSON.parse(localStorage.getItem(key));
        for (const id of state.session.questionIds) {
          state.session.replays[id] = { round: 2 };
          if (stim[id]) state.session.replays[`story:${stim[id]}`] = { round: 2 };
        }
        localStorage.setItem(key, JSON.stringify(state));
      }, [KEY, stimulusOf]);
      await page.reload();
      await page.locator('#lx-resume').click();
      await page.locator('.lx-pick').first().waitFor();
    }
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
