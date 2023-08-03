import {SortKey} from './types/common.d';

export const defaultSorter = (sortKey1: SortKey, sortKey2: SortKey): number =>
  (sortKey1 ?? 0) < (sortKey2 ?? 0) ? -1 : 1;
