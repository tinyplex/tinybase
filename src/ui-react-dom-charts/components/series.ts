import type {Id} from '../../@types/common/index.d.ts';
import type {ResultCellOrUndefined} from '../../@types/queries/index.d.ts';
import type {CellOrUndefined} from '../../@types/store/index.d.ts';
import type {ChartSeriesProps} from '../../@types/ui-react-dom-charts/index.d.ts';
import {useCallback, useLayoutEffect, useState} from '../../common/react.ts';
import {
  useCellListener,
  useResultCellListener,
  useResultSortedRowIds,
  useSortedRowIds,
} from '../../ui-react/index.ts';
import {useCartesianChartContext} from '../common/context.ts';
import {getDataPoint, getDataPoints} from '../common/data.ts';
import type {DataPoint} from '../common/types.ts';

const EMPTY_ID = '';

export const useSeriesData = ({
  descending,
  limit,
  offset,
  sortCellId,
  xCellId,
  yCellId,
}: ChartSeriesProps): readonly [Id, DataPoint[]] => {
  const [, rerender] = useState<[]>();
  const context = useCartesianChartContext();
  const {
    getSeriesId,
    queries,
    queriesOrQueriesId,
    queryId,
    releaseSeriesId,
    sourceType,
    store,
    storeOrStoreId,
    tableId,
  } = context;
  const [seriesId] = useState(getSeriesId);
  const handleChange = useCallback(() => rerender([]), [rerender]);
  const tableRowIds = useSortedRowIds(
    tableId ?? EMPTY_ID,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    storeOrStoreId,
  );
  const queryRowIds = useResultSortedRowIds(
    queryId ?? EMPTY_ID,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    queriesOrQueriesId,
  );
  const rowIds = sourceType == 'table' ? tableRowIds : queryRowIds;
  const points =
    yCellId == null
      ? []
      : getDataPoints(rowIds, (rowId) =>
          getDataPoint(
            rowId,
            getCell(
              sourceType,
              store,
              queries,
              tableId,
              queryId,
              rowId,
              xCellId,
            ),
            getCell(
              sourceType,
              store,
              queries,
              tableId,
              queryId,
              rowId,
              yCellId,
            ),
          ),
        );

  useCellListener(
    sourceType == 'table' ? (tableId ?? null) : null,
    null,
    xCellId,
    handleChange,
    [handleChange],
    false,
    storeOrStoreId,
  );
  useCellListener(
    sourceType == 'table' ? (tableId ?? null) : null,
    null,
    yCellId ?? null,
    handleChange,
    [handleChange],
    false,
    storeOrStoreId,
  );
  useResultCellListener(
    sourceType == 'query' ? (queryId ?? null) : null,
    null,
    xCellId,
    handleChange,
    [handleChange],
    queriesOrQueriesId,
  );
  useResultCellListener(
    sourceType == 'query' ? (queryId ?? null) : null,
    null,
    yCellId ?? null,
    handleChange,
    [handleChange],
    queriesOrQueriesId,
  );

  useLayoutEffect(
    () => () => releaseSeriesId(seriesId),
    [releaseSeriesId, seriesId],
  );

  return [seriesId, points];
};

const getCell = (
  sourceType: string,
  store: {getCell: (...args: any[]) => CellOrUndefined} | undefined,
  queries:
    | {getResultCell: (...args: any[]) => ResultCellOrUndefined}
    | undefined,
  tableId: Id | undefined,
  queryId: Id | undefined,
  rowId: Id,
  cellId: Id,
) =>
  sourceType == 'table'
    ? store?.getCell(tableId as Id, rowId, cellId)
    : queries?.getResultCell(queryId as Id, rowId, cellId);
