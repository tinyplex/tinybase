import type {Message, Receive} from '../@types/synchronizers/index.d.ts';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../common/json.ts';
import {EMPTY_STRING} from '../common/strings.ts';
import type {IdOrNull} from '../@types/common/index.d.ts';
import {slice} from '../common/other.ts';

export const MESSAGE_SEPARATOR = '\n';

export const unpackAndReceiveWsPayload = (
  payload: string,
  receive: Receive,
) => {
  const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
  splitAt !== -1
    ? receive(
        slice(payload, 0, splitAt),
        ...(jsonParseWithUndefined(slice(payload, splitAt + 1)) as [
          requestId: IdOrNull,
          message: Message,
          body: any,
        ]),
      )
    : 0;
};

export const packWsPayload = (
  toClientId: IdOrNull,
  ...args: [requestId: IdOrNull, message: Message, body: any]
): string =>
  (toClientId ?? EMPTY_STRING) +
  MESSAGE_SEPARATOR +
  jsonStringWithUndefined(args);
