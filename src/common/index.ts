import type {
  SortKey,
  defaultSorter as defaultSorterDecl,
} from '../@types/common/index.d.ts';

export {getRandomValues, getUniqueId} from './codec.ts';

export {getHlcFunctions} from './hlc.ts';

export const defaultSorter: typeof defaultSorterDecl = (
  sortKey1: SortKey,
  sortKey2: SortKey,
): number => ((sortKey1 ?? 0) < (sortKey2 ?? 0) ? -1 : 1);
