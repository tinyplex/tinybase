import type {
  jsonParseWithUndefined as jsonParseWithUndefinedDecl,
  jsonStringWithUndefined as jsonStringWithUndefinedDecl,
} from '../@types/common/index.d.ts';
import {arrayMap} from './array.ts';
import {isObject, objMap, objNew} from './obj.ts';
import {isArray, isInstanceOf, isUndefined} from './other.ts';
import {UNDEFINED} from './strings.ts';

export const jsonString = JSON.stringify;
export const jsonParse = JSON.parse;

export const jsonStringWithMap = (obj: unknown): string =>
  jsonString(obj, (_key, value) =>
    isInstanceOf(value, Map) ? objNew([...value]) : value,
  );

export const jsonStringWithUndefined: typeof jsonStringWithUndefinedDecl = (
  obj: unknown,
): string =>
  jsonString(obj, (_key, value) => (isUndefined(value) ? UNDEFINED : value));

export const jsonParseWithUndefined: typeof jsonParseWithUndefinedDecl = (
  str: string,
): any =>
  // JSON.parse reviver removes properties with undefined values
  replaceUndefinedString(jsonParse(str));

const replaceUndefinedString = (obj: any): any =>
  obj === UNDEFINED
    ? undefined
    : isArray(obj)
      ? arrayMap(obj, replaceUndefinedString)
      : isObject(obj)
        ? objMap(obj, replaceUndefinedString)
        : obj;
