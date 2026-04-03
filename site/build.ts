import {readFileSync, writeFileSync} from 'fs';
import {posix} from 'node:path';
import {applyPatch} from 'diff';
import {compile} from 'svelte/compiler';
import type {Docs, Node} from 'tinydocs';
import {createDocs, getSorter} from 'tinydocs';
import {ArticleInner} from './ui/ArticleInner.tsx';
import {ExecutableProject} from './ui/ExecutableProject.tsx';
import {MarkdownPage} from './ui/MarkdownPage.tsx';
import {NavJson} from './ui/NavJson.tsx';
import {Page} from './ui/Page.tsx';
import {Readme} from './ui/Readme.tsx';

const less = await import(await import.meta.resolve('less'));
const {render} = less.default;

const internalEsm: string[] = [
  'tinybase',
  'tinybase/ui-react',
  'tinybase/ui-svelte',
  'tinybase/ui-react-dom',
  'tinybase/ui-react-inspector',
  'tinybase/persisters/persister-browser',
  'tinybase/persisters/persister-remote',
  'tinybase/synchronizers/synchronizer-ws-client',
];
const externalEsm: string[] = [
  'react',
  'react-dom/client',
  'react/jsx-runtime',
  'svelte',
];

const GROUPS = ['Interfaces', '*', 'Type aliases'];
const CATEGORIES = [
  'Creating stores',
  'Getting data',
  'Setting data',
  'Listening for changes',
  'Persisting stores',
  'Synchronizing stores',
  'Using React',

  /hooks$/,
  /components$/,
  'Definition',
  'Getter',
  'Result',
  'Setter',
  'Listener',
  '*',
  'Deleter',
  'Development',
  'Internal',
  'Other',
];
const REFLECTIONS = [
  'store',
  'mergeable-store',
  'metrics',
  'indexes',
  'relationships',
  'queries',
  'checkpoints',
  'common',
  'persisters',
  /^persister/,
  'synchronizers',
  /^synchronizer/,
  '/^ui-react/',
  /^TablesProps/,
  /^TableProps/,
  /^SortedTableProps/,
  /^RowProps/,
  /^CellProps/,
  /MetricProps/,
  /IndexProps/,
  /SliceProps/,
  /LocalRowsProps/,
  /RemoteRowProps/,
  /LinkedRowsProps/,
  /ResultTableProps/,
  /ResultSortedTableProps/,
  /ResultRowProps/,
  /ResultCellProps/,
  /.Checkpoints?Props/,
  /ProviderProps/,
  /ExtraProps/,
  /^Database/,
  /^Dpc/,
  /Store/,
  /^Tables/,
  /Tables/,
  /TableIds/,
  /^Table/,
  /Table/,
  /^SortedTable/,
  /SortedTable/,
  /RowIds/,
  'setRow',
  /Row/,
  /CellIds/,
  /Cell/,
  /^Values/,
  /Values/,
  /Value/,
  '*',
];

const IMPORT_MAP_SCRIPT_REGEX =
  /<script\b[^>]*type=["']importmap["'][^>]*>[\s\S]*?<\/script>/g;
const SCRIPTS_REGEX = /<script.*?<\/script>/gms;
const PURE_REGEX = /\/\* @__PURE__ \*\/ /gms;
const JS_FILE_REGEX = /\.(?:[cm]?[jt]sx?)$/;
const SVELTE_FILE_REGEX = /\.svelte$/;
const STYLE_FILE_REGEX = /\.(less|css)$/;

type ResolvedExecutables = {
  files: {[path: string]: string};
  html: string;
  less: string;
  tsx: string;
};

type DemoNode = Node & {__demoDoc?: string};

const applyDiffs = (base: string, diffs: string[], node: Node): string => {
  diffs.forEach((diff) => {
    while (diff.startsWith('\n')) {
      diff = diff.slice(1);
    }
    const diffLines = diff.trimEnd().split('\n');
    const remove = diffLines.filter((line) => !line.startsWith('+')).length;
    const add = diffLines.filter((line) => !line.startsWith('-')).length;
    const patch = `@@ -0,${remove} +0,${add} @@\n` + diff;
    const next = applyPatch(base, patch, {
      compareLine: (_1, line, _2, patchContent) =>
        line?.trim() === patchContent?.trim(),
    }) as string | false;
    if (next === false || next === base) {
      throw new Error(
        `Could not apply patch in ${node.name}:` +
          `\nBASE:\n---${base}---\nDIFF:\n---${diff}---`,
      );
    }
    base = next;
  });
  return base;
};

const getResolvedExecutables = (
  node: Node,
  nodesByName: {[name: string]: Node},
): ResolvedExecutables => {
  const {
    base,
    files = {},
    html = '',
    htmlDiffs = [],
    less = '',
    lessDiffs = [],
    tsx = '',
    tsxDiffs = [],
  } = node.executables ?? {};
  if (base == null) {
    return {files, html, less, tsx};
  }
  const baseNode = nodesByName[base];
  if (baseNode == null) {
    throw new Error(`Base ${base} not present in ${node.name}`);
  }
  const baseExecutables = getResolvedExecutables(baseNode, nodesByName);
  return {
    files: {...baseExecutables.files, ...files},
    html: applyDiffs(baseExecutables.html, htmlDiffs, node) + html,
    less: applyDiffs(baseExecutables.less, lessDiffs, node) + less,
    tsx: applyDiffs(baseExecutables.tsx, tsxDiffs, node) + tsx,
  };
};

const getImportMap = (html: string): {[specifier: string]: string} =>
  Object.assign(
    {},
    ...(html
      .match(IMPORT_MAP_SCRIPT_REGEX)
      ?.map(
        (script) =>
          JSON.parse(
            script.replace(/^<script\b[^>]*>/, '').replace(/<\/script>$/, ''),
          ).imports,
      ) ?? []),
  );

const getMappedImportUrl = (
  specifier: string,
  importMap: {[specifier: string]: string},
  baseUrl: string,
): string | undefined => {
  const exact = importMap[specifier];
  if (exact != null) {
    return absolutizeImportUrl(exact, baseUrl);
  }
  const prefix = Object.keys(importMap)
    .filter((key) => specifier.startsWith(key + '/'))
    .sort((a, b) => b.length - a.length)[0];
  return prefix == null
    ? undefined
    : absolutizeImportUrl(
        importMap[prefix]! + specifier.slice(prefix.length),
        baseUrl,
      );
};

const getPublishedImportUrl = (
  specifier: string,
  version: string,
  peerDependencies: {[dependency: string]: string},
): string | undefined => {
  const [mainModule, ...subModules] = specifier.split('/');
  const dependencyVersion =
    mainModule == 'tinybase' ? version : peerDependencies[mainModule];
  if (dependencyVersion == null) {
    return;
  }
  return `https://esm.sh/${mainModule}@${dependencyVersion}${
    subModules.length == 0 ? '' : '/' + subModules.join('/')
  }`;
};

const getEntryFileName = (files: {[path: string]: string}): string =>
  ['src/main.js', 'src/main.jsx', 'index.js', 'index.jsx'].find(
    (path) => files[path] != null,
  ) ?? 'src/main.js';

const getCss = (source: string): string => {
  let css = '';
  render(source, {syncImport: true, compress: true}, (error, result) => {
    if (error != null) {
      throw error;
    }
    if (result != null) {
      css = result.css;
    }
  });
  return css;
};

const getHtmlDoc = (html: string): string =>
  html
    .replace(/\n+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();

const getJs = (esbuild: any, path: string, source: string): string =>
  esbuild.transformSync(source, {
    loader: path.endsWith('.tsx')
      ? 'tsx'
      : path.endsWith('.ts')
        ? 'ts'
        : path.endsWith('.jsx')
          ? 'jsx'
          : 'js',
    format: 'esm',
    jsx: 'automatic',
  })
    .code.replace(PURE_REGEX, '')
    .trim();

const absolutizeImportUrl = (url: string, baseUrl: string): string =>
  /^https?:\/\//.test(url) ? url : new URL(url, baseUrl).href;

const getBundle = async (
  esbuild: any,
  entryFileName: string,
  files: {[path: string]: string},
  importMap: {[specifier: string]: string},
  baseUrl: string,
): Promise<string> =>
  (
    (
      await esbuild.build({
        bundle: true,
        format: 'esm',
        jsx: 'automatic',
        minify: true,
        platform: 'browser',
        target: 'esnext',
        write: false,
        stdin: {
          contents: files[entryFileName] ?? '',
          loader: 'js',
          resolveDir: posix.dirname('/demo/' + entryFileName),
          sourcefile: '/demo/' + entryFileName,
        },
        plugins: [
          {
            name: 'demo-files',
            setup: (build: any) => {
              build.onResolve({filter: /.*/}, (args: any) => {
                if (args.path.startsWith('./') || args.path.startsWith('../')) {
                  return {
                    namespace: 'demo-files',
                    path: posix.normalize(
                      posix.join(args.resolveDir, args.path),
                    ),
                  };
                }
                if (args.path.startsWith('/demo/')) {
                  return {namespace: 'demo-files', path: args.path};
                }
                const mapped = getMappedImportUrl(
                  args.path,
                  importMap,
                  baseUrl,
                );
                return mapped == null
                  ? undefined
                  : {external: true, path: mapped};
              });
              build.onLoad(
                {filter: /.*/, namespace: 'demo-files'},
                (args: any) => {
                  const path = args.path.replace(/^\/demo\//, '');
                  const contents = files[path];
                  if (contents == null) {
                    throw new Error(`Missing file: ${path}`);
                  }
                  return {
                    contents,
                    loader: 'js',
                    resolveDir: posix.dirname(args.path),
                  };
                },
              );
            },
          },
        ],
      })
    ).outputFiles[0]?.text ?? ''
  )
    .replace(PURE_REGEX, '')
    .trim();

const getDemoDoc = async (
  esbuild: any,
  executables: ResolvedExecutables,
  baseUrl: string,
): Promise<string> => {
  const {files, html, less, tsx} = executables;
  const allFiles = {
    ...files,
    ...(tsx == '' || Object.keys(files).some((path) => JS_FILE_REGEX.test(path))
      ? {}
      : {'src/main.js': tsx}),
  };
  const importMap = getImportMap(html);
  const entryFileName = getEntryFileName(allFiles);
  let extraCss = less == '' ? '' : getCss(less);
  const moduleFiles: {[path: string]: string} = {};

  Object.entries(allFiles).forEach(([path, source]) => {
    if (STYLE_FILE_REGEX.test(path)) {
      extraCss += path.endsWith('.css') ? source : getCss(source);
      return;
    }
    if (SVELTE_FILE_REGEX.test(path)) {
      const compiled = compile(source, {filename: path, generate: 'client'});
      extraCss += compiled.css?.code ?? '';
      moduleFiles[path] = compiled.js.code;
      return;
    }
    if (JS_FILE_REGEX.test(path)) {
      moduleFiles[path] = getJs(esbuild, path, source);
    }
  });

  const js = await getBundle(
    esbuild,
    entryFileName,
    moduleFiles,
    importMap,
    baseUrl,
  );

  return getHtmlDoc(`
    <html>
      <head>
        ${
          html
            .match(SCRIPTS_REGEX)
            ?.filter(
              (script) => !/<script\b[^>]*type=["']importmap["']/.test(script),
            )
            .join('')
            ?.trim() ?? ''
        }
        <style>${extraCss}</style>
      </head>
      <body>
        ${html.replace(SCRIPTS_REGEX, '').trim()}
      </body>
      <script type='module'>${js}</script>
    </html>
  `);
};

const addDemoDocs = async (
  docs: Docs,
  esbuild: any,
  baseUrl: string,
): Promise<void> => {
  const nodesByName: {[name: string]: Node} = {};
  docs.forEachNode((node) => {
    nodesByName[node.name] = node;
  });
  for (const node of Object.values(nodesByName)) {
    if (Object.keys(node.executables?.files ?? {}).length == 0) {
      continue;
    }
    (node as DemoNode).__demoDoc = await getDemoDoc(
      esbuild,
      getResolvedExecutables(node, nodesByName),
      baseUrl,
    );
  }
};

export const build = async (
  esbuild: any,
  outDir: string,
  api = true,
  pages = true,
): Promise<void> => {
  const {version, peerDependencies} = JSON.parse(
    readFileSync('./package.json', 'utf-8'),
  );

  const baseUrl = version.includes('beta')
    ? 'https://beta.tinybase.org'
    : 'https://tinybase.org';
  writeFileSync(
    'site/js/version.ts',
    `export const thisVersion = 'v${version}';`,
    'utf-8',
  );

  const docs = createDocs(baseUrl, outDir, !api && !pages)
    .addJsFile('site/js/home.ts')
    .addJsFile('site/js/app.ts')
    .addJsFile('site/js/single.ts')
    .addLessFile('site/less/index.less')
    .addDir('site/fonts', 'fonts')
    .addDir('site/extras')
    .addDir('site/data', 'assets')
    .addStringFile(
      `[{"countries":${readFileSync(
        'node_modules/country-flag-emoji-json/dist/by-code.json',
        'utf-8',
      )}}, {}]`,
      'assets/countries.json',
    );

  if (api) {
    addApi(docs);
  }
  if (pages) {
    addPages(docs);
  }
  if (api || pages) {
    await docs.generateNodes({
      group: getSorter(GROUPS),
      category: getSorter(CATEGORIES),
      reflection: getSorter(REFLECTIONS),
    });
    await addDemoDocs(docs, esbuild, baseUrl);
    docs
      .addPageForEachNode('/', Page)
      .addPageForEachNode('/', ArticleInner, 'article.html')
      .addTextForEachNode('/', NavJson, 'nav.json')
      .addPageForNode('/api/', Page, 'all.html', true)
      .addMarkdownForNode('/', Readme, '../readme.md')
      .addMarkdownForNode(
        '/guides/releases/',
        MarkdownPage,
        '../../../releases.md',
      );
    docs.forEachNode((node) => {
      if (node.url.startsWith('/demos/') && node.url != '/demos/') {
        docs.addTextForNode(node.url, ExecutableProject, 'stackblitz.json');
      }
    });
  }

  internalEsm.forEach((module) => {
    const [mainModule, ...subModules] = module.split('/');
    subModules.unshift('');
    docs.addReplacer(
      new RegExp(`esm\\.sh/${module}@`, 'g'),
      `esm.sh/${mainModule}@${version}${subModules.join('/')}`,
    );
  });
  externalEsm.forEach((module) => {
    const [mainModule, ...subModules] = module.split('/');
    subModules.unshift('');
    const version = peerDependencies[mainModule];
    docs.addReplacer(
      new RegExp(`esm\\.sh/${module}@`, 'g'),
      `esm.sh/${mainModule}@${version}${subModules.join('/')}`,
    );
  });

  docs.publish();

  await Promise.all(
    internalEsm.map(async (module) => {
      const [mainModule, ...subModules] = module.split('/');
      subModules.unshift('');
      await esbuild.build({
        entryPoints: [import.meta.resolve(module).replace('file://', '')],
        target: 'esnext',
        bundle: true,
        jsx: 'transform',
        outfile:
          `${outDir}/pseudo.esm.sh/` +
          `${mainModule}@${version}${subModules.join('/')}/index.js`,
        format: 'esm',
        plugins: [
          {
            name: 'published-external',
            setup: (build: any) => {
              build.onResolve({filter: /^[^./].*/}, (args: any) => {
                const mapped = getPublishedImportUrl(
                  args.path,
                  version,
                  peerDependencies,
                );
                return mapped == null
                  ? undefined
                  : {external: true, path: mapped};
              });
            },
          },
        ],
      });
    }),
  );

  if (api || pages) {
    const pagesTable: {[url: string]: {n: string; s: string}} = {};
    docs.forEachNode((node) => {
      const summary =
        node.summary
          ?.replaceAll(/<[^>]*>/g, '')
          .replaceAll(/\s+/g, ' ')
          .trim() ?? '';
      if (node?.url != '/' && summary && !summary.startsWith('->')) {
        pagesTable[node.url] = {
          n: node.name,
          s: summary,
        };
      }
    });
    writeFileSync(
      `${outDir}/pages.json`,
      JSON.stringify([{p: pagesTable}, {}]),
      'utf-8',
    );
  }
};

const addApi = (docs: Docs): Docs =>
  docs
    .addApiFile('dist/@types/common/index.d.ts')
    .addApiFile('dist/@types/store/index.d.ts')
    .addApiFile('dist/@types/checkpoints/index.d.ts')
    .addApiFile('dist/@types/indexes/index.d.ts')
    .addApiFile('dist/@types/metrics/index.d.ts')
    .addApiFile('dist/@types/middleware/index.d.ts')
    .addApiFile('dist/@types/relationships/index.d.ts')
    .addApiFile('dist/@types/queries/index.d.ts')
    .addApiFile('dist/@types/mergeable-store/index.d.ts')
    .addApiFile('dist/@types/persisters/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-automerge/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-browser/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-cr-sqlite-wasm/index.d.ts')
    .addApiFile(
      'dist/@types/persisters/persister-durable-object-storage/index.d.ts',
    )
    .addApiFile(
      'dist/@types/persisters/persister-durable-object-sql-storage/index.d.ts',
    )
    .addApiFile('dist/@types/persisters/persister-electric-sql/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-expo-sqlite/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-file/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-indexed-db/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-libsql/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-partykit-client/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-partykit-server/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-pglite/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-postgres/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-powersync/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-react-native-mmkv/index.d.ts')
    .addApiFile(
      'dist/@types/persisters/persister-react-native-sqlite/index.d.ts',
    )
    .addApiFile('dist/@types/persisters/persister-remote/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-sqlite-wasm/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-sqlite3/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-sqlite-bun/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-yjs/index.d.ts')
    .addApiFile('dist/@types/schematizers/index.d.ts')
    .addApiFile('dist/@types/schematizers/schematizer-arktype/index.d.ts')
    .addApiFile('dist/@types/schematizers/schematizer-effect/index.d.ts')
    .addApiFile('dist/@types/schematizers/schematizer-typebox/index.d.ts')
    .addApiFile('dist/@types/schematizers/schematizer-valibot/index.d.ts')
    .addApiFile('dist/@types/schematizers/schematizer-yup/index.d.ts')
    .addApiFile('dist/@types/schematizers/schematizer-zod/index.d.ts')
    .addApiFile('dist/@types/synchronizers/index.d.ts')
    .addApiFile('dist/@types/synchronizers/synchronizer-local/index.d.ts')
    .addApiFile('dist/@types/synchronizers/synchronizer-ws-client/index.d.ts')
    .addApiFile('dist/@types/synchronizers/synchronizer-ws-server/index.d.ts')
    .addApiFile(
      'dist/@types/synchronizers/synchronizer-ws-server-simple/index.d.ts',
    )
    .addApiFile(
      // eslint-disable-next-line max-len
      'dist/@types/synchronizers/synchronizer-ws-server-durable-object/index.d.ts',
    )
    .addApiFile(
      'dist/@types/synchronizers/synchronizer-broadcast-channel/index.d.ts',
    )
    .addApiFile('dist/@types/ui-react/index.d.ts')
    .addApiFile('dist/@types/ui-react-dom/index.d.ts')
    .addApiFile('dist/@types/ui-react-inspector/index.d.ts')
    .addApiFile('dist/@types/ui-svelte/index.d.ts');

const addPages = (docs: Docs): Docs =>
  docs
    .addRootMarkdownFile('site/home/index.md')
    .addMarkdownDir('site/guides')
    .addMarkdownDir('site/demos', true);
