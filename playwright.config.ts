import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  outputDir: 'tmp/test-results',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {trace: 'on-first-retry'},
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
});
