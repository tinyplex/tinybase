import prettier from '@prettier/sync';
import type {NoPropComponent} from 'tinydocs';
import {usePageNode} from 'tinydocs';
import {usePackageData} from './BuildContext.tsx';

const IMPORT_MAP_SCRIPT_REGEX =
  /<script\b[^>]*type=["']importmap["'][^>]*>[\s\S]*?<\/script>/g;
const SCRIPTS_REGEX = /<script\b[^>]*>[\s\S]*?<\/script>/g;
const ESM_SH_PREFIX = 'https://esm.sh/';
const ESM_SH_PACKAGE_REGEX =
  /^https:\/\/esm\.sh\/((?:@[^/@]+\/)?[^/@]+)@([^/?]+)(?:[/?].*)?$/;
const ESM_SH_SUBPATH_REGEX =
  /^https:\/\/esm\.sh\/((?:@[^/@]+\/)?[^/@]+)(?:\/.*)?@([^/?]+)(?:[/?].*)?$/;

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

const getLess = (source: string): string =>
  prettier.format(source, {parser: 'less'}).trim();

const getSource = (source: string): string =>
  prettier
    .format(source, {
      parser: 'typescript',
      singleQuote: true,
      trailingComma: 'all',
    })
    .trim();

const getDependency = (
  url: string,
): [dependency: string, version: string] | undefined => {
  if (!url.startsWith(ESM_SH_PREFIX)) {
    return;
  }
  const match =
    url.match(ESM_SH_PACKAGE_REGEX) ?? url.match(ESM_SH_SUBPATH_REGEX);
  return match == null ? undefined : [match[1], match[2]];
};

const getDependencyName = (specifier: string): string =>
  specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : specifier.split('/')[0];

const getDependencies = (
  imports: {[specifier: string]: string},
  version: string,
  devDependencies: {[dependency: string]: string},
): {[dependency: string]: string} =>
  Object.fromEntries(
    Object.entries(imports)
      .map(([specifier, url]) => {
        const dependency =
          getDependency(url)?.[0] ?? getDependencyName(specifier);
        const dependencyVersion =
          getDependency(url)?.[1] ??
          (dependency == 'tinybase' ? version : devDependencies[dependency]);
        return dependencyVersion == null
          ? undefined
          : [dependency, dependencyVersion];
      })
      .filter(
        (dependency): dependency is [dependency: string, version: string] =>
          dependency != null,
      )
      .sort(([a], [b]) => a.localeCompare(b)),
  );

const getHtml = (
  title: string,
  html: string,
  entryFileName: string,
): string => {
  html = html.replace(IMPORT_MAP_SCRIPT_REGEX, '').trim();
  const headScripts = html.match(SCRIPTS_REGEX)?.join('\n')?.trim() ?? '';
  const body = html.replace(SCRIPTS_REGEX, '').trim();
  return prettier
    .format(
      `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    ${headScripts}
  </head>
  <body>
    ${body}
    <script type="module" src="/${entryFileName}"></script>
  </body>
</html>
      `,
      {parser: 'html'},
    )
    .trim();
};

const getPackageJson = (
  title: string,
  dependencies: {[dependency: string]: string},
  react: boolean,
  devDependencies: {[dependency: string]: string},
): string => {
  const toolDependencies: {[dependency: string]: string} = {};
  ['less', 'vite'].forEach((dependency) => {
    const version = devDependencies[dependency];
    if (version != null) {
      toolDependencies[dependency] = version;
    }
  });
  if (react && devDependencies['@vitejs/plugin-react'] != null) {
    toolDependencies['@vitejs/plugin-react'] =
      devDependencies['@vitejs/plugin-react'];
  }
  return JSON.stringify(
    {
      name: title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'),
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: {dev: 'vite', build: 'vite build', preview: 'vite preview'},
      dependencies,
      devDependencies: toolDependencies,
      stackblitz: {startCommand: 'npm run dev'},
    },
    null,
    2,
  );
};

const getViteConfig = (
  react: boolean,
  devDependencies: {[dependency: string]: string},
): string | undefined =>
  react && devDependencies['@vitejs/plugin-react'] != null
    ? prettier
        .format(
          `
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
          `,
          {parser: 'babel', singleQuote: true, trailingComma: 'all'},
        )
        .trim()
    : undefined;

const getTsconfig = (): string =>
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        useDefineForClassFields: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        allowJs: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
      },
      include: ['src'],
    },
    null,
    2,
  );

export const ExecutableProject: NoPropComponent = (): any => {
  const {name: title, summary: description = '', executables} = usePageNode();
  const {devDependencies, version} = usePackageData();
  if (executables == null) {
    return null;
  }
  const cleanDescription = description.replaceAll(/\s+/g, ' ').trim();

  const {html = '', less = '', tsx = ''} = executables;
  const imports = getImportMap(html);
  const dependencies = getDependencies(imports, version, devDependencies);
  const react =
    imports.react != null ||
    imports['react-dom/client'] != null ||
    imports['react/jsx-runtime'] != null;
  const entryFileName = react ? 'src/main.tsx' : 'src/main.js';
  const viteConfig = getViteConfig(react, devDependencies);
  const project = {
    title,
    description: cleanDescription,
    template: 'node',
    files: {
      '.npmrc': 'legacy-peer-deps=true\n',
      'index.html': getHtml(title, html, entryFileName),
      'src/index.less': getLess(less),
      [entryFileName]: getSource(
        `${less.trim() == '' ? '' : `import './index.less';\n\n`}${tsx}`,
      ),
      'package.json': getPackageJson(
        title,
        dependencies,
        react,
        devDependencies,
      ),
      ...(viteConfig == null
        ? {}
        : {
            'tsconfig.json': getTsconfig(),
            'vite.config.js': viteConfig,
          }),
    },
    options: {
      file: entryFileName,
      hidedevtools: '1',
      showSidebar: '1',
      terminalHeight: '18',
    },
  };

  return <code dangerouslySetInnerHTML={{__html: JSON.stringify(project)}} />;
};
