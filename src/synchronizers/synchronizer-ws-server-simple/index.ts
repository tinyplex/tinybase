import {WebSocket, WebSocketServer} from 'ws';
import type {Id} from '../../@types/common/index.d.ts';
import type {
  WsServerSimple,
  createWsServerSimple as createWsServerSimpleDecl,
} from '../../@types/synchronizers/synchronizer-ws-server-simple/index.d.ts';
import {arrayForEach, arrayMap, arrayPush} from '../../common/array.ts';
import {collClear, collDel, collHas, collIsEmpty} from '../../common/coll.ts';
import {
  ERROR_SYNC_OVERFLOW,
  errorNew,
  tryFinallyAsync,
  tryReturn,
} from '../../common/error.ts';
import {
  IdMap2,
  mapEnsure,
  mapForEach,
  mapGet,
  mapKeys,
  mapNew,
  mapSet,
} from '../../common/map.ts';
import {objFreeze} from '../../common/obj.ts';
import {
  addEmitterListener,
  ifNotUndefined,
  isUndefined,
  noop,
  promiseAll,
  promiseNew,
} from '../../common/other.ts';
import {
  CLOSE,
  CONNECTION,
  EMPTY_STRING,
  ERROR,
  MESSAGE,
  UTF8,
  strMatch,
} from '../../common/strings.ts';
import {
  WS_SYNCHRONIZER_PROTOCOL,
  createInvalidPayloadHandler,
  createMultiplePayload,
  createMultipleServerClient,
  createPayloadDecoder,
  createRawPayload,
  ifPayloadValid,
  isWebSocketBackpressured,
  isWebSocketPayloadTooLarge,
} from '../common.ts';

const PATH_REGEX = /\/([^?]*)/;

export const createWsServerSimple = ((webSocketServer: WebSocketServer) => {
  type Client = [webSocket: WebSocket, channelId?: Id];
  type WebSocketState = [
    removeListeners: (() => void)[],
    destroy?: () => void | Promise<any>,
    destroying?: Promise<void>,
  ];

  const clientsByPath: IdMap2<Client> = mapNew();
  const webSocketStates = mapNew<WebSocket, WebSocketState>();
  const removeServerListeners: (() => void)[] = [];
  let destroying: Promise<void> | undefined;

  arrayPush(
    removeServerListeners,
    addEmitterListener(webSocketServer, ERROR, noop),
  );

  const addWebSocketListener = (
    webSocket: WebSocket,
    event: string,
    listener: (...args: any[]) => void,
  ) =>
    arrayPush(
      mapEnsure(webSocketStates, webSocket, (): WebSocketState => [[]])[0],
      addEmitterListener(webSocket, event, listener),
    );

  const destroyWebSocket = (webSocket: WebSocket): Promise<void> => {
    const state = mapGet(webSocketStates, webSocket)!;
    return (
      state[2] ??
      (state[2] = tryFinallyAsync(
        async () => state[1]?.(),
        () => {
          arrayForEach(state[0], (remove) => tryReturn(remove));
          collDel(webSocketStates, webSocket);
        },
      ))
    );
  };

  const overflowClient = (client: WebSocket) => {
    if (client.readyState == client.OPEN) {
      const error = errorNew(ERROR_SYNC_OVERFLOW, 'socket');
      client.close(1013, error.message);
    }
  };

  const sendPayload = (client: WebSocket, payload: string) => {
    if (
      isWebSocketPayloadTooLarge(payload) ||
      isWebSocketBackpressured(client, payload)
    ) {
      overflowClient(client);
    } else if (client.readyState == client.OPEN) {
      client.send(payload);
    }
  };

  const sendToClient = ([client, channelId]: Client, payload: string) =>
    sendPayload(
      client,
      isUndefined(channelId)
        ? payload
        : createMultiplePayload(channelId, payload),
    );

  const handleMessage = (pathId: Id, clientId: Id, payload: string) =>
    ifPayloadValid(payload, (toClientId, remainder) => {
      const clients = mapGet(clientsByPath, pathId);
      const forwardedPayload = createRawPayload(clientId, remainder);
      if (toClientId === EMPTY_STRING) {
        mapForEach(clients, (otherClientId, otherClient) =>
          otherClientId !== clientId
            ? sendToClient(otherClient, forwardedPayload)
            : 0,
        );
      } else {
        ifNotUndefined(mapGet(clients, toClientId), (client) =>
          sendToClient(client, forwardedPayload),
        );
      }
    });

  const handleDecodedMessage = (
    pathId: Id,
    clientId: Id,
    toClientId: Id,
    remainders: string[],
  ) =>
    arrayForEach(remainders, (remainder) =>
      handleMessage(pathId, clientId, createRawPayload(toClientId, remainder)),
    );

  const addClientToPath = (pathId: Id, clientId: Id, client: Client) =>
    mapSet(
      mapEnsure(clientsByPath, pathId, mapNew<Id, Client>),
      clientId,
      client,
    );

  const delClientFromPath = (pathId: Id, clientId: Id) => {
    const clients = mapGet(clientsByPath, pathId);
    if (collHas(clients, clientId)) {
      collDel(clients, clientId);
      if (collIsEmpty(clients)) {
        collDel(clientsByPath, pathId);
      }
    }
  };

  const addLegacyClient = (client: WebSocket, clientId: Id, pathId: Id) => {
    addClientToPath(pathId, clientId, [client]);
    const decode = createPayloadDecoder(
      (toClientId, remainders) =>
        handleDecodedMessage(pathId, clientId, toClientId, remainders),
      1,
      createInvalidPayloadHandler(client),
    );
    addWebSocketListener(client, MESSAGE, (data) =>
      decode(data.toString(UTF8)),
    );
    mapGet(webSocketStates, client)![1] = () =>
      delClientFromPath(pathId, clientId);
  };

  const addMultipleClient = (
    client: WebSocket,
    clientId: Id,
    basePathId: Id,
  ) => {
    const invalid = createInvalidPayloadHandler(client);
    const [handlePayload, destroy] = createMultipleServerClient<Id>(
      basePathId,
      (pathId, channelId) => {
        addClientToPath(pathId, clientId, [client, channelId]);
        return [pathId];
      },
      (pathId) => delClientFromPath(pathId, clientId),
      (pathId, toClientId, remainders) =>
        handleDecodedMessage(pathId, clientId, toClientId, remainders),
      (payload) => sendPayload(client, payload),
      1,
      invalid,
    );
    addWebSocketListener(client, MESSAGE, (data) =>
      handlePayload(data.toString(UTF8)),
    );
    mapGet(webSocketStates, client)![1] = destroy;
  };

  const removeConnectionListener = addEmitterListener(
    webSocketServer,
    CONNECTION,
    (client, request) => {
      mapSet(webSocketStates, client, [[]]);
      addWebSocketListener(client, ERROR, noop);
      addWebSocketListener(client, CLOSE, () =>
        destroyWebSocket(client).catch(noop),
      );
      ifNotUndefined(strMatch(request.url, PATH_REGEX), ([, pathId]) =>
        ifNotUndefined(request.headers['sec-websocket-key'], (clientId) =>
          client.protocol == WS_SYNCHRONIZER_PROTOCOL
            ? addMultipleClient(client, clientId, pathId)
            : addLegacyClient(client, clientId, pathId),
        ),
      );
    },
  );
  arrayPush(removeServerListeners, removeConnectionListener);

  const getWebSocketServer = () => webSocketServer;

  const closeWebSocket = (client: WebSocket): Promise<void> => {
    const state = mapGet(webSocketStates, client)!;
    const finishDestroy = () => state[2] ?? destroyWebSocket(client);
    return client.readyState == client.CLOSED
      ? finishDestroy()
      : tryFinallyAsync(
          () =>
            promiseNew<void>((resolve, reject) => {
              const removeCloseListener = addEmitterListener(
                client,
                CLOSE,
                () => {
                  removeCloseListener();
                  resolve();
                },
              );
              try {
                client.close();
              } catch (error) {
                removeCloseListener();
                reject(error);
              }
            }),
          finishDestroy,
        );
  };

  const closeWebSocketServer = async () => {
    let errorToThrow: any;
    let failed = false;
    const close = async (action: () => void | Promise<void>) => {
      try {
        await action();
      } catch (error) {
        if (!failed) {
          errorToThrow = error;
        }
        failed = true;
      }
    };
    await promiseAll([
      close(() =>
        promiseNew<void>((resolve, reject) =>
          webSocketServer.close((error) =>
            isUndefined(error) ? resolve() : reject(error),
          ),
        ),
      ),
      ...arrayMap(mapKeys(webSocketStates), (client) =>
        close(() => closeWebSocket(client)),
      ),
    ]);
    if (failed) {
      throw errorToThrow;
    }
  };

  const destroy = (): Promise<void> => {
    if (!destroying) {
      tryReturn(removeConnectionListener);
      destroying = tryFinallyAsync(closeWebSocketServer, () => {
        arrayForEach(removeServerListeners, (remove) => tryReturn(remove));
        mapForEach(webSocketStates, (_webSocket, [removeListeners]) =>
          arrayForEach(removeListeners, (remove) => tryReturn(remove)),
        );
        collClear(clientsByPath);
        collClear(webSocketStates);
      });
    }
    return destroying;
  };

  const wsServerSimple = {
    getWebSocketServer,
    destroy,
  };

  return objFreeze(wsServerSimple as WsServerSimple);
}) as typeof createWsServerSimpleDecl;
