import {collDel, collForEach, collHas} from './coll';
import {ifNotUndefined, isUndefined} from './other';
import {Id} from '../common.d';
import {IdObj} from './obj';

export type IdMap<Value> = Map<Id, Value>;
export type IdMap2<Value> = IdMap<IdMap<Value>>;
export type IdMap3<Value> = IdMap<IdMap2<Value>>;

export const mapNew = <Key, Value>(entries?: [Key, Value][]): Map<Key, Value> =>
  new Map(entries);

export const mapNewPair = <Paired>(
  newFunction: any = mapNew,
): [Paired, Paired] => [newFunction() as Paired, newFunction() as Paired];

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
    map.set(key, getDefaultValue());
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

export const mapClone = <MapValue>(
  map: IdMap<MapValue> | undefined,
  childMapper?: (mapValue: MapValue) => MapValue,
): IdMap<MapValue> => {
  const map2: IdMap<MapValue> = mapNew();
  const mapper = childMapper ?? ((mapValue: MapValue) => mapValue);
  collForEach(map, (value, key) => map2.set(key, mapper(value)));
  return map2;
};

export const mapClone2 = <MapValue>(map: IdMap2<MapValue> | undefined) =>
  mapClone(map, mapClone);
