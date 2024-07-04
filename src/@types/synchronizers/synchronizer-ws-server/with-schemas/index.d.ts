/// synchronizer-ws-server

import type {Id, IdOrNull, Ids} from '../../../common/with-schemas/index.d.ts';
import type {GetIdChanges} from '../../../store/with-schemas/index.d.ts';
import type {WebSocketServer} from 'ws';

/// PathIdsListener
export type PathIdsListener<> = (
  wsServer: WsServer,
  getIdChanges: GetIdChanges<Id>,
) => void;

/// ClientIdsListener
export type ClientIdsListener<> = (
  wsServer: WsServer,
  pathId: Id,
  getIdChanges: GetIdChanges<Id>,
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
  getWebSocketServer: () => WebSocketServer;
  /// WsServer.getPathIds
  getPathIds: () => Ids;
  /// WsServer.getClientIds
  getClientIds: (pathId: Id) => Ids;
  /// WsServer.addPathIdsListener
  addPathIdsListener: (listener: PathIdsListener) => Id;
  /// WsServer.addClientIdsListener
  addClientIdsListener: (pathId: IdOrNull, listener: ClientIdsListener) => Id;
  /// WsServer.delListener
  delListener(listenerId: Id): WsServer;
  /// WsServer.getStats
  getStats: () => WsServerStats;
  /// WsServer.destroy
  destroy: () => void;
}

/// createWsServer
export function createWsServer(webSocketServer: WebSocketServer): WsServer;
