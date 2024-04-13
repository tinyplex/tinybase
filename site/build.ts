import {Docs, createDocs, getSorter} from 'tinydocs';
import {ArticleInner} from './ui/ArticleInner';
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
    .addFiles('lib/umd', ['js'], 'umd')
    .addFile('tmp/ui-react-dom-debug.js', 'umd')
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
    .addApiFile('lib/types/common.d.ts')
    .addApiFile('lib/types/store.d.ts')
    .addApiFile('lib/types/checkpoints.d.ts')
    .addApiFile('lib/types/indexes.d.ts')
    .addApiFile('lib/types/metrics.d.ts')
    .addApiFile('lib/types/relationships.d.ts')
    .addApiFile('lib/types/queries.d.ts')
    .addApiFile('lib/types/mergeable-store.d.ts')
    .addApiFile('lib/types/persisters.d.ts')
    .addApiFile('lib/types/persisters/persister-browser.d.ts')
    .addApiFile('lib/types/persisters/persister-indexed-db.d.ts')
    .addApiFile('lib/types/persisters/persister-file.d.ts')
    .addApiFile('lib/types/persisters/persister-remote.d.ts')
    .addApiFile('lib/types/persisters/persister-yjs.d.ts')
    .addApiFile('lib/types/persisters/persister-automerge.d.ts')
    .addApiFile('lib/types/persisters/persister-sqlite3.d.ts')
    .addApiFile('lib/types/persisters/persister-sqlite-wasm.d.ts')
    .addApiFile('lib/types/persisters/persister-cr-sqlite-wasm.d.ts')
    .addApiFile('lib/types/persisters/persister-electric-sql.d.ts')
    .addApiFile('lib/types/persisters/persister-powersync.d.ts')
    .addApiFile('lib/types/persisters/persister-expo-sqlite.d.ts')
    .addApiFile('lib/types/persisters/persister-expo-sqlite-next.d.ts')
    .addApiFile('lib/types/persisters/persister-libsql.d.ts')
    .addApiFile('lib/types/persisters/persister-partykit-client.d.ts')
    .addApiFile('lib/types/persisters/persister-partykit-server.d.ts')
    .addApiFile('lib/types/persisters/persister-sync.d.ts')
    .addApiFile('lib/types/tools.d.ts')
    .addApiFile('lib/types/ui-react.d.ts')
    .addApiFile('lib/types/ui-react-dom.d.ts');

const addPages = (docs: Docs): Docs =>
  docs
    .addRootMarkdownFile('site/home/index.md')
    .addMarkdownDir('site/guides')
    .addMarkdownDir('site/demos', true);
