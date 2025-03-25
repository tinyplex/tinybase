import {ArticleInner} from './ui/ArticleInner.tsx';
import {ExecutablePen} from './ui/ExecutablePen.tsx';
import {NavJson} from './ui/NavJson.tsx';
import {Page} from './ui/Page.tsx';
import {Readme} from './ui/Readme.tsx';
import {readFileSync, writeFileSync} from 'fs';
import {createDocs, getSorter} from 'tinydocs';
import type {Docs} from 'tinydocs';

const tinybaseEsm = [
  'tinybase',
  'tinybase/ui-react',
  'tinybase/ui-react-dom',
  'tinybase/ui-react-inspector',
  'tinybase/persisters/persister-browser',
  'tinybase/persisters/persister-remote',
  'tinybase/synchronizers/synchronizer-ws-client',
];
const externalEsm = ['react', 'react-dom/client', 'react/jsx-runtime'];

const GROUPS = ['Interfaces', '*', 'Type aliases'];
const CATEGORIES = [
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

export const build = async (
  esbuild: any,
  outDir: string,
  api = true,
  pages = true,
): Promise<void> => {
  const {version} = JSON.parse(readFileSync('./package.json', 'utf-8'));
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
    (
      await docs.generateNodes({
        group: getSorter(GROUPS),
        category: getSorter(CATEGORIES),
        reflection: getSorter(REFLECTIONS),
      })
    )
      .addPageForEachNode('/', Page)
      .addPageForEachNode('/', ArticleInner, 'article.html')
      .addTextForEachNode('/', NavJson, 'nav.json')
      .addTextForEachNode('/demos/', ExecutablePen, 'pen.json')
      .addPageForNode('/api/', Page, 'all.html', true)
      .addMarkdownForNode('/', Readme, '../readme.md')
      .addMarkdownForNode('/guides/releases/', Readme, '../../../releases.md');
  }

  tinybaseEsm.forEach((module) => {
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
    const {version} = JSON.parse(
      readFileSync(`node_modules/${mainModule}/package.json`, 'utf-8'),
    );
    docs.addReplacer(
      new RegExp(`esm\\.sh/${module}@`, 'g'),
      `esm.sh/${mainModule}@${version}${subModules.join('/')}`,
    );
  });

  docs.publish();

  await Promise.all(
    tinybaseEsm.map(async (module) => {
      const [mainModule, ...subModules] = module.split('/');
      subModules.unshift('');
      await esbuild.build({
        entryPoints: [import.meta.resolve(module).replace('file://', '')],
        external: externalEsm,
        target: 'esnext',
        bundle: true,
        jsx: 'transform',
        outfile:
          `${outDir}/pseudo.esm.sh/` +
          `${mainModule}@${version}${subModules.join('/')}/index.js`,
        format: 'esm',
      });
    }),
  );
};

const addApi = (docs: Docs): Docs =>
  docs
    .addApiFile('dist/@types/common/index.d.ts')
    .addApiFile('dist/@types/store/index.d.ts')
    .addApiFile('dist/@types/checkpoints/index.d.ts')
    .addApiFile('dist/@types/indexes/index.d.ts')
    .addApiFile('dist/@types/metrics/index.d.ts')
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
    .addApiFile('dist/@types/persisters/persister-remote/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-sqlite-wasm/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-sqlite3/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-yjs/index.d.ts')
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
    .addApiFile('dist/@types/ui-react-inspector/index.d.ts');

const addPages = (docs: Docs): Docs =>
  docs
    .addRootMarkdownFile('site/home/index.md')
    .addMarkdownDir('site/guides')
    .addMarkdownDir('site/demos', true);
