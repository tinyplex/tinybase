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
  'table{box-shadow:none!important;filter:none!important}';
const EDIT_DOC_SHOT_STYLE = '#edit{box-shadow:none!important}';
const INSPECTOR = 'aside#tinybaseInspector';
const INSPECTOR_DOC_SHOT_STYLE = [
  'html,body{margin:0;padding:0}',
  `${INSPECTOR}{position:static;display:inline-block}`,
  `${INSPECTOR}>img{display:none}`,
  `${INSPECTOR} main{` +
    'position:static!important;display:inline-flex!important;' +
    'width:auto!important;height:auto!important;flex:none!important;' +
    'overflow:visible!important;box-shadow:none!important}',
  `${INSPECTOR} header{position:static;width:auto;box-shadow:none}`,
  `${INSPECTOR} article{padding-top:0;flex:none;overflow:visible}`,
].join('');

export const DOC_SHOTS: readonly DocShot[] = [
  {
    asset: 'editablecellview-react-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-react/editablecellview-react/',
    selector: '#edit',
    style: EDIT_DOC_SHOT_STYLE,
  },
  {
    asset: 'editablecellview-svelte-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-svelte/editablecellview-svelte/',
    selector: '#edit',
    style: EDIT_DOC_SHOT_STYLE,
  },
  {
    asset: 'editablevalueview-react-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-react/editablevalueview-react/',
    selector: '#edit',
    style: EDIT_DOC_SHOT_STYLE,
  },
  {
    asset: 'editablevalueview-svelte-demo.png',
    framed: true,
    marginRem: 0,
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
    marginRem: 0,
    page: '/demos/ui-components-react/relationshipinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'relationshipinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-svelte/relationshipinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'resultsortedtableinhtmltable-react-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-react/resultsortedtableinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'resultsortedtableinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-svelte/resultsortedtableinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'resulttableinhtmltable-react-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-react/resulttableinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'resulttableinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-svelte/resulttableinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'sliceinhtmltable-react-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-react/sliceinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'sliceinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-svelte/sliceinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'sortedtableinhtmltable-react-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-react/sortedtableinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'sortedtableinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-svelte/sortedtableinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'sortedtablepaginator-react-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-react/sortedtableinhtmltable-react/',
    selector: 'table caption',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'sortedtablepaginator-svelte-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-svelte/sortedtableinhtmltable-svelte/',
    selector: 'table caption',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'tableinhtmltable-react-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-react/tableinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'tableinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-svelte/tableinhtmltable-svelte/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'valuesinhtmltable-react-demo.png',
    framed: true,
    marginRem: 0,
    page: '/demos/ui-components-react/valuesinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: TABLE_DOC_SHOT_STYLE,
  },
  {
    asset: 'valuesinhtmltable-svelte-demo.png',
    framed: true,
    marginRem: 0,
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
