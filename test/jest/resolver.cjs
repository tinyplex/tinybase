module.exports = (path, options) =>
  options.defaultResolver(path, {
    ...options,
    packageFilter: (packageJson) => {
      if (packageJson.name === 'uuid') {
        delete packageJson.exports;
        delete packageJson.module;
      }

      if (packageJson.name === '@libsql/client') {
        packageJson.main = 'lib-esm/node.js';
        delete packageJson['exports'];
      }

      if (packageJson.name === '@libsql/hrana-client') {
        packageJson.main = 'lib-esm/index.js';
        delete packageJson.exports;
      }

      if (packageJson.name === '@libsql/isomorphic-fetch') {
        packageJson.main = 'node.js';
        delete packageJson.exports;
      }

      return packageJson;
    },
    pathFilter: (packageJson, _, relativePath) => {
      if (
        packageJson.name == '@automerge/automerge' &&
        relativePath == 'dist/cjs/slim_next.cjs'
      ) {
        return 'dist/cjs/fullfat_base64.cjs';
      }
      return relativePath;
    },
  });
