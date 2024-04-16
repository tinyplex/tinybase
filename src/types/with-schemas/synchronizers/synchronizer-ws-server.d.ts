/// synchronizer-ws-server

import {Ids} from '../common';
import {WebSocketServer} from 'ws';

/// WsServerStats
export type WsServerStats = {
  paths?: number;
  clients?: number;
};

/// WsServer
export interface WsServer {
  getWebSocketServer: () => WebSocketServer;
  getPaths: () => string[];
  getClientIds: (path: string) => Ids;
  getStats: () => WsServerStats;
  destroy: () => void;
}

/// createWsServer
export function createWsServer(WebSocketServer: WebSocketServer): WsServer;
