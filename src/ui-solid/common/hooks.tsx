/* @jsxImportSource solid-js */
import type {Id, Ids} from '../../@types/index.d.ts';
import type {StoreOrStoreId} from '../../@types/ui-solid/index.d.ts';
import {getValue} from '../../common/solid.ts';
import {useCellIds} from '../hooks.ts';

export const useCustomOrDefaultCellIds = (
  customCellIds: Ids | undefined,
  tableId: Id,
  rowId: Id,
  store?: StoreOrStoreId,
): Ids => {
  const defaultCellIds = useCellIds(tableId, rowId, store);
  return customCellIds ?? ((() => getValue(defaultCellIds as any)) as any);
};