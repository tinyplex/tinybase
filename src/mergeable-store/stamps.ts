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
import {
  ifNotUndefined,
  isArray,
  isFiniteNumber,
  isString,
  size,
} from '../common/other';
import {Id} from '../types/common';
import {getHash} from './hash';

export type StampMap<Thing> = Stamp<IdMap<Thing>, true>;

export type TablesStampMap = StampMap<TableStampMap>;
export type TableStampMap = StampMap<RowStampMap>;
export type RowStampMap = StampMap<CellStamp<true>>;
export type ValuesStampMap = StampMap<ValueStamp<true>>;

const hashesNew = () => [0, {}];

const stampCloneWithHash = <Value>([time, value, hash]: Stamp<
  Value,
  true
>): Stamp<Value, true> => [time, value, hash];

export const getHashes = (
  stampMap: StampMap<Stamp<unknown, true>> | undefined,
): [Hash, IdObj<Hash>] =>
  ifNotUndefined(
    stampMap,
    (stampMap) => [stampMap[2], mapToObj(stampMap[1], (stamp) => stamp[2])],
    hashesNew,
  ) as [Hash, IdObj<Hash>];

export const getDeltaHashes = (
  stampMap: StampMap<Stamp<unknown, true>> | undefined,
  [relativeHash, relativeChildren]: [Hash, IdObj<Hash>],
): [Hash, IdObj<Hash>] =>
  ifNotUndefined(
    stampMap,
    (stampMap) =>
      stampMap[2] === relativeHash
        ? hashesNew()
        : [
            stampMap[2],
            mapToObj(
              stampMap[1],
              (childStampMap) => childStampMap[2],
              (childStampMap, childId) =>
                childStampMap[2] === relativeChildren?.[childId],
            ),
          ],
    hashesNew,
  ) as [Hash, IdObj<Hash>];

export const getDeltaStamps = <Thing>(
  stampMap: StampMap<Stamp<Thing, true>> | undefined,
  [relativeHash, relativeChildren]: [Hash, IdObj<Hash>],
): Stamp<IdObj<Stamp<Thing>>> =>
  ifNotUndefined(
    stampMap,
    (stampMap) =>
      stampMap[2] === relativeHash
        ? stampNewObj()
        : [
            stampMap[0],
            mapToObj(
              stampMap[1],
              ([time, value]) => [time, value],
              (childStampMap, childId) =>
                childStampMap[2] === relativeChildren?.[childId],
            ),
          ],
    stampNewObj,
  ) as Stamp<IdObj<Stamp<Thing>>>;

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
