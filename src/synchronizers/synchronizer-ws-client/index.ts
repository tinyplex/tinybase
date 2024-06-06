import {EMPTY_STRING, UTF8} from '../../common/strings';
import type {MessageType, Receive} from '../../@types/synchronizers';
import type {
  WebSocketTypes,
  createWsSynchronizer as createWsSynchronizerDecl,
} from '../../@types/synchronizers/synchronizer-ws-client';
import {isUndefined, promiseNew, slice} from '../../common/other';
import {
  jsonParseWithUndefined,
  jsonStringWithUndefined,
} from '../../common/json';
import type {IdOrNull} from '../../@types/common';
import {MESSAGE_SEPARATOR} from '../common';
import type {MergeableStore} from '../../@types/mergeable-store';
import {createCustomSynchronizer} from '../';

export const createWsSynchronizer = (async <
  WebSocketType extends WebSocketTypes,
>(
  store: MergeableStore,
  webSocket: WebSocketType,
  requestTimeoutSeconds: number = 1,
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
      (toClientId ?? EMPTY_STRING) +
        MESSAGE_SEPARATOR +
        jsonStringWithUndefined(args),
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
    {getWebSocket: () => webSocket},
  );

  addEventListener('message', ({data}) => {
    if (!isUndefined(currentReceive)) {
      const payload = data.toString(UTF8);
      const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
      if (splitAt !== -1) {
        currentReceive(
          slice(data, 0, splitAt),
          ...(jsonParseWithUndefined(slice(data, splitAt + 1)) as [
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
      addEventListener('open', () => resolve(synchronizer as any));
    } else {
      resolve(synchronizer as any);
    }
  });
}) as typeof createWsSynchronizerDecl;
