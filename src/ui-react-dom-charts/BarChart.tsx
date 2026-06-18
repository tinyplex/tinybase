import type {BarChart as BarChartDecl} from '../@types/ui-react-dom-charts/index.d.ts';
import {BarSeries} from './BarSeries.tsx';
import {BAR} from './common/strings.ts';
import {CartesianChart} from './components/CartesianChart.tsx';
import {useInitialSeriesSummary} from './components/summary.ts';

type BarChartProps = Parameters<typeof BarChartDecl>[0];

// eslint-disable-next-line react/prop-types
export const BarChart: typeof BarChartDecl = ({children, ...props}) => {
  const initialSummary = useInitialSeriesSummary(BAR, props);

  return (
    <CartesianChart {...getSourceProps(props)} initialSummary={initialSummary}>
      <BarSeries {...getSeriesProps(props)} />
      {children}
    </CartesianChart>
  );
};

const getSourceProps = (props: BarChartProps) =>
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
}: BarChartProps) => ({
  descending,
  limit,
  offset,
  sortCellId,
  xCellId,
  yCellId,
});
