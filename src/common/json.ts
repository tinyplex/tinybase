import {arrayMap} from './array.ts';
import {ERROR_RESERVED_STRING, errorThrow} from './error.ts';
import {isObject, objMap, objNew} from './obj.ts';
import {isArray, isInstanceOf, isUndefined} from './other.ts';
import {UNDEFINED} from './strings.ts';

export const jsonString = JSON.stringify;
export const jsonParse = JSON.parse;

export const jsonStringWithMap = (obj: unknown): string =>
  jsonString(obj, (_key, value) =>
    isInstanceOf(value, Map) ? objNew([...value]) : value,
  );

export const jsonStringWithUndefined = (obj: unknown): string =>
  jsonString(obj, (_key, value) =>
    isUndefined(value)
      ? UNDEFINED
      : value === UNDEFINED
        ? errorThrow(ERROR_RESERVED_STRING, 'U+FFFC')
        : value,
  );

export const jsonParseWithUndefined = (str: string): any =>
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
