import {isUndefined} from './other.ts';
import {EMPTY_STRING, TINYBASE} from './strings.ts';

export const ERROR_STORE_TYPE = 0;
export const ERROR_CONTENT = 1;
export const ERROR_CHART = 2;
export const ERROR_SYNC_RESPONSE = 3;
export const ERROR_MULTIPLEX_RESPONSE = 4;
export const ERROR_MULTIPLEX_SOCKET = 5;
export const ERROR_MULTIPLEX_CHANNEL = 6;
export const ERROR_MULTIPLEX_CHANNEL_DUPLICATE = 7;
export const ERROR_MULTIPLEX_DESTROYED = 8;
export const ERROR_MULTIPLEX_LEGACY = 9;
export const ERROR_LEGACY_MULTIPLEX = 10;
export const ERROR_INDEXED_DB_STORE = 11;
export const ERROR_INDEXED_DB_OPEN = 12;
export const ERROR_HLC = 13;
export const ERROR_SYNC_MESSAGE = 14;
export const ERROR_SYNC_OVERFLOW = 15;

export const errorNew = (code: number, details?: any): Error =>
  new Error(
    TINYBASE +
      ':' +
      code +
      (isUndefined(details)
        ? EMPTY_STRING
        : /* istanbul ignore next */ ':' + details),
  );

export const errorThrow = (code: number, details?: any): never => {
  throw errorNew(code, details);
};

export const tryReturn = <Return>(
  tryF: () => Return,
  catchReturn?: Return,
): Return | void => {
  try {
    return tryF();
  } catch {
    /*! istanbul ignore next */
    return catchReturn;
  }
};

export const tryCatch = async <Return>(
  action: () => Return | Promise<Return>,
  onError?: (error: any) => void,
): Promise<Return | void> => {
  try {
    return await action();
  } catch (error) {
    /*! istanbul ignore next */
    onError?.(error);
  }
};

export const tryCatchSync = <Return>(
  action: () => Return,
  onError?: (error: any) => void,
): Return | void => {
  try {
    return action();
  } catch (error) {
    onError?.(error);
  }
};

export const tryFinally = <Return>(
  action: () => Return,
  finallyAction: () => void,
): Return => {
  try {
    return action();
  } finally {
    finallyAction();
  }
};

export const tryFinallyAsync = async <Return>(
  action: () => Promise<Return>,
  finallyAction: () => void | Promise<void>,
): Promise<Return> => {
  try {
    return await action();
  } finally {
    await finallyAction();
  }
};
