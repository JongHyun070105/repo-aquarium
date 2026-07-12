import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  outputDir: 'test-results',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  reporter: 'list',
  use: {
    browserName: 'chromium',
    viewport: { width: 920, height: 360 },
  },
});
