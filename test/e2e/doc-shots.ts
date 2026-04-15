export type DocShot = {
  asset: string;
  clicks?: string[];
  framed: boolean;
  marginRem?: number;
  omitBackground?: boolean;
  page: string;
  selector: string;
  style?: string;
};

const TABLE_DOC_SHOT_STYLE =
  'body{background:#f6d8e5!important}' +
  'table{box-shadow:none!important;filter:none!important}';
const EDIT_DOC_SHOT_STYLE =
  'body{background:#f6d8e5!important}#edit{box-shadow:none!important}';
const INSPECTOR_DOC_SHOT_STYLE =
  'html,body{' +
  'background:#f6d8e5!important;margin:0!important;padding:0!important}' +
  'aside#tinybaseInspector{' +
  'position:static!important;display:inline-block!important;' +
  'padding:1rem!important;background:#f6d8e5!important;box-sizing:border-box}' +
  'aside#tinybaseInspector>img{display:none!important}' +
  'aside#tinybaseInspector main{' +
  'display:inline-flex!important;flex:none!important;' +
  'overflow:visible!important;' +
  'box-shadow:none!important;' +
  'position:static!important;top:auto!important;right:auto!important;' +
  'bottom:auto!important;left:auto!important;width:auto!important;' +
  'height:auto!important;max-height:none!important}' +
  'aside#tinybaseInspector header{' +
  'position:static!important;width:auto!important;box-shadow:none!important}' +
  'aside#tinybaseInspector article{' +
  'padding-top:0!important;flex:none!important;overflow:visible!important}';

export const DOC_SHOTS: readonly DocShot[] = [
  {
    asset: 'editablecellview-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/editablecellview-react/',
    selector: '#edit',
    style: EDIT_DOC_SHOT_STYLE,
  },
  {
    asset: 'editablecellview-svelte-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-svelte/editablecellview-svelte/',
    selector: '#edit',
    style: EDIT_DOC_SHOT_STYLE,
  },
  {
    asset: 'editablevalueview-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/editablevalueview-react/',
    selector: '#edit',
    style: EDIT_DOC_SHOT_STYLE,
  },
  {
    asset: 'editablevalueview-svelte-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-svelte/editablevalueview-svelte/',
    selector: '#edit',
    style: EDIT_DOC_SHOT_STYLE,
  },
  {
    asset: 'inspector-react-demo.png',
    clicks: [
      'aside#tinybaseInspector article > details > summary',
      'aside#tinybaseInspector article > details > div > ' +
        'details:nth-of-type(2) > summary',
      'aside#tinybaseInspector article > details > div > ' +
        'details:nth-of-type(2) > div > details:nth-of-type(2) > summary',
    ],
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-react/inspector-react/',
    selector: 'aside#tinybaseInspector',
    style: INSPECTOR_DOC_SHOT_STYLE,
  },
  {
    asset: 'inspector-svelte-demo.png',
    clicks: [
      'aside#tinybaseInspector article > details > summary',
      'aside#tinybaseInspector article > details > div > ' +
        'details:nth-of-type(2) > summary',
      'aside#tinybaseInspector article > details > div > ' +
        'details:nth-of-type(2) > div > details:nth-of-type(2) > summary',
    ],
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-svelte/inspector-svelte/',
    selector: 'aside#tinybaseInspector',
    style: INSPECTOR_DOC_SHOT_STYLE,
  },
  {
    asset: 'relationshipinhtmltable-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/relationshipinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'relationshipinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-svelte/relationshipinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'resultsortedtableinhtmltable-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/resultsortedtableinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'resultsortedtableinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-svelte/resultsortedtableinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'resulttableinhtmltable-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/resulttableinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'resulttableinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-svelte/resulttableinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'sliceinhtmltable-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/sliceinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'sliceinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-svelte/sliceinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'sortedtableinhtmltable-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/sortedtableinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'sortedtableinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-svelte/sortedtableinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'sortedtablepaginator-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/sortedtableinhtmltable-react/',
    selector: 'table caption',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'sortedtablepaginator-svelte-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-svelte/sortedtableinhtmltable-svelte/',
    selector: 'table caption',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'tableinhtmltable-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/tableinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'tableinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-svelte/tableinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'valuesinhtmltable-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/valuesinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'valuesinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-svelte/valuesinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
];

export const getDocShotMap = (): Map<string, DocShot> => {
  const shots = new Map<string, DocShot>();
  DOC_SHOTS.forEach((shot) => {
    if (shots.has(shot.asset)) {
      throw new Error(`Duplicate doc shot asset: ${shot.asset}`);
    }
    shots.set(shot.asset, shot);
  });
  return shots;
};
