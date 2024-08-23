// For Jest tests only

module.exports = {
  presets: [
    ['@babel/preset-typescript'],
    ['@babel/react'],
    ['@babel/env', {targets: {node: 'current'}, modules: 'commonjs'}],
  ],
  plugins: [
    ['babel-plugin-transform-import-meta', {module: 'ES6'}],
    'babel-plugin-transform-vite-meta-env',
  ],
};
