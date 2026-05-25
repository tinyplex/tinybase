import type {ResultCellOrUndefined} from '../../@types/queries/index.d.ts';
import type {CellOrUndefined} from '../../@types/store/index.d.ts';
import type {
  ChartBindingProps,
  ChartProps,
  ChartQuerySourceProps,
  ChartTableSourceProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {isUndefined} from '../../common/other.ts';
import {useCallback, useState} from '../../common/react.ts';
import {
  useCellListener,
  useQueriesOrQueriesById,
  useResultCellListener,
  useResultSortedRowIds,
  useSortedRowIds,
  useStoreOrStoreById,
} from '../../ui-react/index.ts';
import {
  getChartBounds,
  getChartDataPoint,
  getChartDataPoints,
  getChartScaledPoints,
  getChartTickBounds,
  getChartXTicks,
  getChartYTicks,
  type ChartKind,
  type ChartSize,
} from './data.ts';
import {
  getChartLabelSize,
  getChartGroup,
  getChartPlotSize,
  useChartLayout,
} from './svg.tsx';

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
}: ChartBindingProps & ChartProps & {readonly kind: ChartKind}) =>
  getChartGroup(
    className,
    kind,
    [],
    [],
    xCellId,
    yCellId,
    [],
    [],
    useChartLayout(),
  );

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

  return getChartGroup(
    className,
    kind,
    points,
    bounds,
    xCellId,
    yCellId,
    xTicks,
    yTicks,
    chartLayout,
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

  return getChartGroup(
    className,
    kind,
    points,
    bounds,
    xCellId,
    yCellId,
    xTicks,
    yTicks,
    chartLayout,
  );
};

const useChartData = (
  kind: ChartKind,
  rowIds: string[],
  chartSize: ChartSize,
  labelSize: number,
  getXCell: (rowId: string) => CellOrUndefined | ResultCellOrUndefined,
  getYCell: (rowId: string) => CellOrUndefined | ResultCellOrUndefined,
) => {
  const [, rerender] = useState<[]>();
  const handleChange = useCallback(() => rerender([]), [rerender]);
  const points = getChartDataPoints(rowIds, (rowId) =>
    getChartDataPoint(rowId, getXCell(rowId), getYCell(rowId)),
  );
  const dataBounds = getChartBounds(kind, points);
  const xTicks = getChartXTicks(kind, dataBounds, chartSize, labelSize);
  const yTicks = getChartYTicks(dataBounds, chartSize, labelSize);
  const bounds = getChartTickBounds(dataBounds, xTicks, yTicks);

  return [
    handleChange,
    getChartScaledPoints(kind, points, bounds, chartSize),
    bounds,
    xTicks,
    yTicks,
  ] as const;
};
