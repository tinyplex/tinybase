import {vitePreprocess} from '@sveltejs/vite-plugin-svelte';

const isNodeModule = (filename) =>
  filename.includes('/node_modules/') || filename.includes('\\node_modules\\');

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: ({filename}) => (isNodeModule(filename) ? undefined : true),
  },
};
