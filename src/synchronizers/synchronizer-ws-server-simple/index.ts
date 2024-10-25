import {EMPTY_STRING, UTF8, strMatch} from '../../common/strings.ts';
import {
  IdMap2,
  mapEnsure,
  mapForEach,
  mapGet,
  mapNew,
  mapSet,
} from '../../common/map.ts';
import {WebSocket, WebSocketServer} from 'ws';
import type {
  WsServerSimple,
  createWsServerSimple as createWsServerSimpleDecl,
} from '../../@types/synchronizers/synchronizer-ws-server-simple/index.js';
import {collClear, collDel, collIsEmpty} from '../../common/coll.ts';
import {createRawPayload, ifPayloadValid} from '../common.ts';
import type {Id} from '../../@types/common/index.js';
import {ifNotUndefined} from '../../common/other.ts';
import {objFreeze} from '../../common/obj.ts';

const PATH_REGEX = /\/([^?]*)/;

export const createWsServerSimple = ((webSocketServer: WebSocketServer) => {
  const clientsByPath: IdMap2<WebSocket> = mapNew();

  webSocketServer.on('connection', (webSocket, request) =>
    ifNotUndefined(strMatch(request.url, PATH_REGEX), ([, pathId]) =>
      ifNotUndefined(request.headers['sec-websocket-key'], async (clientId) => {
        const clients = mapEnsure(clientsByPath, pathId, mapNew<Id, WebSocket>);
        mapSet(clients, clientId, webSocket);

        webSocket.on('message', (data) => {
          const payload = data.toString(UTF8);
          ifPayloadValid(payload, (toClientId, remainder) => {
            const forwardedPayload = createRawPayload(clientId, remainder);
            if (toClientId === EMPTY_STRING) {
              mapForEach(clients, (otherClientId, otherWebSocket) =>
                otherClientId !== clientId
                  ? otherWebSocket.send(forwardedPayload)
                  : 0,
              );
            } else {
              mapGet(clients, toClientId)?.send(forwardedPayload);
            }
          });
        });

        webSocket.on('close', () => {
          collDel(clients, clientId);
          if (collIsEmpty(clients)) {
            collDel(clientsByPath, pathId);
          }
        });
      }),
    ),
  );

  const getWebSocketServer = () => webSocketServer;

  const destroy = () => {
    collClear(clientsByPath);
    webSocketServer.close();
  };

  const wsServerSimple = {
    getWebSocketServer,
    destroy,
  };

  return objFreeze(wsServerSimple as WsServerSimple);
}) as typeof createWsServerSimpleDecl;
