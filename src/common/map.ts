import {collDel, collForEach, collHas} from './coll';
import {Id} from '../common.d';
import {IdObj} from './obj';
import {isUndefined} from './other';

export type IdMap<Value> = Map<Id, Value>;

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
  defaultValue: Value,
  onWillAdd?: (defaultValue: Value) => void,
): Value => {
  if (!collHas(map, key)) {
    onWillAdd?.(defaultValue);
    map.set(key, defaultValue);
  }
  return mapGet(map, key) as Value;
};

export const mapToObj = <MapValue, ObjectValue>(
  map: IdMap<MapValue> | undefined,
  childMapper?: (mapValue: MapValue) => ObjectValue,
): IdObj<ObjectValue> => {
  const obj: IdObj<ObjectValue> = {};
  const mapper =
    childMapper ?? ((mapValue: MapValue) => mapValue as any as ObjectValue);
  collForEach(map, (value, key) => (obj[key] = mapper(value)));
  return obj;
};

export const mapToObj2 = <MapValue, ObjectValue>(
  map: IdMap<IdMap<MapValue>> | undefined,
) => mapToObj<IdMap<MapValue>, IdObj<ObjectValue>>(map, mapToObj);

export const mapToObj3 = <MapValue, ObjectValue>(
  map: IdMap<IdMap<IdMap<MapValue>>> | undefined,
) =>
  mapToObj<IdMap<IdMap<MapValue>>, IdObj<IdObj<ObjectValue>>>(map, mapToObj2);

export const mapClone = <MapValue>(
  map: IdMap<MapValue> | undefined,
  childMapper?: (mapValue: MapValue) => MapValue,
): IdMap<MapValue> => {
  const map2: IdMap<MapValue> = mapNew();
  const mapper = childMapper ?? ((mapValue: MapValue) => mapValue);
  collForEach(map, (value, key) => map2.set(key, mapper(value)));
  return map2;
};

export const mapClone2 = <MapValue>(map: IdMap<IdMap<MapValue>> | undefined) =>
  mapClone(map, mapClone);

export const mapClone3 = <MapValue>(
  map: IdMap<IdMap<IdMap<MapValue>>> | undefined,
) => mapClone(map, mapClone2);
