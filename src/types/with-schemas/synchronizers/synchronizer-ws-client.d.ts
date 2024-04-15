/// synchronizer-ws-client

import {MergeableStore} from '../mergeable-store';
import {OptionalSchemas} from '../store';
import {Synchronizer} from '../synchronizers';
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
