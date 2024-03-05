import {IdMap, mapEnsure, mapNew, mapToObj} from '../common/map';
import {IdObj, objForEach, objNew} from '../common/obj';
import {Stamp, Time} from '../types/mergeable-store';
import {EMPTY_STRING} from '../common/strings';
import {Id} from '../types/common';
import {getCellOrValueType} from '../common/cell';
import {hash} from './hash';
import {isUndefined} from '../common/other';
import {jsonString} from '../common/json';

export type HashedStamp<Thing> = [hash: number, time: Time, thing: Thing];

export const stampNew = <Thing>(time: Time, thing?: Thing): Stamp<Thing> => [
  time,
  thing as Thing,
];

export const hashedStampNew = <Thing>(
  time: Time,
  thing?: Thing,
): HashedStamp<Thing> => [
  isUndefined(getCellOrValueType(thing)) ? 0 : hash(time + jsonString(thing)),
  time,
  thing as Thing,
];

export const stampNewObj = <Thing>(time: Time): Stamp<IdObj<Thing>> =>
  stampNew(time, objNew<Thing>());

export const hashedStampNewMap = <Thing>(
  time = EMPTY_STRING,
): HashedStamp<IdMap<Thing>> => [0, time, mapNew<Id, Thing>()];

export const cloneHashedStampToStamp = <Value>([
  ,
  time,
  value,
]: HashedStamp<Value>): Stamp<Value> => [time, value];

export const hashedStampToStamp = <From, To = From>(
  [, time, value]: HashedStamp<From>,
  mapper: (value: From, time: Time) => To,
): Stamp<To> => [time, mapper(value, time)];

export const hashedStampMapToStampObj = <From, To = From>(
  hashedStampMap: HashedStamp<IdMap<From>>,
  mapper: (mapValue: From) => To,
): Stamp<IdObj<To>> =>
  hashedStampToStamp(hashedStampMap, (map) => mapToObj(map, mapper));

export const mergeStampsIntoHashedStamps = <NewThing, Thing>(
  stamps: IdObj<Stamp<NewThing>>,
  hashedStamps: IdMap<HashedStamp<Thing>>,
  changes: any,
  merge: (newThing: NewThing, thing: Thing, changes: any) => void,
): void =>
  objForEach(stamps, (stamp, thingId) =>
    mergeStampIntoHashedStamp(
      stamp,
      mapEnsure<Id, any>(hashedStamps, thingId, hashedStampNewMap),
      (changes[thingId] = objNew()),
      merge,
    ),
  );

export const mergeStampIntoHashedStamp = <NewThing, Thing>(
  [newTime, newThing]: Stamp<NewThing>,
  hashedStamp: HashedStamp<Thing>,
  changes: any,
  merge: (newThing: NewThing, thing: Thing, changes: any) => void,
): void => {
  if (newTime > hashedStamp[1]) {
    hashedStamp[1] = newTime;
  }
  merge(newThing, hashedStamp[2], changes);
};

export const mergeLeafStampsIntoHashedStamps = <Leaf>(
  stamps: IdObj<Stamp<Leaf | undefined>>,
  hashedStamps: IdMap<HashedStamp<Leaf | undefined>>,
  changes: any,
): void =>
  objForEach(stamps, ([newTime, newLeaf], leafId) => {
    const hashedStamp = mapEnsure<Id, any>(
      hashedStamps,
      leafId,
      hashedStampNewMap,
    );
    if (newTime > hashedStamp[1]) {
      hashedStamp[1] = newTime;
      hashedStamp[2] = changes[leafId] = newLeaf;
    }
  });
