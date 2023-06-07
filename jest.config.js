export default {
  verbose: false,
  resolver: '<rootDir>/test/jest/resolver.cjs',
  transformIgnorePatterns: [
    // eslint-disable-next-line max-len
    '<rootDir>/node_modules/(?!(automerge-repo|cbor-x|@sqlite.org/sqlite-wasm)/.*)',
  ],
  transform: {'^.+\\.(mjs|js|jsx|ts|tsx)?$': 'babel-jest'},
};
