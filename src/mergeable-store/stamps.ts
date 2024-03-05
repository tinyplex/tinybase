import {IdMap, mapEnsure, mapNew, mapToObj} from '../common/map';
import {IdObj, objForEach, objNew} from '../common/obj';
import {Stamp, Time} from '../types/mergeable-store';
import {EMPTY_STRING} from '../common/strings';
import {Id} from '../types/common';

export const stampNew = <Thing>(
  time: Time = EMPTY_STRING,
  thing?: Thing,
): Stamp<Thing> => [0, time, thing as Thing];

export const stampNewMap = <Thing>(time = EMPTY_STRING): Stamp<IdMap<Thing>> =>
  stampNew(time, mapNew<Id, Thing>());

export const stampNewObj = <Thing>(time: Time): Stamp<IdObj<Thing>> =>
  stampNew(time, objNew<Thing>());

export const mapStamp = <From, To>(
  [hash, time, value]: Stamp<From>,
  mapper: (value: From, time: Time) => To,
): Stamp<To> => [hash, time, mapper(value, time)];

export const cloneStamp = <Value>([
  hash,
  time,
  value,
]: Stamp<Value>): Stamp<Value> => [hash, time, value];

export const mapStampMapToObj = <From, To = From>(
  stampMap: Stamp<IdMap<From>>,
  mapper: (mapValue: From) => To,
): Stamp<IdObj<To>> => mapStamp(stampMap, (map) => mapToObj(map, mapper));

export const mergeStamps = <NewThing, Thing>(
  newThingStamps: IdObj<Stamp<NewThing>>,
  thingStamps: IdMap<Stamp<Thing>>,
  changes: any,
  merge: (newThing: NewThing, thing: Thing, changes: any) => void,
): void =>
  objForEach(newThingStamps, (newThingStamp, thingId) =>
    mergeStamp(
      newThingStamp,
      mapEnsure<Id, any>(thingStamps, thingId, stampNewMap),
      (changes[thingId] = objNew()),
      merge,
    ),
  );

export const mergeStamp = <NewThing, Thing>(
  [, newTime, newThing]: Stamp<NewThing>,
  thingStamp: Stamp<Thing>,
  changes: any,
  merge: (newThing: NewThing, thing: Thing, changes: any) => void,
): void => {
  if (newTime > thingStamp[1]) {
    thingStamp[1] = newTime;
  }
  merge(newThing, thingStamp[2], changes);
};

export const mergeLeafStamps = <Leaf>(
  newLeafStamps: IdObj<Stamp<Leaf | undefined>>,
  leafStamps: IdMap<Stamp<Leaf | undefined>>,
  changes: any,
): void =>
  objForEach(newLeafStamps, ([, newTime, newLeaf], leafId) => {
    const leafStamp = mapEnsure(leafStamps, leafId, stampNew);
    if (newTime > leafStamp[1]) {
      leafStamp[1] = newTime;
      leafStamp[2] = changes[leafId] = newLeaf;
    }
  });
