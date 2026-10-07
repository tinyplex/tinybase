import type {Id, IdOrNull} from '../@types/common/index.d.ts';
import type {
  CellHashes,
  MergeableChanges,
  MergeableContent,
  MergeableStore,
  TablesStamp,
  ValuesStamp,
} from '../@types/mergeable-store/index.d.ts';
import type {
  CellOrUndefined,
  ValueOrUndefined,
} from '../@types/store/index.d.ts';
import type {Message, Receive} from '../@types/synchronizers/index.d.ts';
import type {ClientAccess} from '../@types/synchronizers/synchronizer-ws-server/index.d.ts';
import {
  arrayEvery,
  arrayForEach,
  arrayJoin,
  arrayMap,
  arrayPush,
} from '../common/array.ts';
import {decodeIfJson, isCellOrValueOrUndefined} from '../common/cell.ts';
import {getUniqueId} from '../common/codec.ts';
import {
  collClear,
  collDel,
  collHas,
  collSize,
  collValues,
} from '../common/coll.ts';
import {
  ERROR_SYNC_MESSAGE,
  ERROR_SYNC_OVERFLOW,
  errorNew,
  tryFinally,
  tryFinallyAsync,
  tryReturn,
} from '../common/error.ts';
import {getHlcFunctions, isHlc} from '../common/hlc.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../common/json.ts';
import {
  IdMap,
  mapEnsure,
  mapForEach,
  mapGet,
  mapNew,
  mapSet,
} from '../common/map.ts';
import {
  isObject,
  objEnsure,
  objEvery,
  objForEach,
  objIsEmpty,
  objNew,
  objSet,
} from '../common/obj.ts';
import {
  ifNotUndefined,
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
import {setAdd, setNew} from '../common/set.ts';
import {stampNew, stampNewObj} from '../common/stamps.ts';
import {
  EMPTY_STRING,
  strMatch,
  strSplit,
  strStartsWith,
  TINYBASE,
} from '../common/strings.ts';
import type {ProtectedMergeableStore} from '../mergeable-store/index.ts';

const MESSAGE_SEPARATOR = '\n';
const FRAGMENT = /^([-0-9A-Z_a-z]{16})\n(\d+)\n(\d+)\n([\s\S]*)$/;
const FRAGMENT_PAYLOAD = /^[^\n]*\n[-0-9A-Z_a-z]{16}\n\d+\n\d+\n/;
const INVALID_CHANNEL_ID_CHARACTERS = /[\n\r?#]/;
const MAX_FRAGMENT_BUFFERS = 100;
const MAX_FRAGMENT_COUNT = 1_000;
export const MAX_MULTIPLE_CHANNELS = 100;
const MAX_MULTIPLE_CHANNEL_RESOURCES = MAX_MULTIPLE_CHANNELS * 2;
const MAX_MULTIPLE_CHANNEL_ID_SIZE = 1_024;

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

export const isWebSocketPayloadTooLarge = (payloadSize: number): boolean =>
  payloadSize > MAX_WEBSOCKET_BUFFER_SIZE;

export const WS_SYNCHRONIZER_PROTOCOL = TINYBASE;
export const SERVER_CLIENT_ID = 'S';

// Synchronizers since v10.1 start their transaction Ids with a character that
// earlier ones never use, which tells a peer that they understand the newer
// messages. Earlier peers accept any string as an Id, and disconnect on any
// message they do not know, so a newer message is only ever sent to a peer
// that has marked itself this way. A newer server greets each client with a
// marked, empty ContentDiff - which needs no answer - so that clients can tell
// that it too is newer.
const MARK = '~';

export const getTransactionId = (): Id => MARK + getUniqueId(11);

export const isMarked = (id: any): boolean => isString(id) && id[0] == MARK;

export const createHelloPayload = (): string =>
  createPayload(SERVER_CLIENT_ID, getTransactionId(), 3, [
    stampNewObj(),
    stampNewObj(),
    1,
  ]);

const MULTIPLE_CLIENT_ID = 'M';
const MULTIPLE_MESSAGE = -1;

// A client's Id comes from a header that the client itself chooses. So one
// that could be mistaken for the server or for the multiplexing prefix, or
// that would break the framing of a payload, is never accepted.
export const isClientIdValid = (clientId: unknown): clientId is Id =>
  isString(clientId) &&
  !isEmpty(clientId) &&
  clientId != SERVER_CLIENT_ID &&
  clientId != MULTIPLE_CLIENT_ID &&
  isNull(strMatch(clientId, /\n/));

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

export type PayloadBuffer = [count: number, size: number];
export type PayloadDecoder = readonly [
  decode: (payload: string) => void,
  clear: () => void,
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
  isHashTree(body, 1) ||
  isStamp(body, 3) ||
  isStamp(body, 1) ||
  (isArray(body) &&
    size(body) == 2 &&
    isStamp(body[0], 3) &&
    (isHashTree(body[1], 0) || isHashTree(body[1], 1)));

export const BUCKET_COUNT = 256;

const isBucketHashes = (body: any): boolean =>
  isObject(body) &&
  objEvery(
    body,
    (hashes) =>
      isArray(hashes) &&
      size(hashes) == BUCKET_COUNT &&
      arrayEvery(hashes, isHash),
  );

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
                  : message == 8
                    ? isBucketHashes(body)
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
  createPayloadReceiver(receive)[0](payload);

export const createPayloadDecoder = (
  receive: (...payload: DecodedPayload) => void,
  fragmentTimeoutSeconds: number = 1,
  onInvalid?: (error: Error) => void,
  sharedBuffer?: PayloadBuffer,
) => {
  const buffer: IdMap<Pending> = mapNew();
  const payloadBuffer: PayloadBuffer = sharedBuffer ?? [0, 0];
  let bufferedSize = 0;
  let valid = true;

  const delPending = (bufferKey: Id, pending: Pending) => {
    stopTimeout(pending[4]);
    bufferedSize -= pending[5];
    payloadBuffer[0]--;
    payloadBuffer[1] -= pending[5];
    collDel(buffer, bufferKey);
  };

  const clear = () => {
    mapForEach(buffer, (_bufferKey, pending) => stopTimeout(pending[4]));
    payloadBuffer[0] -= collSize(buffer);
    payloadBuffer[1] -= bufferedSize;
    collClear(buffer);
    bufferedSize = 0;
  };

  const invalid = (error = errorNew(ERROR_SYNC_MESSAGE)) => {
    if (valid) {
      valid = false;
      clear();
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

  const decode = (payload: string) => {
    if (!valid) {
      return;
    }
    if (isWebSocketPayloadTooLarge(getWebSocketPayloadSize(payload))) {
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
              if (payloadBuffer[0] >= MAX_FRAGMENT_BUFFERS) {
                invalid(errorNew(ERROR_SYNC_OVERFLOW, 'fragments'));
                return;
              }
            }
            if (
              (isUndefined(pending) || total == pending[3]) &&
              isUndefined(pending?.[0][index])
            ) {
              const retainedSize =
                getWebSocketPayloadSize(remainder) +
                (pending ? 0 : getWebSocketPayloadSize(bufferKey));
              if (payloadBuffer[1] + retainedSize > MAX_WEBSOCKET_BUFFER_SIZE) {
                invalid(errorNew(ERROR_SYNC_OVERFLOW, 'fragments'));
                return;
              }
              if (!pending) {
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
                payloadBuffer[0]++;
              }
              const [fragments, remainders] = pending;
              fragments[index] = fragment;
              remainders[index] = remainder;
              pending[2]--;
              pending[5] += retainedSize;
              bufferedSize += retainedSize;
              payloadBuffer[1] += retainedSize;
            } else {
              invalid();
              return;
            }
            if (pending[2] == 0) {
              const [fragments, remainders] = pending;
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
  return [decode, clear] as const;
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
  payloadSize: number,
): boolean =>
  (webSocket.bufferedAmount ?? 0) + payloadSize > MAX_WEBSOCKET_BUFFER_SIZE;

export const createPayloadReceiver = (
  receive: Receive,
  fragmentTimeoutSeconds: number = 1,
  onInvalid?: (error: Error) => void,
  sharedBuffer?: PayloadBuffer,
) =>
  createPayloadDecoder(
    (fromClientId, _remainders, requestId, message, body) =>
      receive(fromClientId, requestId, message as Message, body),
    fragmentTimeoutSeconds,
    onInvalid,
    sharedBuffer,
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
  onOversized?: () => void,
): boolean => {
  let valid = false;
  ifPayloadValid(payload, (multipleClientId, remainder) => {
    if (multipleClientId == MULTIPLE_CLIENT_ID) {
      ifPayloadValid(remainder, (channelId, channelPayload) => {
        if (isMultipleChannelIdTooLarge(channelId)) {
          valid = true;
          onOversized?.();
        } else if (isMultipleChannelIdStructureValid(channelId)) {
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

const isMultipleChannelIdTooLarge = (channelId: Id): boolean =>
  getWebSocketPayloadSize(channelId) > MAX_MULTIPLE_CHANNEL_ID_SIZE;

const isMultipleChannelIdStructureValid = (channelId: Id): boolean =>
  !isEmpty(channelId) &&
  !INVALID_CHANNEL_ID_CHARACTERS.test(channelId) &&
  arrayEvery(
    strSplit(channelId, '/'),
    (part) => !isEmpty(part) && part != '.' && part != '..',
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
              (isMultipleChannelIdTooLarge(body) ||
                isMultipleChannelIdStructureValid(body))
            : control == MultipleControl.Unsubscribe &&
              isNull(requestId) &&
              isString(body) &&
              (isMultipleChannelIdTooLarge(body) ||
                isMultipleChannelIdStructureValid(body)))
      ) {
        valid = true;
        then(requestId as IdOrNull, control as MultipleControl, body);
      }
    }
  });
  return valid;
};

export const isMultipleChannelIdValid = (channelId: Id): boolean =>
  !isMultipleChannelIdTooLarge(channelId) &&
  isMultipleChannelIdStructureValid(channelId);

const enum MultipleServerChannelValue {
  Channel,
  Teardown,
  Released,
}

type MultipleServerChannel<Channel> = [
  channel: Channel,
  teardown?: Promise<void>,
  released?: 1,
];

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
  type ServerChannel = MultipleServerChannel<Channel>;
  const channels: IdMap<ServerChannel> = mapNew();
  const decoders: IdMap<PayloadDecoder> = mapNew();
  const payloadBuffer: PayloadBuffer = [0, 0];
  const resources = setNew<ServerChannel>();
  let resourceCount = 0;
  let negotiated = false;
  let valid = true;

  const sendControl = (
    requestId: IdOrNull,
    control: MultipleControl,
    body: any,
  ) => send(createMultipleControlPayload(requestId, control, body));

  const delChannelAndDecoder = (channelId: Id) => {
    collDel(channels, channelId);
    mapGet(decoders, channelId)?.[1]();
    collDel(decoders, channelId);
  };

  const clearDecoders = () => {
    mapForEach(decoders, (_channelId, decoder) => decoder[1]());
    collClear(decoders);
  };

  const invalidate = (error: Error) => {
    if (valid) {
      valid = false;
      clearDecoders();
      invalid(error);
    }
  };

  const releaseChannel = (channel: ServerChannel) => {
    if (!channel[MultipleServerChannelValue.Released]) {
      channel[MultipleServerChannelValue.Released] = 1;
      resourceCount--;
      collDel(resources, channel);
    }
  };

  const teardownChannel = (channel: ServerChannel): Promise<void> =>
    (channel[MultipleServerChannelValue.Teardown] ??= (async () => {
      try {
        const teardown = delChannel(
          channel[MultipleServerChannelValue.Channel],
        );
        if (isUndefined(teardown)) {
          releaseChannel(channel);
        } else {
          await teardown;
        }
      } finally {
        releaseChannel(channel);
      }
    })());

  const handleControl = (
    requestId: IdOrNull,
    control: MultipleControl,
    body: any,
  ): void | Promise<void> => {
    if (control == MultipleControl.Hello) {
      negotiated = true;
      sendControl(requestId, control, body);
    } else if (negotiated && control == MultipleControl.Subscribe) {
      const subscribed = collHas(channels, body);
      if (
        isMultipleChannelIdTooLarge(body) ||
        (!subscribed &&
          (collSize(channels) >= MAX_MULTIPLE_CHANNELS ||
            resourceCount >= MAX_MULTIPLE_CHANNEL_RESOURCES))
      ) {
        invalidate(errorNew(ERROR_SYNC_OVERFLOW, 'channels'));
        return;
      }
      if (!subscribed) {
        const pathId = basePathId + (basePathId ? '/' : EMPTY_STRING) + body;
        resourceCount++;
        let channelAndReady: [channel: Channel, ready?: Promise<void>];
        try {
          channelAndReady = addChannel(pathId, body);
        } catch (error) {
          resourceCount--;
          throw error;
        }
        const [addedChannel, ready] = channelAndReady;
        const channel: ServerChannel = [addedChannel];
        setAdd(resources, channel);
        mapSet(channels, body, channel);
        sendControl(requestId, control, body);
        if (ready) {
          return ready.catch((error) => {
            if (mapGet(channels, body) === channel) {
              delChannelAndDecoder(body);
            }
            if (!channel[MultipleServerChannelValue.Teardown]) {
              releaseChannel(channel);
            }
            throw error;
          });
        }
        return;
      }
      sendControl(requestId, control, body);
    } else if (negotiated && control == MultipleControl.Unsubscribe) {
      if (isMultipleChannelIdTooLarge(body)) {
        invalidate(errorNew(ERROR_SYNC_OVERFLOW, 'channels'));
        return;
      }
      const channel = mapGet(channels, body);
      delChannelAndDecoder(body);
      return isUndefined(channel) ? undefined : teardownChannel(channel);
    }
  };

  const handlePayload = (payload: string) => {
    if (!valid) {
      return;
    }
    if (isWebSocketPayloadTooLarge(getWebSocketPayloadSize(payload))) {
      invalidate(errorNew(ERROR_SYNC_OVERFLOW, 'socket'));
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
          invalidate(errorNew(ERROR_SYNC_MESSAGE));
        } else {
          mapEnsure(decoders, channelId, () =>
            createPayloadDecoder(
              (toClientId, remainders) =>
                receive(
                  channel[MultipleServerChannelValue.Channel],
                  toClientId,
                  remainders,
                ),
              fragmentTimeoutSeconds,
              invalidate,
              payloadBuffer,
            ),
          )[0](channelPayload);
        }
      },
      () => invalidate(errorNew(ERROR_SYNC_OVERFLOW, 'channels')),
    );
    if (!control && !channel) {
      invalidate(errorNew(ERROR_SYNC_MESSAGE));
    }
  };

  const destroy = () => {
    valid = false;
    clearDecoders();
    return tryFinallyAsync(
      async () => {
        let errorToThrow: any;
        let failed = false;
        await promiseAll(
          arrayMap(collValues(resources), async (channel) => {
            try {
              await teardownChannel(channel);
            } catch (error) {
              if (!failed) {
                errorToThrow = error;
                failed = true;
              }
            }
          }),
        );
        if (failed) {
          throw errorToThrow;
        }
      },
      () => {
        collClear(channels);
        clearDecoders();
      },
    );
  };

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

type CanWriteCellForPath = (
  tableId: Id,
  rowId: Id,
  cellId: Id,
  cell: CellOrUndefined,
  context: ClientAccess['context'],
) => boolean;

type CanWriteValueForPath = (
  valueId: Id,
  value: ValueOrUndefined,
  context: ClientAccess['context'],
) => boolean;

// Used by the servers when they authorize clients: everything a client sends
// towards the server's MergeableStore passes through here first. The parts the
// client may write are relayed to the other clients and returned to be merged,
// without their hashes, so that the Store recomputes its own. Where a client
// wrote something newer than the Store holds but was not allowed to, the Store
// re-stamps its own value and sends it to every client, so that the client
// converges back to it rather than silently drifting. An unknown client - one
// that has already left - writes nothing.
export const createServerChangesReceiver = (
  store: MergeableStore,
  getAccess: (clientId: Id) => ClientAccess | undefined,
  canWriteCell: CanWriteCellForPath | undefined,
  canWriteValue: CanWriteValueForPath | undefined,
  relay: (fromClientId: Id, changes: MergeableChanges) => void,
): ((
  fromClientId: Id,
  changes: MergeableChanges | MergeableContent,
) => MergeableChanges) => {
  // A correction is stamped just after the change it undoes, rather than at
  // the server's own time, so that it never runs ahead of the clients' clocks.
  let now = 0;
  const [getNextHlc, seenHlc, , decodeHlc] = getHlcFunctions(
    getUniqueId(),
    () => now,
  );

  const correct = (
    rejectedCells: [tableId: Id, rowId: Id, cellId: Id, hlc: string][],
    rejectedValues: [valueId: Id, hlc: string][],
  ) => {
    const rows: CellHashes = objNew();
    arrayForEach(rejectedCells, ([tableId, rowId]) =>
      objEnsure(objEnsure(rows, tableId, objNew), rowId, objNew),
    );
    const [serverTables] = store.getMergeableCellDiff(rows);
    const [serverValues] = store.getMergeableValueDiff({});
    const tables: TablesStamp[0] = objNew();
    const values: ValuesStamp[0] = objNew();
    let corrected = false;
    const getCorrection = (
      serverStamp: [thing?: any, hlc?: string] | undefined,
      hlc: string,
    ): [any, string] | undefined => {
      if (hlc > (serverStamp?.[1] ?? EMPTY_STRING)) {
        now = decodeHlc(hlc)[0];
        seenHlc(hlc);
        corrected = true;
        return [serverStamp?.[0], getNextHlc()];
      }
    };
    arrayForEach(rejectedCells, ([tableId, rowId, cellId, hlc]) =>
      ifNotUndefined(
        getCorrection(serverTables[tableId]?.[0]?.[rowId]?.[0]?.[cellId], hlc),
        (stamp: [any, string]) =>
          objSet(
            objEnsure<TablesStamp[0][Id][0][Id]>(
              objEnsure<TablesStamp[0][Id]>(tables, tableId, stampNewObj)[0],
              rowId,
              stampNewObj,
            )[0],
            cellId,
            stamp,
          ),
      ),
    );
    arrayForEach(rejectedValues, ([valueId, hlc]) =>
      ifNotUndefined(
        getCorrection(serverValues[valueId], hlc),
        (stamp: [any, string]) => objSet(values, valueId, stamp),
      ),
    );
    if (corrected) {
      const correction: MergeableChanges = [
        stampNew(tables, EMPTY_STRING),
        stampNew(values, EMPTY_STRING),
        1,
      ];
      (store as unknown as ProtectedMergeableStore).__[4](correction);
      // Only the stamps changed, which a Store does not report as a change, so
      // this is relayed to every client explicitly.
      relay(SERVER_CLIENT_ID, correction);
    }
  };

  return (fromClientId, changes) => {
    const [[tableStamps], [valueStamps]] = changes as MergeableChanges;
    const access = getAccess(fromClientId);
    const context = access?.context;
    const writable = !isUndefined(access) && !access.readOnly;
    const tables: TablesStamp[0] = objNew();
    const values: ValuesStamp[0] = objNew();
    const rejectedCells: [Id, Id, Id, string][] = [];
    const rejectedValues: [Id, string][] = [];

    objForEach(tableStamps, ([rowStamps, tableHlc], tableId) => {
      const rows: TablesStamp[0][Id][0] = objNew();
      objForEach(rowStamps, ([cellStamps, rowHlc], rowId) => {
        const cells: TablesStamp[0][Id][0][Id][0] = objNew();
        objForEach(cellStamps, ([cell, hlc = EMPTY_STRING], cellId) =>
          writable &&
          (canWriteCell?.(
            tableId,
            rowId,
            cellId,
            decodeIfJson(cell),
            context,
          ) ??
            true)
            ? objSet(cells, cellId, stampNew(cell, hlc))
            : access
              ? arrayPush(rejectedCells, [tableId, rowId, cellId, hlc])
              : 0,
        );
        if (!objIsEmpty(cells)) {
          objSet(rows, rowId, stampNew(cells, rowHlc));
        }
      });
      if (!objIsEmpty(rows)) {
        objSet(tables, tableId, stampNew(rows, tableHlc));
      }
    });
    objForEach(valueStamps, ([value, hlc = EMPTY_STRING], valueId) =>
      writable &&
      (canWriteValue?.(valueId, decodeIfJson(value), context) ?? true)
        ? objSet(values, valueId, stampNew(value, hlc))
        : access
          ? arrayPush(rejectedValues, [valueId, hlc])
          : 0,
    );

    const accepted: MergeableChanges = [
      stampNew(tables, EMPTY_STRING),
      stampNew(values, EMPTY_STRING),
      1,
    ];
    if (!objIsEmpty(tables) || !objIsEmpty(values)) {
      relay(fromClientId, accepted);
    }
    if (size(rejectedCells) || size(rejectedValues)) {
      correct(rejectedCells, rejectedValues);
    }
    return accepted;
  };
};
