/// synchronizer-ws-client
import type {WebSocket as WsWebSocket} from 'ws';
import type {Id} from '../../../common/index.d.ts';
import type {MergeableStore} from '../../../mergeable-store/with-schemas/index.d.ts';
import type {OptionalSchemas} from '../../../store/with-schemas/index.d.ts';
import type {Receive, Send, Synchronizer} from '../../with-schemas/index.d.ts';

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

/// createWsSynchronizer.1
export function createWsSynchronizer<
  Schemas extends OptionalSchemas,
  WebSocketType extends WebSocketTypes,
>(
  store: MergeableStore<Schemas>,
  webSocket: WebSocketType,
  requestTimeoutSeconds?: number,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
  fragmentSize?: number,
): Promise<WsSynchronizer<Schemas, WebSocketType>>;

/// createWsSynchronizer.2
export function createWsSynchronizer<
  Schemas extends OptionalSchemas,
  WebSocketType extends WebSocketTypes,
>(
  store: MergeableStore<Schemas>,
  webSocket: WebSocketType,
  channelId: Id,
  requestTimeoutSeconds?: number,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
  fragmentSize?: number,
): Promise<WsSynchronizer<Schemas, WebSocketType>>;
