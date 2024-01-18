import {arrayEvery, arrayMap} from './array';
import {ifNotUndefined, isUndefined, size} from './other';
import {Id} from '../types/common.d';

export type IdObj<Value> = {[id: string]: Value};
export type IdObj2<Value> = IdObj<IdObj<Value>>;

export const object = Object;
const getPrototypeOf = (obj: any) => object.getPrototypeOf(obj);
const objEntries = object.entries;

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
    /*! istanbul ignore next */
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
): Return[] => arrayMap(objEntries(obj), ([id, value]) => cb(value, id));

export const objValues = <Value>(obj: IdObj<Value>): Value[] =>
  object.values(obj);

export const objSize = (obj: IdObj<unknown>): number => size(objIds(obj));

export const objIsEmpty = <Value>(obj: IdObj<Value> | any): boolean =>
  isObject(obj) && objSize(obj) == 0;

export const objIsEqual = (
  obj1: IdObj<unknown>,
  obj2: IdObj<unknown>,
): boolean => {
  const entries1 = objEntries(obj1);
  return (
    size(entries1) === objSize(obj2) &&
    arrayEvery(entries1, ([index, value1]) =>
      isObject(value1)
        ? isObject(obj2[index])
          ? objIsEqual(obj2[index] as any, value1 as any)
          : false
        : obj2[index] === value1,
    )
  );
};

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
