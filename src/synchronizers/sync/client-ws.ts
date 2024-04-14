import {
  ClientStats,
  MessageType,
  Receive,
  createWsClient as createWsClientDecl,
} from '../../types/synchronizers/persister-sync';
import {DEBUG, isUndefined, promiseNew, slice} from '../../common/other';
import {EMPTY_STRING, UTF8} from '../../common/strings';
import {jsonParse, jsonString} from '../../common/json';
import {IdOrNull} from '../../types/common';
import {MESSAGE_SEPARATOR} from './common';
import {WebSocket} from 'ws';

export const createWsClient = (async (webSocket: WebSocket) => {
  let sends = 0;
  let receives = 0;
  let currentReceive: Receive;

  webSocket.on('message', (data) => {
    if (!isUndefined(currentReceive)) {
      const payload = data.toString(UTF8);
      const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
      if (splitAt !== -1) {
        if (DEBUG) {
          receives++;
        }
        currentReceive(
          slice(payload, 0, splitAt),
          ...(jsonParse(slice(payload, splitAt + 1)) as [
            requestId: IdOrNull,
            messageType: MessageType,
            messageBody: any,
          ]),
        );
      }
    }
  });

  const onReceive = (receive: Receive): void => {
    currentReceive = receive;
  };

  const send = (
    toClientId: IdOrNull,
    ...args: [requestId: IdOrNull, messageType: MessageType, messageBody: any]
  ): void => {
    if (DEBUG) {
      sends++;
    }
    webSocket.send(
      (toClientId ?? EMPTY_STRING) + MESSAGE_SEPARATOR + jsonString(args),
    );
  };

  const destroy = (): void => {
    webSocket.close();
  };

  const getStats = (): ClientStats => (DEBUG ? {sends, receives} : {});

  const client = {send, onReceive, destroy, getStats};

  return promiseNew((resolve, reject) => {
    if (webSocket.readyState != webSocket.OPEN) {
      webSocket.on('error', reject);
      webSocket.on('open', () => resolve(client));
    } else {
      resolve(client);
    }
  });
}) as typeof createWsClientDecl;
