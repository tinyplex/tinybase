import {UNDEFINED} from './strings.ts';
import {isInstanceOf} from './other.ts';
import {object} from './obj.ts';

export const jsonString = JSON.stringify;
export const jsonParse = JSON.parse;

export const jsonStringWithMap = (obj: unknown): string =>
  jsonString(obj, (_key, value) =>
    isInstanceOf(value, Map) ? object.fromEntries([...value]) : value,
  );

export const jsonStringWithUndefined = (obj: unknown): string =>
  jsonString(obj, (_key, value) => (value === undefined ? UNDEFINED : value));

export const jsonParseWithUndefined = (str: string): any =>
  jsonParse(str, (_key, value) => (value === UNDEFINED ? undefined : value));
