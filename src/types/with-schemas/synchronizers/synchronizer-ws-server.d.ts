/// synchronizer-ws-server

import {WebSocketServer} from 'ws';

/// WsServer
export interface WsServer {
  getWebSocketServer: () => WebSocketServer;
  destroy: () => void;
}

/// createWsServer
export function createWsServer(WebSocketServer: WebSocketServer): WsServer;
