import type {Id, Ids} from '../../@types/index.js';
import type {StoreOrStoreId} from '../../@types/ui-react/index.js';
import {useCellIds} from '../hooks.ts';

export const useCustomOrDefaultCellIds = (
  customCellIds: Ids | undefined,
  tableId: Id,
  rowId: Id,
  store?: StoreOrStoreId,
): Ids => {
  const defaultCellIds = useCellIds(tableId, rowId, store);
  return customCellIds ?? defaultCellIds;
};
