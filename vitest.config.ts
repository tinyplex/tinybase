import {coverageConfigDefaults, defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['vitest/custom/setup.ts'],
    reporters: [['vitest/custom/reporter.ts']],
    coverage: {
      enabled: true,
      provider: 'istanbul',
      exclude: coverageConfigDefaults.exclude.filter((e) => e !== 'dist/**'),
      include: ['dist/index.js', 'dist/ui-react/index.js'],
      reportsDirectory: './tmp/coverage',
      reporter: ['text-summary', 'html'],
    },
  },
});
