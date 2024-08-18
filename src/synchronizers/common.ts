import type {Id, IdOrNull} from '../@types/common/index.d.ts';
import type {Message, Receive} from '../@types/synchronizers/index.d.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../common/json.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import {slice} from '../common/other.ts';

const MESSAGE_SEPARATOR = '\n';

export const ifPayloadValid = (
  payload: string,
  then: (clientId: string, remainder: string) => void,
) => {
  const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
  if (splitAt !== -1) {
    then(slice(payload, 0, splitAt), slice(payload, splitAt + 1));
  }
};

export const receivePayload = (payload: string, receive: Receive) =>
  ifPayloadValid(payload, (fromClientId, remainder) =>
    receive(
      fromClientId,
      ...(jsonParseWithUndefined(remainder) as [
        requestId: IdOrNull,
        message: Message,
        body: any,
      ]),
    ),
  );

export const createPayload = (
  toClientId: IdOrNull,
  ...args: [requestId: IdOrNull, message: Message, body: any]
): string =>
  createRawPayload(toClientId ?? EMPTY_STRING, jsonStringWithUndefined(args));

export const createRawPayload = (toClientId: Id, remainder: string): string =>
  toClientId + MESSAGE_SEPARATOR + remainder;
