import {isInstanceOf} from './other';
import {object} from './obj';

export const jsonString = (obj: unknown): string =>
  JSON.stringify(obj, (_key, value) =>
    isInstanceOf(value, Map) ? object.fromEntries([...value]) : value,
  );

export const jsonParse = JSON.parse;
