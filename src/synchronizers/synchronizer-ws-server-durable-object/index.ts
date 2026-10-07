import {DurableObject} from 'cloudflare:workers';
import type {Id, Ids} from '../../@types/common/index.d.ts';
import type {
  MergeableChanges,
  MergeableStore,
} from '../../@types/mergeable-store/index.d.ts';
import type {Persister, Persists} from '../../@types/persisters/index.d.ts';
import type {
  CellOrUndefined,
  IdAddedOrRemoved,
  ValueOrUndefined,
} from '../../@types/store/index.d.ts';
import type {Receive} from '../../@types/synchronizers/index.d.ts';
import type {ClientAccess} from '../../@types/synchronizers/synchronizer-ws-server/index.d.ts';
import {arrayForEach, arrayMap} from '../../common/array.ts';
import {
  ERROR_SYNC_UNAUTHORIZED,
  errorNew,
  tryCatch,
} from '../../common/error.ts';
import {weakMapNew} from '../../common/map.ts';
import {objValues} from '../../common/obj.ts';
import {
  ifNotUndefined,
  isEmpty,
  isUndefined,
  noop,
  size,
  startTimeout,
} from '../../common/other.ts';
import {EMPTY_STRING, strMatch} from '../../common/strings.ts';
import {createMergeableStore} from '../../mergeable-store/index.ts';
import {createCustomPersister} from '../../persisters/common/create.ts';
import {
  type PayloadDecoder,
  createHelloPayload,
  createInvalidPayloadHandler,
  createPayloadDecoder,
  createPayloadReceiver,
  createPayloads,
  createRawPayload,
  createServerChangesReceiver,
  getTransactionId,
  ifPayloadValid,
  isClientIdValid,
} from '../common.ts';
import {createCustomSynchronizer} from '../index.ts';

const PATH_REGEX = /\/([^?]*)/;
const SERVER_CLIENT_ID = 'S';
const CONTENT_DIFF = 3;
const WRITABLE: ClientAccess = {};

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
  #payloadDecoders = weakMapNew<WebSocket, PayloadDecoder>();
  // When a subclass authorizes clients, the MergeableStore becomes the only
  // peer that its clients synchronize with, so that everything they read and
  // write passes through it.
  #hub: boolean;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    const prototype = WsServerDurableObject.prototype;
    this.#hub =
      this.authorize !== prototype.authorize ||
      this.canWriteCell !== prototype.canWriteCell ||
      this.canWriteValue !== prototype.canWriteValue;
    this.ctx.blockConcurrencyWhile(
      async () =>
        await ifNotUndefined(
          (await this.createPersister()) ??
            (this.#hub
              ? (createCustomPersister(
                  createMergeableStore(),
                  async () => undefined,
                  async () => {},
                  noop,
                  noop,
                  (error) => this.onIgnoredError(error),
                  2, // MergeableStoreOnly
                ) as Persister<Persists.MergeableStoreOnly>)
              : undefined),
          async (persister) => {
            const requestTimeoutSeconds = this.getRequestTimeoutSeconds();
            const store = persister.getStore() as MergeableStore;
            const synchronizer = createCustomSynchronizer(
              store,
              (toClientId, requestId, message, body) =>
                arrayForEach(
                  createPayloads(
                    toClientId,
                    requestId,
                    message,
                    body,
                    this.getFragmentSize(),
                  ),
                  (payload) => this.#handleMessage(SERVER_CLIENT_ID, payload),
                ),
              (receive: Receive) =>
                (this.#serverClientSend = createPayloadReceiver(
                  receive,
                  requestTimeoutSeconds,
                )[0]),
              noop,
              requestTimeoutSeconds,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              this.#hub
                ? createServerChangesReceiver(
                    store,
                    (clientId) =>
                      (this.#getClients(clientId)[0]?.deserializeAttachment() ??
                        undefined) as ClientAccess | undefined,
                    (tableId, rowId, cellId, cell, context) =>
                      this.canWriteCell(
                        this.getPathId(),
                        tableId,
                        rowId,
                        cellId,
                        cell,
                        context,
                      ),
                    (valueId, value, context) =>
                      this.canWriteValue(
                        this.getPathId(),
                        valueId,
                        value,
                        context,
                      ),
                    (fromClientId, changes) =>
                      this.#relayToClients(fromClientId, changes),
                  )
                : undefined,
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

  fetch(request: Request): Response | Promise<Response> {
    const pathId = getPathId(request);
    return ifNotUndefined(
      getClientId(request) ?? undefined,
      (clientId) => {
        // The Id is refused if it is not a usable one, or if it is already
        // taken here: two connections must never share one, since a client's
        // access is found by its Id.
        const accept = (access: ClientAccess | undefined): Response => {
          if (
            isUndefined(access) ||
            !isClientIdValid(clientId) ||
            !isEmpty(this.#getClients(clientId))
          ) {
            const error = errorNew(ERROR_SYNC_UNAUTHORIZED, pathId);
            this.onIgnoredError(error);
            return createResponse(403, null, error.message);
          }
          const [webSocket, client] = objValues(new WebSocketPair());
          if (isEmpty(this.#getClients())) {
            this.onPathId(pathId, 1);
          }
          this.ctx.acceptWebSocket(client, [clientId, pathId]);
          if (this.#hub) {
            client.serializeAttachment(access);
          }
          this.onClientId(pathId, clientId, 1);
          client.send(createHelloPayload());
          return createResponse(101, webSocket);
        };
        if (this.#hub && isClientIdValid(clientId)) {
          return (async () => {
            let access: ClientAccess | undefined;
            await tryCatch(
              async () => (access = await this.authorize(pathId, request)),
              (error) => this.onIgnoredError(error),
            );
            return accept(access);
          })();
        }
        return accept(WRITABLE);
      },
      createUpgradeRequiredResponse,
    ) as Response | Promise<Response>;
  }

  webSocketMessage(client: WebSocket, message: ArrayBuffer | string) {
    ifNotUndefined(this.ctx.getTags(client)[0], (clientId) => {
      let decode = this.#payloadDecoders.get(client);
      if (!decode) {
        decode = createPayloadDecoder(
          (toClientId, remainders) =>
            arrayForEach(remainders, (remainder) =>
              this.#handleMessage(
                clientId,
                createRawPayload(toClientId, remainder),
                client,
              ),
            ),
          this.getRequestTimeoutSeconds(),
          createInvalidPayloadHandler(client, (error) =>
            this.onIgnoredError(error),
          ),
        );
        this.#payloadDecoders.set(client, decode);
      }
      decode[0](message.toString());
    });
  }

  webSocketClose(client: WebSocket) {
    this.#payloadDecoders.get(client)?.[1]();
    this.#payloadDecoders.delete(client);
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
      // Only a message with no client WebSocket behind it is the server's
      // own, whatever Id it claims.
      if (this.#hub && fromClient) {
        if (toClientId == EMPTY_STRING || toClientId == SERVER_CLIENT_ID) {
          this.#serverClientSend?.(forwardedPayload);
        }
      } else if (toClientId == EMPTY_STRING) {
        if (fromClient) {
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

  #relayToClients(fromClientId: Id, changes: MergeableChanges) {
    const payloads = createPayloads(
      SERVER_CLIENT_ID,
      getTransactionId(),
      CONTENT_DIFF,
      changes,
      this.getFragmentSize(),
    );
    arrayForEach(this.#getClients(), (client) =>
      this.ctx.getTags(client)[0] != fromClientId
        ? arrayForEach(payloads, (payload) => client.send(payload))
        : 0,
    );
  }

  // --

  createPersister():
    | Persister<Persists.MergeableStoreOnly>
    | Promise<Persister<Persists.MergeableStoreOnly>>
    | undefined {
    return undefined;
  }

  getPathId(): Id {
    return (
      ifNotUndefined(
        this.#getClients()[0],
        (client) => this.ctx.getTags(client)?.[1] ?? EMPTY_STRING,
      ) ?? EMPTY_STRING
    );
  }

  getClientIds(): Ids {
    return arrayMap(
      this.#getClients(),
      (client) => this.ctx.getTags(client)[0],
    );
  }

  getFragmentSize(): number | undefined {
    return undefined;
  }

  getRequestTimeoutSeconds(): number {
    return 1;
  }

  onIgnoredError(_error: any) {}

  onPathId(_pathId: Id, _addedOrRemoved: IdAddedOrRemoved) {}

  onClientId(_pathId: Id, _clientId: Id, _addedOrRemoved: IdAddedOrRemoved) {}

  onMessage(_fromClientId: Id, _toClientId: Id, _remainder: string) {}

  authorize(
    _pathId: Id,
    _request: Request,
  ): ClientAccess | undefined | Promise<ClientAccess | undefined> {
    return WRITABLE;
  }

  canWriteCell(
    _pathId: Id,
    _tableId: Id,
    _rowId: Id,
    _cellId: Id,
    _cell: CellOrUndefined,
    _context: ClientAccess['context'],
  ): boolean {
    return true;
  }

  canWriteValue(
    _pathId: Id,
    _valueId: Id,
    _value: ValueOrUndefined,
    _context: ClientAccess['context'],
  ): boolean {
    return true;
  }
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
