import type {Id, Ids} from '../../@types/index.d.ts';
import type {StoreOrStoreId} from '../../@types/ui-react/index.d.ts';
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
