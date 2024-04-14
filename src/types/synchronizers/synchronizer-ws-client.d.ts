/// synchronizer-ws-client

import {MergeableStore} from '../mergeable-store';
import {Synchronizer} from '../synchronizers';
import {WebSocket as WsWebSocket} from 'ws';

/// WsSynchronizer
export interface WsSynchronizer extends Synchronizer {}

/// createWsSynchronizer
export function createWsSynchronizer(
  store: MergeableStore,
  webSocket: WebSocket | WsWebSocket,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): Promise<WsSynchronizer>;
