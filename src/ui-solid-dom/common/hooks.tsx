import {createMemo} from 'solid-js';
import type {Id, Ids} from '../../@types/index.d.ts';
import type {
  CustomCell,
  CustomResultCell,
} from '../../@types/ui-solid-dom/index.d.ts';
import type {
  QueriesOrQueriesId,
  StoreOrStoreId,
} from '../../@types/ui-solid/index.d.ts';
import {arrayMap} from '../../common/array.ts';
import {objMap, objNew} from '../../common/obj.ts';
import {isArray, isString} from '../../common/other.ts';
import type {MaybeAccessor} from '../../common/solid.ts';
import {getValue} from '../../common/solid.ts';
import {
  CellComponent,
  Cells,
  HtmlTableParams,
  RelationshipInHtmlRowParams,
} from './index.tsx';

export const getStoreCellComponentProps = (
  store: StoreOrStoreId | undefined,
  tableId: Id,
): {store: StoreOrStoreId | undefined; tableId: Id} => ({store, tableId});

export const getQueriesCellComponentProps = (
  queries: QueriesOrQueriesId | undefined,
  queryId: Id,
): {queries: QueriesOrQueriesId | undefined; queryId: Id} => ({
  queries,
  queryId,
});

export const getCallbackOrUndefined = (callback: any, test: any): any =>
  test ? callback : undefined;

export const getParams = <
  Params extends HtmlTableParams | RelationshipInHtmlRowParams,
>(
  ...args: Params
): Params => args;

export const useCells = (
  defaultCellIds: MaybeAccessor<Ids>,
  customCells: MaybeAccessor<
    Ids | {[cellId: Id]: string | CustomCell | CustomResultCell} | undefined
  >,
  defaultCellComponent: CellComponent,
): (() => Cells<any>) =>
  // eslint-disable-next-line solid/reactivity
  createMemo(() => {
    const cellIds = getValue(customCells) ?? getValue(defaultCellIds);
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
  });
