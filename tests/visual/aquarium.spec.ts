import { expect, test } from '@playwright/test';
import { renderAquarium, THEMES } from '../../src/index.js';
import { activeStats } from '../fixtures/stats.js';

for (const theme of THEMES) {
  test(`${theme} visual scene and animation`, async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 320 });
    await page.setContent(renderAquarium(theme, activeStats));

    await expect(page.locator('svg')).toHaveScreenshot(`${theme}.png`, {
      animations: 'disabled',
      maxDiffPixelRatio: 0.03,
    });

    const start = await page.locator('svg').screenshot();
    await page.waitForTimeout(700);
    const middle = await page.locator('svg').screenshot();
    expect(Buffer.compare(start, middle), 'an animation frame should visibly change').not.toBe(0);
  });
}

test('reduced motion renders a complete static scene', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 900, height: 320 });
  await page.setContent(renderAquarium('coral-day', activeStats));

  const animationNames = await page.locator('.swimmer').evaluateAll((fish) =>
    fish.map((item) => getComputedStyle(item).animationName),
  );
  expect(animationNames.every((name) => name === 'none')).toBe(true);
  await expect(page.locator('svg')).toHaveScreenshot('coral-day-reduced-motion.png', {
    maxDiffPixelRatio: 0.03,
  });
});
