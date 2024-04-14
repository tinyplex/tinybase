/// synchronizer-ws-client

import {MergeableStore} from '../mergeable-store';
import {OptionalSchemas} from '../store';
import {Synchronizer} from '../synchronizers';
import {WebSocket} from 'ws';

/// WsSynchronizer
export interface WsSynchronizer<Schemas extends OptionalSchemas>
  extends Synchronizer<Schemas> {}

/// createWsSynchronizer
export function createWsSynchronizer<Schemas extends OptionalSchemas>(
  store: MergeableStore<Schemas>,
  webSocket: WebSocket,
  requestTimeoutSeconds?: number,
  onIgnoredError?: (error: any) => void,
): Promise<WsSynchronizer<Schemas>>;
