import type {Id} from '../../@types/common/index.js';
import type {
  WsServerSimple,
  createWsServerSimple as createWsServerSimpleDecl,
} from '../../@types/synchronizers/synchronizer-ws-server-simple/index.js';
import {collClear, collDel, collIsEmpty} from '../../common/coll.ts';
import {
  IdMap2,
  mapEnsure,
  mapForEach,
  mapGet,
  mapNew,
  mapSet,
} from '../../common/map.ts';
import {objFreeze} from '../../common/obj.ts';
import {ifNotUndefined} from '../../common/other.ts';
import {EMPTY_STRING, MESSAGE, UTF8, strMatch} from '../../common/strings.ts';
import {createRawPayload, ifPayloadValid} from '../common.ts';
import {WebSocket, WebSocketServer} from 'ws';

const PATH_REGEX = /\/([^?]*)/;

export const createWsServerSimple = ((webSocketServer: WebSocketServer) => {
  const clientsByPath: IdMap2<WebSocket> = mapNew();

  webSocketServer.on('connection', (client, request) =>
    ifNotUndefined(strMatch(request.url, PATH_REGEX), ([, pathId]) =>
      ifNotUndefined(request.headers['sec-websocket-key'], async (clientId) => {
        const clients = mapEnsure(clientsByPath, pathId, mapNew<Id, WebSocket>);
        mapSet(clients, clientId, client);

        client.on(MESSAGE, (data) =>
          ifPayloadValid(data.toString(UTF8), (toClientId, remainder) => {
            const forwardedPayload = createRawPayload(clientId, remainder);
            if (toClientId === EMPTY_STRING) {
              mapForEach(clients, (otherClientId, otherClient) =>
                otherClientId !== clientId
                  ? otherClient.send(forwardedPayload)
                  : 0,
              );
            } else {
              mapGet(clients, toClientId)?.send(forwardedPayload);
            }
          }),
        );

        client.on('close', () => {
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
