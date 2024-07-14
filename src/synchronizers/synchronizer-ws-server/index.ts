import type {
  ClientIdsListener,
  PathIdsListener,
  WsServer,
  WsServerStats,
  createWsServer as createWsServerDecl,
} from '../../@types/synchronizers/synchronizer-ws-server/index.d.ts';
import {EMPTY_STRING, UTF8} from '../../common/strings.ts';
import type {Id, IdOrNull, Ids} from '../../@types/common/index.d.ts';
import {
  IdMap,
  IdMap2,
  mapEnsure,
  mapForEach,
  mapGet,
  mapKeys,
  mapNew,
  mapSet,
} from '../../common/map.ts';
import type {Persister, Persists} from '../../@types/persisters/index.d.ts';
import type {
  Receive,
  Synchronizer,
} from '../../@types/synchronizers/index.d.ts';
import {WebSocket, WebSocketServer} from 'ws';
import {
  collClear,
  collDel,
  collIsEmpty,
  collSize,
  collSize2,
} from '../../common/coll.ts';
import {
  createPayload,
  createRawPayload,
  ifPayloadValid,
  receivePayload,
} from '../common.ts';
import {IdSet2} from '../../common/set.ts';
import type {MergeableStore} from '../../@types/mergeable-store/index.d.ts';
import {createCustomSynchronizer} from '../index.ts';
import {getListenerFunctions} from '../../common/listeners.ts';
import {ifNotUndefined} from '../../common/other.ts';
import {objFreeze} from '../../common/obj.ts';

const PATH_REGEX = /\/([^?]*)/;
const SERVER_CLIENT_ID = 'S';

export const createWsServer = (<
  PathPersister extends Persister<
    Persists.MergeableStoreOnly | Persists.StoreOrMergeableStore
  >,
>(
  webSocketServer: WebSocketServer,
  createPersisterForPath?: (pathId: Id) => PathPersister | undefined,
) => {
  type ServerClient = {
    persister: PathPersister;
    synchronizer: Synchronizer;
    send: (payload: string) => void;
  };

  const pathIdListeners: IdSet2 = mapNew();
  const clientIdListeners: IdSet2 = mapNew();
  const clientsByPath: IdMap2<WebSocket> = mapNew();
  const serverClientsByPath: IdMap<ServerClient> = mapNew();

  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => wsServer,
  );

  const createServerClient = (pathId: Id) =>
    ifNotUndefined(createPersisterForPath?.(pathId), (persister) => {
      const serverClient = mapEnsure(
        serverClientsByPath,
        pathId,
        () => ({persister}) as ServerClient,
      );
      const messageHandler = getMessageHandler(SERVER_CLIENT_ID, pathId);
      serverClient.synchronizer = createCustomSynchronizer(
        persister.getStore() as MergeableStore,
        (toClientId, requestId, message, body) =>
          messageHandler(createPayload(toClientId, requestId, message, body)),
        (receive: Receive) =>
          (serverClient.send = (payload) => receivePayload(payload, receive)),
        () => {},
        1,
      );
    });

  const startServerClient = async (pathId: Id) =>
    await ifNotUndefined(
      mapGet(serverClientsByPath, pathId),
      async ({persister, synchronizer}) => {
        await persister.schedule(
          persister.startAutoLoad,
          persister.startAutoSave,
          synchronizer.startSync,
        );
      },
    );

  const stopServerClient = (pathId: Id) =>
    ifNotUndefined(
      mapGet(serverClientsByPath, pathId),
      ({persister, synchronizer}) => {
        synchronizer?.destroy();
        persister?.destroy();
        collDel(serverClientsByPath, pathId);
      },
    );

  const getMessageHandler = (clientId: Id, pathId: Id) => {
    const clients = mapGet(clientsByPath, pathId);
    const serverClient = mapGet(serverClientsByPath, pathId);
    const handler = (payload: string) =>
      ifPayloadValid(payload, (toClientId, remainder) => {
        const forwardedPayload = createRawPayload(clientId, remainder);
        if (toClientId === EMPTY_STRING) {
          clientId !== SERVER_CLIENT_ID
            ? serverClient?.send(forwardedPayload)
            : 0;
          mapForEach(clients, (otherClientId, otherWebSocket) =>
            otherClientId !== clientId
              ? otherWebSocket.send(forwardedPayload)
              : 0,
          );
        } else {
          (toClientId === SERVER_CLIENT_ID
            ? serverClient
            : mapGet(clients, toClientId)
          )?.send(forwardedPayload);
        }
      });
    return serverClient?.persister
      ? (payload: string) =>
          serverClient.persister.schedule(async () => handler(payload))
      : handler;
  };

  webSocketServer.on('connection', (webSocket, request) =>
    ifNotUndefined(request.url?.match(PATH_REGEX), ([, pathId]) =>
      ifNotUndefined(request.headers['sec-websocket-key'], async (clientId) => {
        const clients = mapEnsure(clientsByPath, pathId, mapNew<Id, WebSocket>);
        let shouldStartServerClient = 0;

        if (collIsEmpty(clients)) {
          callListeners(pathIdListeners, undefined, pathId, 1);
          createServerClient(pathId);
          shouldStartServerClient = 1;
        }
        callListeners(clientIdListeners, [pathId], clientId, 1);
        mapSet(clients, clientId, webSocket);

        const messageHandler = getMessageHandler(clientId, pathId);
        webSocket.on('message', (data) => messageHandler(data.toString(UTF8)));

        if (shouldStartServerClient) {
          await startServerClient(pathId);
        }

        webSocket.on('close', () => {
          collDel(clients, clientId);
          callListeners(clientIdListeners, [pathId], clientId, -1);
          if (collIsEmpty(clients)) {
            collDel(clientsByPath, pathId);
            stopServerClient(pathId);
            callListeners(pathIdListeners, undefined, pathId, -1);
          }
        });
      }),
    ),
  );

  const getWebSocketServer = () => webSocketServer;

  const getPathIds = (): string[] => mapKeys(clientsByPath);

  const getClientIds = (path: string): Ids =>
    mapKeys(mapGet(clientsByPath, path));

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

  const destroy = () => {
    webSocketServer.close();
    collClear(clientsByPath);
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
