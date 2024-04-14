/// synchronizer-ws-client

import {MergeableStore} from '../mergeable-store';
import {Synchronizer} from '../synchronizers';
import {WebSocket} from 'ws';

/// WsSynchronizer
export interface WsSynchronizer extends Synchronizer {}

/// createWsSynchronizer
export function createWsSynchronizer(
  store: MergeableStore,
  webSocket: WebSocket,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): Promise<WsSynchronizer>;
