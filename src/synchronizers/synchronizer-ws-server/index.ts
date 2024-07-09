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

type ServerClient = {
  persister: Persister<
    Persists.MergeableStoreOnly | Persists.StoreOrMergeableStore
  >;
  synchronizer: Synchronizer;
  send: (payload: string) => void;
};

const PATH_REGEX = /\/([^?]*)/;
const SERVER_CLIENT_ID = 'S';

export const createWsServer = ((
  webSocketServer: WebSocketServer,
  createPersister?: (
    path: Id,
  ) =>
    | Persister<Persists.MergeableStoreOnly | Persists.StoreOrMergeableStore>
    | undefined,
) => {
  const pathIdListeners: IdSet2 = mapNew();
  const clientIdListeners: IdSet2 = mapNew();
  const clientsByPath: IdMap2<WebSocket> = mapNew();
  const serverClientsByPath: IdMap<ServerClient> = mapNew();

  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => wsServer,
  );

  const startServerClient = (pathId: Id) =>
    ifNotUndefined(createPersister?.(pathId), async (persister) => {
      const serverClient = mapEnsure(
        serverClientsByPath,
        pathId,
        () => ({persister}) as ServerClient,
      );
      const messageHandler = getMessageHandler(SERVER_CLIENT_ID, pathId);

      serverClient.synchronizer = await createCustomSynchronizer(
        persister.getStore() as MergeableStore,
        (toClientId, requestId, message, body) =>
          messageHandler(createPayload(toClientId, requestId, message, body)),
        (receive: Receive) =>
          (serverClient.send = (payload) => receivePayload(payload, receive)),
        () => {},
        0.1,
      ).startSync();
      await persister.startAutoLoad();
      await persister.startAutoSave();
    });

  const stopServerClient = (pathId: Id) =>
    ifNotUndefined(
      mapGet(serverClientsByPath, pathId),
      ({persister, synchronizer}) => {
        persister.destroy();
        synchronizer?.destroy();
        collDel(serverClientsByPath, pathId);
      },
    );

  const getMessageHandler = (clientId: Id, pathId: Id) => {
    const clients = mapGet(clientsByPath, pathId);
    const serverClient = mapGet(serverClientsByPath, pathId);
    return (payload: string) =>
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
  };

  webSocketServer.on('connection', (webSocket, request) =>
    ifNotUndefined(request.url?.match(PATH_REGEX), ([, pathId]) =>
      ifNotUndefined(request.headers['sec-websocket-key'], (clientId) => {
        const clients = mapEnsure(clientsByPath, pathId, mapNew<Id, WebSocket>);
        if (collIsEmpty(clients)) {
          callListeners(pathIdListeners, undefined, pathId, 1);
          startServerClient(pathId);
        }
        mapSet(clients, clientId, webSocket);
        callListeners(clientIdListeners, [pathId], clientId, 1);

        const messageHandler = getMessageHandler(clientId, pathId);
        webSocket.on('message', (data) => messageHandler(data.toString(UTF8)));

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
