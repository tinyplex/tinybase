import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMTestUtils from 'react-dom/test-utils';
import * as TinyBase from '../../lib/debug/tinybase';
import * as TinyBaseReact from '../../lib/debug/ui-react';
import {join, resolve} from 'path';
import {readFileSync, readdirSync} from 'fs';
import {transformSync} from 'esbuild';

[TinyBase, TinyBaseReact, ReactDOMTestUtils, {React, ReactDOM}].forEach(
  (module) =>
    Object.entries(module).forEach(([key, value]) => {
      (globalThis as any)[key] = value;
    }),
);

type Results = [any, any][];

const resultsByName: {[name: string]: () => Promise<Results>} = {};

const AsyncFunction = Object.getPrototypeOf(async () => null).constructor;

const forEachDeepFile = (
  dir: string,
  callback: (file: string) => void,
  extension = '',
): void =>
  forEachDirAndFile(
    dir,
    (dir) => forEachDeepFile(dir, callback, extension),
    (file) => callback(file),
    extension,
  );

const forEachDirAndFile = (
  dir: string,
  dirCallback: ((dir: string) => void) | null,
  fileCallback?: (file: string) => void,
  extension = '',
): void =>
  readdirSync(dir, {withFileTypes: true}).forEach((entry) => {
    const path = resolve(join(dir, entry.name));
    entry.isDirectory()
      ? dirCallback?.(path)
      : path.endsWith(extension)
      ? fileCallback?.(path)
      : null;
  });

const prepareTestResultsFromBlock = (block: string, prefix: string): void => {
  const name = prefix + ' - ' + block.match(/(?<=^).*?(?=\n)/) ?? '';
  let count = 1;
  let suffixedName = name;
  while (resultsByName[suffixedName] != null) {
    suffixedName = name + ' ' + ++count;
  }

  const tsx = block
    .match(/(?<=```[tj]sx?\n).*?(?=```)/gms)
    ?.join('\n')
    ?.trim();
  if (tsx == null) {
    return;
  }

  let problem;
  if (tsx != '') {
    const realTsx =
      tsx
        ?.replace(/console\.log/gm, '_actual.push')
        ?.replace(
          /\/\/ -> (.+?)\s(.*?Event\(.*?)$/gm,
          '$1.dispatchEvent(new $2);\n',
        )
        ?.replace(/\/\/ -> (.*?Event\(.*?)$/gm, 'dispatchEvent(new $1);\n')
        ?.replace(/\/\/ -> (.*?)$/gm, '_expected.push($1);\n')
        ?.replace(
          /\/\/ \.\.\. \/\/ !act$/gm,
          'await act(async () => {await 0;});\n',
        )
        ?.replace(/\/\/ \.\.\.$/gm, 'await 0;\n')
        ?.replace(/^(.*?) \/\/ !act$/gm, 'act(() => {$1});')
        ?.replace(/\n+/g, '\n') ?? '';
    // lol what could go wrong
    try {
      const js = transformSync(realTsx, {loader: 'tsx'});
      resultsByName[suffixedName] = new AsyncFunction(`
        const _expected = [];
        const _actual = [];
        ${js.code}
        return Array(Math.max(_expected.length, _actual.length))
          .fill('')
          .map((_, r) => [_expected[r], _actual[r]]);`);
    } catch (e: any) {
      problem = `Could not parse example:\n-\n${name}\n-\n${e}\n-\n${realTsx}`;
    }
  } else {
    problem = `Could not find JavaScript in example: ${name}`;
  }
  expect(problem).toBeUndefined();
};

describe('Documentation tests', () => {
  // forEachDeepFile(
  //   'src',
  //   (file) =>
  //     readFileSync(file, 'utf-8')
  //       .match(/(?<=\* @example\n).*?(?=\s*(\*\/|\* @))/gms)
  //       ?.map((examples) => examples.replace(/^\s*?\* ?/gms, ''))
  //       ?.forEach((block) => prepareTestResultsFromBlock(block, file)),
  //   '.d.ts',
  // );
  ['site/guides', 'site/home'].forEach((root) =>
    forEachDeepFile(
      root,
      (file) => prepareTestResultsFromBlock(readFileSync(file, 'utf-8'), file),
      'tinyql.md',
    ),
  );

  test.each(Object.entries(resultsByName))('%s', async (_name, getResults) => {
    const results = await getResults();
    results.forEach(([expectedResult, actualResult]) => {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(actualResult).toEqual(expectedResult);
    });
  });
});
