// ถ่ายภาพหน้าหลักทุกขนาดจอในแผน และตรวจว่าไม่มีเลื่อนแนวนอน รูปโหลดครบ ปุ่มแตะได้อย่างน้อย 44px
import { test, expect } from '@playwright/test';
import { freshStart, startSet, answerAndSubmitBlock, noHorizontalOverflow } from './helpers.js';

const SIZES = [[320, 568], [390, 664], [768, 1024], [1024, 768], [1280, 900]];

test.beforeEach(({}, info) => test.skip(info.project.name !== 'mobile-chrome', 'ถ่ายครั้งเดียวพอ'));

for (const [width, height] of SIZES) {
  test(`screens at ${width}x${height}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height });
    const shot = async (name) => {
      await page.waitForTimeout(150);
      expect(await noHorizontalOverflow(page), `${name} overflows`).toBe(true);
      const broken = await page.evaluate(() => [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src));
      expect(broken, name).toEqual([]);
      const small = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.offsetParent && (b.offsetHeight < 44 || b.offsetWidth < 44)).map((b) => b.textContent.trim().slice(0, 20)));
      expect(small, `${name} small buttons`).toEqual([]);
      await page.screenshot({ path: info.outputPath(`${width}x${height}-${name}.png`) });
    };
    await freshStart(page);
    await shot('home');
    await page.locator('#lx-sets').click();
    await shot('sets');
    await page.locator('#lx-back').click();
    await startSet(page);
    await shot('q1-story');
    for (let i = 0; i < 2; i++) { await page.locator('.lx-pick').first().click(); await page.locator('#lx-next').click(); }
    await shot('q3-pictograph');
    // แผนภูมิรูปภาพ: รูปทุกแถวขนาดเท่ากันและไม่ตกบรรทัด (ไม่อย่างนั้นความยาวแถวจะหลอกตา)
    const rows = await page.evaluate(() => [...document.querySelectorAll('.lx-pg-row')].map((row) => {
      const icons = [...row.querySelectorAll('.lx-pg-icon')].map((i) => i.getBoundingClientRect());
      return { lines: new Set(icons.map((r) => Math.round(r.top))).size, width: Math.round(icons[0].width) };
    }));
    expect(rows.every((r) => r.lines === 1), JSON.stringify(rows)).toBe(true);
    expect(new Set(rows.map((r) => r.width)).size, JSON.stringify(rows)).toBe(1);
    await page.locator('.lx-pick').first().click(); await page.locator('#lx-next').click();
    await shot('q4-map');
    await answerAndSubmitBlock(page, () => 1);
    // ป้าย "คำตอบที่ถูก" / "หนูตอบ" ต้องไม่ทับข้อความตัวเลือก
    const overlaps = await page.evaluate(() => [...document.querySelectorAll('.lx-pick.lx-static')].filter((box) => {
      const text = box.querySelector('.lx-opt-text');
      const tag = box.querySelector('.lx-tag-right');
      if (!text || !tag) return false;
      const a = text.getBoundingClientRect(); const b = tag.getBoundingClientRect();
      return a.bottom > b.top + 1 && b.bottom > a.top + 1 && a.right > b.left && b.right > a.left;
    }).length);
    expect(overlaps).toBe(0);
    await shot('review');
    await page.locator('[data-tool="steps"]').click();
    await page.locator('#lx-rdone').click();
    await shot('break');
    await page.locator('#lx-continue').click();
    await shot('q6-dice');
    await answerAndSubmitBlock(page, () => 0);
    await page.locator('#lx-rdone').click();
    await page.locator('#lx-continue').click();
    await answerAndSubmitBlock(page, () => 0);
    await page.locator('[data-tool="column"]').click();
    await page.locator('.lx-col .lx-key').first().waitFor();
    await page.locator('.lx-col').scrollIntoViewIfNeeded();
    await shot('column');
    await page.locator('#lx-rdone').click();
    await shot('reward');
    await page.locator('[data-friend]').first().click();
    await shot('reward-friend');
    await page.locator('#lx-home').click();
    await page.locator('#lx-parent').click();
    await shot('parent');
  });
}
