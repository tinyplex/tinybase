import type {LineChart as LineChartDecl} from '../@types/ui-react-dom-charts/index.d.ts';
import {Chart} from './common/index.tsx';

export const LineChart: typeof LineChartDecl = (props) => (
  <Chart {...props} kind="line" />
);
