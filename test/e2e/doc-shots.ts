export type DocShot = {
  asset: string;
  framed: boolean;
  marginRem?: number;
  omitBackground?: boolean;
  page: string;
  selector: string;
  style?: string;
};

export const DOC_SHOTS: readonly DocShot[] = [
  {
    asset: 'valuesinhtmltable-react-demo.png',
    framed: true,
    marginRem: 1,
    omitBackground: false,
    page: '/demos/ui-components-react/valuesinhtmltable-react/',
    selector: 'table:nth-of-type(1)',
    style: 'body{background:#f6d8e5!important}table{box-shadow:none}',
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
