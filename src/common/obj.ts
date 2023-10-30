import {ifNotUndefined, isUndefined, size} from './other';
import {Id} from '../types/common.d';
import {arrayMap} from './array';

export type IdObj<Value> = {[id: string]: Value};
export type IdObj2<Value> = IdObj<IdObj<Value>>;

export const object = Object;

const getPrototypeOf = (obj: any) => object.getPrototypeOf(obj);

export const objIds = object.keys;
export const objFrozen = object.isFrozen;
export const objFreeze = object.freeze;

export const isObject = (obj: unknown): boolean =>
  !isUndefined(obj) &&
  (ifNotUndefined(
    getPrototypeOf(obj),
    (objPrototype) =>
      objPrototype == object.prototype ||
      isUndefined(getPrototypeOf(objPrototype)),
    () => true,
  ) as boolean);

export const objNew = <Value>(
  entries: [id: string, value: Value][] = [],
): IdObj<Value> => object.fromEntries(entries);

export const objMerge = (...objs: IdObj<unknown>[]) =>
  object.assign({}, ...objs);

export const objGet = <Value>(
  obj: IdObj<Value> | Value[] | undefined,
  id: Id,
): Value | undefined => ifNotUndefined(obj, (obj) => (obj as IdObj<Value>)[id]);

export const objHas = (obj: IdObj<unknown> | undefined, id: Id): boolean =>
  !isUndefined(objGet(obj, id));

export const objDel = <Value>(obj: IdObj<Value>, id: Id): IdObj<Value> => {
  delete obj[id];
  return obj;
};

export const objMap = <Value, Return>(
  obj: IdObj<Value>,
  cb: (value: Value, id: string) => Return,
): Return[] => arrayMap(object.entries(obj), ([id, value]) => cb(value, id));

export const objValues = <Value>(obj: IdObj<Value>): Value[] =>
  object.values(obj);

export const objSize = (obj: IdObj<unknown>): number => size(objIds(obj));

export const objIsEmpty = <Value>(obj: IdObj<Value> | any): boolean =>
  isObject(obj) && objSize(obj) == 0;

export const objEnsure = <Value>(
  obj: IdObj<Value>,
  id: Id | number,
  getDefaultValue: () => Value,
): Value => {
  if (!objHas(obj, id as Id)) {
    obj[id] = getDefaultValue();
  }
  return obj[id] as Value;
};
