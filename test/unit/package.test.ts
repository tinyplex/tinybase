import {readFileSync} from 'fs';
import {expect, test} from 'vitest';

const exports = JSON.parse(readFileSync('dist/package.json', 'utf8')).exports;

test.each(['ui-solid-dom', 'ui-svelte-dom'])(
  '%s is exported for browsers only',
  (module) => {
    expect(exports[`./${module}`]).toEqual({
      types: `./@types/${module}/index.d.ts`,
      browser: `./${module}/index.js`,
    });
    expect(exports[`./${module}/with-schemas`]).toEqual({
      types: `./@types/${module}/with-schemas/index.d.ts`,
      browser: `./${module}/index.js`,
    });
  },
);
