import {arrayLength, arrayMap} from './array';
import {collDel, collForEach, collHas, collIsEmpty} from './coll';
import {ifNotUndefined, isUndefined} from './other';
import {Id} from '../types/common.d';
import {IdObj} from './obj';

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
): Value => {
  if (!collHas(map, key)) {
    mapSet(map, key, getDefaultValue());
  }
  return mapGet(map, key) as Value;
};

export const mapToObj = <MapValue, ObjectValue>(
  map: IdMap<MapValue> | undefined,
  childMapper?: (mapValue: MapValue) => ObjectValue,
  childExclude?: (objectValue: ObjectValue) => boolean,
): IdObj<ObjectValue> => {
  const obj: IdObj<ObjectValue> = {};
  const mapper =
    childMapper ?? ((mapValue: MapValue) => mapValue as any as ObjectValue);
  collForEach(map, (value, key) =>
    ifNotUndefined(mapper(value), (mappedValue) =>
      childExclude?.(mappedValue) ? 0 : (obj[key] = mappedValue),
    ),
  );
  return obj;
};

export const mapClone = <Key, Value>(
  map: Map<Key, Value> | undefined,
  childMapper?: (mapValue: Value) => Value,
): Map<Key, Value> => {
  const map2: Map<Key, Value> = mapNew();
  const mapper = childMapper ?? ((mapValue: Value) => mapValue);
  collForEach(map, (value, key) => map2.set(key, mapper(value)));
  return map2;
};

export const mapClone2 = <Key1, Key2, Value>(
  map: Map<Key1, Map<Key2, Value>> | undefined,
) => mapClone(map, mapClone);

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
      p > arrayLength(path) - 2 ? (ensureLeaf as () => Leaf) : mapNew,
    ),
    (nodeOrLeaf) => {
      if (p > arrayLength(path) - 2) {
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
