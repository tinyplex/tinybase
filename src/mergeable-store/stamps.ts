import {IdMap, mapEnsure, mapNew, mapToObj} from '../common/map';
import {IdObj, objForEach} from '../common/obj';
import {Stamp, Stamped} from '../types/mergeable-store';
import {EMPTY_STRING} from '../common/strings';
import {Id} from '../types/common';
import {isUndefined} from '../common/other';

export const newStamped = (): Stamped<any> => [EMPTY_STRING, undefined];

export const newStampedMap = <Thing>(): Stamped<IdMap<Thing>> => [
  EMPTY_STRING,
  mapNew<Id, Thing>(),
];

export const mapStampedMapToObj = <MapValue, ObjValue = MapValue>(
  stampedMap: Stamped<IdMap<MapValue> | undefined>,
  mapper: (mapValue: MapValue) => ObjValue,
): Stamped<IdObj<ObjValue> | undefined> =>
  mapStamped(stampedMap, (map, stamp) => [
    stamp,
    isUndefined(map) ? undefined : mapToObj(map, mapper),
  ]);

export const mapStamped = <StampedValue, ToValue>(
  [stamp, value]: Stamped<StampedValue>,
  mapper: (value: StampedValue, stamp: Stamp) => ToValue,
): ToValue => mapper(value, stamp);

export const mergeStamped = <NewThing, CurrentThing>(
  [newStamp, newThing]: Stamped<NewThing>,
  currentStampedThing: Stamped<CurrentThing>,
  getNextCurrentThing: (
    newThing: NewThing,
    currentThing: CurrentThing,
  ) => CurrentThing,
  ifNewer: 0 | 1 = 0,
) => {
  const isNewer = newStamp > currentStampedThing[0];
  if ((!ifNewer && currentStampedThing[1] !== undefined) || isNewer) {
    currentStampedThing[1] = getNextCurrentThing(
      newThing,
      currentStampedThing[1],
    );
  }
  if (isNewer) {
    currentStampedThing[0] = newStamp;
  }
  return currentStampedThing;
};

export const mergeEachStamped = <Thing>(
  thingStamps: IdObj<Stamped<Thing | undefined>>,
  allThingStamps: IdMap<Stamped<any>> | undefined,
  changes: any,
  forEachThing?: (
    newThing: Thing | undefined,
    currentThing: any,
    thingId: Id,
  ) => Thing | undefined,
): any => {
  objForEach(thingStamps, (thingStamp, thingId) =>
    mergeStamped(
      thingStamp,
      mapEnsure(allThingStamps!, thingId, newStamped),
      (newThing, currentThing) => {
        if (!forEachThing || isUndefined(newThing)) {
          return (changes[thingId] = newThing ?? undefined);
        }
        currentThing ??= mapNew();
        changes[thingId] = {};
        forEachThing(newThing, currentThing, thingId);
        return currentThing;
      },
      forEachThing ? 0 : 1,
    ),
  );
  return allThingStamps;
};
