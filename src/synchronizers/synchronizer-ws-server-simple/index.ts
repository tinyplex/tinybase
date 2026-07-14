import {WebSocket, WebSocketServer} from 'ws';
import type {Id, IdOrNull} from '../../@types/common/index.d.ts';
import type {
  WsServerSimple,
  createWsServerSimple as createWsServerSimpleDecl,
} from '../../@types/synchronizers/synchronizer-ws-server-simple/index.d.ts';
import {collClear, collDel, collHas, collIsEmpty} from '../../common/coll.ts';
import {
  IdMap,
  IdMap2,
  mapEnsure,
  mapForEach,
  mapGet,
  mapNew,
  mapSet,
} from '../../common/map.ts';
import {objFreeze} from '../../common/obj.ts';
import {ifNotUndefined, isString, isUndefined} from '../../common/other.ts';
import {EMPTY_STRING, MESSAGE, UTF8, strMatch} from '../../common/strings.ts';
import {
  MULTIPLE_VERSION,
  MultipleControl,
  WS_SYNCHRONIZER_PROTOCOL,
  createMultipleControlPayload,
  createMultiplePayload,
  createRawPayload,
  ifMultipleControlPayloadValid,
  ifMultiplePayloadValid,
  ifPayloadValid,
  isMultipleChannelIdValid,
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
    client.on(MESSAGE, (data) =>
      handleMessage(pathId, clientId, data.toString(UTF8)),
    );
    client.on('close', () => delClientFromPath(pathId, clientId));
  };

  const addMultipleClient = (
    client: WebSocket,
    clientId: Id,
    basePathId: Id,
  ) => {
    const pathsByChannel: IdMap<Id> = mapNew();
    let negotiated = false;

    const sendControl = (
      requestId: IdOrNull,
      control: MultipleControl,
      body: any,
    ) => client.send(createMultipleControlPayload(requestId, control, body));

    client.on(MESSAGE, (data) => {
      const payload = data.toString(UTF8);
      ifMultipleControlPayloadValid(payload, (requestId, control, body) => {
        if (
          control == MultipleControl.Hello &&
          body == MULTIPLE_VERSION &&
          requestId
        ) {
          negotiated = true;
          sendControl(requestId, control, body);
        } else if (
          negotiated &&
          control == MultipleControl.Subscribe &&
          isString(body) &&
          isMultipleChannelIdValid(body) &&
          requestId
        ) {
          const pathId = basePathId + (basePathId ? '/' : EMPTY_STRING) + body;
          if (!collHas(pathsByChannel, body)) {
            addClientToPath(pathId, clientId, [client, body]);
            mapSet(pathsByChannel, body, pathId);
          }
          sendControl(requestId, control, body);
        } else if (
          negotiated &&
          control == MultipleControl.Unsubscribe &&
          isString(body)
        ) {
          ifNotUndefined(mapGet(pathsByChannel, body), (pathId) =>
            delClientFromPath(pathId, clientId),
          );
          collDel(pathsByChannel, body);
        }
      });
      if (negotiated) {
        ifMultiplePayloadValid(payload, (channelId, channelPayload) =>
          ifNotUndefined(mapGet(pathsByChannel, channelId), (pathId) =>
            handleMessage(pathId, clientId, channelPayload),
          ),
        );
      }
    });

    client.on('close', () =>
      mapForEach(pathsByChannel, (_channelId, pathId) =>
        delClientFromPath(pathId, clientId),
      ),
    );
  };

  webSocketServer.on('connection', (client, request) =>
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
