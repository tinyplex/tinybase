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
  type ChartKind,
} from './data.ts';
import {getChartGroup} from './svg.tsx';

export const Chart = ({
  className,
  store,
  tableId,
  queries,
  queryId,
  ...props
}: (ChartTableSourceProps | ChartQuerySourceProps) &
  ChartBindingProps &
  ChartProps & {readonly kind: ChartKind}) => (
  <svg className={className} data-chart={props.kind} viewBox="0 0 1 1">
    {isUndefined(tableId) ? (
      isUndefined(queryId) ? null : (
        <QueryChart {...props} queriesOrQueriesId={queries} queryId={queryId} />
      )
    ) : (
      <TableChart {...props} storeOrStoreId={store} tableId={tableId} />
    )}
  </svg>
);

const TableChart = ({
  descending,
  kind,
  limit,
  offset,
  sortCellId,
  storeOrStoreId,
  tableId,
  xCellId,
  yCellId,
}: Omit<ChartTableSourceProps, 'store'> &
  ChartBindingProps & {
    readonly kind: ChartKind;
    readonly storeOrStoreId: ChartTableSourceProps['store'];
  }) => {
  const store = useStoreOrStoreById(storeOrStoreId);
  const rowIds = useSortedRowIds(
    tableId,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    storeOrStoreId,
  );
  const [handleChange, points, bounds] = useChartData(
    kind,
    rowIds,
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

  return getChartGroup(kind, points, bounds);
};

const QueryChart = ({
  descending,
  kind,
  limit,
  offset,
  queriesOrQueriesId,
  queryId,
  sortCellId,
  xCellId,
  yCellId,
}: Omit<ChartQuerySourceProps, 'queries'> &
  ChartBindingProps & {
    readonly kind: ChartKind;
    readonly queriesOrQueriesId: ChartQuerySourceProps['queries'];
  }) => {
  const queries = useQueriesOrQueriesById(queriesOrQueriesId);
  const rowIds = useResultSortedRowIds(
    queryId,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    queriesOrQueriesId,
  );
  const [handleChange, points, bounds] = useChartData(
    kind,
    rowIds,
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

  return getChartGroup(kind, points, bounds);
};

const useChartData = (
  kind: ChartKind,
  rowIds: string[],
  getXCell: (rowId: string) => CellOrUndefined | ResultCellOrUndefined,
  getYCell: (rowId: string) => CellOrUndefined | ResultCellOrUndefined,
) => {
  const [, rerender] = useState<[]>();
  const handleChange = useCallback(() => rerender([]), [rerender]);
  const points = getChartDataPoints(rowIds, (rowId) =>
    getChartDataPoint(rowId, getXCell(rowId), getYCell(rowId)),
  );
  const bounds = getChartBounds(kind, points);

  return [handleChange, getChartScaledPoints(points, bounds), bounds] as const;
};
