/// synchronizer-ws-server-simple
import type {WebSocketServer} from 'ws';

/// WsServerSimple
export interface WsServerSimple {
  /// WsServerSimple.getWebSocketServer
  getWebSocketServer(): WebSocketServer;
  /// WsServerSimple.destroy
  destroy(): Promise<void>;
}

/// createWsServerSimple
export function createWsServerSimple(
  webSocketServer: WebSocketServer,
): WsServerSimple;
