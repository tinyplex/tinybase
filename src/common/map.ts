import {IdObj, objHas, objIsEmpty, objToArray} from './obj';
import {collDel, collForEach, collHas, collIsEmpty} from './coll';
import {ifNotUndefined, isUndefined, size} from './other';
import {Id} from '../types/common.d';
import {arrayMap} from './array';

export type IdMap<Value> = Map<Id, Value>;
export type IdMap2<Value> = IdMap<IdMap<Value>>;
export type IdMap3<Value> = IdMap<IdMap2<Value>>;

export const mapNew = <Key, Value>(entries?: [Key, Value][]): Map<Key, Value> =>
  new Map(entries);

export const mapKeys = <Key>(map: Map<Key, unknown> | undefined): Key[] => [
  ...(map?.keys() ?? []),
];

export const mapGet = <Key, Value>(
  map: Map<Key, Value> | undefined,
  key: Key,
): Value | undefined => map?.get(key);

export const mapForEach = <Key, Value>(
  map: Map<Key, Value> | undefined,
  cb: (key: Key, value: Value) => void,
): void => collForEach(map, (value, key) => cb(key, value));

export const mapMap = <Key, Value, Return>(
  coll: Map<Key, Value> | undefined,
  cb: (value: Value, key: Key) => Return,
): Return[] =>
  arrayMap([...(coll?.entries() ?? [])], ([key, value]) => cb(value, key));

export const mapSet = <Key, Value>(
  map: Map<Key, Value> | undefined,
  key: Key,
  value?: Value,
): Map<Key, Value> | undefined =>
  isUndefined(value) ? (collDel(map, key), map) : map?.set(key, value);

export const mapEnsure = <Key, Value>(
  map: Map<Key, Value>,
  key: Key,
  getDefaultValue: () => Value,
  hadExistingValue?: (value: Value) => void,
): Value => {
  if (!collHas(map, key)) {
    mapSet(map, key, getDefaultValue());
  } else {
    hadExistingValue?.(mapGet(map, key) as Value);
  }
  return mapGet(map, key) as Value;
};

export const mapMatch = <MapValue, ObjectValue>(
  map: IdMap<MapValue>,
  obj: IdObj<ObjectValue>,
  set: (map: IdMap<MapValue>, id: Id, value: ObjectValue) => void,
  del: (map: IdMap<MapValue>, id: Id) => void = mapSet,
): IdMap<MapValue> => {
  objToArray(obj, (value, id) => set(map, id, value));
  mapForEach(map, (id) => (objHas(obj, id) ? 0 : del(map, id)));
  return map;
};

export const mapToObj = <MapValue, ObjectValue = MapValue>(
  map: IdMap<MapValue> | undefined,
  mapValue?: (mapValue: MapValue, id: Id) => ObjectValue,
  excludeValue?: (objectValue: ObjectValue, mapValue: MapValue) => boolean,
): IdObj<ObjectValue> => {
  const obj: IdObj<ObjectValue> = {};
  collForEach(map, (value, id) => {
    const mappedValue = mapValue
      ? mapValue(value, id)
      : (value as any as ObjectValue);
    excludeValue?.(mappedValue, value) ? 0 : (obj[id] = mappedValue);
  });
  return obj;
};

export const mapToObj2 = <MapValue, ObjectValue = MapValue>(
  map: IdMap2<MapValue> | undefined,
  mapValue?: (mapValue: MapValue, id: Id) => ObjectValue,
  excludeValue?: (objectValue: ObjectValue) => boolean,
) =>
  mapToObj(
    map,
    (childMap) => mapToObj(childMap, mapValue, excludeValue),
    objIsEmpty,
  );

export const mapToObj3 = <MapValue, ObjectValue = MapValue>(
  map: IdMap3<MapValue>,
  mapValue?: (mapValue: MapValue, id: Id) => ObjectValue,
  excludeValue?: (objectValue: ObjectValue) => boolean,
) =>
  mapToObj(
    map,
    (childMap) =>
      mapToObj2<MapValue, ObjectValue>(childMap, mapValue, excludeValue),
    objIsEmpty,
  );

export const mapClone = <MapValue>(
  map: IdMap<MapValue> | undefined,
  mapValue?: (mapValue: MapValue) => MapValue,
): IdMap<MapValue> => {
  const map2: IdMap<MapValue> = mapNew();
  collForEach(map, (value, key) => map2.set(key, mapValue?.(value) ?? value));
  return map2;
};

export const mapClone2 = <MapValue>(map: IdMap2<MapValue> | undefined) =>
  mapClone(map, mapClone);

export const mapClone3 = <MapValue>(map: IdMap3<MapValue> | undefined) =>
  mapClone(map, mapClone2);

export type Node<Path, Leaf> = Map<Path, Node<Path, Leaf> | Leaf>;
export const visitTree = <Path, Leaf>(
  node: Node<Path, Leaf>,
  path: Path[],
  ensureLeaf?: () => Leaf,
  pruneLeaf?: (leaf: Leaf) => 1 | 0 | void,
  p = 0,
): Leaf | undefined =>
  ifNotUndefined(
    (ensureLeaf ? mapEnsure : mapGet)(
      node,
      path[p],
      p > size(path) - 2 ? (ensureLeaf as () => Leaf) : mapNew,
    ),
    (nodeOrLeaf) => {
      if (p > size(path) - 2) {
        if (pruneLeaf?.(nodeOrLeaf as Leaf)) {
          mapSet(node, path[p]);
        }
        return nodeOrLeaf as Leaf;
      }
      const leaf = visitTree(
        nodeOrLeaf as Node<Path, Leaf>,
        path,
        ensureLeaf,
        pruneLeaf,
        p + 1,
      ) as Leaf;
      if (collIsEmpty(nodeOrLeaf as Node<Path, Leaf>)) {
        mapSet(node, path[p]);
      }
      return leaf;
    },
  );
