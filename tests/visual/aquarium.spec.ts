import { expect, test } from '@playwright/test';
import { CREATURES, renderAquarium, THEMES } from '../../src/index.js';
import { activeStats } from '../fixtures/stats.js';

for (const theme of THEMES) {
  test(`${theme} visual scene and animation`, async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 320 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setContent(renderAquarium(theme, activeStats));

    await expect(page.locator('svg')).toHaveScreenshot(`${theme}.png`, {
      maxDiffPixelRatio: 0.03,
    });

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setContent(renderAquarium(theme, activeStats));
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
      const elements = Array.from(svg.querySelectorAll('[data-creature], [data-theme-character], [data-event], [data-scene-object="plant"]'));
      return elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          name: element.getAttribute('data-creature') ?? element.getAttribute('data-theme-character') ?? element.getAttribute('data-event') ?? element.getAttribute('data-scene-object'),
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

test('contributors roam vertically, reverse direction, and turn their sprite', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 900, height: 320 });
  await page.setContent(renderAquarium('neon-cyber', activeStats, { creatures: ['contributors'] }));

  const frames = await page.locator('.contributor-wander').first().evaluate(async (contributor) => {
    contributor.setAttribute('style', `${contributor.getAttribute('style') ?? ''};--swim:4s;--delay:0s`);
    const facing = contributor.querySelector('.contributor-facing');
    const roam = contributor.getAnimations().find((animation) =>
      (animation as CSSAnimation).animationName === 'contributor-wander');
    const turn = facing?.getAnimations().find((animation) =>
      (animation as CSSAnimation).animationName === 'contributor-turn');
    if (!roam || !turn || !facing) throw new Error('Contributor motion animations were not found.');
    roam.pause();
    turn.pause();

    const sample = async (time: number) => {
      roam.currentTime = time;
      turn.currentTime = time;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const box = contributor.getBoundingClientRect();
      return { x: box.x, y: box.y, facing: getComputedStyle(facing).transform };
    };

    return [await sample(0), await sample(1_000), await sample(2_000), await sample(3_000)];
  });

  expect(frames[1]!.x).toBeGreaterThan(frames[0]!.x);
  expect(frames[2]!.x).toBeGreaterThan(frames[1]!.x);
  expect(frames[3]!.x).toBeLessThan(frames[2]!.x);
  expect(new Set(frames.map(({ y }) => Math.round(y))).size).toBeGreaterThan(1);
  expect(frames[0]!.facing).not.toBe(frames[2]!.facing);
});

test('every ambient creature traverses the water instead of idling in place', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 900, height: 320 });
  await page.setContent(renderAquarium('coral-day', activeStats, {
    creatures: ['jellyfish', 'crab', 'turtle', 'seahorse', 'octopus', 'ray', 'pufferfish', 'starfish'],
  }));

  const movement = await page.locator('[data-creature] > .free-roam').evaluateAll(async (creatures) =>
    Promise.all(creatures.map(async (creature) => {
      const animation = creature.getAnimations().find((candidate) =>
        (candidate as CSSAnimation).animationName.startsWith('roam-'));
      if (!animation) throw new Error('Ambient roaming animation was not found.');
      animation.pause();
      const duration = Number(animation.effect?.getTiming().duration);
      animation.currentTime = 0;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const start = creature.getBoundingClientRect();
      animation.currentTime = duration / 2;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const middle = creature.getBoundingClientRect();
      return { dx: Math.abs(middle.x - start.x), dy: Math.abs(middle.y - start.y) };
    })),
  );

  expect(movement).toHaveLength(8);
  for (const delta of movement) {
    expect(delta.dx).toBeGreaterThan(10);
    expect(delta.dy).toBeGreaterThan(3);
  }
});

test('failed CI creates a contained neon storm', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setContent(renderAquarium('neon-cyber', {
    ...activeStats,
    ci: { workflow: 'CI', status: 'completed', conclusion: 'failure' },
  }, { creatures: ['contributors'] }));

  await expect(page.locator('[data-phenomenon="ci-storm"]')).toHaveCount(1);
  await expect(page.locator('[data-theme-character="theme-drone"]')).toHaveCount(1);
  await expect(page.locator('svg')).toHaveScreenshot('neon-cyber-ci-storm.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.03,
  });
});
