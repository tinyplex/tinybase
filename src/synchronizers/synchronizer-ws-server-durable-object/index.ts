import type {Id, Ids} from '../../@types/common/index.d.ts';
import type {Persister, Persists} from '../../@types/persisters/index.d.ts';
import type {IdAddedOrRemoved} from '../../@types/store/index.d.ts';
import type {Receive} from '../../@types/synchronizers/index.d.ts';
import {arrayForEach, arrayIsEmpty, arrayMap} from '../../common/array.ts';
import {objValues} from '../../common/obj.ts';
import {ifNotUndefined, size, startTimeout} from '../../common/other.ts';
import {EMPTY_STRING, strMatch} from '../../common/strings.ts';
import {
  createPayload,
  createRawPayload,
  ifPayloadValid,
  receivePayload,
} from '../common.ts';
import {createCustomSynchronizer} from '../index.ts';
import {DurableObject} from 'cloudflare:workers';

const PATH_REGEX = /\/([^?]*)/;
const SERVER_CLIENT_ID = 'S';

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
  // @ts-expect-error See blockConcurrencyWhile
  #serverClientSend: (payload: string) => void;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(
      async () =>
        await ifNotUndefined(
          await this.createPersister(),
          async (persister) => {
            const synchronizer = createCustomSynchronizer(
              persister.getStore(),
              (toClientId, requestId, message, body) =>
                this.#handleMessage(
                  SERVER_CLIENT_ID,
                  createPayload(toClientId, requestId, message, body),
                ),
              (receive: Receive) =>
                (this.#serverClientSend = (payload: string) =>
                  receivePayload(payload, receive)),
              () => {},
              1,
            );
            await persister.load();
            await persister.startAutoSave();
            // startSync needs other events to arrive, so execute after block.
            startTimeout(synchronizer.startSync);
          },
        ),
    );
  }

  fetch(request: Request): Response {
    const pathId = getPathId(request);
    return ifNotUndefined(
      getClientId(request),
      (clientId) => {
        const [webSocket, client] = objValues(new WebSocketPair());
        if (arrayIsEmpty(this.#getClients())) {
          this.onPathId(pathId, 1);
        }
        this.ctx.acceptWebSocket(client, [clientId, pathId]);
        this.onClientId(pathId, clientId, 1);
        client.send(createPayload(SERVER_CLIENT_ID, null, 1, EMPTY_STRING));
        return createResponse(101, webSocket);
      },
      createUpgradeRequiredResponse,
    ) as Response;
  }

  webSocketMessage(client: WebSocket, message: ArrayBuffer | string) {
    ifNotUndefined(this.ctx.getTags(client)[0], (clientId) =>
      this.#handleMessage(clientId, message.toString(), client),
    );
  }

  webSocketClose(client: WebSocket) {
    const [clientId, pathId] = this.ctx.getTags(client);
    this.onClientId(pathId, clientId, -1);
    if (size(this.#getClients()) == 1) {
      this.onPathId(pathId, -1);
    }
  }

  // --

  #handleMessage(fromClientId: Id, message: string, fromClient?: WebSocket) {
    ifPayloadValid(message.toString(), (toClientId, remainder) => {
      const forwardedPayload = createRawPayload(fromClientId, remainder);
      this.onMessage(fromClientId, toClientId, remainder);
      if (toClientId == EMPTY_STRING) {
        if (fromClientId != SERVER_CLIENT_ID) {
          this.#serverClientSend?.(forwardedPayload);
        }
        arrayForEach(this.#getClients(), (otherClient) => {
          if (otherClient != fromClient) {
            otherClient.send(forwardedPayload);
          }
        });
      } else if (toClientId == SERVER_CLIENT_ID) {
        this.#serverClientSend?.(forwardedPayload);
      } else if (toClientId != fromClientId) {
        this.#getClients(toClientId)[0]?.send(forwardedPayload);
      }
    });
  }

  #getClients(tag?: Id) {
    return this.ctx.getWebSockets(tag);
  }

  // --

  createPersister():
    | Persister<Persists.MergeableStoreOnly>
    | Promise<Persister<Persists.MergeableStoreOnly>>
    | undefined {
    return undefined;
  }

  getPathId(): Id {
    return this.ctx.getTags(this.#getClients()[0])?.[1];
  }

  getClientIds(): Ids {
    return arrayMap(
      this.#getClients(),
      (client) => this.ctx.getTags(client)[0],
    );
  }

  onPathId(_pathId: Id, _addedOrRemoved: IdAddedOrRemoved) {}

  onClientId(_pathId: Id, _clientId: Id, _addedOrRemoved: IdAddedOrRemoved) {}

  onMessage(_fromClientId: Id, _toClientId: Id, _remainder: string) {}
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
