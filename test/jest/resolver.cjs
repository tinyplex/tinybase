module.exports = (path, options) =>
  options.defaultResolver(path, {
    ...options,
    packageFilter: (packageJson) => {
      if (
        packageJson.name === 'uuid' ||
        packageJson.name === '@automerge/automerge-wasm'
      ) {
        delete packageJson.exports;
        delete packageJson.module;
      }

      if (packageJson.name === '@libsql/client') {
        packageJson.main = 'lib-esm/node.js';
        delete packageJson.exports;
      }

      if (packageJson.name === '@libsql/hrana-client') {
        packageJson.main = 'lib-esm/index.js';
        delete packageJson.exports;
      }

      if (packageJson.name === '@libsql/isomorphic-fetch') {
        packageJson.main = 'node.js';
        delete packageJson.exports;
      }

      if (packageJson.name === 'ws') {
        delete packageJson.exports;
      }

      return packageJson;
    },
  });
