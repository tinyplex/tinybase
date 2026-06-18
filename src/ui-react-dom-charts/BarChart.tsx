import type {BarChart as BarChartDecl} from '../@types/ui-react-dom-charts/index.d.ts';
import {BarSeries} from './BarSeries.tsx';
import {getConvenienceChartProps} from './common/props.ts';
import {BAR} from './common/strings.ts';
import {CartesianChart} from './components/CartesianChart.tsx';
import {useInitialSeriesSummary} from './components/summary.ts';

// eslint-disable-next-line react/prop-types
export const BarChart: typeof BarChartDecl = ({children, ...props}) => {
  const initialSummary = useInitialSeriesSummary(BAR, props);
  const [sourceProps, seriesProps] = getConvenienceChartProps(props);

  return (
    <CartesianChart {...sourceProps} initialSummary={initialSummary}>
      <BarSeries {...seriesProps} />
      {children}
    </CartesianChart>
  );
};
