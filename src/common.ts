import {Id, SortKey} from './types/common.d';
import {arrayReduce} from './common/array';
import {encode} from './common/codec';

export const defaultSorter = (sortKey1: SortKey, sortKey2: SortKey): number =>
  (sortKey1 ?? 0) < (sortKey2 ?? 0) ? -1 : 1;

export const getUniqueId = (): Id =>
  arrayReduce<number, Id>(
    crypto.getRandomValues(new Uint8Array(16)),
    (uniqueId, number) => uniqueId + encode(number),
    '',
  );
