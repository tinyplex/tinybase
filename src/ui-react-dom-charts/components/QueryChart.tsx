import type {
  ChartBindingProps,
  ChartProps,
  ChartQuerySourceProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {
  useQueriesOrQueriesById,
  useResultCellListener,
  useResultSortedRowIds,
} from '../../ui-react/index.ts';
import {useData} from '../common/hooks.ts';
import {getLabelSize, getPlotSize, useLayout} from '../common/svg.ts';
import type {Kind} from '../common/types.ts';
import {Layout} from './Layout.tsx';

export const QueryChart = ({
  descending,
  className,
  kind,
  limit,
  offset,
  queriesOrQueriesId,
  queryId,
  sortCellId,
  xCellId,
  yCellId,
}: Omit<ChartQuerySourceProps, 'queries'> &
  ChartBindingProps &
  ChartProps & {
    readonly kind: Kind;
    readonly queriesOrQueriesId: ChartQuerySourceProps['queries'];
  }) => {
  const layout = useLayout();
  const queries = useQueriesOrQueriesById(queriesOrQueriesId);
  const rowIds = useResultSortedRowIds(
    queryId,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    queriesOrQueriesId,
  );
  const [handleChange, points, bounds, xTicks, yTicks] = useData(
    kind,
    rowIds,
    getPlotSize(layout),
    getLabelSize(layout),
    xCellId,
    yCellId,
    (rowId) => queries?.getResultCell(queryId, rowId, xCellId),
    (rowId) => queries?.getResultCell(queryId, rowId, yCellId),
  );

  useResultCellListener(
    queryId,
    null,
    xCellId,
    handleChange,
    [handleChange],
    queries,
  );
  useResultCellListener(
    queryId,
    null,
    yCellId,
    handleChange,
    [handleChange],
    queries,
  );

  return (
    <Layout
      className={className}
      kind={kind}
      points={points}
      bounds={bounds}
      titles={[xCellId, yCellId]}
      xTicks={xTicks}
      yTicks={yTicks}
      layout={layout}
    />
  );
};
