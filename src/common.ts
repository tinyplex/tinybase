import {Id, SortKey} from './common.d';
import {EMPTY_STRING} from './common/strings';

export const defaultSorter = (sortKey1: SortKey, sortKey2: SortKey): number =>
  sortKey1 < sortKey2 ? -1 : 1;

export const id = (key: unknown): Id => EMPTY_STRING + key;
