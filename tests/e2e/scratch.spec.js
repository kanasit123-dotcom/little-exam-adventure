// กระดาษทด: ปุ่มโผล่เฉพาะข้อที่ต้องทดเลข, เขียนอิสระได้ (นิ้ว/ปากกา/เมาส์), เส้นอยู่ครบเมื่อกลับมาข้อเดิม
import { test, expect } from '@playwright/test';
import { freshStart, startSet } from './helpers.js';

/** เดินไปทีละข้อในช่วงแรก จนเจอข้อที่มีปุ่มกระดาษทด (คืนเลขข้อ) */
async function goToScratchQuestion(page) {
  for (let guard = 0; guard < 6; guard++) {
    if (await page.locator('#lx-scratch').isVisible()) return Number((await page.locator('.lx-qnum').textContent()).replace('.', ''));
    await page.locator('.lx-pick').first().click();
    await page.locator('#lx-next').click();
  }
  throw new Error('ไม่เจอข้อที่มีปุ่มกระดาษทดในช่วงแรก');
}

const inkPixels = (page) => page.locator('.lx-scratch-canvas').evaluate((canvas) => {
  const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  let n = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 0) n++;
  return n;
});

async function scribble(page, from = [0.2, 0.3], to = [0.8, 0.6]) {
  const box = await page.locator('.lx-scratch-canvas').boundingBox();
  const at = ([x, y]) => [box.x + box.width * x, box.y + box.height * y];
  await page.mouse.move(...at(from));
  await page.mouse.down();
  await page.mouse.move(...at([(from[0] + to[0]) / 2, from[1] - 0.1]), { steps: 6 });
  await page.mouse.move(...at(to), { steps: 6 });
  await page.mouse.up();
}

test('ข้อที่ไม่ต้องทดเลขไม่มีปุ่ม ข้อคณิตศาสตร์มีปุ่ม', async ({ page }) => {
  await freshStart(page);
  await startSet(page, 'set-03');
  const sawHidden = [];
  let found = null;
  for (let guard = 0; guard < 6 && found === null; guard++) {
    if (await page.locator('#lx-scratch').isVisible()) found = guard;
    else sawHidden.push(guard);
    if (found === null) { await page.locator('.lx-pick').first().click(); await page.locator('#lx-next').click(); }
  }
  expect(found, 'ต้องมีข้อที่ใช้กระดาษทดในช่วงแรกของชุดที่ 3').not.toBeNull();
  expect(sawHidden.length, 'ข้อก่อนหน้า (ไม่ใช่เลข) ต้องไม่มีปุ่ม').toBeGreaterThan(0);
});

test('เปิดกระดาษทด เขียน เปลี่ยนสี ย้อน ลบ ล้าง และปิดได้', async ({ page }) => {
  await freshStart(page);
  await startSet(page, 'set-03');
  const number = await goToScratchQuestion(page);
  await page.locator('#lx-scratch').click();

  const sheet = page.locator('.lx-scratch');
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('.lx-scratch-title')).toContainText(`ข้อ ${number}`);
  await expect(sheet.locator('.lx-scratch-text')).not.toBeEmpty();
  // หน้าสอบข้างหลังถูกล็อก กดอะไรโดนไม่ได้
  expect(await page.locator('.lx-exam').evaluate((el) => el.inert)).toBe(true);
  // ผ้าใบพอให้เขียนได้จริง
  const box = await page.locator('.lx-scratch-canvas').boundingBox();
  expect(box.height).toBeGreaterThan(160);
  expect(box.width).toBeGreaterThan(250);
  expect(await inkPixels(page)).toBe(0);

  await scribble(page);
  const one = await inkPixels(page);
  expect(one).toBeGreaterThan(200);

  await page.locator('[data-tool="blue"]').click();
  await scribble(page, [0.2, 0.7], [0.7, 0.8]);
  const two = await inkPixels(page);
  expect(two).toBeGreaterThan(one);

  // ย้อน: เส้นสีน้ำเงินหายไป เหลือแต่เส้นแรก
  await page.locator('#lx-scratch-undo').click();
  expect(await inkPixels(page)).toBe(one);

  // ยางลบ: ลากทับเส้นแรกตามทางเดิม แล้วหมึกต้องลดลง
  await page.locator('[data-tool="eraser"]').click();
  await scribble(page);
  expect(await inkPixels(page)).toBeLessThan(one);

  // ล้างทั้งแผ่นต้องแตะ 2 ครั้ง (กันเผลอ)
  await page.locator('[data-tool="black"]').click();
  await scribble(page, [0.3, 0.4], [0.6, 0.4]);
  expect(await inkPixels(page)).toBeGreaterThan(0);
  await page.locator('#lx-scratch-clear').click();
  expect(await inkPixels(page)).toBeGreaterThan(0);
  await page.locator('#lx-scratch-clear').click();
  expect(await inkPixels(page)).toBe(0);

  await scribble(page);
  await page.locator('#lx-scratch-done').click();
  await expect(sheet).toHaveCount(0);
  expect(await page.locator('.lx-exam').evaluate((el) => el.inert)).toBe(false);
  await expect(page.locator('#lx-scratch')).toHaveClass(/lx-has-ink/);
});

test('ไปข้ออื่นแล้วกลับมา เส้นที่เขียนยังอยู่ และแต่ละข้อมีกระดาษของตัวเอง', async ({ page }) => {
  await freshStart(page);
  await startSet(page, 'set-03');
  const number = await goToScratchQuestion(page);
  await page.locator('#lx-scratch').click();
  await scribble(page);
  const drawn = await inkPixels(page);
  await page.locator('#lx-scratch-done').click();

  // ไปข้อก่อนหน้า (ถ้าไม่มี ให้ไปข้อถัดไป) แล้วกลับมา
  await page.locator(`.lx-dot[data-go="${number % 5 === 1 ? 1 : 0}"]`).click();
  await page.locator('.lx-pick').first().waitFor();
  await page.locator('.lx-dot.lx-here').waitFor();
  await page.locator(`.lx-dot[aria-label^="ข้อ ${number}"]`).click();
  await page.locator('#lx-scratch').click();
  expect(await inkPixels(page)).toBe(drawn);
  await page.locator('#lx-scratch-done').click();
});

test('หมุนจอ/ย่อขยายแล้วเส้นยังอยู่ที่เดิม (เก็บเป็นสัดส่วน)', async ({ page }) => {
  await freshStart(page);
  await startSet(page, 'set-03');
  await goToScratchQuestion(page);
  await page.locator('#lx-scratch').click();
  await scribble(page);
  // กรอบของหมึกเทียบกับขนาดผ้าใบ (0..1) ต้องเท่าเดิมไม่ว่าจอจะขนาดไหน
  const frame = () => page.locator('.lx-scratch-canvas').evaluate((canvas) => {
    const { data, width, height } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    let x0 = width, y0 = height, x1 = -1, y1 = -1;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    }
    return [x0 / width, y0 / height, x1 / width, y1 / height];
  });
  const before = await frame();
  expect(before[2]).toBeGreaterThan(0.6);
  for (const [w, h] of [[700, 500], [390, 664]]) {
    await page.setViewportSize({ width: w, height: h });
    await expect.poll(async () => (await frame()).map((n, i) => Math.abs(n - before[i]) < 0.06).every(Boolean), { message: `${w}x${h}` }).toBe(true);
  }
});

test('ปุ่มกระดาษทดไม่ทำให้แถบล่างตกบรรทัด/ล้นจอ', async ({ page }) => {
  await freshStart(page);
  await startSet(page, 'set-03');
  await goToScratchQuestion(page);
  const rect = await page.locator('.lx-nav').evaluate((el) => {
    const rows = new Set([...el.querySelectorAll('button:not([hidden])')].map((b) => Math.round(b.getBoundingClientRect().top / 8)));
    return { rows: rows.size, over: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
  expect(rect.rows).toBe(1);
  expect(rect.over).toBeLessThanOrEqual(1);
});
