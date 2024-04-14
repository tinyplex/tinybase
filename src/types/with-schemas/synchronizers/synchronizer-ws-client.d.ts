/// synchronizer-ws-client

import {MergeableStore} from '../mergeable-store';
import {OptionalSchemas} from '../store';
import {Synchronizer} from '../synchronizers';
import {WebSocket as WsWebSocket} from 'ws';

/// WsSynchronizer
export interface WsSynchronizer<Schemas extends OptionalSchemas>
  extends Synchronizer<Schemas> {}

/// createWsSynchronizer
export function createWsSynchronizer<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  webSocket: WebSocket | WsWebSocket,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): Promise<WsSynchronizer<Schemas>>;
