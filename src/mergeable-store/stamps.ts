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

export const mergeStampedX = <NewX, CurrentX>(
  [newStamp, newX]: Stamped<NewX>,
  currentStampedX: Stamped<CurrentX>,
  mergeX: (newX: NewX, currentX: CurrentX) => CurrentX,
): void => {
  const isNewer = newStamp > currentStampedX[0];
  if (currentStampedX[1] !== undefined || isNewer) {
    currentStampedX[1] = mergeX(newX, currentStampedX[1]);
  }
  if (isNewer) {
    currentStampedX[0] = newStamp;
  }
};

export const mergeEachStampedNode = <Node>(
  newStampedNodes: IdObj<Stamped<Node | undefined>>,
  stampedNodesMap: IdMap<Stamped<Node | any>> | undefined,
  changes: any,
  forEachChildNode: (newThing: Node, currentThing: any, thingId: Id) => void,
): void =>
  objForEach(newStampedNodes, (thingStamp, thingId) =>
    mergeStampedX(
      thingStamp,
      mapEnsure(stampedNodesMap!, thingId, newStamped),
      (newThing, currentThing) => {
        if (isUndefined(newThing)) {
          return (changes[thingId] = newThing);
        }
        currentThing ??= mapNew();
        changes[thingId] = {};
        forEachChildNode(newThing, currentThing, thingId);
        return currentThing;
      },
    ),
  );

export const mergeStampedNode = <Children, ChildrenMap>(
  [newStamp, newChildren]: Stamped<Children>,
  stampedChildrenMap: Stamped<ChildrenMap>,
  changes: IdObj<any>,
  mergeStampedChildren: (
    newStampedChildren: Children,
    stampedChildrenMap: ChildrenMap,
    changes: any,
  ) => void,
): void => {
  const isNewer = newStamp > stampedChildrenMap[0];
  if (isNewer) {
    stampedChildrenMap[0] = newStamp;
  }
  if (stampedChildrenMap[1] !== undefined || isNewer) {
    mergeStampedChildren(newChildren, stampedChildrenMap[1], changes);
  }
};

export const mergeStampedLeaves = <Leaf>(
  newStampedLeaves: IdObj<Stamped<Leaf | undefined>>,
  stampedLeavesMap: IdMap<Stamped<Leaf | undefined>>,
  changes: IdObj<Leaf | undefined>,
): void =>
  objForEach(newStampedLeaves, (newStampedLeaf, leafId) => {
    const stampedLeaf = mapEnsure(stampedLeavesMap, leafId, newStamped);
    const [newStamp, newLeaf] = newStampedLeaf;
    if (newStamp > stampedLeaf[0]) {
      stampedLeaf[0] = newStamp;
      stampedLeaf[1] = changes[leafId] = newLeaf;
    }
  });
