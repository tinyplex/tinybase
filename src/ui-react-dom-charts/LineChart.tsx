import type {LineChart as LineChartDecl} from '../@types/ui-react-dom-charts/index.d.ts';
import {CartesianChart} from './components/CartesianChart.tsx';
import {useInitialSeriesSummary} from './components/summary.ts';
import {LineSeries} from './LineSeries.tsx';

type LineChartProps = Parameters<typeof LineChartDecl>[0];

// eslint-disable-next-line react/prop-types
export const LineChart: typeof LineChartDecl = ({children, ...props}) => {
  const initialSummary = useInitialSeriesSummary('line', props);

  return (
    <CartesianChart {...getSourceProps(props)} initialSummary={initialSummary}>
      <LineSeries {...getSeriesProps(props)} />
      {children}
    </CartesianChart>
  );
};

const getSourceProps = (props: LineChartProps) =>
  props.tableId == null
    ? {
        className: props.className,
        queries: props.queries,
        queryId: props.queryId,
      }
    : {className: props.className, store: props.store, tableId: props.tableId};

const getSeriesProps = ({
  descending,
  limit,
  offset,
  sortCellId,
  xCellId,
  yCellId,
}: LineChartProps) => ({
  descending,
  limit,
  offset,
  sortCellId,
  xCellId,
  yCellId,
});
