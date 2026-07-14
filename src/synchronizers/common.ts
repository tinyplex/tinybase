import type {Id, IdOrNull} from '../@types/common/index.d.ts';
import type {Message, Receive} from '../@types/synchronizers/index.d.ts';
import {arrayEvery, arrayJoin, arrayMap} from '../common/array.ts';
import {getUniqueId} from '../common/codec.ts';
import {collDel} from '../common/coll.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../common/json.ts';
import {IdMap, mapEnsure, mapNew} from '../common/map.ts';
import {
  isArray,
  isUndefined,
  mathFloor,
  size,
  slice,
  startTimeout,
  stopTimeout,
} from '../common/other.ts';
import {EMPTY_STRING, strMatch, strSplit} from '../common/strings.ts';

const MESSAGE_SEPARATOR = '\n';
const FRAGMENT = /^(.+)\n(\d+)\n(\d+)\n([\s\S]*)$/;

export const WS_SYNCHRONIZER_PROTOCOL = 'tinybase';
export const SERVER_CLIENT_ID = 'S';

const MULTIPLE_CLIENT_ID = 'M';
const MULTIPLE_MESSAGE = -1;

export const enum MultipleControl {
  Hello,
  Subscribe,
  Unsubscribe,
}

export const MULTIPLE_VERSION = 1;

type Pending = [
  fragments: string[],
  remaining: number,
  total: number,
  timeout: ReturnType<typeof startTimeout>,
];

export const ifPayloadValid = (
  payload: string,
  then: (clientId: string, remainder: string) => void,
) => {
  const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
  if (splitAt !== -1) {
    then(slice(payload, 0, splitAt), slice(payload, splitAt + 1));
  }
};

const receivePayloadRemainder = (
  fromClientId: Id,
  remainder: string,
  receive: Receive,
) =>
  receive(
    fromClientId,
    ...(jsonParseWithUndefined(remainder) as [
      requestId: IdOrNull,
      message: Message,
      body: any,
    ]),
  );

export const receivePayload = (payload: string, receive: Receive) =>
  ifPayloadValid(payload, (fromClientId, remainder) =>
    receivePayloadRemainder(fromClientId, remainder, receive),
  );

export const createPayloadReceiver = (
  receive: Receive,
  fragmentTimeoutSeconds: number = 1,
) => {
  const buffer: IdMap<Pending> = mapNew();

  const setPendingTimeout = (bufferKey: Id) =>
    startTimeout(() => collDel(buffer, bufferKey), fragmentTimeoutSeconds);

  const delPending = (bufferKey: Id, pending: Pending) => {
    stopTimeout(pending[3]);
    collDel(buffer, bufferKey);
  };

  return (payload: string) =>
    ifPayloadValid(payload, (fromClientId, remainder) => {
      const [, messageId, indexStr, totalStr, fragment] =
        strMatch(remainder, FRAGMENT) ?? [];
      if (messageId) {
        const index = parseInt(indexStr);
        const total = parseInt(totalStr);
        if (total > 0 && index >= 0 && index < total) {
          const bufferKey = fromClientId + MESSAGE_SEPARATOR + messageId;
          const pending = mapEnsure(buffer, bufferKey, (): Pending => [
            [],
            total,
            total,
            setPendingTimeout(bufferKey),
          ]);
          const [fragments] = pending;
          if (total == pending[2] && isUndefined(fragments[index])) {
            stopTimeout(pending[3]);
            pending[3] = setPendingTimeout(bufferKey);
            fragments[index] = fragment;
            pending[1]--;
          }
          if (pending[1] == 0) {
            delPending(bufferKey, pending);
            receivePayloadRemainder(
              fromClientId,
              arrayJoin(fragments),
              receive,
            );
          }
        }
      } else {
        receivePayloadRemainder(fromClientId, remainder, receive);
      }
    });
};

export const createPayload = (
  toClientId: IdOrNull,
  ...args: [requestId: IdOrNull, message: Message, body: any]
): string =>
  createRawPayload(toClientId ?? EMPTY_STRING, jsonStringWithUndefined(args));

export const createRawPayload = (clientId: Id, remainder: string): string =>
  clientId + MESSAGE_SEPARATOR + remainder;

export const createMultiplePayload = (channelId: Id, payload: string): string =>
  createRawPayload(MULTIPLE_CLIENT_ID, createRawPayload(channelId, payload));

export const ifMultiplePayloadValid = (
  payload: string,
  then: (channelId: Id, payload: string) => void,
) =>
  ifPayloadValid(payload, (multipleClientId, remainder) =>
    multipleClientId == MULTIPLE_CLIENT_ID
      ? ifPayloadValid(remainder, then)
      : 0,
  );

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
) =>
  ifPayloadValid(payload, (serverClientId, remainder) => {
    if (serverClientId == SERVER_CLIENT_ID) {
      const [requestId, message, controlAndBody] = jsonParseWithUndefined(
        remainder,
      ) as [IdOrNull, number, any];
      if (
        message == MULTIPLE_MESSAGE &&
        isArray(controlAndBody) &&
        controlAndBody.length == 2
      ) {
        then(
          requestId,
          controlAndBody[0] as MultipleControl,
          controlAndBody[1],
        );
      }
    }
  });

export const isMultipleChannelIdValid = (channelId: Id): boolean =>
  channelId.length > 0 &&
  !/[\n\r?#]/.test(channelId) &&
  arrayEvery(
    strSplit(channelId, '/'),
    (part) => part.length > 0 && part != '.' && part != '..',
  );

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
  if (
    isUndefined(fragmentSize) ||
    maxFragmentSize < 1 ||
    size(remainder) <= maxFragmentSize
  ) {
    return [createRawPayload(clientId, remainder)];
  }
  const fragments = strMatch(
    remainder,
    new RegExp(`.{1,${maxFragmentSize}}`, 'g'),
  );
  const total = size(fragments ?? []);
  const messageId = getUniqueId();
  return arrayMap(fragments ?? [], (fragment, index) =>
    createRawPayload(
      clientId,
      arrayJoin([messageId, index, total, fragment], MESSAGE_SEPARATOR),
    ),
  );
};
