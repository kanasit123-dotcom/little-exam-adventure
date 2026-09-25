export const KEY = 'little-exam-adventure-v1';

export function quietState(extra = {}) {
  return {
    version: 1,
    settings: { sound: false, rate: 'normal', buddy: null, mode: 'buddy', ...(extra.settings || {}) },
    session: null,
    rewards: { stars: 0, stickers: [], claimed: {} },
    history: [],
  };
}

/** เปิดเกมใหม่แบบไม่มีข้อมูลเก่า (ปิดเสียงไว้ เพื่อให้ test ไม่ต้องรอเสียงอ่าน) */
export async function freshStart(page, { sound = false, others = {} } = {}) {
  await page.goto('/');
  await page.evaluate(({ key, state, others }) => {
    localStorage.clear();
    for (const [k, v] of Object.entries(others)) localStorage.setItem(k, v);
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: KEY, state: quietState({ settings: { sound } }), others });
  await page.reload();
}

export async function startSet(page) {
  await page.locator('[data-start]').first().click();
  await page.locator('#lx-go').click();
  await page.locator('.lx-pick').first().waitFor();
}

/** ตอบทุกข้อในช่วงปัจจุบัน แล้วส่ง — pick(n) คืน index ตัวเลือก หรือ 'unsure' */
export async function answerAndSubmitBlock(page, pick = () => 0) {
  for (let guard = 0; guard < 6; guard++) {
    const n = Number((await page.locator('.lx-qnum').textContent()).replace('.', ''));
    const choice = pick(n);
    if (choice === 'unsure') await page.locator('#lx-unsure').click();
    else await page.locator('.lx-pick').nth(choice).click();
    await page.locator('#lx-next').click();
    if (await page.locator('#lx-send').isVisible().catch(() => false)) break;
  }
  await page.locator('#lx-send').click();
  await page.locator('.lx-review').waitFor();
}

export async function noHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
}
