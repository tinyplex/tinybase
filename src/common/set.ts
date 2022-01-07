import {Id} from '../common.d';
import {IdMap} from './map';

export type IdSet = Set<Id>;
export type IdSet2 = IdMap<IdSet>;
export type IdSet3 = IdMap<IdSet2>;
export type IdSet4 = IdMap<IdSet3>;

export const setNew = <Value>(entries?: Value[]): Set<Value> =>
  new Set(entries);

export const setAdd = <Value>(
  set: Set<Value> | undefined,
  value: Value,
): Set<Value> | undefined => set?.add(value);
