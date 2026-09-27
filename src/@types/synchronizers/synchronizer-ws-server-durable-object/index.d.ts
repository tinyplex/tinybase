/// synchronizer-ws-server-durable-object
import {DurableObject} from 'cloudflare:workers';
import type {Id, IdAddedOrRemoved, Ids} from '../../index.d.ts';
import type {Persister, Persists} from '../../persisters/index.d.ts';
import type {CellOrUndefined, ValueOrUndefined} from '../../store/index.d.ts';
import type {ClientAccess} from '../synchronizer-ws-server/index.d.ts';

/// WsServerDurableObject
export class WsServerDurableObject<Env = unknown> extends DurableObject<Env> {
  /// WsServerDurableObject.constructor
  constructor(ctx: DurableObjectState, env: Env);

  /// WsServerDurableObject.createPersister
  createPersister():
    | Persister<Persists.MergeableStoreOnly>
    | Promise<Persister<Persists.MergeableStoreOnly>>
    | undefined;

  /// WsServerDurableObject.getPathId
  getPathId(): Id;

  /// WsServerDurableObject.getClientIds
  getClientIds(): Ids;

  /// WsServerDurableObject.getFragmentSize
  getFragmentSize(): number | undefined;

  /// WsServerDurableObject.getRequestTimeoutSeconds
  getRequestTimeoutSeconds(): number;

  /// WsServerDurableObject.onIgnoredError
  onIgnoredError(error: any): void;

  /// WsServerDurableObject.onPathId
  onPathId(pathId: Id, addedOrRemoved: IdAddedOrRemoved): void;

  /// WsServerDurableObject.onClientId
  onClientId(pathId: Id, clientId: Id, addedOrRemoved: IdAddedOrRemoved): void;

  /// WsServerDurableObject.onMessage
  onMessage(fromClientId: Id, toClientId: Id, remainder: string): void;

  /// WsServerDurableObject.authorize
  authorize(
    pathId: Id,
    request: Request,
  ): ClientAccess | undefined | Promise<ClientAccess | undefined>;

  /// WsServerDurableObject.canWriteCell
  canWriteCell(
    pathId: Id,
    tableId: Id,
    rowId: Id,
    cellId: Id,
    cell: CellOrUndefined,
    context: {[key: string]: any} | undefined,
  ): boolean;

  /// WsServerDurableObject.canWriteValue
  canWriteValue(
    pathId: Id,
    valueId: Id,
    value: ValueOrUndefined,
    context: {[key: string]: any} | undefined,
  ): boolean;
}

/// getWsServerDurableObjectFetch
export function getWsServerDurableObjectFetch<Namespace extends string>(
  namespace: Namespace,
): (
  request: Request,
  env: {
    [namespace in Namespace]: DurableObjectNamespace<WsServerDurableObject>;
  },
) => Response | Promise<Response>;
