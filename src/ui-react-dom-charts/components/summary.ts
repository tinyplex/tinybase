import type {
  BindingProps,
  ChartProps,
  QuerySourceProps,
  TableSourceProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {isNullish} from '../../common/other.ts';
import {useMemo} from '../../common/react.ts';
import {EMPTY_STRING} from '../../common/strings.ts';
import {
  useQueriesOrQueriesById,
  useStoreOrStoreById,
} from '../../ui-react/index.ts';
import {getDataPoint, getDataPoints, getSeriesSummary} from '../common/data.ts';
import type {Kind, SeriesSummary} from '../common/types.ts';

type AliasProps = (TableSourceProps | QuerySourceProps) &
  BindingProps &
  ChartProps;

export const useInitialSeriesSummary = (
  kind: Kind,
  {
    descending,
    limit,
    offset,
    queries,
    queryId,
    sortCellId,
    store,
    tableId,
    xCellId,
    yCellId,
  }: AliasProps,
): SeriesSummary | undefined => {
  const storeObject = useStoreOrStoreById(store);
  const queriesObject = useQueriesOrQueriesById(queries);

  return useMemo(() => {
    const points = isNullish(tableId)
      ? getDataPoints(
          queriesObject?.getResultSortedRowIds(
            queryId ?? EMPTY_STRING,
            sortCellId ?? xCellId,
            descending,
            offset,
            limit,
          ) ?? [],
          (rowId) =>
            getDataPoint(
              rowId,
              queriesObject?.getResultCell(
                queryId ?? EMPTY_STRING,
                rowId,
                xCellId,
              ),
              queriesObject?.getResultCell(
                queryId ?? EMPTY_STRING,
                rowId,
                yCellId,
              ),
            ),
        )
      : getDataPoints(
          storeObject?.getSortedRowIds(
            tableId,
            sortCellId ?? xCellId,
            descending,
            offset,
            limit,
          ) ?? [],
          (rowId) =>
            getDataPoint(
              rowId,
              storeObject?.getCell(tableId, rowId, xCellId),
              storeObject?.getCell(tableId, rowId, yCellId),
            ),
        );

    return getSeriesSummary(kind, points, xCellId, yCellId);
  }, [
    descending,
    kind,
    limit,
    offset,
    queriesObject,
    queryId,
    sortCellId,
    storeObject,
    tableId,
    xCellId,
    yCellId,
  ]);
};
