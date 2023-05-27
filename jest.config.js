export default {
  verbose: false,
  extensionsToTreatAsEsm: ['.jsx', '.ts', '.tsx', '.mts'],
  resolver: '<rootDir>/test/jest/resolver.cjs',
  transform: {
    '^.+\\.m?[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: 'test/tsconfig.json',
        useESM: true,
        diagnostics: {ignoreCodes: ['TS151001']},
      },
    ],
  },
};
