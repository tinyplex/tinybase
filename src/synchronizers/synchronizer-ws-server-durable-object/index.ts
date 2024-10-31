import {EMPTY_STRING, strMatch} from '../../common/strings.ts';
import type {Id, IdAddedOrRemoved, Ids} from '../../@types/index.d.ts';
import {arrayForEach, arrayIsEmpty, arrayMap} from '../../common/array.ts';
import {createRawPayload, ifPayloadValid} from '../common.ts';
import {ifNotUndefined, size} from '../../common/other.ts';
import {DurableObject} from 'cloudflare:workers';
import {objValues} from '../../common/obj.ts';

const PATH_REGEX = /\/([^?]*)/;

const getPathId = (request: Request): Id =>
  strMatch(new URL(request.url).pathname, PATH_REGEX)?.[1] ?? EMPTY_STRING;

const getClientId = (request: Request): Id | null =>
  request.headers.get('upgrade')?.toLowerCase() == 'websocket'
    ? request.headers.get('sec-websocket-key')
    : null;

const createResponse = (
  status: number,
  webSocket: WebSocket | null = null,
  body: string | null = null,
): Response => new Response(body, {status, webSocket});

const createUpgradeRequiredResponse = (): Response =>
  createResponse(426, null, 'Upgrade required');

export class WsServerDurableObject<Env = unknown>
  extends DurableObject<Env>
  implements DurableObject<Env>
{
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  fetch(request: Request): Response {
    const pathId = getPathId(request);
    return ifNotUndefined(
      getClientId(request),
      (clientId) => {
        const [webSocket, client] = objValues(new WebSocketPair());
        client.serializeAttachment({pathId});
        if (arrayIsEmpty(this.ctx.getWebSockets())) {
          this.onPathId(pathId, 1);
        }
        this.ctx.acceptWebSocket(client, [clientId]);
        this.onClientId(pathId, clientId, 1);
        return createResponse(101, webSocket);
      },
      createUpgradeRequiredResponse,
    ) as Response;
  }

  webSocketMessage(client: WebSocket, message: ArrayBuffer | string) {
    ifNotUndefined(this.ctx.getTags(client)[0], (clientId) =>
      ifPayloadValid(message.toString(), (toClientId, remainder) => {
        const forwardedPayload = createRawPayload(clientId, remainder);
        if (toClientId === EMPTY_STRING) {
          arrayForEach(this.ctx.getWebSockets(), (otherClient) =>
            otherClient !== client ? otherClient.send(forwardedPayload) : 0,
          );
        } else {
          this.ctx.getWebSockets(toClientId)[0]?.send(forwardedPayload);
        }
      }),
    );
  }

  webSocketClose(client: WebSocket) {
    const {pathId} = client.deserializeAttachment();
    this.onClientId(pathId, this.ctx.getTags(client)[0], -1);
    if (size(this.ctx.getWebSockets()) == 1) {
      this.onPathId(pathId, -1);
    }
  }

  // --

  getClientIds(_pathId: Id): Ids {
    return arrayMap(
      this.ctx.getWebSockets(),
      (client) => this.ctx.getTags(client)[0],
    );
  }

  onPathId(_pathId: Id, _addedOrRemoved: IdAddedOrRemoved) {}

  onClientId(_pathId: Id, _clientId: Id, _addedOrRemoved: IdAddedOrRemoved) {}
}

export const getWsServerDurableObjectFetch =
  <Namespace extends string>(namespace: Namespace) =>
  (
    request: Request,
    env: {
      [namespace in Namespace]: DurableObjectNamespace<WsServerDurableObject>;
    },
  ) =>
    getClientId(request)
      ? env[namespace]
          .get(env[namespace].idFromName(getPathId(request)))
          .fetch(request)
      : createUpgradeRequiredResponse();
