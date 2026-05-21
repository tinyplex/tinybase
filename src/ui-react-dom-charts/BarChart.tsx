import type {BarChart as BarChartDecl} from '../@types/ui-react-dom-charts/index.d.ts';
import {Chart} from './common/index.tsx';

export const BarChart: typeof BarChartDecl = (props) => (
  <Chart {...props} kind="bar" />
);
