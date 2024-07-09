import type {Message, Receive} from '../../@types/synchronizers/index.d.ts';
import type {
  WebSocketTypes,
  createWsSynchronizer as createWsSynchronizerDecl,
} from '../../@types/synchronizers/synchronizer-ws-client/index.d.ts';
import {packWsPayload, unpackAndReceiveWsPayload} from '../common.ts';
import type {IdOrNull} from '../../@types/common/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import {UTF8} from '../../common/strings.ts';
import {createCustomSynchronizer} from '../index.ts';
import {promiseNew} from '../../common/other.ts';

export const createWsSynchronizer = (async <
  WebSocketType extends WebSocketTypes,
>(
  store: MergeableStore,
  webSocket: WebSocketType,
  requestTimeoutSeconds: number = 1,
  onIgnoredError?: (error: any) => void,
) => {
  const addEventListener = (event: string, handler: (...args: any[]) => void) =>
    (webSocket.addEventListener as any)(event, handler);

  const registerReceive = (receive: Receive): void =>
    addEventListener('message', ({data}) =>
      unpackAndReceiveWsPayload(data.toString(UTF8), receive),
    );

  const send = (
    toClientId: IdOrNull,
    ...args: [requestId: IdOrNull, message: Message, body: any]
  ): void => webSocket.send(packWsPayload(toClientId, ...args));

  const destroy = (): void => {
    webSocket.close();
  };

  const synchronizer = createCustomSynchronizer(
    store,
    send,
    registerReceive,
    destroy,
    requestTimeoutSeconds,
    onIgnoredError,
    {getWebSocket: () => webSocket},
  );

  return promiseNew((resolve, reject) => {
    if (webSocket.readyState != webSocket.OPEN) {
      addEventListener('error', reject);
      addEventListener('open', () => resolve(synchronizer as any));
    } else {
      resolve(synchronizer as any);
    }
  });
}) as typeof createWsSynchronizerDecl;
