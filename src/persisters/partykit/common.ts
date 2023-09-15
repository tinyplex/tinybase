import {T, V} from '../../common/strings';
import {isString, slice} from '../../common/other';
import {jsonParse, jsonString} from '../../common/json';

export type MessageType = typeof SET_CHANGES;
export type StorageKeyType = typeof T | typeof V;

export const SET_CHANGES = 's';

export const STORE_PATH = '/store';
export const PUT = 'PUT';

export const constructMessage = (
  type: MessageType | StorageKeyType,
  payload: any,
): string => type + (isString(payload) ? payload : jsonString(payload));

export const deconstructMessage = (
  message: string,
  stringified?: 1,
): [type: MessageType | StorageKeyType, payload: string | any] => [
  message[0] as MessageType | StorageKeyType,
  stringified ? jsonParse(slice(message, 1)) : slice(message, 1),
];
