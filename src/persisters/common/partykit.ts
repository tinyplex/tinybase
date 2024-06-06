import {T, V, strStartsWith} from '../../common/strings';
import {isString, size, slice} from '../../common/other';
import {jsonParse, jsonStringWithMap} from '../../common/json';

type MessageType = typeof SET_CHANGES;
export type StorageKeyType = typeof T | typeof V;

export const SET_CHANGES = 's';

export const STORE_PATH = '/store';
export const PUT = 'PUT';

export const construct = (
  prefix: string,
  type: MessageType | StorageKeyType,
  payload: any,
): string =>
  prefix + type + (isString(payload) ? payload : jsonStringWithMap(payload));

export const deconstruct = (
  prefix: string,
  message: string,
  stringified?: 1,
): [type: MessageType | StorageKeyType, payload: string | any] | undefined => {
  const prefixSize = size(prefix);
  return strStartsWith(message, prefix)
    ? [
        message[prefixSize] as MessageType | StorageKeyType,
        (stringified ? jsonParse : String)(slice(message, prefixSize + 1)),
      ]
    : undefined;
};
