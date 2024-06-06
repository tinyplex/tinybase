/// synchronizer-ws-client

import type {MergeableStore} from '../../../mergeable-store/with-schemas';
import type {OptionalSchemas} from '../../../store/with-schemas';
import type {Synchronizer} from '../../with-schemas';
import type {WebSocket as WsWebSocket} from 'ws';

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
