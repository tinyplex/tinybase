import type {Id, IdOrNull} from '../@types/common/index.d.ts';
import type {Message, Receive} from '../@types/synchronizers/index.d.ts';
import {arrayEvery, arrayJoin, arrayMap, arrayPush} from '../common/array.ts';
import {isCellOrValueOrUndefined} from '../common/cell.ts';
import {getUniqueId} from '../common/codec.ts';
import {collClear, collDel, collHas, collSize} from '../common/coll.ts';
import {
  ERROR_SYNC_MESSAGE,
  ERROR_SYNC_OVERFLOW,
  errorNew,
  tryFinally,
  tryFinallyAsync,
  tryReturn,
} from '../common/error.ts';
import {isHlc} from '../common/hlc.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../common/json.ts';
import {
  IdMap,
  mapEnsure,
  mapForEach,
  mapGet,
  mapMap,
  mapNew,
  mapSet,
} from '../common/map.ts';
import {isObject, objEvery} from '../common/obj.ts';
import {
  isArray,
  isEmpty,
  isFiniteNumber,
  isInteger,
  isNull,
  isNumber,
  isString,
  isUndefined,
  mathCeil,
  mathFloor,
  mathMax,
  promiseAll,
  size,
  slice,
  startTimeout,
  stopTimeout,
} from '../common/other.ts';
import {
  EMPTY_STRING,
  strMatch,
  strSplit,
  strStartsWith,
  TINYBASE,
} from '../common/strings.ts';

const MESSAGE_SEPARATOR = '\n';
const FRAGMENT = /^([-0-9A-Z_a-z]{16})\n(\d+)\n(\d+)\n([\s\S]*)$/;
const FRAGMENT_PAYLOAD = /^[^\n]*\n[-0-9A-Z_a-z]{16}\n\d+\n\d+\n/;
const INVALID_CHANNEL_ID_CHARACTERS = /[\n\r?#]/;
const MAX_FRAGMENT_BUFFERS = 100;
const MAX_FRAGMENT_COUNT = 1_000;

export const MAX_PENDING_REQUESTS = 100;
export const MAX_WEBSOCKET_BUFFER_SIZE = 16_777_216;
export const MAX_WEBSOCKET_QUEUE_SIZE = 1_000;

export const getWebSocketPayloadSize = (value: string): number => {
  let byteSize = 0;
  for (let index = 0; index < size(value); index++) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit < 0x80) {
      byteSize++;
    } else if (codeUnit < 0x800) {
      byteSize += 2;
    } else if (
      codeUnit >= 0xd800 &&
      codeUnit <= 0xdbff &&
      value.charCodeAt(index + 1) >= 0xdc00 &&
      value.charCodeAt(index + 1) <= 0xdfff
    ) {
      byteSize += 4;
      index++;
    } else {
      byteSize += 3;
    }
  }
  return byteSize;
};

export const isWebSocketPayloadTooLarge = (payload: string): boolean =>
  getWebSocketPayloadSize(payload) > MAX_WEBSOCKET_BUFFER_SIZE;

export const WS_SYNCHRONIZER_PROTOCOL = TINYBASE;
export const SERVER_CLIENT_ID = 'S';

const MULTIPLE_CLIENT_ID = 'M';
const MULTIPLE_MESSAGE = -1;

export const enum MultipleControl {
  Hello,
  Subscribe,
  Unsubscribe,
}

export const MULTIPLE_VERSION = 1;

export const createInvalidPayloadHandler = (
  webSocket: {close: (code?: number, reason?: string) => void},
  onIgnoredError?: (error: any) => void,
) => {
  let valid = true;
  return (error: Error) => {
    if (valid) {
      valid = false;
      tryFinally(
        () => onIgnoredError?.(error),
        () =>
          webSocket.close(
            strStartsWith(error.message, TINYBASE + ':' + ERROR_SYNC_OVERFLOW)
              ? 1013
              : 1007,
            error.message,
          ),
      );
    }
  };
};

type Pending = [
  fragments: string[],
  remainders: string[],
  remaining: number,
  total: number,
  timeout: ReturnType<typeof startTimeout>,
  size: number,
];

type DecodedPayload = [
  clientId: Id,
  remainders: string[],
  requestId: IdOrNull,
  message: number,
  body: any,
];

const isHash = (hash: any): boolean =>
  isNumber(hash) &&
  isFiniteNumber(hash) &&
  isInteger(hash) &&
  hash >= 0 &&
  hash <= 0xffffffff;

const isHashTree = (tree: any, depth: number): boolean =>
  isObject(tree) &&
  objEvery(tree, (child) =>
    depth ? isHashTree(child, depth - 1) : isHash(child),
  );

const isStamp = (stamp: any, depth: number): boolean =>
  isArray(stamp) &&
  (size(stamp) == 1 ||
    (size(stamp) == 2 && isString(stamp[1]) && isHlc(stamp[1], Infinity))) &&
  (depth
    ? isObject(stamp[0]) &&
      objEvery(stamp[0], (child) => isStamp(child, depth - 1))
    : isCellOrValueOrUndefined(stamp[0]));

const isContentHashes = (body: any): boolean =>
  isArray(body) && size(body) == 2 && isHash(body[0]) && isHash(body[1]);

const isMergeableContentOrChanges = (body: any): boolean =>
  isArray(body) &&
  (size(body) == 2 || (size(body) == 3 && body[2] === 1)) &&
  isStamp(body[0], 3) &&
  isStamp(body[1], 1);

const isResponse = (body: any): boolean =>
  isContentHashes(body) ||
  isStamp(body, 3) ||
  isStamp(body, 1) ||
  (isArray(body) &&
    size(body) == 2 &&
    isStamp(body[0], 3) &&
    (isHashTree(body[1], 0) || isHashTree(body[1], 1)));

const isBodyValid = (message: number, body: any): boolean =>
  message == 0
    ? isResponse(body)
    : message == 1
      ? body === EMPTY_STRING
      : message == 2
        ? isContentHashes(body)
        : message == 3
          ? isMergeableContentOrChanges(body)
          : message == 4
            ? isHashTree(body, 0)
            : message == 5
              ? isHashTree(body, 1)
              : message == 6
                ? isHashTree(body, 2)
                : message == 7
                  ? isHashTree(body, 0)
                  : false;

export const isProtocolMessageValid = (
  requestId: any,
  message: any,
  body: any,
): boolean =>
  (isNull(requestId) || isString(requestId)) &&
  isNumber(message) &&
  isFiniteNumber(message) &&
  isInteger(message) &&
  isBodyValid(message, body);

const decodeProtocolMessage = (
  remainder: string,
  multipleControl = false,
): [requestId: IdOrNull, message: number, body: any] | undefined =>
  tryReturn(() => {
    const message = jsonParseWithUndefined(remainder);
    return isArray(message) &&
      size(message) == 3 &&
      (isProtocolMessageValid(message[0], message[1], message[2]) ||
        (multipleControl &&
          (isNull(message[0]) || isString(message[0])) &&
          message[1] == MULTIPLE_MESSAGE))
      ? (message as [IdOrNull, number, any])
      : undefined;
  }) as [IdOrNull, number, any] | undefined;

export const ifPayloadValid = (
  payload: string,
  then: (clientId: string, remainder: string) => void,
): boolean => {
  const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
  if (splitAt !== -1) {
    then(slice(payload, 0, splitAt), slice(payload, splitAt + 1));
    return true;
  }
  return false;
};

export const receivePayload = (payload: string, receive: Receive) =>
  createPayloadReceiver(receive)(payload);

export const createPayloadDecoder = (
  receive: (...payload: DecodedPayload) => void,
  fragmentTimeoutSeconds: number = 1,
  onInvalid?: (error: Error) => void,
) => {
  const buffer: IdMap<Pending> = mapNew();
  let bufferedSize = 0;
  let valid = true;

  const delPending = (bufferKey: Id, pending: Pending) => {
    stopTimeout(pending[4]);
    bufferedSize -= pending[5];
    collDel(buffer, bufferKey);
  };

  const invalid = (error = errorNew(ERROR_SYNC_MESSAGE)) => {
    if (valid) {
      valid = false;
      mapForEach(buffer, (_bufferKey, pending) => stopTimeout(pending[4]));
      collClear(buffer);
      bufferedSize = 0;
      onInvalid?.(error);
    }
  };

  const receiveRemainder = (
    clientId: Id,
    remainders: string[],
    remainder: string,
  ) => {
    const message = decodeProtocolMessage(remainder);
    if (message) {
      receive(clientId, remainders, ...message);
    } else {
      invalid();
    }
  };

  return (payload: string) => {
    if (!valid) {
      return;
    }
    if (isWebSocketPayloadTooLarge(payload)) {
      invalid(
        errorNew(
          ERROR_SYNC_OVERFLOW,
          strMatch(payload, FRAGMENT_PAYLOAD) ? 'fragments' : 'socket',
        ),
      );
      return;
    }
    if (
      !ifPayloadValid(payload, (clientId, remainder) => {
        const message = decodeProtocolMessage(remainder);
        if (message) {
          receive(clientId, [remainder], ...message);
          return;
        }
        const [, messageId, indexStr, totalStr, fragment] =
          strMatch(remainder, FRAGMENT) ?? [];
        if (messageId) {
          const index = parseInt(indexStr);
          const total = parseInt(totalStr);
          if (total > MAX_FRAGMENT_COUNT) {
            invalid(errorNew(ERROR_SYNC_OVERFLOW, 'fragments'));
            return;
          }
          if (total > 0 && index >= 0 && index < total) {
            const bufferKey = clientId + MESSAGE_SEPARATOR + messageId;
            let pending = mapGet(buffer, bufferKey);
            if (!pending) {
              if (collSize(buffer) >= MAX_FRAGMENT_BUFFERS) {
                invalid(errorNew(ERROR_SYNC_OVERFLOW, 'fragments'));
                return;
              }
              pending = [
                [],
                [],
                total,
                total,
                startTimeout(() => {
                  const timedOut = mapGet(buffer, bufferKey);
                  if (timedOut) {
                    delPending(bufferKey, timedOut);
                  }
                }, fragmentTimeoutSeconds),
                0,
              ];
              mapSet(buffer, bufferKey, pending);
            }
            const [fragments, remainders] = pending;
            if (total == pending[3] && isUndefined(fragments[index])) {
              const fragmentLength = getWebSocketPayloadSize(fragment);
              if (bufferedSize + fragmentLength > MAX_WEBSOCKET_BUFFER_SIZE) {
                invalid(errorNew(ERROR_SYNC_OVERFLOW, 'fragments'));
                return;
              }
              fragments[index] = fragment;
              remainders[index] = remainder;
              pending[2]--;
              pending[5] += fragmentLength;
              bufferedSize += fragmentLength;
            } else {
              invalid();
              return;
            }
            if (pending[2] == 0) {
              delPending(bufferKey, pending);
              receiveRemainder(clientId, remainders, arrayJoin(fragments));
            }
            return;
          }
        }
        invalid();
      })
    ) {
      invalid();
    }
  };
};

export const getPayloadCoalesceKey = (
  clientId: Id,
  payload: string,
): string | undefined => {
  let key: string | undefined;
  ifPayloadValid(payload, (toClientId, remainder) => {
    if (decodeProtocolMessage(remainder)?.[1] == 2) {
      key = clientId + MESSAGE_SEPARATOR + toClientId;
    }
  });
  return key;
};

export const isWebSocketBackpressured = (
  webSocket: {bufferedAmount?: number},
  payload: string,
): boolean =>
  (webSocket.bufferedAmount ?? 0) + getWebSocketPayloadSize(payload) >
  MAX_WEBSOCKET_BUFFER_SIZE;

export const createPayloadReceiver = (
  receive: Receive,
  fragmentTimeoutSeconds: number = 1,
  onInvalid?: (error: Error) => void,
) =>
  createPayloadDecoder(
    (fromClientId, _remainders, requestId, message, body) =>
      receive(fromClientId, requestId, message as Message, body),
    fragmentTimeoutSeconds,
    onInvalid,
  );

export const createPayload = (
  toClientId: IdOrNull,
  ...args: [requestId: IdOrNull, message: Message, body: any]
): string =>
  createRawPayload(toClientId ?? EMPTY_STRING, jsonStringWithUndefined(args));

export const createRawPayload = (clientId: Id, remainder: string): string =>
  clientId + MESSAGE_SEPARATOR + remainder;

const getFragments = (remainder: string, maxFragmentSize: number): string[] => {
  const fragments: string[] = [];
  let fragment = EMPTY_STRING;
  let fragmentSize = 0;
  for (let index = 0; index < size(remainder); index++) {
    const codeUnit = remainder.charCodeAt(index);
    let codePoint = slice(remainder, index, index + 1);
    if (
      codeUnit >= 0xd800 &&
      codeUnit <= 0xdbff &&
      remainder.charCodeAt(index + 1) >= 0xdc00 &&
      remainder.charCodeAt(index + 1) <= 0xdfff
    ) {
      codePoint += slice(remainder, ++index, index + 1);
    }
    const codePointSize = getWebSocketPayloadSize(codePoint);
    if (fragmentSize > 0 && fragmentSize + codePointSize > maxFragmentSize) {
      arrayPush(fragments, fragment);
      fragment = EMPTY_STRING;
      fragmentSize = 0;
    }
    fragment += codePoint;
    fragmentSize += codePointSize;
  }
  arrayPush(fragments, fragment);
  return fragments;
};

export const createMultiplePayload = (channelId: Id, payload: string): string =>
  createRawPayload(MULTIPLE_CLIENT_ID, createRawPayload(channelId, payload));

export const ifMultiplePayloadValid = (
  payload: string,
  then: (channelId: Id, payload: string) => void,
): boolean => {
  let valid = false;
  ifPayloadValid(payload, (multipleClientId, remainder) => {
    if (multipleClientId == MULTIPLE_CLIENT_ID) {
      ifPayloadValid(remainder, (channelId, channelPayload) => {
        if (isMultipleChannelIdValid(channelId)) {
          valid = true;
          then(channelId, channelPayload);
        }
      });
    }
  });
  return valid;
};

export const createMultipleControlPayload = (
  requestId: IdOrNull,
  control: MultipleControl,
  body: any,
): string =>
  createRawPayload(
    SERVER_CLIENT_ID,
    jsonStringWithUndefined([requestId, MULTIPLE_MESSAGE, [control, body]]),
  );

export const ifMultipleControlPayloadValid = (
  payload: string,
  then: (requestId: IdOrNull, control: MultipleControl, body: any) => void,
) => {
  let valid = false;
  ifPayloadValid(payload, (serverClientId, remainder) => {
    if (serverClientId == SERVER_CLIENT_ID) {
      const [requestId, message, controlAndBody] =
        decodeProtocolMessage(remainder, true) ?? [];
      const control = controlAndBody?.[0];
      const body = controlAndBody?.[1];
      if (
        message == MULTIPLE_MESSAGE &&
        isArray(controlAndBody) &&
        size(controlAndBody) == 2 &&
        (control == MultipleControl.Hello
          ? isString(requestId) && body == MULTIPLE_VERSION
          : control == MultipleControl.Subscribe
            ? isString(requestId) &&
              isString(body) &&
              isMultipleChannelIdValid(body)
            : control == MultipleControl.Unsubscribe &&
              isNull(requestId) &&
              isString(body) &&
              isMultipleChannelIdValid(body))
      ) {
        valid = true;
        then(requestId as IdOrNull, control as MultipleControl, body);
      }
    }
  });
  return valid;
};

export const isMultipleChannelIdValid = (channelId: Id): boolean =>
  !isEmpty(channelId) &&
  !INVALID_CHANNEL_ID_CHARACTERS.test(channelId) &&
  arrayEvery(
    strSplit(channelId, '/'),
    (part) => !isEmpty(part) && part != '.' && part != '..',
  );

export const createMultipleServerClient = <Channel>(
  basePathId: Id,
  addChannel: (
    pathId: Id,
    channelId: Id,
  ) => [channel: Channel, ready?: Promise<void>],
  delChannel: (channel: Channel) => void | Promise<void>,
  receive: (channel: Channel, toClientId: Id, remainders: string[]) => void,
  send: (payload: string) => void,
  fragmentTimeoutSeconds: number,
  invalid: (error: Error) => void,
  onIgnoredError?: (error: any) => void,
) => {
  const channels: IdMap<Channel> = mapNew();
  const decoders: IdMap<(payload: string) => void> = mapNew();
  let negotiated = false;

  const sendControl = (
    requestId: IdOrNull,
    control: MultipleControl,
    body: any,
  ) => send(createMultipleControlPayload(requestId, control, body));

  const delChannelAndDecoder = (channelId: Id) => {
    collDel(channels, channelId);
    collDel(decoders, channelId);
  };

  const handleControl = (
    requestId: IdOrNull,
    control: MultipleControl,
    body: any,
  ): void | Promise<void> => {
    if (control == MultipleControl.Hello) {
      negotiated = true;
      sendControl(requestId, control, body);
    } else if (negotiated && control == MultipleControl.Subscribe) {
      if (!collHas(channels, body)) {
        const pathId = basePathId + (basePathId ? '/' : EMPTY_STRING) + body;
        const [channel, ready] = addChannel(pathId, body);
        mapSet(channels, body, channel);
        sendControl(requestId, control, body);
        if (ready) {
          return ready.catch((error) => {
            delChannelAndDecoder(body);
            throw error;
          });
        }
        return;
      }
      sendControl(requestId, control, body);
    } else if (negotiated && control == MultipleControl.Unsubscribe) {
      const channel = mapGet(channels, body);
      delChannelAndDecoder(body);
      if (!isUndefined(channel)) {
        return (async () => delChannel(channel))();
      }
    }
  };

  const handlePayload = (payload: string) => {
    if (isWebSocketPayloadTooLarge(payload)) {
      invalid(errorNew(ERROR_SYNC_OVERFLOW, 'socket'));
      return;
    }
    const control = ifMultipleControlPayloadValid(
      payload,
      (requestId, control, body) => {
        const result = handleControl(requestId, control, body);
        result?.catch((error) => tryReturn(() => onIgnoredError?.(error)));
      },
    );
    const channel = ifMultiplePayloadValid(
      payload,
      (channelId, channelPayload) => {
        const channel = negotiated ? mapGet(channels, channelId) : undefined;
        if (isUndefined(channel)) {
          invalid(errorNew(ERROR_SYNC_MESSAGE));
        } else {
          mapEnsure(decoders, channelId, () =>
            createPayloadDecoder(
              (toClientId, remainders) =>
                receive(channel, toClientId, remainders),
              fragmentTimeoutSeconds,
              invalid,
            ),
          )(channelPayload);
        }
      },
    );
    if (!control && !channel) {
      invalid(errorNew(ERROR_SYNC_MESSAGE));
    }
  };

  const destroy = () =>
    tryFinallyAsync(
      () =>
        promiseAll(mapMap(channels, async (channel) => delChannel(channel))),
      () => {
        collClear(channels);
        collClear(decoders);
      },
    );

  return [handlePayload, destroy] as const;
};

export const createPayloads = (
  toClientId: IdOrNull,
  requestId: IdOrNull,
  message: Message,
  body: any,
  fragmentSize?: number,
): string[] => {
  const clientId = toClientId ?? EMPTY_STRING;
  const remainder = jsonStringWithUndefined([requestId, message, body]);
  const maxFragmentSize = mathFloor(fragmentSize ?? 0);
  if (isUndefined(fragmentSize) || maxFragmentSize < 1) {
    return [createRawPayload(clientId, remainder)];
  }
  const fragments = getFragments(
    remainder,
    mathMax(
      maxFragmentSize,
      mathCeil(getWebSocketPayloadSize(remainder) / MAX_FRAGMENT_COUNT) + 3,
    ),
  );
  const total = size(fragments);
  if (total == 1) {
    return [createRawPayload(clientId, remainder)];
  }
  const messageId = getUniqueId();
  return arrayMap(fragments, (fragment, index) =>
    createRawPayload(
      clientId,
      arrayJoin([messageId, index, total, fragment], MESSAGE_SEPARATOR),
    ),
  );
};
