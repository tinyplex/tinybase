import {WebSocket, WebSocketServer} from 'ws';
import type {Id} from '../../@types/common/index.d.ts';
import type {
  WsServerSimple,
  createWsServerSimple as createWsServerSimpleDecl,
} from '../../@types/synchronizers/synchronizer-ws-server-simple/index.d.ts';
import {arrayForEach} from '../../common/array.ts';
import {collClear, collDel, collHas, collIsEmpty} from '../../common/coll.ts';
import {
  IdMap2,
  mapEnsure,
  mapForEach,
  mapGet,
  mapNew,
  mapSet,
} from '../../common/map.ts';
import {objFreeze} from '../../common/obj.ts';
import {ifNotUndefined, isUndefined} from '../../common/other.ts';
import {
  CLOSE,
  CONNECTION,
  EMPTY_STRING,
  MESSAGE,
  UTF8,
  strMatch,
} from '../../common/strings.ts';
import {
  WS_SYNCHRONIZER_PROTOCOL,
  createInvalidPayloadHandler,
  createMultiplePayload,
  createMultipleServerClient,
  createPayloadDecoder,
  createRawPayload,
  ifPayloadValid,
} from '../common.ts';

const PATH_REGEX = /\/([^?]*)/;

export const createWsServerSimple = ((webSocketServer: WebSocketServer) => {
  type Client = [webSocket: WebSocket, channelId?: Id];

  const clientsByPath: IdMap2<Client> = mapNew();

  const sendToClient = ([client, channelId]: Client, payload: string) =>
    client.send(
      isUndefined(channelId)
        ? payload
        : createMultiplePayload(channelId, payload),
    );

  const handleMessage = (pathId: Id, clientId: Id, payload: string) =>
    ifPayloadValid(payload, (toClientId, remainder) => {
      const clients = mapGet(clientsByPath, pathId);
      const forwardedPayload = createRawPayload(clientId, remainder);
      if (toClientId === EMPTY_STRING) {
        mapForEach(clients, (otherClientId, otherClient) =>
          otherClientId !== clientId
            ? sendToClient(otherClient, forwardedPayload)
            : 0,
        );
      } else {
        ifNotUndefined(mapGet(clients, toClientId), (client) =>
          sendToClient(client, forwardedPayload),
        );
      }
    });

  const handleDecodedMessage = (
    pathId: Id,
    clientId: Id,
    toClientId: Id,
    remainders: string[],
  ) =>
    arrayForEach(remainders, (remainder) =>
      handleMessage(pathId, clientId, createRawPayload(toClientId, remainder)),
    );

  const addClientToPath = (pathId: Id, clientId: Id, client: Client) =>
    mapSet(
      mapEnsure(clientsByPath, pathId, mapNew<Id, Client>),
      clientId,
      client,
    );

  const delClientFromPath = (pathId: Id, clientId: Id) => {
    const clients = mapGet(clientsByPath, pathId);
    if (collHas(clients, clientId)) {
      collDel(clients, clientId);
      if (collIsEmpty(clients)) {
        collDel(clientsByPath, pathId);
      }
    }
  };

  const addLegacyClient = (client: WebSocket, clientId: Id, pathId: Id) => {
    addClientToPath(pathId, clientId, [client]);
    const decode = createPayloadDecoder(
      (toClientId, remainders) =>
        handleDecodedMessage(pathId, clientId, toClientId, remainders),
      1,
      createInvalidPayloadHandler(client),
    );
    client.on(MESSAGE, (data) => decode(data.toString(UTF8)));
    client.on(CLOSE, () => delClientFromPath(pathId, clientId));
  };

  const addMultipleClient = (
    client: WebSocket,
    clientId: Id,
    basePathId: Id,
  ) => {
    const invalid = createInvalidPayloadHandler(client);
    const [handlePayload, destroy] = createMultipleServerClient<Id>(
      basePathId,
      (pathId, channelId) => {
        addClientToPath(pathId, clientId, [client, channelId]);
        return [pathId];
      },
      (pathId) => delClientFromPath(pathId, clientId),
      (pathId, toClientId, remainders) =>
        handleDecodedMessage(pathId, clientId, toClientId, remainders),
      (payload) => client.send(payload),
      1,
      invalid,
    );
    client.on(MESSAGE, (data) => handlePayload(data.toString(UTF8)));
    client.on(CLOSE, destroy);
  };

  webSocketServer.on(CONNECTION, (client, request) =>
    ifNotUndefined(strMatch(request.url, PATH_REGEX), ([, pathId]) =>
      ifNotUndefined(request.headers['sec-websocket-key'], (clientId) =>
        client.protocol == WS_SYNCHRONIZER_PROTOCOL
          ? addMultipleClient(client, clientId, pathId)
          : addLegacyClient(client, clientId, pathId),
      ),
    ),
  );

  const getWebSocketServer = () => webSocketServer;

  const destroy = async () => {
    collClear(clientsByPath);
    webSocketServer.close();
  };

  const wsServerSimple = {
    getWebSocketServer,
    destroy,
  };

  return objFreeze(wsServerSimple as WsServerSimple);
}) as typeof createWsServerSimpleDecl;
