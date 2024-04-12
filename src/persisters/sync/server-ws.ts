import {EMPTY_STRING, UTF8} from '../../common/strings';
import {IdMap, mapForEach, mapGet, mapNew, mapSet} from '../../common/map';
import {WebSocket, WebSocketServer} from 'ws';
import {Id} from '../../types/common';
import {MESSAGE_SEPARATOR} from './common';
import {collDel} from '../../common/coll';
import {createWsServer as createWsServerDecl} from '../../types/persisters/persister-sync';
import {slice} from '../../common/other';

export const createWsServer = ((webSocketServer: WebSocketServer) => {
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
}) as typeof createWsServerDecl;
