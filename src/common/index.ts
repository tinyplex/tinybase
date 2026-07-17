import type {
  SortKey,
  defaultSorter as defaultSorterDecl,
} from '../@types/common/index.d.ts';

export {getUniqueId} from './codec.ts';

export {getHlcFunctions} from './hlc.ts';

export * from './hash.ts';

export const defaultSorter: typeof defaultSorterDecl = (
  sortKey1: SortKey,
  sortKey2: SortKey,
): number => {
  const key1 = sortKey1 ?? 0;
  const key2 = sortKey2 ?? 0;
  return key1 < key2 ? -1 : key1 > key2 ? 1 : 0;
};
