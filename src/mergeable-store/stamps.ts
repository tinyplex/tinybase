import {
  CellStamp,
  Hash,
  Stamp,
  Time,
  ValueStamp,
} from '../types/mergeable-store';
import {IdMap, mapNew, mapToObj} from '../common/map';
import {IdObj, objNew} from '../common/obj';
import {EMPTY_STRING} from '../common/strings';
import {Id} from '../types/common';
import {getHash} from './hash';

export type StampMap<Thing> = Stamp<IdMap<Thing>, true>;

export type TablesStampMap = StampMap<TableStampMap>;
export type TableStampMap = StampMap<RowStampMap>;
export type RowStampMap = StampMap<CellStamp<true>>;
export type ValuesStampMap = StampMap<ValueStamp<true>>;

export const stampClone = <Value>([time, value]: Stamp<Value, boolean>): Stamp<
  Value,
  false
> => [time, value];

export const stampCloneWithHash = <Value>([time, value, hash]: Stamp<
  Value,
  true
>): Stamp<Value, true> => [time, value, hash];

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

export const stampNewObj = <Thing>(
  time = EMPTY_STRING,
): Stamp<IdObj<Thing>> => [time, objNew<Thing>()];

export const stampNewMap = <Thing>(time = EMPTY_STRING): StampMap<Thing> => [
  time,
  mapNew<Id, Thing>(),
  0,
];

export const stampMap = <From, To = From>(
  [time, value, hash]: Stamp<From, true>,
  mapper: (value: From, time: Time) => To,
): Stamp<To, true> => [time, mapper(value, time), hash];

export const stampMapToObj = <From, To = From>(
  hashStamp: Stamp<IdMap<From>, true>,
  mapper: (mapValue: From) => To = stampCloneWithHash as any,
): Stamp<IdObj<To>, true> =>
  stampMap(hashStamp, (map) => mapToObj(map, mapper));
