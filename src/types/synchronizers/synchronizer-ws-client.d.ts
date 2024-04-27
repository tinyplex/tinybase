/// synchronizer-ws-client

import {MergeableStore} from '../mergeable-store.d';
import {Synchronizer} from '../synchronizers.d';
import {WebSocket as WsWebSocket} from 'ws';

export type WebSocketTypes = WebSocket | WsWebSocket;

/// WsSynchronizer
export interface WsSynchronizer<WebSocketType extends WebSocketTypes>
  extends Synchronizer {
  getWebSocket(): WebSocketType;
}

/// createWsSynchronizer
export function createWsSynchronizer<WebSocketType extends WebSocketTypes>(
  store: MergeableStore,
  webSocket: WebSocketType,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): Promise<WsSynchronizer<WebSocketType>>;
