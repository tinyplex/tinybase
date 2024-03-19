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

export const stampClone = <Value>([time, value]: Stamp<
  Value,
  boolean
>): Stamp<Value> => [time, value];

const cloneHashStamp = <Value>(
  [time, value, hash]: Stamp<Value, true>,
  _id: Id = EMPTY_STRING,
  removeHash: 0 | 1 = 0,
): Stamp<Value, boolean> => (removeHash ? [time, value] : [time, value, hash]);

export const stampNew = <Thing>(
  time: Time = EMPTY_STRING,
  thing?: Thing,
): Stamp<Thing> => [time, thing as Thing];

export const hashIdAndHash = (id: Id, hash: Hash) => getHash(id + ':' + hash);

export const updateStamp = (
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
  time: Time = EMPTY_STRING,
): Stamp<IdObj<Thing>> => stampNew(time, objNew<Thing>());

export const hashStampNewMap = <Thing>(
  time = EMPTY_STRING,
): StampMap<Thing> => [time, mapNew<Id, Thing>(), 0];

export const hashStampNewThing = <Thing>(): Stamp<Thing, true> => [
  EMPTY_STRING,
  undefined as any,
  0,
];

export const hashStampMap = <From, To = From>(
  [time, value, hash]: Stamp<From, true>,
  removeHash: 0 | 1,
  mapper: (value: From, time: Time) => To,
): Stamp<To, boolean> =>
  removeHash ? [time, mapper(value, time)] : [time, mapper(value, time), hash];

export const hashStampMapToObj = <From, To = From>(
  hashStamp: Stamp<IdMap<From>, true>,
  removeHash: 0 | 1 = 0,
  mapper: (
    mapValue: From,
    id: Id,
    removeHash: 0 | 1,
  ) => To = cloneHashStamp as any,
): Stamp<IdObj<To>, boolean> =>
  hashStampMap(hashStamp, removeHash, (map) =>
    mapToObj(map, (from: From, id: Id) => mapper(from, id, removeHash)),
  );
