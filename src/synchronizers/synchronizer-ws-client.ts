import {DEBUG, isUndefined, promiseNew, slice} from '../common/other';
import {EMPTY_STRING, UTF8} from '../common/strings';
import {MessageType, Receive, SynchronizerStats} from '../types/synchronizers';
import {jsonParse, jsonString} from '../common/json';
import {IdOrNull} from '../types/common';
import {MESSAGE_SEPARATOR} from './common';
import {MergeableStore} from '../types/mergeable-store';
import {WebSocket} from 'ws';
import {createCustomSynchronizer} from '../synchronizers';
import {createWsSynchronizer as createWsSynchronizerDecl} from '../types/synchronizers/synchronizer-ws-client';

export const createWsSynchronizer = (async (
  store: MergeableStore,
  webSocket: WebSocket,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
) => {
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

  const getStats = (): SynchronizerStats => (DEBUG ? {sends, receives} : {});

  const client = {send, onReceive, destroy, getStats};

  const synchronizer = createCustomSynchronizer(
    store,
    client,
    requestTimeoutSeconds,
    onIgnoredError,
  );

  return promiseNew((resolve, reject) => {
    if (webSocket.readyState != webSocket.OPEN) {
      webSocket.on('error', reject);
      webSocket.on('open', () => resolve(synchronizer));
    } else {
      resolve(synchronizer);
    }
  });
}) as typeof createWsSynchronizerDecl;
