import {object} from './obj.ts';
import {isInstanceOf, isUndefined} from './other.ts';
import {UNDEFINED} from './strings.ts';

export const jsonString = JSON.stringify;
export const jsonParse = JSON.parse;

export const jsonStringWithMap = (obj: unknown): string =>
  jsonString(obj, (_key, value) =>
    isInstanceOf(value, Map) ? object.fromEntries([...value]) : value,
  );

export const jsonStringWithUndefined = (obj: unknown): string =>
  jsonString(obj, (_key, value) => (isUndefined(value) ? UNDEFINED : value));

export const jsonParseWithUndefined = (str: string): any =>
  jsonParse(str, (_key, value) => (value === UNDEFINED ? undefined : value));
