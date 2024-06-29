/// synchronizer-ws-client

import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {OptionalSchemas} from '../../../store/with-schemas/index.d.ts';
import type {Synchronizer} from '../../with-schemas/index.d.ts';
import type {WebSocket as WsWebSocket} from 'ws';

/// WebSocketTypes
export type WebSocketTypes = WebSocket | WsWebSocket;

/// WsSynchronizer
export interface WsSynchronizer<
  Schemas extends OptionalSchemas,
  WebSocketType extends WebSocketTypes,
> extends Synchronizer<Schemas> {
  /// WsSynchronizer.getWebSocket
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
