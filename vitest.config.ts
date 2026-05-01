import {svelte} from '@sveltejs/vite-plugin-svelte';
import {svelteTesting} from '@testing-library/svelte/vite';
import {tmpdir} from 'os';
import {resolve} from 'path';
import {coverageConfigDefaults, defineConfig} from 'vitest/config';

const solidJsxHPlugin = () => ({
  name: 'solid-jsx-h',
  enforce: 'pre' as const,
  transform: (code: string, id: string) => {
    const path = id.split('?')[0];
    return path.endsWith('.tsx') &&
      (path.includes('/src/ui-solid/') ||
        path.includes('/test/unit/core/ui-solid/'))
      ? {code: `import h from 'solid-js/h';\n` + code, map: null}
      : null;
  },
});

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
    maxWorkers: 8,
    passWithNoTests: true,
    testTimeout: 20000,
    retry: 10,
    coverage: {
      enabled: false,
      provider: 'istanbul',
      exclude: coverageConfigDefaults.exclude.filter((e) => e !== 'dist/**'),
      include: [
        'dist/index.js',
        'dist/ui-react/index.js',
        'dist/ui-solid/index.js',
        'dist/ui-svelte/index.js',
      ],
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
          exclude: [
            'test/unit/core/ui-solid/**',
            'test/unit/core/ui-svelte/**',
            'test/unit/synchronizers/synchronizer-ws-server.test.ts',
            'test/unit/core/types/types.test.tsx',
            'test/unit/documentation.test.ts',
            'test/unit/persisters/**/*.test.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-ws-server',
          include: ['test/unit/synchronizers/synchronizer-ws-server.test.ts'],
          sequence: {groupOrder: 1},
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-types',
          include: ['test/unit/core/types/types.test.tsx'],
          sequence: {groupOrder: 2},
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-documentation',
          include: ['test/unit/documentation.test.ts'],
          sequence: {groupOrder: 3},
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-persisters',
          include: ['test/unit/persisters/**/*.test.ts'],
          sequence: {groupOrder: 4},
          maxWorkers: 2,
        },
      },
      {
        extends: true,
        oxc: false,
        plugins: [solidJsxHPlugin()],
        esbuild: {
          logOverride: {'unsupported-jsx-comment': 'silent'},
          jsx: 'transform',
          jsxFactory: 'h',
          jsxFragment: 'h.Fragment',
        },
        resolve: {conditions: ['browser', 'development']},
        test: {
          name: 'solid',
          server: {deps: {inline: [/solid-js/]}},
          include: [
            'test/unit/core/ui-solid/**/*.test.ts',
            'test/unit/core/ui-solid/**/*.test.tsx',
          ],
        },
      },
      {
        extends: true,
        plugins: [svelte(), svelteTesting()],
        test: {
          name: 'svelte',
          include: ['test/unit/core/ui-svelte/**/*.test.ts'],
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
    ],
  },
});
