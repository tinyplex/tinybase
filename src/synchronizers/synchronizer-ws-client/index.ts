import type {Id, IdOrNull} from '../../@types/common/index.d.ts';
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
import {arrayClear, arrayForEach, arrayPush} from '../../common/array.ts';
import {getUniqueId} from '../../common/codec.ts';
import {collDel, collHas, collIsEmpty} from '../../common/coll.ts';
import {
  ERROR_LEGACY_MULTIPLEX,
  ERROR_MULTIPLEX_CHANNEL,
  ERROR_MULTIPLEX_CHANNEL_DUPLICATE,
  ERROR_MULTIPLEX_DESTROYED,
  ERROR_MULTIPLEX_LEGACY,
  ERROR_MULTIPLEX_RESPONSE,
  ERROR_MULTIPLEX_SOCKET,
  errorNew,
  errorThrow,
} from '../../common/error.ts';
import {
  IdMap,
  mapForEach,
  mapGet,
  mapNew,
  mapSet,
  weakMapNew,
} from '../../common/map.ts';
import {
  isString,
  promiseNew,
  startTimeout,
  stopTimeout,
} from '../../common/other.ts';
import {weakSetNew} from '../../common/set.ts';
import {ERROR, MESSAGE, OPEN, UTF8} from '../../common/strings.ts';
import {
  MULTIPLE_VERSION,
  MultipleControl,
  createMultipleControlPayload,
  createMultiplePayload,
  createPayloadReceiver,
  createPayloads,
  ifMultipleControlPayloadValid,
  ifMultiplePayloadValid,
  isMultipleChannelIdValid,
} from '../common.ts';
import {createCustomSynchronizer} from '../index.ts';

type Channel = [
  receive: ((payload: string) => void) | undefined,
  incoming: string[],
  outgoing: string[],
  subscribed: boolean,
  subscribing: Promise<void> | undefined,
];

type PendingControl = [
  control: MultipleControl,
  resolve: () => void,
  reject: (error: Error) => void,
  timeout: ReturnType<typeof startTimeout>,
];

type Connection = [
  promise: Promise<void>,
  resolve: () => void,
  reject: (error: Error) => void,
];

type MultipleState = {
  addChannel: (channelId: Id, timeoutSeconds: number) => Promise<void>;
  delChannel: (channelId: Id) => void;
  destroyIfEmpty: () => void;
  registerReceive: (channelId: Id, receive: (payload: string) => void) => void;
  send: (channelId: Id, payload: string) => void;
};

const multipleStates = weakMapNew<WebSocketTypes, MultipleState>();
const legacyWebSockets = weakSetNew<WebSocketTypes>();

const createConnection = (): Connection => {
  let resolve: () => void;
  let reject: (error: Error) => void;
  const promise = promiseNew<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return [promise, resolve!, reject!];
};

const createMultipleState = <WebSocketType extends WebSocketTypes>(
  webSocket: WebSocketType,
  requestTimeoutSeconds: number,
  onIgnoredError?: (error: any) => void,
) => {
  const channels: IdMap<Channel> = mapNew();
  const pendingControls: IdMap<PendingControl> = mapNew();
  const removeListeners: (() => void)[] = [];
  let connection = createConnection();
  let connected = false;
  let destroyed = false;

  const addEventListener = (
    event: keyof WebSocketEventMap,
    handler: (...args: any[]) => void,
  ) => {
    webSocket.addEventListener(event, handler);
    const removeListener = () => webSocket.removeEventListener(event, handler);
    arrayPush(removeListeners, removeListener);
    return removeListener;
  };

  const rejectPendingControls = (error: Error) =>
    mapForEach(pendingControls, (requestId, [, , reject, timeout]) => {
      stopTimeout(timeout);
      collDel(pendingControls, requestId);
      reject(error);
    });

  const sendControl = (
    control: MultipleControl,
    body: any,
    timeoutSeconds: number,
  ): Promise<void> => {
    const requestId = getUniqueId();
    return promiseNew((resolve, reject) => {
      const timeout = startTimeout(() => {
        collDel(pendingControls, requestId);
        const error = errorNew(ERROR_MULTIPLEX_RESPONSE, control);
        onIgnoredError?.(error);
        reject(error);
      }, timeoutSeconds);
      mapSet(pendingControls, requestId, [control, resolve, reject, timeout]);
      webSocket.send(createMultipleControlPayload(requestId, control, body));
    });
  };

  const flushOutgoing = (channelId: Id, channel: Channel) => {
    arrayForEach(channel[2], (payload) =>
      webSocket.send(createMultiplePayload(channelId, payload)),
    );
    arrayClear(channel[2]);
  };

  const subscribe = async (
    channelId: Id,
    channel: Channel,
    timeoutSeconds: number,
  ) => {
    if (!channel[3]) {
      channel[4] ??= (async () => {
        await connection[0];
        await sendControl(MultipleControl.Subscribe, channelId, timeoutSeconds);
        channel[3] = true;
        channel[4] = undefined;
        flushOutgoing(channelId, channel);
      })();
      await channel[4];
    }
  };

  const onOpen = async () => {
    const openingConnection = connection;
    try {
      await sendControl(
        MultipleControl.Hello,
        MULTIPLE_VERSION,
        requestTimeoutSeconds,
      );
      connected = true;
      openingConnection[1]();
      mapForEach(channels, (channelId, channel) =>
        subscribe(channelId, channel, requestTimeoutSeconds).catch(
          onIgnoredError,
        ),
      );
    } catch (error: any) {
      openingConnection[2](error);
    }
  };

  const onClose = () => {
    if (!destroyed) {
      connected = false;
      const error = errorNew(ERROR_MULTIPLEX_SOCKET);
      connection[2](error);
      rejectPendingControls(error);
      connection = createConnection();
      mapForEach(channels, (_channelId, channel) => {
        channel[3] = false;
        channel[4] = undefined;
      });
    }
  };

  addEventListener(MESSAGE, ({data}) => {
    const payload = data.toString(UTF8);
    ifMultipleControlPayloadValid(payload, (requestId, control, _body) => {
      const pendingControl = requestId
        ? mapGet(pendingControls, requestId)
        : undefined;
      if (pendingControl?.[0] == control) {
        stopTimeout(pendingControl[3]);
        collDel(pendingControls, requestId);
        pendingControl[1]();
      }
    });
    ifMultiplePayloadValid(payload, (channelId, channelPayload) => {
      const channel = mapGet(channels, channelId);
      if (channel) {
        if (channel[0]) {
          channel[0](channelPayload);
        } else {
          arrayPush(channel[1], channelPayload);
        }
      }
    });
  });
  addEventListener(OPEN, onOpen);
  addEventListener('close', onClose);
  addEventListener(ERROR, (error) => onIgnoredError?.(error));

  if (webSocket.readyState == webSocket.OPEN) {
    onOpen();
  }

  const addChannel = async (channelId: Id, timeoutSeconds: number) => {
    if (!isMultipleChannelIdValid(channelId)) {
      errorThrow(ERROR_MULTIPLEX_CHANNEL, channelId);
    }
    if (collHas(channels, channelId)) {
      errorThrow(ERROR_MULTIPLEX_CHANNEL_DUPLICATE, channelId);
    }
    const channel: Channel = [undefined, [], [], false, undefined];
    mapSet(channels, channelId, channel);
    try {
      await subscribe(channelId, channel, timeoutSeconds);
    } catch (error) {
      delChannel(channelId);
      throw error;
    }
  };

  const registerReceive = (
    channelId: Id,
    receive: (payload: string) => void,
  ) => {
    const channel = mapGet(channels, channelId);
    if (channel) {
      channel[0] = receive;
      arrayForEach(channel[1], receive);
      arrayClear(channel[1]);
    }
  };

  const send = (channelId: Id, payload: string) => {
    const channel = mapGet(channels, channelId);
    if (channel) {
      if (connected && channel[3]) {
        webSocket.send(createMultiplePayload(channelId, payload));
      } else {
        arrayPush(channel[2], payload);
      }
    }
  };

  const destroyIfEmpty = () => {
    if (collIsEmpty(channels) && !destroyed) {
      destroyed = true;
      rejectPendingControls(errorNew(ERROR_MULTIPLEX_DESTROYED));
      arrayForEach(removeListeners, (removeListener) => removeListener());
      multipleStates.delete(webSocket);
      webSocket.close();
    }
  };

  const delChannel = (channelId: Id) => {
    const channel = mapGet(channels, channelId);
    if (channel) {
      if (connected && channel[3]) {
        webSocket.send(
          createMultipleControlPayload(
            null,
            MultipleControl.Unsubscribe,
            channelId,
          ),
        );
      }
      collDel(channels, channelId);
      destroyIfEmpty();
    }
  };

  return {addChannel, delChannel, destroyIfEmpty, registerReceive, send};
};

const createMultipleWsSynchronizer = async <
  WebSocketType extends WebSocketTypes,
>(
  store: MergeableStore,
  webSocket: WebSocketType,
  channelId: Id,
  requestTimeoutSeconds: number,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
  fragmentSize?: number,
) => {
  if (legacyWebSockets.has(webSocket)) {
    errorThrow(ERROR_MULTIPLEX_LEGACY);
  }
  const existingState = multipleStates.get(webSocket);
  const state =
    existingState ??
    (() => {
      const newState = createMultipleState(
        webSocket,
        requestTimeoutSeconds,
        onIgnoredError,
      );
      multipleStates.set(webSocket, newState);
      return newState;
    })();

  try {
    await state.addChannel(channelId, requestTimeoutSeconds);
  } catch (error) {
    if (!existingState) {
      state.destroyIfEmpty();
    }
    throw error;
  }

  return createCustomSynchronizer(
    store,
    (toClientId, requestId, message, body) =>
      arrayForEach(
        createPayloads(toClientId, requestId, message, body, fragmentSize),
        (payload) => state.send(channelId, payload),
      ),
    (receive: Receive) =>
      state.registerReceive(
        channelId,
        createPayloadReceiver(receive, requestTimeoutSeconds),
      ),
    () => state.delChannel(channelId),
    requestTimeoutSeconds,
    onSend,
    onReceive,
    onIgnoredError,
    {getWebSocket: () => webSocket},
  ) as WsSynchronizer<WebSocketType>;
};

const createLegacyWsSynchronizer = async <WebSocketType extends WebSocketTypes>(
  store: MergeableStore,
  webSocket: WebSocketType,
  requestTimeoutSeconds: number = 1,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
  fragmentSize?: number,
) => {
  if (multipleStates.has(webSocket)) {
    errorThrow(ERROR_LEGACY_MULTIPLEX);
  }
  const addEventListener = (
    event: keyof WebSocketEventMap,
    handler: (...args: any[]) => void,
  ) => {
    webSocket.addEventListener(event, handler);
    return () => webSocket.removeEventListener(event, handler);
  };

  const registerReceive = (receive: Receive) => {
    const receivePayload = createPayloadReceiver(
      receive,
      requestTimeoutSeconds,
    );
    addEventListener(MESSAGE, ({data}) => receivePayload(data.toString(UTF8)));
  };

  const send = (
    toClientId: IdOrNull,
    ...args: [requestId: IdOrNull, message: Message, body: any]
  ): void =>
    arrayForEach(createPayloads(toClientId, ...args, fragmentSize), (payload) =>
      webSocket.send(payload),
    );

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

  legacyWebSockets.add(webSocket);
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
};

export const createWsSynchronizer = (async (
  store: MergeableStore,
  webSocket: WebSocketTypes,
  channelIdOrRequestTimeout: Id | number = 1,
  ...args: any[]
) =>
  isString(channelIdOrRequestTimeout)
    ? createMultipleWsSynchronizer(
        store,
        webSocket,
        channelIdOrRequestTimeout,
        args[0] ?? 1,
        args[1],
        args[2],
        args[3],
        args[4],
      )
    : createLegacyWsSynchronizer(
        store,
        webSocket,
        channelIdOrRequestTimeout,
        args[0],
        args[1],
        args[2],
        args[3],
      )) as typeof createWsSynchronizerDecl;
