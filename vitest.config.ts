import {coverageConfigDefaults, defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['vitest/custom/setup.ts'],
    reporters: [['vitest/custom/reporter.ts', {hideSkipped: true}]],
    slowTestThreshold: 3000,
    maxWorkers: 10,
    passWithNoTests: true,
    testTimeout: 20000,
    retry: 3,
    coverage: {
      enabled: false,
      provider: 'istanbul',
      exclude: coverageConfigDefaults.exclude.filter((e) => e !== 'dist/**'),
      include: ['dist/index.js', 'dist/ui-react/index.js'],
      reportsDirectory: './tmp/coverage',
      reporter: ['text-summary', 'html'],
    },

    projects: [
      {
        extends: true,
        test: {name: 'unit', include: ['vitest/unit/**/*.test.ts']},
      },
      {
        extends: true,
        test: {name: 'perf', include: ['vitest/perf/**/*.test.ts']},
      },
      {
        extends: true,
        test: {name: 'prod', include: ['vitest/prod/**/*.test.ts']},
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['vitest/e2e/**/*.test.ts'],
          environment: 'puppeteer',
          globalSetup: 'vitest-environment-puppeteer/global-init',
          globals: true,
          retry: 0,
        },
      },
    ],
  },
});
