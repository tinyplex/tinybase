import {createDocs, getSorter} from 'tinydocs';
import {ArticleInner} from './ui/ArticleInner';
import type {Docs} from 'tinydocs';
import {ExecutablePen} from './ui/ExecutablePen';
import {NavJson} from './ui/NavJson';
import {Page} from './ui/Page';
import {Readme} from './ui/Readme';
import {readFileSync} from 'fs';

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
  'tools',
  'ui-react',
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
  outDir: string,
  api = true,
  pages = true,
): Promise<void> => {
  const {version} = JSON.parse(readFileSync('./package.json', 'utf-8'));
  const baseUrl = version.includes('beta')
    ? 'https://beta.tinybase.org'
    : 'https://tinybase.org';

  const docs = createDocs(baseUrl, outDir, !api && !pages)
    .addJsFile('site/js/home.ts')
    .addJsFile('site/js/app.ts')
    .addJsFile('site/js/single.ts')
    .addFile('node_modules/react/umd/react.production.min.js', 'umd')
    .addFile('node_modules/react-dom/umd/react-dom.production.min.js', 'umd')
    .addFile('tmp/partysocket.js', 'umd')
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
  [
    '',
    '/store',
    '/persisters/persister-browser',
    '/persisters/persister-remote',
    '/synchronizers/synchronizer-ws-client',
    '/ui-react',
    '/ui-react-dom',
    '/ui-react-inspector',
  ].forEach((module) =>
    docs.addFile('dist/umd' + module + '/index.js', 'umd/tinybase/' + module),
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
  docs.publish();
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
    .addApiFile('dist/@types/persisters/persister-browser/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-indexed-db/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-file/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-remote/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-yjs/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-automerge/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-sqlite3/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-sqlite-wasm/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-cr-sqlite-wasm/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-electric-sql/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-powersync/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-expo-sqlite/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-expo-sqlite-next/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-libsql/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-partykit-client/index.d.ts')
    .addApiFile('dist/@types/persisters/persister-partykit-server/index.d.ts')
    .addApiFile('dist/@types/synchronizers/index.d.ts')
    .addApiFile('dist/@types/synchronizers/synchronizer-local/index.d.ts')
    .addApiFile('dist/@types/synchronizers/synchronizer-ws-client/index.d.ts')
    .addApiFile('dist/@types/synchronizers/synchronizer-ws-server/index.d.ts')
    .addApiFile('dist/@types/tools/index.d.ts')
    .addApiFile('dist/@types/ui-react/index.d.ts')
    .addApiFile('dist/@types/ui-react-dom/index.d.ts');

const addPages = (docs: Docs): Docs =>
  docs
    .addRootMarkdownFile('site/home/index.md')
    .addMarkdownDir('site/guides')
    .addMarkdownDir('site/demos', true);
