import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  outputDir: 'tmp/test-results',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  fullyParallel: false,
  workers: 4,
  reporter: 'line',
  use: {trace: 'on-first-retry'},
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
});
