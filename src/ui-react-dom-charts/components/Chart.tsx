import type {
  ChartBindingProps,
  ChartProps,
  ChartQuerySourceProps,
  ChartTableSourceProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {isUndefined} from '../../common/other.ts';
import {
  useCellListener,
  useQueriesOrQueriesById,
  useResultCellListener,
  useResultSortedRowIds,
  useSortedRowIds,
  useStoreOrStoreById,
} from '../../ui-react/index.ts';
import type {ChartKind} from '../common/data.ts';
import {useChartData} from '../common/hooks.ts';
import {
  getChartLabelSize,
  getChartPlotSize,
  useChartLayout,
} from '../common/svg.ts';
import {Group} from './Group.tsx';

export const Chart = ({
  className,
  store,
  tableId,
  queries,
  queryId,
  ...props
}: (ChartTableSourceProps | ChartQuerySourceProps) &
  ChartBindingProps &
  ChartProps & {readonly kind: ChartKind}) =>
  isUndefined(tableId) ? (
    isUndefined(queryId) ? (
      <EmptyChart {...props} className={className} />
    ) : (
      <QueryChart
        {...props}
        className={className}
        queriesOrQueriesId={queries}
        queryId={queryId}
      />
    )
  ) : (
    <TableChart
      {...props}
      className={className}
      storeOrStoreId={store}
      tableId={tableId}
    />
  );

const EmptyChart = ({
  className,
  kind,
  xCellId,
  yCellId,
}: ChartBindingProps & ChartProps & {readonly kind: ChartKind}) => {
  const chartLayout = useChartLayout();
  return (
    <Group
      className={className}
      kind={kind}
      points={[]}
      bounds={[]}
      xLabel={xCellId}
      yLabel={yCellId}
      xTicks={[]}
      yTicks={[]}
      chartLayout={chartLayout}
    />
  );
};

const TableChart = ({
  descending,
  className,
  kind,
  limit,
  offset,
  sortCellId,
  storeOrStoreId,
  tableId,
  xCellId,
  yCellId,
}: Omit<ChartTableSourceProps, 'store'> &
  ChartBindingProps &
  ChartProps & {
    readonly kind: ChartKind;
    readonly storeOrStoreId: ChartTableSourceProps['store'];
  }) => {
  const chartLayout = useChartLayout();
  const store = useStoreOrStoreById(storeOrStoreId);
  const rowIds = useSortedRowIds(
    tableId,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    storeOrStoreId,
  );
  const [handleChange, points, bounds, xTicks, yTicks] = useChartData(
    kind,
    rowIds,
    getChartPlotSize(chartLayout),
    getChartLabelSize(chartLayout),
    (rowId) => store?.getCell(tableId, rowId, xCellId),
    (rowId) => store?.getCell(tableId, rowId, yCellId),
  );

  useCellListener(
    tableId,
    null,
    xCellId,
    handleChange,
    [handleChange],
    false,
    storeOrStoreId,
  );
  useCellListener(
    tableId,
    null,
    yCellId,
    handleChange,
    [handleChange],
    false,
    storeOrStoreId,
  );

  return (
    <Group
      className={className}
      kind={kind}
      points={points}
      bounds={bounds}
      xLabel={xCellId}
      yLabel={yCellId}
      xTicks={xTicks}
      yTicks={yTicks}
      chartLayout={chartLayout}
    />
  );
};

const QueryChart = ({
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
    readonly kind: ChartKind;
    readonly queriesOrQueriesId: ChartQuerySourceProps['queries'];
  }) => {
  const chartLayout = useChartLayout();
  const queries = useQueriesOrQueriesById(queriesOrQueriesId);
  const rowIds = useResultSortedRowIds(
    queryId,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    queriesOrQueriesId,
  );
  const [handleChange, points, bounds, xTicks, yTicks] = useChartData(
    kind,
    rowIds,
    getChartPlotSize(chartLayout),
    getChartLabelSize(chartLayout),
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
    <Group
      className={className}
      kind={kind}
      points={points}
      bounds={bounds}
      xLabel={xCellId}
      yLabel={yCellId}
      xTicks={xTicks}
      yTicks={yTicks}
      chartLayout={chartLayout}
    />
  );
};
