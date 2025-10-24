import * as AutomergeRepo from '@automerge/automerge-repo';
import * as pglite from '@electric-sql/pglite';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import initWasm from '@vlcn.io/crsqlite-wasm';
import {transformSync} from 'esbuild';
import 'fake-indexeddb/auto';
import * as fs from 'fs';
import {readFileSync, readdirSync} from 'fs';
import {join, resolve} from 'path';
import postgres from 'postgres';
import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import * as sqlite3 from 'sqlite3';
import type {Id} from 'tinybase';
import * as TinyBase from 'tinybase';
import * as TinyBasePersisters from 'tinybase/persisters';
import * as TinyBasePersisterAutomerge from 'tinybase/persisters/persister-automerge';
import * as TinyBasePersisterBrowser from 'tinybase/persisters/persister-browser';
import * as TinyBasePersisterCrSqliteWasm from 'tinybase/persisters/persister-cr-sqlite-wasm';
import * as TinyBasePersisterFile from 'tinybase/persisters/persister-file';
import * as TinyBasePersisterIndexedDb from 'tinybase/persisters/persister-indexed-db';
import * as TinyBasePersisterPartyKitClient from 'tinybase/persisters/persister-partykit-client';
import * as TinyBasePersisterPartyKitServer from 'tinybase/persisters/persister-partykit-server';
import * as TinyBasePersisterPglite from 'tinybase/persisters/persister-pglite';
import * as TinyBasePersisterPostgres from 'tinybase/persisters/persister-postgres';
import * as TinyBasePersisterRemote from 'tinybase/persisters/persister-remote';
import * as TinyBasePersisterBun from 'tinybase/persisters/persister-sqlite-bun';
import * as TinyBasePersisterSqliteWasm from 'tinybase/persisters/persister-sqlite-wasm';
import * as TinyBasePersisterSqlite3 from 'tinybase/persisters/persister-sqlite3';
import * as TinyBasePersisterYjs from 'tinybase/persisters/persister-yjs';
import * as TinyBaseSynchronizers from 'tinybase/synchronizers';
import * as TinyBaseSynchronizerBroadcastChannel from 'tinybase/synchronizers/synchronizer-broadcast-channel';
import * as TinyBaseSynchronizerLocal from 'tinybase/synchronizers/synchronizer-local';
import * as TinyBaseSynchronizerWsClient from 'tinybase/synchronizers/synchronizer-ws-client';
import * as TinyBaseSynchronizerWsServer from 'tinybase/synchronizers/synchronizer-ws-server';
import * as TinyBaseSynchronizerWsServerSimple from 'tinybase/synchronizers/synchronizer-ws-server-simple';
import * as TinyBaseUiReact from 'tinybase/ui-react';
import * as TinyBaseUiReactDom from 'tinybase/ui-react-dom';
import * as TinyBaseUiReactInspector from 'tinybase/ui-react-inspector';
import {beforeAll, describe, expect, test} from 'vitest';
import * as ws from 'ws';
import * as yjs from 'yjs';
import {AutomergeTestNetworkAdapter as BroadcastChannelNetworkAdapter} from './common/automerge-adaptor.ts';
import {getTimeFunctions} from './common/mergeable.ts';
import {
  AsyncFunction,
  importBunSqlite,
  isBun,
  pause,
  suppressWarnings,
} from './common/other.ts';

const [reset, getNow] = getTimeFunctions();

const originalCreateMergeableStore = TinyBase.createMergeableStore;
const TinyBaseForTest = {
  ...TinyBase,
  createMergeableStore: (uniqueId?: Id) =>
    originalCreateMergeableStore(uniqueId, getNow),
};

// need to be imported in examples
(globalThis as any).modules = {
  '@automerge/automerge-repo': AutomergeRepo,
  '@automerge/automerge-repo-network-broadcastchannel': {
    BroadcastChannelNetworkAdapter,
  },
  '@sqlite.org/sqlite-wasm': sqlite3InitModule,
  '@vlcn.io/crsqlite-wasm': initWasm,
  fs,
  postgres,
  '@electric-sql/pglite': pglite,
  react: React,
  'react-dom/client': ReactDOMClient,
  sqlite3,
  tinybase: TinyBaseForTest,
  'tinybase/ui-react': TinyBaseUiReact,
  'tinybase/ui-react-dom': TinyBaseUiReactDom,
  'tinybase/persisters': TinyBasePersisters,
  'tinybase/persisters/persister-automerge': TinyBasePersisterAutomerge,
  'tinybase/persisters/persister-browser': TinyBasePersisterBrowser,
  'tinybase/persisters/persister-cr-sqlite-wasm': TinyBasePersisterCrSqliteWasm,
  'tinybase/persisters/persister-file': TinyBasePersisterFile,
  'tinybase/persisters/persister-indexed-db': TinyBasePersisterIndexedDb,
  'tinybase/persisters/persister-partykit-client':
    TinyBasePersisterPartyKitClient,
  'tinybase/persisters/persister-partykit-server':
    TinyBasePersisterPartyKitServer,
  'tinybase/persisters/persister-pglite': TinyBasePersisterPglite,
  'tinybase/persisters/persister-postgres': TinyBasePersisterPostgres,
  'tinybase/persisters/persister-remote': TinyBasePersisterRemote,
  'tinybase/persisters/persister-sqlite3': TinyBasePersisterSqlite3,
  'tinybase/persisters/persister-sqlite-bun': TinyBasePersisterBun,
  'tinybase/persisters/persister-sqlite-wasm': TinyBasePersisterSqliteWasm,
  'tinybase/persisters/persister-yjs': TinyBasePersisterYjs,
  'tinybase/synchronizers': TinyBaseSynchronizers,
  'tinybase/synchronizers/synchronizer-local': TinyBaseSynchronizerLocal,
  'tinybase/synchronizers/synchronizer-ws-client': TinyBaseSynchronizerWsClient,
  'tinybase/synchronizers/synchronizer-ws-server': TinyBaseSynchronizerWsServer,
  'tinybase/synchronizers/synchronizer-ws-server-simple':
    TinyBaseSynchronizerWsServerSimple,
  'tinybase/synchronizers/synchronizer-broadcast-channel':
    TinyBaseSynchronizerBroadcastChannel,
  'tinybase/ui-react-inspector': TinyBaseUiReactInspector,
  ws,
  yjs,
};

Object.assign(globalThis as any, {
  reset,
  pause,
  act: React.act,
});

type Results = [any, any][];

const resultsByName: {[name: string]: () => Promise<Results>} = {};

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
    if (entry.isDirectory()) {
      dirCallback?.(path);
    } else if (path.endsWith(extension)) {
      fileCallback?.(path);
    }
  });

const prepareTestResultsFromBlock = (block: string, prefix: string): void => {
  const name = prefix + ' - ' + (block.match(/(?<=^).*?(?=\n)/) ?? '');
  let count = 1;
  let suffixedName = name;
  while (resultsByName[suffixedName] != null) {
    suffixedName = name + ' ' + ++count;
  }

  const tsx = block
    .match(
      new RegExp(
        '(?<=```[tj]sx?' + (isBun ? ' bun' : '') + '\\n).*?(?=```)',
        'gms',
      ),
    )
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
          /\/\/ ->\n(.*?);$/gms,
          (match, expected) =>
            '_expected.push(' + expected.replace(/\n\s*/gms, ``) + ');\n',
        )
        ?.replace(/\/\/ -> (.*?)$/gm, '_expected.push($1);\n')
        ?.replace(/\/\/ \.\.\. \/\/ !act$/gm, 'await act(pause);\n')
        ?.replace(/\/\/ \.\.\.$/gm, 'await pause();\n')
        ?.replace(/^(.*?) \/\/ !act$/gm, 'act(() => {$1});')
        ?.replace(/^(.*?) \/\/ !yolo$/gm, '')
        ?.replace(/\/\/ !reset$/gm, 'reset();')
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
  beforeAll(async () => {
    if (isBun) {
      (globalThis as any).modules['bun:sqlite'] = await importBunSqlite();
    }
  });

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
    const results = await suppressWarnings(getResults);
    results.forEach(([expectedResult, actualResult]) => {
      expect(actualResult).toEqual(expectedResult);
    });
  });
});
