import {
  CellStamp,
  Hash,
  Stamp,
  Time,
  ValueStamp,
} from '../types/mergeable-store';
import {EMPTY_STRING, NUMBER, getTypeOf} from '../common/strings';
import {IdMap, mapNew, mapToObj} from '../common/map';
import {IdObj, objNew} from '../common/obj';
import {isArray, isFiniteNumber, isString, size} from '../common/other';
import {Id} from '../types/common';
import {getHash} from './hash';

export type StampMap<Thing> = Stamp<IdMap<Thing>, true>;

export type TablesStampMap = StampMap<TableStampMap>;
export type TableStampMap = StampMap<RowStampMap>;
export type RowStampMap = StampMap<CellStamp<true>>;
export type ValuesStampMap = StampMap<ValueStamp<true>>;

const stampCloneWithHash = <Value>([time, value, hash]: Stamp<
  Value,
  true
>): Stamp<Value, true> => [time, value, hash];

export const stampClone = <Value>([time, value]: Stamp<
  Value,
  boolean
>): Stamp<Value> => [time, value];

export const getStampHash = (stamp: Stamp<unknown, true>): Hash => stamp[2];

export const hashIdAndHash = (id: Id, hash: Hash) => getHash(id + ':' + hash);

export const stampUpdate = (
  stamp: Stamp<unknown, true>,
  hash: Hash,
  time: Time,
) => {
  stamp[2] = hash >>> 0;
  if (time > stamp[0]) {
    stamp[0] = time;
  }
};

export const stampNewObj = <Thing>(time: Time): Stamp<IdObj<Thing>> => [
  time,
  objNew<Thing>(),
];

export const stampNewMap = <Thing>(time = EMPTY_STRING): StampMap<Thing> => [
  time,
  mapNew<Id, Thing>(),
  0,
];

export const stampMapToObjWithHash = <From, To = From>(
  [time, map, hash]: Stamp<IdMap<From>, true>,
  mapper: (mapValue: From) => To = stampCloneWithHash as any,
): Stamp<IdObj<To>, true> => [time, mapToObj(map, mapper), hash];

export const stampValidate = (
  stamp: Stamp<any, true>,
  validateThing: (thing: any) => boolean,
) =>
  isArray(stamp) &&
  size(stamp) == 3 &&
  isString(stamp[0]) &&
  validateThing(stamp[1]) &&
  getTypeOf(stamp[2]) == NUMBER &&
  isFiniteNumber(stamp[2]);
