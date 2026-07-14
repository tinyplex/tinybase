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
import {arrayForEach, arrayPush} from '../../common/array.ts';
import {
  collClear,
  collDel,
  collHas,
  collIsEmpty,
  collSize,
  collSize2,
} from '../../common/coll.ts';
import {getListenerFunctions} from '../../common/listeners.ts';
import {
  IdMap,
  IdMap2,
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
  ifNotUndefined,
  isArray,
  isString,
  isUndefined,
  noop,
  promiseAll,
} from '../../common/other.ts';
import {IdSet2} from '../../common/set.ts';
import {
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
  createMultipleControlPayload,
  createMultiplePayload,
  createPayloadReceiver,
  createPayloads,
  createRawPayload,
  ifMultipleControlPayloadValid,
  ifMultiplePayloadValid,
  ifPayloadValid,
  isMultipleChannelIdValid,
} from '../common.ts';
import {createCustomSynchronizer} from '../index.ts';

enum Sc {
  State = 0,
  Persister = 1,
  Synchronizer = 2,
  Send = 3,
  Buffer = 4,
  Then = 5,
}
enum ScState {
  Ready,
  Configured,
  Starting,
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
    state: ScState,
    persister: PathPersister,
    synchronizer: Synchronizer,
    send: (payload: string) => void,
    buffer: [clientId: Id, payload: string][],
    then: (store: MergeableStore) => void,
  ];

  const pathIdListeners: IdSet2 = mapNew();
  const clientIdListeners: IdSet2 = mapNew();
  const clientsByPath: IdMap2<Client> = mapNew();
  const serverClientsByPath: IdMap<ServerClient> = mapNew();
  const configuringByPath: IdMap<Promise<void>> = mapNew();
  const readyByPath: IdMap<Promise<void>> = mapNew();

  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => wsServer,
  );

  const configureServerClient = async (
    serverClient: ServerClient,
    pathId: Id,
  ) =>
    ifNotUndefined(
      await createPersisterForPath?.(pathId),
      (persisterMaybeThen) => {
        serverClient[Sc.State] = 1;
        serverClient[Sc.Persister] = isArray(persisterMaybeThen)
          ? persisterMaybeThen[0]
          : persisterMaybeThen;
        serverClient[Sc.Synchronizer] = createCustomSynchronizer(
          serverClient[Sc.Persister].getStore() as MergeableStore,
          (toClientId, requestId, message, body) =>
            arrayForEach(
              createPayloads(
                toClientId,
                requestId,
                message,
                body,
                fragmentSize,
              ),
              (payload) => handleMessage(pathId, SERVER_CLIENT_ID, payload),
            ),
          (receive: Receive) => {
            serverClient[Sc.Send] = createPayloadReceiver(
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
        serverClient[Sc.Buffer] = [];
        serverClient[Sc.Then] = isArray(persisterMaybeThen)
          ? persisterMaybeThen[1]
          : (_) => 0;
      },
    );

  const startServerClient = async (serverClient: ServerClient) => {
    serverClient[Sc.State] = ScState.Starting;
    await serverClient[Sc.Persister].startAutoLoad();
    await serverClient[Sc.Persister].startAutoSave();
    await serverClient[Sc.Synchronizer].startSync();
    serverClient[Sc.Then](
      serverClient[Sc.Persister].getStore() as MergeableStore,
    );
    serverClient[Sc.State] = ScState.Ready;
  };

  const stopServerClient = async (serverClient: ServerClient) => {
    await serverClient[Sc.Persister]?.destroy();
    await serverClient[Sc.Synchronizer]?.destroy();
  };

  const sendToClient = ([client, channelId]: Client, payload: string) =>
    client.send(
      isUndefined(channelId)
        ? payload
        : createMultiplePayload(channelId, payload),
    );

  const handleMessage = (pathId: Id, clientId: Id, payload: string) => {
    const clients = mapGet(clientsByPath, pathId);
    const serverClient = mapGet(serverClientsByPath, pathId);
    ifPayloadValid(payload, (toClientId, remainder) => {
      const forwardedPayload = createRawPayload(clientId, remainder);
      if (toClientId === EMPTY_STRING) {
        if (clientId !== SERVER_CLIENT_ID) {
          serverClient?.[Sc.Send]?.(forwardedPayload);
        }
        mapForEach(clients, (otherClientId, otherClient) =>
          otherClientId !== clientId
            ? sendToClient(otherClient, forwardedPayload)
            : 0,
        );
      } else if (toClientId === SERVER_CLIENT_ID) {
        serverClient?.[Sc.Send]?.(forwardedPayload);
      } else {
        ifNotUndefined(mapGet(clients, toClientId), (client) =>
          sendToClient(client, forwardedPayload),
        );
      }
    });
  };

  const handleOrBufferMessage = (pathId: Id, clientId: Id, payload: string) => {
    const serverClient = mapGet(serverClientsByPath, pathId);
    if (serverClient?.[Sc.State] == ScState.Ready) {
      handleMessage(pathId, clientId, payload);
    } else if (serverClient) {
      arrayPush(serverClient[Sc.Buffer], [clientId, payload]);
    }
  };

  const addClientToPath = async (
    pathId: Id,
    clientId: Id,
    client: Client,
  ): Promise<{ready: Promise<void> | undefined}> => {
    const clients = mapEnsure(clientsByPath, pathId, mapNew<Id, Client>);
    const serverClient: ServerClient = mapEnsure(
      serverClientsByPath,
      pathId,
      () => [ScState.Ready] as any,
    );
    let configuring = mapGet(configuringByPath, pathId);
    if (!configuring) {
      callListeners(pathIdListeners, undefined, pathId, 1);
      configuring = configureServerClient(serverClient, pathId);
      mapSet(configuringByPath, pathId, configuring);
    }
    await configuring;

    mapSet(clients, clientId, client);
    callListeners(clientIdListeners, [pathId], clientId, 1);

    let ready = mapGet(readyByPath, pathId);
    if (!ready && serverClient[Sc.State] == ScState.Configured) {
      ready = (async () => {
        await startServerClient(serverClient);
        arrayForEach(serverClient[Sc.Buffer], ([fromClientId, payload]) =>
          handleMessage(pathId, fromClientId, payload),
        );
        serverClient[Sc.Buffer] = [];
      })();
      mapSet(readyByPath, pathId, ready);
    }
    return {ready};
  };

  const delClientFromPath = async (pathId: Id, clientId: Id) => {
    const clients = mapGet(clientsByPath, pathId);
    if (collHas(clients, clientId)) {
      collDel(clients, clientId);
      callListeners(clientIdListeners, [pathId], clientId, -1);
      if (collIsEmpty(clients)) {
        await mapGet(readyByPath, pathId);
        await ifNotUndefined(
          mapGet(serverClientsByPath, pathId),
          stopServerClient,
        );
        collDel(readyByPath, pathId);
        collDel(configuringByPath, pathId);
        collDel(serverClientsByPath, pathId);
        collDel(clientsByPath, pathId);
        callListeners(pathIdListeners, undefined, pathId, -1);
      }
    }
  };

  const addLegacyClient = async (
    client: WebSocket,
    clientId: Id,
    pathId: Id,
  ) => {
    const {ready} = await addClientToPath(pathId, clientId, [client]);
    client.on(MESSAGE, (data) =>
      handleOrBufferMessage(pathId, clientId, data.toString(UTF8)),
    );
    client.on('close', () => delClientFromPath(pathId, clientId));
    await ready;
  };

  const addMultipleClient = (
    client: WebSocket,
    clientId: Id,
    basePathId: Id,
  ) => {
    const pathsByChannel: IdMap<Id> = mapNew();
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
          const {ready} = await addClientToPath(pathId, clientId, [
            client,
            body,
          ]);
          mapSet(pathsByChannel, body, pathId);
          await ready;
        }
        sendControl(requestId, control, body);
      } else if (
        negotiated &&
        control == MultipleControl.Unsubscribe &&
        isString(body)
      ) {
        await ifNotUndefined(mapGet(pathsByChannel, body), (pathId) =>
          delClientFromPath(pathId, clientId),
        );
        collDel(pathsByChannel, body);
      }
    };

    client.on(MESSAGE, (data) => {
      const payload = data.toString(UTF8);
      let control: Promise<void> | undefined;
      ifMultipleControlPayloadValid(
        payload,
        (requestId, controlType, body) =>
          (control = handleControl(requestId, controlType, body)),
      );
      control?.catch(onIgnoredError);
      if (negotiated) {
        ifMultiplePayloadValid(payload, (channelId, channelPayload) =>
          ifNotUndefined(mapGet(pathsByChannel, channelId), (pathId) =>
            handleOrBufferMessage(pathId, clientId, channelPayload),
          ),
        );
      }
    });

    client.on('close', () =>
      promiseAll(
        mapMap(pathsByChannel, (pathId) => delClientFromPath(pathId, clientId)),
      ),
    );
  };

  webSocketServer.on('connection', (client, request) =>
    ifNotUndefined(strMatch(request.url, PATH_REGEX), ([, pathId]) =>
      ifNotUndefined(request.headers['sec-websocket-key'], (clientId) => {
        if (client.protocol == WS_SYNCHRONIZER_PROTOCOL) {
          addMultipleClient(client, clientId, pathId);
        } else {
          addLegacyClient(client, clientId, pathId).catch(onIgnoredError);
        }
        if (onIgnoredError) {
          client.on(ERROR, onIgnoredError);
        }
      }),
    ),
  );

  if (onIgnoredError) {
    webSocketServer.on(ERROR, onIgnoredError);
  }

  const getWebSocketServer = () => webSocketServer;

  const getPathIds = (): string[] => mapKeys(clientsByPath);

  const getClientIds = (pathId: Id): Ids =>
    mapKeys(mapGet(clientsByPath, pathId));

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
    paths: collSize(clientsByPath),
    clients: collSize2(clientsByPath),
  });

  const destroy = async () => {
    collClear(clientsByPath);
    await promiseAll(mapMap(serverClientsByPath, stopServerClient));
    webSocketServer.close();
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
