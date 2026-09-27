/// synchronizer-ws-server
import type {IncomingMessage} from 'http';
import type {WebSocketServer} from 'ws';
import type {Id, IdOrNull, Ids} from '../../common/index.d.ts';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Persister, Persists} from '../../persisters/index.d.ts';
import type {
  CellOrUndefined,
  IdAddedOrRemoved,
  ValueOrUndefined,
} from '../../store/index.d.ts';

/// PathIdsListener
export type PathIdsListener = (
  wsServer: WsServer,
  pathId: Id,
  addedOrRemoved: IdAddedOrRemoved,
) => void;

/// ClientIdsListener
export type ClientIdsListener = (
  wsServer: WsServer,
  pathId: Id,
  clientId: Id,
  addedOrRemoved: IdAddedOrRemoved,
) => void;

/// ClientAccess
export type ClientAccess = {
  /// ClientAccess.readOnly
  readonly readOnly?: boolean;
  /// ClientAccess.context
  readonly context?: {[key: string]: any};
};

/// Authorize
export type Authorize = (
  pathId: Id,
  request: IncomingMessage,
) => ClientAccess | undefined | Promise<ClientAccess | undefined>;

/// CanWriteCell
export type CanWriteCell = (
  pathId: Id,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  cell: CellOrUndefined,
  context: {[key: string]: any} | undefined,
) => boolean;

/// CanWriteValue
export type CanWriteValue = (
  pathId: Id,
  valueId: Id,
  value: ValueOrUndefined,
  context: {[key: string]: any} | undefined,
) => boolean;

/// WsServerStats
export type WsServerStats = {
  /// WsServerStats.paths
  paths: number;
  /// WsServerStats.clients
  clients: number;
};

/// WsServer
export interface WsServer {
  /// WsServer.getWebSocketServer
  getWebSocketServer(): WebSocketServer;
  /// WsServer.getPathIds
  getPathIds(): Ids;
  /// WsServer.getClientIds
  getClientIds(pathId: Id): Ids;
  /// WsServer.addPathIdsListener
  addPathIdsListener(listener: PathIdsListener): Id;
  /// WsServer.addClientIdsListener
  addClientIdsListener(pathId: IdOrNull, listener: ClientIdsListener): Id;
  /// WsServer.delListener
  delListener(listenerId: Id): WsServer;
  /// WsServer.getStats
  getStats(): WsServerStats;
  /// WsServer.destroy
  destroy(): Promise<void>;
}

/// WsServerOptions
export type WsServerOptions<
  PathPersister extends Persister<
    Persists.MergeableStoreOnly | Persists.StoreOrMergeableStore
  >,
> = {
  /// WsServerOptions.createPersisterForPath
  readonly createPersisterForPath?: (
    pathId: Id,
  ) =>
    | PathPersister
    | [PathPersister, (store: MergeableStore) => void]
    | Promise<PathPersister>
    | Promise<[PathPersister, (store: MergeableStore) => void]>
    | undefined;
  /// WsServerOptions.authorize
  readonly authorize?: Authorize;
  /// WsServerOptions.canWriteCell
  readonly canWriteCell?: CanWriteCell;
  /// WsServerOptions.canWriteValue
  readonly canWriteValue?: CanWriteValue;
  /// WsServerOptions.onIgnoredError
  readonly onIgnoredError?: (error: any) => void;
  /// WsServerOptions.requestTimeoutSeconds
  readonly requestTimeoutSeconds?: number;
  /// WsServerOptions.fragmentSize
  readonly fragmentSize?: number;
};

/// createWsServer
export function createWsServer<
  PathPersister extends Persister<
    Persists.MergeableStoreOnly | Persists.StoreOrMergeableStore
  >,
>(
  webSocketServer: WebSocketServer,
  createPersisterForPath?: (
    pathId: Id,
  ) =>
    | PathPersister
    | [PathPersister, (store: MergeableStore) => void]
    | Promise<PathPersister>
    | Promise<[PathPersister, (store: MergeableStore) => void]>
    | undefined,
  onIgnoredError?: (error: any) => void,
  requestTimeoutSeconds?: number,
  fragmentSize?: number,
): WsServer;

/// createWsServer.2
export function createWsServer<
  PathPersister extends Persister<
    Persists.MergeableStoreOnly | Persists.StoreOrMergeableStore
  >,
>(
  webSocketServer: WebSocketServer,
  options: WsServerOptions<PathPersister>,
): WsServer;
