import type {IdOrNull} from '../../@types/common/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  Message,
  Receive,
  Send,
} from '../../@types/synchronizers/index.d.ts';
import type {
  WebSocketTypes,
  WsSynchronizer,
  createWsSynchronizer as createWsSynchronizerDecl,
} from '../../@types/synchronizers/synchronizer-ws-client/index.d.ts';
import {promiseNew} from '../../common/other.ts';
import {ERROR, MESSAGE, OPEN, UTF8} from '../../common/strings.ts';
import {createPayload, receivePayload} from '../common.ts';
import {createCustomSynchronizer} from '../index.ts';

export const createWsSynchronizer = (async <
  WebSocketType extends WebSocketTypes,
>(
  store: MergeableStore,
  webSocket: WebSocketType,
  requestTimeoutSeconds: number = 1,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
) => {
  const addEventListener = (
    event: keyof WebSocketEventMap,
    handler: (...args: any[]) => void,
  ) => {
    webSocket.addEventListener(event, handler);
    return () => webSocket.removeEventListener(event, handler);
  };

  const registerReceive = (receive: Receive) =>
    addEventListener(MESSAGE, ({data}) =>
      receivePayload(data.toString(UTF8), receive),
    );

  const send = (
    toClientId: IdOrNull,
    ...args: [requestId: IdOrNull, message: Message, body: any]
  ): void => webSocket.send(createPayload(toClientId, ...args));

  const destroy = (): void => {
    webSocket.close();
  };

  const synchronizer = createCustomSynchronizer(
    store,
    send,
    registerReceive,
    destroy,
    requestTimeoutSeconds,
    onSend,
    onReceive,
    onIgnoredError,
    {getWebSocket: () => webSocket},
  ) as WsSynchronizer<any>;

  return promiseNew((resolve) => {
    if (webSocket.readyState != webSocket.OPEN) {
      const onAttempt = (error?: any) => {
        if (error) {
          onIgnoredError?.(error);
        }
        removeOpenListener();
        removeErrorListener();
        resolve(synchronizer);
      };
      const removeOpenListener = addEventListener(OPEN, () => onAttempt());
      const removeErrorListener = addEventListener(ERROR, onAttempt);
    } else {
      resolve(synchronizer);
    }
  });
}) as typeof createWsSynchronizerDecl;
