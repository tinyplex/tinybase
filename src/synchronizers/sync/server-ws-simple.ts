import {EMPTY_STRING, UTF8} from '../../common/strings';
import {IdMap, mapForEach, mapGet, mapNew, mapSet} from '../../common/map';
import {WebSocket, WebSocketServer} from 'ws';
import {collClear, collDel} from '../../common/coll';
import {Id} from '../../types/common';
import {MESSAGE_SEPARATOR} from './common';
import {createWsSimpleServer as createWsSimpleServerDecl} from '../../types/synchronizers';
import {slice} from '../../common/other';

export const createWsSimpleServer = ((webSocketServer: WebSocketServer) => {
  const clients: IdMap<WebSocket> = mapNew();
  webSocketServer.on('connection', (webSocket, request) => {
    const clientId: Id = request.headers['sec-websocket-key']!;
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
                ? otherWebSocket.send(clientId + MESSAGE_SEPARATOR + message)
                : 0,
            )
          : mapGet(clients, toClientId)?.send(
              clientId + MESSAGE_SEPARATOR + message,
            );
      }
    });

    webSocket.on('close', () => collDel(clients, clientId));
  });

  const getWebSocketServer = () => webSocketServer;

  const destroy = () => {
    webSocketServer.close();
    collClear(clients);
  };

  return {
    getWebSocketServer,
    destroy,
  };
}) as typeof createWsSimpleServerDecl;
