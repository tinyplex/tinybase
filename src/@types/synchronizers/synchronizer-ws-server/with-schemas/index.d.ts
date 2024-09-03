/// synchronizer-ws-server

import type {Id, IdOrNull, Ids} from '../../../common/with-schemas/index.d.ts';
import type {
  IdAddedOrRemoved,
  OptionalSchemas,
} from '../../../store/with-schemas/index.d.ts';
import type {
  Persister,
  Persists,
} from '../../../persisters/with-schemas/index.d.ts';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {WebSocketServer} from 'ws';

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
  destroy(): void;
}

/// createWsServer
export function createWsServer<
  Schemas extends OptionalSchemas,
  PathPersister extends Persister<
    Schemas,
    Persists.MergeableStoreOnly | Persists.StoreOrMergeableStore
  >,
>(
  webSocketServer: WebSocketServer,
  createPersisterForPath?: (
    pathId: Id,
  ) =>
    | PathPersister
    | [PathPersister, (store: MergeableStore<Schemas>) => void]
    | Promise<PathPersister>
    | Promise<[PathPersister, (store: MergeableStore<Schemas>) => void]>
    | undefined,
): WsServer;
