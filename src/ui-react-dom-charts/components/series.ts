import type {Id} from '../../@types/common/index.d.ts';
import type {ResultCellOrUndefined} from '../../@types/queries/index.d.ts';
import type {CellOrUndefined} from '../../@types/store/index.d.ts';
import type {SeriesProps} from '../../@types/ui-react-dom-charts/index.d.ts';
import {isNullish} from '../../common/other.ts';
import {useCallback, useLayoutEffect, useState} from '../../common/react.ts';
import {EMPTY_STRING} from '../../common/strings.ts';
import {
  useCellListener,
  useResultCellListener,
  useResultSortedRowIds,
  useSortedRowIds,
} from '../../ui-react/index.ts';
import {SourceType, useCartesianChartContext} from '../common/context.ts';
import {getDataPoint, getDataPoints} from '../common/data.ts';
import type {DataPoint} from '../common/types.ts';

export const useSeriesData = ({
  descending,
  limit,
  offset,
  sortCellId,
  xCellId,
  yCellId,
}: SeriesProps): readonly [Id, DataPoint[]] => {
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
    tableId ?? EMPTY_STRING,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    storeOrStoreId,
  );
  const queryRowIds = useResultSortedRowIds(
    queryId ?? EMPTY_STRING,
    sortCellId ?? xCellId,
    descending,
    offset,
    limit,
    queriesOrQueriesId,
  );
  const rowIds = sourceType == SourceType.Table ? tableRowIds : queryRowIds;
  const points = isNullish(yCellId)
    ? []
    : getDataPoints(rowIds, (rowId) =>
        getDataPoint(
          rowId,
          getCell(sourceType, store, queries, tableId, queryId, rowId, xCellId),
          getCell(sourceType, store, queries, tableId, queryId, rowId, yCellId),
        ),
      );

  useCellListener(
    sourceType == SourceType.Table ? (tableId ?? null) : null,
    null,
    xCellId,
    handleChange,
    [handleChange],
    false,
    storeOrStoreId,
  );
  useCellListener(
    sourceType == SourceType.Table ? (tableId ?? null) : null,
    null,
    yCellId ?? null,
    handleChange,
    [handleChange],
    false,
    storeOrStoreId,
  );
  useResultCellListener(
    sourceType == SourceType.Query ? (queryId ?? null) : null,
    null,
    xCellId,
    handleChange,
    [handleChange],
    queriesOrQueriesId,
  );
  useResultCellListener(
    sourceType == SourceType.Query ? (queryId ?? null) : null,
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

export const getSeriesClassName = (
  baseClassName: string,
  className?: string,
) => (isNullish(className) ? baseClassName : `${baseClassName} ${className}`);

const getCell = (
  sourceType: SourceType,
  store: {getCell: (...args: any[]) => CellOrUndefined} | undefined,
  queries:
    {getResultCell: (...args: any[]) => ResultCellOrUndefined} | undefined,
  tableId: Id | undefined,
  queryId: Id | undefined,
  rowId: Id,
  cellId: Id,
) =>
  sourceType == SourceType.Table
    ? store?.getCell(tableId as Id, rowId, cellId)
    : queries?.getResultCell(queryId as Id, rowId, cellId);
