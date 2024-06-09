/// synchronizer-ws-client

import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Synchronizer} from '../index.d.ts';
import type {WebSocket as WsWebSocket} from 'ws';

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
