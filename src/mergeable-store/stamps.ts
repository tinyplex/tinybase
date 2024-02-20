import {IdMap, mapEnsure, mapNew, mapToObj} from '../common/map';
import {IdObj, objForEach, objNew} from '../common/obj';
import {Stamp, Time} from '../types/mergeable-store';
import {EMPTY_STRING} from '../common/strings';
import {Id} from '../types/common';

export const stampNew = (time = EMPTY_STRING): Stamp<any> => [time, undefined];

export const stampNewMap = <Thing>(
  time = EMPTY_STRING,
): Stamp<IdMap<Thing>> => [time, mapNew<Id, Thing>()];

export const mapStamp = <From, To>(
  [time, value]: Stamp<From>,
  mapper: (value: From, time: Time) => To,
): Stamp<To> => [time, mapper(value, time)];

export const cloneStamp = <Value>([
  time,
  value,
]: Stamp<Value>): Stamp<Value> => [time, value];

export const mapStampMapToObj = <From, To = From>(
  stampedMap: Stamp<IdMap<From>>,
  mapper: (mapValue: From) => To,
): Stamp<IdObj<To>> => mapStamp(stampedMap, (map) => mapToObj(map, mapper));

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
  [newTime, newThing]: Stamp<NewThing>,
  thingStamp: Stamp<Thing>,
  changes: any,
  merge: (newThing: NewThing, thing: Thing, changes: any) => void,
): void => {
  if (newTime > thingStamp[0]) {
    thingStamp[0] = newTime;
  }
  merge(newThing, thingStamp[1], changes);
};

export const mergeLeafStamps = <Leaf>(
  newLeafStamps: IdObj<Stamp<Leaf | undefined>>,
  leafStamps: IdMap<Stamp<Leaf | undefined>>,
  changes: any,
): void =>
  objForEach(newLeafStamps, ([newTime, newLeaf], leafId) => {
    const leafStamp = mapEnsure(leafStamps, leafId, stampNew);
    if (newTime > leafStamp[0]) {
      leafStamp[0] = newTime;
      leafStamp[1] = changes[leafId] = newLeaf;
    }
  });
