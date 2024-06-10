import 'fake-indexeddb/auto';
import * as AutomergeRepo from '@automerge/automerge-repo';
import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import * as ReactDOMTestUtils from 'react-dom/test-utils';
import * as TinyBase from 'tinybase/debug';
import * as TinyBasePersisterAutomerge from 'tinybase/debug/persisters/persister-automerge';
import * as TinyBasePersisterBrowser from 'tinybase/debug/persisters/persister-browser';
import * as TinyBasePersisterCrSqliteWasm from 'tinybase/debug/persisters/persister-cr-sqlite-wasm';
import * as TinyBasePersisterFile from 'tinybase/debug/persisters/persister-file';
import * as TinyBasePersisterIndexedDb from 'tinybase/debug/persisters/persister-indexed-db';
import * as TinyBasePersisterPartyKitClient from 'tinybase/debug/persisters/persister-partykit-client';
import * as TinyBasePersisterPartyKitServer from 'tinybase/debug/persisters/persister-partykit-server';
import * as TinyBasePersisterRemote from 'tinybase/debug/persisters/persister-remote';
import * as TinyBasePersisterSqlite3 from 'tinybase/debug/persisters/persister-sqlite3';
import * as TinyBasePersisterSqliteWasm from 'tinybase/debug/persisters/persister-sqlite-wasm';
import * as TinyBasePersisterYjs from 'tinybase/debug/persisters/persister-yjs';
import * as TinyBaseSynchronizerLocal from 'tinybase/debug/synchronizers/synchronizer-local';
import * as TinyBaseSynchronizerWsClient from 'tinybase/debug/synchronizers/synchronizer-ws-client';
import * as TinyBaseSynchronizerWsServer from 'tinybase/debug/synchronizers/synchronizer-ws-server';
import * as TinyBaseTools from 'tinybase/debug/tools';
import * as TinyBaseUiReact from 'tinybase/debug/ui-react';
import * as TinyBaseUiReactDom from 'tinybase/debug/ui-react-dom';
import * as TinyBaseUiReactInspector from 'tinybase/debug/ui-react-inspector';
import * as sqlite3 from 'sqlite3';
import * as ws from 'ws';
import * as yjs from 'yjs';
import {join, resolve} from 'path';
import {mockFetchWasm, pause, suppressWarnings} from './common/other.ts';
import {readFileSync, readdirSync} from 'fs';
import {AutomergeTestNetworkAdapter as BroadcastChannelNetworkAdapter} from './common/automerge-adaptor.ts';
import initWasm from '@vlcn.io/crsqlite-wasm';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import {transformSync} from 'esbuild';

// globally present; do not need to be imported in examples
[ReactDOMTestUtils].forEach((module) =>
  Object.entries(module).forEach(([key, value]) => {
    (globalThis as any)[key] = value;
  }),
);

// need to be imported in examples
(globalThis as any).modules = {
  '@automerge/automerge-repo': AutomergeRepo,
  '@automerge/automerge-repo-network-broadcastchannel': {
    BroadcastChannelNetworkAdapter,
  },
  '@sqlite.org/sqlite-wasm': sqlite3InitModule,
  '@vlcn.io/crsqlite-wasm': initWasm,
  react: React,
  'react-dom/client': ReactDOMClient,
  sqlite3,
  tinybase: TinyBase,
  'tinybase/debug/ui-react': TinyBaseUiReact,
  'tinybase/debug/ui-react-dom': TinyBaseUiReactDom,
  'tinybase/persisters/persister-automerge': TinyBasePersisterAutomerge,
  'tinybase/persisters/persister-browser': TinyBasePersisterBrowser,
  'tinybase/persisters/persister-cr-sqlite-wasm': TinyBasePersisterCrSqliteWasm,
  'tinybase/persisters/persister-file': TinyBasePersisterFile,
  'tinybase/persisters/persister-indexed-db': TinyBasePersisterIndexedDb,
  'tinybase/persisters/persister-partykit-client':
    TinyBasePersisterPartyKitClient,
  'tinybase/persisters/persister-partykit-server':
    TinyBasePersisterPartyKitServer,
  'tinybase/persisters/persister-remote': TinyBasePersisterRemote,
  'tinybase/persisters/persister-sqlite3': TinyBasePersisterSqlite3,
  'tinybase/persisters/persister-sqlite-wasm': TinyBasePersisterSqliteWasm,
  'tinybase/persisters/persister-yjs': TinyBasePersisterYjs,
  'tinybase/synchronizers/synchronizer-local': TinyBaseSynchronizerLocal,
  'tinybase/synchronizers/synchronizer-ws-client': TinyBaseSynchronizerWsClient,
  'tinybase/synchronizers/synchronizer-ws-server': TinyBaseSynchronizerWsServer,
  'tinybase/tools': TinyBaseTools,
  'tinybase/ui-react': TinyBaseUiReact,
  'tinybase/ui-react-dom': TinyBaseUiReactDom,
  'tinybase/ui-react-inspector': TinyBaseUiReactInspector,
  ws,
  yjs,
};

Object.assign(globalThis as any, {
  IS_REACT_ACT_ENVIRONMENT: true,
  pause,
});

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
          'act(() => $1.dispatchEvent(new $2));\n',
        )
        ?.replace(
          /\/\/ -> (.*?Event\(.*?)$/gm,
          'act(() => dispatchEvent(new $1));\n',
        )
        ?.replace(
          /\/\/ ->\n`(.*?)`;$/gms,
          '_expected.push(`$1`.replace(/\\n\\s*/gms, ``));\n',
        )
        ?.replace(/\/\/ -> (.*?)$/gm, '_expected.push($1);\n')
        ?.replace(
          /\/\/ \.\.\. \/\/ !act$/gm,
          'await act(async () => {await pause();});\n',
        )
        ?.replace(/\/\/ \.\.\.$/gm, 'await pause();\n')
        ?.replace(/^(.*?) \/\/ !act$/gm, 'act(() => {$1});')
        ?.replace(/^(.*?) \/\/ !yolo$/gm, '')
        ?.replace(/\n+/g, '\n')
        ?.replace(
          /import (type )?(.*?) from '(.*?)';/gms,
          'const $2 = modules[`$3`];',
        )
        ?.replace(/export (const|class) /gm, '$1 ') ?? '';
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
  forEachDeepFile(
    'src/@types',
    (file) =>
      readFileSync(file, 'utf-8')
        .match(/(?<=\* @example\n).*?(?=\s*(\*\/|\* @))/gms)
        ?.map((examples) => examples.replace(/^\s*?\* ?/gms, ''))
        ?.forEach((block) => prepareTestResultsFromBlock(block, file)),
    '.js',
  );
  ['site/guides', 'site/home'].forEach((root) =>
    forEachDeepFile(
      root,
      (file) => prepareTestResultsFromBlock(readFileSync(file, 'utf-8'), file),
      '.md',
    ),
  );

  test.each(Object.entries(resultsByName))('%s', async (_name, getResults) => {
    mockFetchWasm();
    const results = await suppressWarnings(getResults);
    results.forEach(([expectedResult, actualResult]) => {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(actualResult).toEqual(expectedResult);
    });
  });
});
