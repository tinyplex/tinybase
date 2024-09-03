/// synchronizer-ws-server

import type {Id, IdOrNull, Ids} from '../../common/index.d.ts';
import type {Persister, Persists} from '../../persisters/index.d.ts';
import type {IdAddedOrRemoved} from '../../store/index.d.ts';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';
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
): WsServer;
