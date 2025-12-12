import {tmpdir} from 'os';
import {resolve} from 'path';
import {coverageConfigDefaults, defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    execArgv: [
      '--localstorage-file',
      resolve(tmpdir(), `vitest-${process.pid}.localstorage`),
    ],
    setupFiles: ['test/vitest/setup.ts'],
    reporters: [['test/vitest/reporter.ts', {hideSkipped: true}]],
    slowTestThreshold: 3000,
    maxWorkers: 10,
    passWithNoTests: true,
    testTimeout: 20000,
    retry: 10,
    coverage: {
      enabled: false,
      provider: 'istanbul',
      exclude: coverageConfigDefaults.exclude.filter((e) => e !== 'dist/**'),
      include: ['dist/index.js', 'dist/ui-react/index.js'],
      reportsDirectory: './tmp/coverage',
      reporter: ['text-summary', 'json-summary', 'html'],
    },

    onUnhandledError: ({message}) =>
      message !== 'Invariant: worker WS endpoint not found',

    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['test/unit/**/*.test.ts', 'test/unit/**/*.test.tsx'],
        },
      },
      {
        extends: true,
        test: {name: 'perf', include: ['test/perf/**/*.test.ts']},
      },
      {
        extends: true,
        test: {name: 'prod', include: ['test/prod/**/*.test.ts']},
      },
      {
        extends: true,
        test: {
          name: 'e2e',
          include: ['test/e2e/**/*.test.ts'],
          environment: 'puppeteer',
          globalSetup: 'vitest-environment-puppeteer/global-init',
          globals: true,
          retry: 0,
        },
      },
    ],
  },
});
