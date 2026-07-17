import type {WebSocket, WebSocketServer} from 'ws';
import type {Id, IdOrNull, Ids} from '../../@types/common/index.d.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import type {Persister, Persists} from '../../@types/persisters/index.d.ts';
import type {
  Receive,
  Synchronizer,
} from '../../@types/synchronizers/index.d.ts';
import type {
  ClientIdsListener,
  PathIdsListener,
  WsServer,
  WsServerStats,
  createWsServer as createWsServerDecl,
} from '../../@types/synchronizers/synchronizer-ws-server/index.d.ts';
import {
  arrayFilter,
  arrayFind,
  arrayFindIndex,
  arrayForEach,
  arrayMap,
  arrayPush,
  arrayReduce,
} from '../../common/array.ts';
import {
  collClear,
  collDel,
  collHas,
  collIsEmpty,
  collSize,
  collValues,
} from '../../common/coll.ts';
import {
  ERROR_SYNC_OVERFLOW,
  errorNew,
  tryCatch,
  tryFinally,
  tryReturn,
} from '../../common/error.ts';
import {getListenerFunctions} from '../../common/listeners.ts';
import {
  IdMap,
  mapEnsure,
  mapForEach,
  mapGet,
  mapKeys,
  mapMap,
  mapNew,
  mapSet,
} from '../../common/map.ts';
import {objFreeze} from '../../common/obj.ts';
import {
  addEmitterListener,
  ifNotUndefined,
  isArray,
  isUndefined,
  noop,
  promiseAll,
  promiseNew,
  size,
  startTimeout,
  stopTimeout,
} from '../../common/other.ts';
import {IdSet2, setAdd, setNew} from '../../common/set.ts';
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
  MAX_WEBSOCKET_BUFFER_SIZE,
  MAX_WEBSOCKET_QUEUE_SIZE,
  SERVER_CLIENT_ID,
  WS_SYNCHRONIZER_PROTOCOL,
  createInvalidPayloadHandler,
  createMultiplePayload,
  createMultipleServerClient,
  createPayloadDecoder,
  createPayloadReceiver,
  createPayloads,
  createRawPayload,
  getPayloadCoalesceKey,
  getWebSocketPayloadSize,
  ifPayloadValid,
  isWebSocketBackpressured,
  isWebSocketPayloadTooLarge,
} from '../common.ts';
import {createCustomSynchronizer} from '../index.ts';

// Positional enums for better minification and performance
enum ServerClient {
  State = 0,
  Persister = 1,
  Synchronizer = 2,
  Send = 3,
  Buffer = 4,
  Then = 5,
  BufferSize = 6,
  BufferTimeout = 7,
}
enum State {
  Configuring,
  Ready,
  Configured,
  Starting,
}
enum Path {
  Clients,
  ServerClient,
  Configuring,
  Ready,
  Stopping,
}

const PATH_REGEX = /\/([^?]*)/;

export const createWsServer = (<
  PathPersister extends Persister<
    Persists.MergeableStoreOnly | Persists.StoreOrMergeableStore
  >,
>(
  webSocketServer: WebSocketServer,
  createPersisterForPath?: (
    pathId: Id,
  ) =>
    | PathPersister
    | [PathPersister, (store: MergeableStore) => void]
    | Promise<PathPersister>
    | Promise<[PathPersister, (store: MergeableStore) => void]>
    | undefined,
  onIgnoredError?: (error: any) => void,
  requestTimeoutSeconds: number = 1,
  fragmentSize?: number,
) => {
  type Client = [webSocket: WebSocket, channelId?: Id];
  type Buffered = [clientId: Id, payload: string, coalesceKey?: string];
  type ServerClient = [
    state: State,
    persister: PathPersister,
    synchronizer: Synchronizer,
    send: (payload: string) => void,
    buffer: Buffered[],
    then: (store: MergeableStore) => void,
    bufferSize: number,
    bufferTimeout?: ReturnType<typeof startTimeout>,
  ];
  type Path = [
    clients: IdMap<Client>,
    serverClient: ServerClient,
    configuring: Promise<void>,
    ready?: Promise<void>,
    stopping?: Promise<void>,
  ];
  type PathClient = [pathId: Id, path: Path];

  const pathIdListeners: IdSet2 = mapNew();
  const clientIdListeners: IdSet2 = mapNew();
  const paths: IdMap<Path> = mapNew();
  const webSockets = setNew<WebSocket>();
  const removeServerListeners: (() => void)[] = [];
  const removeListenersByWebSocket = mapNew<WebSocket, (() => void)[]>();
  let destroying: Promise<void> | undefined;

  const handleError = (error: any): void => {
    tryReturn(() => onIgnoredError?.(error));
  };
  arrayPush(
    removeServerListeners,
    addEmitterListener(webSocketServer, ERROR, handleError),
  );

  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => wsServer,
  );

  const addWebSocketListener = (
    webSocket: WebSocket,
    event: string,
    listener: (...args: any[]) => void,
  ) =>
    arrayPush(
      mapEnsure(removeListenersByWebSocket, webSocket, () => []),
      addEmitterListener(webSocket, event, listener),
    );

  const removeWebSocketListeners = (webSocket: WebSocket) => {
    ifNotUndefined(
      mapGet(removeListenersByWebSocket, webSocket),
      (removeListeners) => arrayForEach(removeListeners, (remove) => remove()),
    );
    collDel(removeListenersByWebSocket, webSocket);
  };

  const configureServerClient = async (path: Path, pathId: Id) => {
    const serverClient = path[Path.ServerClient];
    const persisterMaybeThen = await createPersisterForPath?.(pathId);
    if (isUndefined(persisterMaybeThen)) {
      serverClient[ServerClient.State] = State.Ready;
      return;
    }
    serverClient[ServerClient.State] = State.Configured;
    serverClient[ServerClient.Persister] = isArray(persisterMaybeThen)
      ? persisterMaybeThen[0]
      : persisterMaybeThen;
    serverClient[ServerClient.Synchronizer] = createCustomSynchronizer(
      serverClient[ServerClient.Persister].getStore() as MergeableStore,
      (toClientId, requestId, message, body) =>
        arrayForEach(
          createPayloads(toClientId, requestId, message, body, fragmentSize),
          (payload) => handleMessage(path, SERVER_CLIENT_ID, payload),
        ),
      (receive: Receive) => {
        serverClient[ServerClient.Send] = createPayloadReceiver(
          receive,
          requestTimeoutSeconds,
        );
      },
      noop,
      requestTimeoutSeconds,
      undefined,
      undefined,
      handleError,
    );
    serverClient[ServerClient.Then] = isArray(persisterMaybeThen)
      ? persisterMaybeThen[1]
      : (_) => 0;
  };

  const startServerClient = async (serverClient: ServerClient) => {
    serverClient[ServerClient.State] = State.Starting;
    await serverClient[ServerClient.Persister].startAutoLoad();
    await serverClient[ServerClient.Persister].startAutoSave();
    await serverClient[ServerClient.Synchronizer].startSync();
    serverClient[ServerClient.Then](
      serverClient[ServerClient.Persister].getStore() as MergeableStore,
    );
    serverClient[ServerClient.State] = State.Ready;
  };

  const stopServerClient = async (serverClient: ServerClient) => {
    let errorToThrow: any;
    let failed = false;
    const captureError = (error: any) => {
      if (!failed) {
        errorToThrow = error;
      }
      failed = true;
    };
    await tryCatch(
      () => serverClient[ServerClient.Persister]?.destroy(),
      captureError,
    );
    await tryCatch(
      () => serverClient[ServerClient.Synchronizer]?.destroy(),
      captureError,
    );
    if (failed) {
      throw errorToThrow;
    }
  };

  const overflowClient = (client: WebSocket, details: string) => {
    if (client.readyState == client.OPEN) {
      const error = errorNew(ERROR_SYNC_OVERFLOW, details);
      tryFinally(
        () => handleError(error),
        () => client.close(1013, error.message),
      );
    }
  };

  const sendToClient = ([client, channelId]: Client, payload: string) => {
    const outgoingPayload = isUndefined(channelId)
      ? payload
      : createMultiplePayload(channelId, payload);
    if (
      isWebSocketPayloadTooLarge(outgoingPayload) ||
      isWebSocketBackpressured(client, outgoingPayload)
    ) {
      overflowClient(client, 'socket');
    } else if (client.readyState == client.OPEN) {
      client.send(outgoingPayload);
    }
  };

  const clearServerBuffer = (serverClient: ServerClient) => {
    if (serverClient[ServerClient.BufferTimeout]) {
      stopTimeout(serverClient[ServerClient.BufferTimeout]);
      serverClient[ServerClient.BufferTimeout] = undefined;
    }
    serverClient[ServerClient.Buffer] = [];
    serverClient[ServerClient.BufferSize] = 0;
  };

  const delBufferedClient = (serverClient: ServerClient, clientId: Id) => {
    serverClient[ServerClient.Buffer] = arrayFilter(
      serverClient[ServerClient.Buffer],
      ([bufferedClientId]) => bufferedClientId != clientId,
    );
    serverClient[ServerClient.BufferSize] = arrayReduce(
      serverClient[ServerClient.Buffer],
      (total, [, payload]) => total + getWebSocketPayloadSize(payload),
      0,
    );
    if (!size(serverClient[ServerClient.Buffer])) {
      clearServerBuffer(serverClient);
    }
  };

  const expireServerBuffer = (path: Path) => {
    const serverClient = path[Path.ServerClient];
    const clients = setNew<WebSocket>();
    arrayForEach(serverClient[ServerClient.Buffer], ([clientId]) =>
      ifNotUndefined(mapGet(path[Path.Clients], clientId), ([client]) =>
        setAdd(clients, client),
      ),
    );
    clearServerBuffer(serverClient);
    arrayForEach(collValues(clients), (client) =>
      overflowClient(client, 'server'),
    );
  };

  const bufferMessage = (path: Path, clientId: Id, payload: string) => {
    const serverClient = path[Path.ServerClient];
    const buffer = serverClient[ServerClient.Buffer];
    const coalesceKey = getPayloadCoalesceKey(clientId, payload);
    const coalesceIndex = coalesceKey
      ? arrayFindIndex(
          buffer,
          ([, , bufferedKey]) => bufferedKey == coalesceKey,
        )
      : -1;
    const replacedSize =
      coalesceIndex > -1
        ? getWebSocketPayloadSize(buffer[coalesceIndex][1])
        : 0;
    const payloadSize = getWebSocketPayloadSize(payload);
    if (
      (coalesceIndex < 0 && size(buffer) >= MAX_WEBSOCKET_QUEUE_SIZE) ||
      serverClient[ServerClient.BufferSize] + payloadSize - replacedSize >
        MAX_WEBSOCKET_BUFFER_SIZE
    ) {
      delBufferedClient(serverClient, clientId);
      ifNotUndefined(mapGet(path[Path.Clients], clientId), ([client]) =>
        overflowClient(client, 'server'),
      );
      return;
    }
    const buffered: Buffered = [clientId, payload, coalesceKey];
    if (coalesceIndex > -1) {
      buffer[coalesceIndex] = buffered;
    } else {
      arrayPush(buffer, buffered);
    }
    serverClient[ServerClient.BufferSize] += payloadSize - replacedSize;
    serverClient[ServerClient.BufferTimeout] ??= startTimeout(
      () => expireServerBuffer(path),
      requestTimeoutSeconds * 10,
    );
  };

  const handleMessage = (path: Path, clientId: Id, payload: string) => {
    const clients = path[Path.Clients];
    const serverClient = path[Path.ServerClient];
    ifPayloadValid(payload, (toClientId, remainder) => {
      const forwardedPayload = createRawPayload(clientId, remainder);
      if (toClientId === EMPTY_STRING) {
        if (clientId !== SERVER_CLIENT_ID) {
          serverClient?.[ServerClient.Send]?.(forwardedPayload);
        }
        mapForEach(clients, (otherClientId, otherClient) =>
          otherClientId !== clientId
            ? sendToClient(otherClient, forwardedPayload)
            : 0,
        );
      } else if (toClientId === SERVER_CLIENT_ID) {
        serverClient?.[ServerClient.Send]?.(forwardedPayload);
      } else {
        ifNotUndefined(mapGet(clients, toClientId), (client) =>
          sendToClient(client, forwardedPayload),
        );
      }
    });
  };

  const handleOrBufferMessage = (path: Path, clientId: Id, payload: string) => {
    const serverClient = path[Path.ServerClient];
    if (
      !path[Path.Stopping] &&
      collHas(path[Path.Clients], clientId) &&
      serverClient[ServerClient.State] == State.Ready
    ) {
      handleMessage(path, clientId, payload);
    } else if (!path[Path.Stopping] && collHas(path[Path.Clients], clientId)) {
      bufferMessage(path, clientId, payload);
    }
  };

  const handleDecodedMessage = (
    path: Path,
    clientId: Id,
    toClientId: Id,
    remainders: string[],
  ) =>
    arrayForEach(remainders, (remainder) =>
      handleOrBufferMessage(
        path,
        clientId,
        createRawPayload(toClientId, remainder),
      ),
    );

  const stopPath = (pathId: Id, path: Path): Promise<void> => {
    if (!path[Path.Stopping]) {
      path[Path.Stopping] = (async () => {
        let errorToThrow: any;
        let failed = false;
        await tryCatch(() => path[Path.Configuring]);
        await tryCatch(() => path[Path.Ready]);
        clearServerBuffer(path[Path.ServerClient]);
        await tryCatch(
          () => stopServerClient(path[Path.ServerClient]),
          (error) => {
            errorToThrow = error;
            failed = true;
          },
        );
        collClear(path[Path.Clients]);
        if (mapGet(paths, pathId) === path) {
          collDel(paths, pathId);
          callListeners(pathIdListeners, undefined, pathId, -1);
        }
        if (failed) {
          throw errorToThrow;
        }
      })();
    }
    return path[Path.Stopping];
  };

  const createPath = (pathId: Id, replacing: boolean): Path => {
    const path = [
      mapNew(),
      [State.Configuring, undefined, undefined, undefined, [], undefined, 0],
    ] as unknown as Path;
    mapSet(paths, pathId, path);
    if (!replacing) {
      callListeners(pathIdListeners, undefined, pathId, 1);
    }
    path[Path.Configuring] = configureServerClient(path, pathId);
    return path;
  };

  const startPath = (path: Path): Promise<void> | undefined => {
    const serverClient = path[Path.ServerClient];
    if (!path[Path.Ready]) {
      path[Path.Ready] = (async () => {
        if (serverClient[ServerClient.State] == State.Configured) {
          await startServerClient(serverClient);
        }
        const buffer = serverClient[ServerClient.Buffer];
        clearServerBuffer(serverClient);
        arrayForEach(buffer, ([fromClientId, payload]) =>
          handleMessage(path, fromClientId, payload),
        );
      })();
    }
    return path[Path.Ready];
  };

  const delClientFromPath = async (pathId: Id, path: Path, clientId: Id) => {
    const clients = path[Path.Clients];
    if (collHas(clients, clientId)) {
      delBufferedClient(path[Path.ServerClient], clientId);
      collDel(clients, clientId);
      callListeners(clientIdListeners, [pathId], clientId, -1);
      if (collIsEmpty(clients)) {
        await stopPath(pathId, path);
      }
    }
  };

  const addClientToPath = (
    pathId: Id,
    clientId: Id,
    client: Client,
  ): [Path, Promise<void>] => {
    const existingPath = mapGet(paths, pathId);
    const path =
      !existingPath || existingPath[Path.Stopping]
        ? createPath(pathId, !!existingPath)
        : existingPath;
    mapSet(path[Path.Clients], clientId, client);
    callListeners(clientIdListeners, [pathId], clientId, 1);
    return [
      path,
      (async () => {
        let errorToThrow: any;
        let failed = false;
        await tryCatch(
          async () => {
            await path[Path.Configuring];
            if (collHas(path[Path.Clients], clientId) && !path[Path.Stopping]) {
              await startPath(path);
            }
          },
          (error) => {
            errorToThrow = error;
            failed = true;
          },
        );
        if (failed) {
          await tryCatch(
            () => delClientFromPath(pathId, path, clientId),
            handleError,
          );
          throw errorToThrow;
        }
      })(),
    ];
  };

  const addLegacyClient = async (
    client: WebSocket,
    clientId: Id,
    pathId: Id,
  ) => {
    const [path, ready] = addClientToPath(pathId, clientId, [client]);
    const decode = createPayloadDecoder(
      (toClientId, remainders) =>
        handleDecodedMessage(path, clientId, toClientId, remainders),
      requestTimeoutSeconds,
      createInvalidPayloadHandler(client, handleError),
    );
    addWebSocketListener(client, MESSAGE, (data) =>
      decode(data.toString(UTF8)),
    );
    addWebSocketListener(client, CLOSE, () =>
      delClientFromPath(pathId, path, clientId).catch(handleError),
    );
    await ready;
  };

  const addMultipleClient = (
    client: WebSocket,
    clientId: Id,
    basePathId: Id,
  ) => {
    const invalid = createInvalidPayloadHandler(client, handleError);
    const [handlePayload, destroy] = createMultipleServerClient<PathClient>(
      basePathId,
      (pathId, channelId) => {
        const [path, ready] = addClientToPath(pathId, clientId, [
          client,
          channelId,
        ]);
        return [[pathId, path], ready];
      },
      ([pathId, path]) => delClientFromPath(pathId, path, clientId),
      ([, path], toClientId, remainders) =>
        handleDecodedMessage(path, clientId, toClientId, remainders),
      (payload) => {
        if (
          isWebSocketPayloadTooLarge(payload) ||
          isWebSocketBackpressured(client, payload)
        ) {
          overflowClient(client, 'socket');
        } else if (client.readyState == client.OPEN) {
          client.send(payload);
        }
      },
      requestTimeoutSeconds,
      invalid,
      handleError,
    );

    addWebSocketListener(client, MESSAGE, (data) =>
      handlePayload(data.toString(UTF8)),
    );

    addWebSocketListener(client, CLOSE, () => destroy().catch(handleError));
  };

  const removeConnectionListener = addEmitterListener(
    webSocketServer,
    CONNECTION,
    (client, request) => {
      setAdd(webSockets, client);
      addWebSocketListener(client, ERROR, handleError);
      if (destroying) {
        client.close();
      } else {
        ifNotUndefined(strMatch(request.url, PATH_REGEX), ([, pathId]) =>
          ifNotUndefined(request.headers['sec-websocket-key'], (clientId) => {
            if (client.protocol == WS_SYNCHRONIZER_PROTOCOL) {
              addMultipleClient(client, clientId, pathId);
            } else {
              addLegacyClient(client, clientId, pathId).catch(handleError);
            }
          }),
        );
      }
      addWebSocketListener(client, CLOSE, () => {
        collDel(webSockets, client);
        removeWebSocketListeners(client);
      });
    },
  );
  arrayPush(removeServerListeners, removeConnectionListener);

  const getWebSocketServer = () => webSocketServer;

  const getPathIds = (): string[] => mapKeys(paths);

  const getClientIds = (pathId: Id): Ids =>
    mapKeys(mapGet(paths, pathId)?.[Path.Clients]);

  const addPathIdsListener = (listener: PathIdsListener) =>
    addListener(listener, pathIdListeners);

  const addClientIdsListener = (
    pathId: IdOrNull,
    listener: ClientIdsListener,
  ) => addListener(listener, clientIdListeners, [pathId]);

  const delListener = (listenerId: Id): WsServer => {
    delListenerImpl(listenerId);
    return wsServer;
  };

  const getStats = (): WsServerStats => ({
    paths: collSize(paths),
    clients: arrayReduce(
      mapMap(paths, (path) => collSize(path[Path.Clients])),
      (total, pathSize) => total + pathSize,
      0,
    ),
  });

  const closeWebSocket = async (client: WebSocket) => {
    if (client.readyState != client.CLOSED) {
      await promiseNew<void>((resolve, reject) => {
        const removeCloseListener = addEmitterListener(client, CLOSE, () => {
          removeCloseListener();
          resolve();
        });
        try {
          client.close();
        } catch (error) {
          removeCloseListener();
          reject(error);
        }
      });
    }
  };

  const closeWebSocketServer = async () => {
    const close = async (
      action: () => void | Promise<void>,
    ): Promise<[failed: boolean, error: any]> => {
      let failure: [boolean, any] = [false, undefined];
      await tryCatch(action, (error) => (failure = [true, error]));
      return failure;
    };
    const failures = await promiseAll([
      close(() =>
        promiseNew<void>((resolve, reject) =>
          webSocketServer.close((error) => (error ? reject(error) : resolve())),
        ),
      ),
      ...arrayMap(collValues(webSockets), (client) =>
        close(() => closeWebSocket(client)),
      ),
    ]);
    const failure = arrayFind(failures, ([failed]) => failed);
    if (failure) {
      throw failure[1];
    }
  };

  const destroy = (): Promise<void> => {
    if (!destroying) {
      destroying = (async () => {
        tryReturn(removeConnectionListener);
        let serverFailure: [boolean, any] = [false, undefined];
        const serverClosing = tryCatch(
          closeWebSocketServer,
          (error) => (serverFailure = [true, error]),
        );
        const pathFailures = await promiseAll(
          mapMap(paths, async (path, pathId) => {
            let failure: [boolean, any] = [false, undefined];
            await tryCatch(
              () => stopPath(pathId, path),
              (error) => (failure = [true, error]),
            );
            return failure;
          }),
        );
        await serverClosing;
        arrayForEach(removeServerListeners, (remove) => tryReturn(remove));
        mapForEach(removeListenersByWebSocket, (_webSocket, removers) =>
          arrayForEach(removers, (remove) => tryReturn(remove)),
        );
        collClear(removeListenersByWebSocket);
        collClear(paths);
        collClear(webSockets);
        const failure = serverFailure[0]
          ? serverFailure
          : arrayFind(pathFailures, ([failed]) => failed);
        if (failure) {
          throw failure[1];
        }
      })();
    }
    return destroying;
  };

  const wsServer = {
    getWebSocketServer,
    getPathIds,
    getClientIds,
    addPathIdsListener,
    addClientIdsListener,
    delListener,
    getStats,
    destroy,
  };

  return objFreeze(wsServer as WsServer);
}) as typeof createWsServerDecl;
