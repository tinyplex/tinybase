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

export const mapStamped = <FromValue, ToValue>(
  [stamp, value]: Stamped<FromValue>,
  mapper: (value: FromValue, stamp: Stamp) => ToValue,
): Stamped<ToValue> => [stamp, mapper(value, stamp)];

export const mapStampedMapToObj = <FromValue, ToValue = FromValue>(
  stampedMap: Stamped<IdMap<FromValue>>,
  mapper: (mapValue: FromValue) => ToValue,
): Stamped<IdObj<ToValue>> =>
  mapStamped(stampedMap, (map) => mapToObj(map, mapper));

export const mergeStamped = <NewThing, CurrentThing>(
  [newStamp, newThing]: Stamped<NewThing>,
  currentStampedThing: Stamped<CurrentThing>,
  mergeThing: (newThing: NewThing, currentThing: CurrentThing) => CurrentThing,
  ifNewer: 0 | 1 = 0,
): Stamped<CurrentThing> => {
  const currentStamp = currentStampedThing[0];
  const isNewer = newStamp > currentStamp;
  if ((!ifNewer && currentStampedThing[1] !== undefined) || isNewer) {
    currentStampedThing[1] = mergeThing(newThing, currentStampedThing[1]);
  }
  if (isNewer) {
    currentStampedThing[0] = newStamp;
  }
  return [currentStampedThing[0], currentStampedThing[1]];
};

export const mergeEachStamped = <Thing>(
  thingStamps: IdObj<Stamped<Thing | undefined>>,
  thingStampsMap: IdMap<Stamped<any>> | undefined,
  changes: any,
  forEachThing?: (
    newThing: Thing,
    currentThing: any,
    thingId: Id,
  ) => Thing | undefined,
): any => {
  objForEach(thingStamps, (thingStamp, thingId) =>
    forEachThing
      ? mergeStamped(
          thingStamp,
          mapEnsure(thingStampsMap!, thingId, newStamped),
          (newThing, currentThing) => {
            if (isUndefined(newThing)) {
              return (changes[thingId] = newThing);
            }
            currentThing ??= mapNew();
            changes[thingId] = {};
            forEachThing(newThing, currentThing, thingId);
            return currentThing;
          },
        )
      : mergeStamped(
          thingStamp,
          mapEnsure(thingStampsMap!, thingId, newStamped),
          (newThing) => (changes[thingId] = newThing),
          1,
        ),
  );
  return thingStampsMap;
};
