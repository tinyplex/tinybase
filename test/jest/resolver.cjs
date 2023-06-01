module.exports = (path, options) =>
  options.defaultResolver(path, {
    ...options,
    packageFilter: (packageJson) => {
      if (
        packageJson.name === 'uuid' ||
        packageJson.name === '@automerge/automerge-wasm'
      ) {
        delete packageJson['exports'];
        delete packageJson['module'];
      }
      return packageJson;
    },
  });
