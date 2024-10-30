import {EMPTY_STRING, strMatch} from '../../common/strings.ts';
import {createRawPayload, ifPayloadValid} from '../common.ts';
import {DurableObject} from 'cloudflare:workers';
import {Id} from '../../@types/index.js';
import {arrayForEach} from '../../common/array.ts';
import {ifNotUndefined} from '../../common/other.ts';
import {objValues} from '../../common/obj.ts';

const PATH_REGEX = /\/([^?]*)/;

const getUpgradeClientId = (request: Request): Id | null =>
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

export class WsServerDurableObject<Env = unknown> extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  fetch(request: Request): Response {
    return ifNotUndefined(
      getUpgradeClientId(request),
      (clientId) => {
        const [webSocket, client] = objValues(new WebSocketPair());
        this.ctx.acceptWebSocket(client, [clientId]);
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

  webSocketClose(client: WebSocket) {}
}

export const getWsServerDurableObjectFetch =
  <Namespace extends string>(namespace: Namespace) =>
  async (
    request: Request,
    env: {
      [namespace in Namespace]: DurableObjectNamespace<WsServerDurableObject>;
    },
  ) => {
    return ifNotUndefined(
      strMatch(new URL(request.url).pathname, PATH_REGEX),
      ([, pathId]) => {
        if (getUpgradeClientId(request)) {
          const id = env[namespace].idFromName(pathId);
          console.log('DO id', id.toString());
          return env[namespace].get(id).fetch(request);
        } else {
          return createUpgradeRequiredResponse();
        }
      },
      createUpgradeRequiredResponse,
    );
  };
