export default {
  verbose: false,
  extensionsToTreatAsEsm: ['.jsx', '.ts', '.tsx', '.mts'],
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
