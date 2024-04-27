/// synchronizer-ws-client

import {MergeableStore} from '../mergeable-store.d';
import {OptionalSchemas} from '../store.d';
import {Synchronizer} from '../synchronizers.d';
import {WebSocket as WsWebSocket} from 'ws';

export type WebSocketTypes = WebSocket | WsWebSocket;

/// WsSynchronizer
export interface WsSynchronizer<
  Schemas extends OptionalSchemas,
  WebSocketType extends WebSocketTypes,
> extends Synchronizer<Schemas> {
  getWebSocket(): WebSocketType;
}

/// createWsSynchronizer
export function createWsSynchronizer<
  Schemas extends OptionalSchemas,
  WebSocketType extends WebSocketTypes,
>(
  store: MergeableStore<Schemas>,
  webSocket: WebSocketType,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): Promise<WsSynchronizer<Schemas, WebSocketType>>;
