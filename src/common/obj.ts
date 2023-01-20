import {arrayIsEmpty, arrayMap} from './array';
import {ifNotUndefined, isInstanceOf, isUndefined} from './other';
import {Id} from '../common.d';

export type IdObj<Value> = {[id: string]: Value};
export type IdObj2<Value> = IdObj<{[id: string]: Value}>;

const object = Object;

export const objIds = object.keys;
export const objFrozen = object.isFrozen;
export const objFreeze = object.freeze;

export const isObject = (obj: unknown): boolean =>
  isInstanceOf(obj, object) && (obj as any).constructor == object;

export const objGet = <Value>(
  obj: IdObj<Value> | Value[] | undefined,
  id: Id,
): Value | undefined => ifNotUndefined(obj, (obj) => (obj as IdObj<Value>)[id]);

export const objHas = (obj: IdObj<unknown> | undefined, id: Id): boolean =>
  !isUndefined(objGet(obj, id));

export const objDel = (obj: IdObj<unknown>, id: Id): boolean => delete obj[id];

export const objMap = <Value, Return>(
  obj: IdObj<Value>,
  cb: (value: Value, id: string) => Return,
): Return[] => arrayMap(object.entries(obj), ([id, value]) => cb(value, id));

export const objIsEmpty = <Value>(obj: IdObj<Value>): boolean =>
  isObject(obj) && arrayIsEmpty(objIds(obj));
