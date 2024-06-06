import type {
  ClientIdsListener,
  PathIdsListener,
  WsServer,
  WsServerStats,
  createWsServer as createWsServerDecl,
} from '../../@types/synchronizers/synchronizer-ws-server';
import {EMPTY_STRING, UTF8} from '../../common/strings';
import type {Id, IdOrNull, Ids} from '../../@types/common';
import {
  IdMap2,
  mapEnsure,
  mapForEach,
  mapGet,
  mapKeys,
  mapNew,
  mapSet,
} from '../../common/map';
import {WebSocket, WebSocketServer} from 'ws';
import {
  collClear,
  collDel,
  collIsEmpty,
  collSize,
  collSize2,
} from '../../common/coll';
import {ifNotUndefined, slice} from '../../common/other';
import {IdSet2} from '../../common/set';
import {MESSAGE_SEPARATOR} from '../common';
import {getListenerFunctions} from '../../common/listeners';
import {objFreeze} from '../../common/obj';

const PATH_REGEX = /\/([^?]*)/;

export const createWsServer = ((webSocketServer: WebSocketServer) => {
  const pathIdListeners: IdSet2 = mapNew();
  const clientIdListeners: IdSet2 = mapNew();
  const clientsByPath: IdMap2<WebSocket> = mapNew();

  const [addListener, callListeners, delListenerImpl] = getListenerFunctions(
    () => wsServer,
  );

  webSocketServer.on('connection', (webSocket, request) =>
    ifNotUndefined(request.url?.match(PATH_REGEX), ([, pathId]) =>
      ifNotUndefined(request.headers['sec-websocket-key'], (clientId) => {
        const clients = mapEnsure(clientsByPath, pathId, mapNew<Id, WebSocket>);
        mapSet(clients, clientId, webSocket);

        if (clients.size == 1) {
          callListeners(pathIdListeners, undefined, () => ({[pathId]: 1}));
        }
        callListeners(clientIdListeners, [pathId], () => ({[clientId]: 1}));

        webSocket.on('message', (data) => {
          const payload = data.toString(UTF8);
          const splitAt = payload.indexOf(MESSAGE_SEPARATOR);
          if (splitAt !== -1) {
            const toClientId = slice(payload, 0, splitAt);
            const message = slice(payload, splitAt + 1);
            toClientId === EMPTY_STRING
              ? mapForEach(clients, (otherClientId, otherWebSocket) =>
                  otherClientId != clientId
                    ? otherWebSocket.send(
                        clientId + MESSAGE_SEPARATOR + message,
                      )
                    : 0,
                )
              : mapGet(clients, toClientId)?.send(
                  clientId + MESSAGE_SEPARATOR + message,
                );
          }
        });

        webSocket.on('close', () => {
          collDel(clients, clientId);
          callListeners(clientIdListeners, [pathId], () => ({[clientId]: -1}));
          if (collIsEmpty(clients)) {
            collDel(clientsByPath, pathId);
            callListeners(pathIdListeners, undefined, () => ({[pathId]: -1}));
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
