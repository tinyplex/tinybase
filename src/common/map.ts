import {IdObj, objHas, objIsEmpty, objToArray} from './obj.ts';
import {collDel, collForEach, collHas, collIsEmpty} from './coll.ts';
import {ifNotUndefined, isUndefined, size} from './other.ts';
import type {Id} from '../@types/common/index.d.ts';
import {arrayMap} from './array.ts';

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

export const mapMatch = <MapValue, ObjValue>(
  map: IdMap<MapValue>,
  obj: IdObj<ObjValue>,
  set: (map: IdMap<MapValue>, id: Id, value: ObjValue) => void,
  del: (map: IdMap<MapValue>, id: Id) => void = mapSet,
): IdMap<MapValue> => {
  objToArray(obj, (value, id) => set(map, id, value));
  mapForEach(map, (id) => (objHas(obj, id) ? 0 : del(map, id)));
  return map;
};

export const mapToObj = <MapValue, ObjValue = MapValue>(
  map: IdMap<MapValue> | undefined,
  valueMapper?: (mapValue: MapValue, id: Id) => ObjValue,
  excludeMapValue?: (mapValue: MapValue, id: Id) => boolean,
  excludeObjValue?: (objValue: ObjValue) => boolean,
): IdObj<ObjValue> => {
  const obj: IdObj<ObjValue> = {};
  collForEach(map, (mapValue, id) => {
    if (!excludeMapValue?.(mapValue, id)) {
      const objValue = valueMapper
        ? valueMapper(mapValue, id)
        : (mapValue as any as ObjValue);
      excludeObjValue?.(objValue) ? 0 : (obj[id] = objValue);
    }
  });
  return obj;
};

export const mapToObj2 = <MapValue, ObjValue = MapValue>(
  map: IdMap2<MapValue> | undefined,
  valueMapper?: (mapValue: MapValue, id: Id) => ObjValue,
  excludeMapValue?: (mapValue: MapValue) => boolean,
) =>
  mapToObj(
    map,
    (childMap) => mapToObj(childMap, valueMapper, excludeMapValue),
    collIsEmpty,
    objIsEmpty,
  );

export const mapToObj3 = <MapValue, ObjValue = MapValue>(
  map: IdMap3<MapValue>,
  valueMapper?: (mapValue: MapValue, id: Id) => ObjValue,
  excludeMapValue?: (mapValue: MapValue) => boolean,
) =>
  mapToObj(
    map,
    (childMap) =>
      mapToObj2<MapValue, ObjValue>(childMap, valueMapper, excludeMapValue),
    collIsEmpty,
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
