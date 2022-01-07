import {arrayForEach, arrayIsEmpty} from './array';
import {ifNotUndefined, isInstanceOf, isUndefined} from './other';
import {Id} from '../common.d';

export type IdObj<Value> = {[id: string]: Value};

const object = Object;

export const objIds = object.keys;
export const objFrozen = object.isFrozen;
export const objFreeze = object.freeze;

export const isObject = (obj: unknown): boolean =>
  isInstanceOf(obj, object) && (obj as any).constructor == object;

const objGet = <Value>(
  obj: IdObj<Value> | Value[] | undefined,
  id: Id,
): Value | undefined => ifNotUndefined(obj, (obj) => (obj as IdObj<Value>)[id]);

export const objHas = (obj: IdObj<unknown> | undefined, id: Id): boolean =>
  !isUndefined(objGet(obj, id));

export const objDel = (obj: IdObj<unknown>, id: Id): boolean => delete obj[id];

export const objForEach = <Value>(
  obj: IdObj<Value>,
  cb: (value: Value, id: string) => void,
): void => arrayForEach(object.entries(obj), ([id, value]) => cb(value, id));

export const objIsEmpty = (obj: IdObj<unknown>): boolean =>
  arrayIsEmpty(objIds(obj));
