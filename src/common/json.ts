import {object} from './obj.ts';
import {isArray, isInstanceOf, isUndefined} from './other.ts';
import {UNDEFINED} from './strings.ts';

export const jsonString = JSON.stringify;
export const jsonParse = JSON.parse;

export const jsonStringWithMap = (obj: unknown): string =>
  jsonString(obj, (_key, value) =>
    isInstanceOf(value, Map) ? object.fromEntries([...value]) : value,
  );

export const jsonStringWithUndefined = (obj: unknown): string =>
  jsonString(obj, (_key, value) => (isUndefined(value) ? UNDEFINED : value));

const replaceUndefinedString = (obj: any): any => {
  if (obj === UNDEFINED) {
    return undefined;
  }
  if (isArray(obj)) {
    return obj.map(replaceUndefinedString);
  }
  if (isInstanceOf(obj, Object)) {
    object
      .entries(obj)
      .forEach(
        ([key, value]) => ((obj as any)[key] = replaceUndefinedString(value)),
      );
  }
  return obj;
};

export const jsonParseWithUndefined = (str: string): any => {
  // Do not use a JSON.parse reviver for this mapping. It removes properties
  // with undefined values, which is not what we want.
  //
  // That would remove tombstone keys such as {rowId: undefined} and break
  // delete propagation.
  //
  // > If the reviver function returns undefined (or returns no value - for
  // > example, if execution falls off the end of the function), the property is
  // > deleted from the object."
  // See
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#the_reviver_parameter
  // Related bug report:
  // https://github.com/tinyplex/tinybase/issues/281
  return replaceUndefinedString(jsonParse(str));
};
