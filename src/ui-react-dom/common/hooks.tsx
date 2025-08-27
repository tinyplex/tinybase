import type {DependencyList} from 'react';
import type {Id, Ids} from '../../@types/index.js';
import type {
  CustomCell,
  CustomResultCell,
} from '../../@types/ui-react-dom/index.js';
import type {
  QueriesOrQueriesId,
  StoreOrStoreId,
} from '../../@types/ui-react/index.js';
import {arrayMap} from '../../common/array.ts';
import {objMap, objNew} from '../../common/obj.ts';
import {isArray, isString} from '../../common/other.ts';
import {useCallback, useMemo} from '../../common/react.ts';
import {
  CellComponent,
  Cells,
  HtmlTableParams,
  RelationshipInHtmlRowParams,
} from './index.tsx';

export const useStoreCellComponentProps = (
  store: StoreOrStoreId | undefined,
  tableId: Id,
): {store: StoreOrStoreId | undefined; tableId: Id} =>
  useMemo(() => ({store, tableId}), [store, tableId]);

export const useQueriesCellComponentProps = (
  queries: QueriesOrQueriesId | undefined,
  queryId: Id,
): {queries: QueriesOrQueriesId | undefined; queryId: Id} =>
  useMemo(() => ({queries, queryId}), [queries, queryId]);
export const useCallbackOrUndefined = (
  callback: any,
  deps: DependencyList,
  test: any,
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const returnCallback = useCallback(callback, deps);
  return test ? returnCallback : undefined;
};

export const useParams = <
  Params extends HtmlTableParams | RelationshipInHtmlRowParams,
>(
  ...args: Params
): Params =>
  useMemo(
    () => args as any,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    args,
  );

export const useCells = (
  defaultCellIds: Ids,
  customCells:
    | Ids
    | {[cellId: Id]: string | CustomCell | CustomResultCell}
    | undefined,
  defaultCellComponent: CellComponent,
): Cells<any> =>
  useMemo(() => {
    const cellIds = customCells ?? defaultCellIds;
    return objMap(
      isArray(cellIds)
        ? objNew(arrayMap(cellIds, (cellId) => [cellId, cellId]))
        : cellIds,
      (labelOrCustomCell, cellId) => ({
        ...{label: cellId, component: defaultCellComponent},
        ...(isString(labelOrCustomCell)
          ? {label: labelOrCustomCell}
          : labelOrCustomCell),
      }),
    );
  }, [customCells, defaultCellComponent, defaultCellIds]);
