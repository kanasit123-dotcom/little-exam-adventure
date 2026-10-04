import { test, expect } from '@playwright/test';
import { SETS } from '../../src/content/sets/index.js';
import { freshStart, startSet, noHorizontalOverflow, KEY } from './helpers.js';

const added = SETS.filter((set) => Number(set.id.slice(4)) >= 51 && Number(set.id.slice(4)) <= 60);
for (const set of added) {
  test(`${set.id}: every review and transfer preserves original answers and earns a completion reward`, async ({ page }, info) => {
    test.setTimeout(180_000);
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await freshStart(page, { others: { 'lilly-world-v1': '{"stars":7}' } });
    await startSet(page, set.id);
    for (const [width, height] of [[390, 664], [768, 954], [1024, 700], [1280, 900]]) {
      await page.setViewportSize({ width, height });
      expect(await noHorizontalOverflow(page)).toBe(true);
      await page.screenshot({ path: info.outputPath(`${set.id}-${width}x${height}-exam.png`) });
    }
    await page.setViewportSize({ width: 390, height: 664 });
    for (let block = 0; block < 3; block++) {
      for (let cursor = 0; cursor < 5; cursor++) {
        const capture = { 'set-54': 6, 'set-55': 8, 'set-56': 7, 'set-59': 11 };
        if (capture[set.id] === block * 5 + cursor) {
          for (const [width, height] of [[390, 664], [768, 954], [1024, 700], [1280, 900]]) {
            await page.setViewportSize({ width, height });
            expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(1);
            await page.screenshot({ path: info.outputPath(`${set.id}-detail-${width}x${height}.png`) });
          }
          await page.setViewportSize({ width: 390, height: 664 });
        }
        if (await page.locator('.lx-opt .lx-figure').count()) {
          for (const [width, height] of [[390, 664], [768, 954], [1024, 700], [1280, 900]]) {
            await page.setViewportSize({ width, height });
            const overlaps = await page.locator('.lx-opt .lx-figure').evaluateAll((figures) => figures.map((figure) => {
              const picture = figure.getBoundingClientRect();
              const button = figure.closest('.lx-opt').querySelector('.lx-say').getBoundingClientRect();
              return Math.max(0, Math.min(picture.right, button.right) - Math.max(picture.left, button.left))
                * Math.max(0, Math.min(picture.bottom, button.bottom) - Math.max(picture.top, button.top));
            }));
            expect(overlaps.every((area) => area <= 1), `${set.id} question ${block * 5 + cursor + 1} @${width}x${height}: ${overlaps}`).toBe(true);
            expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(1);
            if (set.id === 'set-60' && block === 2 && cursor === 3) {
              await page.screenshot({ path: info.outputPath(`${set.id}-matrix-${width}x${height}.png`) });
            }
          }
          await page.setViewportSize({ width: 390, height: 664 });
        }
        await page.locator('#lx-unsure').click();
        await page.locator('#lx-next').click();
      }
      await page.locator('#lx-send').click();
      await page.locator('.lx-review').waitFor();
      for (let cursor = 0; cursor < 5; cursor++) {
        const main = set.items.find((item) => item.id === set.order[block * 5 + cursor]);
        const transfer = set.items.find((item) => item.id === main.review.transferIds[0]);
        await page.locator(`#lx-rdots [data-go="${block}:${cursor}"]`).click();
        await page.locator('[data-tool="hint"]').click();
        await page.locator('[data-tool="steps"]').click();
        await expect(page.locator('.lx-step')).toHaveCount(main.review.steps.length);
        const column = page.locator('[data-tool="column"]');
        if (await column.count()) { await column.click(); await expect(page.locator('.lx-col')).toBeVisible(); }
        await page.locator('[data-tool="transfer"]').click();
        const correct = transfer.options.findIndex((option) => option.id === transfer.correctOptionId);
        const wrong = (correct + 1) % transfer.options.length;
        await page.locator(`[data-ti="${wrong}"]`).click();
        await page.locator('[data-tool="hint"]').click();
        await page.locator('[data-tool="transfer"]').click();
        await page.locator(`[data-ti="${correct}"]`).click();
        await expect(page.locator('#lx-tresult .lx-status')).toContainText('ถูกต้อง');
        expect(await noHorizontalOverflow(page), transfer.id).toBe(true);
        await page.locator('#lx-tresult').scrollIntoViewIfNeeded();
        const broken = await page.evaluate(() => [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src));
        expect(broken, transfer.id).toEqual([]);
        const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).session, KEY);
        expect(saved.submitted[block].answers[main.id]).toBe('unsure');
        expect(saved.transfers[transfer.id].attempts.map((attempt) => attempt.correct)).toEqual([false, true]);
        if (cursor === 0) await page.screenshot({ path: info.outputPath(`${set.id}-block-${block + 1}-review-transfer.png`) });
      }
      await page.locator('#lx-rdone').click();
      if (block < 2) await page.locator('#lx-continue').click();
    }
    await expect(page.locator('.lx-reward')).toBeVisible();
    await page.locator('[data-friend="turtle"]').click();
    await page.reload();
    const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY);
    expect(state.rewards.stars).toBe(1);
    expect(state.progress[set.id].last.total).toBe(15);
    expect(state.session.submitted).toHaveLength(3);
    expect(Object.keys(state.session.transfers)).toHaveLength(15);
    expect(await page.evaluate(() => localStorage.getItem('lilly-world-v1'))).toBe('{"stars":7}');
    expect(errors).toEqual([]);
  });
}
