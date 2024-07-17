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
import {arrayForEach, arrayPush} from '../../common/array.ts';
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

enum Sc {
  State = 0,
  Persister = 1,
  Synchronizer = 2,
  Send = 3,
  Buffer = 4,
}
enum ScState {
  Ready,
  Configured,
  Starting,
}

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
  type ServerClient = [
    state: ScState,
    persister: PathPersister,
    synchronizer: Synchronizer,
    send: (payload: string) => void,
    buffer: [],
  ];

  const pathIdListeners: IdSet2 = mapNew();
  const clientIdListeners: IdSet2 = mapNew();
  const clientsByPath: IdMap2<WebSocket> = mapNew();
  const serverClientsByPath: IdMap<ServerClient> = mapNew();

  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => wsServer,
  );

  const configureServerClient = (
    serverClient: ServerClient,
    pathId: Id,
    clients: IdMap<WebSocket>,
  ) =>
    ifNotUndefined(createPersisterForPath?.(pathId), (persister) => {
      serverClient[Sc.State] = 1;
      serverClient[Sc.Persister] = persister;
      const messageHandler = getMessageHandler(
        SERVER_CLIENT_ID,
        clients,
        serverClient,
      );
      serverClient[Sc.Synchronizer] = createCustomSynchronizer(
        persister.getStore() as MergeableStore,
        (toClientId, requestId, message, body) =>
          messageHandler(createPayload(toClientId, requestId, message, body)),
        (receive: Receive) =>
          (serverClient[Sc.Send] = (payload: string) =>
            receivePayload(payload, receive)),
        () => {},
        1,
      );
      serverClient[Sc.Buffer] = [];
    });

  const startServerClient = async (serverClient: ServerClient) => {
    serverClient[Sc.State] = ScState.Starting;
    await serverClient[Sc.Persister].schedule(
      serverClient[Sc.Persister].startAutoLoad,
      serverClient[Sc.Persister].startAutoSave,
      serverClient[Sc.Synchronizer].startSync,
    );
    serverClient[Sc.State] = ScState.Ready;
  };

  const stopServerClient = (serverClient: ServerClient) => {
    serverClient[Sc.Persister]?.destroy();
    serverClient[Sc.Synchronizer]?.destroy();
  };

  const getMessageHandler =
    (clientId: Id, clients: IdMap<WebSocket>, serverClient: ServerClient) =>
    (payload: string) =>
      ifPayloadValid(payload, (toClientId, remainder) => {
        const forwardedPayload = createRawPayload(clientId, remainder);
        if (toClientId === EMPTY_STRING) {
          clientId !== SERVER_CLIENT_ID
            ? serverClient[Sc.Send]?.(forwardedPayload)
            : 0;
          mapForEach(clients, (otherClientId, otherWebSocket) =>
            otherClientId !== clientId
              ? otherWebSocket.send(forwardedPayload)
              : 0,
          );
        } else {
          toClientId === SERVER_CLIENT_ID
            ? serverClient[Sc.Send]?.(forwardedPayload)
            : mapGet(clients, toClientId)?.send(forwardedPayload);
        }
      });

  webSocketServer.on('connection', (webSocket, request) =>
    ifNotUndefined(request.url?.match(PATH_REGEX), ([, pathId]) =>
      ifNotUndefined(request.headers['sec-websocket-key'], async (clientId) => {
        const clients = mapEnsure(clientsByPath, pathId, mapNew<Id, WebSocket>);
        const serverClient: ServerClient = mapEnsure(
          serverClientsByPath,
          pathId,
          () => [ScState.Ready] as any,
        );
        const messageHandler = getMessageHandler(
          clientId,
          clients,
          serverClient,
        );

        if (collIsEmpty(clients)) {
          callListeners(pathIdListeners, undefined, pathId, 1);
          configureServerClient(serverClient, pathId, clients);
        }
        mapSet(clients, clientId, webSocket);
        callListeners(clientIdListeners, [pathId], clientId, 1);

        webSocket.on('message', (data) => {
          const payload = data.toString(UTF8);
          serverClient[Sc.State] == ScState.Ready
            ? messageHandler(payload)
            : arrayPush(serverClient[Sc.Buffer], payload);
        });

        if (serverClient[Sc.State] == ScState.Configured) {
          await startServerClient(serverClient);
          arrayForEach(serverClient[Sc.Buffer], messageHandler);
          serverClient[Sc.Buffer] = [];
        }

        webSocket.on('close', () => {
          collDel(clients, clientId);
          callListeners(clientIdListeners, [pathId], clientId, -1);
          if (collIsEmpty(clients)) {
            stopServerClient(serverClient);
            collDel(serverClientsByPath, pathId);
            collDel(clientsByPath, pathId);
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
