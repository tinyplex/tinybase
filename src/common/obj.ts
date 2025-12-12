import type {Id} from '../@types/common/index.d.ts';
import {arrayEvery, arrayForEach, arrayMap} from './array.ts';
import {ifNotNullish, ifNotUndefined, isNullish, size} from './other.ts';

export type IdObj<Value> = {[id: string]: Value};
export type IdObj2<Value> = IdObj<IdObj<Value>>;

export const object = Object;
const getPrototypeOf = (obj: any) => object.getPrototypeOf(obj);
const objFrozen = object.isFrozen;

export const objEntries = object.entries;

export const isObject = (obj: unknown): obj is IdObj<unknown> =>
  !isNullish(obj) &&
  (ifNotNullish(
    getPrototypeOf(obj),
    (objPrototype) =>
      objPrototype == object.prototype ||
      isNullish(getPrototypeOf(objPrototype)),
    /*! istanbul ignore next */
    () => true,
  ) as boolean);

export const objIds = object.keys;

export const objFreeze = object.freeze;

export const objNew = <Value>(
  entries: [id: string, value: Value][] = [],
): IdObj<Value> => object.fromEntries(entries);

export const objMerge = (...objs: IdObj<unknown>[]) =>
  object.assign({}, ...objs);

export const objGet = <Value>(
  obj: IdObj<Value> | Value[] | undefined,
  id: Id,
): Value | undefined => ifNotUndefined(obj, (obj) => (obj as IdObj<Value>)[id]);

export const objHas = (obj: IdObj<unknown>, id: Id): boolean => id in obj;

export const objDel = <Value>(obj: IdObj<Value>, id: Id): IdObj<Value> => {
  delete obj[id];
  return obj;
};

export const objToMap = <Value>(obj: IdObj<Value>): Map<Id, Value> =>
  new Map(objEntries(obj));

export const objForEach = <Value>(
  obj: IdObj<Value>,
  cb: (value: Value, id: string) => void,
): void => arrayForEach(objEntries(obj), ([id, value]) => cb(value, id));

export const objToArray = <FromValue, ToValue>(
  obj: IdObj<FromValue>,
  cb: (value: FromValue, id: string) => ToValue,
): ToValue[] => arrayMap(objEntries(obj), ([id, value]) => cb(value, id));

export const objMap = <FromValue, ToValue>(
  obj: IdObj<FromValue>,
  cb: (value: FromValue, id: string) => ToValue,
): IdObj<ToValue> =>
  objNew(objToArray(obj, (value, id) => [id, cb(value, id)]));

export const objValues = <Value>(obj: IdObj<Value>): Value[] =>
  object.values(obj);

export const objSize = (obj: IdObj<unknown>): number => size(objIds(obj));

export const objIsEmpty = <Value>(obj: IdObj<Value> | any): boolean =>
  isObject(obj) && objSize(obj) == 0;

/*! istanbul ignore next */
export const objIsEqual = (
  obj1: IdObj<unknown>,
  obj2: IdObj<unknown>,
  isEqual: (value1: unknown, value2: unknown) => boolean = (value1, value2) =>
    value1 === value2,
): boolean => {
  const entries1 = objEntries(obj1);
  return (
    size(entries1) === objSize(obj2) &&
    arrayEvery(entries1, ([index, value1]) =>
      isObject(value1)
        ? /*! istanbul ignore next */
          isObject(obj2[index])
          ? objIsEqual(obj2[index] as any, value1 as any)
          : false
        : isEqual(value1, obj2[index]),
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

export const objValidate = (
  obj: IdObj<any> | undefined,
  validateChild: (child: any, id: Id) => boolean,
  onInvalidObj?: () => void,
  emptyIsValid: 0 | 1 = 0,
): boolean => {
  if (
    isNullish(obj) ||
    !isObject(obj) ||
    (!emptyIsValid && objIsEmpty(obj)) ||
    objFrozen(obj)
  ) {
    onInvalidObj?.();
    return false;
  }
  objForEach(obj, (child, id) => {
    if (!validateChild(child, id)) {
      objDel(obj, id);
    }
  });
  return emptyIsValid ? true : !objIsEmpty(obj);
};
