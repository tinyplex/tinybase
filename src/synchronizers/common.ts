import type {Id, IdOrNull} from '../@types/common/index.d.ts';
import type {Message, Receive} from '../@types/synchronizers/index.d.ts';
import {arrayJoin, arrayMap} from '../common/array.ts';
import {collDel} from '../common/coll.ts';
import {getUniqueId} from '../common/codec.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../common/json.ts';
import {IdMap, mapEnsure, mapNew} from '../common/map.ts';
import {isUndefined, mathFloor, size, slice} from '../common/other.ts';
import {EMPTY_STRING, strMatch} from '../common/strings.ts';

const MESSAGE_SEPARATOR = '\n';
const FRAGMENT = /^(.+)\n(\d+)\n(\d+)\n([\s\S]*)$/;

type Pending = [fragments: string[], remaining: number];

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

export const createPayloadReceiver = (receive: Receive) => {
  const buffer: IdMap<Pending> = mapNew();

  return (payload: string) =>
    ifPayloadValid(payload, (fromClientId, remainder) => {
      const [, messageId, indexStr, totalStr, fragment] =
        strMatch(remainder, FRAGMENT) ?? [];
      if (messageId) {
        const index = parseInt(indexStr);
        const total = parseInt(totalStr);
        const bufferKey = fromClientId + MESSAGE_SEPARATOR + messageId;
        const pending = mapEnsure(
          buffer,
          bufferKey,
          (): Pending => [[], total],
        );
        const [fragments] = pending;
        if (isUndefined(fragments[index])) {
          fragments[index] = fragment;
          pending[1]--;
        }
        if (pending[1] == 0) {
          collDel(buffer, bufferKey);
          receivePayloadRemainder(fromClientId, arrayJoin(fragments), receive);
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
