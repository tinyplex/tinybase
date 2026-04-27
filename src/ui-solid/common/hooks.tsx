/* @jsxImportSource solid-js */
import type {Id, Ids} from '../../@types/index.d.ts';
import type {StoreOrStoreId} from '../../@types/ui-solid/index.d.ts';
import {getValue} from '../../common/solid.ts';
import {useCellIds} from '../hooks.ts';

export const useCustomOrDefaultCellIds = (
  customCellIds: (() => Ids | undefined) | Ids | undefined,
  tableId: (() => Id) | Id,
  rowId: (() => Id) | Id,
  store?: (() => StoreOrStoreId | undefined) | StoreOrStoreId,
): Ids => {
  const defaultCellIds = useCellIds(tableId as any, rowId as any, store as any);
  return (
    (() => getValue(customCellIds) ?? getValue(defaultCellIds as any)) as any
  );
};
