import {posix} from 'node:path';
import {compile} from 'svelte/compiler';
import type {Docs, Node} from 'tinydocs';

const less = await import(await import.meta.resolve('less'));
const {render} = less.default;

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

export const hasExecutables = (node: Node): boolean => {
  const executables = node.executables;
  if (executables == null) {
    return false;
  }
  const {files = {}, html = '', less = '', tsx = ''} = executables;
  return (
    Object.keys(files).length > 0 ||
    html.trim() != '' ||
    less.trim() != '' ||
    tsx.trim() != ''
  );
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

const absolutizeImportUrl = (url: string, baseUrl: string): string =>
  /^https?:\/\//.test(url) ? url : new URL(url, baseUrl).href;

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

export const getPublishedImportUrl = (
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
  render(
    source,
    {syncImport: true, compress: true},
    (error: Error | null, result?: {css: string}) => {
      if (error != null) {
        throw error;
      }
      if (result != null) {
        css = result.css;
      }
    },
  );
  return css;
};

const getHtmlDoc = (html: string): string => html.trim();

const getJs = (
  esbuild: any,
  path: string,
  source: string,
  solid = false,
): string => {
  const jsx = path.endsWith('.jsx') || path.endsWith('.tsx');
  return esbuild
    .transformSync(solid && jsx ? `import h from 'solid-js/h';\n${source}` : source, {
      loader: path.endsWith('.tsx')
        ? 'tsx'
        : path.endsWith('.ts')
          ? 'ts'
          : path.endsWith('.jsx')
            ? 'jsx'
            : 'js',
      format: 'esm',
      logOverride: {'unsupported-jsx-comment': 'silent'},
      jsx: solid && jsx ? 'transform' : 'automatic',
      jsxFactory: 'h',
      jsxFragment: 'h.Fragment',
    })
    .code.replace(PURE_REGEX, '')
    .trim();
};

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
        minify: false,
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
  const importMap = getImportMap(html);
  const react =
    importMap.react != null ||
    importMap['react-dom/client'] != null ||
    importMap['react/jsx-runtime'] != null;
  const solid = importMap['solid-js'] != null || importMap['solid-js/web'] != null;
  const allFiles = {
    ...files,
    ...(tsx == '' || Object.keys(files).some((path) => JS_FILE_REGEX.test(path))
      ? {}
      : {[react || solid ? 'src/main.jsx' : 'src/main.js']: tsx}),
  };
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
      moduleFiles[path] = getJs(esbuild, path, source, solid);
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

export const addDemoDocs = async (
  docs: Docs,
  esbuild: any,
  baseUrl: string,
): Promise<void> => {
  const demoDocs: Promise<void>[] = [];
  docs.forEachNode((node) => {
    if (!hasExecutables(node)) {
      return;
    }
    demoDocs.push(
      getDemoDoc(
        esbuild,
        node.executables as ResolvedExecutables,
        baseUrl,
      ).then((demoDoc) => {
        (node as Node & {__demoDoc?: string}).__demoDoc = demoDoc;
      }),
    );
  });
  await Promise.all(demoDocs);
};
