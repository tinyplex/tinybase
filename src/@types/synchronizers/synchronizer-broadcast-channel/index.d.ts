/// synchronizer-broadcast-channel

import type {MergeableStore} from '../../mergeable-store/index.d.ts';
import type {Synchronizer} from '../index.d.ts';

/// BroadcastChannelSynchronizer
export interface BroadcastChannelSynchronizer extends Synchronizer {
  /// BroadcastChannelSynchronizer.getChannelName
  getChannelName(): string;
}

/// createBroadcastChannelSynchronizer
export function createBroadcastChannelSynchronizer(
  store: MergeableStore,
  channelName: string,
  onIgnoredError?: (error: any) => void,
): BroadcastChannelSynchronizer;
