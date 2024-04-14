import {EMPTY_STRING, UTF8} from '../common/strings';
import {MessageType, Receive} from '../types/synchronizers';
import {isUndefined, promiseNew, slice} from '../common/other';
import {jsonParse, jsonString} from '../common/json';
import {IdOrNull} from '../types/common';
import {MESSAGE_SEPARATOR} from './common';
import {MergeableStore} from '../types/mergeable-store';
import {WebSocket as WsWebSocket} from 'ws';
import {createCustomSynchronizer} from '../synchronizers';
import {createWsSynchronizer as createWsSynchronizerDecl} from '../types/synchronizers/synchronizer-ws-client';

export const createWsSynchronizer = (async (
  store: MergeableStore,
  webSocket: WebSocket | WsWebSocket,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
) => {
  let currentReceive: Receive;

  const addEventListener = (event: string, handler: (...args: any[]) => void) =>
    (webSocket.addEventListener as any)(event, handler);

  const onReceive = (receive: Receive): void => {
    currentReceive = receive;
  };

  const send = (
    toClientId: IdOrNull,
    ...args: [requestId: IdOrNull, messageType: MessageType, messageBody: any]
  ): void => {
    webSocket.send(
      (toClientId ?? EMPTY_STRING) + MESSAGE_SEPARATOR + jsonString(args),
    );
  };

  const destroy = (): void => {
    webSocket.close();
  };

  const synchronizer = createCustomSynchronizer(
    store,
    send,
    onReceive,
    destroy,
    requestTimeoutSeconds,
    onIgnoredError,
  );

  addEventListener('message', ({data}) => {
    if (!isUndefined(currentReceive)) {
      const payload = data.toString(UTF8);
      const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
      if (splitAt !== -1) {
        currentReceive(
          slice(data, 0, splitAt),
          ...(jsonParse(slice(data, splitAt + 1)) as [
            requestId: IdOrNull,
            messageType: MessageType,
            messageBody: any,
          ]),
        );
      }
    }
  });
  return promiseNew((resolve, reject) => {
    if (webSocket.readyState != webSocket.OPEN) {
      addEventListener('error', reject);
      addEventListener('open', () => resolve(synchronizer));
    } else {
      resolve(synchronizer);
    }
  });
}) as typeof createWsSynchronizerDecl;
