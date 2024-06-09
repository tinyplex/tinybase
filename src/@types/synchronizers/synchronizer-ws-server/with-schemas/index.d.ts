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
  paths?: number;
  clients?: number;
};

/// WsServer
export interface WsServer {
  getWebSocketServer: () => WebSocketServer;
  getPathIds: () => Ids;
  getClientIds: (pathId: Id) => Ids;
  addPathIdsListener: (listener: PathIdsListener) => Id;
  addClientIdsListener: (pathId: IdOrNull, listener: ClientIdsListener) => Id;
  delListener(listenerId: Id): WsServer;
  getStats: () => WsServerStats;
  destroy: () => void;
}

/// createWsServer
export function createWsServer(WebSocketServer: WebSocketServer): WsServer;
