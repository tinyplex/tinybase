import type {Id, SortKey} from '../@types/common';
import {arrayReduce} from './array';
import {encode} from './codec';

export const defaultSorter = (sortKey1: SortKey, sortKey2: SortKey): number =>
  (sortKey1 ?? 0) < (sortKey2 ?? 0) ? -1 : 1;

export const getUniqueId = (length = 16): Id =>
  arrayReduce<number, Id>(
    crypto.getRandomValues(new Uint8Array(length)),
    (uniqueId, number) => uniqueId + encode(number),
    '',
  );
