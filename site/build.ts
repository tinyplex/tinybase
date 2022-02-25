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
  'Setter',
  'Listener',
  '*',
  'Deleter',
  'Development',
  'Other',
];
const REFLECTIONS = [
  'store',
  'metrics',
  'indexes',
  'relationships',
  'queries',
  'checkpoints',
  'persisters',
  'ui-react',
  'common',
  /TablesProps/,
  /TableProps/,
  /^RowProps/,
  /CellProps/,
  /MetricProps/,
  /IndexProps/,
  /SliceProps/,
  /.Rows?Props/,
  /.Checkpoints?Props/,
  /ProviderProps/,
  /ExtraProps/,
  /Store/,
  /Tables/,
  /TableIds/,
  /Table/,
  /RowIds/,
  'setRow',
  /Row/,
  /CellIds/,
  /Cell/,
  '*',
];

export const build = (outDir: string, api = true, pages = true): void => {
  const docs = createDocs('https://tinybase.org', outDir, !api && !pages)
    .addJsFile('site/js/home.ts')
    .addJsFile('site/js/app.ts')
    .addJsFile('site/js/single.ts')
    .addFiles('lib/umd', ['js'], 'umd')
    .addFile('node_modules/react/umd/react.production.min.js', 'umd')
    .addFile('node_modules/react-dom/umd/react-dom.production.min.js', 'umd')
    .addLessFile('site/less/index.less')
    .addDir('site/fonts', 'fonts')
    .addDir('site/extras')
    .addDir('site/data', 'assets')
    .addStringFile(
      `{"countries":${readFileSync(
        'node_modules/country-flag-emoji-json/dist/by-code.json',
        'utf-8',
      )}}`,
      'assets/countries.json',
    );
  if (api) {
    addApi(docs);
  }
  if (pages) {
    addPages(docs);
  }
  if (api || pages) {
    docs
      .generateNodes({
        group: getSorter(GROUPS),
        category: getSorter(CATEGORIES),
        reflection: getSorter(REFLECTIONS),
      })
      .addPageForEachNode('/', Page)
      .addPageForEachNode('/', ArticleInner, 'article.html')
      .addTextForEachNode('/', NavJson, 'nav.json')
      .addTextForEachNode('/demos', ExecutablePen, 'pen.json')
      .addPageForNode('/api', Page, 'all.html', true)
      .addMarkdownForNode('/', Readme, '../readme.md')
      .addMarkdownForNode('/guides/releases', Readme, '../releases.md');
  }
  docs.publish();
};

const addApi = (docs: Docs): Docs =>
  docs
    .addApiFile('src/common.d.ts')
    .addApiFile('src/store.d.ts')
    .addApiFile('src/checkpoints.d.ts')
    .addApiFile('src/indexes.d.ts')
    .addApiFile('src/metrics.d.ts')
    .addApiFile('src/relationships.d.ts')
    .addApiFile('src/queries.d.ts')
    .addApiFile('src/persisters.d.ts')
    .addApiFile('src/ui-react.d.ts');

const addPages = (docs: Docs): Docs =>
  docs
    .addRootMarkdownFile('site/home/index.md')
    .addMarkdownDir('site/guides')
    .addMarkdownDir('site/demos', true)
    .addMarkdownDir('site/releases');
