import {svelte} from '@sveltejs/vite-plugin-svelte';
import {svelteTesting} from '@testing-library/svelte/vite';
import {tmpdir} from 'os';
import {resolve} from 'path';
import solid from 'vite-plugin-solid';
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
    maxWorkers: 8,
    passWithNoTests: true,
    testTimeout: 20000,
    retry: 0,
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

    provide: {
      // Which half of the database work a project runs. The '-servers'
      // projects below override this; everything else leaves those variants
      // and documentation examples alone, so the suite needs no database
      // server. A project's provide merges over these, rather than replacing
      // them, so the two databases below reach every project.
      servers: false,

      // The two database servers the suite expects, in the one place they are
      // configured. The tests read them from here, and the documentation
      // examples - which spell out a plain local database, as a reader should
      // see - are rewritten to match before they run.
      //
      // PostgreSQL uses trust authentication and so needs no password. SQL
      // Server cannot, so a password is here; it belongs to a throwaway
      // container holding nothing but test data, never a real instance:
      //
      //   docker run -d --name tinybase-mssql -p 1433:1433 \
      //     -e ACCEPT_EULA=Y -e MSSQL_PID=Developer \
      //     -e MSSQL_SA_PASSWORD='TinyBase!Passw0rd' \
      //     mcr.microsoft.com/mssql/server:2022-latest
      postgres: 'postgres://localhost:5432',
      mssql: {
        server: 'localhost',
        port: 1433,
        user: 'sa',
        password: 'TinyBase!Passw0rd',
      },
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
            'test/unit/core/ui-react/ui-react-dom-charts.test.tsx',
            'test/unit/synchronizers/**',
            'test/unit/core/types/types.test.tsx',
            'test/unit/documentation.test.ts',
            'test/unit/persisters/**/*.test.ts',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-charts',
          include: ['test/unit/core/ui-react/ui-react-dom-charts.test.tsx'],
          sequence: {groupOrder: 1},
          maxWorkers: 1,
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-synchronizers',
          include: ['test/unit/synchronizers/**/*.test.ts'],
          sequence: {groupOrder: 2},
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-types',
          include: ['test/unit/core/types/types.test.tsx'],
          sequence: {groupOrder: 3},
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-documentation',
          include: ['test/unit/documentation.test.ts'],
          sequence: {groupOrder: 4},
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-persisters',
          include: ['test/unit/persisters/**/*.test.ts'],
          sequence: {groupOrder: 5},
          maxWorkers: 2,
          // Opening a database (PGlite in particular) can be slow under load.
          hookTimeout: 30000,
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-persisters-servers',
          include: [
            'test/unit/persisters/persisters.test.ts',
            'test/unit/persisters/mergeable.test.ts',
            'test/unit/persisters/database/json.test.ts',
            'test/unit/persisters/database/tabular.test.ts',
            'test/unit/persisters/database/mergeable-json.test.ts',
          ],
          sequence: {groupOrder: 6},
          maxWorkers: 2,
          hookTimeout: 30000,
          provide: {servers: true},
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-documentation-servers',
          include: ['test/unit/documentation.test.ts'],
          sequence: {groupOrder: 7},
          provide: {servers: true},
        },
      },
      {
        extends: true,
        oxc: false,
        plugins: [
          solid({
            dev: false,
            hot: false,
            include: [
              'src/ui-solid/**/*.tsx',
              'src/ui-solid-dom/**/*.tsx',
              'src/ui-solid-inspector/**/*.tsx',
              'test/unit/core/ui-solid/**/*.tsx',
            ],
            solid: {delegateEvents: false},
          }),
        ],
        esbuild: {
          logOverride: {'unsupported-jsx-comment': 'silent'},
        },
        resolve: {conditions: ['browser', 'development']},
        test: {
          name: 'solid',
          server: {deps: {inline: [/solid-js/]}},
          include: [
            'test/unit/core/ui-solid/**/*.test.ts',
            'test/unit/core/ui-solid/**/*.test.tsx',
          ],
          exclude: ['test/unit/core/ui-solid/primitives-ssr.test.ts'],
        },
      },
      {
        extends: true,
        resolve: {conditions: ['node', 'development']},
        test: {
          name: 'solid-ssr',
          environment: 'node',
          server: {deps: {inline: [/solid-js/]}},
          include: ['test/unit/core/ui-solid/primitives-ssr.test.ts'],
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
