import {EMPTY_STRING, UTF8} from '../common/strings';
import {Id, Ids} from '../types/common';
import {
  IdMap2,
  mapEnsure,
  mapForEach,
  mapGet,
  mapKeys,
  mapNew,
  mapSet,
} from '../common/map';
import {WebSocket, WebSocketServer} from 'ws';
import {
  WsServerStats,
  createWsServer as createWsServerDecl,
} from '../types/synchronizers/synchronizer-ws-server';
import {
  collClear,
  collDel,
  collIsEmpty,
  collSize,
  collSize2,
} from '../common/coll';
import {ifNotUndefined, slice} from '../common/other';
import {MESSAGE_SEPARATOR} from './common';

const PATH_REGEX = /\/([^?]*)/;

export const createWsServer = ((webSocketServer: WebSocketServer) => {
  const clientsByPath: IdMap2<WebSocket> = mapNew();
  webSocketServer.on('connection', (webSocket, request) =>
    ifNotUndefined(request.url?.match(PATH_REGEX), ([path]) =>
      ifNotUndefined(request.headers['sec-websocket-key'], (clientId) => {
        const clients = mapEnsure(clientsByPath, path, mapNew<Id, WebSocket>);
        mapSet(clients, clientId, webSocket);

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
          if (collIsEmpty(clients)) {
            collDel(clientsByPath, path);
          }
        });
      }),
    ),
  );

  const getWebSocketServer = () => webSocketServer;

  const getPaths = (): string[] => mapKeys(clientsByPath);

  const getClientIds = (path: string): Ids =>
    mapKeys(mapGet(clientsByPath, path));

  const getStats = (): WsServerStats => ({
    paths: collSize(clientsByPath),
    clients: collSize2(clientsByPath),
  });

  const destroy = () => {
    webSocketServer.close();
    collClear(clientsByPath);
  };

  return {
    getWebSocketServer,
    getPaths,
    getClientIds,
    getStats,
    destroy,
  };
}) as typeof createWsServerDecl;
