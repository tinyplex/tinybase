/* @jsxImportSource solid-js */
import type {Id, Ids} from '../../@types/index.d.ts';
import type {StoreOrStoreId} from '../../@types/ui-solid/index.d.ts';
import {getValue} from '../../common/solid.ts';
import type {MaybeAccessor} from '../../common/solid.ts';
import {useCellIds} from '../hooks.ts';

export const useCustomOrDefaultCellIds = (
  customCellIds: MaybeAccessor<Ids | undefined>,
  tableId: MaybeAccessor<Id>,
  rowId: MaybeAccessor<Id>,
  store?: MaybeAccessor<StoreOrStoreId | undefined>,
): (() => Ids) => {
  const defaultCellIds = useCellIds(tableId, rowId, store);
  return () => getValue(customCellIds) ?? getValue(defaultCellIds);
};
