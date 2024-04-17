import {isInstanceOf} from './other';
import {object} from './obj';

const UNDEFINED_MARKER = '\uFFFC';

export const jsonString = (obj: unknown): string =>
  JSON.stringify(obj, (_key, value) =>
    isInstanceOf(value, Map) ? object.fromEntries([...value]) : value,
  );

export const jsonParse = JSON.parse;

export const jsonStringWithUndefined = (obj: unknown): string =>
  JSON.stringify(obj, (_key, value) =>
    value === undefined ? UNDEFINED_MARKER : value,
  );

export const jsonParseWithUndefined = (str: string): unknown =>
  JSON.parse(str, (_key, value) =>
    value === UNDEFINED_MARKER ? undefined : value,
  );
