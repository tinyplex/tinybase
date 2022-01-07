// For Jest tests only

module.exports = {
  presets: [
    ['@babel/preset-typescript'],
    ['@babel/react'],
    ['@babel/env', {targets: {node: 'current'}, modules: 'commonjs'}],
  ],
};
