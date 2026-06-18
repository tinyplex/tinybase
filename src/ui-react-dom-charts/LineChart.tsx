import type {LineChart as LineChartDecl} from '../@types/ui-react-dom-charts/index.d.ts';
import {getConvenienceChartProps} from './common/props.ts';
import {LINE} from './common/strings.ts';
import {CartesianChart} from './components/CartesianChart.tsx';
import {useInitialSeriesSummary} from './components/summary.ts';
import {LineSeries} from './LineSeries.tsx';

// eslint-disable-next-line react/prop-types
export const LineChart: typeof LineChartDecl = ({children, ...props}) => {
  const initialSummary = useInitialSeriesSummary(LINE, props);
  const [sourceProps, seriesProps] = getConvenienceChartProps(props);

  return (
    <CartesianChart {...sourceProps} initialSummary={initialSummary}>
      <LineSeries {...seriesProps} />
      {children}
    </CartesianChart>
  );
};
