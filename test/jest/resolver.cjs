module.exports = (path, options) =>
  options.defaultResolver(path, {
    ...options,
    packageFilter: (packageJson) => {
      if (packageJson.name === 'uuid') {
        delete packageJson['exports'];
      }
      return packageJson;
    },
  });
