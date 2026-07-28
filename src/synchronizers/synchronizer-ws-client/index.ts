import type {Id, IdOrNull} from '../../@types/common/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {
  Message as MessageType,
  Receive,
  Send,
} from '../../@types/synchronizers/index.d.ts';
import type {
  WebSocketTypes,
  WsSynchronizer,
  createWsSynchronizer as createWsSynchronizerDecl,
} from '../../@types/synchronizers/synchronizer-ws-client/index.d.ts';
import {
  arrayClear,
  arrayFilter,
  arrayForEach,
  arrayIndexOf,
  arrayPush,
  arrayReduce,
} from '../../common/array.ts';
import {getUniqueId} from '../../common/codec.ts';
import {collDel, collHas, collIsEmpty, collSize} from '../../common/coll.ts';
import {
  ERROR_LEGACY_MULTIPLEX,
  ERROR_MULTIPLEX_CHANNEL,
  ERROR_MULTIPLEX_CHANNEL_DUPLICATE,
  ERROR_MULTIPLEX_DESTROYED,
  ERROR_MULTIPLEX_LEGACY,
  ERROR_MULTIPLEX_RESPONSE,
  ERROR_MULTIPLEX_SOCKET,
  ERROR_SYNC_MESSAGE,
  ERROR_SYNC_OVERFLOW,
  errorNew,
  errorThrow,
  tryFinally,
  tryReturn,
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
  addEventListener,
  isString,
  promiseNew,
  size,
  slice,
  startTimeout,
  stopTimeout,
} from '../../common/other.ts';
import {weakSetNew} from '../../common/set.ts';
import {
  CLOSE,
  EMPTY_STRING,
  ERROR,
  MESSAGE,
  OPEN,
  UTF8,
} from '../../common/strings.ts';
import {
  type PayloadBuffer,
  type PayloadDecoder,
  MAX_MULTIPLE_CHANNELS,
  MAX_PENDING_REQUESTS,
  MAX_WEBSOCKET_BUFFER_SIZE,
  MAX_WEBSOCKET_QUEUE_SIZE,
  MULTIPLE_VERSION,
  MultipleControl,
  createInvalidPayloadHandler,
  createMultipleControlPayload,
  createMultiplePayload,
  createPayloadReceiver,
  createPayloads,
  getWebSocketPayloadSize,
  ifMultipleControlPayloadValid,
  ifMultiplePayloadValid,
  isMultipleChannelIdValid,
  isWebSocketBackpressured,
  isWebSocketPayloadTooLarge,
} from '../common.ts';
import {createCustomSynchronizer} from '../index.ts';

const CONTENT_HASHES = 2 as MessageType;
const CONTENT_DIFF = 3 as MessageType;

type Incoming = [payload: string, timeout: ReturnType<typeof startTimeout>];

type Outgoing = [
  payloads: string[],
  timeout: ReturnType<typeof startTimeout>,
  sent: number,
];

const enum ChannelValue {
  Receive,
  Incoming,
  Outgoing,
  Subscribed,
  Subscribing,
  TimeoutSeconds,
  OnIgnoredError,
  Dirty,
  IncomingSize,
  OutgoingSize,
  OutgoingCount,
  Fail,
  SubscribeConnection,
}

type Channel = [
  receive: PayloadDecoder | undefined,
  incoming: Incoming[],
  outgoing: Outgoing[],
  subscribed: boolean,
  subscribing: [connection: Connection, subscribing: Promise<void>] | undefined,
  timeoutSeconds: number,
  onIgnoredError: ((error: any) => void) | undefined,
  dirty: (() => string[]) | undefined,
  incomingSize: number,
  outgoingSize: number,
  outgoingCount: number,
  fail: ((error: Error) => void) | undefined,
  subscribeConnection: Connection | undefined,
];

type PendingControl = [
  control: MultipleControl,
  body: any,
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
  addChannel: (
    channelId: Id,
    timeoutSeconds: number,
    onIgnoredError?: (error: any) => void,
  ) => Promise<void>;
  delChannel: (channelId: Id) => void;
  destroyIfEmpty: () => void;
  invalid: (error: Error) => void;
  payloadBuffer: PayloadBuffer;
  registerReceive: (
    channelId: Id,
    receive: PayloadDecoder,
    fail: (error: Error) => void,
  ) => void;
  send: (channelId: Id, payloads: string[], coalesce?: () => string[]) => void;
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
  promise.catch(() => 0);
  return [promise, resolve!, reject!];
};

const createMultipleState = <WebSocketType extends WebSocketTypes>(
  webSocket: WebSocketType,
) => {
  const channels: IdMap<Channel> = mapNew();
  const pendingControls: IdMap<PendingControl> = mapNew();
  const payloadBuffer: PayloadBuffer = [0, 0];
  const removeListeners: (() => void)[] = [];
  let connection = createConnection();
  let connected = false;
  let destroyed = false;
  let disconnected = false;
  let disconnect = () => {};
  let flushTimeout: ReturnType<typeof startTimeout> | undefined;
  let opening: [connection: Connection, promise: Promise<void>] | undefined;
  let overflowing = false;
  let queuedCount = 0;
  let queuedSize = 0;
  let receiving = true;

  const notifyChannelIgnoredError = (channel: Channel, error: any) =>
    tryReturn(() => channel[ChannelValue.OnIgnoredError]?.(error));

  const notifyIgnoredError = (error: any) =>
    mapForEach(channels, (_channelId, channel) =>
      notifyChannelIgnoredError(channel, error),
    );

  const handleSendError = (channel: Channel, error: any) => {
    notifyChannelIgnoredError(channel, error);
    disconnect();
    tryReturn(() => webSocket.close());
  };

  const addWebSocketListener = (
    event: keyof WebSocketEventMap,
    handler: (...args: any[]) => void,
  ) => arrayPush(removeListeners, addEventListener(webSocket, event, handler));

  const rejectPendingControls = (error: Error) =>
    mapForEach(pendingControls, (requestId, [, , , reject, timeout]) => {
      stopTimeout(timeout);
      collDel(pendingControls, requestId);
      reject(error);
    });

  const failChannels = (error: Error) =>
    mapForEach(channels, (_channelId, channel) =>
      tryReturn(() => channel[ChannelValue.Fail]?.(error)),
    );

  const clearIncoming = (channel: Channel) => {
    arrayForEach(channel[ChannelValue.Incoming], ([, timeout]) =>
      stopTimeout(timeout),
    );
    queuedCount -= size(channel[ChannelValue.Incoming]);
    queuedSize -= channel[ChannelValue.IncomingSize];
    arrayClear(channel[ChannelValue.Incoming]);
    channel[ChannelValue.IncomingSize] = 0;
  };

  const clearOutgoing = (channel: Channel, clearDirty = false) => {
    arrayForEach(channel[ChannelValue.Outgoing], ([, timeout]) =>
      stopTimeout(timeout),
    );
    queuedCount -= channel[ChannelValue.OutgoingCount];
    queuedSize -= channel[ChannelValue.OutgoingSize];
    arrayClear(channel[ChannelValue.Outgoing]);
    channel[ChannelValue.OutgoingSize] = 0;
    channel[ChannelValue.OutgoingCount] = 0;
    if (clearDirty) {
      channel[ChannelValue.Dirty] = undefined;
    }
  };

  const clearReceive = (channel: Channel) =>
    channel[ChannelValue.Receive]?.[1]();

  const clearReceives = () =>
    mapForEach(channels, (_channelId, channel) => clearReceive(channel));

  const handleInvalid = createInvalidPayloadHandler(
    webSocket,
    notifyIgnoredError,
  );
  const invalid = (error: Error) => {
    if (receiving) {
      receiving = false;
      disconnected = true;
      connected = false;
      clearReceives();
      connection[2](error);
      rejectPendingControls(error);
      failChannels(error);
      mapForEach(channels, (_channelId, channel) => {
        clearIncoming(channel);
        clearOutgoing(channel, true);
        channel[ChannelValue.Subscribed] = false;
        channel[ChannelValue.Subscribing] = undefined;
        channel[ChannelValue.SubscribeConnection] = undefined;
      });
      if (flushTimeout) {
        stopTimeout(flushTimeout);
        flushTimeout = undefined;
      }
      handleInvalid(error);
    }
  };

  const overflow = (details: string): Error => {
    const error = errorNew(ERROR_SYNC_OVERFLOW, details);
    if (!overflowing && !destroyed) {
      overflowing = true;
      receiving = false;
      connected = false;
      clearReceives();
      notifyIgnoredError(error);
      rejectPendingControls(error);
      failChannels(error);
      mapForEach(channels, (_channelId, channel) => {
        clearIncoming(channel);
        clearOutgoing(channel, true);
        channel[ChannelValue.Subscribed] = false;
        channel[ChannelValue.Subscribing] = undefined;
        channel[ChannelValue.SubscribeConnection] = undefined;
      });
      if (flushTimeout) {
        stopTimeout(flushTimeout);
        flushTimeout = undefined;
      }
      webSocket.close(1013, error.message);
    }
    return error;
  };

  const getConnectionTimeoutSeconds = () => {
    let first = true;
    let timeoutSeconds = 1;
    mapForEach(channels, (_channelId, channel) => {
      const channelTimeoutSeconds = channel[ChannelValue.TimeoutSeconds];
      if (first || channelTimeoutSeconds < timeoutSeconds) {
        first = false;
        timeoutSeconds = channelTimeoutSeconds;
      }
    });
    return timeoutSeconds;
  };

  const sendControl = (
    control: MultipleControl,
    body: any,
    timeoutSeconds: number,
    onSent?: () => void,
  ): Promise<void> => {
    const requestId = getUniqueId();
    return promiseNew((resolve, reject) => {
      if (collSize(pendingControls) >= MAX_PENDING_REQUESTS) {
        reject(overflow('controls'));
        return;
      }
      const payload = createMultipleControlPayload(requestId, control, body);
      const payloadSize = getWebSocketPayloadSize(payload);
      if (
        isWebSocketPayloadTooLarge(payloadSize) ||
        isWebSocketBackpressured(webSocket, payloadSize)
      ) {
        reject(overflow('socket'));
        return;
      }
      const timeout = startTimeout(() => {
        collDel(pendingControls, requestId);
        reject(errorNew(ERROR_MULTIPLEX_RESPONSE, control));
      }, timeoutSeconds);
      mapSet(pendingControls, requestId, [
        control,
        body,
        resolve,
        reject,
        timeout,
      ]);
      try {
        webSocket.send(payload);
        onSent?.();
      } catch (error) {
        stopTimeout(timeout);
        collDel(pendingControls, requestId);
        reject(error);
      }
    });
  };

  const getPayloadsSize = (payloads: string[]): number =>
    arrayReduce(
      payloads,
      (total, payload) => total + getWebSocketPayloadSize(payload),
      0,
    );

  const expireIncoming = (channel: Channel, incoming: Incoming) => {
    const index = arrayIndexOf(channel[ChannelValue.Incoming], incoming);
    if (index > -1) {
      channel[ChannelValue.Incoming] = arrayFilter(
        channel[ChannelValue.Incoming],
        (_incoming, incomingIndex) => incomingIndex != index,
      );
      const incomingSize = getWebSocketPayloadSize(incoming[0]);
      channel[ChannelValue.IncomingSize] -= incomingSize;
      queuedCount--;
      queuedSize -= incomingSize;
    }
  };

  const queueIncoming = (channel: Channel, payload: string) => {
    const payloadSize = getWebSocketPayloadSize(payload);
    if (
      queuedCount >= MAX_WEBSOCKET_QUEUE_SIZE ||
      queuedSize + payloadSize > MAX_WEBSOCKET_BUFFER_SIZE
    ) {
      overflow('client');
      return;
    }
    const incoming: Incoming = [
      payload,
      startTimeout(
        () => expireIncoming(channel, incoming),
        channel[ChannelValue.TimeoutSeconds],
      ),
    ];
    arrayPush(channel[ChannelValue.Incoming], incoming);
    channel[ChannelValue.IncomingSize] += payloadSize;
    queuedCount++;
    queuedSize += payloadSize;
  };

  const expireOutgoing = (channel: Channel, outgoing: Outgoing) => {
    const index = arrayIndexOf(channel[ChannelValue.Outgoing], outgoing);
    if (index > -1) {
      channel[ChannelValue.Outgoing] = arrayFilter(
        channel[ChannelValue.Outgoing],
        (_outgoing, outgoingIndex) => outgoingIndex != index,
      );
      const remainingPayloads = slice(outgoing[0], outgoing[2]);
      const remainingSize = getPayloadsSize(remainingPayloads);
      channel[ChannelValue.OutgoingSize] -= remainingSize;
      channel[ChannelValue.OutgoingCount] -= size(remainingPayloads);
      queuedCount -= size(remainingPayloads);
      queuedSize -= remainingSize;
    }
  };

  const queueOutgoing = (channel: Channel, payloads: string[]): boolean => {
    const payloadsSize = getPayloadsSize(payloads);
    if (
      queuedCount + size(payloads) > MAX_WEBSOCKET_QUEUE_SIZE ||
      queuedSize + payloadsSize > MAX_WEBSOCKET_BUFFER_SIZE
    ) {
      overflow('client');
      return false;
    }
    const outgoing: Outgoing = [
      payloads,
      startTimeout(
        () => expireOutgoing(channel, outgoing),
        channel[ChannelValue.TimeoutSeconds],
      ),
      0,
    ];
    arrayPush(channel[ChannelValue.Outgoing], outgoing);
    channel[ChannelValue.OutgoingSize] += payloadsSize;
    channel[ChannelValue.OutgoingCount] += size(payloads);
    queuedCount += size(payloads);
    queuedSize += payloadsSize;
    return true;
  };

  const scheduleFlush = () => {
    flushTimeout ??= startTimeout(() => {
      flushTimeout = undefined;
      mapForEach(channels, flushOutgoing);
    }, 0.01);
  };

  const sendPayloads = (
    channelId: Id,
    channel: Channel,
    payloads: string[],
    coalesce?: () => string[],
  ): boolean => {
    if (webSocket.readyState != webSocket.OPEN) {
      if (coalesce) {
        channel[ChannelValue.Dirty] = coalesce;
      } else {
        queueOutgoing(channel, payloads);
      }
      return false;
    }
    for (let index = 0; index < size(payloads); index++) {
      const payload = createMultiplePayload(channelId, payloads[index]);
      const payloadSize = getWebSocketPayloadSize(payload);
      if (isWebSocketPayloadTooLarge(payloadSize)) {
        overflow('client');
        return false;
      }
      if (isWebSocketBackpressured(webSocket, payloadSize)) {
        if (coalesce) {
          channel[ChannelValue.Dirty] = coalesce;
        } else if (!queueOutgoing(channel, slice(payloads, index))) {
          return false;
        }
        scheduleFlush();
        return false;
      }
      try {
        webSocket.send(payload);
      } catch (error) {
        if (coalesce) {
          channel[ChannelValue.Dirty] = coalesce;
        } else if (!queueOutgoing(channel, slice(payloads, index))) {
          return false;
        }
        handleSendError(channel, error);
        return false;
      }
    }
    return true;
  };

  const flushOutgoing = (channelId: Id, channel: Channel) => {
    if (!connected || !channel[ChannelValue.Subscribed]) {
      return;
    }
    const outgoingQueue = channel[ChannelValue.Outgoing];
    let outgoingIndex = 0;
    while (outgoingIndex < size(outgoingQueue)) {
      const outgoing = outgoingQueue[outgoingIndex];
      const payloads = outgoing[0];
      let payloadIndex = outgoing[2];
      while (payloadIndex < size(payloads)) {
        const queuedPayload = payloads[payloadIndex];
        const payload = createMultiplePayload(channelId, queuedPayload);
        const payloadSize = getWebSocketPayloadSize(payload);
        if (isWebSocketPayloadTooLarge(payloadSize)) {
          arrayClear(outgoingQueue, outgoingIndex);
          overflow('client');
          return;
        }
        if (isWebSocketBackpressured(webSocket, payloadSize)) {
          arrayClear(outgoingQueue, outgoingIndex);
          scheduleFlush();
          return;
        }
        try {
          webSocket.send(payload);
        } catch (error) {
          handleSendError(channel, error);
          return;
        }
        payloads[payloadIndex] = EMPTY_STRING;
        outgoing[2] = ++payloadIndex;
        const sentPayloadSize = getWebSocketPayloadSize(queuedPayload);
        channel[ChannelValue.OutgoingSize] -= sentPayloadSize;
        channel[ChannelValue.OutgoingCount]--;
        queuedSize -= sentPayloadSize;
        queuedCount--;
      }
      stopTimeout(outgoing[1]);
      outgoingIndex++;
    }
    arrayClear(outgoingQueue, outgoingIndex);
    const coalesce = channel[ChannelValue.Dirty];
    if (coalesce) {
      channel[ChannelValue.Dirty] = undefined;
      sendPayloads(channelId, channel, coalesce(), coalesce);
    }
  };

  const subscribe = async (
    channelId: Id,
    channel: Channel,
    timeoutSeconds: number,
  ) => {
    if (!channel[ChannelValue.Subscribed]) {
      let subscribing = channel[ChannelValue.Subscribing];
      const subscribingConnection = connection;
      if (subscribing?.[0] !== subscribingConnection) {
        const subscribingPromise = (async () => {
          await subscribingConnection[0];
          if (
            mapGet(channels, channelId) !== channel ||
            connection !== subscribingConnection ||
            !connected
          ) {
            return;
          }
          await sendControl(
            MultipleControl.Subscribe,
            channelId,
            timeoutSeconds,
            () => {
              if (
                mapGet(channels, channelId) === channel &&
                connection === subscribingConnection &&
                connected
              ) {
                channel[ChannelValue.SubscribeConnection] =
                  subscribingConnection;
              }
            },
          );
          if (
            mapGet(channels, channelId) === channel &&
            connection === subscribingConnection &&
            connected
          ) {
            channel[ChannelValue.Subscribed] = true;
            flushOutgoing(channelId, channel);
          }
        })();
        subscribing = [subscribingConnection, subscribingPromise];
        channel[ChannelValue.Subscribing] = subscribing;
      }
      try {
        await subscribing[1];
      } finally {
        if (channel[ChannelValue.Subscribing] === subscribing) {
          channel[ChannelValue.Subscribing] = undefined;
        }
      }
    }
  };

  const onOpen = () => {
    if (destroyed || !receiving || connected || opening?.[0] === connection) {
      return;
    }
    disconnected = false;
    overflowing = false;
    const openingConnection = connection;
    const openingPromise = (async () => {
      try {
        await sendControl(
          MultipleControl.Hello,
          MULTIPLE_VERSION,
          getConnectionTimeoutSeconds(),
        );
        if (connection === openingConnection && receiving && !destroyed) {
          connected = true;
          openingConnection[1]();
          mapForEach(channels, (channelId, channel) =>
            subscribe(
              channelId,
              channel,
              channel[ChannelValue.TimeoutSeconds],
            ).catch((error) =>
              error.message == errorNew(ERROR_MULTIPLEX_SOCKET).message
                ? 0
                : notifyChannelIgnoredError(channel, error),
            ),
          );
        }
      } catch (error: any) {
        openingConnection[2](error);
        if (error.message != errorNew(ERROR_MULTIPLEX_SOCKET).message) {
          notifyIgnoredError(error);
        }
      }
    })();
    opening = [openingConnection, openingPromise];
    openingPromise.finally(() => {
      if (opening?.[1] === openingPromise) {
        opening = undefined;
      }
    });
  };

  disconnect = () => {
    if (!destroyed && !disconnected) {
      disconnected = true;
      const wasOverflowing = overflowing;
      overflowing = false;
      connected = false;
      const error = errorNew(ERROR_MULTIPLEX_SOCKET);
      if (!wasOverflowing) {
        notifyIgnoredError(error);
      }
      connection[2](error);
      rejectPendingControls(error);
      failChannels(error);
      if (flushTimeout) {
        stopTimeout(flushTimeout);
        flushTimeout = undefined;
      }
      connection = createConnection();
      mapForEach(channels, (_channelId, channel) => {
        clearReceive(channel);
        channel[ChannelValue.Subscribed] = false;
        channel[ChannelValue.Subscribing] = undefined;
        channel[ChannelValue.SubscribeConnection] = undefined;
      });
    }
  };
  const onClose = disconnect;

  addWebSocketListener(MESSAGE, ({data}) => {
    if (!receiving) {
      return;
    }
    const payload = data.toString(UTF8);
    if (isWebSocketPayloadTooLarge(getWebSocketPayloadSize(payload))) {
      invalid(errorNew(ERROR_SYNC_OVERFLOW, 'socket'));
      return;
    }
    const control = ifMultipleControlPayloadValid(
      payload,
      (requestId, control, body) => {
        if (
          (control == MultipleControl.Subscribe ||
            control == MultipleControl.Unsubscribe) &&
          isString(body) &&
          !isMultipleChannelIdValid(body)
        ) {
          overflow('channels');
          return;
        }
        const pendingControl = requestId
          ? mapGet(pendingControls, requestId)
          : undefined;
        if (pendingControl?.[0] == control && pendingControl[1] === body) {
          stopTimeout(pendingControl[4]);
          collDel(pendingControls, requestId);
          pendingControl[2]();
        }
      },
    );
    const channel = ifMultiplePayloadValid(
      payload,
      (channelId, channelPayload) => {
        const channel = mapGet(channels, channelId);
        if (channel) {
          if (channel[ChannelValue.Receive]) {
            channel[ChannelValue.Receive][0](channelPayload);
          } else {
            queueIncoming(channel, channelPayload);
          }
        } else {
          invalid(errorNew(ERROR_SYNC_MESSAGE));
        }
      },
      () => overflow('channels'),
    );
    if (!control && !channel) {
      invalid(errorNew(ERROR_SYNC_MESSAGE));
    }
  });
  addWebSocketListener(OPEN, onOpen);
  addWebSocketListener(CLOSE, onClose);
  addWebSocketListener(ERROR, (error) => {
    notifyIgnoredError(error);
    failChannels(errorNew(ERROR_MULTIPLEX_SOCKET));
  });

  const addChannel = async (
    channelId: Id,
    timeoutSeconds: number,
    onIgnoredError?: (error: any) => void,
  ) => {
    if (!receiving || destroyed) {
      errorThrow(ERROR_MULTIPLEX_SOCKET);
    }
    if (!isMultipleChannelIdValid(channelId)) {
      errorThrow(ERROR_MULTIPLEX_CHANNEL, channelId);
    }
    if (collHas(channels, channelId)) {
      errorThrow(ERROR_MULTIPLEX_CHANNEL_DUPLICATE, channelId);
    }
    if (collSize(channels) >= MAX_MULTIPLE_CHANNELS) {
      errorThrow(ERROR_SYNC_OVERFLOW, 'channels');
    }
    const channel: Channel = [
      undefined,
      [],
      [],
      false,
      undefined,
      timeoutSeconds,
      onIgnoredError,
      undefined,
      0,
      0,
      0,
      undefined,
      undefined,
    ];
    mapSet(channels, channelId, channel);
    if (webSocket.readyState == webSocket.OPEN) {
      onOpen();
    } else if (webSocket.readyState > webSocket.OPEN) {
      const error = errorNew(ERROR_MULTIPLEX_SOCKET);
      notifyChannelIgnoredError(channel, error);
      connection[2](error);
    }
    try {
      await subscribe(channelId, channel, timeoutSeconds);
    } catch (error) {
      delChannel(channelId);
      throw error;
    }
  };

  const registerReceive = (
    channelId: Id,
    receive: PayloadDecoder,
    fail: (error: Error) => void,
  ) => {
    const channel = mapGet(channels, channelId);
    if (channel) {
      channel[ChannelValue.Receive] = receive;
      channel[ChannelValue.Fail] = fail;
      const incoming = channel[ChannelValue.Incoming];
      let incomingIndex = 0;
      tryFinally(
        () => {
          while (incomingIndex < size(incoming)) {
            const [payload, timeout] = incoming[incomingIndex];
            stopTimeout(timeout);
            const payloadSize = getWebSocketPayloadSize(payload);
            channel[ChannelValue.IncomingSize] -= payloadSize;
            queuedCount--;
            queuedSize -= payloadSize;
            incomingIndex++;
            receive[0](payload);
          }
        },
        () => arrayClear(incoming, incomingIndex),
      );
    }
  };

  const send = (
    channelId: Id,
    payloads: string[],
    coalesce?: () => string[],
  ) => {
    if (!receiving) {
      return;
    }
    const channel = mapGet(channels, channelId);
    if (channel) {
      if (
        connected &&
        webSocket.readyState == webSocket.OPEN &&
        channel[ChannelValue.Subscribed] &&
        !size(channel[ChannelValue.Outgoing]) &&
        !channel[ChannelValue.Dirty]
      ) {
        sendPayloads(channelId, channel, payloads, coalesce);
      } else if (coalesce) {
        channel[ChannelValue.Dirty] = coalesce;
      } else {
        queueOutgoing(channel, payloads);
      }
    }
  };

  const destroyIfEmpty = () => {
    if (collIsEmpty(channels) && !destroyed) {
      destroyed = true;
      const closeWebSocket = receiving && !overflowing;
      receiving = false;
      clearReceives();
      const error = errorNew(ERROR_MULTIPLEX_DESTROYED);
      rejectPendingControls(error);
      if (flushTimeout) {
        stopTimeout(flushTimeout);
        flushTimeout = undefined;
      }
      arrayForEach(removeListeners, (removeListener) =>
        tryReturn(removeListener),
      );
      arrayClear(removeListeners);
      multipleStates.delete(webSocket);
      if (closeWebSocket) {
        tryReturn(() => webSocket.close());
      }
    }
  };

  const delChannel = (channelId: Id) => {
    const channel = mapGet(channels, channelId);
    if (channel) {
      try {
        clearReceive(channel);
        clearIncoming(channel);
        clearOutgoing(channel, true);
        if (
          connected &&
          channel[ChannelValue.SubscribeConnection] === connection
        ) {
          const payload = createMultipleControlPayload(
            null,
            MultipleControl.Unsubscribe,
            channelId,
          );
          const payloadSize = getWebSocketPayloadSize(payload);
          if (
            isWebSocketPayloadTooLarge(payloadSize) ||
            isWebSocketBackpressured(webSocket, payloadSize)
          ) {
            overflow('socket');
          } else {
            webSocket.send(payload);
          }
        }
      } catch (error) {
        notifyChannelIgnoredError(channel, error);
      } finally {
        collDel(channels, channelId);
        destroyIfEmpty();
      }
    }
  };

  return {
    addChannel,
    delChannel,
    destroyIfEmpty,
    invalid,
    payloadBuffer,
    registerReceive,
    send,
  };
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
      const newState = createMultipleState(webSocket);
      multipleStates.set(webSocket, newState);
      return newState;
    })();

  try {
    await state.addChannel(channelId, requestTimeoutSeconds, onIgnoredError);
  } catch (error) {
    if (!existingState) {
      state.destroyIfEmpty();
    }
    throw error;
  }

  try {
    return createCustomSynchronizer(
      store,
      (toClientId, requestId, message, body) =>
        state.send(
          channelId,
          createPayloads(toClientId, requestId, message, body, fragmentSize),
          toClientId == null &&
            (message == CONTENT_HASHES || message == CONTENT_DIFF)
            ? () =>
                createPayloads(
                  null,
                  requestId,
                  CONTENT_HASHES,
                  store.getMergeableContentHashes(),
                  fragmentSize,
                )
            : undefined,
        ),
      (receive: Receive, fail) =>
        state.registerReceive(
          channelId,
          createPayloadReceiver(
            receive,
            requestTimeoutSeconds,
            state.invalid,
            state.payloadBuffer,
          ),
          fail,
        ),
      () => state.delChannel(channelId),
      requestTimeoutSeconds,
      onSend,
      onReceive,
      onIgnoredError,
      {getWebSocket: () => webSocket},
    ) as WsSynchronizer<WebSocketType>;
  } catch (error) {
    state.delChannel(channelId);
    throw error;
  }
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
  let creating = true;
  let overflowing = false;
  let removeTransportListeners = () => {};
  const notifyIgnoredError = (error: any) =>
    tryReturn(() => onIgnoredError?.(error));
  const overflow = () => {
    if (!overflowing) {
      overflowing = true;
      const error = errorNew(ERROR_SYNC_OVERFLOW, 'socket');
      notifyIgnoredError(error);
      webSocket.close(1013, error.message);
    }
  };
  const registerReceive = (receive: Receive, fail: (error: Error) => void) => {
    const invalid = createInvalidPayloadHandler(webSocket, notifyIgnoredError);
    const [receivePayload, clearReceivePayload] = createPayloadReceiver(
      receive,
      requestTimeoutSeconds,
      invalid,
    );
    let removeListeners: (() => void)[] = [];
    removeTransportListeners = () => {
      clearReceivePayload();
      arrayForEach(removeListeners, (removeListener) =>
        tryReturn(removeListener),
      );
      arrayClear(removeListeners);
    };
    const failTransport = () => {
      tryReturn(() => fail(errorNew(ERROR_MULTIPLEX_SOCKET)));
      removeTransportListeners();
    };
    removeListeners = [
      addEventListener(webSocket, MESSAGE, ({data}) =>
        receivePayload(data.toString(UTF8)),
      ),
      addEventListener(webSocket, CLOSE, () => {
        if (!creating) {
          failTransport();
        }
      }),
      addEventListener(webSocket, ERROR, (error) => {
        if (!creating) {
          notifyIgnoredError(error);
          failTransport();
        }
      }),
    ];
  };

  const send = (
    toClientId: IdOrNull,
    ...args: [requestId: IdOrNull, message: MessageType, body: any]
  ): void => {
    arrayForEach(
      createPayloads(toClientId, ...args, fragmentSize),
      (payload) => {
        if (overflowing) {
          return;
        }
        const payloadSize = getWebSocketPayloadSize(payload);
        if (
          isWebSocketPayloadTooLarge(payloadSize) ||
          isWebSocketBackpressured(webSocket, payloadSize)
        ) {
          overflow();
        } else {
          webSocket.send(payload);
        }
      },
    );
  };

  const destroy = (): void => {
    removeTransportListeners();
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
  return promiseNew((resolve, reject) => {
    let removeAttemptListeners = () => {};
    const rejectCreation = (error: Error, ignoredError: any = error) => {
      notifyIgnoredError(ignoredError);
      removeAttemptListeners();
      removeTransportListeners();
      legacyWebSockets.delete(webSocket);
      tryReturn(() => webSocket.close());
      reject(error);
    };
    if (webSocket.readyState != webSocket.OPEN) {
      if (webSocket.readyState > webSocket.OPEN) {
        rejectCreation(errorNew(ERROR_MULTIPLEX_SOCKET));
        return;
      }
      const removeAttemptListenersArray = [
        addEventListener(webSocket, OPEN, () => {
          creating = false;
          removeAttemptListeners();
          resolve(synchronizer);
        }),
        addEventListener(webSocket, ERROR, (error) =>
          rejectCreation(errorNew(ERROR_MULTIPLEX_SOCKET), error),
        ),
        addEventListener(webSocket, CLOSE, () =>
          rejectCreation(errorNew(ERROR_MULTIPLEX_SOCKET)),
        ),
      ];
      removeAttemptListeners = () => {
        arrayForEach(removeAttemptListenersArray, (removeListener) =>
          tryReturn(removeListener),
        );
        arrayClear(removeAttemptListenersArray);
      };
    } else {
      creating = false;
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
