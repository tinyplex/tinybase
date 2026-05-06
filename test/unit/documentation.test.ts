import * as AutomergeRepo from '@automerge/automerge-repo';
import * as pglite from '@electric-sql/pglite';
import * as typeBox from '@sinclair/typebox';
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import initWasm from '@vlcn.io/crsqlite-wasm';
import * as arktype from 'arktype';
import * as effectSchema from 'effect/Schema';
import {build, transformSync} from 'esbuild';
import 'fake-indexeddb/auto';
import * as fs from 'fs';
import {readFileSync, readdirSync} from 'fs';
import {createRequire} from 'module';
import {dirname, extname, join, resolve} from 'path';
import postgres from 'postgres';
import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import * as Solid from 'solid-js';
import type * as SolidWebTypes from 'solid-js/web';
import * as sqlite3 from 'sqlite3';
import * as Svelte from 'svelte';
import {compileModule, compile as compileSvelte} from 'svelte/compiler';
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
import * as TinyBaseSchematizers from 'tinybase/schematizers';
import * as TinyBaseSchematizersArkType from 'tinybase/schematizers/schematizer-arktype';
import * as TinyBaseSchematizersEffect from 'tinybase/schematizers/schematizer-effect';
import * as TinyBaseSchematizersTypeBox from 'tinybase/schematizers/schematizer-typebox';
import * as TinyBaseSchematizersValibot from 'tinybase/schematizers/schematizer-valibot';
import * as TinyBaseSchematizersYup from 'tinybase/schematizers/schematizer-yup';
import * as TinyBaseSchematizersZod from 'tinybase/schematizers/schematizer-zod';
import * as TinyBaseSynchronizers from 'tinybase/synchronizers';
import * as TinyBaseSynchronizerBroadcastChannel from 'tinybase/synchronizers/synchronizer-broadcast-channel';
import * as TinyBaseSynchronizerLocal from 'tinybase/synchronizers/synchronizer-local';
import * as TinyBaseSynchronizerWsClient from 'tinybase/synchronizers/synchronizer-ws-client';
import * as TinyBaseSynchronizerWsServer from 'tinybase/synchronizers/synchronizer-ws-server';
import * as TinyBaseSynchronizerWsServerSimple from 'tinybase/synchronizers/synchronizer-ws-server-simple';
import * as TinyBaseUiReact from 'tinybase/ui-react';
import * as TinyBaseUiReactDom from 'tinybase/ui-react-dom';
import * as TinyBaseUiReactInspector from 'tinybase/ui-react-inspector';
import * as TinyBaseUiSolid from 'tinybase/ui-solid';
import * as TinyBaseUiSvelte from 'tinybase/ui-svelte';
import * as TinyBaseUiSvelteDom from 'tinybase/ui-svelte-dom';
import * as TinyBaseUiSvelteInspector from 'tinybase/ui-svelte-inspector';
import * as valibot from 'valibot';
import {beforeAll, describe, expect, test} from 'vitest';
import * as ws from 'ws';
import * as yjs from 'yjs';
import * as yup from 'yup';
import * as zod from 'zod';
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
const nodeRequire = createRequire(import.meta.url);
const SolidBrowser = nodeRequire('solid-js/dist/solid.cjs') as typeof Solid;
(nodeRequire.cache as any)[nodeRequire.resolve('solid-js')] = {
  exports: SolidBrowser,
};
const SolidWeb = nodeRequire(
  'solid-js/web/dist/web.cjs',
) as typeof SolidWebTypes;

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
  '@electric-sql/pglite': pglite,
  '@sinclair/typebox': typeBox,
  '@sqlite.org/sqlite-wasm': sqlite3InitModule,
  '@vlcn.io/crsqlite-wasm': initWasm,
  arktype,
  fs,
  postgres,
  react: React,
  'react-dom/client': ReactDOMClient,
  'solid-js': SolidBrowser,
  'solid-js/web': SolidWeb,
  svelte: Svelte,
  sqlite3,
  tinybase: TinyBaseForTest,
  'tinybase/ui-react': TinyBaseUiReact,
  'tinybase/ui-react-dom': TinyBaseUiReactDom,
  'tinybase/ui-solid': TinyBaseUiSolid,
  'tinybase/ui-svelte': TinyBaseUiSvelte,
  'tinybase/ui-svelte-dom': TinyBaseUiSvelteDom,
  'tinybase/ui-svelte-inspector': TinyBaseUiSvelteInspector,
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
  'tinybase/schematizers': TinyBaseSchematizers,
  'tinybase/schematizers/schematizer-arktype': TinyBaseSchematizersArkType,
  'tinybase/schematizers/schematizer-effect': TinyBaseSchematizersEffect,
  'tinybase/schematizers/schematizer-typebox': TinyBaseSchematizersTypeBox,
  'tinybase/schematizers/schematizer-valibot': TinyBaseSchematizersValibot,
  'tinybase/schematizers/schematizer-yup': TinyBaseSchematizersYup,
  'tinybase/schematizers/schematizer-zod': TinyBaseSchematizersZod,
  'tinybase/ui-react-inspector': TinyBaseUiReactInspector,
  'effect/Schema': effectSchema,
  valibot,
  ws,
  yjs,
  yup,
  zod,
};

Object.assign(globalThis as any, {
  reset,
  pause,
  act: React.act,
});

type Results = [any, any][];

const resultsByName: {[name: string]: () => Promise<Results>} = {};
const FILE_BLOCKS = /```([^\n]*)\n([\s\S]*?)```/g;
const FILE_MATCH = /\bfile=(\S+)/;
const SCRIPT_BLOCK = /^(?:[jt]sx?)$/;
const DOCS_SVELTE_SHIM_PATH = '/__docs__/svelte.ts';
const TINYBASE_CONTEXT_KEY = 'tinybase_uisc';
const TINYBASE_SOURCE_MODULES: {[path: string]: string} = {
  svelte: resolve('node_modules/svelte/src/index-client.js'),
  'svelte/internal/client': resolve(
    'node_modules/svelte/src/internal/client/index.js',
  ),
  'svelte/internal/disclose-version': resolve(
    'node_modules/svelte/src/internal/disclose-version.js',
  ),
  'svelte/reactivity': resolve(
    'node_modules/svelte/src/reactivity/index-client.js',
  ),
  'tinybase/ui-svelte': resolve('dist/ui-svelte/index.js'),
  'tinybase/ui-svelte/with-schemas': resolve(
    'dist/ui-svelte/with-schemas/index.js',
  ),
  'tinybase/ui-svelte-dom': resolve('dist/ui-svelte-dom/index.js'),
  'tinybase/ui-svelte-dom/with-schemas': resolve(
    'dist/ui-svelte-dom/with-schemas/index.js',
  ),
  'tinybase/ui-svelte-inspector': resolve('dist/ui-svelte-inspector/index.js'),
  'tinybase/ui-svelte-inspector/with-schemas': resolve(
    'dist/ui-svelte-inspector/with-schemas/index.js',
  ),
};
const resolveSvelteInternalImport = (path: string): string | undefined =>
  path.startsWith('#client/')
    ? resolve(
        'node_modules/svelte/src/internal/client',
        path.slice('#client/'.length) + (extname(path) == '' ? '.js' : ''),
      )
    : undefined;

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

const getRunnableImport = (
  _: string,
  typeOnly: string | undefined,
  imports: string,
  module: string,
): string => {
  if (typeOnly != null) {
    return '';
  }
  const moduleExpression = `modules[\`${module}\`]`;
  const trimmedImports = imports.trim();
  const defaultAndNamedImports = trimmedImports.match(/^(\w+),\s*({.*})$/s);
  if (defaultAndNamedImports != null) {
    return (
      `var ${defaultAndNamedImports[1]} = ` +
      `${moduleExpression}.default ?? ${moduleExpression};\n` +
      `var ${defaultAndNamedImports[2].replace(/\bas\b/g, ':')} = ` +
      `${moduleExpression};`
    );
  }
  if (trimmedImports.startsWith('{')) {
    return `var ${trimmedImports.replace(/\bas\b/g, ':')} = ${moduleExpression};`;
  }
  if (trimmedImports.startsWith('* as ')) {
    return `var ${trimmedImports.slice(5)} = ${moduleExpression};`;
  }
  return `var ${trimmedImports} = ${moduleExpression}.default ?? ${moduleExpression};`;
};

const replaceRunnableImports = (source: string): string =>
  source.replace(
    /import (type )?(.*?) from ['"](.*?)['"];/gms,
    getRunnableImport,
  );

const isSolidSource = (source: string): boolean =>
  source.includes("from 'solid-js") ||
  source.includes('from "solid-js') ||
  source.includes("from 'tinybase/ui-solid'") ||
  source.includes('from "tinybase/ui-solid"');

const transformSolidJsx = (source: string, loader: 'jsx' | 'tsx'): string =>
  `import {createComponent} from 'solid-js';\n${
    transformSync(source, {
      loader,
      jsxFactory: 'createComponent',
    }).code
  }`;

const prepareRunnableCode = (source: string, replaceImports: boolean): string =>
  (replaceImports ? replaceRunnableImports(source) : source)
    .replace(
      /console\.log\((.+?)\.innerHTML\);$/gm,
      '_actual.push(getHtml($1));',
    )
    .replace(/console\.log/gm, '_actual.push')
    .replace(
      /\/\/ -> (.+?)\s(.*?Event\(.*?)$/gm,
      'act(() => $1.dispatchEvent(new $2));\n',
    )
    .replace(
      /\/\/ -> (.*?Event\(.*?)$/gm,
      'act(() => dispatchEvent(new $1));\n',
    )
    .replace(
      /\/\/ ->\n(.*?);$/gms,
      (match, expected) =>
        '_expected.push(' + expected.replace(/\n\s*/gms, ``) + ');\n',
    )
    .replace(/\/\/ -> (.*?)$/gm, '_expected.push($1);\n')
    .replace(/\/\/ \.\.\. \/\/ !act$/gm, 'await act(pause);\n')
    .replace(/\/\/ \.\.\.$/gm, 'await pause();\n')
    .replace(/^(.*?) \/\/ !act$/gm, 'act(() => {$1});')
    .replace(/^(.*?) \/\/ !ignore$/gm, '')
    .replace(/\/\/ !reset$/gm, 'reset();')
    .replace(/\n+/g, '\n')
    .replace(/export (const|class) /gm, '$1 ');

const parseCodeBlocks = (block: string) =>
  [...block.matchAll(FILE_BLOCKS)].map(([, info = '', content = '']) => ({
    content: content.trim(),
    file: info.match(FILE_MATCH)?.[1],
    info,
    lang: info.trim().split(/\s+/, 1)[0] ?? '',
  }));

const splitImports = (source: string): [imports: string, body: string] => {
  const lines = source.split('\n');
  let index = 0;
  for (; index < lines.length; index++) {
    const line = lines[index];
    if (line.trim() == '' || line.trim().startsWith('import ')) {
      continue;
    }
    break;
  }
  return [lines.slice(0, index).join('\n'), lines.slice(index).join('\n')];
};

const HTML_HELPERS = `
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);
const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
const serializeNode = (node, index = 0, siblings = [node]) => {
  if (node == null || node.nodeType === Node.COMMENT_NODE) {
    return '';
  }
  if (node.nodeType === Node.TEXT_NODE) {
    let text = (node.textContent ?? '').replace(/\\s+/g, ' ');
    if (text.trim() === '') {
      return siblings[index - 1]?.nodeType === Node.TEXT_NODE &&
        siblings[index + 1]?.nodeType === Node.TEXT_NODE
        ? ' '
        : '';
    }
    if (index === 0) {
      text = text.trimStart();
    }
    if (siblings[index - 1]?.nodeType === Node.ELEMENT_NODE) {
      text = text.trimStart();
    }
    if (siblings[index + 1]?.nodeType === Node.ELEMENT_NODE) {
      text = text.trimEnd();
    }
    if (index === siblings.length - 1) {
      text = text.trimEnd();
    }
    return text;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }
  const element = node;
  const tag = element.tagName.toLowerCase();
  const attrs = element.getAttributeNames().map((name) => [
    name,
    element.getAttribute(name) ?? '',
  ]);
  if (
    tag === 'input' &&
    !element.hasAttribute('value') &&
    element.value !== ''
  ) {
    attrs.push(['value', element.value]);
  }
  const attrsText = attrs
    .map(([name, value]) => \` \${name}="\${escapeHtml(value)}"\`)
    .join('');
  const children = getHtml(element);
  return VOID_ELEMENTS.has(tag)
    ? \`<\${tag}\${attrsText}>\`
    : \`<\${tag}\${attrsText}>\${children}</\${tag}>\`;
};
const getHtml = (element) =>
  Array.from(element.childNodes)
    .filter((node) => node.nodeType !== Node.COMMENT_NODE)
    .map((node, index, siblings) => serializeNode(node, index, siblings))
    .join('')
    .replace(/ {2,}/g, ' ');
`;

const replaceSvelteImports = (source: string): string =>
  source.replace(/from ['"]svelte['"]/g, `from '${DOCS_SVELTE_SHIM_PATH}'`);

const isSvelteModule = (path: string): boolean => /\.svelte\.[jt]s$/.test(path);

const compileSvelteModule = (source: string, path: string): string =>
  compileModule(
    transformSync(source, {
      format: 'esm',
      loader: extname(path).slice(1) as 'js' | 'ts',
      target: 'esnext',
    }).code,
    {
      filename: path,
      generate: 'client',
    },
  ).js.code;

const prepareBundledResults = async (
  files: {[path: string]: string},
  entryPath: string,
): Promise<Results> => {
  const allFiles: {[path: string]: string} = {
    ...files,
    [DOCS_SVELTE_SHIM_PATH]: `import * as Svelte from 'svelte';

const getContextValue = (props = {}) => [
  props.store,
  props.storesById,
  props.metrics,
  props.metricsById,
  props.indexes,
  props.indexesById,
  props.relationships,
  props.relationshipsById,
  props.queries,
  props.queriesById,
  props.checkpoints,
  props.checkpointsById,
  props.persister,
  props.persistersById,
  props.synchronizer,
  props.synchronizersById,
  undefined,
  undefined,
];

export * from 'svelte';

export const mount = (component, options = {}) => {
  const context = new Map(options.context ?? []);
  if (!context.has('${TINYBASE_CONTEXT_KEY}')) {
    context.set('${TINYBASE_CONTEXT_KEY}', getContextValue(options.props));
  }
  const instance = Svelte.mount(component, {
    ...options,
    context,
  });
  Svelte.flushSync();
  return {
    destroy: () => Svelte.flushSync(() => Svelte.unmount(instance)),
  };
};`,
  };
  const result = await build({
    bundle: true,
    entryPoints: [entryPath],
    format: 'cjs',
    platform: 'node',
    write: false,
    plugins: [
      {
        name: 'docs-virtual',
        setup(build) {
          build.onResolve({filter: /.*/}, (args) => {
            if (args.kind === 'entry-point') {
              return {namespace: 'docs-virtual', path: args.path};
            }
            if (allFiles[args.path] != null) {
              return {namespace: 'docs-virtual', path: args.path};
            }
            if (args.path.startsWith('.')) {
              const resolvedPath = resolve(dirname(args.importer), args.path);
              return args.namespace === 'docs-virtual'
                ? {
                    namespace: 'docs-virtual',
                    path: resolvedPath,
                  }
                : null;
            }
            if (TINYBASE_SOURCE_MODULES[args.path] != null) {
              return {path: TINYBASE_SOURCE_MODULES[args.path]};
            }
            const svelteInternalImport = resolveSvelteInternalImport(args.path);
            if (svelteInternalImport != null) {
              return {path: svelteInternalImport};
            }
            if (args.path.startsWith('/')) {
              return {path: args.path};
            }
            return {external: true, path: args.path};
          });
          build.onLoad({filter: /.*/, namespace: 'docs-virtual'}, (args) => {
            const file = allFiles[args.path];
            if (file == null) {
              throw new Error(`Unknown virtual file: ${args.path}`);
            }
            if (extname(args.path) == '.svelte') {
              const compiled = compileSvelte(file, {
                filename: args.path,
                generate: 'client',
              });
              return {
                contents: compiled.js.code,
                loader: 'js',
                resolveDir: dirname(args.path),
              };
            }
            if (isSvelteModule(args.path)) {
              return {
                contents: compileSvelteModule(file, args.path),
                loader: 'js',
                resolveDir: dirname(args.path),
              };
            }
            return {
              contents: file,
              loader: extname(args.path).slice(1) as
                | 'js'
                | 'jsx'
                | 'ts'
                | 'tsx',
              resolveDir: dirname(args.path),
            };
          });
          build.onLoad({filter: /\.svelte$/}, (args) => ({
            contents: compileSvelte(readFileSync(args.path, 'utf8'), {
              filename: args.path,
              generate: 'client',
            }).js.code,
            loader: 'js',
            resolveDir: dirname(args.path),
          }));
          build.onLoad({filter: /\.svelte\.[jt]s$/}, (args) => ({
            contents: compileSvelteModule(
              readFileSync(args.path, 'utf8'),
              args.path,
            ),
            loader: 'js',
            resolveDir: dirname(args.path),
          }));
        },
      },
    ],
  });
  const code = result.outputFiles[0]?.text;
  if (code == null) {
    throw new Error('No output from bundled docs example');
  }
  const getResults = new AsyncFunction(
    '__require',
    `
      const require = (path) => globalThis.modules?.[path] ?? __require(path);
      const module = {exports: {}};
      const exports = module.exports;
      ${code}
      const __docsRun = module.exports.default ?? module.exports;
      return await __docsRun();
    `,
  );
  return getResults(nodeRequire) as Promise<Results>;
};

const prepareTestResultsFromBlock = (block: string, prefix: string): void => {
  const name = prefix + ' - ' + (block.match(/(?<=^).*?(?=\n)/) ?? '');
  let count = 1;
  let suffixedName = name;
  while (resultsByName[suffixedName] != null) {
    suffixedName = name + ' ' + ++count;
  }

  const codeBlocks = parseCodeBlocks(block);
  const hasSvelteBlocks = codeBlocks.some(({lang}) => lang == 'svelte');
  const hasNamedFiles = codeBlocks.some(({file}) => file != null);
  if (hasSvelteBlocks || hasNamedFiles) {
    const files: {[path: string]: string} = {};
    const scriptBlocks: {content: string; lang: string}[] = [];
    codeBlocks.forEach(({content, file, info, lang}) => {
      if (
        content == '' ||
        info.includes('ignore') ||
        (!isBun && info.includes(' bun'))
      ) {
        return;
      }
      if (file != null) {
        files[resolve('/', file)] = SCRIPT_BLOCK.test(extname(file).slice(1))
          ? replaceSvelteImports(content)
          : content;
      } else if (lang == 'svelte') {
        files['/App.svelte'] = content;
      } else if (SCRIPT_BLOCK.test(lang)) {
        const isSolidJsx = lang.endsWith('x') && isSolidSource(content);
        scriptBlocks.push({
          content: replaceSvelteImports(
            isSolidJsx
              ? transformSolidJsx(
                  prepareRunnableCode(content, false),
                  lang as 'jsx' | 'tsx',
                )
              : content,
          ),
          lang: isSolidJsx ? 'js' : lang,
        });
      }
    });
    if (scriptBlocks.length == 0) {
      return;
    }
    const entryPath =
      Object.keys(files).find((path) =>
        SCRIPT_BLOCK.test(extname(path).slice(1)),
      ) ??
      (scriptBlocks.some(({lang}) => lang.endsWith('x'))
        ? '/index.tsx'
        : '/index.ts');
    if (files[entryPath] == null) {
      const [imports, body] = splitImports(
        prepareRunnableCode(
          scriptBlocks
            .map(({content}) => content)
            .join('\n')
            .trim(),
          !hasNamedFiles,
        ),
      );
      files[entryPath] = `${imports}
export default async function () {
  ${HTML_HELPERS}
  const _expected = [];
  const _actual = [];
${body
  .split('\n')
  .map((line) => (line == '' ? line : '  ' + line))
  .join('\n')}
  return Array(Math.max(_expected.length, _actual.length))
    .fill('')
    .map((_, r) => [_expected[r], _actual[r]]);
}`;
    }
    resultsByName[suffixedName] = () => prepareBundledResults(files, entryPath);
    return;
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
    const realTsx = prepareRunnableCode(tsx, false) ?? '';
    // lol what could go wrong
    try {
      const js = isSolidSource(realTsx)
        ? {code: transformSolidJsx(realTsx, 'tsx')}
        : transformSync(realTsx, {loader: 'tsx'});
      const runnableJs = replaceRunnableImports(js.code);
      resultsByName[suffixedName] = new AsyncFunction(`
        ${HTML_HELPERS}
        const _expected = [];
        const _actual = [];
        ${runnableJs}
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
