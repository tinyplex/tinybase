export type DocShot = {
  asset: string;
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
    asset: 'editablevalueview-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/editablevalueview-react/',
    selector: '#edit',
    style: EDIT_DOC_SHOT_STYLE,
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
    asset: 'resultsortedtableinhtmltable-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/resultsortedtableinhtmltable-react/',
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
    asset: 'sliceinhtmltable-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/sliceinhtmltable-react/',
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
    asset: 'sortedtablepaginator-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/sortedtableinhtmltable-react/',
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
    asset: 'valuesinhtmltable-react-demo.png',
    framed: true,
    marginRem: 1,
    page: '/demos/ui-components-react/valuesinhtmltable-react/',
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
