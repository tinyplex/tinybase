import type {
  ChartBindingProps,
  ChartProps,
  ChartQuerySourceProps,
  ChartTableSourceProps,
} from '../../@types/ui-react-dom-charts/index.d.ts';
import {useMemo} from '../../common/react.ts';
import {
  useQueriesOrQueriesById,
  useStoreOrStoreById,
} from '../../ui-react/index.ts';
import {getDataPoint, getDataPoints, getSeriesSummary} from '../common/data.ts';
import type {Kind, SeriesSummary} from '../common/types.ts';

type ChartAliasProps = (ChartTableSourceProps | ChartQuerySourceProps) &
  ChartBindingProps &
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
  }: ChartAliasProps,
): SeriesSummary | undefined => {
  const storeObject = useStoreOrStoreById(store);
  const queriesObject = useQueriesOrQueriesById(queries);

  return useMemo(() => {
    const points =
      tableId == null
        ? getDataPoints(
            queriesObject?.getResultSortedRowIds(
              queryId ?? '',
              sortCellId ?? xCellId,
              descending,
              offset,
              limit,
            ) ?? [],
            (rowId) =>
              getDataPoint(
                rowId,
                queriesObject?.getResultCell(queryId ?? '', rowId, xCellId),
                queriesObject?.getResultCell(queryId ?? '', rowId, yCellId),
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
