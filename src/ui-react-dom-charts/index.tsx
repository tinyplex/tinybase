import type {
  BarChart as BarChartDecl,
  LineChart as LineChartDecl,
} from '../@types/ui-react-dom-charts/index.d.ts';
import {Chart} from './common.tsx';

export const LineChart: typeof LineChartDecl = (props) => (
  <Chart {...props} kind="line" />
);

export const BarChart: typeof BarChartDecl = (props) => (
  <Chart {...props} kind="bar" />
);
