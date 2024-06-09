import {isArray, isUndefined} from './other.ts';
import type {Id} from '../@types/common/index.d.ts';
import {IdMap} from './map.ts';

export type IdSet = Set<Id>;
export type IdSet2 = IdMap<IdSet>;
export type IdSet3 = IdMap<IdSet2>;
export type IdSet4 = IdMap<IdSet3>;

export const setNew = <Value>(entryOrEntries?: Value | Value[]): Set<Value> =>
  new Set(
    isArray(entryOrEntries) || isUndefined(entryOrEntries)
      ? entryOrEntries
      : [entryOrEntries],
  );

export const setAdd = <Value>(
  set: Set<Value> | undefined,
  value: Value,
): Set<Value> | undefined => set?.add(value);
