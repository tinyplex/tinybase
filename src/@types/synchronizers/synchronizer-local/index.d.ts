/* eslint-disable @typescript-eslint/no-empty-object-type */
/// synchronizer-local

import type {Receive, Send, Synchronizer} from '../index.d.ts';
import type {MergeableStore} from '../../mergeable-store/index.d.ts';

/// LocalSynchronizer
export interface LocalSynchronizer extends Synchronizer {}

/// createLocalSynchronizer
export function createLocalSynchronizer(
  store: MergeableStore,
  onSend?: Send,
  onReceive?: Receive,
  onIgnoredError?: (error: any) => void,
): LocalSynchronizer;
