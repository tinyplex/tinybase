import {IdMap, mapEnsure, mapNew, mapToObj} from '../common/map';
import {IdObj, objEnsure, objForEach, objNew} from '../common/obj';
import {Stamp, Time} from '../types/mergeable-store';
import {EMPTY_STRING} from '../common/strings';
import {Id} from '../types/common';

export const stampNew = (): Stamp<any> => [EMPTY_STRING, undefined];

export const stampNewMap = <Thing>(): Stamp<IdMap<Thing>> => [
  EMPTY_STRING,
  mapNew<Id, Thing>(),
];

export const mapStamp = <From, To>(
  [stamp, value]: Stamp<From>,
  mapper: (value: From, stamp: Time) => To,
): Stamp<To> => [stamp, mapper(value, stamp)];

export const mapStampMapToObj = <From, To = From>(
  stampedMap: Stamp<IdMap<From>>,
  mapper: (mapValue: From) => To,
): Stamp<IdObj<To>> => mapStamp(stampedMap, (map) => mapToObj(map, mapper));

export const mergeStamp = <NewNode, Node>(
  [newTime, newNode]: Stamp<NewNode>,
  nodeStamp: Stamp<Node>,
  changes: any,
  merge: (newNode: NewNode, node: Node, changes: any) => void,
): void => {
  if (newTime > nodeStamp[0]) {
    nodeStamp[0] = newTime;
  }
  merge(newNode, nodeStamp[1], changes);
};

export const mergeStamps = <NewNode, Node>(
  newNode: IdObj<Stamp<NewNode>>,
  node: IdMap<Stamp<Node>>,
  changes: IdMap<any>,
  merge: (newNode: NewNode, node: Node, changes: any) => void,
): void =>
  objForEach(newNode, (newNodeStamp, nodeId) =>
    mergeStamp(
      newNodeStamp,
      mapEnsure<Id, any>(node, nodeId, stampNewMap),
      objEnsure<any>(changes, nodeId, objNew),
      merge,
    ),
  );

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
