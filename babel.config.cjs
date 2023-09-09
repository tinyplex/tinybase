// For Jest tests only

module.exports = {
  presets: [
    ['@babel/preset-typescript'],
    ['@babel/react'],
    ['@babel/env', {targets: {node: 'current'}, modules: 'commonjs'}],
  ],
  plugins: [
    'babel-plugin-transform-import-meta',
    'babel-plugin-transform-vite-meta-env',
  ],
};
