import {readFileSync, writeFileSync} from 'fs';
import type {Docs, NodeTransform, ReflectionTransform} from 'tinydocs';
import {createDocs, getSkippedChildren, getSorter} from 'tinydocs';
import {addDemoDocs, getPublishedImportUrl} from './demo.ts';
import {rewriteAndValidatePublishedDocShots} from './shots.ts';
import {extractThumbnailMarkdown, getSummaryMarkdown} from './thumbnail.ts';
import {ArticleInner} from './ui/ArticleInner.tsx';
import {ExecutableProject} from './ui/ExecutableProject.tsx';
import {MarkdownPage} from './ui/MarkdownPage.tsx';
import {NavJson} from './ui/NavJson.tsx';
import {Page} from './ui/Page.tsx';
import {Readme} from './ui/Readme.tsx';

const internalEsm: string[] = [
  'tinybase',
  'tinybase/ui-react',
  'tinybase/ui-solid',
  'tinybase/ui-svelte',
  'tinybase/ui-react-dom',
  'tinybase/ui-react-dom-charts',
  'tinybase/ui-solid-dom',
  'tinybase/ui-svelte-dom',
  'tinybase/ui-react-inspector',
  'tinybase/ui-solid-inspector',
  'tinybase/ui-svelte-inspector',
  'tinybase/persisters/persister-browser',
  'tinybase/persisters/persister-remote',
  'tinybase/synchronizers/synchronizer-ws-client',
];
const externalEsm: string[] = [
  'react',
  'react-dom/client',
  'react/jsx-runtime',
  'solid-js',
  'solid-js/web',
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
  'Using Solid',
  'Using Svelte',
  'Store components',
  'Queries components',
  'Other components',
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
  /^Other/,
];
const REFLECTIONS = [
  'checkpoints',
  'common',
  'indexes',
  'mergeable-store',
  'metrics',
  'middleware',
  'persisters',
  /^persister/,
  'queries',
  'relationships',
  'schematizers',
  /^schematizer/,
  'store',
  'synchronizers',
  /^synchronizer/,
  /^ui-react/,
  /^ui-solid/,
  /^ui-svelte/,
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
  /^Other/,
];
const SVELTE_API_PREFIX = /^\/api\/ui-svelte(?:-dom|-inspector)?\//;
const SVELTE_PRIVATE_PROPERTY =
  // eslint-disable-next-line max-len
  /^\/api\/ui-svelte(?:-dom|-inspector)?\/.*\/properties\/other\/(?:element|z-bindings)\/$/;
const SVELTE_REFLECTION = /^ui-svelte(?:-dom|-inspector)?\./;
const SVELTE_INTERNAL_PARAM = /^(?:internal|internals)$/;
const SVELTE_PRIVATE_MEMBER = /^(?:element|z_\$\$bindings)$/;
const hasMarkdown = (markdown?: string): boolean => markdown?.trim() != '';

type ReflectionComment = {
  blockTags: {tag: string; name?: string}[];
};
type ReflectionGroup = {
  title: string;
  children: {name: string}[];
};
type ReflectionContainer = {
  children?: {name: string}[];
  groups?: ReflectionGroup[];
};

const removeSvelteInternalParam: ReflectionTransform = (reflection) => {
  if (!SVELTE_REFLECTION.test(reflection.getFriendlyFullName())) {
    return;
  }
  const comment = (reflection as {comment?: ReflectionComment}).comment;
  if (comment != null) {
    comment.blockTags = comment.blockTags.filter(
      ({tag, name}) =>
        tag != '@param' || !SVELTE_INTERNAL_PARAM.test(name ?? ''),
    );
  }
  const signature = reflection as {parameters?: {name: string}[]};
  if (signature.parameters != null) {
    signature.parameters = signature.parameters.filter(
      ({name}) => !SVELTE_INTERNAL_PARAM.test(name),
    );
  }
  const container = reflection as ReflectionContainer;
  if (container.groups != null) {
    container.groups = container.groups
      .map((group) =>
        group.title != 'Properties'
          ? group
          : {
              ...group,
              children: group.children.filter(
                ({name}) => !SVELTE_PRIVATE_MEMBER.test(name),
              ),
            },
      )
      .filter((group) => group.children.length > 0);
  }
  if (container.children != null) {
    container.children = container.children.filter(
      ({name}) => !SVELTE_PRIVATE_MEMBER.test(name),
    );
  }
};

const hidePrivateSvelteComponentChildren: NodeTransform = (node) => {
  if (SVELTE_PRIVATE_PROPERTY.test(node.url)) {
    node.hide = true;
    node.publish = false;
    return;
  }
  if (
    SVELTE_API_PREFIX.test(node.url) &&
    node.reflection == null &&
    node.url.includes('/properties/') &&
    !hasMarkdown(node.body) &&
    !hasMarkdown(node.summary) &&
    getSkippedChildren(node).length == 0
  ) {
    node.hide = true;
    node.publish = false;
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
    .addReflectionTransform(removeSvelteInternalParam)
    .addNodeTransform(extractThumbnailMarkdown)
    .addNodeTransform(hidePrivateSvelteComponentChildren)
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

  writeFileSync(
    `${outDir}/llms-full.txt`,
    readFileSync('site/guides/18_agents.md', 'utf-8'),
    'utf-8',
  );

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
        (node.reflection == null ? getSummaryMarkdown(node) : node.summary)
          ?.replaceAll(/<[^>]*>/g, '')
          .replaceAll(/\s+/g, ' ')
          .trim() ?? '';
      if (
        node.publish &&
        node?.url != '/' &&
        summary &&
        !summary.startsWith('->')
      ) {
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
    rewriteAndValidatePublishedDocShots(outDir);
  }
};

const addApi = (docs: Docs): Docs =>
  docs
    .addApiFile('dist/@types/checkpoints/index.d.ts')
    .addApiFile('dist/@types/common/index.d.ts')
    .addApiFile('dist/@types/indexes/index.d.ts')
    .addApiFile('dist/@types/mergeable-store/index.d.ts')
    .addApiFile('dist/@types/metrics/index.d.ts')
    .addApiFile('dist/@types/middleware/index.d.ts')
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
    .addApiFile('dist/@types/persisters/persister-sqlite-bun/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-sqlite-wasm/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-sqlite3/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-yjs/index.d.ts')
    .addApiFile('dist/@types/queries/index.d.ts')
    .addApiFile('dist/@types/relationships/index.d.ts')
    .addApiFile('dist/@types/schematizers/index.d.ts')
    .addApiFile('dist/@types/schematizers/schematizer-arktype/index.d.ts')
    .addApiFile('dist/@types/schematizers/schematizer-effect/index.d.ts')
    .addApiFile('dist/@types/schematizers/schematizer-typebox/index.d.ts')
    .addApiFile('dist/@types/schematizers/schematizer-valibot/index.d.ts')
    .addApiFile('dist/@types/schematizers/schematizer-yup/index.d.ts')
    .addApiFile('dist/@types/schematizers/schematizer-zod/index.d.ts')
    .addApiFile('dist/@types/store/index.d.ts')
    .addApiFile('dist/@types/synchronizers/index.d.ts')
    .addApiFile(
      'dist/@types/synchronizers/synchronizer-broadcast-channel/index.d.ts',
    )
    .addApiFile('dist/@types/synchronizers/synchronizer-local/index.d.ts')
    .addApiFile('dist/@types/synchronizers/synchronizer-ws-client/index.d.ts')
    .addApiFile('dist/@types/synchronizers/synchronizer-ws-server/index.d.ts')
    .addApiFile(
      // eslint-disable-next-line max-len
      'dist/@types/synchronizers/synchronizer-ws-server-durable-object/index.d.ts',
    )
    .addApiFile(
      'dist/@types/synchronizers/synchronizer-ws-server-simple/index.d.ts',
    )
    .addApiFile('dist/@types/ui-react/index.d.ts')
    .addApiFile('dist/@types/ui-react-dom/index.d.ts')
    .addApiFile('dist/@types/ui-react-dom-charts/index.d.ts')
    .addApiFile('dist/@types/ui-react-inspector/index.d.ts')
    .addApiFile('dist/@types/ui-solid/index.d.ts')
    .addApiFile('dist/@types/ui-solid-dom/index.d.ts')
    .addApiFile('dist/@types/ui-solid-inspector/index.d.ts')
    .addApiFile('dist/@types/ui-svelte/index.d.ts')
    .addApiFile('dist/@types/ui-svelte-dom/index.d.ts')
    .addApiFile('dist/@types/ui-svelte-inspector/index.d.ts');

const addPages = (docs: Docs): Docs =>
  docs
    .addRootMarkdownFile('site/home/index.md')
    .addMarkdownDir('site/guides')
    .addMarkdownDir('site/demos', true);
