import { expect, test } from '@playwright/test';
import { CREATURES, renderAquarium, THEMES } from '../../src/index.js';
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

test('all configured creatures stay below the protected header while moving', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 320 });
  await page.setContent(renderAquarium('neon-cyber', activeStats, { creatures: [...CREATURES] }));

  const assertSafeBounds = async () => {
    const scene = await page.locator('svg').evaluate((svg) => {
      const root = svg.getBoundingClientRect();
      const elements = Array.from(svg.querySelectorAll('[data-creature], [data-scene-object="plant"]'));
      return elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          name: element.getAttribute('data-creature') ?? element.getAttribute('data-scene-object'),
          left: rect.left - root.left,
          right: rect.right - root.left,
          top: rect.top - root.top,
          bottom: rect.bottom - root.top,
        };
      });
    });
    for (const item of scene) {
      expect(item.left, `${item.name} left edge`).toBeGreaterThanOrEqual(8);
      expect(item.right, `${item.name} right edge`).toBeLessThanOrEqual(892);
      expect(item.top, `${item.name} must not overlap the header`).toBeGreaterThanOrEqual(88);
      expect(item.bottom, `${item.name} bottom edge`).toBeLessThanOrEqual(312);
    }
  };

  await assertSafeBounds();
  await page.waitForTimeout(1_200);
  await assertSafeBounds();
  await expect(page.locator('svg')).toHaveScreenshot('all-creatures-neon-cyber.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.03,
  });
});

test('plants sway while their roots remain fixed to the aquarium floor', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setContent(renderAquarium('coral-day', activeStats));

  const rootPositions = async () => page.locator('[data-scene-object="plant"] .plant-motion').evaluateAll((plants) =>
    plants.map((plant) => {
      const box = plant.getBoundingClientRect();
      return { left: box.left, top: box.top, bottom: box.bottom };
    }),
  );
  const before = await rootPositions();
  await page.waitForTimeout(1_200);
  const after = await rootPositions();

  expect(after).toHaveLength(before.length);
  for (let index = 0; index < before.length; index += 1) {
    expect(Math.abs((after[index]?.bottom ?? 0) - (before[index]?.bottom ?? 0))).toBeLessThanOrEqual(1);
  }
  expect(after.some((position, index) =>
    Math.abs(position.left - (before[index]?.left ?? position.left)) > 0.5
      || Math.abs(position.top - (before[index]?.top ?? position.top)) > 0.5,
  )).toBe(true);
});
