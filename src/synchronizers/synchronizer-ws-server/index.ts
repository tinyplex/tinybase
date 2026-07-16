import {WebSocket, WebSocketServer} from 'ws';
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
import {ERROR_SYNC_MESSAGE, errorNew, tryCatch} from '../../common/error.ts';
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
  isString,
  isUndefined,
  noop,
  promiseAll,
  promiseNew,
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
  MULTIPLE_VERSION,
  MultipleControl,
  SERVER_CLIENT_ID,
  WS_SYNCHRONIZER_PROTOCOL,
  createInvalidPayloadHandler,
  createMultipleControlPayload,
  createMultiplePayload,
  createPayloadDecoder,
  createPayloadReceiver,
  createPayloads,
  createRawPayload,
  ifMultipleControlPayloadValid,
  ifMultiplePayloadValid,
  ifPayloadValid,
  isMultipleChannelIdValid,
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
  type ServerClient = [
    state: State,
    persister: PathPersister,
    synchronizer: Synchronizer,
    send: (payload: string) => void,
    buffer: [clientId: Id, payload: string][],
    then: (store: MergeableStore) => void,
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
      onIgnoredError,
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

  const sendToClient = ([client, channelId]: Client, payload: string) =>
    client.send(
      isUndefined(channelId)
        ? payload
        : createMultiplePayload(channelId, payload),
    );

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
      arrayPush(serverClient[ServerClient.Buffer], [clientId, payload]);
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
      [State.Configuring, undefined, undefined, undefined, []],
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
        arrayForEach(
          serverClient[ServerClient.Buffer],
          ([fromClientId, payload]) =>
            handleMessage(path, fromClientId, payload),
        );
        serverClient[ServerClient.Buffer] = [];
      })();
    }
    return path[Path.Ready];
  };

  const delClientFromPath = async (pathId: Id, path: Path, clientId: Id) => {
    const clients = path[Path.Clients];
    if (collHas(clients, clientId)) {
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
            onIgnoredError,
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
      createInvalidPayloadHandler(client, onIgnoredError),
    );
    addWebSocketListener(client, MESSAGE, (data) =>
      decode(data.toString(UTF8)),
    );
    addWebSocketListener(client, CLOSE, () =>
      delClientFromPath(pathId, path, clientId).catch((error) =>
        onIgnoredError?.(error),
      ),
    );
    await ready;
  };

  const addMultipleClient = (
    client: WebSocket,
    clientId: Id,
    basePathId: Id,
  ) => {
    const pathsByChannel: IdMap<PathClient> = mapNew();
    const decodersByChannel: IdMap<(payload: string) => void> = mapNew();
    const invalid = createInvalidPayloadHandler(client, onIgnoredError);
    let negotiated = false;

    const sendControl = (
      requestId: IdOrNull,
      control: MultipleControl,
      body: any,
    ) => client.send(createMultipleControlPayload(requestId, control, body));

    const handleControl = async (
      requestId: IdOrNull,
      control: MultipleControl,
      body: any,
    ) => {
      if (
        control == MultipleControl.Hello &&
        body == MULTIPLE_VERSION &&
        requestId
      ) {
        negotiated = true;
        sendControl(requestId, control, body);
      } else if (
        negotiated &&
        control == MultipleControl.Subscribe &&
        isString(body) &&
        isMultipleChannelIdValid(body) &&
        requestId
      ) {
        const pathId = basePathId + (basePathId ? '/' : EMPTY_STRING) + body;
        if (!collHas(pathsByChannel, body)) {
          const [path, ready] = addClientToPath(pathId, clientId, [
            client,
            body,
          ]);
          mapSet(pathsByChannel, body, [pathId, path]);
          await tryCatch(
            () => ready,
            (error) => {
              collDel(pathsByChannel, body);
              collDel(decodersByChannel, body);
              throw error;
            },
          );
        }
        sendControl(requestId, control, body);
      } else if (
        negotiated &&
        control == MultipleControl.Unsubscribe &&
        isString(body)
      ) {
        await ifNotUndefined(mapGet(pathsByChannel, body), ([pathId, path]) =>
          delClientFromPath(pathId, path, clientId),
        );
        collDel(pathsByChannel, body);
        collDel(decodersByChannel, body);
      }
    };

    addWebSocketListener(client, MESSAGE, (data) => {
      const payload = data.toString(UTF8);
      let controlPromise: Promise<void> | undefined;
      const control = ifMultipleControlPayloadValid(
        payload,
        (requestId, controlType, body) =>
          (controlPromise = handleControl(requestId, controlType, body)),
      );
      controlPromise?.catch((error) => onIgnoredError?.(error));
      const channel = ifMultiplePayloadValid(
        payload,
        (channelId, channelPayload) => {
          const pathClient = negotiated
            ? mapGet(pathsByChannel, channelId)
            : undefined;
          if (isUndefined(pathClient)) {
            invalid(errorNew(ERROR_SYNC_MESSAGE));
          } else {
            const [, path] = pathClient;
            mapEnsure(decodersByChannel, channelId, () =>
              createPayloadDecoder(
                (toClientId, remainders) =>
                  handleDecodedMessage(path, clientId, toClientId, remainders),
                requestTimeoutSeconds,
                invalid,
              ),
            )(channelPayload);
          }
        },
      );
      if (!control && !channel) {
        invalid(errorNew(ERROR_SYNC_MESSAGE));
      }
    });

    addWebSocketListener(client, CLOSE, () =>
      promiseAll(
        mapMap(pathsByChannel, ([pathId, path]) =>
          delClientFromPath(pathId, path, clientId),
        ),
      ).catch((error) => onIgnoredError?.(error)),
    );
  };

  arrayPush(
    removeServerListeners,
    addEmitterListener(webSocketServer, CONNECTION, (client, request) => {
      setAdd(webSockets, client);
      if (destroying) {
        client.close();
      } else {
        ifNotUndefined(strMatch(request.url, PATH_REGEX), ([, pathId]) =>
          ifNotUndefined(request.headers['sec-websocket-key'], (clientId) => {
            if (client.protocol == WS_SYNCHRONIZER_PROTOCOL) {
              addMultipleClient(client, clientId, pathId);
            } else {
              addLegacyClient(client, clientId, pathId).catch((error) =>
                onIgnoredError?.(error),
              );
            }
            if (onIgnoredError) {
              addWebSocketListener(client, ERROR, onIgnoredError);
            }
          }),
        );
      }
      addWebSocketListener(client, CLOSE, () => {
        collDel(webSockets, client);
        removeWebSocketListeners(client);
      });
    }),
  );

  if (onIgnoredError) {
    arrayPush(
      removeServerListeners,
      addEmitterListener(webSocketServer, ERROR, onIgnoredError),
    );
  }

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
    if (client.readyState != WebSocket.CLOSED) {
      await promiseNew<void>((resolve) => {
        const removeCloseListener = addEmitterListener(client, CLOSE, () => {
          removeCloseListener();
          resolve();
        });
        client.close();
      });
    }
  };

  const closeWebSocketServer = async () => {
    const clientsClosing = arrayMap(collValues(webSockets), closeWebSocket);
    const serverClosing = promiseNew<void>((resolve) => {
      webSocketServer.close(() => resolve());
    });
    await promiseAll([serverClosing, ...clientsClosing]);
  };

  const destroy = (): Promise<void> => {
    if (!destroying) {
      destroying = (async () => {
        const serverClosing = closeWebSocketServer();
        let errorToThrow: any;
        let failed = false;
        await tryCatch(
          () =>
            promiseAll(mapMap(paths, (path, pathId) => stopPath(pathId, path))),
          (error) => {
            errorToThrow = error;
            failed = true;
          },
        );
        await serverClosing;
        arrayForEach(removeServerListeners, (remove) => remove());
        mapForEach(removeListenersByWebSocket, (_webSocket, removers) =>
          arrayForEach(removers, (remove) => remove()),
        );
        collClear(removeListenersByWebSocket);
        collClear(paths);
        collClear(webSockets);
        if (failed) {
          throw errorToThrow;
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
